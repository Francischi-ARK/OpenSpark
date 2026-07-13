import type { DayPlan } from './calories'
import type { FoodItem } from './types'

export interface TonightSuggestion {
  title: string
  remaining: number
  proteinLeft: number
  dinnerIdeas: string[]
  takeoutIdeas: string[]
  proteinIdeas: string[]
  tone: 'plenty' | 'moderate' | 'tight' | 'over'
}

export function buildTonightSuggestion(
  plan: DayPlan,
  remaining: number,
  eatenProtein: number,
): TonightSuggestion {
  const proteinLeft = Math.max(0, plan.proteinG - eatenProtein)
  const dinnerIdeas: string[] = []
  const takeoutIdeas: string[] = []
  const proteinIdeas = ['鸡蛋', '鸡胸肉', '鱼', '低脂奶 / 希腊酸奶']

  let tone: TonightSuggestion['tone'] = 'moderate'
  let title = '今晚还能怎么吃'

  if (remaining >= 700) {
    tone = 'plenty'
    title = '预算还宽裕，正常吃一顿就好'
    dinnerIdeas.push('米饭半碗到一碗 + 一份肉 + 两份蔬菜')
    dinnerIdeas.push('清蒸鱼 / 鸡胸 + 大量蔬菜')
    takeoutIdeas.push('轻食碗、麻辣烫少主食、牛肉粉少喝汤')
  } else if (remaining >= 400) {
    tone = 'moderate'
    title = '按这个尺度吃晚饭，今天就能收住'
    dinnerIdeas.push('米饭半碗 + 一份肉 + 两份蔬菜')
    dinnerIdeas.push('少油炒菜，优先蛋白质')
    takeoutIdeas.push('麻辣烫少主食、卤味少酱、沙拉加鸡胸')
  } else if (remaining >= 150) {
    tone = 'tight'
    title = '今晚宜轻，把蛋白质补上'
    dinnerIdeas.push('少饭或免饭 + 一份蛋白 + 大量蔬菜')
    dinnerIdeas.push('鸡蛋羹 / 水煮虾 / 清蒸鱼')
    takeoutIdeas.push('关东煮、烫青菜、去皮鸡肉')
  } else {
    tone = 'over'
    title = '今天已经差不多了，不必报复性节食'
    dinnerIdeas.push('如果还饿：无糖酸奶、黄瓜、鸡蛋')
    dinnerIdeas.push('恢复正常计划即可，不要明天极端少吃')
    takeoutIdeas.push('今晚尽量不点高热量外卖')
  }

  if (proteinLeft >= 25) {
    dinnerIdeas.unshift(`蛋白质还差约 ${Math.round(proteinLeft)} g：优先鸡蛋、鸡胸、鱼、奶`)
  }

  return {
    title,
    remaining: Math.round(remaining),
    proteinLeft: Math.round(proteinLeft),
    dinnerIdeas,
    takeoutIdeas,
    proteinIdeas,
    tone,
  }
}

export function sumProtein(foods: FoodItem[]): number {
  return foods.reduce((s, f) => s + (f.proteinG || 0), 0)
}
