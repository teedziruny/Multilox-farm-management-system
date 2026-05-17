const STORAGE_KEY = "farm-management-mvp-state";
const SESSION_KEY = "farm-management-mvp-user";
const API_STATE_URL = "/api/state";
const FARM_NAME = "Multilox";

const todayIso = new Date().toISOString().slice(0, 10);
const currentMonth = todayIso.slice(0, 7);

const state = loadState();
let currentUser = loadCurrentUser();

const els = {
  appShell: document.getElementById("appShell"),
  loginScreen: document.getElementById("loginScreen"),
  loginForm: document.getElementById("loginForm"),
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
  clearDataBtn: document.getElementById("clearDataBtn"),
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
  cancelWorkerEdit: document.getElementById("cancelWorkerEdit"),
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
  recentWorkTable: document.getElementById("recentWorkTable"),
  metricActiveWorkers: document.getElementById("metricActiveWorkers"),
  metricTodayCost: document.getElementById("metricTodayCost"),
  metricMonthPayroll: document.getElementById("metricMonthPayroll"),
  metricActiveRates: document.getElementById("metricActiveRates"),
  metricMonthCredits: document.getElementById("metricMonthCredits"),
  payrollSnapshot: document.getElementById("payrollSnapshot"),
  payrollMonth: document.getElementById("payrollMonth"),
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
  cancelCreditEdit: document.getElementById("cancelCreditEdit"),
  creditFilterWorker: document.getElementById("creditFilterWorker"),
  creditFilterMonth: document.getElementById("creditFilterMonth"),
  creditFilterStatus: document.getElementById("creditFilterStatus"),
  creditsTable: document.getElementById("creditsTable"),
  creditReport: document.getElementById("creditReport"),
  accountForm: document.getElementById("accountForm"),
  accountName: document.getElementById("accountName"),
  accountUsername: document.getElementById("accountUsername"),
  accountPassword: document.getElementById("accountPassword"),
  accountRole: document.getElementById("accountRole"),
  accountMessage: document.getElementById("accountMessage"),
  accountsTable: document.getElementById("accountsTable"),
};

els.workDate.value = todayIso;
els.payrollMonth.value = currentMonth;
els.creditDate.value = todayIso;
els.creditMonth.value = currentMonth;

function loadState() {
  const fallback = { workers: [], rates: [], workRecords: [], deductions: [], credits: [], users: [] };
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
      users: loaded.users || [],
    };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  syncToServer();
}

async function syncFromServer() {
  try {
    const response = await fetch(API_STATE_URL, { cache: "no-store" });
    if (!response.ok) return;
    const serverState = await response.json();
    mergeState(serverState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    currentUser = loadCurrentUser();
    renderAll();
  } catch {
    // Opening index.html directly still works as a single-device fallback.
  }
}

async function syncToServer() {
  try {
    await fetch(API_STATE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
  } catch {
    // If the API is unavailable, local storage keeps the MVP usable on this device.
  }
}

function mergeState(nextState) {
  const fallback = { workers: [], rates: [], workRecords: [], deductions: [], credits: [], users: [] };
  Object.assign(state, {
    ...fallback,
    ...nextState,
    workers: nextState.workers || [],
    rates: nextState.rates || [],
    workRecords: nextState.workRecords || [],
    deductions: nextState.deductions || [],
    credits: nextState.credits || [],
    users: nextState.users || [],
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

function saveCurrentUser(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearCurrentUser() {
  sessionStorage.removeItem(SESSION_KEY);
}

function hashPassword(password) {
  let hash = 5381;
  for (let index = 0; index < password.length; index += 1) {
    hash = ((hash << 5) + hash) + password.charCodeAt(index);
    hash &= 0xffffffff;
  }
  return String(hash >>> 0);
}

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

function hasAdminAccount() {
  return state.users.some((user) => user.role === "admin" && user.status === "active");
}

function id(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function money(value) {
  return Number(value || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });
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
  renderWorkers();
  renderRates();
  renderWorkOptions();
  renderCreditOptions();
  renderWorkRecords();
  renderCredits();
  renderPayroll();
  renderDashboard();
  renderReports();
  renderAccounts();
}

function renderAuth() {
  const needsSetup = !hasAdminAccount();
  const isLoggedIn = Boolean(currentUser);
  els.loginScreen.classList.toggle("app-hidden", isLoggedIn);
  els.loginForm.classList.toggle("app-hidden", needsSetup || isLoggedIn);
  els.setupForm.classList.toggle("app-hidden", !needsSetup || isLoggedIn);
  els.appShell.classList.toggle("app-hidden", !isLoggedIn);
  if (!isLoggedIn) return;

  els.currentUserLabel.textContent = currentUser.name;
  els.roleSelect.value = currentUser.role;
  els.roleSelect.disabled = true;
}

function renderRoleAccess() {
  const role = currentUser?.role || els.roleSelect.value;
  const isSupervisor = role === "supervisor";
  document.querySelector('[data-view="rates"]').classList.toggle("hidden-for-role", isSupervisor);
  document.querySelector('[data-view="credits"]').classList.toggle("hidden-for-role", isSupervisor);
  document.querySelector('[data-view="payroll"]').classList.toggle("hidden-for-role", isSupervisor);
  document.querySelector('[data-view="reports"]').classList.toggle("hidden-for-role", isSupervisor);
  document.querySelector('[data-view="accounts"]').classList.toggle("hidden-for-role", isSupervisor);
  els.seedDataBtn.disabled = isSupervisor;
  els.clearDataBtn.disabled = isSupervisor;
  if (isSupervisor && ["rates", "credits", "payroll", "reports", "accounts"].includes(document.querySelector(".view.active")?.id)) {
    setView("work-register");
  }
}

function renderWorkers() {
  const query = els.workerSearch.value.trim().toLowerCase();
  const workers = state.workers.filter((worker) => {
    return [worker.employeeNumber, worker.fullName, worker.department, worker.position, worker.nationalId]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  els.workersTable.innerHTML = workers.map((worker) => `
    <tr>
      <td>${worker.employeeNumber}</td>
      <td>
        <strong>${worker.fullName}</strong><br />
        <span>${worker.phone || "No phone"}</span>
      </td>
      <td>${worker.department}<br /><span>${worker.position}</span></td>
      <td><span class="status ${worker.status}">${worker.status}</span></td>
      <td>
        <div class="row-actions">
          <button type="button" data-edit-worker="${worker.id}">Edit</button>
          <button class="danger-button" type="button" data-delete-worker="${worker.id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("") || emptyRow(5, "No workers found.");
}

function renderRates() {
  els.ratesTable.innerHTML = state.rates.map((rate) => `
    <tr>
      <td>${rate.workType}</td>
      <td>${rate.unit}</td>
      <td>${money(rate.amount)}</td>
      <td><span class="status ${rate.status}">${rate.status}</span></td>
      <td>
        <div class="row-actions">
          <button type="button" data-edit-rate="${rate.id}">Edit</button>
          <button class="danger-button" type="button" data-delete-rate="${rate.id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("") || emptyRow(5, "No rates configured.");
}

function renderWorkOptions() {
  els.workWorker.innerHTML = activeWorkers().map((worker) => `
    <option value="${worker.id}">${worker.employeeNumber} - ${worker.fullName}</option>
  `).join("");

  const activeRateOptions = activeRates().map((rate) => `
    <option value="${rate.id}">${rate.workType} (${money(rate.amount)} / ${rate.unit})</option>
  `).join("");
  els.workType.innerHTML = activeRateOptions;
  els.workFilterType.innerHTML = `<option value="">All work types</option>${state.rates.map((rate) => `
    <option value="${rate.workType}">${rate.workType}</option>
  `).join("")}`;

  syncSelectedRate();
}

function renderCreditOptions() {
  els.creditWorker.innerHTML = activeWorkers().map((worker) => `
    <option value="${worker.id}">${worker.employeeNumber} - ${worker.fullName}</option>
  `).join("");
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
        <td>${record.date}</td>
        <td>${worker ? `${worker.employeeNumber}<br /><strong>${worker.fullName}</strong>` : "Deleted worker"}</td>
        <td>${record.workType}</td>
        <td>${record.quantity}</td>
        <td>${money(record.rate)}</td>
        <td><strong>${money(record.total)}</strong></td>
      </tr>
    `;
  }).join("") || emptyRow(6, "No work records match this filter.");
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
        <td>${credit.date}</td>
        <td>${worker ? `${worker.employeeNumber}<br /><strong>${worker.fullName}</strong>` : "Deleted worker"}</td>
        <td>${credit.item}<br /><span>${credit.notes || ""}</span></td>
        <td>${credit.payrollMonth}</td>
        <td><strong>${money(credit.amount)}</strong></td>
        <td><span class="status ${credit.status === "deducted" ? "active" : "inactive"}">${credit.status}</span></td>
        <td>
          <div class="row-actions">
            <button type="button" data-edit-credit="${credit.id}">Edit</button>
            <button class="danger-button" type="button" data-delete-credit="${credit.id}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join("") || emptyRow(7, "No grocery credits recorded.");
}

function renderDashboard() {
  const todayCost = state.workRecords
    .filter((record) => record.date === todayIso)
    .reduce((sum, record) => sum + Number(record.total), 0);
  const monthPayroll = payrollForMonth(currentMonth).reduce((sum, row) => sum + row.net, 0);
  const monthCredits = creditsForMonth(currentMonth).reduce((sum, credit) => sum + Number(credit.amount), 0);

  els.metricActiveWorkers.textContent = activeWorkers().length;
  els.metricTodayCost.textContent = money(todayCost);
  els.metricMonthPayroll.textContent = money(monthPayroll);
  els.metricActiveRates.textContent = activeRates().length;
  els.metricMonthCredits.textContent = money(monthCredits);

  els.recentWorkTable.innerHTML = [...state.workRecords]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)
    .map((record) => {
      const worker = getWorker(record.workerId);
      return `
        <tr>
          <td>${record.date}</td>
          <td>${worker?.fullName || "Deleted worker"}</td>
          <td>${record.workType}</td>
          <td>${record.quantity}</td>
          <td>${money(record.total)}</td>
        </tr>
      `;
    }).join("") || emptyRow(5, "No recent work records.");

  const topPayroll = payrollForMonth(currentMonth)
    .sort((a, b) => b.net - a.net)
    .slice(0, 5);
  els.payrollSnapshot.innerHTML = topPayroll.map((row) => `
    <div class="summary-row">
      <span>${row.worker.employeeNumber} - ${row.worker.fullName}</span>
      <strong>${money(row.net)}</strong>
    </div>
  `).join("") || `<div class="summary-row"><span>No payroll for this month yet.</span></div>`;
}

function payrollForMonth(month) {
  return activeWorkers().map((worker) => {
    const workItems = state.workRecords.filter((record) => {
      return record.workerId === worker.id && record.date.startsWith(month);
    });
    const gross = workItems.reduce((sum, record) => sum + Number(record.total), 0);
    const deductions = calculateDeductions(worker.id, month, gross);
    return {
      worker,
      workItems,
      gross,
      deductions,
      net: Math.max(gross - deductions.total, 0),
    };
  }).filter((row) => row.gross > 0 || row.deductions.total > 0);
}

function calculateDeductions(workerId, month, gross) {
  const nssa = gross > 0 ? gross * 0.035 : 0;
  const manual = state.deductions
    .filter((item) => item.workerId === workerId && item.month === month)
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const credits = creditsForWorkerMonth(workerId, month)
    .reduce((sum, credit) => sum + Number(credit.amount), 0);
  return {
    nssa,
    manual,
    credits,
    total: nssa + manual + credits,
  };
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
      <td>${row.worker.employeeNumber}</td>
      <td>${row.worker.fullName}</td>
      <td>${money(row.gross)}</td>
      <td>${money(row.deductions.credits)}</td>
      <td>${money(row.deductions.total)}</td>
      <td><strong>${money(row.net)}</strong></td>
      <td><button type="button" data-payslip="${row.worker.id}">View</button></td>
    </tr>
  `).join("") || emptyRow(7, "No payroll records for this month.");
}

function renderPayslip(workerId) {
  const month = els.payrollMonth.value || currentMonth;
  const row = payrollForMonth(month).find((item) => item.worker.id === workerId);
  if (!row) return;

  els.payslipPreview.innerHTML = `
    <article class="payslip">
      <div class="payslip-head">
        <div>
          <h3>${FARM_NAME}</h3>
          <p>Monthly Payslip</p>
        </div>
        <div>
          <strong>Period</strong>
          <p>${month}</p>
        </div>
      </div>
      <div class="payslip-meta">
        <p><strong>Employee:</strong> ${row.worker.fullName}</p>
        <p><strong>Employee no.:</strong> ${row.worker.employeeNumber}</p>
        <p><strong>National ID:</strong> ${row.worker.nationalId}</p>
        <p><strong>Department:</strong> ${row.worker.department}</p>
        <p><strong>Position:</strong> ${row.worker.position}</p>
        <p><strong>Date employed:</strong> ${row.worker.dateEmployed}</p>
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
              <td>${item.date}</td>
              <td>${item.workType}</td>
              <td>${item.quantity}</td>
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
                <td>${credit.date}</td>
                <td>${credit.item}</td>
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

  els.dailyReport.innerHTML = daily.map((row) => summaryRow(row.label, money(row.value))).join("") || emptySummary("No daily costs yet.");
  els.productivityReport.innerHTML = productivity.map((row) => summaryRow(row.label, `${row.value} units | ${money(row.total)}`)).join("") || emptySummary("No productivity records yet.");
  els.expensesReport.innerHTML = [
    ...expenses.map((row) => summaryRow(row.label, money(row.value))),
    groceryTotal > 0 ? summaryRow("Groceries issued on credit", money(groceryTotal)) : "",
  ].join("") || emptySummary("No expenses yet.");
  els.creditReport.innerHTML = creditRows.map((row) => summaryRow(row.label, money(row.value))).join("") || emptySummary("No credit deductions yet.");
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
  return `<div class="summary-row"><span>${label}</span><strong>${value}</strong></div>`;
}

function emptySummary(text) {
  return `<div class="summary-row"><span>${text}</span></div>`;
}

function emptyRow(colspan, text) {
  return `<tr><td colspan="${colspan}">${text}</td></tr>`;
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

function renderAccounts() {
  els.accountsTable.innerHTML = state.users.map((user) => `
    <tr>
      <td>${user.name}</td>
      <td>${user.username}</td>
      <td>${user.role}</td>
      <td><span class="status ${user.status}">${user.status}</span></td>
    </tr>
  `).join("") || emptyRow(4, "No user accounts created.");
}

function syncSelectedRate() {
  const rate = getRate(els.workType.value);
  if (rate) {
    els.workRate.value = rate.amount;
  }
  syncWorkTotal();
}

function syncWorkTotal() {
  const total = Number(els.workQuantity.value || 0) * Number(els.workRate.value || 0);
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

els.navButtons.forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

els.setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const password = els.setupPassword.value;
  if (password !== els.setupConfirmPassword.value) {
    els.setupError.textContent = "Passwords do not match.";
    return;
  }

  const username = normalizeUsername(els.setupUsername.value);
  if (state.users.some((user) => user.username === username)) {
    els.setupError.textContent = "That username is already in use.";
    return;
  }
  state.users.push({
    id: id("user"),
    name: els.setupName.value.trim(),
    username,
    passwordHash: hashPassword(password),
    role: "admin",
    status: "active",
    createdAt: new Date().toISOString(),
  });
  saveState();
  els.setupForm.reset();
  els.setupError.textContent = "";
  renderAll();
});

els.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = els.loginUsername.value.trim().toLowerCase();
  const password = els.loginPassword.value;
  const user = state.users.find((candidate) => {
    return candidate.username === username
      && candidate.passwordHash === hashPassword(password)
      && candidate.status === "active";
  });

  if (!user) {
    els.loginError.textContent = "Invalid username or password.";
    return;
  }

  currentUser = { id: user.id, role: user.role, name: user.name, username: user.username };
  saveCurrentUser(currentUser);
  els.loginForm.reset();
  els.loginError.textContent = "";
  setView(user.role === "supervisor" ? "work-register" : "dashboard");
  renderAll();
});

els.logoutBtn.addEventListener("click", () => {
  currentUser = null;
  clearCurrentUser();
  setView("dashboard");
  renderAll();
});

els.roleSelect.addEventListener("change", renderAll);
els.seedDataBtn.addEventListener("click", seedData);
els.clearDataBtn.addEventListener("click", () => {
  if (!confirm("Reset all farm management MVP data?")) return;
  state.workers = [];
  state.rates = [];
  state.workRecords = [];
  state.credits = [];
  state.deductions = [];
  saveState();
  renderAll();
});

els.workerForm.addEventListener("submit", (event) => {
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
  saveState();
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

els.creditForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const existing = state.credits.find((credit) => credit.id === els.creditId.value);
  const credit = {
    id: existing?.id || id("credit"),
    workerId: els.creditWorker.value,
    date: els.creditDate.value,
    payrollMonth: els.creditMonth.value,
    item: els.creditItem.value.trim(),
    amount: Number(els.creditAmount.value),
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

els.accountForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = normalizeUsername(els.accountUsername.value);
  if (state.users.some((user) => user.username === username)) {
    els.accountMessage.textContent = "That username is already in use.";
    return;
  }

  state.users.push({
    id: id("user"),
    name: els.accountName.value.trim(),
    username,
    passwordHash: hashPassword(els.accountPassword.value),
    role: els.accountRole.value,
    status: "active",
    createdAt: new Date().toISOString(),
  });
  saveState();
  els.accountForm.reset();
  els.accountMessage.textContent = "Account created.";
  renderAccounts();
});

els.workType.addEventListener("change", syncSelectedRate);
els.workQuantity.addEventListener("input", syncWorkTotal);
els.workRate.addEventListener("input", syncWorkTotal);
els.workForm.addEventListener("submit", (event) => {
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
    total: quantity * rateAmount,
    comments: els.workComments.value.trim(),
  });
  saveState();
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
  });
});

resetWorkerForm();
resetRateForm();
resetCreditForm();
renderAll();
syncFromServer();
