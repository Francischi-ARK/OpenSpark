import { motion } from 'framer-motion'
import { ProgressRing } from '../components/ProgressRing'
import { EXERCISE_CREDIT_RATIO } from '../lib/calories'
import { useApp } from '../state/AppState'

export function TodayScreen() {
  const {
    profile,
    plan,
    burned,
    exerciseCredit,
    waterMl,
    remaining,
    weekly,
    day,
    tonight,
    recentFoods,
    addWater,
    addExercise,
    reeatFood,
    setTab,
  } = useApp()

  if (!profile || !plan || !weekly || !tonight) return null

  const waterPct = Math.min(100, Math.round((waterMl / plan.waterMl) * 100))
  const over = remaining < 0

  return (
    <div className="screen">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="brand-mark">日减</div>
          <p className="sub" style={{ marginTop: 6 }}>
            你好，{profile.name} · 帮你决定下一顿
          </p>
        </div>
        <span className="chip">估算</span>
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
          label={over ? '今日已超出' : '饮食预算还剩'}
          sublabel={`固定预算 ${plan.calorieBudget} kcal · 估算`}
          accent={over ? '#c2784a' : '#0f766e'}
        />
      </motion.div>

      <div className="panel" style={{ marginTop: 8, boxShadow: 'none' }}>
        {weekly.todayDelta > 0 ? (
          <p style={{ fontWeight: 600 }}>
            今天比计划多吃约 {Math.round(weekly.todayDelta)} kcal，本周还剩{' '}
            {Math.max(0, Math.round(weekly.remaining))} kcal。不影响整体进度，恢复正常计划即可。
          </p>
        ) : (
          <p style={{ fontWeight: 600 }}>
            本周预算还剩 {Math.max(0, Math.round(weekly.remaining))} kcal（共 {weekly.budget}）。
            用周视角看，比每天审判自己更稳。
          </p>
        )}
        <p className="hint" style={{ marginTop: 6 }}>
          运动已记录 {burned} kcal，仅折算 {Math.round(EXERCISE_CREDIT_RATIO * 100)}%（+{exerciseCredit}）计入可吃热量，避免与 TDEE 重复计算。
        </p>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="eyebrow">今晚还能怎么吃</div>
        <h2 style={{ marginTop: 8, fontSize: '1.2rem' }}>{tonight.title}</h2>
        <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: 'var(--ink-soft)' }}>
          {tonight.dinnerIdeas.map((t) => (
            <li key={t} style={{ marginBottom: 6 }}>
              {t}
            </li>
          ))}
        </ul>
        <div className="hint" style={{ marginTop: 8 }}>
          外卖参考：{tonight.takeoutIdeas.join('；')}
        </div>
        <button
          type="button"
          className="btn btn-primary btn-block"
          style={{ marginTop: 14 }}
          onClick={() => setTab('food')}
        >
          拍这一顿 / 快速记账
        </button>
      </div>

      {recentFoods.length > 0 && (
        <div className="panel" style={{ marginTop: 14 }}>
          <div className="row">
            <div className="eyebrow">最近吃过 · 再吃一次</div>
            <button type="button" className="hint" onClick={() => setTab('food')}>
              更多
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {recentFoods.slice(0, 4).map((f) => (
              <button key={f.id} type="button" className="option-chip" onClick={() => reeatFood(f)}>
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

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
        <div className="eyebrow">运动（展示为主）</div>
        <p style={{ marginTop: 6, fontWeight: 600 }}>建议快走约 {plan.suggestedWalkMin} 分钟</p>
        <p className="hint" style={{ marginTop: 4 }}>
          运动先记录与展示；额外消耗只部分折算进饮食预算。
        </p>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ padding: '10px 14px', marginTop: 10 }}
          onClick={() => addExercise('快走', plan.suggestedWalkMin, plan.suggestedWalkMin * 5)}
        >
          记一次快走
        </button>
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
                  <div className="hint">
                    {f.portion}
                    {f.kcalMin != null && f.kcalMax != null
                      ? ` · ${f.kcalMin}–${f.kcalMax}`
                      : ''}
                  </div>
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
