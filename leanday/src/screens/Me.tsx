import { useState } from 'react'
import { useApp } from '../state/AppState'

export function MeScreen() {
  const { profile, weights, addWeight, day, resetDemo, plan } = useApp()
  const [kg, setKg] = useState(String(profile?.weightKg ?? ''))

  if (!profile || !plan) return null

  const latest = weights[0]

  return (
    <div className="screen">
      <div className="brand-mark">我的</div>
      <p className="sub">{profile.name} 的减脂日记 · OpenSpark / LeanDay MVP</p>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="row">
          <div>
            <div className="eyebrow">当前体重</div>
            <div className="stat-num">{latest?.kg ?? profile.weightKg} kg</div>
          </div>
          <div className="hint">目标 {profile.targetWeightKg} kg</div>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label>记录今日体重</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="number"
              step="0.1"
              value={kg}
              onChange={(e) => setKg(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '12px 16px' }}
              onClick={() => {
                const n = Number(kg)
                if (!n) return
                addWeight(n)
              }}
            >
              保存
            </button>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="eyebrow">体重趋势</div>
        <div className="list" style={{ marginTop: 10 }}>
          {weights.length === 0 && <p className="hint">暂无记录</p>}
          {weights.slice(0, 8).map((w) => (
            <div key={w.id} className="row" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
              <span className="hint">{new Date(w.loggedAt).toLocaleString()}</span>
              <strong>{w.kg} kg</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="eyebrow">今日运动</div>
        <div className="list" style={{ marginTop: 10 }}>
          {day.exercises.length === 0 && <p className="hint">还没有运动记录</p>}
          {day.exercises.map((e) => (
            <div key={e.id} className="row" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
              <div>
                <strong>{e.name}</strong>
                <div className="hint">
                  {e.minutes} 分钟 · {e.source === 'healthkit' ? 'HealthKit' : '手动'}
                </div>
              </div>
              <strong>{e.kcal} kcal</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="healthkit-banner" style={{ marginTop: 14 }}>
        <div>
          <strong>下一步：原生 iOS + HealthKit</strong>
          <p className="hint" style={{ marginTop: 6 }}>
            读：活动能量、训练、步数、心率；写：饮水、体重、饮食热量。Apple Watch 数据经「健康」App
            同步，无需先做独立 Watch App。
          </p>
        </div>
      </div>

      <button
        type="button"
        className="btn btn-ghost btn-block"
        style={{ marginTop: 18 }}
        onClick={() => {
          if (confirm('清除本地演示数据并重新开始？')) resetDemo()
        }}
      >
        重置演示数据
      </button>
    </div>
  )
}
