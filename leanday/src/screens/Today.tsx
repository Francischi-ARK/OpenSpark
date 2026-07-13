import { motion } from 'framer-motion'
import { ProgressRing } from '../components/ProgressRing'
import { useApp } from '../state/AppState'

export function TodayScreen() {
  const {
    profile,
    plan,
    eaten,
    burned,
    waterMl,
    remaining,
    day,
    addWater,
    addExercise,
    setTab,
  } = useApp()

  if (!profile || !plan) return null

  const waterPct = Math.min(100, Math.round((waterMl / plan.waterMl) * 100))
  const over = remaining < 0

  return (
    <div className="screen">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="brand-mark">日减</div>
          <p className="sub" style={{ marginTop: 6 }}>
            你好，{profile.name} · 目标 {profile.targetWeightKg} kg
          </p>
        </div>
        <span className="chip">今日</span>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        style={{ marginTop: 22 }}
      >
        <ProgressRing
          value={Math.abs(remaining)}
          max={plan.calorieBudget}
          label={over ? '已超预算' : '还能吃'}
          sublabel={`预算 ${plan.calorieBudget} kcal`}
          accent={over ? '#e35d4a' : '#0f766e'}
        />
      </motion.div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          marginTop: 8,
        }}
      >
        {[
          { k: '已摄入', v: eaten },
          { k: '已消耗', v: burned },
          { k: '缺口', v: plan.dailyDeficit },
        ].map((s) => (
          <div key={s.k} className="panel" style={{ padding: 12, boxShadow: 'none' }}>
            <div className="hint">{s.k}</div>
            <div className="stat-num" style={{ fontSize: '1.25rem', marginTop: 4 }}>
              {s.v}
            </div>
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="row">
          <div>
            <div className="eyebrow">饮水</div>
            <div className="stat-num" style={{ fontSize: '1.35rem' }}>
              {waterMl}
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>
                {' '}
                / {plan.waterMl} ml
              </span>
            </div>
          </div>
          <div className="hint">{waterPct}%</div>
        </div>
        <div className="progress-track" style={{ marginTop: 10 }}>
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${waterPct}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <div className="quick-grid" style={{ marginTop: 12 }}>
          {[200, 300, 500].map((ml) => (
            <button key={ml} type="button" className="quick-btn" onClick={() => addWater(ml)}>
              +{ml}ml
            </button>
          ))}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="row">
          <div>
            <div className="eyebrow">运动建议</div>
            <p style={{ marginTop: 6, fontWeight: 600 }}>
              快走约 {plan.suggestedWalkMin} 分钟
            </p>
            <p className="hint" style={{ marginTop: 4 }}>
              或记录一次真实运动，自动抵扣今日热量
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: '10px 14px' }}
            onClick={() => addExercise('快走', plan.suggestedWalkMin, plan.suggestedWalkMin * 5)}
          >
            记一次快走
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '10px 14px' }}
            onClick={() => setTab('food')}
          >
            拍食物记账
          </button>
        </div>
      </div>

      <div className="healthkit-banner" style={{ marginTop: 14 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--teal)',
            flexShrink: 0,
          }}
          aria-hidden
        />
        <div>
          <strong>Apple Watch / HealthKit</strong>
          <p className="hint" style={{ marginTop: 4 }}>
            下一阶段接入：自动同步运动消耗、心率与步数。当前可先手动记运动。
          </p>
        </div>
      </div>

      {day.foods.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div className="eyebrow">今日饮食</div>
          <div className="list" style={{ marginTop: 10 }}>
            {day.foods.slice(-3).map((f) => (
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
                <div style={{ fontWeight: 800 }}>{f.kcal}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
