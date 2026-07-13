# 日减 LeanDay

个人减脂助手 MVP（OpenSpark）。

定位：**拍一拍 → 确认分量 → 更新预算 → 告诉你下一顿怎么吃**（不是纯热量账本）。

## 已实现

- 档案引导 + 安全护栏（成人 / 目标体重 / 减重速度）
- 固定饮食预算 + 周预算视角；运动仅部分折算
- 拍照识别确认流：热量区间 + 一个澄清问题（结构化演示）
- 中餐白名单热量库、`再吃一次`、今晚怎么吃
- 饮水、体重 7 日趋势
- HealthKit 明确后置

详见 [HANDOFF.md](./HANDOFF.md)。

## 开发

```bash
cd leanday
npm install
npm run dev
```

```bash
npm run build
```
