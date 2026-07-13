import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState } from 'react'
import type { FoodItem } from '../lib/types'
import { useApp } from '../state/AppState'

export function FoodScreen() {
  const { day, addFoodFromPhoto, addManualFood, updateFood, removeFood, remaining } = useApp()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [last, setLast] = useState<FoodItem | null>(null)
  const [manualName, setManualName] = useState('')
  const [manualKcal, setManualKcal] = useState('300')
  const [error, setError] = useState('')

  const onPick = async (file: File) => {
    setError('')
    setBusy(true)
    try {
      const dataUrl = await readFile(file)
      const food = await addFoodFromPhoto(dataUrl)
      setLast(food)
    } catch {
      setError('识别失败，请重试或改用手动记录')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen">
      <div className="brand-mark">饮食记录</div>
      <p className="sub">拍一张餐盘照片，我会估算热量（可改分量）。今日还可吃约 {Math.max(0, remaining)} kcal。</p>

      <div className="panel" style={{ marginTop: 18, textAlign: 'center', padding: 22 }}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void onPick(f)
            e.target.value = ''
          }}
        />
        <motion.button
          type="button"
          className="btn btn-primary btn-block"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          whileTap={{ scale: 0.98 }}
        >
          {busy ? '识别中…' : '拍照 / 选图识别'}
        </motion.button>
        <p className="hint" style={{ marginTop: 10 }}>
          演示版使用模拟识别；正式版接视觉模型 + 中餐库
        </p>
        {error && (
          <p style={{ color: 'var(--coral)', marginTop: 8, fontWeight: 600 }}>{error}</p>
        )}
      </div>

      <AnimatePresence>
        {last && (
          <motion.div
            className="panel"
            style={{ marginTop: 14 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="eyebrow">刚识别到</div>
            <div className="food-row" style={{ marginTop: 10, border: 'none', background: 'transparent', padding: 0 }}>
              {last.imageDataUrl ? (
                <img className="food-thumb" src={last.imageDataUrl} alt="" />
              ) : (
                <div className="food-thumb" />
              )}
              <div>
                <div style={{ fontWeight: 800 }}>{last.name}</div>
                <div className="hint">
                  置信度 {Math.round(last.confidence * 100)}% · {last.portion}
                </div>
              </div>
              <div className="stat-num" style={{ fontSize: '1.2rem' }}>
                {last.kcal}
              </div>
            </div>
            <div className="field" style={{ marginTop: 12 }}>
              <label>调整热量 (kcal)</label>
              <input
                type="number"
                value={last.kcal}
                onChange={(e) => {
                  const kcal = Number(e.target.value) || 0
                  const next = { ...last, kcal }
                  setLast(next)
                  updateFood(next)
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="eyebrow">手动补记</div>
        <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
          <div className="field">
            <label>食物名</label>
            <input value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder="例如：拿铁" />
          </div>
          <div className="field">
            <label>热量</label>
            <input type="number" value={manualKcal} onChange={(e) => setManualKcal(e.target.value)} />
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={() => {
              if (!manualName.trim()) return
              addManualFood(manualName.trim(), Number(manualKcal) || 0)
              setManualName('')
            }}
          >
            添加
          </button>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <div className="row">
          <div className="eyebrow">今日清单</div>
          <div className="hint">{day.foods.length} 项</div>
        </div>
        <div className="list" style={{ marginTop: 10 }}>
          {day.foods.length === 0 && <p className="hint">还没有记录，先拍一顿饭试试。</p>}
          {day.foods.map((f) => (
            <div key={f.id} className="food-row">
              {f.imageDataUrl ? (
                <img className="food-thumb" src={f.imageDataUrl} alt="" />
              ) : (
                <div className="food-thumb" />
              )}
              <div>
                <div style={{ fontWeight: 700 }}>{f.name}</div>
                <div className="hint">{f.portion}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800 }}>{f.kcal}</div>
                <button
                  type="button"
                  className="hint"
                  style={{ marginTop: 4, color: 'var(--coral)' }}
                  onClick={() => removeFood(f.id)}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
