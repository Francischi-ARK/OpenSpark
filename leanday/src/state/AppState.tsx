import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { buildPlan, type UserProfile } from '../lib/calories'
import { createManualFood, recognizeFoodFromImage, uid } from '../lib/foodMock'
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
import { remainingKcal, sumExerciseKcal, sumFoodKcal, sumWater } from '../lib/types'

export type Tab = 'today' | 'food' | 'plan' | 'me'

interface AppContextValue {
  onboarded: boolean
  profile: UserProfile | null
  completeOnboarding: (profile: UserProfile) => void
  updateProfile: (profile: UserProfile) => void
  day: DayLog
  plan: ReturnType<typeof buildPlan> | null
  eaten: number
  burned: number
  waterMl: number
  remaining: number
  weights: WeightLog[]
  tab: Tab
  setTab: (t: Tab) => void
  addFoodFromPhoto: (imageDataUrl: string) => Promise<FoodItem>
  addManualFood: (name: string, kcal: number) => void
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
  const waterMl = sumWater(day.water)
  const remaining = plan ? remainingKcal(plan.calorieBudget, eaten, burned) : 0

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

  const addFoodFromPhoto = useCallback(
    async (imageDataUrl: string) => {
      const food = await recognizeFoodFromImage(imageDataUrl)
      const next: DayLog = { ...day, foods: [...day.foods, food] }
      persistDay(next)
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
    plan,
    eaten,
    burned,
    waterMl,
    remaining,
    weights,
    tab,
    setTab,
    addFoodFromPhoto,
    addManualFood,
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
