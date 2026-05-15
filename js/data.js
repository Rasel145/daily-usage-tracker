// ─── DATA LAYER ───────────────────────────────────────────────

const DB = {
  get(key, def = null) {
    try { return JSON.parse(localStorage.getItem('dut_' + key)) ?? def; }
    catch { return def; }
  },
  set(key, val) {
    localStorage.setItem('dut_' + key, JSON.stringify(val));
  }
};

const CATEGORIES = [
  { id: 'food', label: 'Food', icon: '🍽️', color: '#f5a623' },
  { id: 'mobile', label: 'Mobile', icon: '📱', color: '#4d9fff' },
  { id: 'traveling', label: 'Traveling', icon: '🚌', color: '#9b59b6' },
  { id: 'medical', label: 'Medical', icon: '⚕️', color: '#ff4d6a' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#e91e63' },
  { id: 'study', label: 'Study', icon: '📚', color: '#00b8d4' },
  { id: 'study_materials', label: 'Study Materials', icon: '📖', color: '#00897b' },
  { id: 'friends', label: 'With Friends', icon: '👥', color: '#f39c12' },
  { id: 'donation', label: 'Donation', icon: '❤️', color: '#e74c3c' },
  { id: 'other', label: 'Other', icon: '📦', color: '#78909c' }
];

const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

function getCat(id) { return CAT_MAP[id] || { label: id, icon: '📦', color: '#78909c' }; }

function monthKey(y, m) { return `${y}-${String(m + 1).padStart(2, '0')}`; }
function nowKey() { const d = new Date(); return monthKey(d.getFullYear(), d.getMonth()); }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
function fmtMoney(n) { return 'BDT ' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 }); }
function fmtMoneyShort(n) { n = Number(n || 0); if (n >= 1000) return (n / 1000).toFixed(1) + 'k'; return n.toString(); }

// ─── STATE ────────────────────────────────────────────────────
const State = {
  get user() { return DB.get('user'); },
  set user(v) { DB.set('user', v); },
  get expenses() { return DB.get('expenses', []); },
  set expenses(v) { DB.set('expenses', v); },
  get incomes() { return DB.get('incomes', {}); },
  set incomes(v) { DB.set('incomes', v); },
  get savings() { return DB.get('savings', 0); },
  set savings(v) { DB.set('savings', v); },
  get credit() { return DB.get('credit', 0); },
  set credit(v) { DB.set('credit', v); },
  get lends() { return DB.get('lends', []); },
  set lends(v) { DB.set('lends', v); },
  get months_settled() { return DB.get('months_settled', []); },
  set months_settled(v) { DB.set('months_settled', v); },
  get notifications() { return DB.get('notifications', []); },
  set notifications(v) { DB.set('notifications', v); }
};

// ─── MONTHLY CALCULATIONS ─────────────────────────────────────
function getMonthExpenses(year, month) {
  const key = monthKey(year, month);
  return State.expenses.filter(e => e.monthKey === key);
}

function getMonthIncome(year, month) {
  const key = monthKey(year, month);
  return State.incomes[key] || 0;
}

function calcMonth(year, month) {
  const exps = getMonthExpenses(year, month);
  const totalCost = exps.reduce((s, e) => s + Number(e.amount), 0);
  const totalIncome = getMonthIncome(year, month);
  const net = totalIncome - totalCost;
  return { totalCost, totalIncome, net };
}

function settleMonth(year, month) {
  const key = monthKey(year, month);
  const settled = State.months_settled;
  if (settled.includes(key)) return;
  const { net } = calcMonth(year, month);
  if (net > 0) {
    State.savings = State.savings + net;
    showNotif('Month Settled', `+${fmtMoney(net)} added to Savings 🎉`, 'success');
  } else if (net < 0) {
    State.credit = State.credit + Math.abs(net);
    showNotif('Credit Alert!', `${fmtMoney(Math.abs(net))} added to Credit — over budget!`, 'danger');
    addStoredNotif('Credit Added', `${fmtMoney(Math.abs(net))} added to your credit for ${key}.`);
  } else {
    showNotif('Month Settled', 'Perfectly balanced!', 'info');
  }
  State.months_settled = [...settled, key];
  renderAll();
}

function addStoredNotif(title, msg) {
  const notifs = State.notifications;
  notifs.unshift({ id: Date.now(), title, msg, time: new Date().toISOString() });
  State.notifications = notifs.slice(0, 50);
}

// ─── CATEGORY BREAKDOWN ───────────────────────────────────────
function catBreakdown(expenses) {
  const map = {};
  expenses.forEach(e => {
    map[e.category] = (map[e.category] || 0) + Number(e.amount);
  });
  const total = Object.values(map).reduce((s, v) => s + v, 0);
  return CATEGORIES
    .filter(c => map[c.id])
    .map(c => ({ ...c, amount: map[c.id], pct: total ? Math.round(map[c.id] / total * 100) : 0 }))
    .sort((a, b) => b.amount - a.amount);
}

// ─── NOTIFICATIONS UI ─────────────────────────────────────────
const notifContainer = document.getElementById('notif-container');
function showNotif(title, msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `notif ${type}`;
  const icons = { success: '✅', danger: '🚨', info: 'ℹ️' };
  el.innerHTML = `<span class="notif-icon">${icons[type]}</span><div class="notif-body"><h4>${title}</h4><p>${msg}</p></div>`;
  notifContainer.appendChild(el);
  setTimeout(() => {
    el.classList.add('removing');
    setTimeout(() => el.remove(), 300);
  }, 4000);
}

// ─── PIE CHART SVG ────────────────────────────────────────────
function buildPie(breakdown, size = 140) {
  if (!breakdown.length) return '<div class="empty-state"><div class="empty-icon">📊</div><p>No expense data</p></div>';
  const total = breakdown.reduce((s, c) => s + c.amount, 0);
  const cx = size / 2, cy = size / 2, r = size / 2 - 6;
  let paths = '', startAngle = 0;
  breakdown.forEach(c => {
    const slice = (c.amount / total) * 2 * Math.PI;
    const end = startAngle + slice;
    const x1 = cx + r * Math.sin(startAngle), y1 = cy - r * Math.cos(startAngle);
    const x2 = cx + r * Math.sin(end), y2 = cy - r * Math.cos(end);
    const large = slice > Math.PI ? 1 : 0;
    paths += `<path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${c.color}" opacity="0.85"/>`;
    startAngle = end;
  });
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="border-radius:50%;flex-shrink:0">${paths}<circle cx="${cx}" cy="${cy}" r="${r * 0.4}" fill="var(--bg2)"/></svg>`;
}

// ─── EXPORT ───────────────────────────────────────────────────
function exportCSV(year, month) {
  const exps = getMonthExpenses(year, month);
  const rows = [['Date', 'Category', 'Amount', 'Notes']];
  exps.forEach(e => rows.push([e.date, getCat(e.category).label, e.amount, e.notes || '']));
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `expenses-${monthKey(year, month)}.csv`; a.click();
}

window.DB = DB; window.State = State; window.CATEGORIES = CATEGORIES; window.CAT_MAP = CAT_MAP;
window.getCat = getCat; window.monthKey = monthKey; window.nowKey = nowKey;
window.fmtDate = fmtDate; window.fmtMoney = fmtMoney; window.fmtMoneyShort = fmtMoneyShort;
window.getMonthExpenses = getMonthExpenses; window.getMonthIncome = getMonthIncome;
window.calcMonth = calcMonth; window.settleMonth = settleMonth;
window.catBreakdown = catBreakdown; window.showNotif = showNotif;
window.buildPie = buildPie; window.exportCSV = exportCSV;
