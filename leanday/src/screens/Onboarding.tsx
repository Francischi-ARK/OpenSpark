import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import {
  ACTIVITY_LABELS,
  buildPlan,
  validateProfile,
  type ActivityLevel,
  type Sex,
  type UserProfile,
} from '../lib/calories'

const defaultDraft: UserProfile = {
  name: '',
  sex: 'female',
  age: 28,
  heightCm: 165,
  weightKg: 62,
  targetWeightKg: 55,
  activity: 'light',
  weeklyLossKg: 0.5,
}

export function Onboarding({ onDone }: { onDone: (p: UserProfile) => void }) {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<UserProfile>(defaultDraft)
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false)
  const preview = useMemo(() => buildPlan(draft), [draft])
  const validation = useMemo(() => validateProfile(draft), [draft])

  const set = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  return (
    <div className="screen" style={{ paddingTop: 36 }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="brand-mark">日减</div>
        <p className="eyebrow" style={{ marginTop: 18 }}>
          LeanDay
        </p>
        <h1 className="headline">拍一拍，算清楚今天还能吃多少——并告诉你下一顿怎么吃。</h1>
        <p className="sub">先建立档案。所有热量与周期均为估算，仅供生活方式参考。</p>
      </motion.div>

      <motion.div
        className="panel"
        style={{ marginTop: 28 }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.5 }}
      >
        {step === 0 && (
          <div style={{ display: 'grid', gap: 14 }}>
            <div className="field">
              <label>怎么称呼你</label>
              <input
                value={draft.name}
                placeholder="例如：阿Chi"
                onChange={(e) => set('name', e.target.value)}
              />
            </div>
            <div className="field">
              <label>性别</label>
              <div className="seg">
                {(['female', 'male'] as Sex[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={draft.sex === s ? 'active' : ''}
                    onClick={() => set('sex', s)}
                  >
                    {s === 'female' ? '女' : '男'}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>年龄（需 ≥ 18）</label>
              <input
                type="number"
                value={draft.age}
                onChange={(e) => set('age', Number(e.target.value) || 0)}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'grid', gap: 14 }}>
            <div className="field">
              <label>身高 (cm)</label>
              <input
                type="number"
                value={draft.heightCm}
                onChange={(e) => set('heightCm', Number(e.target.value) || 0)}
              />
            </div>
            <div className="field">
              <label>当前体重 (kg)</label>
              <input
                type="number"
                step="0.1"
                value={draft.weightKg}
                onChange={(e) => set('weightKg', Number(e.target.value) || 0)}
              />
            </div>
            <div className="field">
              <label>目标体重 (kg)</label>
              <input
                type="number"
                step="0.1"
                value={draft.targetWeightKg}
                onChange={(e) => set('targetWeightKg', Number(e.target.value) || 0)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'grid', gap: 14 }}>
            <div className="field">
              <label>日常活动量</label>
              <select
                value={draft.activity}
                onChange={(e) => set('activity', e.target.value as ActivityLevel)}
              >
                {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((k) => (
                  <option key={k} value={k}>
                    {ACTIVITY_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>每周希望减重 (kg)</label>
              <select
                value={draft.weeklyLossKg}
                onChange={(e) => set('weeklyLossKg', Number(e.target.value))}
              >
                <option value={0.25}>0.25 — 很稳</option>
                <option value={0.5}>0.5 — 推荐</option>
                <option value={0.75}>0.75 — 稍快</option>
              </select>
            </div>

            <div
              style={{
                marginTop: 4,
                padding: 14,
                borderRadius: 16,
                background: 'linear-gradient(160deg, #0f766e, #134e4a)',
                color: 'white',
              }}
            >
              <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>
                初步方案（估算）
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <div>
                  <div style={{ opacity: 0.75, fontSize: 12 }}>每日饮食预算</div>
                  <div className="stat-num" style={{ color: 'white', fontSize: '1.5rem' }}>
                    {preview.calorieBudget}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>kcal（固定，不完全加回运动）</div>
                </div>
                <div>
                  <div style={{ opacity: 0.75, fontSize: 12 }}>预计达成</div>
                  <div className="stat-num" style={{ color: 'white', fontSize: '1.5rem' }}>
                    {preview.weeksToGoal || '—'}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>周</div>
                </div>
              </div>
              <p style={{ marginTop: 12, fontSize: 13, opacity: 0.85 }}>
                饮水 {preview.waterMl} ml · 蛋白质 {preview.proteinG} g · 建议步行{' '}
                {preview.suggestedWalkMin} 分钟
              </p>
            </div>

            {validation.errors.map((e) => (
              <p key={e} style={{ color: 'var(--coral)', fontWeight: 600, fontSize: 13 }}>
                {e}
              </p>
            ))}
            {validation.warnings.slice(0, 2).map((w) => (
              <p key={w} className="hint">
                {w}
              </p>
            ))}

            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={acceptedDisclaimer}
                onChange={(e) => setAcceptedDisclaimer(e.target.checked)}
                style={{ marginTop: 3 }}
              />
              <span>
                我理解日减是生活方式辅助，热量与识别均为估算；孕期、进食障碍史或特殊疾病应咨询专业人士。
              </span>
            </label>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          {step > 0 && (
            <button type="button" className="btn btn-ghost" onClick={() => setStep((s) => s - 1)}>
              上一步
            </button>
          )}
          {step < 2 ? (
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 0 && (!draft.name.trim() || draft.age < 18)}
              style={{
                opacity: step === 0 && (!draft.name.trim() || draft.age < 18) ? 0.5 : 1,
              }}
            >
              继续
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-block"
              disabled={!validation.ok || !acceptedDisclaimer}
              style={{ opacity: !validation.ok || !acceptedDisclaimer ? 0.5 : 1 }}
              onClick={() => onDone({ ...draft, name: draft.name.trim() || '朋友' })}
            >
              开始使用日减
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
