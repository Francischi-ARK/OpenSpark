(() => {
  const STORAGE_KEY = "openspark-ledger-v1";
  const PREFS_KEY = "openspark-ledger-prefs-v1";

  const CATEGORIES = {
    expense: [
      { id: "food", label: "餐饮", icon: "🍜" },
      { id: "transport", label: "交通", icon: "🚌" },
      { id: "shopping", label: "购物", icon: "🛍️" },
      { id: "housing", label: "居住", icon: "🏠" },
      { id: "fun", label: "娱乐", icon: "🎬" },
      { id: "health", label: "医疗", icon: "💊" },
      { id: "edu", label: "学习", icon: "📚" },
      { id: "other-out", label: "其他", icon: "✨" },
    ],
    income: [
      { id: "salary", label: "工资", icon: "💼" },
      { id: "bonus", label: "奖金", icon: "🎁" },
      { id: "side", label: "兼职", icon: "🛠️" },
      { id: "invest", label: "理财", icon: "📈" },
      { id: "gift", label: "红包", icon: "🧧" },
      { id: "other-in", label: "其他", icon: "✨" },
    ],
  };

  const els = {
    monthLabel: document.getElementById("monthLabel"),
    monthPrev: document.getElementById("monthPrev"),
    monthNext: document.getElementById("monthNext"),
    monthBalance: document.getElementById("monthBalance"),
    monthIncome: document.getElementById("monthIncome"),
    monthExpense: document.getElementById("monthExpense"),
    budgetBlock: document.getElementById("budgetBlock"),
    budgetLabel: document.getElementById("budgetLabel"),
    budgetFill: document.getElementById("budgetFill"),
    budgetHint: document.getElementById("budgetHint"),
    openBudget: document.getElementById("openBudget"),
    budgetInput: document.getElementById("budgetInput"),
    budgetFieldLabel: document.getElementById("budgetFieldLabel"),
    saveBudget: document.getElementById("saveBudget"),
    clearBudget: document.getElementById("clearBudget"),
    listMeta: document.getElementById("listMeta"),
    filterBar: document.getElementById("filterBar"),
    filterChip: document.getElementById("filterChip"),
    filterChipText: document.getElementById("filterChipText"),
    txList: document.getElementById("txList"),
    emptyState: document.getElementById("emptyState"),
    recentPanel: document.getElementById("recentPanel"),
    recentRow: document.getElementById("recentRow"),
    breakdownPanel: document.getElementById("breakdownPanel"),
    breakdownStack: document.getElementById("breakdownStack"),
    breakdownList: document.getElementById("breakdownList"),
    breakdownEmpty: document.getElementById("breakdownEmpty"),
    breakdownExpense: document.getElementById("breakdownExpense"),
    breakdownIncome: document.getElementById("breakdownIncome"),
    openAdd: document.getElementById("openAdd"),
    addSheet: document.getElementById("addSheet"),
    txForm: document.getElementById("txForm"),
    sheetTitle: document.getElementById("sheetTitle"),
    amountInput: document.getElementById("amountInput"),
    amountDisplay: document.getElementById("amountDisplay"),
    numpad: document.getElementById("numpad"),
    noteInput: document.getElementById("noteInput"),
    dateInput: document.getElementById("dateInput"),
    editId: document.getElementById("editId"),
    catGrid: document.getElementById("catGrid"),
    cancelSheet: document.getElementById("cancelSheet"),
    deleteTx: document.getElementById("deleteTx"),
    saveTx: document.getElementById("saveTx"),
    typeBtns: [...document.querySelectorAll(".type-btn")],
    openTools: document.getElementById("openTools"),
    toolsSheet: document.getElementById("toolsSheet"),
    closeTools: document.getElementById("closeTools"),
    exportJson: document.getElementById("exportJson"),
    exportCsv: document.getElementById("exportCsv"),
    importTrigger: document.getElementById("importTrigger"),
    importFile: document.getElementById("importFile"),
    toolsStatus: document.getElementById("toolsStatus"),
  };

  const prefs = loadPrefs();

  const PALETTE = [
    "#12856a",
    "#d4a15a",
    "#b54a2f",
    "#3f7cac",
    "#6b8f71",
    "#c079a4",
    "#8c6b4f",
    "#4d6b5f",
  ];

  const state = {
    records: loadRecords(),
    viewYear: new Date().getFullYear(),
    viewMonth: new Date().getMonth(),
    type: prefs.lastType || "expense",
    categoryId: null,
    amountRaw: "",
    breakdownKind: "expense",
    filterType: null,
    filterCategoryId: null,
  };

  state.categoryId = preferredCategory(state.type);

  function loadRecords() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (!raw) {
        return { lastType: "expense", lastCategoryByType: {}, monthlyBudgets: {} };
      }
      const parsed = JSON.parse(raw);
      return {
        lastType: parsed.lastType === "income" ? "income" : "expense",
        lastCategoryByType: parsed.lastCategoryByType || {},
        monthlyBudgets:
          parsed.monthlyBudgets && typeof parsed.monthlyBudgets === "object"
            ? parsed.monthlyBudgets
            : {},
      };
    } catch {
      return { lastType: "expense", lastCategoryByType: {}, monthlyBudgets: {} };
    }
  }

  function savePrefs() {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }

  function saveRecords() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.records));
  }

  function preferredCategory(type) {
    const saved = prefs.lastCategoryByType[type];
    if (saved && CATEGORIES[type].some((c) => c.id === saved)) return saved;
    return CATEGORIES[type][0].id;
  }

  function money(n) {
    const abs = Math.abs(n).toFixed(2);
    return `¥${abs}`;
  }

  function todayISO() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  }

  function stamp() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
  }

  function parseAmount(raw) {
    const cleaned = String(raw).replace(/[^\d.]/g, "");
    if (!cleaned || cleaned === ".") return null;
    const value = Number.parseFloat(cleaned);
    if (!Number.isFinite(value) || value <= 0) return null;
    return Math.round(value * 100) / 100;
  }

  function findCategory(type, id) {
    return (
      CATEGORIES[type].find((c) => c.id === id) ||
      CATEGORIES[type][CATEGORIES[type].length - 1]
    );
  }

  function monthKey(dateStr) {
    return dateStr.slice(0, 7);
  }

  function currentMonthKey() {
    return `${state.viewYear}-${String(state.viewMonth + 1).padStart(2, "0")}`;
  }

  function recordsInView() {
    const key = currentMonthKey();
    return state.records
      .filter((r) => monthKey(r.date) === key)
      .sort((a, b) => {
        if (a.date === b.date) return b.createdAt - a.createdAt;
        return a.date < b.date ? 1 : -1;
      });
  }

  function recentTemplates() {
    const seen = new Set();
    const out = [];
    const sorted = [...state.records].sort((a, b) => b.createdAt - a.createdAt);
    for (const r of sorted) {
      const key = `${r.type}|${r.categoryId}|${r.amount}|${r.note || ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(r);
      if (out.length >= 6) break;
    }
    return out;
  }

  function setAmountRaw(raw) {
    state.amountRaw = raw;
    els.amountInput.value = raw;
    els.amountDisplay.textContent = raw || "0";
    els.amountDisplay.classList.toggle("is-placeholder", !raw);
  }

  function appendAmountKey(key) {
    let raw = state.amountRaw;
    if (key === "back") {
      setAmountRaw(raw.slice(0, -1));
      return;
    }
    if (key === ".") {
      if (raw.includes(".")) return;
      setAmountRaw(raw ? `${raw}.` : "0.");
      return;
    }
    if (raw === "0" && key !== ".") {
      setAmountRaw(key);
      return;
    }
    const [whole, frac] = raw.split(".");
    if (frac !== undefined && frac.length >= 2) return;
    if ((whole || "").length >= 9 && !raw.includes(".")) return;
    setAmountRaw(`${raw}${key}`);
  }

  function openDialog(dialog) {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeDialog(dialog) {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function renderSummary(list) {
    let income = 0;
    let expense = 0;
    for (const r of list) {
      if (r.type === "income") income += r.amount;
      else expense += r.amount;
    }
    const balance = income - expense;
    els.monthBalance.textContent = `${balance < 0 ? "-" : ""}${money(balance)}`;
    els.monthIncome.textContent = money(income);
    els.monthExpense.textContent = money(expense);
    els.monthLabel.textContent = `${state.viewYear}年${state.viewMonth + 1}月`;

    const key = currentMonthKey();
    const budget = Number(prefs.monthlyBudgets[key]) || 0;
    if (budget > 0) {
      const ratio = Math.min(expense / budget, 1);
      const over = expense > budget;
      const left = budget - expense;
      els.budgetBlock.hidden = false;
      els.budgetLabel.textContent = `${money(expense)} / ${money(budget)}`;
      els.budgetFill.style.width = `${(ratio * 100).toFixed(1)}%`;
      els.budgetFill.classList.toggle("is-over", over);
      els.budgetHint.textContent = over
        ? `已超支 ${money(expense - budget)}`
        : `还可以花 ${money(left)}`;
      els.budgetHint.classList.toggle("is-over", over);
      els.openBudget.textContent = "调整预算";
    } else {
      els.budgetBlock.hidden = true;
      els.openBudget.textContent = "设置预算";
    }
  }

  function filteredList(list) {
    if (!state.filterType || !state.filterCategoryId) return list;
    return list.filter(
      (r) => r.type === state.filterType && r.categoryId === state.filterCategoryId
    );
  }

  function renderFilterBar() {
    if (!state.filterType || !state.filterCategoryId) {
      els.filterBar.hidden = true;
      return;
    }
    const cat = findCategory(state.filterType, state.filterCategoryId);
    const kind = state.filterType === "income" ? "收入" : "支出";
    els.filterBar.hidden = false;
    els.filterChipText.textContent = `${kind} · ${cat.icon} ${cat.label}`;
  }

  function renderList(list) {
    const shown = filteredList(list);
    els.txList.innerHTML = "";
    els.emptyState.classList.toggle("hidden", shown.length > 0);
    if (!list.length) {
      els.emptyState.textContent = "还没有记账。点下方「记一笔」开始。";
    } else if (!shown.length) {
      els.emptyState.textContent = "这个分类本月没有流水。";
    }
    els.listMeta.textContent = state.filterCategoryId
      ? `${shown.length} / ${list.length} 笔`
      : list.length
        ? `${list.length} 笔`
        : "暂无记录";
    renderFilterBar();

    for (const r of shown) {
      const cat = findCategory(r.type, r.categoryId);
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tx-item";
      btn.dataset.id = r.id;
      btn.innerHTML = `
        <span class="tx-icon" aria-hidden="true">${cat.icon}</span>
        <span class="tx-main">
          <p class="tx-title">${escapeHtml(r.note || cat.label)}</p>
          <p class="tx-sub">${r.date} · ${cat.label}</p>
        </span>
        <span class="tx-amount ${r.type === "income" ? "is-income" : "is-expense"}">
          ${r.type === "income" ? "+" : "-"}${money(r.amount)}
        </span>
      `;
      btn.addEventListener("click", () => openEdit(r.id));
      li.appendChild(btn);
      els.txList.appendChild(li);
    }
  }

  function renderRecent() {
    const items = recentTemplates();
    els.recentRow.innerHTML = "";
    if (!items.length) {
      els.recentPanel.hidden = true;
      return;
    }
    els.recentPanel.hidden = false;
    for (const r of items) {
      const cat = findCategory(r.type, r.categoryId);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "recent-chip";
      btn.innerHTML = `
        <span class="recent-chip-icon" aria-hidden="true">${cat.icon}</span>
        <span class="recent-chip-text">
          <strong>${escapeHtml(r.note || cat.label)}</strong>
          <small>${r.type === "income" ? "+" : "-"}${money(r.amount)}</small>
        </span>
      `;
      btn.addEventListener("click", () => openReuse(r));
      els.recentRow.appendChild(btn);
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function categoryBreakdown(list, kind) {
    const totals = new Map();
    let sum = 0;
    for (const r of list) {
      if (r.type !== kind) continue;
      totals.set(r.categoryId, (totals.get(r.categoryId) || 0) + r.amount);
      sum += r.amount;
    }
    return [...totals.entries()]
      .map(([categoryId, amount]) => {
        const cat = findCategory(kind, categoryId);
        return {
          categoryId,
          label: cat.label,
          icon: cat.icon,
          amount,
          percent: sum > 0 ? (amount / sum) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .map((row, index) => ({
        ...row,
        color: PALETTE[index % PALETTE.length],
      }));
  }

  function renderBreakdown(list) {
    const kind = state.breakdownKind;
    const rows = categoryBreakdown(list, kind);
    els.breakdownExpense.classList.toggle("is-active", kind === "expense");
    els.breakdownIncome.classList.toggle("is-active", kind === "income");
    document.getElementById("breakdownHeading").textContent =
      kind === "expense" ? "支出构成" : "收入构成";

    els.breakdownStack.innerHTML = "";
    els.breakdownList.innerHTML = "";

    if (!list.length) {
      els.breakdownPanel.hidden = true;
      return;
    }

    els.breakdownPanel.hidden = false;

    if (!rows.length) {
      els.breakdownEmpty.hidden = false;
      els.breakdownStack.hidden = true;
      els.breakdownList.hidden = true;
      return;
    }

    els.breakdownEmpty.hidden = true;
    els.breakdownStack.hidden = false;
    els.breakdownList.hidden = false;

    for (const row of rows) {
      const seg = document.createElement("span");
      seg.className = "breakdown-seg";
      seg.style.flex = `${row.amount} 0 0`;
      seg.style.background = row.color;
      seg.title = `${row.label} ${row.percent.toFixed(0)}%`;
      els.breakdownStack.appendChild(seg);

      const li = document.createElement("li");
      const active =
        state.filterType === kind && state.filterCategoryId === row.categoryId;
      li.className = `breakdown-item${active ? " is-active" : ""}`;
      li.innerHTML = `
        <button type="button" class="breakdown-hit" data-category="${row.categoryId}">
          <span class="breakdown-swatch" style="background:${row.color}" aria-hidden="true"></span>
          <span class="breakdown-icon" aria-hidden="true">${row.icon}</span>
          <span class="breakdown-main">
            <strong>${escapeHtml(row.label)}</strong>
            <span class="breakdown-bar"><i style="width:${row.percent}%;background:${row.color}"></i></span>
          </span>
          <span class="breakdown-meta">
            <strong>${money(row.amount)}</strong>
            <small>${row.percent.toFixed(0)}%</small>
          </span>
        </button>
      `;
      li.querySelector(".breakdown-hit").addEventListener("click", () => {
        if (state.filterType === kind && state.filterCategoryId === row.categoryId) {
          clearFilter();
        } else {
          state.filterType = kind;
          state.filterCategoryId = row.categoryId;
          renderAll();
          document.getElementById("listHeading")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
      els.breakdownList.appendChild(li);
    }
  }

  function clearFilter() {
    state.filterType = null;
    state.filterCategoryId = null;
    renderAll();
  }

  function renderAll() {
    const list = recordsInView();
    renderSummary(list);
    renderBreakdown(list);
    renderList(list);
    renderRecent();
  }

  function renderCategories() {
    const cats = CATEGORIES[state.type];
    if (!cats.some((c) => c.id === state.categoryId)) {
      state.categoryId = cats[0].id;
    }
    els.catGrid.innerHTML = "";
    for (const cat of cats) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `cat-btn${cat.id === state.categoryId ? " is-active" : ""}`;
      btn.dataset.id = cat.id;
      btn.innerHTML = `<span>${cat.icon}</span><span>${cat.label}</span>`;
      btn.addEventListener("click", () => {
        state.categoryId = cat.id;
        prefs.lastCategoryByType[state.type] = cat.id;
        savePrefs();
        renderCategories();
      });
      els.catGrid.appendChild(btn);
    }
  }

  function setType(type, { keepCategory = false } = {}) {
    state.type = type;
    if (!keepCategory) {
      state.categoryId = preferredCategory(type);
    }
    els.typeBtns.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.type === type);
    });
    renderCategories();
  }

  function resetForm() {
    els.editId.value = "";
    els.sheetTitle.textContent = "记一笔";
    setAmountRaw("");
    els.noteInput.value = "";
    els.dateInput.value = todayISO();
    els.deleteTx.classList.add("hidden");
    els.saveTx.textContent = "保存";
    setType(prefs.lastType || "expense");
  }

  function openAdd() {
    resetForm();
    openDialog(els.addSheet);
  }

  function openReuse(record) {
    els.editId.value = "";
    els.sheetTitle.textContent = "再记一笔";
    setAmountRaw(String(record.amount));
    els.noteInput.value = record.note || "";
    els.dateInput.value = todayISO();
    els.deleteTx.classList.add("hidden");
    els.saveTx.textContent = "保存";
    state.categoryId = record.categoryId;
    setType(record.type, { keepCategory: true });
    openDialog(els.addSheet);
  }

  function openEdit(id) {
    const record = state.records.find((r) => r.id === id);
    if (!record) return;
    els.editId.value = record.id;
    els.sheetTitle.textContent = "编辑";
    setAmountRaw(String(record.amount));
    els.noteInput.value = record.note || "";
    els.dateInput.value = record.date;
    els.deleteTx.classList.remove("hidden");
    els.saveTx.textContent = "更新";
    state.categoryId = record.categoryId;
    setType(record.type, { keepCategory: true });
    openDialog(els.addSheet);
  }

  function closeSheet() {
    closeDialog(els.addSheet);
  }

  function uid() {
    return `tx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function onSubmit(event) {
    event.preventDefault();
    const amount = parseAmount(state.amountRaw);
    if (amount == null) {
      els.amountDisplay.classList.add("is-error");
      setTimeout(() => els.amountDisplay.classList.remove("is-error"), 500);
      return;
    }
    if (!els.dateInput.value) {
      els.dateInput.focus();
      return;
    }

    const payload = {
      type: state.type,
      amount,
      categoryId: state.categoryId,
      note: els.noteInput.value.trim(),
      date: els.dateInput.value,
    };

    const editId = els.editId.value;
    if (editId) {
      const idx = state.records.findIndex((r) => r.id === editId);
      if (idx >= 0) {
        state.records[idx] = {
          ...state.records[idx],
          ...payload,
          updatedAt: Date.now(),
        };
      }
    } else {
      state.records.push({
        id: uid(),
        ...payload,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    prefs.lastType = payload.type;
    prefs.lastCategoryByType[payload.type] = payload.categoryId;
    savePrefs();
    saveRecords();
    const d = new Date(payload.date + "T00:00:00");
    state.viewYear = d.getFullYear();
    state.viewMonth = d.getMonth();
    renderAll();
    closeSheet();
  }

  function onDelete() {
    const editId = els.editId.value;
    if (!editId) return;
    state.records = state.records.filter((r) => r.id !== editId);
    saveRecords();
    renderAll();
    closeSheet();
  }

  function shiftMonth(delta) {
    const d = new Date(state.viewYear, state.viewMonth + delta, 1);
    state.viewYear = d.getFullYear();
    state.viewMonth = d.getMonth();
    clearFilter();
  }

  function openTools(focusBudget = false) {
    const key = currentMonthKey();
    const budget = prefs.monthlyBudgets[key];
    els.budgetFieldLabel.textContent = `${state.viewYear}年${state.viewMonth + 1}月预算（元）`;
    els.budgetInput.value = budget ? String(budget) : "";
    setToolsStatus("");
    openDialog(els.toolsSheet);
    if (focusBudget) {
      requestAnimationFrame(() => {
        els.budgetInput.focus();
        els.budgetInput.select();
      });
    }
  }

  function saveBudget() {
    const amount = parseAmount(els.budgetInput.value);
    if (amount == null) {
      setToolsStatus("请输入有效预算金额", true);
      els.budgetInput.focus();
      return;
    }
    prefs.monthlyBudgets[currentMonthKey()] = amount;
    savePrefs();
    setToolsStatus(`已保存预算 ${money(amount)}`);
    renderSummary(recordsInView());
  }

  function clearBudget() {
    delete prefs.monthlyBudgets[currentMonthKey()];
    savePrefs();
    els.budgetInput.value = "";
    setToolsStatus("已清除本月预算");
    renderSummary(recordsInView());
  }

  function downloadBlob(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function setToolsStatus(message, isError = false) {
    els.toolsStatus.textContent = message;
    els.toolsStatus.classList.toggle("is-error", isError);
  }

  function exportJson() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      records: state.records,
    };
    downloadBlob(
      `openspark-ledger-${stamp()}.json`,
      new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    );
    setToolsStatus(`已导出 ${state.records.length} 笔（JSON）`);
  }

  function csvEscape(value) {
    const s = String(value ?? "");
    if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
    return s;
  }

  function exportCsv() {
    const header = ["id", "type", "amount", "categoryId", "note", "date", "createdAt", "updatedAt"];
    const lines = [header.join(",")];
    for (const r of state.records) {
      lines.push(
        [
          r.id,
          r.type,
          r.amount,
          r.categoryId,
          r.note || "",
          r.date,
          r.createdAt || "",
          r.updatedAt || "",
        ]
          .map(csvEscape)
          .join(",")
      );
    }
    downloadBlob(
      `openspark-ledger-${stamp()}.csv`,
      new Blob([`\uFEFF${lines.join("\n")}`], { type: "text/csv;charset=utf-8" })
    );
    setToolsStatus(`已导出 ${state.records.length} 笔（CSV）`);
  }

  function normalizeRecord(raw) {
    if (!raw || typeof raw !== "object") return null;
    const type = raw.type === "income" ? "income" : raw.type === "expense" ? "expense" : null;
    const amount = parseAmount(raw.amount);
    const date = String(raw.date || "").slice(0, 10);
    if (!type || amount == null || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    const categoryId = String(raw.categoryId || "");
    const validCat = CATEGORIES[type].some((c) => c.id === categoryId)
      ? categoryId
      : CATEGORIES[type][CATEGORIES[type].length - 1].id;
    return {
      id: typeof raw.id === "string" && raw.id ? raw.id : uid(),
      type,
      amount,
      categoryId: validCat,
      note: String(raw.note || "").slice(0, 40),
      date,
      createdAt: Number(raw.createdAt) || Date.now(),
      updatedAt: Number(raw.updatedAt) || Date.now(),
    };
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let inQuotes = false;
    const src = text.replace(/^\uFEFF/, "");
    for (let i = 0; i < src.length; i += 1) {
      const ch = src[i];
      const next = src[i + 1];
      if (inQuotes) {
        if (ch === '"' && next === '"') {
          cell += '"';
          i += 1;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          cell += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(cell);
        cell = "";
      } else if (ch === "\n") {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else if (ch !== "\r") {
        cell += ch;
      }
    }
    if (cell.length || row.length) {
      row.push(cell);
      rows.push(row);
    }
    return rows.filter((r) => r.some((c) => String(c).trim() !== ""));
  }

  function recordsFromImport(text, filename) {
    const trimmed = text.trim();
    if (!trimmed) return [];

    if (filename.endsWith(".json") || trimmed.startsWith("{") || trimmed.startsWith("[")) {
      const data = JSON.parse(trimmed);
      const list = Array.isArray(data) ? data : data.records;
      if (!Array.isArray(list)) throw new Error("JSON 格式不对");
      return list.map(normalizeRecord).filter(Boolean);
    }

    const rows = parseCsv(trimmed);
    if (rows.length < 2) return [];
    const header = rows[0].map((h) => h.trim());
    const idx = (name) => header.indexOf(name);
    return rows
      .slice(1)
      .map((cols) =>
        normalizeRecord({
          id: cols[idx("id")],
          type: cols[idx("type")],
          amount: cols[idx("amount")],
          categoryId: cols[idx("categoryId")],
          note: cols[idx("note")],
          date: cols[idx("date")],
          createdAt: cols[idx("createdAt")],
          updatedAt: cols[idx("updatedAt")],
        })
      )
      .filter(Boolean);
  }

  function mergeImported(incoming) {
    const byId = new Map(state.records.map((r) => [r.id, r]));
    let added = 0;
    let updated = 0;
    for (const rec of incoming) {
      if (byId.has(rec.id)) {
        byId.set(rec.id, { ...byId.get(rec.id), ...rec, updatedAt: Date.now() });
        updated += 1;
      } else {
        byId.set(rec.id, rec);
        added += 1;
      }
    }
    state.records = [...byId.values()];
    saveRecords();
    renderAll();
    return { added, updated, total: incoming.length };
  }

  async function onImportFile(event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const incoming = recordsFromImport(text, file.name.toLowerCase());
      if (!incoming.length) {
        setToolsStatus("没有读到有效记录", true);
        return;
      }
      const mode = window.confirm(
        `将导入 ${incoming.length} 笔。\n确定 = 合并到现有数据\n取消 = 中止`
      );
      if (!mode) {
        setToolsStatus("已取消导入");
        return;
      }
      const result = mergeImported(incoming);
      setToolsStatus(`导入完成：新增 ${result.added}，更新 ${result.updated}`);
    } catch (err) {
      setToolsStatus(err.message || "导入失败", true);
    }
  }

  els.openAdd.addEventListener("click", openAdd);
  els.cancelSheet.addEventListener("click", closeSheet);
  els.deleteTx.addEventListener("click", onDelete);
  els.txForm.addEventListener("submit", onSubmit);
  els.monthPrev.addEventListener("click", () => shiftMonth(-1));
  els.monthNext.addEventListener("click", () => shiftMonth(1));
  els.filterChip.addEventListener("click", clearFilter);
  els.openBudget.addEventListener("click", () => openTools(true));
  els.saveBudget.addEventListener("click", saveBudget);
  els.clearBudget.addEventListener("click", clearBudget);
  els.breakdownExpense.addEventListener("click", () => {
    state.breakdownKind = "expense";
    renderBreakdown(recordsInView());
  });
  els.breakdownIncome.addEventListener("click", () => {
    state.breakdownKind = "income";
    renderBreakdown(recordsInView());
  });
  els.typeBtns.forEach((btn) => {
    btn.addEventListener("click", () => setType(btn.dataset.type));
  });
  els.numpad.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-key]");
    if (!btn) return;
    appendAmountKey(btn.dataset.key);
  });

  els.addSheet.addEventListener("click", (event) => {
    if (event.target === els.addSheet) closeSheet();
  });

  els.openTools.addEventListener("click", () => openTools(false));
  els.closeTools.addEventListener("click", () => closeDialog(els.toolsSheet));
  els.toolsSheet.addEventListener("click", (event) => {
    if (event.target === els.toolsSheet) closeDialog(els.toolsSheet);
  });
  els.exportJson.addEventListener("click", exportJson);
  els.exportCsv.addEventListener("click", exportCsv);
  els.importTrigger.addEventListener("click", () => els.importFile.click());
  els.importFile.addEventListener("change", onImportFile);

  renderAll();
  renderCategories();
  setAmountRaw("");

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
})();
