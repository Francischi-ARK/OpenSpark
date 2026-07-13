import type { UserProfile } from './calories'
import type { DayLog, WeightLog } from './types'
import { emptyDay, todayKey } from './types'

const KEYS = {
  profile: 'leanday.profile',
  days: 'leanday.days',
  weights: 'leanday.weights',
  onboarded: 'leanday.onboarded',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadProfile(): UserProfile | null {
  return read<UserProfile | null>(KEYS.profile, null)
}

export function saveProfile(profile: UserProfile) {
  write(KEYS.profile, profile)
}

export function loadOnboarded(): boolean {
  return read(KEYS.onboarded, false)
}

export function saveOnboarded(v: boolean) {
  write(KEYS.onboarded, v)
}

export function loadDays(): Record<string, DayLog> {
  return read(KEYS.days, {})
}

export function saveDays(days: Record<string, DayLog>) {
  write(KEYS.days, days)
}

export function getOrCreateToday(days: Record<string, DayLog>): DayLog {
  const key = todayKey()
  return days[key] ?? emptyDay(key)
}

export function loadWeights(): WeightLog[] {
  return read(KEYS.weights, [])
}

export function saveWeights(weights: WeightLog[]) {
  write(KEYS.weights, weights)
}

export function resetAll() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
}
