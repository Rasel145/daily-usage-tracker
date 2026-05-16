/* ═══════════════════════════════════════════════════════════════
   DAILY USAGE TRACKER v3.0 — app.js
   MySQL Backend via PHP REST API
   Features: Auth, Dark/Light, EN/BN, House Rent category,
             Expenses, Income, Savings/Credit, Lend, Reports,
             CSV + Excel + PDF exports
═══════════════════════════════════════════════════════════════ */

// ── API BASE URL ──────────────────────────────────────────────
// XAMPP ব্যবহার করলে: http://localhost/tracker-full/api
// Live server হলে: https://yourdomain.com/api
const API_BASE = './api';

// ── TRANSLATIONS ──────────────────────────────────────────────
const LANG = {
  en: {
    appName:'Daily Usage Tracker',appTagline:'Smart personal finance management',
    appShortName:'Daily Tracker',financeManager:'Finance Manager',
    tabLogin:'Sign In',tabRegister:'Create Account',
    emailLabel:'Email Address',passwordLabel:'Password',nameLabel:'Full Name',
    confirmPassword:'Confirm Password',btnLogin:'Sign In →',btnRegister:'Create Account →',
    noAccount:"Don't have an account?",createOne:'Create one',
    haveAccount:'Already have an account?',signIn:'Sign in',
    localStorageNote:'🔒 Secured with MySQL database',
    emailPh:'your@email.com',passwordPh:'Enter your password',
    newPasswordPh:'Min 6 characters',confirmPasswordPh:'Repeat password',
    namePh:'Your full name',optionalNote:'Brief description…',
    incomeNote:'e.g. Salary, Freelance…',personNamePh:'Who did you lend to?',
    rolePh:'e.g. Personal, Student…',
    navMain:'Main',navDashboard:'Dashboard',navExpenses:'Expenses',navIncome:'Income',
    navFinance:'Finance',navSavings:'Savings & Credit',navLend:'Lend List',
    navInsights:'Insights',navReports:'Reports',navSystem:'System',navSettings:'Settings',
    signOut:'Sign Out',todayExpenses:"Today's Expenses",monthlyBreakdown:'Monthly Breakdown',
    addExpense:'+ Add',addExpenseTitle:'Add Expense',addExpenseBtn:'💸 Add Expense',
    date:'Date',category:'Category',amount:'Amount',notes:'Notes',
    selectCategory:'Select category…',expenseHistory:'Expense History',
    recordIncome:'Record Monthly Income',month:'Month',incomeAmount:'Income Amount (BDT)',
    saveIncomeBtn:'💼 Save Income',incomeHistory:'Income History',recordedOn:'Recorded On',
    monthEndProcess:'Month-End Processing',
    monthEndDesc:'Close a month to calculate net result and update Savings or Credit.',
    savingsHistory:'Savings History',creditHistory:'Credit History',
    added:'Amount Added',deficit:'Deficit',
    addLendRecord:'Add Lending Record',personName:'Person Name',dateLent:'Date Lent',
    recordLendBtn:'🤝 Record Lend',lendingRecords:'Lending Records',
    person:'Person',status:'Status',actions:'Actions',
    monthlyReport:'Monthly Report',categoryBreakdown:'Category Breakdown',
    byCategory:'By Category',sixMonthTrend:'6-Month Trend',
    income:'Income',expenses:'Expenses',net:'Net',
    profileSettings:'Profile Settings',appInfo:'App Information',
    version:'Version',currency:'Currency',storage:'Storage',
    dbStorage:'MySQL Database',categoriesCount:'Categories',
    dangerZone:'⚠️ Danger Zone',clearDesc:'This will permanently delete all your data.',
    clearBtn:'🗑 Clear All Data',saveProfile:'💾 Save Profile',
    roleLabel:'Role / Label',dbGuideTitle:'Database Setup Guide (বাংলা)',
    todaySpending:"Today's Spending",monthlyIncome:'Monthly Income',
    monthlyExpenses:'Monthly Expenses',netBalance:'Net Balance',
    totalSavings:'Total Savings',totalCredit:'Total Credit',
    transactions:'transaction(s)',entries:'entries',cumulative:'Cumulative',
    surplus:'▲ Surplus',deficit2:'▼ Deficit',totalLent:'Total Lent',
    pendingReturns:'Pending Returns',returned:'Returned',pending:'pending',records:'records',
    closeMonth:'Close Month',processed:'✅ Processed',
    netWorth:'Net Worth',positive:'Positive',negative:'Negative',
    loading:'Loading…',noData:'No data for this month',
    noExpensesToday:'No expenses logged today',noExpensesMonth:'No expenses for this month',
    noIncomeYet:'No income entries yet',noMonths:'No months to process yet',
    noSavings:'No savings yet',noCredit:'No credit entries',
    noLends:'No lending records',
  },
  bn: {
    appName:'দৈনিক ব্যয় ট্র্যাকার',appTagline:'স্মার্ট ব্যক্তিগত অর্থ ব্যবস্থাপনা',
    appShortName:'দৈনিক ট্র্যাকার',financeManager:'অর্থ ব্যবস্থাপক',
    tabLogin:'সাইন ইন',tabRegister:'অ্যাকাউন্ট তৈরি করুন',
    emailLabel:'ইমেইল ঠিকানা',passwordLabel:'পাসওয়ার্ড',nameLabel:'পূর্ণ নাম',
    confirmPassword:'পাসওয়ার্ড নিশ্চিত করুন',btnLogin:'সাইন ইন →',btnRegister:'অ্যাকাউন্ট তৈরি →',
    noAccount:'অ্যাকাউন্ট নেই?',createOne:'তৈরি করুন',
    haveAccount:'ইতিমধ্যে অ্যাকাউন্ট আছে?',signIn:'সাইন ইন',
    localStorageNote:'🔒 MySQL ডেটাবেসে সুরক্ষিত',
    emailPh:'আপনার@ইমেইল.কম',passwordPh:'পাসওয়ার্ড লিখুন',
    newPasswordPh:'কমপক্ষে ৬ অক্ষর',confirmPasswordPh:'পাসওয়ার্ড পুনরায় দিন',
    namePh:'আপনার পূর্ণ নাম',optionalNote:'সংক্ষিপ্ত বিবরণ…',
    incomeNote:'যেমন: বেতন, ফ্রিল্যান্স…',personNamePh:'কাকে ধার দিয়েছেন?',
    rolePh:'যেমন: ব্যক্তিগত, ছাত্র…',
    navMain:'প্রধান',navDashboard:'ড্যাশবোর্ড',navExpenses:'খরচ',navIncome:'আয়',
    navFinance:'অর্থ',navSavings:'সঞ্চয় ও ক্রেডিট',navLend:'ধার তালিকা',
    navInsights:'বিশ্লেষণ',navReports:'রিপোর্ট',navSystem:'সিস্টেম',navSettings:'সেটিংস',
    signOut:'সাইন আউট',todayExpenses:'আজকের খরচ',monthlyBreakdown:'মাসিক বিভাজন',
    addExpense:'+ যোগ',addExpenseTitle:'খরচ যোগ করুন',addExpenseBtn:'💸 খরচ যোগ',
    date:'তারিখ',category:'বিভাগ',amount:'পরিমাণ',notes:'নোট',
    selectCategory:'বিভাগ নির্বাচন করুন…',expenseHistory:'খরচের ইতিহাস',
    recordIncome:'মাসিক আয় রেকর্ড করুন',month:'মাস',incomeAmount:'আয়ের পরিমাণ (BDT)',
    saveIncomeBtn:'💼 আয় সংরক্ষণ',incomeHistory:'আয়ের ইতিহাস',recordedOn:'রেকর্ডের তারিখ',
    monthEndProcess:'মাস শেষের হিসাব',
    monthEndDesc:'নেট ফলাফল হিসাব করতে মাস বন্ধ করুন।',
    savingsHistory:'সঞ্চয়ের ইতিহাস',creditHistory:'ক্রেডিটের ইতিহাস',
    added:'যোগ করা হয়েছে',deficit:'ঘাটতি',
    addLendRecord:'ধার রেকর্ড যোগ',personName:'ব্যক্তির নাম',dateLent:'ধারের তারিখ',
    recordLendBtn:'🤝 ধার রেকর্ড',lendingRecords:'ধারের রেকর্ড',
    person:'ব্যক্তি',status:'অবস্থা',actions:'কার্যক্রম',
    monthlyReport:'মাসিক রিপোর্ট',categoryBreakdown:'বিভাগ অনুযায়ী বিভাজন',
    byCategory:'বিভাগ অনুযায়ী',sixMonthTrend:'৬ মাসের ধারা',
    income:'আয়',expenses:'খরচ',net:'নেট',
    profileSettings:'প্রোফাইল সেটিংস',appInfo:'অ্যাপ তথ্য',
    version:'ভার্সন',currency:'মুদ্রা',storage:'সংরক্ষণ',
    dbStorage:'MySQL ডেটাবেস',categoriesCount:'বিভাগ',
    dangerZone:'⚠️ বিপদ অঞ্চল',clearDesc:'এটি সকল ডেটা মুছে ফেলবে।',
    clearBtn:'🗑 সব ডেটা মুছুন',saveProfile:'💾 প্রোফাইল সংরক্ষণ',
    roleLabel:'পরিচয়',dbGuideTitle:'ডেটাবেস সেটআপ গাইড',
    todaySpending:'আজকের খরচ',monthlyIncome:'মাসিক আয়',
    monthlyExpenses:'মাসিক খরচ',netBalance:'নেট ব্যালেন্স',
    totalSavings:'মোট সঞ্চয়',totalCredit:'মোট ক্রেডিট',
    transactions:'লেনদেন',entries:'এন্ট্রি',cumulative:'সঞ্চিত',
    surplus:'▲ উদ্বৃত্ত',deficit2:'▼ ঘাটতি',totalLent:'মোট ধার',
    pendingReturns:'পেন্ডিং রিটার্ন',returned:'ফিরে এসেছে',pending:'পেন্ডিং',records:'রেকর্ড',
    closeMonth:'মাস বন্ধ করুন',processed:'✅ প্রক্রিয়াকৃত',
    netWorth:'নেট মূল্য',positive:'ধনাত্মক',negative:'ঋণাত্মক',
    loading:'লোড হচ্ছে…',noData:'এই মাসে কোনো ডেটা নেই',
    noExpensesToday:'আজ কোনো খরচ নেই',noExpensesMonth:'এই মাসে কোনো খরচ নেই',
    noIncomeYet:'কোনো আয় এন্ট্রি নেই',noMonths:'প্রক্রিয়া করার মাস নেই',
    noSavings:'কোনো সঞ্চয় নেই',noCredit:'কোনো ক্রেডিট নেই',
    noLends:'কোনো ধারের রেকর্ড নেই',
  }
};

// ── CATEGORIES (with House Rent added) ─────────────────────
const CATEGORIES = [
  {id:'food',       label:'Food & Dining',    labelBn:'খাবার',            icon:'🍽️',color:'#f97316'},
  {id:'house_rent', label:'House Rent',       labelBn:'বাড়ি ভাড়া',      icon:'🏠',color:'#0ea5e9'},
  {id:'mobile',     label:'Mobile & Internet',labelBn:'মোবাইল ও ইন্টারনেট',icon:'📱',color:'#06b6d4'},
  {id:'traveling',  label:'Traveling',        labelBn:'ভ্রমণ',            icon:'✈️',color:'#8b5cf6'},
  {id:'medical',    label:'Medical',          labelBn:'চিকিৎসা',          icon:'🏥',color:'#ef4444'},
  {id:'shopping',   label:'Shopping',         labelBn:'কেনাকাটা',         icon:'🛍️',color:'#ec4899'},
  {id:'study',      label:'Study',            labelBn:'পড়াশোনা',         icon:'📚',color:'#3b82f6'},
  {id:'materials',  label:'Study Materials',  labelBn:'পড়ার সামগ্রী',    icon:'📝',color:'#14b8a6'},
  {id:'friends',    label:'With Friends',     labelBn:'বন্ধুদের সাথে',    icon:'👥',color:'#a855f7'},
  {id:'donation',   label:'Donation',         labelBn:'দান',              icon:'❤️',color:'#f43f5e'},
  {id:'other',      label:'Other',            labelBn:'অন্যান্য',         icon:'💸',color:'#64748b'}
];

// ── HELPERS ───────────────────────────────────────────────
const fmtBDT  = n => '৳'+(Number(n)||0).toLocaleString('en-BD',{minimumFractionDigits:0,maximumFractionDigits:0});
const fmtDate = s => { const d=new Date(s); return isNaN(d)?s:d.toLocaleDateString('en-BD',{day:'2-digit',month:'short',year:'numeric'}); };
const todayStr= () => new Date().toISOString().slice(0,10);
const monthKey= (y,m) => `${y}-${String(m+1).padStart(2,'0')}`;
const curMK   = () => { const n=new Date(); return monthKey(n.getFullYear(),n.getMonth()); };
const $       = id => document.getElementById(id);
const v       = id => $(id)?.value||'';
const sv      = (id,val) => { const el=$(id); if(el) el.value=val; };
const getCat  = id => CATEGORIES.find(c=>c.id===id)||CATEGORIES[CATEGORIES.length-1];
const getCatLabel = id => { const c=getCat(id); return curLang==='bn'?c.labelBn:c.label; };

// ── STATE ─────────────────────────────────────────────────
let state     = { token:null, user:null, viewMonth:curMK(), rptMonth:curMK() };
let curLang   = localStorage.getItem('lang')||'en';
let chartInst = null;

// ═══ API LAYER ════════════════════════════════════════════
async function api(endpoint, method='GET', body=null, params={}) {
  const url = new URL(API_BASE + '/' + endpoint, location.href);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k,v));
  const opts = {
    method,
    headers: { 'Content-Type':'application/json' }
  };
  if (state.token) opts.headers['Authorization'] = 'Bearer ' + state.token;
  if (body) opts.body = JSON.stringify(body);
  try {
    const res  = await fetch(url.toString(), opts);
    const json = await res.json();
    return json;
  } catch(e) {
    return { success:false, message:'Network error: '+e.message };
  }
}

// ═══ LANGUAGE ════════════════════════════════════════════
function t(k){ return LANG[curLang]?.[k]||LANG.en[k]||k; }
function applyLang(){
  document.querySelectorAll('[data-t]').forEach(el=>{
    const txt=t(el.getAttribute('data-t'));
    if(txt) el.textContent=txt;
  });
  document.querySelectorAll('[data-ph]').forEach(el=>{
    const ph=t(el.getAttribute('data-ph'));
    if(ph) el.placeholder=ph;
  });
  const lb=$('langToggle');
  if(lb) lb.textContent=curLang==='en'?'বাং':'ENG';
  updateCatOptions();
}
function toggleLang(){ curLang=curLang==='en'?'bn':'en'; localStorage.setItem('lang',curLang); applyLang(); }
function updateCatOptions(){
  const sel=$('eCat'); if(!sel) return;
  const cur=sel.value;
  sel.innerHTML=`<option value="">${t('selectCategory')}</option>`+
    CATEGORIES.map(c=>`<option value="${c.id}">${c.icon} ${curLang==='bn'?c.labelBn:c.label}</option>`).join('');
  sel.value=cur;
}

// ═══ THEME ═══════════════════════════════════════════════
function initTheme(){ applyTheme(localStorage.getItem('theme')||'dark'); }
function applyTheme(m){ document.body.classList.toggle('light',m==='light'); localStorage.setItem('theme',m); const b=$('themeToggle'); if(b) b.textContent=m==='light'?'🌙':'☀️'; }
function toggleTheme(){ applyTheme(document.body.classList.contains('light')?'dark':'light'); }

// ═══ NOTIFY ══════════════════════════════════════════════
function notify(title,msg,type='info'){
  const icons={success:'✅',error:'❌',warning:'⚠️',info:'ℹ️'};
  const n=document.createElement('div');
  n.className=`notif ${type}`;
  n.innerHTML=`<span class="notif-icon">${icons[type]}</span><div><div class="notif-title">${title}</div><div class="notif-msg">${msg}</div></div>`;
  $('notifBar').appendChild(n);
  setTimeout(()=>n.remove(),4500);
}
function setLoading(id,on){ const el=$(id); if(el){ el.style.opacity=on?'0.5':'1'; el.style.pointerEvents=on?'none':''; } }

// ═══ AUTH ════════════════════════════════════════════════
function showAuthPage(){ $('authPage').style.display='flex'; $('appShell').style.display='none'; }
function showApp(){ $('authPage').style.display='none'; $('appShell').style.display='flex'; refreshUserUI(); applyLang(); navigate('dashboard'); }
function switchTab(tab){
  document.querySelectorAll('.auth-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.auth-panel').forEach(p=>p.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  $(`panel-${tab}`).classList.add('active');
}

async function doLogin(){
  const email=v('lEmail').trim(), pass=v('lPass');
  if(!email||!pass){ notify('Error','Enter email and password.','error'); return; }
  const btn = document.querySelector('#panel-login .btn-primary');
  btn.textContent='Signing in…'; btn.disabled=true;
  const r = await api('auth.php','POST',{email,password:pass},{action:'login'});
  btn.textContent=t('btnLogin'); btn.disabled=false;
  if(!r.success){ notify('Login Failed',r.message,'error'); return; }
  state.token = r.data.token;
  state.user  = r.data.user;
  localStorage.setItem('token', state.token);
  localStorage.setItem('user',  JSON.stringify(state.user));
  notify('Welcome back!',`Hello, ${state.user.name}!`,'success');
  showApp();
}

async function doRegister(){
  const name=v('rName').trim(), email=v('rEmail').trim(), pass=v('rPass'), pass2=v('rPass2');
  if(!name||!email||!pass){ notify('Error','All fields required.','error'); return; }
  if(pass!==pass2){ notify('Mismatch','Passwords do not match.','error'); return; }
  if(pass.length<6){ notify('Weak','Password must be at least 6 characters.','error'); return; }
  const btn = document.querySelector('#panel-register .btn-primary');
  btn.textContent='Creating…'; btn.disabled=true;
  const r = await api('auth.php','POST',{name,email,password:pass},{action:'register'});
  btn.textContent=t('btnRegister'); btn.disabled=false;
  if(!r.success){ notify('Error',r.message,'error'); return; }
  state.token = r.data.token;
  state.user  = r.data.user;
  localStorage.setItem('token', state.token);
  localStorage.setItem('user',  JSON.stringify(state.user));
  notify('Account Created!',`Welcome, ${state.user.name}!`,'success');
  showApp();
}

async function doLogout(){
  if(state.token) await api('auth.php','POST',{},{action:'logout'});
  state.token=null; state.user=null;
  localStorage.removeItem('token'); localStorage.removeItem('user');
  showAuthPage();
}

function refreshUserUI(){
  if(!state.user) return;
  $('sbAvatar').textContent=state.user.name.charAt(0).toUpperCase();
  $('sbName').textContent=state.user.name;
  $('sbRole').textContent=state.user.role||'Personal';
}

// ═══ ROUTING ════════════════════════════════════════════
function navigate(pid){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const pg=$('pg-'+pid); if(pg) pg.classList.add('active');
  const ni=document.querySelector(`[data-pg="${pid}"]`); if(ni) ni.classList.add('active');
  const map={dashboard:'navDashboard',expenses:'navExpenses',income:'navIncome',savings:'navSavings',lend:'navLend',reports:'navReports',settings:'navSettings'};
  $('topTitle').textContent=t(map[pid]||pid);
  $('sidebar').classList.remove('open');
  $('sideOverlay').style.display='none';
  renderPage(pid);
}
function renderPage(id){
  ({dashboard:renderDashboard,expenses:renderExpenses,income:renderIncome,
    savings:renderSavings,lend:renderLend,reports:renderReports,settings:renderSettings}[id]||(() => {}))();
}

// ═══ DASHBOARD ══════════════════════════════════════════
async function renderDashboard(){
  $('dashStats').innerHTML=`<div style="padding:20px;color:var(--text-muted)">${t('loading')}</div>`;
  const mk=curMK();
  const [expR, incR, savR] = await Promise.all([
    api('expenses.php','GET',null,{month:mk}),
    api('income.php'),
    api('savings.php')
  ]);
  const exps     = expR.success ? expR.data : [];
  const incData  = incR.success ? incR.data : [];
  const savData  = savR.success ? savR.data : {savings:[],credit:[]};
  const mInc     = incData.find(i=>i.month_key===mk)?.amount||0;
  const totExp   = exps.reduce((s,e)=>s+e.amount,0);
  const net      = mInc-totExp;
  const tSav     = (savData.savings||[]).reduce((s,e)=>s+e.amount,0);
  const tCred    = (savData.credit||[]).reduce((s,e)=>s+e.amount,0);
  const todayE   = exps.filter(e=>e.date===todayStr());
  const todayT   = todayE.reduce((s,e)=>s+e.amount,0);

  $('dashStats').innerHTML=`
    <div class="stat-card blue">  <div class="stat-label">${t('todaySpending')}</div><div class="stat-value blue">${fmtBDT(todayT)}</div><div class="stat-sub">${todayE.length} ${t('transactions')}</div><div class="stat-icon">💰</div></div>
    <div class="stat-card purple"><div class="stat-label">${t('monthlyIncome')}</div><div class="stat-value purple">${fmtBDT(mInc)}</div><div class="stat-sub">${new Date().toLocaleString('en',{month:'long',year:'numeric'})}</div><div class="stat-icon">💼</div></div>
    <div class="stat-card red">   <div class="stat-label">${t('monthlyExpenses')}</div><div class="stat-value red">${fmtBDT(totExp)}</div><div class="stat-sub">${exps.length} ${t('entries')}</div><div class="stat-icon">📊</div></div>
    <div class="stat-card ${net>=0?'green':'red'}"><div class="stat-label">${t('netBalance')}</div><div class="stat-value ${net>=0?'green':'red'}">${fmtBDT(Math.abs(net))}</div><div class="stat-sub">${net>=0?t('surplus'):t('deficit2')}</div><div class="stat-icon">${net>=0?'📈':'📉'}</div></div>
    <div class="stat-card green"> <div class="stat-label">${t('totalSavings')}</div><div class="stat-value green">${fmtBDT(tSav)}</div><div class="stat-sub">${t('cumulative')}</div><div class="stat-icon">🏦</div></div>
    <div class="stat-card ${tCred>0?'red':'yellow'}"><div class="stat-label">${t('totalCredit')}</div><div class="stat-value ${tCred>0?'red':'yellow'}">${fmtBDT(tCred)}</div><div class="stat-sub">${t('cumulative')}</div><div class="stat-icon">💳</div></div>
  `;

  $('dashToday').innerHTML=todayE.length
    ?`<table><thead><tr><th>${t('category')}</th><th>${t('amount')}</th><th>${t('notes')}</th></tr></thead><tbody>
      ${todayE.slice().reverse().map(e=>{const c=getCat(e.category);return`<tr><td><span style="color:${c.color}">${c.icon}</span> ${getCatLabel(e.category)}</td><td><span class="badge badge-red">${fmtBDT(e.amount)}</span></td><td>${e.notes||'—'}</td></tr>`;}).join('')}</tbody></table>`
    :`<div class="empty-state"><div class="empty-icon">🌟</div><p>${t('noExpensesToday')}</p></div>`;

  const catTot={};
  exps.forEach(e=>{catTot[e.category]=(catTot[e.category]||0)+e.amount;});
  const bars=CATEGORIES.filter(c=>catTot[c.id]).map(c=>{
    const pct=totExp?(catTot[c.id]/totExp*100).toFixed(1):0;
    return`<div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:13px">
        <span>${c.icon} ${getCatLabel(c.id)}</span>
        <span style="font-family:var(--mono);color:var(--text-dim)">${fmtBDT(catTot[c.id])} <span style="color:var(--text-muted)">(${pct}%)</span></span>
      </div>
      <div class="prog-wrap"><div class="prog-bar" style="width:${pct}%;background:${c.color}"></div></div>
    </div>`;
  }).join('');
  $('dashBreak').innerHTML=bars||`<div class="empty-state"><div class="empty-icon">📊</div><p>${t('noData')}</p></div>`;
}

// ═══ EXPENSES ════════════════════════════════════════════
async function renderExpenses(){
  const [y,m]=state.viewMonth.split('-').map(Number);
  $('expMon').textContent=new Date(y,m-1,1).toLocaleString('en',{month:'long',year:'numeric'});
  updateCatOptions();
  $('expTbl').innerHTML=`<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-muted)">${t('loading')}</td></tr>`;
  const r = await api('expenses.php','GET',null,{month:state.viewMonth});
  if(!r.success){ notify('Error',r.message,'error'); return; }
  const all=r.data;
  const tot=all.reduce((s,e)=>s+e.amount,0);
  $('expTot').textContent=fmtBDT(tot);
  $('expCnt').textContent=`${all.length} ${t('entries')}`;
  $('expTbl').innerHTML=all.length
    ?all.map(e=>{const c=getCat(e.category);return`<tr>
        <td>${fmtDate(e.date)}</td>
        <td><span style="display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;background:${c.color}22;color:${c.color}">${c.icon} ${getCatLabel(e.category)}</span></td>
        <td style="font-family:var(--mono);color:var(--danger);font-weight:700">${fmtBDT(e.amount)}</td>
        <td style="color:var(--text-muted)">${e.notes||'—'}</td>
        <td><button class="btn btn-danger btn-xs" onclick="delExp('${e.id}')">🗑</button></td>
      </tr>`;}).join('')
    :`<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">💸</div><p>${t('noExpensesMonth')}</p></div></td></tr>`;
}

async function addExp(){
  const date=v('eDate'),cat=v('eCat'),amt=parseFloat(v('eAmt')),notes=v('eNotes').trim();
  if(!date||!cat||!amt||amt<=0){notify('Invalid','Please fill date, category and amount.','error');return;}
  const r=await api('expenses.php','POST',{date,category:cat,amount:amt,notes});
  if(!r.success){notify('Error',r.message,'error');return;}
  notify('Added',`${getCat(cat).icon} ${fmtBDT(amt)} logged.`,'success');
  sv('eAmt',''); sv('eNotes',''); sv('eDate',todayStr());
  renderExpenses(); renderDashboard();
}
async function delExp(id){
  if(!confirm('Delete this expense?'))return;
  const r=await api('expenses.php','DELETE',null,{id});
  if(!r.success){notify('Error',r.message,'error');return;}
  notify('Deleted','Expense removed.','warning');
  renderExpenses(); renderDashboard();
}
function changeExpMon(d){
  const [y,m]=state.viewMonth.split('-').map(Number);
  const dt=new Date(y,m-1+d,1);
  state.viewMonth=monthKey(dt.getFullYear(),dt.getMonth());
  renderExpenses();
}

// ═══ INCOME ══════════════════════════════════════════════
async function renderIncome(){
  $('incTbl').innerHTML=`<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-muted)">${t('loading')}</td></tr>`;
  const r=await api('income.php');
  if(!r.success){notify('Error',r.message,'error');return;}
  const rows=r.data;
  $('incTbl').innerHTML=rows.length
    ?rows.map(row=>{
      const [y,m]=row.month_key.split('-').map(Number);
      return`<tr>
        <td>${new Date(y,m-1,1).toLocaleString('en',{month:'long',year:'numeric'})}</td>
        <td style="font-family:var(--mono);color:var(--accent3);font-weight:700">${fmtBDT(row.amount)}</td>
        <td style="color:var(--text-muted)">${row.notes||'—'}</td>
        <td>${fmtDate(row.recorded_date)}</td>
        <td><button class="btn btn-danger btn-xs" onclick="delInc('${row.month_key}')">🗑</button></td>
      </tr>`;}).join('')
    :`<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">💼</div><p>${t('noIncomeYet')}</p></div></td></tr>`;
  if(!v('incMon')) sv('incMon',curMK());
}
async function addInc(){
  const mon=v('incMon'),amt=parseFloat(v('incAmt')),notes=v('incNotes').trim();
  if(!mon||!amt||amt<=0){notify('Invalid','Please select month and enter amount.','error');return;}
  const r=await api('income.php','POST',{month_key:mon,amount:amt,notes});
  if(!r.success){notify('Error',r.message,'error');return;}
  notify('Saved',`${fmtBDT(amt)} recorded for ${mon}.`,'success');
  sv('incAmt',''); sv('incNotes','');
  renderIncome(); renderDashboard();
}
async function delInc(mk){
  if(!confirm('Delete this income record?'))return;
  const r=await api('income.php','DELETE',null,{month:mk});
  if(!r.success){notify('Error',r.message,'error');return;}
  notify('Deleted','Income record removed.','warning');
  renderIncome(); renderDashboard();
}

// ═══ SAVINGS & CREDIT ════════════════════════════════════
async function renderSavings(){
  $('savStats').innerHTML=`<div style="padding:20px;color:var(--text-muted)">${t('loading')}</div>`;
  const [savR, expR, incR] = await Promise.all([
    api('savings.php'), api('expenses.php'), api('income.php')
  ]);
  if(!savR.success){notify('Error',savR.message,'error');return;}
  const sav=savR.data.savings||[], cred=savR.data.credit||[];
  const tSav=sav.reduce((s,e)=>s+e.amount,0), tCred=cred.reduce((s,e)=>s+e.amount,0);
  const nw=tSav-tCred;

  $('savStats').innerHTML=`
    <div class="stat-card green"> <div class="stat-label">${t('totalSavings')}</div><div class="stat-value green">${fmtBDT(tSav)}</div><div class="stat-sub">${sav.length} ${t('entries')}</div><div class="stat-icon">🏦</div></div>
    <div class="stat-card red">   <div class="stat-label">${t('totalCredit')}</div><div class="stat-value red">${fmtBDT(tCred)}</div><div class="stat-sub">${cred.length} ${t('entries')}</div><div class="stat-icon">💳</div></div>
    <div class="stat-card ${nw>=0?'blue':'red'}"><div class="stat-label">${t('netWorth')}</div><div class="stat-value ${nw>=0?'blue':'red'}">${fmtBDT(Math.abs(nw))}</div><div class="stat-sub">${nw>=0?t('positive'):t('negative')}</div><div class="stat-icon">⚖️</div></div>
  `;

  // Build list of months to close
  const exps=expR.success?expR.data:[];
  const incs=incR.success?incR.data:[];
  const months=[...new Set([...exps.map(e=>e.date.slice(0,7)),...incs.map(i=>i.month_key)])].sort().reverse();
  const closedSav=sav.map(s=>s.month_key), closedCred=cred.map(c=>c.month_key);
  $('monthCloseList').innerHTML=months.length?months.map(mk=>{
    const [y,m]=mk.split('-').map(Number);
    const lbl=new Date(y,m-1,1).toLocaleString('en',{month:'long',year:'numeric'});
    const closed=closedSav.includes(mk)||closedCred.includes(mk);
    return`<div style="display:flex;align-items:center;justify-content:space-between;padding:11px;background:var(--surface2);border-radius:var(--radius-sm);border:1px solid var(--border);margin-bottom:9px">
      <span style="font-size:13.5px;font-weight:600">${lbl}</span>
      ${closed?`<span class="badge badge-green">${t('processed')}</span>`:`<button class="btn btn-primary btn-sm" onclick="closeMon('${mk}')">${t('closeMonth')}</button>`}
    </div>`;
  }).join(''):`<div class="empty-state"><div class="empty-icon">📅</div><p>${t('noMonths')}</p></div>`;

  $('savTbl').innerHTML=sav.length?sav.map(s=>{
    const [y,m]=s.month_key.split('-').map(Number);
    return`<tr><td>${new Date(y,m-1,1).toLocaleString('en',{month:'long',year:'numeric'})}</td><td style="color:var(--accent3);font-family:var(--mono);font-weight:700">${fmtBDT(s.amount)}</td><td>${fmtDate(s.date)}</td></tr>`;
  }).join(''):`<tr><td colspan="3"><div class="empty-state"><div class="empty-icon">🏦</div><p>${t('noSavings')}</p></div></td></tr>`;
  $('credTbl').innerHTML=cred.length?cred.map(c=>{
    const [y,m]=c.month_key.split('-').map(Number);
    return`<tr><td>${new Date(y,m-1,1).toLocaleString('en',{month:'long',year:'numeric'})}</td><td style="color:var(--danger);font-family:var(--mono);font-weight:700">${fmtBDT(c.amount)}</td><td>${fmtDate(c.date)}</td></tr>`;
  }).join(''):`<tr><td colspan="3"><div class="empty-state"><div class="empty-icon">💳</div><p>${t('noCredit')}</p></div></td></tr>`;
}

async function closeMon(mk){
  const r=await api('savings.php','POST',{month_key:mk},{action:'close'});
  if(!r.success){notify('Error',r.message,'error');return;}
  const type=r.data.type;
  if(type==='savings')     notify('✅ Month Closed', r.message, 'success');
  else if(type==='credit') notify('⚠️ Credit Added!', r.message, 'error');
  else                     notify('Balanced', r.message, 'info');
  renderSavings(); renderDashboard();
}

// ═══ LEND LIST ═══════════════════════════════════════════
async function renderLend(){
  $('lendStats').innerHTML=`<div style="padding:20px;color:var(--text-muted)">${t('loading')}</div>`;
  const r=await api('lends.php');
  if(!r.success){notify('Error',r.message,'error');return;}
  const lends=r.data;
  const tot=lends.reduce((s,l)=>s+l.amount,0);
  const pend=lends.filter(l=>l.status==='pending');
  const pTot=pend.reduce((s,l)=>s+l.amount,0);
  $('lendStats').innerHTML=`
    <div class="stat-card blue">  <div class="stat-label">${t('totalLent')}</div><div class="stat-value blue">${fmtBDT(tot)}</div><div class="stat-sub">${lends.length} ${t('records')}</div><div class="stat-icon">🤝</div></div>
    <div class="stat-card yellow"><div class="stat-label">${t('pendingReturns')}</div><div class="stat-value yellow">${fmtBDT(pTot)}</div><div class="stat-sub">${pend.length} ${t('pending')}</div><div class="stat-icon">⏳</div></div>
    <div class="stat-card green"> <div class="stat-label">${t('returned')}</div><div class="stat-value green">${fmtBDT(tot-pTot)}</div><div class="stat-sub">${lends.length-pend.length} ${t('returned')}</div><div class="stat-icon">✅</div></div>
  `;
  window._lendData=lends;
  $('lendTbl').innerHTML=lends.length
    ?lends.map(l=>`<tr>
        <td>${l.person}</td>
        <td style="font-family:var(--mono);color:var(--warning);font-weight:700">${fmtBDT(l.amount)}</td>
        <td>${fmtDate(l.date)}</td>
        <td style="color:var(--text-muted)">${l.notes||'—'}</td>
        <td>${l.status==='returned'?'<span class="badge badge-green">✅ Returned</span>':'<span class="badge badge-yellow">⏳ Pending</span>'}</td>
        <td style="display:flex;gap:5px;flex-wrap:wrap">
          <button class="btn ${l.status==='pending'?'btn-success':'btn-ghost'} btn-xs" onclick="toggleLend('${l.id}','${l.status==='pending'?'returned':'pending'}')">${l.status==='pending'?'Mark Returned':'Mark Pending'}</button>
          <button class="btn btn-danger btn-xs" onclick="delLend('${l.id}')">🗑</button>
        </td>
      </tr>`).join('')
    :`<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">🤝</div><p>${t('noLends')}</p></div></td></tr>`;
}
async function addLend(){
  const person=v('lPerson').trim(),amt=parseFloat(v('lAmt')),date=v('lDate'),notes=v('lNotes').trim();
  if(!person||!amt||!date){notify('Invalid','Fill person, amount and date.','error');return;}
  const r=await api('lends.php','POST',{person,amount:amt,date,notes});
  if(!r.success){notify('Error',r.message,'error');return;}
  notify('Recorded',`${fmtBDT(amt)} lent to ${person}.`,'success');
  sv('lPerson',''); sv('lAmt',''); sv('lNotes','');
  renderLend();
}
async function toggleLend(id,status){
  const r=await api('lends.php','PUT',{id,status});
  if(!r.success){notify('Error',r.message,'error');return;}
  if(status==='returned') notify('Returned','Marked as returned.','success');
  renderLend();
}
async function delLend(id){
  if(!confirm('Delete this record?'))return;
  const r=await api('lends.php','DELETE',null,{id});
  if(!r.success){notify('Error',r.message,'error');return;}
  notify('Deleted','Record removed.','warning'); renderLend();
}

// ── Lend Exports ─────────────────────────────────────────
function lendExportCSV(){
  const lends=window._lendData||[];
  if(!lends.length){notify('No Data','No records to export.','warning');return;}
  let csv='Person,Amount (BDT),Date,Notes,Status\n';
  lends.forEach(l=>{csv+=`"${l.person}",${l.amount},"${fmtDate(l.date)}","${l.notes||''}","${l.status}"\n`;});
  downloadBlob(csv,'text/csv','lend-list.csv');
  notify('Exported','Downloaded as CSV.','success');
}
function lendExportExcel(){
  const lends=window._lendData||[];
  if(!lends.length){notify('No Data','No records.','warning');return;}
  const rows=lends.map(l=>`<Row><Cell><Data ss:Type="String">${l.person}</Data></Cell><Cell><Data ss:Type="Number">${l.amount}</Data></Cell><Cell><Data ss:Type="String">${fmtDate(l.date)}</Data></Cell><Cell><Data ss:Type="String">${l.notes||''}</Data></Cell><Cell><Data ss:Type="String">${l.status}</Data></Cell></Row>`).join('');
  const xml=`<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Lend List"><Table><Row><Cell><Data ss:Type="String">Person</Data></Cell><Cell><Data ss:Type="String">Amount</Data></Cell><Cell><Data ss:Type="String">Date</Data></Cell><Cell><Data ss:Type="String">Notes</Data></Cell><Cell><Data ss:Type="String">Status</Data></Cell></Row>${rows}</Table></Worksheet></Workbook>`;
  downloadBlob(xml,'application/vnd.ms-excel','lend-list.xls');
  notify('Exported','Downloaded as Excel.','success');
}
function lendExportPDF(){
  const lends=window._lendData||[];
  if(!lends.length){notify('No Data','No records.','warning');return;}
  const tot=lends.reduce((s,l)=>s+l.amount,0);
  const pend=lends.filter(l=>l.status==='pending').reduce((s,l)=>s+l.amount,0);
  const rows=lends.map(l=>`<tr><td>${l.person}</td><td>৳${l.amount.toLocaleString()}</td><td>${fmtDate(l.date)}</td><td>${l.notes||'—'}</td><td>${l.status==='returned'?'✅ Returned':'⏳ Pending'}</td></tr>`).join('');
  printHTML(`<h1>Lend List Report</h1><p style="color:#64748b;margin-bottom:14px">Generated: ${new Date().toLocaleString()}</p>
    <table border="1" cellpadding="6" style="border-collapse:collapse;margin-bottom:16px;font-size:13px">
      <tr><td><b>Total Lent</b></td><td>৳${tot.toLocaleString()}</td></tr>
      <tr><td><b>Pending</b></td><td>৳${pend.toLocaleString()}</td></tr>
      <tr><td><b>Returned</b></td><td>৳${(tot-pend).toLocaleString()}</td></tr>
    </table>
    <table border="1" cellpadding="7" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:13px">
    <thead style="background:#f0f4f8"><tr><th>Person</th><th>Amount</th><th>Date</th><th>Notes</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody></table>`,'Lend List - Daily Tracker');
}

// ═══ REPORTS ════════════════════════════════════════════
async function renderReports(){
  const [y,m]=state.rptMonth.split('-').map(Number);
  $('rptMon').textContent=new Date(y,m-1,1).toLocaleString('en',{month:'long',year:'numeric'});
  $('rptStats').innerHTML=`<div style="padding:20px;color:var(--text-muted)">${t('loading')}</div>`;
  const r=await api('reports.php','GET',null,{month:state.rptMonth});
  if(!r.success){notify('Error',r.message,'error');return;}
  const d=r.data;
  window._rptData=d;

  $('rptStats').innerHTML=`
    <div class="stat-card purple"><div class="stat-label">${t('monthlyIncome')}</div><div class="stat-value purple">${fmtBDT(d.income)}</div><div class="stat-icon">💼</div></div>
    <div class="stat-card red">   <div class="stat-label">${t('monthlyExpenses')}</div><div class="stat-value red">${fmtBDT(d.total_exp)}</div><div class="stat-icon">📊</div></div>
    <div class="stat-card ${d.net>=0?'green':'red'}"><div class="stat-label">${t('netBalance')}</div><div class="stat-value ${d.net>=0?'green':'red'}">${d.net>=0?'+':''}${fmtBDT(d.net)}</div><div class="stat-icon">${d.net>=0?'📈':'📉'}</div></div>
    <div class="stat-card green"> <div class="stat-label">${t('totalSavings')}</div><div class="stat-value green">${fmtBDT(d.total_sav)}</div><div class="stat-icon">🏦</div></div>
    <div class="stat-card red">   <div class="stat-label">${t('totalCredit')}</div><div class="stat-value red">${fmtBDT(d.total_cred)}</div><div class="stat-icon">💳</div></div>
  `;

  $('rptCatTbl').innerHTML=d.categories.length
    ?d.categories.map(c=>{const cat=getCat(c.category);const pct=d.total_exp?(c.total/d.total_exp*100).toFixed(1):0;return`<tr>
      <td><span style="color:${cat.color}">${cat.icon}</span> ${getCatLabel(c.category)}</td>
      <td style="font-family:var(--mono);font-weight:700;color:var(--danger)">${fmtBDT(c.total)}</td>
      <td><span class="badge" style="background:${cat.color}22;color:${cat.color}">${pct}%</span></td>
    </tr>`;}).join('')
    :`<tr><td colspan="3"><div class="empty-state"><div class="empty-icon">📊</div><p>${t('noData')}</p></div></td></tr>`;

  if(chartInst){chartInst.destroy();chartInst=null;}
  if(d.categories.length){
    const ctx=$('rptChart').getContext('2d');
    chartInst=new Chart(ctx,{
      type:'doughnut',
      data:{
        labels:d.categories.map(c=>getCatLabel(c.category)),
        datasets:[{data:d.categories.map(c=>c.total),
          backgroundColor:d.categories.map(c=>getCat(c.category).color+'cc'),
          borderColor:d.categories.map(c=>getCat(c.category).color),
          borderWidth:2,hoverOffset:8}]
      },
      options:{responsive:true,maintainAspectRatio:false,
        plugins:{
          legend:{position:'right',labels:{color:document.body.classList.contains('light')?'#475569':'#94a3b8',padding:12,font:{family:'Sora',size:12}}},
          tooltip:{callbacks:{label(ctx){return ` ৳${ctx.parsed.toLocaleString()}`;}}},
        },cutout:'60%'}
    });
  }

  $('rptTrend').innerHTML=(d.trend||[]).map(row=>`<tr>
    <td>${row.label}</td>
    <td style="color:var(--accent3);font-family:var(--mono)">${fmtBDT(row.income)}</td>
    <td style="color:var(--danger);font-family:var(--mono)">${fmtBDT(row.expenses)}</td>
    <td style="color:${row.net>=0?'var(--accent3)':'var(--danger)'};font-family:var(--mono);font-weight:700">${row.net>=0?'+':''}${fmtBDT(row.net)}</td>
  </tr>`).join('');
}
function changeRptMon(d){
  const [y,m]=state.rptMonth.split('-').map(Number);
  const dt=new Date(y,m-1+d,1);
  state.rptMonth=monthKey(dt.getFullYear(),dt.getMonth());
  renderReports();
}

// ── Report Exports ────────────────────────────────────────
async function rptExportCSV(){
  const d=window._rptData; if(!d){notify('No Data','Load the report first.','warning');return;}
  const expR=await api('expenses.php','GET',null,{month:state.rptMonth});
  const exps=expR.success?expR.data:[];
  let csv=`Monthly Report - ${state.rptMonth}\n\nSUMMARY\nIncome,${d.income}\nTotal Expenses,${d.total_exp}\nNet Result,${d.net}\n\nEXPENSES\nDate,Category,Amount,Notes\n`;
  exps.forEach(e=>{csv+=`"${e.date}","${getCat(e.category).label}",${e.amount},"${e.notes||''}"\n`;});
  downloadBlob(csv,'text/csv',`report-${state.rptMonth}.csv`);
  notify('Exported','Downloaded as CSV.','success');
}
async function rptExportExcel(){
  const d=window._rptData; if(!d){notify('No Data','Load the report first.','warning');return;}
  const expR=await api('expenses.php','GET',null,{month:state.rptMonth});
  const exps=expR.success?expR.data:[];
  const rows=exps.map(e=>`<Row><Cell><Data ss:Type="String">${e.date}</Data></Cell><Cell><Data ss:Type="String">${getCat(e.category).label}</Data></Cell><Cell><Data ss:Type="Number">${e.amount}</Data></Cell><Cell><Data ss:Type="String">${e.notes||''}</Data></Cell></Row>`).join('');
  const xml=`<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
    <Worksheet ss:Name="Summary"><Table>
      <Row><Cell><Data ss:Type="String">Report: ${state.rptMonth}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Income</Data></Cell><Cell><Data ss:Type="Number">${d.income}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Expenses</Data></Cell><Cell><Data ss:Type="Number">${d.total_exp}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Net</Data></Cell><Cell><Data ss:Type="Number">${d.net}</Data></Cell></Row>
    </Table></Worksheet>
    <Worksheet ss:Name="Expenses"><Table>
      <Row><Cell><Data ss:Type="String">Date</Data></Cell><Cell><Data ss:Type="String">Category</Data></Cell><Cell><Data ss:Type="String">Amount</Data></Cell><Cell><Data ss:Type="String">Notes</Data></Cell></Row>${rows}
    </Table></Worksheet></Workbook>`;
  downloadBlob(xml,'application/vnd.ms-excel',`report-${state.rptMonth}.xls`);
  notify('Exported','Downloaded as Excel.','success');
}
async function rptExportPDF(){
  const d=window._rptData; if(!d){notify('No Data','Load the report first.','warning');return;}
  const expR=await api('expenses.php','GET',null,{month:state.rptMonth});
  const exps=expR.success?expR.data:[];
  const catRows=d.categories.map(c=>{const cat=getCat(c.category);const pct=d.total_exp?(c.total/d.total_exp*100).toFixed(1):0;return`<tr><td>${cat.icon} ${cat.label}</td><td>৳${c.total.toLocaleString()}</td><td>${pct}%</td></tr>`;}).join('');
  const expRows=exps.map(e=>`<tr><td>${e.date}</td><td>${getCat(e.category).label}</td><td>৳${e.amount.toLocaleString()}</td><td>${e.notes||'—'}</td></tr>`).join('');
  printHTML(`
    <h1>Monthly Report — ${state.rptMonth}</h1>
    <p style="color:#64748b;margin-bottom:14px">Generated: ${new Date().toLocaleString()}</p>
    <h3>Summary</h3>
    <table border="1" cellpadding="7" cellspacing="0" style="border-collapse:collapse;margin-bottom:16px;font-size:13px">
      <tr><td><b>Income</b></td><td>৳${d.income.toLocaleString()}</td></tr>
      <tr><td><b>Total Expenses</b></td><td>৳${d.total_exp.toLocaleString()}</td></tr>
      <tr style="font-weight:bold;background:${d.net>=0?'#e6ffed':'#ffe6e6'}"><td>Net Result</td><td>${d.net>=0?'+':''}৳${d.net.toLocaleString()}</td></tr>
    </table>
    <h3>Category Breakdown</h3>
    <table border="1" cellpadding="7" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:13px">
    <thead style="background:#f0f4f8"><tr><th>Category</th><th>Amount</th><th>%</th></tr></thead><tbody>${catRows}</tbody></table>
    <h3>All Expenses</h3>
    <table border="1" cellpadding="7" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:13px">
    <thead style="background:#f0f4f8"><tr><th>Date</th><th>Category</th><th>Amount</th><th>Notes</th></tr></thead><tbody>${expRows}</tbody></table>
  `,`Report ${state.rptMonth} - Daily Tracker`);
}

// ═══ SETTINGS ════════════════════════════════════════════
async function renderSettings(){
  if(!state.user)return;
  sv('sName',state.user.name); sv('sEmail',state.user.email); sv('sRole',state.user.role||'');
}
async function saveSettings(){
  const name=v('sName').trim(),role=v('sRole').trim();
  if(!name){notify('Invalid','Name required.','error');return;}
  const r=await api('auth.php','PUT',{name,role},{action:'profile'});
  if(!r.success){notify('Error',r.message,'error');return;}
  state.user={...state.user,name,role};
  localStorage.setItem('user',JSON.stringify(state.user));
  refreshUserUI(); notify('Saved','Profile updated.','success');
}
function clearAll(){
  notify('Info','To clear data, please delete records from each section individually, or use phpMyAdmin to truncate the tables.','info');
}

// ═══ UTILS ═══════════════════════════════════════════════
function downloadBlob(content,mime,filename){
  const blob=new Blob([content],{type:mime});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download=filename; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function printHTML(bodyHTML,title){
  const w=window.open('','_blank','width=960,height=720');
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>body{font-family:Arial,sans-serif;padding:32px;color:#111}h1{color:#0284c7;margin-bottom:6px}h3{margin:20px 0 9px;color:#334155}table{width:100%}th,td{text-align:left;padding:7px}</style>
    </head><body>${bodyHTML}<br><p style="color:#94a3b8;font-size:12px;margin-top:20px">Daily Usage Tracker v3.0 — ${new Date().toLocaleString()}</p></body></html>`);
  w.document.close(); setTimeout(()=>w.print(),600);
}

// ═══ INIT ════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded',()=>{
  initTheme();
  curLang=localStorage.getItem('lang')||'en';

  document.querySelectorAll('input[type=date]').forEach(i=>{if(!i.value)i.value=todayStr();});
  $('topDate').textContent=new Date().toLocaleDateString('en-BD',{weekday:'short',day:'2-digit',month:'short',year:'numeric'});

  $('mToggle').addEventListener('click',()=>{
    $('sidebar').classList.toggle('open');
    $('sideOverlay').style.display=$('sidebar').classList.contains('open')?'block':'none';
  });
  $('sideOverlay').addEventListener('click',()=>{
    $('sidebar').classList.remove('open');
    $('sideOverlay').style.display='none';
  });

  applyLang();

  // Restore session from localStorage
  const savedToken=localStorage.getItem('token');
  const savedUser =localStorage.getItem('user');
  if(savedToken&&savedUser){
    try{
      state.token=savedToken;
      state.user=JSON.parse(savedUser);
      showApp();
    }catch(e){ showAuthPage(); }
  } else {
    showAuthPage();
  }
});
