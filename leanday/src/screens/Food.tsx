import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { applyClarifyingOption, type RecognitionDraft } from '../lib/recognize'
import type { FoodItem } from '../lib/types'
import { useApp } from '../state/AppState'

export function FoodScreen() {
  const {
    day,
    analyzePhoto,
    confirmFood,
    addManualFood,
    reeatFood,
    removeFood,
    remaining,
    recentFoods,
  } = useApp()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [draft, setDraft] = useState<RecognitionDraft | null>(null)
  const [saved, setSaved] = useState<FoodItem | null>(null)
  const [manualName, setManualName] = useState('')
  const [manualKcal, setManualKcal] = useState('300')
  const [error, setError] = useState('')

  const onPick = async (file: File) => {
    setError('')
    setSaved(null)
    setBusy(true)
    try {
      const dataUrl = await readFile(file)
      const next = await analyzePhoto(dataUrl)
      setDraft(next)
    } catch {
      setError('识别失败，请重试或改用手动 / 再吃一次')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen">
      <div className="brand-mark">饮食记录</div>
      <p className="sub">
        拍照识别菜名与分量区间，确认后再记账。今日饮食预算还剩约 {Math.max(0, remaining)} kcal（估算）。
      </p>

      {recentFoods.length > 0 && !draft && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="eyebrow">再吃一次</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {recentFoods.slice(0, 6).map((f) => (
              <button
                key={f.id}
                type="button"
                className="option-chip"
                onClick={() => {
                  reeatFood(f)
                  setSaved(f)
                }}
              >
                {f.name}
                <span className="hint"> · {f.kcal}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="panel" style={{ marginTop: 14, textAlign: 'center', padding: 22 }}>
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
          当前为结构化演示识别（中餐白名单 + 热量库）。下一步接服务端多模态模型。
        </p>
        {error && (
          <p style={{ color: 'var(--coral)', marginTop: 8, fontWeight: 600 }}>{error}</p>
        )}
      </div>

      <AnimatePresence>
        {draft && (
          <motion.div
            className="panel"
            style={{ marginTop: 14 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="eyebrow">确认后再记账</div>
            {draft.imageDataUrl && (
              <img
                src={draft.imageDataUrl}
                alt=""
                style={{
                  width: '100%',
                  maxHeight: 180,
                  objectFit: 'cover',
                  borderRadius: 16,
                  marginTop: 10,
                }}
              />
            )}
            <h2 style={{ marginTop: 12, fontSize: '1.25rem' }}>{draft.displayName}</h2>
            <p className="stat-num" style={{ fontSize: '1.5rem', marginTop: 6 }}>
              估算 {draft.kcalMin}–{draft.kcalMax} kcal
            </p>
            <p className="hint" style={{ marginTop: 4 }}>
              置信度 {Math.round(draft.confidence * 100)}% · 记账将使用区间中值 {draft.kcalMid} kcal
            </p>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 700 }}>{draft.question.prompt}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                {draft.question.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`option-chip block ${draft.selectedOptionId === opt.id ? 'selected' : ''}`}
                    onClick={() => setDraft(applyClarifyingOption(draft, opt.id))}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setDraft(null)}>
                取消
              </button>
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => {
                  const food = confirmFood(draft)
                  setSaved(food)
                  setDraft(null)
                }}
              >
                确认记入今日
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {saved && !draft && (
        <div className="panel" style={{ marginTop: 14 }}>
          <div className="eyebrow">已记入</div>
          <p style={{ fontWeight: 700, marginTop: 8 }}>
            {saved.name} · {saved.kcal} kcal
            {saved.kcalMin != null && saved.kcalMax != null && (
              <span className="hint">（区间 {saved.kcalMin}–{saved.kcalMax}）</span>
            )}
          </p>
        </div>
      )}

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
          {day.foods.length === 0 && <p className="hint">还没有记录，先拍一顿或点「再吃一次」。</p>}
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
