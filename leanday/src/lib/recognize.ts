import { CHINESE_FOOD_DB, findFoodByName, macrosForGrams } from './foodDb'
import type { FoodItem } from './types'

export interface RecognizedFoodLine {
  dbId: string
  name: string
  /** Grams before clarifying-question scale (primary item). */
  baseGrams: number
  estimatedGrams: number
  kcalPer100g: number
  kcalMin: number
  kcalMax: number
  confidence: number
}

export interface ClarifyingQuestion {
  id: string
  prompt: string
  options: { id: string; label: string; portionScale: number }[]
}

/** Structured draft before user confirms — never auto-commit exact kcal. */
export interface RecognitionDraft {
  id: string
  imageDataUrl?: string
  lines: RecognizedFoodLine[]
  displayName: string
  kcalMin: number
  kcalMax: number
  /** Midpoint used only after confirm */
  kcalMid: number
  confidence: number
  question: ClarifyingQuestion
  selectedOptionId: string
  portionNote: string
  isEstimate: true
}

export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function lineFromEntry(
  entry: { id: string; name: string; kcalPer100g: number },
  baseGrams: number,
  estimatedGrams: number,
  confidence: number,
  macros: { kcal: number },
): RecognizedFoodLine {
  const spread = Math.max(40, Math.round(macros.kcal * 0.14))
  return {
    dbId: entry.id,
    name: entry.name,
    baseGrams,
    estimatedGrams,
    kcalPer100g: entry.kcalPer100g,
    kcalMin: Math.max(0, macros.kcal - spread),
    kcalMax: macros.kcal + spread,
    confidence,
  }
}

/**
 * Demo recognizer that returns the production contract.
 * Later: call thin server → multimodal model → map names onto foodDb.
 */
export async function recognizeFoodFromImage(imageDataUrl: string): Promise<RecognitionDraft> {
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 500))

  const templates: { mains: string[]; sides?: string[] }[] = [
    { mains: ['宫保鸡丁'], sides: ['白米饭'] },
    { mains: ['番茄炒蛋'], sides: ['白米饭'] },
    { mains: ['鸡胸肉沙拉'] },
    { mains: ['牛肉面'] },
    { mains: ['麻辣烫'] },
    { mains: ['清蒸鱼'], sides: ['白灼西兰花', '白米饭'] },
    { mains: ['燕麦酸奶碗'] },
  ]

  const pick = templates[Math.floor(Math.random() * templates.length)]
  const names = [...pick.mains, ...(pick.sides ?? [])]
  const lines: RecognizedFoodLine[] = names.map((name) => {
    const entry = findFoodByName(name)!
    const baseGrams = Math.round(entry.defaultGrams * (0.9 + Math.random() * 0.2))
    const macros = macrosForGrams(entry, baseGrams)
    return lineFromEntry(entry, baseGrams, baseGrams, 0.72 + Math.random() * 0.2, macros)
  })

  const primary = findFoodByName(pick.mains[0])!
  const question = primary.typicalQuestion
  const defaultOption = question.options[1] ?? question.options[0]

  return buildDraft(lines, question, defaultOption.id, imageDataUrl)
}

export function buildDraft(
  lines: RecognizedFoodLine[],
  question: ClarifyingQuestion,
  selectedOptionId: string,
  imageDataUrl?: string,
): RecognitionDraft {
  const option = question.options.find((o) => o.id === selectedOptionId) ?? question.options[0]
  const scaled = lines.map((line, index) => {
    const entry = CHINESE_FOOD_DB.find((f) => f.id === line.dbId)
    if (!entry) return line
    const scale = index === 0 ? option.portionScale : 1
    const estimatedGrams = Math.round(line.baseGrams * scale)
    const macros = macrosForGrams(entry, estimatedGrams)
    return lineFromEntry(entry, line.baseGrams, estimatedGrams, line.confidence, macros)
  })

  const kcalMin = scaled.reduce((s, l) => s + l.kcalMin, 0)
  const kcalMax = scaled.reduce((s, l) => s + l.kcalMax, 0)
  const kcalMid = Math.round((kcalMin + kcalMax) / 2)
  const confidence = scaled.reduce((s, l) => s + l.confidence, 0) / scaled.length

  return {
    id: uid(),
    imageDataUrl,
    lines: scaled,
    displayName: scaled.map((l) => l.name).join(' + '),
    kcalMin,
    kcalMax,
    kcalMid,
    confidence,
    question,
    selectedOptionId: option.id,
    portionNote: option.label,
    isEstimate: true,
  }
}

export function applyClarifyingOption(draft: RecognitionDraft, optionId: string): RecognitionDraft {
  return buildDraft(draft.lines, draft.question, optionId, draft.imageDataUrl)
}

export function confirmDraftToFood(draft: RecognitionDraft): FoodItem {
  let protein = 0
  let carbs = 0
  let fat = 0
  for (const line of draft.lines) {
    const entry = CHINESE_FOOD_DB.find((f) => f.id === line.dbId)
    if (!entry) continue
    const m = macrosForGrams(entry, line.estimatedGrams)
    protein += m.proteinG
    carbs += m.carbsG
    fat += m.fatG
  }

  return {
    id: uid(),
    name: draft.displayName,
    kcal: draft.kcalMid,
    kcalMin: draft.kcalMin,
    kcalMax: draft.kcalMax,
    proteinG: Math.round(protein),
    carbsG: Math.round(carbs),
    fatG: Math.round(fat),
    portion: `${draft.portionNote} · 估算`,
    confidence: draft.confidence,
    imageDataUrl: draft.imageDataUrl,
    loggedAt: new Date().toISOString(),
    isEstimate: true,
  }
}

export function createManualFood(partial: {
  name: string
  kcal: number
  portion?: string
}): FoodItem {
  return {
    id: uid(),
    name: partial.name,
    kcal: partial.kcal,
    kcalMin: partial.kcal,
    kcalMax: partial.kcal,
    proteinG: Math.round((partial.kcal * 0.15) / 4),
    carbsG: Math.round((partial.kcal * 0.45) / 4),
    fatG: Math.round((partial.kcal * 0.35) / 9),
    portion: partial.portion ?? '自定义',
    confidence: 1,
    loggedAt: new Date().toISOString(),
    isEstimate: false,
  }
}

export function cloneFood(food: FoodItem): FoodItem {
  return {
    ...food,
    id: uid(),
    loggedAt: new Date().toISOString(),
    imageDataUrl: undefined,
  }
}
