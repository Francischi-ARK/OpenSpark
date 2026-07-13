(() => {
  const STORAGE_KEY = "openspark-ledger-v1";

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
    listMeta: document.getElementById("listMeta"),
    txList: document.getElementById("txList"),
    emptyState: document.getElementById("emptyState"),
    openAdd: document.getElementById("openAdd"),
    addSheet: document.getElementById("addSheet"),
    txForm: document.getElementById("txForm"),
    sheetTitle: document.getElementById("sheetTitle"),
    amountInput: document.getElementById("amountInput"),
    noteInput: document.getElementById("noteInput"),
    dateInput: document.getElementById("dateInput"),
    editId: document.getElementById("editId"),
    catGrid: document.getElementById("catGrid"),
    cancelSheet: document.getElementById("cancelSheet"),
    deleteTx: document.getElementById("deleteTx"),
    saveTx: document.getElementById("saveTx"),
    typeBtns: [...document.querySelectorAll(".type-btn")],
  };

  const state = {
    records: loadRecords(),
    viewYear: new Date().getFullYear(),
    viewMonth: new Date().getMonth(),
    type: "expense",
    categoryId: CATEGORIES.expense[0].id,
  };

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

  function saveRecords() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.records));
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

  function parseAmount(raw) {
    const cleaned = String(raw).replace(/[^\d.]/g, "");
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
    els.listMeta.textContent = list.length ? `${list.length} 笔` : "暂无记录";
  }

  function renderList(list) {
    els.txList.innerHTML = "";
    els.emptyState.classList.toggle("hidden", list.length > 0);

    for (const r of list) {
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

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function renderAll() {
    const list = recordsInView();
    renderSummary(list);
    renderList(list);
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
        renderCategories();
      });
      els.catGrid.appendChild(btn);
    }
  }

  function setType(type) {
    state.type = type;
    els.typeBtns.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.type === type);
    });
    renderCategories();
  }

  function resetForm() {
    els.editId.value = "";
    els.sheetTitle.textContent = "记一笔";
    els.amountInput.value = "";
    els.noteInput.value = "";
    els.dateInput.value = todayISO();
    els.deleteTx.classList.add("hidden");
    els.saveTx.textContent = "保存";
    setType("expense");
  }

  function openAdd() {
    resetForm();
    if (typeof els.addSheet.showModal === "function") {
      els.addSheet.showModal();
    } else {
      els.addSheet.setAttribute("open", "");
    }
    requestAnimationFrame(() => els.amountInput.focus());
  }

  function openEdit(id) {
    const record = state.records.find((r) => r.id === id);
    if (!record) return;
    els.editId.value = record.id;
    els.sheetTitle.textContent = "编辑";
    els.amountInput.value = String(record.amount);
    els.noteInput.value = record.note || "";
    els.dateInput.value = record.date;
    els.deleteTx.classList.remove("hidden");
    els.saveTx.textContent = "更新";
    state.categoryId = record.categoryId;
    setType(record.type);
    if (typeof els.addSheet.showModal === "function") {
      els.addSheet.showModal();
    } else {
      els.addSheet.setAttribute("open", "");
    }
  }

  function closeSheet() {
    if (typeof els.addSheet.close === "function") {
      els.addSheet.close();
    } else {
      els.addSheet.removeAttribute("open");
    }
  }

  function uid() {
    return `tx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function onSubmit(event) {
    event.preventDefault();
    const amount = parseAmount(els.amountInput.value);
    if (amount == null) {
      els.amountInput.focus();
      els.amountInput.select();
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
    renderAll();
  }

  els.openAdd.addEventListener("click", openAdd);
  els.cancelSheet.addEventListener("click", closeSheet);
  els.deleteTx.addEventListener("click", onDelete);
  els.txForm.addEventListener("submit", onSubmit);
  els.monthPrev.addEventListener("click", () => shiftMonth(-1));
  els.monthNext.addEventListener("click", () => shiftMonth(1));
  els.typeBtns.forEach((btn) => {
    btn.addEventListener("click", () => setType(btn.dataset.type));
  });

  els.addSheet.addEventListener("click", (event) => {
    if (event.target === els.addSheet) closeSheet();
  });

  renderAll();
  renderCategories();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
})();
