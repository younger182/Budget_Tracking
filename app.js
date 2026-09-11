const elements = {
  loginScreen: document.querySelector("#login-screen"),
  loginForm: document.querySelector("#login-form"),
  loginMessage: document.querySelector("#login-message"),
  appShell: document.querySelector("#app-shell"),
  userLabel: document.querySelector("#user-label"),
  logoutButton: document.querySelector("#logout-button"),
  expenseForm: document.querySelector("#expense-form"),
  dateInput: document.querySelector("#expense-date"),
  formMessage: document.querySelector("#expense-form .form-message"),
  statusBadge: document.querySelector("#status-badge"),
  monthlyTotal: document.querySelector("#monthly-total"),
  todayTotal: document.querySelector("#today-total"),
  averageTotal: document.querySelector("#average-total"),
  monthlyCount: document.querySelector("#monthly-count"),
  calendarTitle: document.querySelector("#calendar-title"),
  calendar: document.querySelector("#calendar"),
  calendarDays: document.querySelector("#calendar-days"),
  previousMonth: document.querySelector("#previous-month"),
  nextMonth: document.querySelector("#next-month"),
  selectedDate: document.querySelector("#selected-date"),
  selectedDayTotal: document.querySelector("#selected-day-total"),
  selectedDayExpenses: document.querySelector("#selected-day-expenses"),
  resultCount: document.querySelector("#result-count"),
  historyContent: document.querySelector("#history-content"),
  historyStart: document.querySelector("#history-start"),
  historyEnd: document.querySelector("#history-end"),
  historyFilterButton: document.querySelector("#history-filter-button"),
  analysisStart: document.querySelector("#analysis-start"),
  analysisEnd: document.querySelector("#analysis-end"),
  analyzeButton: document.querySelector("#analyze-button"),
  analysisContent: document.querySelector("#analysis-content")
};

const today = new Date();
let expenses = [];
let viewedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDate = toDateKey(today);

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "The server could not complete that request.");
  }
  return data;
}

async function loadExpenses() {
  const data = await apiRequest("/api/expenses");
  expenses = data.expenses;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 2
  }).format(amount);
}

function formatDate(dateKey) {
  return parseDateKey(dateKey).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getToday() {
  return toDateKey(new Date());
}

function getMonthExpenses(date) {
  const key = monthKey(date);
  return expenses.filter((expense) => expense.date.startsWith(key));
}

function totalFor(items) {
  return items.reduce((total, expense) => total + Number(expense.amount), 0);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showFormMessage(message, isError = false) {
  elements.formMessage.textContent = message;
  elements.formMessage.classList.toggle("form-message-error", isError);
}

function showLoginMessage(message) {
  elements.loginMessage.textContent = message;
  elements.loginMessage.classList.add("form-message-error");
}

function renderDashboard() {
  const currentMonthExpenses = getMonthExpenses(today);
  const currentMonthTotal = totalFor(currentMonthExpenses);
  const todayTotal = totalFor(expenses.filter((expense) => expense.date === getToday()));
  const daysPassed = today.getDate();

  elements.monthlyTotal.textContent = formatCurrency(currentMonthTotal);
  elements.todayTotal.textContent = formatCurrency(todayTotal);
  elements.averageTotal.textContent = formatCurrency(currentMonthTotal / daysPassed);
  elements.monthlyCount.textContent = currentMonthExpenses.length;
  elements.statusBadge.textContent = currentMonthExpenses.length
    ? `${currentMonthExpenses.length} expense${currentMonthExpenses.length === 1 ? "" : "s"} this month`
    : "No expenses yet";
}

function renderCalendar() {
  const year = viewedMonth.getFullYear();
  const month = viewedMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthExpenses = getMonthExpenses(viewedMonth);
  const totalsByDate = monthExpenses.reduce((totals, expense) => {
    totals[expense.date] = (totals[expense.date] || 0) + Number(expense.amount);
    return totals;
  }, {});

  elements.calendarTitle.textContent = viewedMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  elements.calendar.setAttribute("aria-label", `${elements.calendarTitle.textContent} calendar`);

  const dayButtons = [];
  for (let index = 0; index < firstDay; index += 1) {
    dayButtons.push(calendarDayMarkup(new Date(year, month, index - firstDay + 1), true, totalsByDate));
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    dayButtons.push(calendarDayMarkup(new Date(year, month, day), false, totalsByDate));
  }
  while (dayButtons.length < 42) {
    dayButtons.push(calendarDayMarkup(new Date(year, month, dayButtons.length - firstDay + 1), true, totalsByDate));
  }
  elements.calendarDays.innerHTML = dayButtons.join("");
}

function calendarDayMarkup(date, muted, totalsByDate) {
  const dateKey = toDateKey(date);
  const classes = ["calendar-day"];
  if (muted) classes.push("muted");
  if (dateKey === getToday()) classes.push("today");
  if (dateKey === selectedDate) classes.push("selected");
  if (totalsByDate[dateKey]) classes.push("has-expenses");
  const amountLabel = totalsByDate[dateKey] ? `, ${formatCurrency(totalsByDate[dateKey])} spent` : "";
  return `<button class="${classes.join(" ")}" type="button" data-date="${dateKey}" aria-label="${formatDate(dateKey)}${amountLabel}">${date.getDate()}${totalsByDate[dateKey] ? '<span class="day-dot" aria-hidden="true"></span>' : ""}</button>`;
}

function renderSelectedDay() {
  const selectedExpenses = expenses.filter((expense) => expense.date === selectedDate);
  elements.selectedDate.textContent = formatDate(selectedDate);
  elements.selectedDayTotal.textContent = formatCurrency(totalFor(selectedExpenses));
  if (!selectedExpenses.length) {
    elements.selectedDayExpenses.innerHTML = '<p class="selected-day-empty">No expenses recorded for this day.</p>';
    return;
  }
  elements.selectedDayExpenses.innerHTML = selectedExpenses.map((expense) => `
    <div class="selected-expense">
      <span>${escapeHtml(expense.place)} <small>${escapeHtml(expense.category)}</small></span>
      <strong>${formatCurrency(Number(expense.amount))}</strong>
    </div>
  `).join("");
}

function getHistoryExpenses() {
  const startDate = elements.historyStart.value;
  const endDate = elements.historyEnd.value;

  if (startDate && endDate) {
    if (startDate > endDate) {
      return [];
    }
    return expenses.filter((expense) => expense.date >= startDate && expense.date <= endDate);
  }

  return expenses.filter((expense) => expense.date === selectedDate);
}

function renderHistory() {
  const filteredExpenses = getHistoryExpenses();
  const activeRangeLabel = elements.historyStart.value && elements.historyEnd.value
    ? `${formatDate(elements.historyStart.value)} to ${formatDate(elements.historyEnd.value)}`
    : formatDate(selectedDate);

  elements.resultCount.textContent = `${filteredExpenses.length} expense${filteredExpenses.length === 1 ? "" : "s"}`;
  if (!filteredExpenses.length) {
    elements.historyContent.className = "empty-state";
    elements.historyContent.innerHTML = `
      <span class="empty-icon" aria-hidden="true">+</span>
      <h3>No budget spending in this range.</h3>
      <p>There are no expenses recorded for ${activeRangeLabel}.</p>
    `;
    return;
  }
  elements.historyContent.className = "history-table-wrap";
  elements.historyContent.innerHTML = `
    <table class="history-table">
      <thead><tr><th>Date</th><th>Place</th><th>Category</th><th>Amount</th><th>Description</th><th><span class="visually-hidden">Actions</span></th></tr></thead>
      <tbody>${filteredExpenses.map((expense) => `
        <tr><td>${formatDate(expense.date)}</td><td>${escapeHtml(expense.place)}</td><td><span class="category-tag">${escapeHtml(expense.category)}</span></td><td class="amount-cell">${formatCurrency(Number(expense.amount))}</td><td>${escapeHtml(expense.description || "-")}</td><td><button class="delete-button" type="button" data-delete-id="${expense.id}">Delete</button></td></tr>
      `).join("")}</tbody>
    </table>
  `;
}

function renderAnalysis(startDate, endDate) {
  if (!startDate || !endDate) {
    elements.analysisContent.innerHTML = "<p>Select a date range to see your spending breakdown.</p>";
    return;
  }
  if (startDate > endDate) {
    elements.analysisContent.innerHTML = '<p class="analysis-error">The start date must be before the end date.</p>';
    return;
  }
  const filteredExpenses = expenses.filter((expense) => expense.date >= startDate && expense.date <= endDate);
  const total = totalFor(filteredExpenses);
  const categoryTotals = filteredExpenses.reduce((categories, expense) => {
    const category = expense.category;
    if (!categories[category]) categories[category] = { count: 0, total: 0 };
    categories[category].count += 1;
    categories[category].total += Number(expense.amount);
    return categories;
  }, {});
  const categoryRows = Object.entries(categoryTotals).sort((first, second) => second[1].total - first[1].total);
  elements.analysisContent.innerHTML = `
    <div class="analysis-summary"><strong>${formatCurrency(total)}</strong><span>${filteredExpenses.length} transaction${filteredExpenses.length === 1 ? "" : "s"} from ${formatDate(startDate)} to ${formatDate(endDate)}</span></div>
    ${categoryRows.length ? `<div class="analysis-table-wrap"><table class="analysis-table"><thead><tr><th>Category</th><th>Transactions</th><th>Total</th><th>Share</th></tr></thead><tbody>${categoryRows.map(([category, values]) => `<tr><td><span class="category-tag">${escapeHtml(category)}</span></td><td>${values.count}</td><td class="amount-cell">${formatCurrency(values.total)}</td><td>${total ? Math.round((values.total / total) * 100) : 0}%</td></tr>`).join("")}</tbody></table></div>` : '<p>No expenses found in this date range.</p>'}
  `;
}

function renderAll() {
  renderDashboard();
  renderCalendar();
  renderSelectedDay();
  renderHistory();
}

function showAuthenticatedApp(user) {
  elements.loginScreen.classList.add("hidden");
  elements.appShell.classList.remove("hidden");
  elements.logoutButton.classList.remove("hidden");
  elements.userLabel.textContent = `Signed in as ${user.username}`;
}

function showLoggedOutApp() {
  elements.loginScreen.classList.remove("hidden");
  elements.appShell.classList.add("hidden");
  elements.logoutButton.classList.add("hidden");
  elements.userLabel.textContent = "Personal budget tracker";
}

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  elements.loginMessage.textContent = "";
  try {
    const formData = new FormData(elements.loginForm);
    const result = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: formData.get("username"), password: formData.get("password") })
    });
    await loadExpenses();
    elements.loginForm.reset();
    showAuthenticatedApp(result.user);
    renderAll();
  } catch (error) {
    showLoginMessage(error.message);
  }
});

elements.logoutButton.addEventListener("click", async () => {
  await apiRequest("/api/auth/logout", { method: "POST" });
  expenses = [];
  showLoggedOutApp();
});

elements.expenseForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!elements.expenseForm.reportValidity()) return;
  const formData = new FormData(elements.expenseForm);
  try {
    const result = await apiRequest("/api/expenses", {
      method: "POST",
      body: JSON.stringify({
        date: formData.get("date"),
        place: formData.get("place").trim(),
        category: formData.get("category"),
        amount: Number(formData.get("amount")),
        description: formData.get("description").trim()
      })
    });
    expenses.push(result.expense);
    selectedDate = result.expense.date;
    viewedMonth = new Date(`${selectedDate}T00:00:00`);
    viewedMonth.setDate(1);
    elements.expenseForm.reset();
    elements.dateInput.value = getToday();
    showFormMessage("Expense saved to the database.");
    renderAll();
  } catch (error) {
    showFormMessage(error.message, true);
  }
});

elements.previousMonth.addEventListener("click", () => {
  viewedMonth = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() - 1, 1);
  renderCalendar();
});

elements.nextMonth.addEventListener("click", () => {
  viewedMonth = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() + 1, 1);
  renderCalendar();
});

elements.calendarDays.addEventListener("click", (event) => {
  const dayButton = event.target.closest("[data-date]");
  if (!dayButton) return;
  selectedDate = dayButton.dataset.date;
  const date = parseDateKey(selectedDate);
  if (date.getMonth() !== viewedMonth.getMonth() || date.getFullYear() !== viewedMonth.getFullYear()) {
    viewedMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  }
  renderAll();
});

elements.historyContent.addEventListener("click", async (event) => {
  const deleteButton = event.target.closest("[data-delete-id]");
  if (!deleteButton) return;
  try {
    await apiRequest(`/api/expenses/${deleteButton.dataset.deleteId}`, { method: "DELETE" });
    expenses = expenses.filter((expense) => String(expense.id) !== deleteButton.dataset.deleteId);
    showFormMessage("Expense deleted from the database.");
    renderAll();
  } catch (error) {
    showFormMessage(error.message, true);
  }
});

elements.historyFilterButton.addEventListener("click", () => {
  if (elements.historyStart.value && elements.historyEnd.value && elements.historyStart.value > elements.historyEnd.value) {
    elements.historyContent.className = "empty-state";
    elements.historyContent.innerHTML = `
      <span class="empty-icon" aria-hidden="true">+</span>
      <h3>Invalid date range.</h3>
      <p>The start date must be before or equal to the end date.</p>
    `;
    elements.resultCount.textContent = "0 expenses";
    return;
  }
  renderHistory();
});

elements.analyzeButton.addEventListener("click", () => {
  renderAnalysis(elements.analysisStart.value, elements.analysisEnd.value);
});

async function initialize() {
  elements.dateInput.value = getToday();
  const firstDayOfMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  elements.historyStart.value = firstDayOfMonth;
  elements.historyEnd.value = getToday();
  elements.analysisStart.value = firstDayOfMonth;
  elements.analysisEnd.value = getToday();
  try {
    const result = await apiRequest("/api/auth/me");
    await loadExpenses();
    showAuthenticatedApp(result.user);
    renderAll();
  } catch (error) {
    showLoggedOutApp();
  }
}

initialize();