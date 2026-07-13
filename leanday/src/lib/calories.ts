export type Sex = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

export interface UserProfile {
  name: string
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  targetWeightKg: number
  activity: ActivityLevel
  weeklyLossKg: number
}

export interface DayPlan {
  bmr: number
  tdee: number
  dailyDeficit: number
  /** Fixed diet budget for the day (exercise not added back). */
  calorieBudget: number
  weeklyBudget: number
  proteinG: number
  waterMl: number
  suggestedWalkMin: number
  weeksToGoal: number
  /** Absolute intake floor used as product guardrail. */
  intakeFloor: number
  warnings: string[]
}

export interface ProfileValidation {
  ok: boolean
  errors: string[]
  warnings: string[]
}

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: '久坐少动',
  light: '轻度活动',
  moderate: '中度运动',
  active: '较高强度',
  very_active: '高强度训练',
}

/** Partial credit only for logged exercise — avoid double-counting TDEE activity. */
export const EXERCISE_CREDIT_RATIO = 0.25

/** Mifflin-St Jeor BMR */
export function calcBmr(profile: Pick<UserProfile, 'sex' | 'age' | 'heightCm' | 'weightKg'>): number {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age
  return Math.round(profile.sex === 'male' ? base + 5 : base - 161)
}

export function calcTdee(profile: UserProfile): number {
  return Math.round(calcBmr(profile) * ACTIVITY_MULTIPLIER[profile.activity])
}

export function intakeFloorFor(sex: Sex): number {
  return sex === 'female' ? 1200 : 1500
}

export function validateProfile(profile: UserProfile): ProfileValidation {
  const errors: string[] = []
  const warnings: string[] = []

  if (profile.age < 18) {
    errors.push('日减仅面向 18 岁以上成人。未成年人请在监护人与专业人士指导下管理体重。')
  }
  if (profile.heightCm < 120 || profile.heightCm > 230) {
    errors.push('请填写合理的身高。')
  }
  if (profile.weightKg < 35 || profile.weightKg > 250) {
    errors.push('请填写合理的当前体重。')
  }
  if (profile.targetWeightKg <= 0 || profile.targetWeightKg >= profile.weightKg) {
    errors.push('目标体重需低于当前体重，并填写为合理数值。')
  }

  const bmiTarget = profile.targetWeightKg / (profile.heightCm / 100) ** 2
  if (bmiTarget < 18.5) {
    errors.push('目标体重对应 BMI 过低，请上调目标或咨询专业人士。')
  }

  // CDC-style gradual loss: about 0.5–1 kg/week max as product guardrail
  if (profile.weeklyLossKg > 1) {
    errors.push('每周减重不宜超过 1 kg，请选择更稳健的速度。')
  }
  if (profile.weeklyLossKg > 0.75) {
    warnings.push('减重偏快。更稳妥的速度通常在每周 0.25–0.5 kg。')
  }

  warnings.push('日减是生活方式辅助工具，热量与周期均为估算，不能替代医疗建议。')
  warnings.push('如有孕期、进食障碍史或特殊疾病，请先咨询专业人士。')

  return { ok: errors.length === 0, errors, warnings }
}

/** ~7700 kcal ≈ 1 kg fat */
export function buildPlan(profile: UserProfile): DayPlan {
  const bmr = calcBmr(profile)
  const tdee = calcTdee(profile)
  const weeklyLoss = Math.min(Math.max(profile.weeklyLossKg, 0.25), 1)
  const dailyDeficit = Math.round((weeklyLoss * 7700) / 7)
  const intakeFloor = intakeFloorFor(profile.sex)
  const rawBudget = tdee - dailyDeficit
  const calorieBudget = Math.max(rawBudget, intakeFloor)
  const actualDeficit = Math.max(0, tdee - calorieBudget)
  const proteinG = Math.round(profile.weightKg * 1.6)
  const waterMl = Math.round(profile.weightKg * 35)
  const suggestedWalkMin = Math.min(90, Math.max(20, Math.round(actualDeficit / 5 / 2)))
  const kgToLose = Math.max(0, profile.weightKg - profile.targetWeightKg)
  const weeksToGoal = weeklyLoss > 0 ? Math.ceil(kgToLose / weeklyLoss) : 0
  const { warnings } = validateProfile(profile)
  if (rawBudget < intakeFloor) {
    warnings.push(`按目标速度算出的预算低于安全下限，已抬到 ${intakeFloor} kcal（估算护栏）。`)
  }

  return {
    bmr,
    tdee,
    dailyDeficit: actualDeficit,
    calorieBudget,
    weeklyBudget: calorieBudget * 7,
    proteinG,
    waterMl,
    suggestedWalkMin,
    weeksToGoal,
    intakeFloor,
    warnings,
  }
}

/**
 * Diet remaining uses a fixed budget.
 * Exercise is shown separately; only a partial credit may be applied.
 */
export function dietRemaining(budget: number, eaten: number, exerciseKcal = 0): number {
  const credit = Math.round(exerciseKcal * EXERCISE_CREDIT_RATIO)
  return Math.round(budget - eaten + credit)
}

export function formatKcal(n: number): string {
  return `${Math.round(n)}`
}
