import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  buildPlan,
  dietRemaining,
  EXERCISE_CREDIT_RATIO,
  type UserProfile,
} from '../lib/calories'
import {
  cloneFood,
  confirmDraftToFood,
  createManualFood,
  recognizeFoodFromImage,
  type RecognitionDraft,
  uid,
} from '../lib/recognize'
import {
  getOrCreateToday,
  loadDays,
  loadOnboarded,
  loadProfile,
  loadWeights,
  saveDays,
  saveOnboarded,
  saveProfile,
  saveWeights,
} from '../lib/storage'
import type { DayLog, ExerciseLog, FoodItem, WeightLog } from '../lib/types'
import { dateKeysForWeek, sumExerciseKcal, sumFoodKcal, sumWater } from '../lib/types'
import { buildTonightSuggestion, sumProtein } from '../lib/tonight'

export type Tab = 'today' | 'food' | 'plan' | 'me'

export interface WeeklyStats {
  budget: number
  eaten: number
  remaining: number
  todayDelta: number
}

interface AppContextValue {
  onboarded: boolean
  profile: UserProfile | null
  completeOnboarding: (profile: UserProfile) => void
  updateProfile: (profile: UserProfile) => void
  day: DayLog
  days: Record<string, DayLog>
  plan: ReturnType<typeof buildPlan> | null
  eaten: number
  burned: number
  exerciseCredit: number
  waterMl: number
  remaining: number
  weekly: WeeklyStats | null
  proteinEaten: number
  tonight: ReturnType<typeof buildTonightSuggestion> | null
  recentFoods: FoodItem[]
  weights: WeightLog[]
  tab: Tab
  setTab: (t: Tab) => void
  analyzePhoto: (imageDataUrl: string) => Promise<RecognitionDraft>
  confirmFood: (draft: RecognitionDraft) => FoodItem
  addManualFood: (name: string, kcal: number) => void
  reeatFood: (food: FoodItem) => void
  updateFood: (food: FoodItem) => void
  removeFood: (id: string) => void
  addWater: (ml: number) => void
  addExercise: (name: string, minutes: number, kcal: number) => void
  addWeight: (kg: number) => void
  resetDemo: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

function upsertDay(days: Record<string, DayLog>, day: DayLog): Record<string, DayLog> {
  return { ...days, [day.date]: day }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [onboarded, setOnboarded] = useState(() => loadOnboarded())
  const [profile, setProfile] = useState<UserProfile | null>(() => loadProfile())
  const [days, setDays] = useState<Record<string, DayLog>>(() => loadDays())
  const [weights, setWeights] = useState<WeightLog[]>(() => loadWeights())
  const [tab, setTab] = useState<Tab>('today')

  const day = useMemo(() => getOrCreateToday(days), [days])
  const plan = useMemo(() => (profile ? buildPlan(profile) : null), [profile])
  const eaten = sumFoodKcal(day.foods)
  const burned = sumExerciseKcal(day.exercises)
  const exerciseCredit = Math.round(burned * EXERCISE_CREDIT_RATIO)
  const waterMl = sumWater(day.water)
  const remaining = plan ? dietRemaining(plan.calorieBudget, eaten, burned) : 0
  const proteinEaten = sumProtein(day.foods)
  const tonight = plan ? buildTonightSuggestion(plan, remaining, proteinEaten) : null

  const weekly = useMemo<WeeklyStats | null>(() => {
    if (!plan) return null
    const keys = dateKeysForWeek()
    const weekEaten = keys.reduce((s, k) => s + sumFoodKcal(days[k]?.foods ?? []), 0)
    const todayDelta = eaten - plan.calorieBudget
    return {
      budget: plan.weeklyBudget,
      eaten: weekEaten,
      remaining: plan.weeklyBudget - weekEaten,
      todayDelta,
    }
  }, [plan, days, eaten])

  const recentFoods = useMemo(() => {
    const all = Object.values(days)
      .flatMap((d) => d.foods)
      .sort((a, b) => b.loggedAt.localeCompare(a.loggedAt))
    const seen = new Set<string>()
    const unique: FoodItem[] = []
    for (const f of all) {
      const key = `${f.name}|${f.kcal}`
      if (seen.has(key)) continue
      seen.add(key)
      unique.push(f)
      if (unique.length >= 8) break
    }
    return unique
  }, [days])

  const persistDay = useCallback((next: DayLog) => {
    setDays((prev) => {
      const merged = upsertDay(prev, next)
      saveDays(merged)
      return merged
    })
  }, [])

  const completeOnboarding = useCallback((p: UserProfile) => {
    setProfile(p)
    saveProfile(p)
    setOnboarded(true)
    saveOnboarded(true)
    const w: WeightLog = { id: uid(), kg: p.weightKg, loggedAt: new Date().toISOString() }
    const ws = [w]
    setWeights(ws)
    saveWeights(ws)
    setTab('today')
  }, [])

  const updateProfile = useCallback((p: UserProfile) => {
    setProfile(p)
    saveProfile(p)
  }, [])

  const analyzePhoto = useCallback(async (imageDataUrl: string) => {
    return recognizeFoodFromImage(imageDataUrl)
  }, [])

  const confirmFood = useCallback(
    (draft: RecognitionDraft) => {
      const food = confirmDraftToFood(draft)
      persistDay({ ...day, foods: [...day.foods, food] })
      return food
    },
    [day, persistDay],
  )

  const addManualFood = useCallback(
    (name: string, kcal: number) => {
      const food = createManualFood({ name, kcal })
      persistDay({ ...day, foods: [...day.foods, food] })
    },
    [day, persistDay],
  )

  const reeatFood = useCallback(
    (food: FoodItem) => {
      persistDay({ ...day, foods: [...day.foods, cloneFood(food)] })
    },
    [day, persistDay],
  )

  const updateFood = useCallback(
    (food: FoodItem) => {
      persistDay({
        ...day,
        foods: day.foods.map((f) => (f.id === food.id ? food : f)),
      })
    },
    [day, persistDay],
  )

  const removeFood = useCallback(
    (id: string) => {
      persistDay({ ...day, foods: day.foods.filter((f) => f.id !== id) })
    },
    [day, persistDay],
  )

  const addWater = useCallback(
    (ml: number) => {
      persistDay({
        ...day,
        water: [...day.water, { id: uid(), ml, loggedAt: new Date().toISOString() }],
      })
    },
    [day, persistDay],
  )

  const addExercise = useCallback(
    (name: string, minutes: number, kcal: number) => {
      const item: ExerciseLog = {
        id: uid(),
        name,
        minutes,
        kcal,
        source: 'manual',
        loggedAt: new Date().toISOString(),
      }
      persistDay({ ...day, exercises: [...day.exercises, item] })
    },
    [day, persistDay],
  )

  const addWeight = useCallback(
    (kg: number) => {
      const w: WeightLog = { id: uid(), kg, loggedAt: new Date().toISOString() }
      const next = [w, ...weights]
      setWeights(next)
      saveWeights(next)
      if (profile) {
        const p = { ...profile, weightKg: kg }
        setProfile(p)
        saveProfile(p)
      }
    },
    [weights, profile],
  )

  const resetDemo = useCallback(() => {
    localStorage.clear()
    setOnboarded(false)
    setProfile(null)
    setDays({})
    setWeights([])
    setTab('today')
  }, [])

  const value: AppContextValue = {
    onboarded,
    profile,
    completeOnboarding,
    updateProfile,
    day,
    days,
    plan,
    eaten,
    burned,
    exerciseCredit,
    waterMl,
    remaining,
    weekly,
    proteinEaten,
    tonight,
    recentFoods,
    weights,
    tab,
    setTab,
    analyzePhoto,
    confirmFood,
    addManualFood,
    reeatFood,
    updateFood,
    removeFood,
    addWater,
    addExercise,
    addWeight,
    resetDemo,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
