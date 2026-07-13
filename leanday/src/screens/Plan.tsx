import { ACTIVITY_LABELS, EXERCISE_CREDIT_RATIO } from '../lib/calories'
import { useApp } from '../state/AppState'

export function PlanScreen() {
  const { profile, plan } = useApp()
  if (!profile || !plan) return null

  const kgToLose = Math.max(0, profile.weightKg - profile.targetWeightKg)

  return (
    <div className="screen">
      <div className="brand-mark">减脂方案</div>
      <p className="sub">
        初始方案来自公式；连续记录体重趋势后，再按身体反馈微调。所有数字均为估算。
      </p>

      <div
        className="panel"
        style={{
          marginTop: 18,
          background: 'linear-gradient(155deg, #0f766e 0%, #115e59 55%, #134e4a 100%)',
          color: 'white',
          border: 'none',
        }}
      >
        <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>
          每日饮食预算（固定）
        </div>
        <div className="stat-num" style={{ color: 'white', fontSize: '2.6rem', marginTop: 6 }}>
          {plan.calorieBudget}
          <span style={{ fontSize: 16, fontWeight: 600, opacity: 0.8 }}> kcal</span>
        </div>
        <p style={{ marginTop: 8, opacity: 0.85 }}>
          TDEE {plan.tdee} − 缺口 {plan.dailyDeficit} · 周预算 {plan.weeklyBudget} kcal
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginTop: 12,
        }}
      >
        {[
          { t: '基础代谢 BMR', v: `${plan.bmr} kcal` },
          { t: '估算总消耗', v: `${plan.tdee} kcal` },
          { t: '蛋白质目标', v: `${plan.proteinG} g` },
          { t: '饮水目标', v: `${plan.waterMl} ml` },
          { t: '建议有氧', v: `${plan.suggestedWalkMin} 分钟` },
          { t: '预计周期', v: plan.weeksToGoal ? `${plan.weeksToGoal} 周` : '已达标' },
        ].map((x) => (
          <div key={x.t} className="panel" style={{ boxShadow: 'none' }}>
            <div className="hint">{x.t}</div>
            <div style={{ fontWeight: 800, marginTop: 6, fontSize: '1.05rem' }}>{x.v}</div>
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="eyebrow">运动怎么算</div>
        <p className="sub" style={{ marginTop: 8, fontSize: 0.95 }}>
          饮食预算保持固定。运动热量先展示；额外消耗仅按 {Math.round(EXERCISE_CREDIT_RATIO * 100)}%
          折算进「还能吃多少」，避免与活动系数重复计算。后续再升级为更动态的模型。
        </p>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="eyebrow">你的档案</div>
        <ul style={{ margin: '12px 0 0', paddingLeft: 18, color: 'var(--ink-soft)' }}>
          <li>
            {profile.sex === 'female' ? '女' : '男'} · {profile.age} 岁 · {profile.heightCm} cm
          </li>
          <li>
            当前 {profile.weightKg} kg → 目标 {profile.targetWeightKg} kg（需减 {kgToLose.toFixed(1)} kg）
          </li>
          <li>
            活动水平：{ACTIVITY_LABELS[profile.activity]} · 每周 {profile.weeklyLossKg} kg
          </li>
        </ul>
      </div>

      {plan.warnings.slice(0, 3).map((w) => (
        <p key={w} className="hint" style={{ marginTop: 10 }}>
          {w}
        </p>
      ))}
    </div>
  )
}
