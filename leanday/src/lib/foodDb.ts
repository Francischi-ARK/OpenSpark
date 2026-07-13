export interface FoodDbEntry {
  id: string
  name: string
  /** kcal per 100g */
  kcalPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  defaultGrams: number
  typicalQuestion: ClarifyingQuestionTemplate
}

export interface ClarifyingQuestionTemplate {
  id: string
  prompt: string
  options: { id: string; label: string; portionScale: number }[]
}

/** Small Chinese / takeout whitelist — model identifies, DB computes calories. */
export const CHINESE_FOOD_DB: FoodDbEntry[] = [
  {
    id: 'gongbao_chicken',
    name: '宫保鸡丁',
    kcalPer100g: 180,
    proteinPer100g: 14,
    carbsPer100g: 10,
    fatPer100g: 10,
    defaultGrams: 250,
    typicalQuestion: {
      id: 'plate',
      prompt: '这盘菜大约吃了多少？',
      options: [
        { id: 'half', label: '大约一半', portionScale: 0.5 },
        { id: 'most', label: '大半盘', portionScale: 0.75 },
        { id: 'all', label: '全部', portionScale: 1 },
      ],
    },
  },
  {
    id: 'rice',
    name: '白米饭',
    kcalPer100g: 116,
    proteinPer100g: 2.6,
    carbsPer100g: 26,
    fatPer100g: 0.3,
    defaultGrams: 200,
    typicalQuestion: {
      id: 'rice_bowl',
      prompt: '米饭是半碗还是一碗？',
      options: [
        { id: 'half', label: '半碗', portionScale: 0.5 },
        { id: 'one', label: '一碗', portionScale: 1 },
        { id: 'one_half', label: '一碗半', portionScale: 1.5 },
      ],
    },
  },
  {
    id: 'tomato_egg',
    name: '番茄炒蛋',
    kcalPer100g: 110,
    proteinPer100g: 7,
    carbsPer100g: 5,
    fatPer100g: 7,
    defaultGrams: 250,
    typicalQuestion: {
      id: 'oil',
      prompt: '看起来油多还是偏清淡？',
      options: [
        { id: 'light', label: '偏清淡', portionScale: 0.9 },
        { id: 'normal', label: '正常家常', portionScale: 1 },
        { id: 'oily', label: '油比较多', portionScale: 1.2 },
      ],
    },
  },
  {
    id: 'chicken_salad',
    name: '鸡胸肉沙拉',
    kcalPer100g: 95,
    proteinPer100g: 12,
    carbsPer100g: 5,
    fatPer100g: 3,
    defaultGrams: 350,
    typicalQuestion: {
      id: 'dressing',
      prompt: '酱汁大概用了多少？',
      options: [
        { id: 'none', label: '几乎没酱', portionScale: 0.85 },
        { id: 'light', label: '少量', portionScale: 1 },
        { id: 'heavy', label: '酱比较多', portionScale: 1.25 },
      ],
    },
  },
  {
    id: 'beef_noodle',
    name: '牛肉面',
    kcalPer100g: 105,
    proteinPer100g: 6,
    carbsPer100g: 14,
    fatPer100g: 3,
    defaultGrams: 500,
    typicalQuestion: {
      id: 'soup',
      prompt: '汤喝了吗？',
      options: [
        { id: 'no', label: '几乎没喝', portionScale: 0.85 },
        { id: 'some', label: '喝了一部分', portionScale: 1 },
        { id: 'all', label: '汤也喝完了', portionScale: 1.15 },
      ],
    },
  },
  {
    id: 'malatang',
    name: '麻辣烫',
    kcalPer100g: 95,
    proteinPer100g: 5,
    carbsPer100g: 10,
    fatPer100g: 4,
    defaultGrams: 450,
    typicalQuestion: {
      id: 'carb',
      prompt: '主食（粉/面）多吗？',
      options: [
        { id: 'less', label: '少主食', portionScale: 0.8 },
        { id: 'normal', label: '正常', portionScale: 1 },
        { id: 'more', label: '主食很多', portionScale: 1.25 },
      ],
    },
  },
  {
    id: 'steamed_fish',
    name: '清蒸鱼',
    kcalPer100g: 110,
    proteinPer100g: 18,
    carbsPer100g: 1,
    fatPer100g: 4,
    defaultGrams: 200,
    typicalQuestion: {
      id: 'plate',
      prompt: '鱼肉大概吃了多少？',
      options: [
        { id: 'half', label: '一半', portionScale: 0.5 },
        { id: 'most', label: '大半', portionScale: 0.8 },
        { id: 'all', label: '全部', portionScale: 1 },
      ],
    },
  },
  {
    id: 'broccoli',
    name: '白灼西兰花',
    kcalPer100g: 35,
    proteinPer100g: 3,
    carbsPer100g: 5,
    fatPer100g: 0.5,
    defaultGrams: 150,
    typicalQuestion: {
      id: 'oil',
      prompt: '有没有淋油或蚝油？',
      options: [
        { id: 'none', label: '清煮/白灼', portionScale: 1 },
        { id: 'light', label: '少量酱汁', portionScale: 1.3 },
        { id: 'oily', label: '油盐较重', portionScale: 1.6 },
      ],
    },
  },
  {
    id: 'oat_yogurt',
    name: '燕麦酸奶碗',
    kcalPer100g: 110,
    proteinPer100g: 6,
    carbsPer100g: 15,
    fatPer100g: 3,
    defaultGrams: 280,
    typicalQuestion: {
      id: 'bowl',
      prompt: '这碗大概多大？',
      options: [
        { id: 'small', label: '小碗', portionScale: 0.75 },
        { id: 'normal', label: '正常', portionScale: 1 },
        { id: 'large', label: '大碗', portionScale: 1.35 },
      ],
    },
  },
  {
    id: 'latte',
    name: '拿铁',
    kcalPer100g: 45,
    proteinPer100g: 2.5,
    carbsPer100g: 4,
    fatPer100g: 2,
    defaultGrams: 300,
    typicalQuestion: {
      id: 'milk',
      prompt: '是全脂还是低脂/燕麦奶？',
      options: [
        { id: 'skim', label: '低脂/脱脂', portionScale: 0.75 },
        { id: 'oat', label: '燕麦奶', portionScale: 1 },
        { id: 'whole', label: '全脂', portionScale: 1.2 },
      ],
    },
  },
]

export function findFoodByName(name: string): FoodDbEntry | undefined {
  return CHINESE_FOOD_DB.find((f) => f.name === name || name.includes(f.name))
}

export function macrosForGrams(entry: FoodDbEntry, grams: number) {
  const factor = grams / 100
  return {
    kcal: Math.round(entry.kcalPer100g * factor),
    proteinG: Math.round(entry.proteinPer100g * factor * 10) / 10,
    carbsG: Math.round(entry.carbsPer100g * factor * 10) / 10,
    fatG: Math.round(entry.fatPer100g * factor * 10) / 10,
  }
}
