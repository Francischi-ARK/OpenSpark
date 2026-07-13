# 日减 LeanDay

个人减脂日记 MVP（OpenSpark）。拍食物估算热量，记录饮水与体重，按目标生成每日热量预算与运动建议。

## 已实现

- 档案引导 → BMR / TDEE / 每日热量预算 / 饮水与步行建议
- 今日仪表盘：剩余热量环、饮水快捷记录、运动记账
- 饮食：拍照/选图（演示用模拟识别）+ 手动补记 + 可调热量
- 方案页与体重趋势
- 本地 `localStorage` 持久化
- HealthKit / Apple Watch：产品说明占位，待原生 iOS 接入

## 开发

```bash
cd leanday
npm install
npm run dev
```

```bash
npm run build
```

## 下一步

1. 替换模拟识图为视觉 / 多模态 API + 中餐库
2. 原生 iOS（SwiftUI）接入 HealthKit 读写
3. 可选 Watch 快捷记水 / 看剩余热量
