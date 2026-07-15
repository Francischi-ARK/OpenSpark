import assert from "node:assert/strict";
import test from "node:test";

import { parseTransactionText } from "./transaction-parser.mjs";

const now = new Date("2026-07-15T09:00:00+08:00");

test("parses a WeChat payment detail", () => {
  const result = parseTransactionText(
    `微信支付\n支付成功\n¥32.50\n商户名称\n麦当劳人民广场店\n支付时间\n2026年7月15日 12:34:56\n交易单号\n42000012345678901234`,
    now
  );
  assert.deepEqual(
    { source: result.source, type: result.type, amount: result.amount, date: result.date, note: result.note, categoryId: result.categoryId },
    { source: "wechat", type: "expense", amount: 32.5, date: "2026-07-15", note: "麦当劳人民广场店", categoryId: "food" }
  );
});

test("parses a WeChat receipt as income", () => {
  const result = parseTransactionText(
    `微信支付\n收款成功\n收款金额 ¥188.00\n交易对方：张三\n2026-07-14 18:02`,
    now
  );
  assert.equal(result.type, "income");
  assert.equal(result.amount, 188);
  assert.equal(result.note, "张三");
  assert.equal(result.categoryId, "other-in");
});

test("parses an Alipay payment and creates a stable order fingerprint", () => {
  const text = `支付宝\n交易成功\n付款金额：￥68.80\n商户名称：盒马鲜生\n创建时间 2026/07/13 20:16\n订单号 20260713000123456789`;
  const first = parseTransactionText(text, now);
  const second = parseTransactionText(text.replace("交易成功", "支付成功"), now);
  assert.equal(first.source, "alipay");
  assert.equal(first.amount, 68.8);
  assert.equal(first.importFingerprint, second.importFingerprint);
});

test("rejects text without a transaction amount", () => {
  assert.throws(() => parseTransactionText("微信支付\n支付成功", now), /金额/);
});
