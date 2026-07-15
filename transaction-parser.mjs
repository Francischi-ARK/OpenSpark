const CATEGORY_RULES = [
  ["food", /餐|饭|咖啡|茶|奶|麦当劳|肯德基|美团|饿了么|便利店|超市/],
  ["transport", /滴滴|打车|地铁|公交|铁路|火车|机票|航空|加油|停车|高速/],
  ["shopping", /淘宝|天猫|京东|拼多多|商场|商城|购物/],
  ["housing", /房租|物业|水费|电费|燃气|宽带|话费/],
  ["fun", /电影|游戏|视频|音乐|娱乐|门票/],
  ["health", /医院|药房|药店|医疗|诊所/],
  ["edu", /学校|教育|课程|书店|培训/],
];

function linesOf(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function sourceOf(text) {
  if (/微信|零钱|WeChat/i.test(text)) return "wechat";
  if (/支付宝|花呗|余额宝|Alipay/i.test(text)) return "alipay";
  if (/银行|储蓄卡|信用卡|尾号\s*\d{4}/.test(text)) return "bank";
  return "unknown";
}

function typeOf(text) {
  const income = /收款成功|已收款|收入|到账|入账|转入|退款成功/;
  const expense = /支付成功|付款成功|已支付|支出|消费|转出|向.+付款/;
  if (income.test(text) && !expense.test(text)) return "income";
  return "expense";
}

function amountOf(lines) {
  const labelled = /(?:支付|付款|收款|入账|退款|交易)?金额[^\d]{0,8}([¥￥]?\s*[-+]?\s*[\d,]+(?:\.\d{1,2})?)/;
  const currency = /(?:^|\s)[¥￥]\s*[-+]?\s*([\d,]+(?:\.\d{1,2})?)/;

  for (const line of lines) {
    const match = line.match(labelled);
    if (match) return Number(match[1].replace(/[¥￥,+\s-]/g, ""));
  }
  for (const line of lines) {
    if (/余额|优惠|原价|可用额度/.test(line)) continue;
    const match = line.match(currency);
    if (match) return Number(match[1].replace(/,/g, ""));
  }
  return null;
}

function dateTimeOf(text, now) {
  const full = text.match(
    /(20\d{2})[年\-\/.](\d{1,2})[月\-\/.](\d{1,2})日?(?:\s+|[^\d]{1,4})?(\d{1,2})?(?::(\d{2}))?(?::(\d{2}))?/
  );
  const partial = text.match(/(\d{1,2})月(\d{1,2})日(?:\s+)?(\d{1,2})?(?::(\d{2}))?/);
  const parts = full
    ? [full[1], full[2], full[3], full[4], full[5], full[6]]
    : partial
      ? [now.getFullYear(), partial[1], partial[2], partial[3], partial[4], null]
      : [now.getFullYear(), now.getMonth() + 1, now.getDate(), null, null, null];
  const [year, month, day, hour, minute, second] = parts.map((value) =>
    value == null ? null : Number(value)
  );
  const pad = (value) => String(value).padStart(2, "0");
  const candidate = new Date(year, month - 1, day);
  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return dateTimeOf("", now);
  }
  const date = `${year}-${pad(month)}-${pad(day)}`;
  const occurredAt = hour == null ? null : `${date}T${pad(hour)}:${pad(minute || 0)}:${pad(second || 0)}`;
  return { date, occurredAt, inferred: !full && !partial };
}

function merchantOf(lines) {
  const labels = /^(?:商户(?:全称|名称)?|收款方|交易对方|对方|商品|订单名称)\s*[:：]?\s*(.*)$/;
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(labels);
    if (!match) continue;
    const value = match[1] || lines[index + 1] || "";
    if (value && !/^(?:支付方式|交易时间|订单号|金额)/.test(value)) return value.slice(0, 40);
  }
  return "";
}

function externalIdOf(text) {
  const match = text.match(/(?:交易单号|商户单号|订单号)\s*[:：]?\s*([A-Za-z0-9_-]{12,})/);
  return match ? match[1] : "";
}

function hash(value) {
  let out = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    out ^= value.charCodeAt(index);
    out = Math.imul(out, 16777619);
  }
  return (out >>> 0).toString(36);
}

function categoryOf(type, merchant) {
  if (type === "income") {
    if (/工资|薪资|薪酬/.test(merchant)) return "salary";
    if (/奖金/.test(merchant)) return "bonus";
    if (/理财|基金|收益|利息/.test(merchant)) return "invest";
    if (/红包|转账/.test(merchant)) return "gift";
    return "other-in";
  }
  return CATEGORY_RULES.find(([, pattern]) => pattern.test(merchant))?.[0] || "other-out";
}

export function parseTransactionText(rawText, now = new Date()) {
  const input = String(rawText || "");
  if (input.length > 10000) throw new Error("截图文字过长，请只保留交易详情");
  const lines = linesOf(input);
  if (!lines.length) throw new Error("没有收到可识别的文字");

  const text = lines.join("\n");
  const amount = amountOf(lines);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("没有识别到有效金额");

  const source = sourceOf(text);
  const type = typeOf(text);
  const merchant = merchantOf(lines);
  const { date, occurredAt, inferred } = dateTimeOf(text, now);
  const externalId = externalIdOf(text);
  const normalized = text.replace(/\s+/g, "").toLowerCase();
  const fingerprintBase = externalId
    ? `${source}|${externalId}`
    : occurredAt && merchant
      ? `${source}|${type}|${amount}|${occurredAt}|${merchant}`
      : normalized;
  const warnings = [];
  if (source === "unknown") warnings.push("未识别支付渠道");
  if (!merchant) warnings.push("未识别商户");
  if (inferred) warnings.push("未识别日期，已使用今天");

  return {
    source,
    type,
    amount: Math.round(amount * 100) / 100,
    categoryId: categoryOf(type, merchant),
    note: merchant || ({ wechat: "微信交易", alipay: "支付宝交易", bank: "银行交易" }[source] || "截图交易"),
    date,
    occurredAt,
    externalId,
    importFingerprint: `ocr_${hash(fingerprintBase)}`,
    warnings,
  };
}
