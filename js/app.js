// ─── DATA LAYER ──────────────────────────────────────────────────────────────

const DB = {
  get(key, def = []) {
    try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; }
  },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
  getObj(key, def = {}) {
    try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; }
  }
};

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'food',       label: 'Food & Dining',    icon: '🍽️',  color: '#f97316' },
  { id: 'mobile',     label: 'Mobile & Internet', icon: '📱',  color: '#06b6d4' },
  { id: 'traveling',  label: 'Traveling',         icon: '✈️',  color: '#8b5cf6' },
  { id: 'medical',    label: 'Medical',           icon: '🏥',  color: '#ef4444' },
  { id: 'shopping',   label: 'Shopping',          icon: '🛍️',  color: '#ec4899' },
  { id: 'study',      label: 'Study',             icon: '📚',  color: '#3b82f6' },
  { id: 'materials',  label: 'Study Materials',   icon: '📝',  color: '#14b8a6' },
  { id: 'friends',    label: 'With Friends',      icon: '👥',  color: '#a855f7' },
  { id: 'donation',   label: 'Donation',          icon: '❤️',  color: '#f43f5e' },
  { id: 'other',      label: 'Other',             icon: '💸',  color: '#64748b' }
];

function getCat(id) { return CATEGORIES.find(c => c.id === id) || CATEGORIES[9]; }

function fmtBDT(n) {
  n = Number(n) || 0;
  return '৳' + n.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function monthKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

function currentMonthKey() {
  const now = new Date();
  return monthKey(now.getFullYear(), now.getMonth());
}

// ─── STATE ────────────────────────────────────────────────────────────────────
let state = {
  user: DB.getObj('user', null),
  viewMonth: currentMonthKey(),
  reportMonth: currentMonthKey()
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
function notify(title, msg, type = 'info') {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const bar = document.getElementById('notifBar');
  const n = document.createElement('div');
  n.className = `notif ${type}`;
  n.innerHTML = `<span class="notif-icon">${icons[type]}</span>
    <div><div class="notif-title">${title}</div><div class="notif-msg">${msg}</div></div>`;
  bar.appendChild(n);
  setTimeout(() => n.remove(), 4500);
}

// ─── ROUTING ──────────────────────────────────────────────────────────────────
function navigate(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  const navItem = document.querySelector(`[data-page="${pageId}"]`);
  if (navItem) navItem.classList.add('active');
  document.getElementById('topbarTitle').textContent = {
    dashboard: 'Dashboard',
    expenses: 'Expense Tracker',
    income: 'Income Manager',
    savings: 'Savings & Credit',
    lend: 'Lend List',
    reports: 'Reports & Analytics',
    settings: 'Settings'
  }[pageId] || pageId;

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');

  renderPage(pageId);
}

function renderPage(id) {
  if (id === 'dashboard') renderDashboard();
  else if (id === 'expenses') renderExpenses();
  else if (id === 'income') renderIncome();
  else if (id === 'savings') renderSavings();
  else if (id === 'lend') renderLend();
  else if (id === 'reports') renderReports();
  else if (id === 'settings') renderSettings();
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function showLogin() {
  document.getElementById('appShell').style.display = 'none';
  document.getElementById('loginPage').style.display = 'flex';
}

function showApp() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('appShell').style.display = 'flex';
  updateUserUI();
  navigate('dashboard');
}

function doLogin() {
  const name = document.getElementById('loginName').value.trim();
  const email = document.getElementById('loginEmail').value.trim();
  if (!name || !email) { notify('Missing Info', 'Please enter your name and email.', 'error'); return; }
  const user = { name, email, role: 'Personal', joined: todayStr() };
  DB.set('user', user);
  state.user = user;
  notify('Welcome!', `Hello, ${name}! Your tracker is ready.`, 'success');
  showApp();
}

function doLogout() {
  state.user = null;
  showLogin();
}

function updateUserUI() {
  if (!state.user) return;
  document.getElementById('sidebarUserName').textContent = state.user.name;
  document.getElementById('sidebarUserRole').textContent = state.user.role;
  document.getElementById('sidebarUserAvatar').textContent = state.user.name.charAt(0).toUpperCase();
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function renderDashboard() {
  const mk = currentMonthKey();
  const expenses = DB.get('expenses').filter(e => e.date.startsWith(mk));
  const incomeData = DB.getObj('income');
  const monthIncome = incomeData[mk]?.amount || 0;
  const totalCost = expenses.reduce((s, e) => s + e.amount, 0);
  const net = monthIncome - totalCost;
  const savings = DB.get('savings');
  const credit = DB.get('credit');
  const totalSavings = savings.reduce((s, e) => s + e.amount, 0);
  const totalCredit = credit.reduce((s, e) => s + e.amount, 0);

  // Today expenses
  const todayExp = DB.get('expenses').filter(e => e.date === todayStr());
  const todayTotal = todayExp.reduce((s, e) => s + e.amount, 0);

  document.getElementById('dashStats').innerHTML = `
    <div class="stat-card blue">
      <div class="stat-label">Today's Spending</div>
      <div class="stat-value blue">${fmtBDT(todayTotal)}</div>
      <div class="stat-sub">${todayExp.length} transactions</div>
      <div class="stat-icon">💰</div>
    </div>
    <div class="stat-card purple">
      <div class="stat-label">Monthly Income</div>
      <div class="stat-value purple">${fmtBDT(monthIncome)}</div>
      <div class="stat-sub">${new Date().toLocaleString('en', {month:'long', year:'numeric'})}</div>
      <div class="stat-icon">💼</div>
    </div>
    <div class="stat-card red">
      <div class="stat-label">Monthly Expenses</div>
      <div class="stat-value red">${fmtBDT(totalCost)}</div>
      <div class="stat-sub">${expenses.length} entries this month</div>
      <div class="stat-icon">📊</div>
    </div>
    <div class="stat-card ${net >= 0 ? 'green' : 'red'}">
      <div class="stat-label">Net Balance</div>
      <div class="stat-value ${net >= 0 ? 'green' : 'red'}">${fmtBDT(Math.abs(net))}</div>
      <div class="stat-sub">${net >= 0 ? '▲ Surplus' : '▼ Deficit'}</div>
      <div class="stat-icon">${net >= 0 ? '📈' : '📉'}</div>
    </div>
    <div class="stat-card green">
      <div class="stat-label">Total Savings</div>
      <div class="stat-value green">${fmtBDT(totalSavings)}</div>
      <div class="stat-sub">Cumulative</div>
      <div class="stat-icon">🏦</div>
    </div>
    <div class="stat-card ${totalCredit > 0 ? 'red' : 'yellow'}">
      <div class="stat-label">Total Credit</div>
      <div class="stat-value ${totalCredit > 0 ? 'red' : 'yellow'}">${fmtBDT(totalCredit)}</div>
      <div class="stat-sub">Cumulative</div>
      <div class="stat-icon">💳</div>
    </div>
  `;

  // Today's expenses list
  const todayRows = todayExp.slice(-5).reverse().map(e => {
    const cat = getCat(e.category);
    return `<tr>
      <td><span style="color:${cat.color}">${cat.icon}</span> ${cat.label}</td>
      <td><span class="badge badge-red">${fmtBDT(e.amount)}</span></td>
      <td style="color:var(--text-muted)">${e.notes || '—'}</td>
    </tr>`;
  }).join('');

  document.getElementById('dashTodayList').innerHTML = todayExp.length ? `
    <table><thead><tr><th>Category</th><th>Amount</th><th>Notes</th></tr></thead>
    <tbody>${todayRows}</tbody></table>
  ` : `<div class="empty-state"><div class="empty-icon">🌟</div><p>No expenses logged today</p></div>`;

  // Category breakdown
  const catTotals = {};
  expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
  const catBars = CATEGORIES.filter(c => catTotals[c.id]).map(c => {
    const pct = totalCost ? (catTotals[c.id] / totalCost * 100).toFixed(1) : 0;
    return `<div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px">
        <span>${c.icon} ${c.label}</span>
        <span style="font-family:var(--mono);color:var(--text-dim)">${fmtBDT(catTotals[c.id])} <span style="color:var(--text-muted)">(${pct}%)</span></span>
      </div>
      <div class="progress-bar-wrap"><div class="progress-bar" style="width:${pct}%;background:${c.color}"></div></div>
    </div>`;
  }).join('');

  document.getElementById('dashCatBreakdown').innerHTML = catBars || `<div class="empty-state"><div class="empty-icon">📊</div><p>No expenses this month</p></div>`;
}

// ─── EXPENSES ─────────────────────────────────────────────────────────────────
function renderExpenses() {
  const [y, m] = state.viewMonth.split('-').map(Number);
  const monthLabel = new Date(y, m - 1, 1).toLocaleString('en', { month: 'long', year: 'numeric' });
  document.getElementById('expMonthLabel').textContent = monthLabel;

  const all = DB.get('expenses');
  const filtered = all.filter(e => e.date.startsWith(state.viewMonth));
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  document.getElementById('expTotal').textContent = fmtBDT(total);
  document.getElementById('expCount').textContent = `${filtered.length} entries`;

  const rows = filtered.slice().reverse().map(e => {
    const cat = getCat(e.category);
    return `<tr>
      <td>${fmtDate(e.date)}</td>
      <td><span style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:${cat.color}20;color:${cat.color}">${cat.icon} ${cat.label}</span></td>
      <td style="font-family:var(--mono);color:var(--danger);font-weight:600">${fmtBDT(e.amount)}</td>
      <td style="color:var(--text-muted)">${e.notes || '—'}</td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteExpense('${e.id}')">🗑</button></td>
    </tr>`;
  }).join('');

  document.getElementById('expTable').innerHTML = filtered.length ? rows :
    `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">💸</div><p>No expenses for this month</p></div></td></tr>`;
}

function addExpense() {
  const date = document.getElementById('expDate').value;
  const category = document.getElementById('expCategory').value;
  const amount = parseFloat(document.getElementById('expAmount').value);
  const notes = document.getElementById('expNotes').value.trim();

  if (!date || !category || !amount || amount <= 0) {
    notify('Invalid Entry', 'Please fill date, category and a valid amount.', 'error');
    return;
  }

  const expenses = DB.get('expenses');
  expenses.push({ id: Date.now().toString(), date, category, amount, notes, created: new Date().toISOString() });
  DB.set('expenses', expenses);
  notify('Expense Added', `${getCat(category).icon} ${fmtBDT(amount)} logged successfully.`, 'success');

  document.getElementById('expAmount').value = '';
  document.getElementById('expNotes').value = '';
  document.getElementById('expDate').value = todayStr();

  renderExpenses();
  renderDashboard();
}

function deleteExpense(id) {
  if (!confirm('Delete this expense?')) return;
  const filtered = DB.get('expenses').filter(e => e.id !== id);
  DB.set('expenses', filtered);
  notify('Deleted', 'Expense removed.', 'warning');
  renderExpenses();
  renderDashboard();
}

function changeExpMonth(dir) {
  const [y, m] = state.viewMonth.split('-').map(Number);
  const d = new Date(y, m - 1 + dir, 1);
  state.viewMonth = monthKey(d.getFullYear(), d.getMonth());
  renderExpenses();
}

// ─── INCOME ───────────────────────────────────────────────────────────────────
function renderIncome() {
  const incomeData = DB.getObj('income');
  const rows = Object.entries(incomeData).sort((a, b) => b[0].localeCompare(a[0])).map(([mk, v]) => {
    const [y, m] = mk.split('-').map(Number);
    const label = new Date(y, m - 1, 1).toLocaleString('en', { month: 'long', year: 'numeric' });
    return `<tr>
      <td>${label}</td>
      <td style="font-family:var(--mono);color:var(--accent3);font-weight:700">${fmtBDT(v.amount)}</td>
      <td style="color:var(--text-muted)">${v.notes || '—'}</td>
      <td>${fmtDate(v.date)}</td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteIncome('${mk}')">🗑</button></td>
    </tr>`;
  }).join('');

  document.getElementById('incomeTable').innerHTML = Object.keys(incomeData).length ? rows :
    `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">💼</div><p>No income entries yet</p></div></td></tr>`;

  // Set month field to current
  if (!document.getElementById('incMonth').value) {
    document.getElementById('incMonth').value = currentMonthKey();
  }
}

function addIncome() {
  const month = document.getElementById('incMonth').value;
  const amount = parseFloat(document.getElementById('incAmount').value);
  const notes = document.getElementById('incNotes').value.trim();

  if (!month || !amount || amount <= 0) {
    notify('Invalid', 'Please select a month and enter a valid amount.', 'error');
    return;
  }

  const incomeData = DB.getObj('income');
  incomeData[month] = { amount, notes, date: todayStr() };
  DB.set('income', incomeData);
  notify('Income Saved', `${fmtBDT(amount)} recorded for ${month}.`, 'success');

  document.getElementById('incAmount').value = '';
  document.getElementById('incNotes').value = '';
  renderIncome();
  renderDashboard();
}

function deleteIncome(mk) {
  if (!confirm('Delete this income record?')) return;
  const incomeData = DB.getObj('income');
  delete incomeData[mk];
  DB.set('income', incomeData);
  notify('Deleted', 'Income record removed.', 'warning');
  renderIncome();
  renderDashboard();
}

// ─── MONTH-END CALCULATION ────────────────────────────────────────────────────
function runMonthClose(mk) {
  const expenses = DB.get('expenses').filter(e => e.date.startsWith(mk));
  const incomeData = DB.getObj('income');
  const monthIncome = incomeData[mk]?.amount || 0;
  const totalCost = expenses.reduce((s, e) => s + e.amount, 0);
  const net = monthIncome - totalCost;

  const [y, m] = mk.split('-').map(Number);
  const label = new Date(y, m - 1, 1).toLocaleString('en', { month: 'long', year: 'numeric' });

  if (net > 0) {
    const savings = DB.get('savings');
    if (savings.find(s => s.month === mk)) {
      notify('Already Processed', `${label} has already been closed.`, 'warning');
      return;
    }
    savings.push({ id: Date.now().toString(), month: mk, amount: net, date: todayStr() });
    DB.set('savings', savings);
    notify('Month Closed ✅', `${label}: ${fmtBDT(net)} added to Savings!`, 'success');
  } else if (net < 0) {
    const credit = DB.get('credit');
    if (credit.find(c => c.month === mk)) {
      notify('Already Processed', `${label} has already been closed.`, 'warning');
      return;
    }
    credit.push({ id: Date.now().toString(), month: mk, amount: Math.abs(net), date: todayStr() });
    DB.set('credit', credit);
    notify('⚠️ Credit Added!', `${label}: ${fmtBDT(Math.abs(net))} deficit added to Credit. Review your spending!`, 'error');
  } else {
    notify('Balanced Month', `${label}: Income equals expenses. Nothing added.`, 'info');
  }

  renderSavings();
  renderDashboard();
}

// ─── SAVINGS & CREDIT ─────────────────────────────────────────────────────────
function renderSavings() {
  const savings = DB.get('savings');
  const credit = DB.get('credit');
  const totalSavings = savings.reduce((s, e) => s + e.amount, 0);
  const totalCredit = credit.reduce((s, e) => s + e.amount, 0);
  const netWorth = totalSavings - totalCredit;

  document.getElementById('savSummary').innerHTML = `
    <div class="stat-card green">
      <div class="stat-label">Total Savings</div>
      <div class="stat-value green">${fmtBDT(totalSavings)}</div>
      <div class="stat-sub">${savings.length} entries</div>
      <div class="stat-icon">🏦</div>
    </div>
    <div class="stat-card red">
      <div class="stat-label">Total Credit</div>
      <div class="stat-value red">${fmtBDT(totalCredit)}</div>
      <div class="stat-sub">${credit.length} entries</div>
      <div class="stat-icon">💳</div>
    </div>
    <div class="stat-card ${netWorth >= 0 ? 'blue' : 'red'}">
      <div class="stat-label">Net Worth</div>
      <div class="stat-value ${netWorth >= 0 ? 'blue' : 'red'}">${fmtBDT(Math.abs(netWorth))}</div>
      <div class="stat-sub">${netWorth >= 0 ? 'Positive' : 'Negative'}</div>
      <div class="stat-icon">⚖️</div>
    </div>
  `;

  const savRows = savings.slice().reverse().map(s => {
    const [y, m] = s.month.split('-').map(Number);
    const label = new Date(y, m - 1, 1).toLocaleString('en', { month: 'long', year: 'numeric' });
    return `<tr>
      <td>${label}</td>
      <td style="color:var(--accent3);font-family:var(--mono);font-weight:700">${fmtBDT(s.amount)}</td>
      <td>${fmtDate(s.date)}</td>
    </tr>`;
  }).join('');

  const credRows = credit.slice().reverse().map(c => {
    const [y, m] = c.month.split('-').map(Number);
    const label = new Date(y, m - 1, 1).toLocaleString('en', { month: 'long', year: 'numeric' });
    return `<tr>
      <td>${label}</td>
      <td style="color:var(--danger);font-family:var(--mono);font-weight:700">${fmtBDT(c.amount)}</td>
      <td>${fmtDate(c.date)}</td>
    </tr>`;
  }).join('');

  document.getElementById('savTable').innerHTML = savings.length ? savRows :
    `<tr><td colspan="3"><div class="empty-state"><div class="empty-icon">🏦</div><p>No savings yet</p></div></td></tr>`;
  document.getElementById('credTable').innerHTML = credit.length ? credRows :
    `<tr><td colspan="3"><div class="empty-state"><div class="empty-icon">💳</div><p>No credit entries</p></div></td></tr>`;

  // Month close buttons
  const incomeData = DB.getObj('income');
  const months = [...new Set([...DB.get('expenses').map(e => e.date.slice(0, 7)), ...Object.keys(incomeData)])].sort().reverse();
  const closedSavings = savings.map(s => s.month);
  const closedCredit = credit.map(c => c.month);

  const closeOptions = months.map(mk => {
    const [y, m] = mk.split('-').map(Number);
    const label = new Date(y, m - 1, 1).toLocaleString('en', { month: 'long', year: 'numeric' });
    const closed = closedSavings.includes(mk) || closedCredit.includes(mk);
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--surface2);border-radius:var(--radius-sm);border:1px solid var(--border);margin-bottom:10px">
      <span style="font-size:14px;font-weight:600">${label}</span>
      ${closed ? '<span class="badge badge-green">✅ Processed</span>' : `<button class="btn btn-primary btn-sm" onclick="runMonthClose('${mk}')">Close Month</button>`}
    </div>`;
  }).join('');

  document.getElementById('monthCloseList').innerHTML = closeOptions || `<div class="empty-state"><div class="empty-icon">📅</div><p>No months to process</p></div>`;
}

// ─── LEND LIST ────────────────────────────────────────────────────────────────
function renderLend() {
  const lends = DB.get('lends');
  const total = lends.reduce((s, l) => s + l.amount, 0);
  const pending = lends.filter(l => l.status === 'pending');
  const pendingTotal = pending.reduce((s, l) => s + l.amount, 0);

  document.getElementById('lendStats').innerHTML = `
    <div class="stat-card blue">
      <div class="stat-label">Total Lent</div>
      <div class="stat-value blue">${fmtBDT(total)}</div>
      <div class="stat-sub">${lends.length} records</div>
      <div class="stat-icon">🤝</div>
    </div>
    <div class="stat-card yellow">
      <div class="stat-label">Pending Returns</div>
      <div class="stat-value yellow">${fmtBDT(pendingTotal)}</div>
      <div class="stat-sub">${pending.length} pending</div>
      <div class="stat-icon">⏳</div>
    </div>
    <div class="stat-card green">
      <div class="stat-label">Returned</div>
      <div class="stat-value green">${fmtBDT(total - pendingTotal)}</div>
      <div class="stat-sub">${lends.length - pending.length} returned</div>
      <div class="stat-icon">✅</div>
    </div>
  `;

  const rows = lends.slice().reverse().map(l => {
    const statusBadge = l.status === 'returned' ?
      `<span class="badge badge-green">✅ Returned</span>` :
      `<span class="badge badge-yellow">⏳ Pending</span>`;
    const toggleBtn = l.status === 'pending' ?
      `<button class="btn btn-success btn-sm" onclick="toggleLend('${l.id}')">Mark Returned</button>` :
      `<button class="btn btn-ghost btn-sm" onclick="toggleLend('${l.id}')">Mark Pending</button>`;
    return `<tr>
      <td>${l.person}</td>
      <td style="font-family:var(--mono);color:var(--warning);font-weight:600">${fmtBDT(l.amount)}</td>
      <td>${fmtDate(l.date)}</td>
      <td>${l.notes || '—'}</td>
      <td>${statusBadge}</td>
      <td style="display:flex;gap:6px;align-items:center">
        ${toggleBtn}
        <button class="btn btn-danger btn-sm" onclick="deleteLend('${l.id}')">🗑</button>
      </td>
    </tr>`;
  }).join('');

  document.getElementById('lendTable').innerHTML = lends.length ? rows :
    `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">🤝</div><p>No lending records</p></div></td></tr>`;
}

function addLend() {
  const person = document.getElementById('lendPerson').value.trim();
  const amount = parseFloat(document.getElementById('lendAmount').value);
  const date = document.getElementById('lendDate').value;
  const notes = document.getElementById('lendNotes').value.trim();

  if (!person || !amount || !date) {
    notify('Invalid', 'Please fill person name, amount and date.', 'error');
    return;
  }

  const lends = DB.get('lends');
  lends.push({ id: Date.now().toString(), person, amount, date, notes, status: 'pending' });
  DB.set('lends', lends);
  notify('Lend Recorded', `${fmtBDT(amount)} lent to ${person}.`, 'success');

  document.getElementById('lendPerson').value = '';
  document.getElementById('lendAmount').value = '';
  document.getElementById('lendNotes').value = '';
  renderLend();
}

function toggleLend(id) {
  const lends = DB.get('lends');
  const l = lends.find(x => x.id === id);
  if (l) {
    l.status = l.status === 'pending' ? 'returned' : 'pending';
    if (l.status === 'returned') notify('Returned', `${l.person} returned ${fmtBDT(l.amount)}.`, 'success');
  }
  DB.set('lends', lends);
  renderLend();
}

function deleteLend(id) {
  if (!confirm('Delete this lending record?')) return;
  DB.set('lends', DB.get('lends').filter(l => l.id !== id));
  notify('Deleted', 'Lending record removed.', 'warning');
  renderLend();
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────
let chartInst = null;

function renderReports() {
  const [y, m] = state.reportMonth.split('-').map(Number);
  const label = new Date(y, m - 1, 1).toLocaleString('en', { month: 'long', year: 'numeric' });
  document.getElementById('rptMonthLabel').textContent = label;

  const expenses = DB.get('expenses').filter(e => e.date.startsWith(state.reportMonth));
  const incomeData = DB.getObj('income');
  const monthIncome = incomeData[state.reportMonth]?.amount || 0;
  const totalCost = expenses.reduce((s, e) => s + e.amount, 0);
  const net = monthIncome - totalCost;
  const savings = DB.get('savings');
  const credit = DB.get('credit');
  const totalSavings = savings.reduce((s, e) => s + e.amount, 0);
  const totalCredit = credit.reduce((s, e) => s + e.amount, 0);

  document.getElementById('rptSummary').innerHTML = `
    <div class="stat-card purple">
      <div class="stat-label">Monthly Income</div>
      <div class="stat-value purple">${fmtBDT(monthIncome)}</div>
      <div class="stat-icon">💼</div>
    </div>
    <div class="stat-card red">
      <div class="stat-label">Total Expenses</div>
      <div class="stat-value red">${fmtBDT(totalCost)}</div>
      <div class="stat-icon">📊</div>
    </div>
    <div class="stat-card ${net >= 0 ? 'green' : 'red'}">
      <div class="stat-label">Net Result</div>
      <div class="stat-value ${net >= 0 ? 'green' : 'red'}">${net >= 0 ? '+' : '-'}${fmtBDT(Math.abs(net))}</div>
      <div class="stat-icon">${net >= 0 ? '📈' : '📉'}</div>
    </div>
    <div class="stat-card green">
      <div class="stat-label">Cumulative Savings</div>
      <div class="stat-value green">${fmtBDT(totalSavings)}</div>
      <div class="stat-icon">🏦</div>
    </div>
    <div class="stat-card red">
      <div class="stat-label">Cumulative Credit</div>
      <div class="stat-value red">${fmtBDT(totalCredit)}</div>
      <div class="stat-icon">💳</div>
    </div>
  `;

  // Category breakdown
  const catTotals = {};
  expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
  const catData = CATEGORIES.filter(c => catTotals[c.id]);

  const catRows = catData.map(c => {
    const pct = totalCost ? (catTotals[c.id] / totalCost * 100).toFixed(1) : 0;
    return `<tr>
      <td><span style="color:${c.color}">${c.icon}</span> ${c.label}</td>
      <td style="font-family:var(--mono);font-weight:700;color:var(--danger)">${fmtBDT(catTotals[c.id])}</td>
      <td><span class="badge" style="background:${c.color}20;color:${c.color}">${pct}%</span></td>
    </tr>`;
  }).join('');

  document.getElementById('rptCatTable').innerHTML = catData.length ? catRows :
    `<tr><td colspan="3"><div class="empty-state"><div class="empty-icon">📊</div><p>No data for this month</p></div></td></tr>`;

  // Draw chart
  if (chartInst) { chartInst.destroy(); chartInst = null; }
  if (catData.length) {
    const ctx = document.getElementById('rptChart').getContext('2d');
    chartInst = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: catData.map(c => c.label),
        datasets: [{
          data: catData.map(c => catTotals[c.id]),
          backgroundColor: catData.map(c => c.color + 'cc'),
          borderColor: catData.map(c => c.color),
          borderWidth: 2,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: '#94a3b8', padding: 14, font: { family: 'Sora', size: 12 } } },
          tooltip: {
            callbacks: {
              label(ctx) { return ` ৳${ctx.parsed.toLocaleString()}`; }
            }
          }
        },
        cutout: '60%'
      }
    });
  }

  // Monthly trend (last 6 months)
  const trend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1);
    const mk = monthKey(d.getFullYear(), d.getMonth());
    const mExp = DB.get('expenses').filter(e => e.date.startsWith(mk));
    const mInc = (DB.getObj('income')[mk]?.amount) || 0;
    trend.push({ label: d.toLocaleString('en', { month: 'short' }), income: mInc, expenses: mExp.reduce((s, e) => s + e.amount, 0) });
  }

  const trendRows = trend.map(t => `
    <tr>
      <td>${t.label}</td>
      <td style="color:var(--accent3);font-family:var(--mono)">${fmtBDT(t.income)}</td>
      <td style="color:var(--danger);font-family:var(--mono)">${fmtBDT(t.expenses)}</td>
      <td style="color:${t.income - t.expenses >= 0 ? 'var(--accent3)' : 'var(--danger)'};font-family:var(--mono);font-weight:700">
        ${t.income - t.expenses >= 0 ? '+' : ''}${fmtBDT(t.income - t.expenses)}
      </td>
    </tr>
  `).join('');

  document.getElementById('rptTrendTable').innerHTML = trendRows;
}

function changeRptMonth(dir) {
  const [y, m] = state.reportMonth.split('-').map(Number);
  const d = new Date(y, m - 1 + dir, 1);
  state.reportMonth = monthKey(d.getFullYear(), d.getMonth());
  renderReports();
}

function exportReport() {
  const [y, m] = state.reportMonth.split('-').map(Number);
  const label = new Date(y, m - 1, 1).toLocaleString('en', { month: 'long', year: 'numeric' });
  const expenses = DB.get('expenses').filter(e => e.date.startsWith(state.reportMonth));
  const incomeData = DB.getObj('income');
  const monthIncome = incomeData[state.reportMonth]?.amount || 0;
  const totalCost = expenses.reduce((s, e) => s + e.amount, 0);
  const net = monthIncome - totalCost;

  let csv = `Daily Usage Tracker - ${label}\n\nSUMMARY\nIncome,${monthIncome}\nTotal Expenses,${totalCost}\nNet Result,${net}\n\nEXPENSES\nDate,Category,Amount,Notes\n`;
  expenses.forEach(e => {
    csv += `${e.date},${getCat(e.category).label},${e.amount},"${e.notes || ''}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `report-${state.reportMonth}.csv`;
  a.click(); URL.revokeObjectURL(url);
  notify('Exported', 'CSV report downloaded.', 'success');
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function renderSettings() {
  if (!state.user) return;
  document.getElementById('settName').value = state.user.name || '';
  document.getElementById('settEmail').value = state.user.email || '';
  document.getElementById('settRole').value = state.user.role || '';
}

function saveSettings() {
  const name = document.getElementById('settName').value.trim();
  const email = document.getElementById('settEmail').value.trim();
  const role = document.getElementById('settRole').value.trim();
  if (!name || !email) { notify('Invalid', 'Name and email required.', 'error'); return; }
  state.user = { ...state.user, name, email, role };
  DB.set('user', state.user);
  updateUserUI();
  notify('Saved', 'Profile updated successfully.', 'success');
}

function clearAllData() {
  if (!confirm('⚠️ This will delete ALL data permanently. Are you sure?')) return;
  if (!confirm('Last chance! All expenses, income, savings and lends will be erased.')) return;
  ['expenses','income','savings','credit','lends'].forEach(k => localStorage.removeItem(k));
  notify('Cleared', 'All data has been reset.', 'warning');
  renderDashboard();
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Set today's date on relevant inputs
  document.querySelectorAll('input[type=date]').forEach(i => { if (!i.value) i.value = todayStr(); });

  // Mobile toggle
  document.getElementById('mobileToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Overlay close
  document.getElementById('sidebarOverlay').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
  });

  // Check login
  const user = DB.getObj('user', null);
  if (user && user.name) {
    state.user = user;
    showApp();
  } else {
    showLogin();
  }
});
