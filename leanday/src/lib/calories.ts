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
  calorieBudget: number
  proteinG: number
  waterMl: number
  suggestedWalkMin: number
  weeksToGoal: number
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

/** Mifflin-St Jeor BMR */
export function calcBmr(profile: Pick<UserProfile, 'sex' | 'age' | 'heightCm' | 'weightKg'>): number {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age
  return Math.round(profile.sex === 'male' ? base + 5 : base - 161)
}

export function calcTdee(profile: UserProfile): number {
  return Math.round(calcBmr(profile) * ACTIVITY_MULTIPLIER[profile.activity])
}

/** ~7700 kcal ≈ 1 kg fat */
export function buildPlan(profile: UserProfile): DayPlan {
  const bmr = calcBmr(profile)
  const tdee = calcTdee(profile)
  const weeklyLoss = Math.min(Math.max(profile.weeklyLossKg, 0.25), 1)
  const dailyDeficit = Math.round((weeklyLoss * 7700) / 7)
  // Keep floor at ~BMR * 1.05 so budget isn't dangerously low
  const floor = Math.round(bmr * 1.05)
  const calorieBudget = Math.max(tdee - dailyDeficit, floor)
  const actualDeficit = tdee - calorieBudget
  const proteinG = Math.round(profile.weightKg * 1.6)
  const waterMl = Math.round(profile.weightKg * 35)
  // Rough: brisk walk ~5 kcal/min
  const suggestedWalkMin = Math.min(90, Math.max(20, Math.round(actualDeficit / 5 / 2)))
  const kgToLose = Math.max(0, profile.weightKg - profile.targetWeightKg)
  const weeksToGoal = weeklyLoss > 0 ? Math.ceil(kgToLose / weeklyLoss) : 0

  return {
    bmr,
    tdee,
    dailyDeficit: actualDeficit,
    calorieBudget,
    proteinG,
    waterMl,
    suggestedWalkMin,
    weeksToGoal,
  }
}

export function formatKcal(n: number): string {
  return `${Math.round(n)}`
}
