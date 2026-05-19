const STORAGE_KEY = "farm-management-mvp-state";
const SESSION_KEY = "farm-management-mvp-user";
const API_STATE_URL = "/api/state";
const API_SESSION_URL = "/api/session";
const API_LOGIN_URL = "/api/login";
const API_LOGOUT_URL = "/api/logout";
const API_SETUP_URL = "/api/setup";
const API_ACCOUNTS_URL = "/api/accounts";
const FARM_NAME = "Multilox";
const DEFAULT_SETTINGS = { farmName: FARM_NAME, currency: "USD", logoDataUrl: "" };
const SESSION_TIMEOUT_MS = 90 * 1000;

const todayIso = new Date().toISOString().slice(0, 10);
const currentMonth = todayIso.slice(0, 7);

const state = loadState();
let currentUser = loadCurrentUser();
let serverHasMainAdmin = false;
let inactivityTimer = null;

const els = {
  appShell: document.getElementById("appShell"),
  loginScreen: document.getElementById("loginScreen"),
  loginLoading: document.getElementById("loginLoading"),
  loginForm: document.getElementById("loginForm"),
  loginRole: document.getElementById("loginRole"),
  loginUsername: document.getElementById("loginUsername"),
  loginPassword: document.getElementById("loginPassword"),
  loginError: document.getElementById("loginError"),
  setupForm: document.getElementById("setupForm"),
  setupName: document.getElementById("setupName"),
  setupUsername: document.getElementById("setupUsername"),
  setupPassword: document.getElementById("setupPassword"),
  setupConfirmPassword: document.getElementById("setupConfirmPassword"),
  setupError: document.getElementById("setupError"),
  logoutBtn: document.getElementById("logoutBtn"),
  currentUserLabel: document.getElementById("currentUserLabel"),
  pageTitle: document.getElementById("pageTitle"),
  roleSelect: document.getElementById("roleSelect"),
  seedDataBtn: document.getElementById("seedDataBtn"),
  navButtons: document.querySelectorAll(".nav-button"),
  views: document.querySelectorAll(".view"),
  workerForm: document.getElementById("workerForm"),
  workerFormTitle: document.getElementById("workerFormTitle"),
  workerId: document.getElementById("workerId"),
  workerFullName: document.getElementById("workerFullName"),
  workerNationalId: document.getElementById("workerNationalId"),
  workerPhone: document.getElementById("workerPhone"),
  workerGender: document.getElementById("workerGender"),
  workerAddress: document.getElementById("workerAddress"),
  workerDepartment: document.getElementById("workerDepartment"),
  workerPosition: document.getElementById("workerPosition"),
  workerDateEmployed: document.getElementById("workerDateEmployed"),
  workerStatus: document.getElementById("workerStatus"),
  workersTable: document.getElementById("workersTable"),
  workerSearch: document.getElementById("workerSearch"),
  workerDepartmentFilter: document.getElementById("workerDepartmentFilter"),
  cancelWorkerEdit: document.getElementById("cancelWorkerEdit"),
  attendanceForm: document.getElementById("attendanceForm"),
  attendanceId: document.getElementById("attendanceId"),
  attendanceWorker: document.getElementById("attendanceWorker"),
  attendanceDate: document.getElementById("attendanceDate"),
  attendanceStatus: document.getElementById("attendanceStatus"),
  attendanceHours: document.getElementById("attendanceHours"),
  attendanceNotes: document.getElementById("attendanceNotes"),
  cancelAttendanceEdit: document.getElementById("cancelAttendanceEdit"),
  attendanceFilterWorker: document.getElementById("attendanceFilterWorker"),
  attendanceFilterMonth: document.getElementById("attendanceFilterMonth"),
  attendanceFilterStatus: document.getElementById("attendanceFilterStatus"),
  attendanceTable: document.getElementById("attendanceTable"),
  rateForm: document.getElementById("rateForm"),
  rateFormTitle: document.getElementById("rateFormTitle"),
  rateId: document.getElementById("rateId"),
  rateWorkType: document.getElementById("rateWorkType"),
  rateUnit: document.getElementById("rateUnit"),
  rateAmount: document.getElementById("rateAmount"),
  rateStatus: document.getElementById("rateStatus"),
  ratesTable: document.getElementById("ratesTable"),
  cancelRateEdit: document.getElementById("cancelRateEdit"),
  workForm: document.getElementById("workForm"),
  workWorker: document.getElementById("workWorker"),
  workDate: document.getElementById("workDate"),
  workType: document.getElementById("workType"),
  workQuantity: document.getElementById("workQuantity"),
  workRate: document.getElementById("workRate"),
  workTotal: document.getElementById("workTotal"),
  workComments: document.getElementById("workComments"),
  workFilterWorker: document.getElementById("workFilterWorker"),
  workFilterDate: document.getElementById("workFilterDate"),
  workFilterType: document.getElementById("workFilterType"),
  workTable: document.getElementById("workTable"),
  bulkWorkForm: document.getElementById("bulkWorkForm"),
  bulkWorkDate: document.getElementById("bulkWorkDate"),
  bulkWorkType: document.getElementById("bulkWorkType"),
  bulkWorkRate: document.getElementById("bulkWorkRate"),
  bulkWorkHours: document.getElementById("bulkWorkHours"),
  bulkWorkTable: document.getElementById("bulkWorkTable"),
  recentWorkTable: document.getElementById("recentWorkTable"),
  metricActiveWorkers: document.getElementById("metricActiveWorkers"),
  metricTodayCost: document.getElementById("metricTodayCost"),
  metricMonthPayroll: document.getElementById("metricMonthPayroll"),
  metricActiveRates: document.getElementById("metricActiveRates"),
  metricMonthCredits: document.getElementById("metricMonthCredits"),
  metricMonthLoans: document.getElementById("metricMonthLoans"),
  payrollSnapshot: document.getElementById("payrollSnapshot"),
  payrollMonth: document.getElementById("payrollMonth"),
  payrollDepartmentFilter: document.getElementById("payrollDepartmentFilter"),
  runPayrollBtn: document.getElementById("runPayrollBtn"),
  printPayrollBtn: document.getElementById("printPayrollBtn"),
  payrollTable: document.getElementById("payrollTable"),
  payslipPanel: document.getElementById("payslipPanel"),
  payslipPreview: document.getElementById("payslipPreview"),
  printPayslipBtn: document.getElementById("printPayslipBtn"),
  dailyReport: document.getElementById("dailyReport"),
  productivityReport: document.getElementById("productivityReport"),
  expensesReport: document.getElementById("expensesReport"),
  creditForm: document.getElementById("creditForm"),
  creditId: document.getElementById("creditId"),
  creditWorker: document.getElementById("creditWorker"),
  creditDate: document.getElementById("creditDate"),
  creditMonth: document.getElementById("creditMonth"),
  creditItem: document.getElementById("creditItem"),
  creditAmount: document.getElementById("creditAmount"),
  creditStatus: document.getElementById("creditStatus"),
  creditNotes: document.getElementById("creditNotes"),
  creditItemForm: document.getElementById("creditItemForm"),
  creditItemName: document.getElementById("creditItemName"),
  creditItemPrice: document.getElementById("creditItemPrice"),
  creditItemsTable: document.getElementById("creditItemsTable"),
  bulkCreditForm: document.getElementById("bulkCreditForm"),
  bulkCreditWorker: document.getElementById("bulkCreditWorker"),
  bulkCreditDate: document.getElementById("bulkCreditDate"),
  bulkCreditMonth: document.getElementById("bulkCreditMonth"),
  bulkCreditStatus: document.getElementById("bulkCreditStatus"),
  bulkCreditItemsTable: document.getElementById("bulkCreditItemsTable"),
  cancelCreditEdit: document.getElementById("cancelCreditEdit"),
  creditFilterWorker: document.getElementById("creditFilterWorker"),
  creditFilterMonth: document.getElementById("creditFilterMonth"),
  creditFilterStatus: document.getElementById("creditFilterStatus"),
  creditsTable: document.getElementById("creditsTable"),
  creditBalances: document.getElementById("creditBalances"),
  creditReport: document.getElementById("creditReport"),
  loanForm: document.getElementById("loanForm"),
  loanId: document.getElementById("loanId"),
  loanWorker: document.getElementById("loanWorker"),
  loanDate: document.getElementById("loanDate"),
  loanType: document.getElementById("loanType"),
  loanAmount: document.getElementById("loanAmount"),
  loanMonthlyDeduction: document.getElementById("loanMonthlyDeduction"),
  loanStartMonth: document.getElementById("loanStartMonth"),
  loanStatus: document.getElementById("loanStatus"),
  loanNotes: document.getElementById("loanNotes"),
  cancelLoanEdit: document.getElementById("cancelLoanEdit"),
  loanFilterWorker: document.getElementById("loanFilterWorker"),
  loanFilterStatus: document.getElementById("loanFilterStatus"),
  loansTable: document.getElementById("loansTable"),
  departmentReport: document.getElementById("departmentReport"),
  attendanceReport: document.getElementById("attendanceReport"),
  settingsForm: document.getElementById("settingsForm"),
  settingsFarmName: document.getElementById("settingsFarmName"),
  settingsCurrency: document.getElementById("settingsCurrency"),
  settingsLogo: document.getElementById("settingsLogo"),
  clearLogoBtn: document.getElementById("clearLogoBtn"),
  settingsFarmNamePreview: document.getElementById("settingsFarmNamePreview"),
  settingsLogoPreview: document.getElementById("settingsLogoPreview"),
  selectiveResetBtn: document.getElementById("selectiveResetBtn"),
  resetWorkers: document.getElementById("resetWorkers"),
  resetRates: document.getElementById("resetRates"),
  resetWorkRecords: document.getElementById("resetWorkRecords"),
  resetAttendance: document.getElementById("resetAttendance"),
  resetCredits: document.getElementById("resetCredits"),
  resetCreditItems: document.getElementById("resetCreditItems"),
  resetLoans: document.getElementById("resetLoans"),
  accountForm: document.getElementById("accountForm"),
  accountName: document.getElementById("accountName"),
  accountUsername: document.getElementById("accountUsername"),
  accountPassword: document.getElementById("accountPassword"),
  accountRole: document.getElementById("accountRole"),
  accountMessage: document.getElementById("accountMessage"),
  accountsTable: document.getElementById("accountsTable"),
};

els.workDate.value = todayIso;
els.bulkWorkDate.value = todayIso;
els.payrollMonth.value = currentMonth;
els.creditDate.value = todayIso;
els.creditMonth.value = currentMonth;
els.bulkCreditDate.value = todayIso;
els.bulkCreditMonth.value = currentMonth;
if (els.attendanceDate) els.attendanceDate.value = todayIso;
els.attendanceFilterMonth.value = currentMonth;
els.loanDate.value = todayIso;
els.loanStartMonth.value = currentMonth;

function loadState() {
  const fallback = { workers: [], rates: [], workRecords: [], deductions: [], credits: [], creditItems: [], users: [], attendance: [], loans: [], settings: DEFAULT_SETTINGS };
  try {
    const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY)) || fallback;
    return {
      ...fallback,
      ...loaded,
      workers: loaded.workers || [],
      rates: loaded.rates || [],
      workRecords: loaded.workRecords || [],
      deductions: loaded.deductions || [],
      credits: loaded.credits || [],
      creditItems: loaded.creditItems || [],
      users: loaded.users || [],
      attendance: loaded.attendance || [],
      loans: loaded.loans || [],
      settings: { ...DEFAULT_SETTINGS, ...(loaded.settings || {}) },
    };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return syncToServer();
}

async function syncFromServer() {
  try {
    const response = await fetch(API_STATE_URL, { cache: "no-store", credentials: "same-origin" });
    if (response.status === 401) return false;
    if (!response.ok) return false;
    const serverState = await response.json();
    mergeState(serverState);
    const changed = migrateState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (changed) await syncToServer();
    currentUser = loadCurrentUser();
    return true;
  } catch {
    // Opening index.html directly still works as a single-device fallback.
    return false;
  }
}

async function syncToServer() {
  try {
    const response = await fetch(API_STATE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
      credentials: "same-origin",
    });
    if (response.status === 401) {
      currentUser = null;
      clearCurrentUser();
      renderAll();
    }
    return response.ok;
  } catch {
    // If the API is unavailable, local storage keeps the system usable on this device.
    return false;
  }
}

function mergeState(nextState) {
  const fallback = { workers: [], rates: [], workRecords: [], deductions: [], credits: [], creditItems: [], users: [], attendance: [], loans: [], settings: DEFAULT_SETTINGS };
  Object.assign(state, {
    ...fallback,
    ...nextState,
    workers: nextState.workers || [],
    rates: nextState.rates || [],
    workRecords: nextState.workRecords || [],
    deductions: nextState.deductions || [],
    credits: nextState.credits || [],
    creditItems: nextState.creditItems || [],
    users: nextState.users || [],
    attendance: nextState.attendance || [],
    loans: nextState.loans || [],
    settings: { ...DEFAULT_SETTINGS, ...(nextState.settings || {}) },
  });
}

function loadCurrentUser() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    const stillExists = state.users.some((user) => user.id === stored?.id && user.status === "active");
    if (!stored || !stillExists) return null;
    return { id: stored.id, role: stored.role, name: stored.name, username: stored.username };
  } catch {
    return null;
  }
}

function migrateState() {
  let changed = false;
  if (!Array.isArray(state.creditItems)) {
    state.creditItems = [];
    changed = true;
  }
  state.workRecords.forEach((record) => {
    const accurateTotal = cents(Number(record.quantity || 0) * Number(record.rate || 0));
    if (Number(record.total) !== accurateTotal) {
      record.total = accurateTotal;
      changed = true;
    }
  });
  state.credits.forEach((credit) => {
    if (Array.isArray(credit.items)) {
      const accurateAmount = cents(credit.items.reduce((sum, item) => sum + Number(item.total || 0), 0));
      if (Number(credit.amount) !== accurateAmount) {
        credit.amount = accurateAmount;
        changed = true;
      }
    }
  });
  if (!state.users.some((user) => user.role === "main-admin")) {
    const firstAdmin = state.users.find((user) => user.role === "admin" && user.status === "active");
    if (firstAdmin) {
      firstAdmin.role = "main-admin";
      changed = true;
    }
  }
  return changed;
}

function saveCurrentUser(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearCurrentUser() {
  sessionStorage.removeItem(SESSION_KEY);
}

async function apiPost(url, payload = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "same-origin",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

async function logout({ notifyServer = true } = {}) {
  if (notifyServer) {
    await apiPost(API_LOGOUT_URL).catch(() => {});
  }
  currentUser = null;
  clearCurrentUser();
  stopInactivityTimer();
  setView("dashboard");
  renderAll();
}

function markActivity() {
  if (!currentUser) return;
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    logout().catch(() => {});
  }, SESSION_TIMEOUT_MS);
}

function stopInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = null;
}

["click", "input", "keydown", "mousemove", "touchstart", "scroll"].forEach((eventName) => {
  window.addEventListener(eventName, markActivity, { passive: true });
});

window.addEventListener("pagehide", () => {
  if (!currentUser) return;
  const payload = new Blob(["{}"], { type: "application/json" });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(API_LOGOUT_URL, payload);
  }
});

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

function hasAdminAccount() {
  return serverHasMainAdmin || state.users.some((user) => user.role === "main-admin" && user.status === "active");
}

function isSupervisorRole(role) {
  return role === "supervisor";
}

function roleLabel(role) {
  if (role === "main-admin") return "Main Admin";
  if (role === "admin") return "Secondary Admin";
  return "Supervisor";
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeClass(value, allowed, fallback = "inactive") {
  return allowed.includes(value) ? value : fallback;
}

function safeImageDataUrl(value) {
  return String(value || "").startsWith("data:image/") ? value : "";
}

function id(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cents(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function sumMoney(items, selector = (item) => item) {
  return cents(items.reduce((sum, item) => sum + Number(selector(item) || 0), 0));
}

function money(value) {
  return cents(value).toLocaleString("en-US", { style: "currency", currency: state.settings.currency || "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function monthIndex(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  return (year * 12) + monthNumber;
}

function uniqueDepartments() {
  return [...new Set(state.workers.map((worker) => worker.department).filter(Boolean))].sort();
}

function workerMatchesDepartment(worker, department) {
  return !department || worker.department === department;
}

function employeeNumber() {
  const next = state.workers.length + 1;
  return `EMP-${String(next).padStart(4, "0")}`;
}

function getWorker(workerId) {
  return state.workers.find((worker) => worker.id === workerId);
}

function getRate(rateId) {
  return state.rates.find((rate) => rate.id === rateId);
}

function activeWorkers() {
  return state.workers.filter((worker) => worker.status === "active");
}

function activeRates() {
  return state.rates.filter((rate) => rate.status === "active");
}

function setView(viewId) {
  els.navButtons.forEach((button) => button.classList.toggle("active", button.dataset.view === viewId));
  els.views.forEach((view) => view.classList.toggle("active", view.id === viewId));
  const activeButton = [...els.navButtons].find((button) => button.dataset.view === viewId);
  els.pageTitle.textContent = activeButton?.textContent || "Dashboard";
}

function renderAll() {
  renderAuth();
  renderRoleAccess();
  renderDepartmentFilters();
  renderWorkers();
  renderAttendanceOptions();
  renderAttendance();
  renderRates();
  renderWorkOptions();
  renderBulkWorkRegister();
  renderCreditOptions();
  renderCreditItems();
  renderBulkCreditItems();
  renderWorkRecords();
  renderCredits();
  renderLoanOptions();
  renderLoans();
  renderPayroll();
  renderDashboard();
  renderReports();
  renderSettings();
  renderAccounts();
}

function renderAuth() {
  const needsSetup = !hasAdminAccount();
  const isLoggedIn = Boolean(currentUser);
  els.loginScreen.classList.toggle("app-hidden", isLoggedIn);
  els.loginLoading.classList.add("app-hidden");
  els.loginForm.classList.toggle("app-hidden", needsSetup || isLoggedIn);
  els.setupForm.classList.toggle("app-hidden", !needsSetup || isLoggedIn);
  els.appShell.classList.toggle("app-hidden", !isLoggedIn);
  if (!isLoggedIn) return;

  els.currentUserLabel.textContent = `${currentUser.name} (${roleLabel(currentUser.role)})`;
  els.roleSelect.value = currentUser.role;
  els.roleSelect.disabled = true;
}

function renderRoleAccess() {
  const role = currentUser?.role || els.roleSelect.value;
  const isSupervisor = isSupervisorRole(role);
  document.querySelector('[data-view="rates"]').classList.toggle("hidden-for-role", isSupervisor);
  document.querySelector('[data-view="credits"]').classList.toggle("hidden-for-role", isSupervisor);
  document.querySelector('[data-view="loans"]').classList.toggle("hidden-for-role", isSupervisor);
  document.querySelector('[data-view="payroll"]').classList.toggle("hidden-for-role", isSupervisor);
  document.querySelector('[data-view="reports"]').classList.toggle("hidden-for-role", isSupervisor);
  document.querySelector('[data-view="settings"]').classList.toggle("hidden-for-role", isSupervisor);
  document.querySelector('[data-view="accounts"]').classList.toggle("hidden-for-role", isSupervisor);
  els.seedDataBtn.disabled = isSupervisor;
  if (isSupervisor && ["rates", "credits", "loans", "payroll", "reports", "settings", "accounts"].includes(document.querySelector(".view.active")?.id)) {
    setView("work-register");
  }
}

function renderDepartmentFilters() {
  const options = `<option value="">All departments</option>${uniqueDepartments().map((department) => `
    <option value="${esc(department)}">${esc(department)}</option>
  `).join("")}`;
  const workerValue = els.workerDepartmentFilter.value;
  const payrollValue = els.payrollDepartmentFilter.value;
  els.workerDepartmentFilter.innerHTML = options;
  els.payrollDepartmentFilter.innerHTML = options;
  els.workerDepartmentFilter.value = workerValue;
  els.payrollDepartmentFilter.value = payrollValue;
}

function renderWorkers() {
  const query = els.workerSearch.value.trim().toLowerCase();
  const department = els.workerDepartmentFilter.value;
  const workers = state.workers.filter((worker) => {
    return workerMatchesDepartment(worker, department) && [worker.employeeNumber, worker.fullName, worker.department, worker.position, worker.nationalId]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  els.workersTable.innerHTML = workers.map((worker) => `
    <tr>
      <td>${esc(worker.employeeNumber)}</td>
      <td>
        <strong>${esc(worker.fullName)}</strong><br />
        <span>${esc(worker.phone || "No phone")}</span>
      </td>
      <td>${esc(worker.department)}<br /><span>${esc(worker.position)}</span></td>
      <td><span class="status ${safeClass(worker.status, ["active", "inactive"])}">${esc(worker.status)}</span></td>
      <td>
        <div class="row-actions">
          <button type="button" data-edit-worker="${esc(worker.id)}">Edit</button>
          <button class="danger-button" type="button" data-delete-worker="${esc(worker.id)}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("") || emptyRow(5, "No workers found.");
}

function renderRates() {
  els.ratesTable.innerHTML = state.rates.map((rate) => `
    <tr>
      <td>${esc(rate.workType)}</td>
      <td>${esc(rate.unit)}</td>
      <td>${money(rate.amount)}</td>
      <td><span class="status ${safeClass(rate.status, ["active", "inactive"])}">${esc(rate.status)}</span></td>
      <td>
        <div class="row-actions">
          <button type="button" data-edit-rate="${esc(rate.id)}">Edit</button>
          <button class="danger-button" type="button" data-delete-rate="${esc(rate.id)}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("") || emptyRow(5, "No rates configured.");
}

function renderWorkOptions() {
  const workerOptions = activeWorkers().map((worker) => `
    <option value="${esc(worker.id)}">${esc(worker.employeeNumber)} - ${esc(worker.fullName)}</option>
  `).join("");
  els.workWorker.innerHTML = workerOptions;

  const activeRateOptions = activeRates().map((rate) => `
    <option value="${esc(rate.id)}">${esc(rate.workType)} (${money(rate.amount)} / ${esc(rate.unit)})</option>
  `).join("");
  els.workType.innerHTML = activeRateOptions;
  els.bulkWorkType.innerHTML = activeRateOptions;
  els.workFilterType.innerHTML = `<option value="">All work types</option>${state.rates.map((rate) => `
    <option value="${esc(rate.workType)}">${esc(rate.workType)}</option>
  `).join("")}`;

  syncSelectedRate();
  syncBulkSelectedRate();
}

function renderCreditOptions() {
  const workerOptions = activeWorkers().map((worker) => `
    <option value="${esc(worker.id)}">${esc(worker.employeeNumber)} - ${esc(worker.fullName)}</option>
  `).join("");
  els.creditWorker.innerHTML = workerOptions;
  els.bulkCreditWorker.innerHTML = workerOptions;
}

function renderAttendanceOptions() {
  if (!els.attendanceWorker) return;
  els.attendanceWorker.innerHTML = activeWorkers().map((worker) => `
    <option value="${esc(worker.id)}">${esc(worker.employeeNumber)} - ${esc(worker.fullName)}</option>
  `).join("");
}

function renderLoanOptions() {
  els.loanWorker.innerHTML = activeWorkers().map((worker) => `
    <option value="${esc(worker.id)}">${esc(worker.employeeNumber)} - ${esc(worker.fullName)}</option>
  `).join("");
}

function renderBulkWorkRegister() {
  const rateAmount = Number(els.bulkWorkRate.value || 0);
  els.bulkWorkTable.innerHTML = activeWorkers().map((worker) => `
    <tr data-bulk-worker="${esc(worker.id)}">
      <td><input class="bulk-work-present" type="checkbox" /></td>
      <td>${esc(worker.employeeNumber)}<br /><strong>${esc(worker.fullName)}</strong></td>
      <td><input class="bulk-work-qty" type="number" min="0" step="0.01" value="0" /></td>
      <td><strong class="bulk-work-total">${money(0)}</strong></td>
      <td><input class="bulk-work-comments" placeholder="Optional" /></td>
    </tr>
  `).join("") || emptyRow(5, "Add active workers before using the bulk register.");
  els.bulkWorkTable.querySelectorAll(".bulk-work-qty").forEach((input) => {
    input.addEventListener("input", () => {
      const row = input.closest("tr");
      row.querySelector(".bulk-work-total").textContent = money(cents(Number(input.value || 0) * rateAmount));
    });
  });
}

function renderCreditItems() {
  els.creditItemsTable.innerHTML = state.creditItems.map((item) => `
    <tr>
      <td><strong>${esc(item.name)}</strong></td>
      <td>${money(item.price)}</td>
      <td><button class="danger-button" type="button" data-delete-credit-item="${esc(item.id)}">Delete</button></td>
    </tr>
  `).join("") || emptyRow(3, "Add items like sugar, rice, cooking oil, and salt here.");
}

function renderBulkCreditItems() {
  els.bulkCreditItemsTable.innerHTML = state.creditItems.map((item) => `
    <tr data-credit-item="${esc(item.id)}">
      <td><input class="bulk-credit-take" type="checkbox" /></td>
      <td><strong>${esc(item.name)}</strong></td>
      <td>${money(item.price)}</td>
      <td><input class="bulk-credit-qty" type="number" min="0" step="0.01" value="0" /></td>
      <td><strong class="bulk-credit-total">${money(0)}</strong></td>
    </tr>
  `).join("") || emptyRow(5, "Add item prices before issuing bulk credit.");
  els.bulkCreditItemsTable.querySelectorAll(".bulk-credit-qty").forEach((input) => {
    input.addEventListener("input", () => {
      const row = input.closest("tr");
      const item = state.creditItems.find((entry) => entry.id === row.dataset.creditItem);
      row.querySelector(".bulk-credit-total").textContent = money(cents(Number(input.value || 0) * Number(item?.price || 0)));
    });
  });
}

function renderWorkRecords() {
  const workerQuery = els.workFilterWorker.value.trim().toLowerCase();
  const dateQuery = els.workFilterDate.value;
  const typeQuery = els.workFilterType.value;
  const rows = state.workRecords.filter((record) => {
    const worker = getWorker(record.workerId);
    const workerText = `${worker?.fullName || ""} ${worker?.employeeNumber || ""}`.toLowerCase();
    return (!workerQuery || workerText.includes(workerQuery))
      && (!dateQuery || record.date === dateQuery)
      && (!typeQuery || record.workType === typeQuery);
  }).sort((a, b) => b.date.localeCompare(a.date));

  els.workTable.innerHTML = rows.map((record) => {
    const worker = getWorker(record.workerId);
    return `
      <tr>
        <td>${esc(record.date)}</td>
        <td>${worker ? `${esc(worker.employeeNumber)}<br /><strong>${esc(worker.fullName)}</strong>` : "Deleted worker"}</td>
        <td>${esc(record.workType)}</td>
        <td>${esc(record.quantity)}</td>
        <td>${money(record.rate)}</td>
        <td><strong>${money(record.total)}</strong></td>
      </tr>
    `;
  }).join("") || emptyRow(6, "No work records match this filter.");
}

function renderAttendance() {
  const workerQuery = els.attendanceFilterWorker.value.trim().toLowerCase();
  const monthQuery = els.attendanceFilterMonth.value;
  const statusQuery = els.attendanceFilterStatus.value;
  const rows = state.attendance.filter((record) => {
    const worker = getWorker(record.workerId);
    const workerText = `${worker?.fullName || ""} ${worker?.employeeNumber || ""}`.toLowerCase();
    return (!workerQuery || workerText.includes(workerQuery))
      && (!monthQuery || record.date.startsWith(monthQuery))
      && (!statusQuery || record.status === statusQuery);
  }).sort((a, b) => b.date.localeCompare(a.date));

  els.attendanceTable.innerHTML = rows.map((record) => {
    const worker = getWorker(record.workerId);
    return `
      <tr>
        <td>${esc(record.date)}</td>
        <td>${worker ? `${esc(worker.employeeNumber)}<br /><strong>${esc(worker.fullName)}</strong>` : "Deleted worker"}</td>
        <td><span class="status ${record.status === "present" ? "active" : "inactive"}">${esc(record.status)}</span></td>
        <td>${esc(record.hours || 0)}</td>
        <td>${esc(record.notes || "")}</td>
        <td>
          <div class="row-actions">
            <button class="danger-button" type="button" data-delete-attendance="${esc(record.id)}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join("") || emptyRow(6, "No attendance records found.");
}

function renderCredits() {
  const workerQuery = els.creditFilterWorker.value.trim().toLowerCase();
  const monthQuery = els.creditFilterMonth.value;
  const statusQuery = els.creditFilterStatus.value;
  const rows = state.credits.filter((credit) => {
    const worker = getWorker(credit.workerId);
    const workerText = `${worker?.fullName || ""} ${worker?.employeeNumber || ""}`.toLowerCase();
    return (!workerQuery || workerText.includes(workerQuery))
      && (!monthQuery || credit.payrollMonth === monthQuery)
      && (!statusQuery || credit.status === statusQuery);
  }).sort((a, b) => b.date.localeCompare(a.date));

  els.creditsTable.innerHTML = rows.map((credit) => {
    const worker = getWorker(credit.workerId);
    return `
      <tr>
        <td>${esc(credit.date)}</td>
        <td>${worker ? `${esc(worker.employeeNumber)}<br /><strong>${esc(worker.fullName)}</strong>` : "Deleted worker"}</td>
        <td>${esc(credit.item)}<br /><span>${esc(credit.notes || "")}</span></td>
        <td>${esc(credit.payrollMonth)}</td>
        <td><strong>${money(credit.amount)}</strong></td>
        <td><span class="status ${credit.status === "deducted" ? "active" : "inactive"}">${esc(credit.status)}</span></td>
        <td>
          <div class="row-actions">
            <button type="button" data-edit-credit="${esc(credit.id)}">Edit</button>
            <button class="danger-button" type="button" data-delete-credit="${esc(credit.id)}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join("") || emptyRow(7, "No grocery credits recorded.");

  const balances = creditBalances();
  els.creditBalances.innerHTML = balances.map((row) => summaryRow(row.workerLabel, money(row.balance))).join("") || emptySummary("No outstanding grocery credit balances.");
}

function creditBalances() {
  return state.workers.map((worker) => {
    const balance = cents(state.credits
      .filter((credit) => credit.workerId === worker.id && credit.status !== "deducted")
      .reduce((sum, credit) => sum + Number(credit.amount), 0));
    return { workerLabel: `${worker.employeeNumber} - ${worker.fullName}`, balance };
  }).filter((row) => row.balance > 0).sort((a, b) => b.balance - a.balance);
}

function renderLoans() {
  const workerQuery = els.loanFilterWorker.value.trim().toLowerCase();
  const statusQuery = els.loanFilterStatus.value;
  const rows = state.loans.filter((loan) => {
    const worker = getWorker(loan.workerId);
    const workerText = `${worker?.fullName || ""} ${worker?.employeeNumber || ""}`.toLowerCase();
    return (!workerQuery || workerText.includes(workerQuery))
      && (!statusQuery || loan.status === statusQuery);
  }).sort((a, b) => b.date.localeCompare(a.date));

  els.loansTable.innerHTML = rows.map((loan) => {
    const worker = getWorker(loan.workerId);
    return `
      <tr>
        <td>${esc(loan.date)}</td>
        <td>${worker ? `${esc(worker.employeeNumber)}<br /><strong>${esc(worker.fullName)}</strong>` : "Deleted worker"}</td>
        <td>${esc(loan.type)}</td>
        <td>${money(loan.amount)}</td>
        <td>${money(loan.monthlyDeduction)}</td>
        <td><strong>${money(loanBalance(loan))}</strong></td>
        <td><span class="status ${safeClass(loan.status, ["active", "closed"], "inactive")}">${esc(loan.status)}</span></td>
        <td>
          <div class="row-actions">
            <button type="button" data-edit-loan="${esc(loan.id)}">Edit</button>
            <button class="danger-button" type="button" data-delete-loan="${esc(loan.id)}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join("") || emptyRow(8, "No loans or advances recorded.");
}

function renderDashboard() {
  const todayCost = state.workRecords
    .filter((record) => record.date === todayIso)
    .reduce((sum, record) => sum + Number(record.total), 0);
  const accurateTodayCost = cents(todayCost);
  const monthPayroll = sumMoney(payrollForMonth(currentMonth), (row) => row.net);
  const monthCredits = sumMoney(creditsForMonth(currentMonth), (credit) => credit.amount);
  const monthLoans = sumMoney(state.loans, (loan) => loanDeductionForMonth(loan, currentMonth));

  els.metricActiveWorkers.textContent = activeWorkers().length;
  els.metricTodayCost.textContent = money(accurateTodayCost);
  els.metricMonthPayroll.textContent = money(monthPayroll);
  els.metricActiveRates.textContent = activeRates().length;
  els.metricMonthCredits.textContent = money(monthCredits);
  els.metricMonthLoans.textContent = money(monthLoans);

  els.recentWorkTable.innerHTML = [...state.workRecords]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)
    .map((record) => {
      const worker = getWorker(record.workerId);
      return `
        <tr>
          <td>${esc(record.date)}</td>
          <td>${esc(worker?.fullName || "Deleted worker")}</td>
          <td>${esc(record.workType)}</td>
          <td>${esc(record.quantity)}</td>
          <td>${money(record.total)}</td>
        </tr>
      `;
    }).join("") || emptyRow(5, "No recent work records.");

  const topPayroll = payrollForMonth(currentMonth)
    .sort((a, b) => b.net - a.net)
    .slice(0, 5);
  els.payrollSnapshot.innerHTML = topPayroll.map((row) => `
    <div class="summary-row">
      <span>${esc(row.worker.employeeNumber)} - ${esc(row.worker.fullName)}</span>
      <strong>${money(row.net)}</strong>
    </div>
  `).join("") || `<div class="summary-row"><span>No payroll for this month yet.</span></div>`;
}

function payrollForMonth(month) {
  return activeWorkers().map((worker) => {
    const workItems = state.workRecords.filter((record) => {
      return record.workerId === worker.id && record.date.startsWith(month);
    });
    const gross = sumMoney(workItems, (record) => record.total);
    const deductions = calculateDeductions(worker.id, month, gross);
    return {
      worker,
      workItems,
      gross,
      deductions,
      net: cents(Math.max(gross - deductions.total, 0)),
    };
  }).filter((row) => {
    return workerMatchesDepartment(row.worker, els.payrollDepartmentFilter.value)
      && (row.gross > 0 || row.deductions.total > 0);
  });
}

function calculateDeductions(workerId, month, gross) {
  const nssa = gross > 0 ? cents(gross * 0.035) : 0;
  const manual = cents(state.deductions
    .filter((item) => item.workerId === workerId && item.month === month)
    .reduce((sum, item) => sum + Number(item.amount), 0));
  const credits = sumMoney(creditsForWorkerMonth(workerId, month), (credit) => credit.amount);
  const loans = sumMoney(state.loans
    .filter((loan) => loan.workerId === workerId)
    .map((loan) => loanDeductionForMonth(loan, month)));
  return {
    nssa,
    manual,
    credits,
    loans,
    total: cents(nssa + manual + credits + loans),
  };
}

function loanDeductionForMonth(loan, month) {
  if (loan.status !== "active") return 0;
  if (monthIndex(month) < monthIndex(loan.startMonth)) return 0;
  const paidBefore = loanPaidBeforeMonth(loan, month);
  const remaining = Math.max(Number(loan.amount) - paidBefore, 0);
  return cents(Math.min(Number(loan.monthlyDeduction), remaining));
}

function loanPaidBeforeMonth(loan, month) {
  if (monthIndex(month) <= monthIndex(loan.startMonth)) return 0;
  const elapsedMonths = monthIndex(month) - monthIndex(loan.startMonth);
  return cents(Math.min(Number(loan.amount), elapsedMonths * Number(loan.monthlyDeduction)));
}

function loanBalance(loan) {
  const paidThroughCurrentMonth = loanPaidBeforeMonth(loan, currentMonth) + loanDeductionForMonth(loan, currentMonth);
  return cents(Math.max(Number(loan.amount) - paidThroughCurrentMonth, 0));
}

function creditsForMonth(month) {
  return state.credits.filter((credit) => credit.payrollMonth === month);
}

function creditsForWorkerMonth(workerId, month) {
  return state.credits.filter((credit) => {
    return credit.workerId === workerId && credit.payrollMonth === month;
  });
}

function renderPayroll() {
  const month = els.payrollMonth.value || currentMonth;
  const rows = payrollForMonth(month);
  els.payrollTable.innerHTML = rows.map((row) => `
    <tr>
      <td>${esc(row.worker.employeeNumber)}</td>
      <td>${esc(row.worker.fullName)}</td>
      <td>${money(row.gross)}</td>
      <td>${money(row.deductions.credits)}</td>
      <td>${money(row.deductions.loans)}</td>
      <td>${money(row.deductions.total)}</td>
      <td><strong>${money(row.net)}</strong></td>
      <td><button type="button" data-payslip="${esc(row.worker.id)}">View</button></td>
    </tr>
  `).join("") || emptyRow(8, "No payroll records for this month.");
}

function renderPayslip(workerId) {
  const month = els.payrollMonth.value || currentMonth;
  const row = payrollForMonth(month).find((item) => item.worker.id === workerId);
  if (!row) return;

  els.payslipPreview.innerHTML = `
    <article class="payslip">
      <div class="payslip-head">
        <div>
          ${safeImageDataUrl(state.settings.logoDataUrl) ? `<img class="payslip-logo" src="${esc(safeImageDataUrl(state.settings.logoDataUrl))}" alt="${esc(state.settings.farmName)} logo" />` : ""}
          <h3>${esc(state.settings.farmName || FARM_NAME)}</h3>
          <p>Monthly Payslip</p>
        </div>
        <div>
          <strong>Period</strong>
          <p>${esc(month)}</p>
        </div>
      </div>
      <div class="payslip-meta">
        <p><strong>Employee:</strong> ${esc(row.worker.fullName)}</p>
        <p><strong>Employee no.:</strong> ${esc(row.worker.employeeNumber)}</p>
        <p><strong>National ID:</strong> ${esc(row.worker.nationalId)}</p>
        <p><strong>Department:</strong> ${esc(row.worker.department)}</p>
        <p><strong>Position:</strong> ${esc(row.worker.position)}</p>
        <p><strong>Date employed:</strong> ${esc(row.worker.dateEmployed)}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Work</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${row.workItems.map((item) => `
            <tr>
              <td>${esc(item.date)}</td>
              <td>${esc(item.workType)}</td>
              <td>${esc(item.quantity)}</td>
              <td>${money(item.rate)}</td>
              <td>${money(item.total)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div class="payslip-total">
        <div><span>Gross pay</span><strong>${money(row.gross)}</strong></div>
        <div><span>NSSA</span><strong>${money(row.deductions.nssa)}</strong></div>
        <div><span>Grocery credits</span><strong>${money(row.deductions.credits)}</strong></div>
        <div><span>Loans / advances</span><strong>${money(row.deductions.loans)}</strong></div>
        <div><span>Other deductions</span><strong>${money(row.deductions.manual)}</strong></div>
        <div class="net-pay"><span>Net pay</span><strong>${money(row.net)}</strong></div>
      </div>
      ${row.deductions.credits > 0 ? `
        <h3>Credit Deductions</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Item</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${creditsForWorkerMonth(row.worker.id, month).map((credit) => `
              <tr>
                <td>${esc(credit.date)}</td>
                <td>${esc(credit.item)}</td>
                <td>${money(credit.amount)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      ` : ""}
    </article>
  `;
}

function renderReports() {
  const daily = groupBy(state.workRecords, "date").map(([date, records]) => ({
    label: date,
    value: records.reduce((sum, record) => sum + Number(record.total), 0),
  })).sort((a, b) => b.label.localeCompare(a.label));

  const productivity = state.workers.map((worker) => {
    const records = state.workRecords.filter((record) => record.workerId === worker.id);
    return {
      label: `${worker.employeeNumber} - ${worker.fullName}`,
      value: records.reduce((sum, record) => sum + Number(record.quantity), 0),
      total: records.reduce((sum, record) => sum + Number(record.total), 0),
    };
  }).filter((row) => row.value > 0).sort((a, b) => b.value - a.value);

  const expenses = groupBy(state.workRecords, "workType").map(([workType, records]) => ({
    label: workType,
    value: records.reduce((sum, record) => sum + Number(record.total), 0),
  })).sort((a, b) => b.value - a.value);
  const creditRows = groupBy(state.credits, "payrollMonth").map(([month, credits]) => ({
    label: month,
    value: credits.reduce((sum, credit) => sum + Number(credit.amount), 0),
  })).sort((a, b) => b.label.localeCompare(a.label));
  const groceryTotal = state.credits.reduce((sum, credit) => sum + Number(credit.amount), 0);
  const departmentRows = uniqueDepartments().map((department) => {
    const workers = state.workers.filter((worker) => worker.department === department);
    const total = state.workRecords
      .filter((record) => workers.some((worker) => worker.id === record.workerId))
      .reduce((sum, record) => sum + Number(record.total), 0);
    return { label: department, value: total };
  }).filter((row) => row.value > 0).sort((a, b) => b.value - a.value);
  const attendanceRows = groupBy(state.attendance, "status").map(([status, records]) => ({
    label: status,
    value: records.length,
  })).sort((a, b) => b.value - a.value);

  els.dailyReport.innerHTML = daily.map((row) => summaryRow(row.label, money(row.value))).join("") || emptySummary("No daily costs yet.");
  els.productivityReport.innerHTML = productivity.map((row) => summaryRow(row.label, `${row.value} units | ${money(row.total)}`)).join("") || emptySummary("No productivity records yet.");
  els.expensesReport.innerHTML = [
    ...expenses.map((row) => summaryRow(row.label, money(row.value))),
    groceryTotal > 0 ? summaryRow("Groceries issued on credit", money(groceryTotal)) : "",
  ].join("") || emptySummary("No expenses yet.");
  els.creditReport.innerHTML = creditRows.map((row) => summaryRow(row.label, money(row.value))).join("") || emptySummary("No credit deductions yet.");
  els.departmentReport.innerHTML = departmentRows.map((row) => summaryRow(row.label, money(row.value))).join("") || emptySummary("No department labor costs yet.");
  els.attendanceReport.innerHTML = attendanceRows.map((row) => summaryRow(row.label, `${row.value} records`)).join("") || emptySummary("No attendance records yet.");
}

function groupBy(items, key) {
  const map = new Map();
  items.forEach((item) => {
    const value = item[key];
    if (!map.has(value)) map.set(value, []);
    map.get(value).push(item);
  });
  return [...map.entries()];
}

function summaryRow(label, value) {
  return `<div class="summary-row"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;
}

function emptySummary(text) {
  return `<div class="summary-row"><span>${esc(text)}</span></div>`;
}

function emptyRow(colspan, text) {
  return `<tr><td colspan="${colspan}">${esc(text)}</td></tr>`;
}

function resetWorkerForm() {
  els.workerForm.reset();
  els.workerId.value = "";
  els.workerFormTitle.textContent = "Add Worker";
  els.workerDateEmployed.value = todayIso;
}

function resetRateForm() {
  els.rateForm.reset();
  els.rateId.value = "";
  els.rateFormTitle.textContent = "Add Work Rate";
}

function resetCreditForm() {
  els.creditForm.reset();
  els.creditId.value = "";
  els.creditDate.value = todayIso;
  els.creditMonth.value = currentMonth;
}

function resetAttendanceForm() {
  if (!els.attendanceForm) return;
  els.attendanceForm.reset();
  els.attendanceId.value = "";
  els.attendanceDate.value = todayIso;
  els.attendanceHours.value = 8;
}

function resetLoanForm() {
  els.loanForm.reset();
  els.loanId.value = "";
  els.loanDate.value = todayIso;
  els.loanStartMonth.value = currentMonth;
}

function renderAccounts() {
  els.accountsTable.innerHTML = state.users.map((user) => `
    <tr>
      <td>${esc(user.name)}</td>
      <td>${esc(user.username)}</td>
      <td>${roleLabel(user.role)}</td>
      <td><span class="status ${safeClass(user.status, ["active", "inactive"])}">${esc(user.status)}</span></td>
    </tr>
  `).join("") || emptyRow(4, "No user accounts created.");
}

function renderSettings() {
  els.settingsFarmName.value = state.settings.farmName || FARM_NAME;
  els.settingsCurrency.value = state.settings.currency || "USD";
  els.settingsFarmNamePreview.textContent = state.settings.farmName || FARM_NAME;
  els.settingsLogoPreview.innerHTML = state.settings.logoDataUrl
    ? `<img src="${esc(safeImageDataUrl(state.settings.logoDataUrl))}" alt="${esc(state.settings.farmName || FARM_NAME)} logo" />`
    : "No logo uploaded";
}

function syncSelectedRate() {
  const rate = getRate(els.workType.value);
  if (rate) {
    els.workRate.value = rate.amount;
  }
  syncWorkTotal();
}

function syncBulkSelectedRate() {
  const rate = getRate(els.bulkWorkType.value);
  if (rate) {
    els.bulkWorkRate.value = rate.amount;
  }
  els.bulkWorkTable.querySelectorAll("tr[data-bulk-worker]").forEach((row) => {
    const quantity = Number(row.querySelector(".bulk-work-qty")?.value || 0);
    row.querySelector(".bulk-work-total").textContent = money(cents(quantity * Number(els.bulkWorkRate.value || 0)));
  });
}

function syncWorkTotal() {
  const total = cents(Number(els.workQuantity.value || 0) * Number(els.workRate.value || 0));
  els.workTotal.value = money(total);
}

function seedData() {
  const workers = [
    ["EMP-0001", "Tariro Moyo", "63-123456A63", "0772 111 222", "Female", "Block A Compound", "Harvest", "Picker"],
    ["EMP-0002", "Blessing Ndlovu", "70-654321B70", "0713 444 555", "Male", "Village 4", "Irrigation", "Irrigator"],
    ["EMP-0003", "Memory Dube", "55-112233C55", "0788 777 888", "Female", "Farm Quarters", "Field Ops", "General Hand"],
  ].map(([employeeNumber, fullName, nationalId, phone, gender, address, department, position]) => ({
    id: id("worker"),
    employeeNumber,
    fullName,
    nationalId,
    phone,
    gender,
    address,
    department,
    position,
    dateEmployed: "2026-01-10",
    status: "active",
  }));

  const rates = [
    ["Harvesting tomatoes", "crate", 3],
    ["Weeding", "hectare", 10],
    ["Irrigation", "shift", 8],
    ["Planting", "bed", 4],
    ["Loading transport", "truck", 15],
  ].map(([workType, unit, amount]) => ({
    id: id("rate"),
    workType,
    unit,
    amount,
    status: "active",
  }));

  state.workers = workers;
  state.rates = rates;
  state.workRecords = [
    { id: id("work"), workerId: workers[0].id, date: todayIso, workType: rates[0].workType, quantity: 18, rate: 3, total: 54, comments: "Good output" },
    { id: id("work"), workerId: workers[1].id, date: todayIso, workType: rates[2].workType, quantity: 1, rate: 8, total: 8, comments: "Morning shift" },
    { id: id("work"), workerId: workers[2].id, date: `${currentMonth}-05`, workType: rates[1].workType, quantity: 2, rate: 10, total: 20, comments: "" },
  ];
  state.credits = [
    { id: id("credit"), workerId: workers[0].id, date: todayIso, payrollMonth: currentMonth, item: "Mealie meal", amount: 12, status: "pending", notes: "Grocery store issue" },
    { id: id("credit"), workerId: workers[2].id, date: `${currentMonth}-06`, payrollMonth: currentMonth, item: "Cooking oil and soap", amount: 9.5, status: "pending", notes: "" },
  ];
  state.creditItems = [
    { id: id("credit-item"), name: "Sugar", price: 2.25 },
    { id: id("credit-item"), name: "Rice", price: 4.5 },
    { id: id("credit-item"), name: "Cooking oil", price: 6.5 },
    { id: id("credit-item"), name: "Salt", price: 1 },
  ];
  state.attendance = [
    { id: id("attendance"), workerId: workers[0].id, date: todayIso, status: "present", hours: 8, notes: "" },
    { id: id("attendance"), workerId: workers[1].id, date: todayIso, status: "present", hours: 8, notes: "" },
    { id: id("attendance"), workerId: workers[2].id, date: `${currentMonth}-06`, status: "absent", hours: 0, notes: "Did not report" },
  ];
  state.loans = [
    { id: id("loan"), workerId: workers[1].id, date: todayIso, type: "cash advance", amount: 30, monthlyDeduction: 10, startMonth: currentMonth, status: "active", notes: "" },
  ];
  state.deductions = [];
  saveState();
  renderAll();
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadExcel(filename, rows) {
  const table = `
    <table>
      ${rows.map((row, index) => `
        <tr>${row.map((cell) => index === 0 ? `<th>${esc(cell)}</th>` : `<td>${esc(cell)}</td>`).join("")}</tr>
      `).join("")}
    </table>
  `;
  const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body>${table}</body></html>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

els.navButtons.forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

els.setupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  els.setupError.textContent = "";
  const password = els.setupPassword.value;
  if (password !== els.setupConfirmPassword.value) {
    els.setupError.textContent = "Passwords do not match.";
    return;
  }

  const username = normalizeUsername(els.setupUsername.value);
  try {
    const data = await apiPost(API_SETUP_URL, {
      name: els.setupName.value.trim(),
      username,
      password,
    });
    mergeState(data.state);
    currentUser = data.user;
    serverHasMainAdmin = true;
    saveCurrentUser(currentUser);
  } catch (error) {
    els.setupError.textContent = error.message;
    return;
  }
  els.setupForm.reset();
  els.setupError.textContent = "";
  setView("dashboard");
  markActivity();
  renderAll();
});

els.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  els.loginError.textContent = "";
  const username = els.loginUsername.value.trim().toLowerCase();
  const password = els.loginPassword.value;
  const selectedRole = els.loginRole.value;
  try {
    const data = await apiPost(API_LOGIN_URL, {
      username,
      password,
      role: selectedRole,
    });
    mergeState(data.state);
    currentUser = data.user;
    serverHasMainAdmin = true;
    saveCurrentUser(currentUser);
  } catch (error) {
    els.loginError.textContent = error.message;
    return;
  }
  els.loginForm.reset();
  els.loginError.textContent = "";
  setView(currentUser.role === "supervisor" ? "work-register" : "dashboard");
  markActivity();
  renderAll();
});

els.logoutBtn.addEventListener("click", async () => {
  await logout();
});

els.roleSelect.addEventListener("change", renderAll);
els.seedDataBtn.addEventListener("click", seedData);
els.selectiveResetBtn.addEventListener("click", async () => {
  const selected = [
    ["workers", els.resetWorkers.checked],
    ["rates", els.resetRates.checked],
    ["workRecords", els.resetWorkRecords.checked],
    ["attendance", els.resetAttendance.checked],
    ["credits", els.resetCredits.checked],
    ["creditItems", els.resetCreditItems.checked],
    ["loans", els.resetLoans.checked],
  ].filter(([, checked]) => checked).map(([key]) => key);
  if (!selected.length) {
    alert("Choose at least one data section to reset.");
    return;
  }
  if (!confirm(`Reset only these sections?\n\n${selected.join(", ")}`)) return;
  selected.forEach((key) => {
    state[key] = [];
  });
  if (selected.includes("workers")) {
    state.workRecords = [];
    state.attendance = [];
    state.credits = [];
    state.loans = [];
  }
  await saveState();
  [els.resetWorkers, els.resetRates, els.resetWorkRecords, els.resetAttendance, els.resetCredits, els.resetCreditItems, els.resetLoans].forEach((checkbox) => {
    checkbox.checked = false;
  });
  renderAll();
});

els.workerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const existing = state.workers.find((worker) => worker.id === els.workerId.value);
  const worker = {
    id: existing?.id || id("worker"),
    employeeNumber: existing?.employeeNumber || employeeNumber(),
    fullName: els.workerFullName.value.trim(),
    nationalId: els.workerNationalId.value.trim(),
    phone: els.workerPhone.value.trim(),
    gender: els.workerGender.value,
    address: els.workerAddress.value.trim(),
    department: els.workerDepartment.value.trim(),
    position: els.workerPosition.value.trim(),
    dateEmployed: els.workerDateEmployed.value,
    status: els.workerStatus.value,
  };
  if (existing) {
    Object.assign(existing, worker);
  } else {
    state.workers.push(worker);
  }
  await saveState();
  resetWorkerForm();
  renderAll();
});

els.workersTable.addEventListener("click", (event) => {
  const editId = event.target.dataset.editWorker;
  const deleteId = event.target.dataset.deleteWorker;
  if (editId) {
    const worker = getWorker(editId);
    els.workerId.value = worker.id;
    els.workerFullName.value = worker.fullName;
    els.workerNationalId.value = worker.nationalId;
    els.workerPhone.value = worker.phone;
    els.workerGender.value = worker.gender;
    els.workerAddress.value = worker.address;
    els.workerDepartment.value = worker.department;
    els.workerPosition.value = worker.position;
    els.workerDateEmployed.value = worker.dateEmployed;
    els.workerStatus.value = worker.status;
    els.workerFormTitle.textContent = "Edit Worker";
  }
  if (deleteId && confirm("Delete this worker? Historical records will keep the employee reference.")) {
    state.workers = state.workers.filter((worker) => worker.id !== deleteId);
    saveState();
    renderAll();
  }
});

els.cancelWorkerEdit.addEventListener("click", resetWorkerForm);
els.workerSearch.addEventListener("input", renderWorkers);
els.workerDepartmentFilter.addEventListener("change", renderWorkers);

els.attendanceForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const existing = state.attendance.find((record) => record.id === els.attendanceId.value);
  const record = {
    id: existing?.id || id("attendance"),
    workerId: els.attendanceWorker.value,
    date: els.attendanceDate.value,
    status: els.attendanceStatus.value,
    hours: Number(els.attendanceHours.value || 0),
    notes: els.attendanceNotes.value.trim(),
  };
  if (existing) {
    Object.assign(existing, record);
  } else {
    state.attendance.push(record);
  }
  saveState();
  resetAttendanceForm();
  renderAll();
});

els.attendanceTable.addEventListener("click", (event) => {
  const editId = event.target.dataset.editAttendance;
  const deleteId = event.target.dataset.deleteAttendance;
  if (editId && els.attendanceForm) {
    const record = state.attendance.find((item) => item.id === editId);
    els.attendanceId.value = record.id;
    els.attendanceWorker.value = record.workerId;
    els.attendanceDate.value = record.date;
    els.attendanceStatus.value = record.status;
    els.attendanceHours.value = record.hours;
    els.attendanceNotes.value = record.notes;
  }
  if (deleteId && confirm("Delete this attendance record?")) {
    state.attendance = state.attendance.filter((record) => record.id !== deleteId);
    saveState();
    renderAll();
  }
});

els.cancelAttendanceEdit?.addEventListener("click", resetAttendanceForm);
[els.attendanceFilterWorker, els.attendanceFilterMonth, els.attendanceFilterStatus].forEach((filter) => {
  filter.addEventListener("input", renderAttendance);
});

els.rateForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const existing = state.rates.find((rate) => rate.id === els.rateId.value);
  const rate = {
    id: existing?.id || id("rate"),
    workType: els.rateWorkType.value.trim(),
    unit: els.rateUnit.value.trim(),
    amount: Number(els.rateAmount.value),
    status: els.rateStatus.value,
  };
  if (existing) {
    Object.assign(existing, rate);
  } else {
    state.rates.push(rate);
  }
  saveState();
  resetRateForm();
  renderAll();
});

els.ratesTable.addEventListener("click", (event) => {
  const editId = event.target.dataset.editRate;
  const deleteId = event.target.dataset.deleteRate;
  if (editId) {
    const rate = getRate(editId);
    els.rateId.value = rate.id;
    els.rateWorkType.value = rate.workType;
    els.rateUnit.value = rate.unit;
    els.rateAmount.value = rate.amount;
    els.rateStatus.value = rate.status;
    els.rateFormTitle.textContent = "Edit Work Rate";
  }
  if (deleteId && confirm("Delete this rate? Existing work records will remain unchanged.")) {
    state.rates = state.rates.filter((rate) => rate.id !== deleteId);
    saveState();
    renderAll();
  }
});

els.cancelRateEdit.addEventListener("click", resetRateForm);

els.creditItemForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  state.creditItems.push({
    id: id("credit-item"),
    name: els.creditItemName.value.trim(),
    price: cents(Number(els.creditItemPrice.value || 0)),
  });
  await saveState();
  els.creditItemForm.reset();
  renderAll();
});

els.creditItemsTable.addEventListener("click", async (event) => {
  const deleteId = event.target.dataset.deleteCreditItem;
  if (deleteId && confirm("Delete this price-list item? Existing credit records will remain.")) {
    state.creditItems = state.creditItems.filter((item) => item.id !== deleteId);
    await saveState();
    renderAll();
  }
});

els.bulkCreditItemsTable.addEventListener("input", (event) => {
  const row = event.target.closest("tr[data-credit-item]");
  if (!row) return;
  const item = state.creditItems.find((entry) => entry.id === row.dataset.creditItem);
  const quantity = Number(row.querySelector(".bulk-credit-qty")?.value || 0);
  row.querySelector(".bulk-credit-total").textContent = money(cents(quantity * Number(item?.price || 0)));
});

els.bulkCreditForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const selectedItems = [];
  els.bulkCreditItemsTable.querySelectorAll("tr[data-credit-item]").forEach((row) => {
    if (!row.querySelector(".bulk-credit-take").checked) return;
    const item = state.creditItems.find((entry) => entry.id === row.dataset.creditItem);
    const quantity = Number(row.querySelector(".bulk-credit-qty").value || 0);
    if (!item || quantity <= 0) return;
    selectedItems.push({
      itemId: item.id,
      name: item.name,
      quantity,
      price: Number(item.price),
      total: cents(quantity * Number(item.price)),
    });
  });
  if (!selectedItems.length) {
    alert("Tick at least one item and enter its quantity.");
    return;
  }
  const amount = sumMoney(selectedItems, (item) => item.total);
  state.credits.push({
    id: id("credit"),
    workerId: els.bulkCreditWorker.value,
    date: els.bulkCreditDate.value,
    payrollMonth: els.bulkCreditMonth.value,
    item: selectedItems.map((item) => `${item.name} x ${item.quantity}`).join(", "),
    amount,
    status: els.bulkCreditStatus.value,
    notes: "Bulk item issue",
    items: selectedItems,
  });
  await saveState();
  renderAll();
});

els.creditForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const existing = state.credits.find((credit) => credit.id === els.creditId.value);
  const credit = {
    id: existing?.id || id("credit"),
    workerId: els.creditWorker.value,
    date: els.creditDate.value,
    payrollMonth: els.creditMonth.value,
    item: els.creditItem.value.trim(),
    amount: cents(Number(els.creditAmount.value)),
    status: els.creditStatus.value,
    notes: els.creditNotes.value.trim(),
  };
  if (existing) {
    Object.assign(existing, credit);
  } else {
    state.credits.push(credit);
  }
  saveState();
  resetCreditForm();
  renderAll();
});

els.creditsTable.addEventListener("click", (event) => {
  const editId = event.target.dataset.editCredit;
  const deleteId = event.target.dataset.deleteCredit;
  if (editId) {
    const credit = state.credits.find((item) => item.id === editId);
    els.creditId.value = credit.id;
    els.creditWorker.value = credit.workerId;
    els.creditDate.value = credit.date;
    els.creditMonth.value = credit.payrollMonth;
    els.creditItem.value = credit.item;
    els.creditAmount.value = credit.amount;
    els.creditStatus.value = credit.status;
    els.creditNotes.value = credit.notes;
  }
  if (deleteId && confirm("Delete this credit record? It will no longer be deducted from payroll.")) {
    state.credits = state.credits.filter((credit) => credit.id !== deleteId);
    saveState();
    renderAll();
  }
});

els.cancelCreditEdit.addEventListener("click", resetCreditForm);
[els.creditFilterWorker, els.creditFilterMonth, els.creditFilterStatus].forEach((filter) => {
  filter.addEventListener("input", renderCredits);
});

els.loanForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const existing = state.loans.find((loan) => loan.id === els.loanId.value);
  const loan = {
    id: existing?.id || id("loan"),
    workerId: els.loanWorker.value,
    date: els.loanDate.value,
    type: els.loanType.value,
    amount: Number(els.loanAmount.value),
    monthlyDeduction: Number(els.loanMonthlyDeduction.value),
    startMonth: els.loanStartMonth.value,
    status: els.loanStatus.value,
    notes: els.loanNotes.value.trim(),
  };
  if (existing) {
    Object.assign(existing, loan);
  } else {
    state.loans.push(loan);
  }
  saveState();
  resetLoanForm();
  renderAll();
});

els.loansTable.addEventListener("click", (event) => {
  const editId = event.target.dataset.editLoan;
  const deleteId = event.target.dataset.deleteLoan;
  if (editId) {
    const loan = state.loans.find((item) => item.id === editId);
    els.loanId.value = loan.id;
    els.loanWorker.value = loan.workerId;
    els.loanDate.value = loan.date;
    els.loanType.value = loan.type;
    els.loanAmount.value = loan.amount;
    els.loanMonthlyDeduction.value = loan.monthlyDeduction;
    els.loanStartMonth.value = loan.startMonth;
    els.loanStatus.value = loan.status;
    els.loanNotes.value = loan.notes;
  }
  if (deleteId && confirm("Delete this loan or advance? It will no longer be deducted from payroll.")) {
    state.loans = state.loans.filter((loan) => loan.id !== deleteId);
    saveState();
    renderAll();
  }
});

els.cancelLoanEdit.addEventListener("click", resetLoanForm);
[els.loanFilterWorker, els.loanFilterStatus].forEach((filter) => {
  filter.addEventListener("input", renderLoans);
});

els.accountForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  els.accountMessage.textContent = "";
  const username = normalizeUsername(els.accountUsername.value);
  if (state.users.some((user) => user.username === username)) {
    els.accountMessage.textContent = "That username is already in use.";
    return;
  }

  let newUser;
  try {
    const data = await apiPost(API_ACCOUNTS_URL, {
      name: els.accountName.value.trim(),
      username,
      password: els.accountPassword.value,
      role: els.accountRole.value,
    });
    mergeState(data.state);
    newUser = data.user;
  } catch (error) {
    els.accountMessage.textContent = error.message;
    return;
  }
  els.accountForm.reset();
  els.accountMessage.textContent = `${roleLabel(newUser.role)} account created.`;
  renderAll();
});

els.workType.addEventListener("change", syncSelectedRate);
els.workQuantity.addEventListener("input", syncWorkTotal);
els.workRate.addEventListener("input", syncWorkTotal);
els.bulkWorkType.addEventListener("change", () => {
  syncBulkSelectedRate();
  renderBulkWorkRegister();
});
els.bulkWorkRate.addEventListener("input", syncBulkSelectedRate);
els.bulkWorkForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const rate = getRate(els.bulkWorkType.value);
  const date = els.bulkWorkDate.value;
  const rateAmount = Number(els.bulkWorkRate.value || 0);
  const hours = Number(els.bulkWorkHours.value || 0);
  let saved = 0;
  els.bulkWorkTable.querySelectorAll("tr[data-bulk-worker]").forEach((row) => {
    const present = row.querySelector(".bulk-work-present").checked;
    const workerId = row.dataset.bulkWorker;
    const quantity = Number(row.querySelector(".bulk-work-qty").value || 0);
    const comments = row.querySelector(".bulk-work-comments").value.trim();
    if (!present) return;
    const existingAttendance = state.attendance.find((record) => record.workerId === workerId && record.date === date);
    const attendance = {
      id: existingAttendance?.id || id("attendance"),
      workerId,
      date,
      status: "present",
      hours,
      notes: comments,
    };
    if (existingAttendance) {
      Object.assign(existingAttendance, attendance);
    } else {
      state.attendance.push(attendance);
    }
    if (quantity > 0) {
      state.workRecords.push({
        id: id("work"),
        workerId,
        date,
        workType: rate?.workType || "Custom work",
        quantity,
        rate: rateAmount,
        total: cents(quantity * rateAmount),
        comments,
      });
    }
    saved += 1;
  });
  if (!saved) {
    alert("Tick at least one present worker.");
    return;
  }
  await saveState();
  renderAll();
});
els.workForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const rate = getRate(els.workType.value);
  const quantity = Number(els.workQuantity.value);
  const rateAmount = Number(els.workRate.value);
  state.workRecords.push({
    id: id("work"),
    workerId: els.workWorker.value,
    date: els.workDate.value,
    workType: rate?.workType || "Custom work",
    quantity,
    rate: rateAmount,
    total: cents(quantity * rateAmount),
    comments: els.workComments.value.trim(),
  });
  await saveState();
  els.workForm.reset();
  els.workDate.value = todayIso;
  renderAll();
});

[els.workFilterWorker, els.workFilterDate, els.workFilterType].forEach((filter) => {
  filter.addEventListener("input", renderWorkRecords);
});

els.payrollMonth.addEventListener("change", () => {
  renderPayroll();
  renderDashboard();
});
els.payrollDepartmentFilter.addEventListener("change", renderPayroll);
els.runPayrollBtn.addEventListener("click", renderPayroll);
els.payrollTable.addEventListener("click", (event) => {
  const workerId = event.target.dataset.payslip;
  if (workerId) renderPayslip(workerId);
});
els.printPayrollBtn.addEventListener("click", () => {
  document.querySelector("#payroll .panel").classList.add("print-target");
  window.print();
  document.querySelector("#payroll .panel").classList.remove("print-target");
});
els.printPayslipBtn.addEventListener("click", () => {
  els.payslipPanel.classList.add("print-target");
  window.print();
  els.payslipPanel.classList.remove("print-target");
});

els.settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.settings.farmName = els.settingsFarmName.value.trim() || FARM_NAME;
  state.settings.currency = els.settingsCurrency.value;
  const file = els.settingsLogo.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      state.settings.logoDataUrl = reader.result;
      saveState();
      renderAll();
      els.settingsLogo.value = "";
    };
    reader.readAsDataURL(file);
    return;
  }
  saveState();
  renderAll();
});

els.clearLogoBtn.addEventListener("click", () => {
  state.settings.logoDataUrl = "";
  saveState();
  renderAll();
});

document.querySelectorAll("[data-export]").forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.export;
    if (type === "daily") {
      downloadCsv("daily-labor-costs.csv", [["Date", "Total"], ...groupBy(state.workRecords, "date").map(([date, records]) => [date, records.reduce((sum, record) => sum + Number(record.total), 0)])]);
    }
    if (type === "productivity") {
      downloadCsv("worker-productivity.csv", [["Worker", "Quantity", "Total"], ...state.workers.map((worker) => {
        const records = state.workRecords.filter((record) => record.workerId === worker.id);
        return [`${worker.employeeNumber} - ${worker.fullName}`, records.reduce((sum, record) => sum + Number(record.quantity), 0), records.reduce((sum, record) => sum + Number(record.total), 0)];
      })]);
    }
    if (type === "expenses") {
      downloadCsv("farm-expenses.csv", [["Work Type", "Total"], ...groupBy(state.workRecords, "workType").map(([workType, records]) => [workType, records.reduce((sum, record) => sum + Number(record.total), 0)])]);
    }
    if (type === "credits") {
      downloadCsv("credit-deductions.csv", [["Date", "Payroll Month", "Worker", "Item", "Amount", "Status"], ...state.credits.map((credit) => {
        const worker = getWorker(credit.workerId);
        return [credit.date, credit.payrollMonth, worker ? `${worker.employeeNumber} - ${worker.fullName}` : "Deleted worker", credit.item, credit.amount, credit.status];
      })]);
    }
    if (type === "payroll-excel") {
      downloadExcel("monthly-payroll.xls", [["Employee No.", "Worker", "Department", "Gross", "Credits", "Loans", "Deductions", "Net"], ...payrollForMonth(els.payrollMonth.value || currentMonth).map((row) => [
        row.worker.employeeNumber,
        row.worker.fullName,
        row.worker.department,
        row.gross,
        row.deductions.credits,
        row.deductions.loans,
        row.deductions.total,
        row.net,
      ])]);
    }
    if (type === "attendance-excel") {
      downloadExcel("attendance-records.xls", [["Date", "Worker", "Status", "Hours", "Notes"], ...state.attendance.map((record) => {
        const worker = getWorker(record.workerId);
        return [record.date, worker ? `${worker.employeeNumber} - ${worker.fullName}` : "Deleted worker", record.status, record.hours, record.notes || ""];
      })]);
    }
    if (type === "credit-balances-excel") {
      downloadExcel("credit-balances.xls", [["Worker", "Outstanding Balance"], ...creditBalances().map((row) => [row.workerLabel, row.balance])]);
    }
    if (type === "loans-excel") {
      downloadExcel("loans-and-advances.xls", [["Date", "Worker", "Type", "Total", "Monthly Deduction", "Balance", "Status"], ...state.loans.map((loan) => {
        const worker = getWorker(loan.workerId);
        return [loan.date, worker ? `${worker.employeeNumber} - ${worker.fullName}` : "Deleted worker", loan.type, loan.amount, loan.monthlyDeduction, loanBalance(loan), loan.status];
      })]);
    }
    if (type === "department-excel") {
      downloadExcel("department-labor.xls", [["Department", "Labor Cost"], ...uniqueDepartments().map((department) => {
        const workers = state.workers.filter((worker) => worker.department === department);
        const total = state.workRecords
          .filter((record) => workers.some((worker) => worker.id === record.workerId))
          .reduce((sum, record) => sum + Number(record.total), 0);
        return [department, total];
      })]);
    }
    if (type === "attendance-summary-excel") {
      downloadExcel("attendance-summary.xls", [["Status", "Records"], ...groupBy(state.attendance, "status").map(([status, records]) => [status, records.length])]);
    }
  });
});

resetWorkerForm();
resetRateForm();
resetCreditForm();
resetAttendanceForm();
resetLoanForm();
initializeApp();

async function initializeApp() {
  try {
    const sessionResponse = await fetch(API_SESSION_URL, { cache: "no-store", credentials: "same-origin" });
    const sessionData = await sessionResponse.json();
    serverHasMainAdmin = Boolean(sessionData.hasMainAdmin);
    const browserSessionUser = loadCurrentUser();
    currentUser = sessionData.user && browserSessionUser ? sessionData.user : null;
    if (currentUser) {
      saveCurrentUser(currentUser);
    } else if (sessionData.user) {
      await apiPost(API_LOGOUT_URL).catch(() => {});
      clearCurrentUser();
    } else {
      clearCurrentUser();
    }
  } catch {
    currentUser = loadCurrentUser();
  }

  if (currentUser) {
    await syncFromServer();
  }
  const changed = migrateState();
  if (changed && currentUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    await syncToServer();
  }
  if (currentUser) {
    markActivity();
  }
  renderAll();
}
