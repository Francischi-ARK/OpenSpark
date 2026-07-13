import type { FoodItem } from './types'

/** Demo food recognition — later swap for vision / multimodal API */
const MOCK_DISHES: Omit<FoodItem, 'id' | 'loggedAt' | 'imageDataUrl'>[] = [
  {
    name: '番茄炒蛋',
    kcal: 286,
    proteinG: 14,
    carbsG: 12,
    fatG: 20,
    portion: '约 250g（1 人份）',
    confidence: 0.86,
  },
  {
    name: '鸡胸肉沙拉',
    kcal: 320,
    proteinG: 38,
    carbsG: 18,
    fatG: 10,
    portion: '约 350g',
    confidence: 0.91,
  },
  {
    name: '牛肉面',
    kcal: 520,
    proteinG: 28,
    carbsG: 68,
    fatG: 14,
    portion: '约 1 碗',
    confidence: 0.78,
  },
  {
    name: '白灼西兰花 + 清蒸鱼',
    kcal: 245,
    proteinG: 32,
    carbsG: 10,
    fatG: 8,
    portion: '约 300g',
    confidence: 0.83,
  },
  {
    name: '燕麦酸奶碗',
    kcal: 310,
    proteinG: 16,
    carbsG: 42,
    fatG: 9,
    portion: '约 280g',
    confidence: 0.88,
  },
  {
    name: '麻辣香锅（估）',
    kcal: 680,
    proteinG: 26,
    carbsG: 45,
    fatG: 42,
    portion: '约 1 人份',
    confidence: 0.72,
  },
]

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function recognizeFoodFromImage(imageDataUrl: string): Promise<FoodItem> {
  // Simulate model latency
  await new Promise((r) => setTimeout(r, 900 + Math.random() * 600))
  const base = MOCK_DISHES[Math.floor(Math.random() * MOCK_DISHES.length)]
  // Slight portion noise
  const scale = 0.9 + Math.random() * 0.25
  return {
    id: uid(),
    name: base.name,
    kcal: Math.round(base.kcal * scale),
    proteinG: Math.round(base.proteinG * scale),
    carbsG: Math.round(base.carbsG * scale),
    fatG: Math.round(base.fatG * scale),
    portion: base.portion,
    confidence: base.confidence,
    imageDataUrl,
    loggedAt: new Date().toISOString(),
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
    proteinG: Math.round(partial.kcal * 0.15 / 4),
    carbsG: Math.round(partial.kcal * 0.45 / 4),
    fatG: Math.round(partial.kcal * 0.35 / 9),
    portion: partial.portion ?? '自定义',
    confidence: 1,
    loggedAt: new Date().toISOString(),
  }
}

export { uid }
