# LeanDay 产品方向与交接（HANDOFF）

## 定位

LeanDay（日减）不是单纯热量记录器，而是：

> **每天帮用户做下一顿决定的减脂助手**

核心闭环：

> 拍照 → 识别食物和分量 → 用户快速确认 → 更新今日预算 → 告诉用户下一顿怎么吃

## 当前仓库

- 路径：`leanday/`
- 技术：React 19 + Vite + TypeScript
- 分支：`cursor/leanday-fitness-mvp-0a50`
- 数据：`localStorage`

## 已落地（相对初版 MVP 的升级）

1. **识别确认契约**（`lib/recognize.ts` + `lib/foodDb.ts`）
   - 返回菜名、分量、**热量区间**、置信度、**一个澄清问题**
   - 用户确认后才记账；内部用区间中值
   - 中餐白名单热量库：模型识「是什么」，库算「多少热量」
   - 仍为本地结构化 mock，接口形状已按真实服务端设计

2. **「今晚还能怎么吃」**（`lib/tonight.ts` + Today）
3. **周预算视角**：今日超吃不红色审判，提示本周仍有余量
4. **再吃一次 / 最近吃过**
5. **算法修正**：固定饮食预算；运动仅 **25%** 折算，避免与 TDEE 活动系数双计
6. **安全护栏**：成人 ≥18；过低 BMI 目标 / 过快减重拦截；估算免责声明
7. **体重 7 日趋势**（淡化单日）

## 明确后置

- 完整 HealthKit / Apple Watch（先验证识图闭环）
- 账号与云同步
- 重写 SwiftUI / RN（保留 Web，后续 Capacitor 包装）

## 下一阶段工程任务

1. 薄服务端：`POST /recognize` → 多模态模型 → 映射 `foodDb` → 同结构 `RecognitionDraft`
2. 照片分析后默认丢弃，不长期存
3. 用真实中餐照片测修改率
4. 再 Capacitor iOS → 相机 / 通知 / TestFlight
5. 最后 HealthKit 读写

## 成功指标

- 一顿是否能在约 20 秒记完
- 识别结果需修改比例
- 是否连续记录 7 天
- 看完剩余热量后，是否使用下一顿建议

## 本地运行

```bash
cd leanday && npm install && npm run dev
```
