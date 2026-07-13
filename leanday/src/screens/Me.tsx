import { useMemo, useState } from 'react'
import { useApp } from '../state/AppState'
import { WeightTrend } from '../components/WeightTrend'

export function MeScreen() {
  const { profile, weights, addWeight, day, resetDemo, plan, burned, exerciseCredit } = useApp()
  const [kg, setKg] = useState(String(profile?.weightKg ?? ''))

  const latest = weights[0]
  const disclaimer = useMemo(
    () => '日减提供生活方式估算，不构成医疗建议。特殊体质请咨询专业人士。',
    [],
  )

  if (!profile || !plan) return null

  return (
    <div className="screen">
      <div className="brand-mark">我的</div>
      <p className="sub">{profile.name} 的减脂日记 · 看趋势，不看单日</p>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="row">
          <div>
            <div className="eyebrow">当前体重</div>
            <div className="stat-num">{latest?.kg ?? profile.weightKg} kg</div>
          </div>
          <div className="hint">目标 {profile.targetWeightKg} kg</div>
        </div>
        <div style={{ marginTop: 14 }}>
          <WeightTrend weights={weights} />
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
        <div className="eyebrow">今日运动</div>
        <div className="list" style={{ marginTop: 10 }}>
          {day.exercises.length === 0 && <p className="hint">还没有运动记录</p>}
          {day.exercises.map((e) => (
            <div key={e.id} className="row" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
              <div>
                <strong>{e.name}</strong>
                <div className="hint">{e.minutes} 分钟 · 展示 {e.kcal} kcal</div>
              </div>
              <strong>{e.kcal}</strong>
            </div>
          ))}
        </div>
        {burned > 0 && (
          <p className="hint" style={{ marginTop: 8 }}>
            合计 {burned} kcal，饮食预算仅折算 +{exerciseCredit} kcal。
          </p>
        )}
      </div>

      <div className="healthkit-banner" style={{ marginTop: 14 }}>
        <div>
          <strong>路线图：先验证识图闭环，再接 HealthKit</strong>
          <p className="hint" style={{ marginTop: 6 }}>
            当前优先：真实识别 + 分量纠正 +「今晚怎么吃」。iOS / HealthKit 放在闭环跑通之后。
          </p>
        </div>
      </div>

      <p className="hint" style={{ marginTop: 16 }}>
        {disclaimer}
      </p>

      <button
        type="button"
        className="btn btn-ghost btn-block"
        style={{ marginTop: 12 }}
        onClick={() => {
          if (confirm('清除本地演示数据并重新开始？')) resetDemo()
        }}
      >
        重置演示数据
      </button>
    </div>
  )
}
