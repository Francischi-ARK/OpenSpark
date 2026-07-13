export interface FoodItem {
  id: string
  name: string
  kcal: number
  proteinG: number
  carbsG: number
  fatG: number
  portion: string
  confidence: number
  imageDataUrl?: string
  loggedAt: string
}

export interface WaterLog {
  id: string
  ml: number
  loggedAt: string
}

export interface WeightLog {
  id: string
  kg: number
  loggedAt: string
}

export interface ExerciseLog {
  id: string
  name: string
  kcal: number
  minutes: number
  source: 'manual' | 'healthkit'
  loggedAt: string
}

export interface DayLog {
  date: string // YYYY-MM-DD
  foods: FoodItem[]
  water: WaterLog[]
  exercises: ExerciseLog[]
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function emptyDay(date = todayKey()): DayLog {
  return { date, foods: [], water: [], exercises: [] }
}

export function sumFoodKcal(foods: FoodItem[]): number {
  return foods.reduce((s, f) => s + f.kcal, 0)
}

export function sumWater(water: WaterLog[]): number {
  return water.reduce((s, w) => s + w.ml, 0)
}

export function sumExerciseKcal(exercises: ExerciseLog[]): number {
  return exercises.reduce((s, e) => s + e.kcal, 0)
}

/** Remaining = budget - eaten + burned */
export function remainingKcal(budget: number, eaten: number, burned: number): number {
  return Math.round(budget - eaten + burned)
}
