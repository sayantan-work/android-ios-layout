const I = (id) => `<svg><use href="#${id}"/></svg>`;

/* ─── PERSONAS ─── */
const personas = {
  A: { label:'App User', sub:'Productivity-only · no Office tab', tabs:['today','chats'], hrms:false, name:'Jordan', role:'App User' },
  B: { label:'L3 — Employee', sub:'HRMS employee · own attendance/payroll only', tabs:['today','chats','office'], hrms:true, name:'Sayantan Ghosh', role:'JUNIOR AIML, Head Office', initials:'SG', branch:'Head Office, Ahmedabad', officeTabs:['punchin','dashboard','notice','salary'] },
  D: { label:'L2 — Branch Manager', sub:'HRMS + manages branch · approves L3 requests', tabs:['today','chats','office'], hrms:true, name:'Sayantan Ghosh', role:'Branch Manager, Head Office', initials:'SG', branch:'Head Office, Ahmedabad', officeTabs:['punchin','dashboard','notice','salary','manager'], manager:true },
  E: { label:'L1 — CEO / Top Mgmt', sub:'Company-wide oversight · auto-approves own requests', tabs:['today','chats','office'], hrms:true, name:'Sayantan Ghosh', role:'CEO, Liberty Infospace', initials:'SG', branch:'All Branches', officeTabs:['punchin','dashboard','notice','salary','manager'], manager:true, ceo:true },
};

/* ─── STATE ─── */
const state = {
  persona:'B',
  tab:'today',          // today | chats | office
  officeTab:'punchin',  // punchin | dashboard | notice | salary | manager
  salaryTab:'timesheet',// timesheet | earnings | allowance | deductions
  todayChip:'all',
  chatChip:'all',
  stack:[],             // deep-nav: [{id, ctx}]
  punchedIn:true,
  holdTimer:null,
};

/* ─── TOAST ─── */
function toast(msg, kind='') {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = 'toast' + (kind ? ' '+kind : '');
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 200); }, 2000);
}

/* ─── NAV ─── */
function nav(id, ctx={}) {
  if (!SCREENS[id]) { toast('"'+id+'" — coming soon'); return; }
  state.stack.push({id, ctx:{...ctx}});
  render();
  document.getElementById('body').scrollTo(0,0);
}
function back() {
  state.stack.pop();
  render();
  document.getElementById('body').scrollTo(0,0);
}

/* ─── SCREEN REGISTRY ─── */
const SCREENS = {};

/* ─── BODY DISPATCH ─── */
function bodyHTML() {
  if (state.stack.length) {
    const top = state.stack[state.stack.length - 1];
    return SCREENS[top.id].render(state.persona, top.ctx);
  }
  if (state.tab === 'today') return todayScreen();
  if (state.tab === 'chats') return chatsScreen();
  if (state.tab === 'office') return officeScreen();
  return '';
}

/* ─── HEADER (per tab + deep) ─── */
function renderHeader() {
  const p = personas[state.persona];
  const top = state.stack[state.stack.length - 1];
  const hdr = document.getElementById('hdr');

  if (top) {
    const title = typeof SCREENS[top.id].title === 'function' ? SCREENS[top.id].title(top.ctx, state.persona) : SCREENS[top.id].title;
    hdr.innerHTML = `
      <button class="hdr-back" data-act="back" aria-label="Back">${I('i-chev-l')}</button>
      <div class="hdr-title" style="font-size:16px">${title}</div>
      <div class="hdr-icons">
        <button class="hdr-btn has-dot" data-nav="notifications" aria-label="Notifications">${I('i-bell')}</button>
      </div>`;
  } else if (state.tab === 'today') {
    hdr.innerHTML = `
      <div class="hdr-logo"></div>
      <div class="hdr-title">Today</div>
      <div class="hdr-icons">
        <button class="hdr-btn" data-nav="call" aria-label="Call">${I('i-phone')}</button>
        <button class="hdr-btn" data-nav="cloud" aria-label="Sync">${I('i-cloud')}</button>
        <button class="hdr-btn" data-nav="agenda" aria-label="Agenda">${I('i-note')}</button>
        <button class="hdr-btn" data-nav="more" aria-label="More">${I('i-kebab')}</button>
      </div>`;
  } else if (state.tab === 'chats') {
    hdr.innerHTML = `
      <div class="hdr-logo"></div>
      <div class="hdr-title">Chats</div>
      <div class="hdr-icons">
        <button class="hdr-btn" data-nav="call" aria-label="Call">${I('i-phone')}</button>
        <button class="hdr-btn" data-nav="cloud" aria-label="Sync">${I('i-cloud')}</button>
        <button class="hdr-btn" data-nav="agenda" aria-label="Agenda">${I('i-note')}</button>
        <button class="hdr-btn" data-nav="more" aria-label="More">${I('i-kebab')}</button>
      </div>`;
  } else { // office
    hdr.innerHTML = `
      <button class="hdr-company" data-nav="company-menu" aria-label="Switch company">
        <div class="hc-logo">L</div>
        <div style="flex:1;min-width:0">
          <div class="hc-name">Liberty Infospace</div>
        </div>
        ${I('i-chev-d')}
      </button>
      <div class="hdr-icons">
        <button class="hdr-btn" data-nav="cloud" aria-label="Sync">${I('i-cloud')}</button>
        <button class="hdr-btn" data-nav="more" aria-label="More">${I('i-kebab')}</button>
      </div>`;
  }
  wire(hdr);
}

/* ─── TAB BAR ─── */
function renderTabs() {
  const p = personas[state.persona];
  const tabs = document.getElementById('tabs');
  const all = [
    {id:'today', label:'Today', icon:'i-home'},
    {id:'chats', label:'Chats', icon:'i-chat', badge:160},
    {id:'office', label:'Office', icon:'i-bag'},
  ];
  const visible = all.filter(t => p.tabs.includes(t.id));
  tabs.innerHTML = visible.map(t =>
    `<button class="tab ${(state.stack.length===0 && state.tab===t.id)?'active':''}" data-tab="${t.id}">
       ${I(t.icon)}
       <span class="tab-label">${t.label}</span>
       ${t.badge ? `<span class="tab-badge">${t.badge}</span>` : ''}
     </button>`
  ).join('');
  tabs.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => {
    state.tab = b.dataset.tab;
    state.stack = [];
    render();
    document.getElementById('body').scrollTo(0,0);
  }));
}

/* ─── FABS (only on Today / Chats) ─── */
function renderFabs() {
  const fabs = document.getElementById('fabs');
  if (state.stack.length || state.tab === 'office') { fabs.innerHTML=''; return; }
  fabs.innerHTML = `
    <button class="fab-btn ai" data-act="ai" aria-label="EasyDo AI">${I('i-ai')}</button>
    <button class="fab-btn add" data-act="add" aria-label="Add">${I('i-plus')}</button>`;
  wire(fabs);
}

/* ─── WIRE DELEGATION ─── */
function wire(root) {
  root.querySelectorAll('[data-act]').forEach(el => {
    if (el.dataset.wired) return; el.dataset.wired = '1';
    const a = el.dataset.act;
    if (a === 'punch-hold') {
      const start = (e) => { e.preventDefault(); el.classList.add('holding'); state.holdTimer = setTimeout(() => {
        state.punchedIn = !state.punchedIn;
        el.classList.remove('holding');
        toast(state.punchedIn ? 'Punched In · 09:30 AM' : 'Punched Out · 05:06 PM', 'success');
        render();
      }, 1100); };
      const cancel = () => { clearTimeout(state.holdTimer); el.classList.remove('holding'); };
      el.addEventListener('mousedown', start); el.addEventListener('touchstart', start, {passive:false});
      el.addEventListener('mouseup', cancel); el.addEventListener('mouseleave', cancel);
      el.addEventListener('touchend', cancel); el.addEventListener('touchcancel', cancel);
      return;
    }
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (a === 'back') back();
      else if (a === 'ai') toast('EasyDo AI assistant');
      else if (a === 'add') toast('Quick create');
      else if (a === 'office-subtab') { state.officeTab = el.dataset.sub; render(); }
      else if (a === 'today-chip') { state.todayChip = el.dataset.chip; render(); }
      else if (a === 'chat-chip') { state.chatChip = el.dataset.chip; render(); }
      else if (a === 'salary-tab') { state.salaryTab = el.dataset.sub; render(); }
      else if (a === 'approve') { const row = el.closest('.approval'); toast('Approved', 'success'); if (row) { row.style.transition='opacity 0.2s, transform 0.2s'; row.style.opacity='0'; row.style.transform='translateX(20px)'; setTimeout(()=>row.remove(),200); } }
      else if (a === 'reject') { const row = el.closest('.approval'); toast('Rejected', 'danger'); if (row) { row.style.transition='opacity 0.2s, transform 0.2s'; row.style.opacity='0'; row.style.transform='translateX(-20px)'; setTimeout(()=>row.remove(),200); } }
      else if (a === 'submit-form') { toast(el.dataset.toast || 'Submitted', 'success'); back(); }
      else if (a === 'submit-request') {
        const p = state.persona;
        const route = p === 'E' ? 'auto-approved' : p === 'D' ? 'sent to L1 for review' : 'sent to manager';
        toast(`${el.dataset.kind || 'Request'} · ${route}`, 'success'); back();
      }
      else if (a === 'sign-out') toast('Signed out (demo)');
      else if (a === 'noop') toast(el.dataset.toast || 'Coming soon');
    });
  });
  root.querySelectorAll('[data-nav]').forEach(el => {
    if (el.dataset.wired) return; el.dataset.wired = '1';
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const ctx = {};
      Array.from(el.attributes).forEach(att => { if (att.name.startsWith('data-ctx-')) ctx[att.name.slice(9)] = att.value; });
      nav(el.dataset.nav, ctx);
    });
  });
  root.querySelectorAll('[data-tab]').forEach(el => {
    if (el.dataset.wired) return; el.dataset.wired = '1';
  });
}

/* ============================================================
   SCREEN: TODAY (the real calendar view)
============================================================ */
function todayScreen() {
  const days = ['S','M','T','W','T','F','S'];
  const dates = [3,4,5,6,7,8,9];
  const today = 7;
  const hasEvents = new Set([5,7]);
  const chips = [
    {id:'all', label:'All (4)'},
    {id:'mytask', label:'My Task'},
    {id:'deleg', label:'Delegated'},
    {id:'meet', label:'Meet'},
    {id:'rem', label:'Reminder'},
  ];

  const hours = [];
  for (let h = 8; h <= 18; h++) {
    const ap = h >= 12 ? 'PM' : 'AM';
    const h12 = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    const label = `${String(h12).padStart(2,'0')}:00 ${ap}`;
    let event = '';
    if (h === 9)  event = `<div class="event-pill blue" data-nav="meet-detail" data-ctx-title="Design Sync"><div class="ep-title">Design Sync</div><div class="ep-sub">with Sukanta · 30 min</div></div>`;
    if (h === 11) event = `<div class="event-pill" data-nav="task-detail" data-ctx-title="Stress Test Report"><div class="ep-title">Stress Test Capacity Report</div><div class="ep-sub">Due today · 11:30 AM</div></div>`;
    if (h === 14) event = `<div class="event-pill amber" data-nav="meet-detail" data-ctx-title="Liberty Kolkata Dev"><div class="ep-title">Liberty Kolkata Dev</div><div class="ep-sub">Group · 1 hour</div></div>`;
    if (h === 16) event = `<div class="event-pill purple" data-nav="reminder-detail" data-ctx-title="Submit weekly report"><div class="ep-title">Submit weekly report</div><div class="ep-sub">Reminder</div></div>`;
    hours.push(`<div class="hour-row"><div class="h-time">${label}</div><div class="h-slot">${event}</div></div>`);
  }

  return `
    <div class="body-pad">
      <div class="search" data-nav="search"><span>${I('i-search')}</span> Search anything…</div>
      <div class="chips">
        ${chips.map(c => `<button class="chip ${state.todayChip===c.id?'active':''}" data-act="today-chip" data-chip="${c.id}">${c.label}</button>`).join('')}
      </div>
      <div class="month-row" data-nav="month-picker">May 2026 ${I('i-chev-d')}</div>
      <div class="week-strip">
        ${days.map((d,i) => {
          const date = dates[i];
          const isToday = date === today;
          const hasE = hasEvents.has(date);
          return `<button class="day ${isToday?'today':''} ${hasE?'has-events':''}" data-nav="day-detail" data-ctx-date="${date}">
            <span class="d-label">${d}</span>
            <span class="d-num">${date}</span>
            <span class="d-dot"></span>
          </button>`;
        }).join('')}
      </div>
      <div class="all-day-label">All Day</div>
      <div class="allday-card birthday" data-nav="birthday-detail" data-ctx-name="Rounik Tarafder">
        <div class="ac-icon">${I('i-cake')}</div>
        <div class="ac-body">
          <div class="ac-title">Rounik Tarafder</div>
          <div class="ac-sub">Send birthday wish</div>
        </div>
        <span class="ac-tag">Birthday</span>
      </div>
      <div class="allday-card review" data-nav="review-queue">
        <div class="ac-icon">${I('i-check')}</div>
        <div class="ac-body">
          <div class="ac-title">Tasks Done — Awaiting Review (1)</div>
          <div class="ac-sub">The creator must review delegated tasks</div>
        </div>
        <span class="ac-tag">Delegated</span>
      </div>
      <div class="hour-grid">${hours.join('')}</div>
    </div>`;
}

/* ============================================================
   SCREEN: CHATS (no task-counter stat tiles per user feedback)
============================================================ */
const CHATS = [
  {id:'ai', av:'ai', initials:'AI', name:'EasyDo AI', preview:"Got it — I'll handle it.", time:'5:06 PM'},
  {id:'amulya', av:'av2', initials:'AS', name:'Amulya Sir (Liberty Infospace)', preview:'Sounds good, thanks.', time:'5:06 PM'},
  {id:'kolkata', av:'av1', initials:'LK', name:'Liberty Kolkata Dev Team', preview:'Sukanta: deploying tonight 🚀', time:'5:06 PM', unread:2},
  {id:'uitest', av:'av4', initials:'UT', name:'UI Testing', preview:'Priya: can someone review screen 3?', time:'4:34 PM', unread:5},
  {id:'iostest', av:'av3', initials:'IT', name:'iOS Testing Group', preview:'Rounik joined the group', time:'Yesterday', unread:3},
  {id:'bug', av:'av5', initials:'BR', name:'Bug Resolve 2025', preview:'Sankha Subhra left the group', time:'Yesterday'},
  {id:'soumya', av:'av2', initials:'SG', name:'Soumyadeep Goswami', preview:'🤝 Meet at 4', time:'Yesterday'},
];

function chatsScreen() {
  const chips = [
    {id:'all', label:'All'},
    {id:'unread', label:'Unread'},
    {id:'groups', label:'Groups'},
    {id:'labels', label:'Labels'},
    {id:'archived', label:'Archived'},
  ];
  const filter = state.chatChip;
  const rows = CHATS.filter(c => filter==='all' || (filter==='unread'&&c.unread) || (filter==='groups'&&/Group|Team|Testing|Bug/.test(c.name)));
  return `
    <div class="body-pad">
      <div class="search" data-nav="search">${I('i-search')} Search conversations</div>
      <div class="chips">
        ${chips.map(c => `<button class="chip ${state.chatChip===c.id?'active':''}" data-act="chat-chip" data-chip="${c.id}">${c.label}</button>`).join('')}
      </div>
      ${rows.length===0 ? `<div class="empty"><div class="empty-icon">${I('i-chat')}</div><div class="empty-title">No conversations</div><div class="empty-sub">Try a different filter or start a new chat.</div></div>` : ''}
      ${rows.map(c => `
        <div class="chat-row" data-nav="chat-thread" data-ctx-id="${c.id}">
          <div class="avatar ${c.av}">${c.initials}</div>
          <div class="c-body">
            <div class="c-name">${c.name}</div>
            <div class="c-preview">${c.preview}</div>
          </div>
          <div class="c-meta">
            <span class="c-time">${c.time}</span>
            ${c.unread?`<span class="unread">${c.unread}</span>`:''}
          </div>
        </div>`).join('')}
    </div>`;
}

/* ============================================================
   SCREEN: OFFICE (with top sub-tabs)
============================================================ */
function officeScreen() {
  const p = personas[state.persona];
  const subtabs = [
    {id:'punchin',   label:'Punch In',  icon:'i-finger-down'},
    {id:'dashboard', label:'Dashboard', icon:'i-user'},
    {id:'notice',    label:'Notice',    icon:'i-bell'},
    {id:'salary',    label:'Salary',    icon:'i-rupee'},
    {id:'manager',   label:'Manager',   icon:'i-menu'},
  ].filter(s => p.officeTabs && p.officeTabs.includes(s.id));

  const cur = subtabs.find(s => s.id === state.officeTab) ? state.officeTab : subtabs[0].id;
  if (cur !== state.officeTab) state.officeTab = cur;

  const content =
    cur === 'punchin'   ? officePunchIn() :
    cur === 'dashboard' ? officeDashboard() :
    cur === 'notice'    ? officeNotice() :
    cur === 'salary'    ? officeSalary() :
    cur === 'manager'   ? officeManager() : '';

  return `
    <div class="subtabs">
      ${subtabs.map(s => `<button class="subtab ${cur===s.id?'active':''}" data-act="office-subtab" data-sub="${s.id}">${I(s.icon)}${s.label}</button>`).join('')}
    </div>
    <div class="body-pad">${content}</div>`;
}

function officePunchIn() {
  const inLabel = state.punchedIn ? 'Punch Out' : 'Punch In';
  const orbClass = state.punchedIn ? 'out' : '';
  const outTime = state.punchedIn ? '--:--' : '05:06 PM';
  return `
    <div class="punch-stats">
      <div class="punch-stat blue">
        <div class="ps-icon">${I('i-clock')}</div>
        <div class="ps-val">05:23 PM</div>
        <div class="ps-label">(IST) Thu, 07 May</div>
      </div>
      <div class="punch-stat">
        <div class="ps-icon">${I('i-hourglass')}</div>
        <div class="ps-val">Flexible</div>
        <div class="ps-label">(IST) Timing</div>
      </div>
      <div class="punch-stat green">
        <div class="ps-icon" style="color:var(--green)">${I('i-hourglass')}</div>
        <div class="ps-val">08H : 52M</div>
        <div class="ps-label">Till EOD</div>
      </div>
      <div class="punch-stat">
        <div class="ps-icon" style="color:var(--green)">${I('i-door')}</div>
        <div class="ps-val">Open</div>
        <div class="ps-label">Branch</div>
      </div>
    </div>

    <div class="punch-hero">
      <button class="punch-orb ${orbClass}" data-act="punch-hold" aria-label="${inLabel}">
        <div class="hold-ring"></div>
        ${I('i-finger-down')}
      </button>
      <div class="punch-label">${inLabel}</div>
      <div class="punch-sub">Press &amp; hold to confirm</div>
    </div>

    <div class="card" style="padding:6px 4px;margin-top:18px">
      <div class="punch-times">
        <div class="pt-cell">
          <div class="pt-icon" style="color:var(--green)">${I('i-clock')}</div>
          <div class="pt-val">05:06 PM</div>
          <div class="pt-label">Punch In</div>
        </div>
        <div class="pt-cell">
          <div class="pt-icon">${I('i-clock')}</div>
          <div class="pt-val ${state.punchedIn?'muted':''}">${outTime}</div>
          <div class="pt-label">Punch Out</div>
        </div>
        <div class="pt-cell">
          <div class="pt-icon" style="color:var(--blue)">${I('i-clock')}</div>
          <div class="pt-val">00:07</div>
          <div class="pt-label">Total Hrs</div>
        </div>
      </div>
    </div>

    <div class="title-sm">Today's status</div>
    <div class="info-list">
      <div class="info-row-card"><div class="ir-icon">${I('i-check')}</div><div><div class="ir-title">You're present today</div></div></div>
      <div class="info-row-card"><div class="ir-icon blue" style="background:var(--blue-soft);color:var(--blue)">${I('i-pin')}</div><div><div class="ir-title">Attendance from verified locations</div></div></div>
      <div class="info-row-card"><div class="ir-icon amber" style="background:var(--amber-soft);color:var(--amber)">${I('i-clock')}</div><div><div class="ir-title">Flexible working hours</div></div></div>
      <div class="info-row-card"><div class="ir-icon" style="background:var(--surface-3);color:var(--text-2)">${I('i-warn')}</div><div><div class="ir-title">Working hours: 9h · Overtime not allowed</div></div></div>
    </div>

    <div class="row-between" style="margin-top:18px"><div class="title-sm" style="margin:0">Location Timeline</div><span class="viewall" data-nav="punch-location">View Full ${I('i-chev-r')}</span></div>
    <div class="card tap" data-nav="punch-location" style="padding:0;overflow:hidden">
      <div style="background:linear-gradient(135deg,#E8F5F1,#D7EBE3);padding:30px 16px;text-align:center;color:var(--green-press);font-size:13px;font-weight:600;border-bottom:1px solid var(--line)">
        ${I('i-pin')} Head Office, Hazra Centre
      </div>
      <div style="padding:12px 14px;font-size:12px;color:var(--text-2)">Punched in at Head Office, 09:30 AM · 2 location pings since</div>
    </div>
  `;
}

function officeDashboard() {
  const p = personas[state.persona];
  return `
    <div class="profile-strip">
      <div class="pi-avatar">${p.initials || 'JS'}</div>
      <div style="flex:1;min-width:0">
        <div class="pi-name">Hey ${p.name.split(' ')[0]}!</div>
        <div class="pi-role">${p.role}</div>
        <div class="pi-pills">
          <span class="pi-pill">Verified</span>
        </div>
      </div>
    </div>

    <div class="title-sm">Employee Dashboard</div>
    <div class="action-grid">
      <button class="action-tile" data-nav="apply-request"><div class="at-icon">${I('i-card')}</div><div class="at-label">Apply Request</div></button>
      <button class="action-tile" data-nav="me-payslips"><div class="at-icon blue">${I('i-rupee')}</div><div class="at-label">Payslips</div></button>
      <button class="action-tile" data-nav="me-attendance"><div class="at-icon amber">${I('i-trend')}</div><div class="at-label">Statistics</div></button>
      <button class="action-tile" data-nav="me-leaves"><div class="at-icon purple">${I('i-leave')}</div><div class="at-label">Leaves</div></button>
      <button class="action-tile" data-nav="holidays"><div class="at-icon red">${I('i-gift')}</div><div class="at-label">Holidays</div></button>
      <button class="action-tile" data-nav="reports"><div class="at-icon">${I('i-chart')}</div><div class="at-label">Reports</div></button>
      <button class="action-tile" data-nav="documents"><div class="at-icon blue">${I('i-doc')}</div><div class="at-label">Documents</div></button>
      <button class="action-tile" data-nav="handbook"><div class="at-icon amber">${I('i-book')}</div><div class="at-label">Handbook</div></button>
    </div>

    <div class="row-between" style="margin-top:20px"><div class="title-sm" style="margin:0">Attendance Summary</div><span class="viewall" data-nav="me-attendance">May 2026 ${I('i-chev-r')}</span></div>
    <div class="att-pair">
      <div class="att-card">
        <div class="ac-grid">
          <div class="att-cell"><div class="ac-num g">6</div><div class="ac-lbl">Present</div></div>
          <div class="att-cell"><div class="ac-num">0</div><div class="ac-lbl">Late</div></div>
          <div class="att-cell"><div class="ac-num">0</div><div class="ac-lbl">Half day</div></div>
          <div class="att-cell"><div class="ac-num">0</div><div class="ac-lbl">Week off</div></div>
        </div>
      </div>
      <div class="att-card">
        <div class="ac-grid">
          <div class="att-cell"><div class="ac-num">0</div><div class="ac-lbl">Absent</div></div>
          <div class="att-cell"><div class="ac-num">0</div><div class="ac-lbl">Leaves</div></div>
          <div class="att-cell"><div class="ac-num r">5</div><div class="ac-lbl">Red flags</div></div>
          <div class="att-cell"><div class="ac-num a">1</div><div class="ac-lbl">Holiday</div></div>
        </div>
      </div>
    </div>
    <div style="font-size:12px;color:var(--text-2);text-align:center;margin-bottom:14px">Total Days: <b style="color:var(--text)">7</b> · Working Days: <b style="color:var(--text)">6</b></div>

    <div class="card tap" data-nav="employee-score">
      <div class="row-between">
        <div><div style="font-size:14px;font-weight:700;color:var(--text)">Employee Score</div><div style="font-size:11.5px;color:var(--text-2);margin-top:2px">Your performance this month</div></div>
        <div style="display:flex;align-items:baseline;gap:4px"><div style="font-size:24px;font-weight:700;color:var(--green);letter-spacing:-0.02em">82</div><div style="font-size:12px;color:var(--text-2)">/100</div></div>
      </div>
      <div style="height:6px;border-radius:3px;background:var(--surface-3);margin-top:12px;overflow:hidden"><div style="height:100%;width:82%;background:var(--green);border-radius:3px"></div></div>
    </div>
  `;
}

function officeNotice() {
  return `
    <div class="notice-card">
      <div class="nc-info">
        <div class="nc-title">Head Office</div>
        <div class="nc-meta">10:00 AM to 7:30 PM<br>Thursday, 07 May 2026<br><br><b style="color:var(--text)">Timezone</b><br>Asia/Kolkata</div>
      </div>
      <div class="clock">
        <span class="clock-tick t12">12</span>
        <span class="clock-tick t3">3</span>
        <span class="clock-tick t6">6</span>
        <span class="clock-tick t9">9</span>
        <span class="clock-pm">PM</span>
      </div>
    </div>

    <div class="row-between"><div class="title-sm" style="margin:0">Announcements</div><span class="viewall" data-nav="announcements">View All ${I('i-chev-r')}</span></div>
    <div class="announce-card" data-nav="announce-detail">
      <div class="an-thumb">194</div>
      <div class="an-info">
        <div class="an-tag">All Branches · 7 May</div>
        <div class="an-title">Test 3</div>
        <div class="an-body">Test announcement content. Tap to read more.</div>
      </div>
    </div>
    <div class="dots"><span class="on"></span><span></span><span></span><span></span><span></span></div>

    <div class="card tap" data-nav="handbook" style="display:flex;gap:12px;align-items:center;margin-top:14px">
      <div style="width:42px;height:42px;border-radius:50%;background:var(--amber-soft);color:var(--amber);display:flex;align-items:center;justify-content:center">${I('i-book')}</div>
      <div style="flex:1">
        <div style="font-size:14px;font-weight:700;color:var(--text)">Employee Handbook</div>
        <div style="font-size:11.5px;color:var(--text-2);margin-top:2px">Access policies, benefits, and company guidelines</div>
      </div>
      ${I('i-chev-r')}
    </div>

    <div class="title-sm" style="margin-top:18px">Employee of the Month <span style="color:var(--amber);font-weight:600">— Apr 2026</span></div>
    <div class="eotm-card">
      <div class="em-avatar">SS</div>
      <div style="flex:1">
        <div class="em-name">Sankha Subhra Moitra</div>
        <div class="em-meta">Branch: Head Office</div>
        <div class="em-score">Overall Score: <b>66.67</b></div>
      </div>
    </div>
  `;
}

function officeSalary() {
  const pct = 97.96; // earning portion
  const r = 80;
  const c = 2 * Math.PI * r;
  const dash = (pct/100) * c;
  return `
    <div class="salary-hero">
      <div class="salary-month" data-nav="month-picker">May 2026 ${I('i-chev-d')}</div>
      <div class="donut-wrap">
        <svg width="220" height="220" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="20"/>
          <circle cx="100" cy="100" r="${r}" fill="none" stroke="var(--blue)" stroke-width="20" stroke-dasharray="${dash} ${c}" stroke-dashoffset="0" transform="rotate(-90 100 100)" stroke-linecap="butt"/>
          <circle cx="100" cy="100" r="${r}" fill="none" stroke="var(--red)" stroke-width="20" stroke-dasharray="${c-dash} ${c}" stroke-dashoffset="${-dash}" transform="rotate(-90 100 100)" stroke-linecap="butt"/>
        </svg>
        <div class="donut-amt">
          <div class="da-val">₹7,302</div>
          <div class="da-label">Net Pay</div>
        </div>
      </div>
      <div class="salary-split">
        <div class="ss-cell"><div class="ss-val"><span class="ss-dot" style="background:var(--blue)"></span>₹7,452</div><div class="ss-label">Earning</div></div>
        <div class="ss-cell"><div class="ss-val"><span class="ss-dot" style="background:var(--red)"></span>₹150</div><div class="ss-label">Deduction</div></div>
      </div>
    </div>

    <div class="salary-note">
      As on <b>7th May 2026</b> · your next payslip will be generated in <b>24 days</b>.
    </div>

    <button class="salary-cta" data-nav="advance">Instant Salary Advance Loan</button>

    <div class="pillrow">
      ${['timesheet','earnings','allowance','deductions'].map(t => `<button class="pill-tab ${state.salaryTab===t?'active':''}" data-act="salary-tab" data-sub="${t}">${t === 'timesheet' ? 'Time Sheet' : t[0].toUpperCase()+t.slice(1)}</button>`).join('')}
    </div>

    ${state.salaryTab === 'timesheet' ? `
      <div class="list-card">
        <div class="list-row"><div class="lr-icon">${I('i-clock')}</div><div class="lr-body"><div class="lr-title">Month (Current)</div><div class="lr-sub">May 2026</div></div><span class="lr-trail">31 Days</span></div>
        <div class="list-row"><div class="lr-icon blue">${I('i-check')}</div><div class="lr-body"><div class="lr-title">Total Days Worked</div><div class="lr-sub">Up to 7th May</div></div><span class="lr-trail">6</span></div>
        <div class="list-row"><div class="lr-icon amber">${I('i-trend')}</div><div class="lr-body"><div class="lr-title">Avg Hours / Day</div></div><span class="lr-trail">8h 42m</span></div>
        <div class="list-row"><div class="lr-icon red">${I('i-warn')}</div><div class="lr-body"><div class="lr-title">Late Marks</div></div><span class="lr-trail">0</span></div>
      </div>
    ` : state.salaryTab === 'earnings' ? `
      <div class="list-card">
        <div class="list-row"><div class="lr-icon">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title">Basic</div></div><span class="lr-trail">₹4,500</span></div>
        <div class="list-row"><div class="lr-icon">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title">HRA</div></div><span class="lr-trail">₹2,250</span></div>
        <div class="list-row"><div class="lr-icon">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title">Conveyance</div></div><span class="lr-trail">₹700</span></div>
        <div class="list-row"><div class="lr-icon">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title"><b>Gross Earnings</b></div></div><span class="lr-trail"><b style="color:var(--green)">₹7,452</b></span></div>
      </div>
    ` : state.salaryTab === 'allowance' ? `
      <div class="list-card">
        <div class="list-row"><div class="lr-icon">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title">Special Allowance</div></div><span class="lr-trail">—</span></div>
        <div class="list-row"><div class="lr-icon">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title">Travel Allowance</div></div><span class="lr-trail">—</span></div>
      </div>
    ` : `
      <div class="list-card">
        <div class="list-row"><div class="lr-icon red">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title">PF (12%)</div></div><span class="lr-trail">₹150</span></div>
        <div class="list-row"><div class="lr-icon red">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title">Professional Tax</div></div><span class="lr-trail">—</span></div>
        <div class="list-row"><div class="lr-icon red">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title">TDS</div></div><span class="lr-trail">—</span></div>
      </div>
    `}
  `;
}

function officeManager() {
  const p = personas[state.persona];
  const isCEO = p.ceo;
  return `
    <div class="branch-bar">
      <div class="bb-info">
        <div class="bb-logo">L</div>
        <div>
          <div class="bb-name">${isCEO ? 'All Branches!' : 'Head Office'}</div>
          <div class="bb-sub">${isCEO ? 'Head Office, Ahmedabad' : 'Kolkata · 18 staff'}</div>
        </div>
      </div>
      <button class="change-btn" data-nav="branch-menu">Change Branch</button>
    </div>

    <div class="title-sm">Company Dashboard</div>
    <div class="action-grid">
      <button class="action-tile" data-nav="register"><div class="at-icon">${I('i-people')}</div><div class="at-label">Register</div></button>
      <button class="action-tile" data-nav="bg-verification"><div class="at-icon blue">${I('i-shield')}</div><div class="at-label">BG Verification</div></button>
      <button class="action-tile" data-nav="mgmt-review"><div class="at-icon red">${I('i-chart')}</div><div class="at-label">Mgmt Review</div><span class="at-badge">15</span></button>
      <button class="action-tile" data-nav="punch-location"><div class="at-icon amber">${I('i-pin')}</div><div class="at-label">Location</div></button>
      <button class="action-tile" data-nav="branches-list"><div class="at-icon">${I('i-bldg')}</div><div class="at-label">Branch</div></button>
      <button class="action-tile" data-nav="announcements"><div class="at-icon purple">${I('i-megaphone')}</div><div class="at-label">Announcement</div></button>
      <button class="action-tile" data-nav="documents"><div class="at-icon blue">${I('i-doc')}</div><div class="at-label">Documents</div></button>
      <button class="action-tile" data-nav="leaves-mgmt"><div class="at-icon">${I('i-leave')}</div><div class="at-label">Leaves</div></button>
      <button class="action-tile" data-nav="holidays"><div class="at-icon red">${I('i-gift')}</div><div class="at-label">Holidays</div></button>
      <button class="action-tile" data-nav="web-admin"><div class="at-icon">${I('i-monitor')}</div><div class="at-label">Web Admin</div></button>
      <button class="action-tile" data-nav="reports"><div class="at-icon amber">${I('i-chart')}</div><div class="at-label">Reports</div></button>
      <button class="action-tile" data-nav="approvals"><div class="at-icon">${I('i-check')}</div><div class="at-label">Approvals</div><span class="at-badge">${isCEO?5:4}</span></button>
    </div>

    <div class="row-between" style="margin-top:20px"><div class="title-sm" style="margin:0">Attendance Summary</div><span class="viewall" data-nav="reports">Today (May 07) ${I('i-chev-r')}</span></div>
    <div class="pulse-card">
      <div class="pulse-header">
        <div>
          <div class="pulse-stat">${isCEO?'7':'7'}<small>/${isCEO?'23':'18'}</small></div>
          <div class="pulse-sub">Present at ${isCEO ? 'all branches' : 'Head Office'}</div>
        </div>
        <div style="text-align:right;font-size:12px;color:var(--text-2)">${isCEO ? '3 branches' : '1 branch'}</div>
      </div>
      <div class="pulse-bar">
        <div class="pulse-seg s-p" style="flex:${isCEO?7:7}"></div>
        <div class="pulse-seg s-a" style="flex:${isCEO?15:10}"></div>
        <div class="pulse-seg s-l" style="flex:1"></div>
      </div>
      <div class="pulse-legend">
        <span><span class="ld" style="background:var(--green)"></span>Present ${isCEO?7:7}</span>
        <span><span class="ld" style="background:var(--red)"></span>Absent ${isCEO?15:10}</span>
        <span><span class="ld" style="background:var(--blue)"></span>Leave 1</span>
      </div>
    </div>

    <div class="att-pair">
      <div class="att-card">
        <div class="ac-grid">
          <div class="att-cell"><div class="ac-num g">${isCEO?7:7}</div><div class="ac-lbl">Present</div></div>
          <div class="att-cell"><div class="ac-num">0</div><div class="ac-lbl">Late</div></div>
          <div class="att-cell"><div class="ac-num">1</div><div class="ac-lbl">Half Day</div></div>
          <div class="att-cell"><div class="ac-num">0</div><div class="ac-lbl">Week off</div></div>
        </div>
      </div>
      <div class="att-card">
        <div class="ac-grid">
          <div class="att-cell"><div class="ac-num r">${isCEO?15:10}</div><div class="ac-lbl">Absent</div></div>
          <div class="att-cell"><div class="ac-num">1</div><div class="ac-lbl">Leaves</div></div>
          <div class="att-cell"><div class="ac-num a">${isCEO?5:3}</div><div class="ac-lbl">Red flags</div></div>
          <div class="att-cell"><div class="ac-num">0</div><div class="ac-lbl">Holiday</div></div>
        </div>
      </div>
    </div>
    <div style="font-size:12px;color:var(--text-2);text-align:center">Total Staff: <b style="color:var(--text)">${isCEO?23:18}</b></div>
  `;
}

/* ============================================================
   SUB-SCREENS (deep nav)
============================================================ */
SCREENS['apply-request'] = {
  title: 'Apply Request',
  render: (p) => {
    const route = p === 'E' ? {tone:'green',title:'Auto-approved',note:"You're at the top of the chain — your requests auto-approve as soon as you submit."}
                : p === 'D' ? {tone:'blue',title:'Routes to L1',note:'Routes to L1 — Amulya Sir (CEO). Typical turnaround under 24 hours.'}
                : {tone:'gray',title:'Routes to your manager',note:"Routes to your reporting manager — Amulya Sir. You'll get a notification once it's reviewed."};
    const types = [
      {icon:'i-leave', tint:'', title:'Leave', sub:'Casual · Sick · Earned', nav:'apply-leave'},
      {icon:'i-clock', tint:'blue', title:'Overtime', sub:'Pre-approval for extra hours', nav:'apply-ot'},
      {icon:'i-rupee', tint:'amber', title:'Salary Advance', sub:'Recover from next payslip', nav:'apply-advance'},
      {icon:'i-card', tint:'purple', title:'Reimbursement', sub:'Travel, meals, supplies', nav:'apply-reimburse'},
      {icon:'i-pin', tint:'red', title:'Work-from-home', sub:'Single day or extended', act:'noop'},
      {icon:'i-doc', tint:'blue', title:'Document Request', sub:'Letters, certificates', act:'noop'},
    ];
    return `<div class="body-pad">
      <div style="font-size:13px;color:var(--text-2);margin-bottom:12px">Pick a request type</div>
      <div class="list-card">
        ${types.map(t => `<div class="list-row" ${t.nav?`data-nav="${t.nav}"`:`data-act="${t.act}"`}>
          <div class="lr-icon ${t.tint}">${I(t.icon)}</div>
          <div class="lr-body"><div class="lr-title">${t.title}</div><div class="lr-sub">${t.sub}</div></div>
          ${I('i-chev-r')}
        </div>`).join('')}
      </div>
      <div style="margin-top:14px;padding:12px 14px;border-radius:var(--r-md);background:${route.tone==='green'?'var(--green-soft)':route.tone==='blue'?'var(--blue-soft)':'var(--surface-3)'};border:1px solid ${route.tone==='green'?'#BFE8DC':route.tone==='blue'?'#C7DDF8':'var(--line)'};display:flex;gap:10px;align-items:flex-start">
        <div style="color:${route.tone==='green'?'var(--green)':route.tone==='blue'?'var(--blue)':'var(--text-3)'};margin-top:1px">${I('i-info')}</div>
        <div style="flex:1">
          <div style="font-size:12.5px;font-weight:700;color:${route.tone==='green'?'var(--green-press)':route.tone==='blue'?'var(--blue)':'var(--text-2)'}">${route.title}</div>
          <div style="font-size:11.5px;color:var(--text-2);line-height:1.5;margin-top:3px">${route.note}</div>
        </div>
      </div>
    </div>`;
  }
};

const formScreenLight = (fields, label, kind) => `<div class="body-pad">${fields}
  <button class="btn-primary" style="margin-top:14px" data-act="submit-request" data-kind="${kind}">${label}</button>
</div>`;

SCREENS['apply-leave'] = { title:'Apply Leave', render:() => formScreenLight(`
  <div class="field"><label>Leave type</label><select><option>Casual Leave (8 remaining)</option><option>Sick Leave (3 remaining)</option><option>Earned Leave (1 remaining)</option></select></div>
  <div class="field-row">
    <div class="field"><label>From</label><input type="date" value="2026-05-15"></div>
    <div class="field"><label>To</label><input type="date" value="2026-05-17"></div>
  </div>
  <div class="field"><label>Reason</label><textarea rows="3" placeholder="Briefly describe…">Family function out of town</textarea></div>
`, 'Submit Request', 'Leave') };

SCREENS['apply-ot'] = { title:'Apply Overtime', render:() => formScreenLight(`
  <div class="field"><label>Date</label><input type="date" value="2026-05-08"></div>
  <div class="field-row">
    <div class="field"><label>Start</label><input type="time" value="19:00"></div>
    <div class="field"><label>End</label><input type="time" value="23:00"></div>
  </div>
  <div class="field"><label>Reason</label><textarea rows="3" placeholder="What requires overtime?"></textarea></div>
`, 'Request Overtime', 'Overtime') };

SCREENS['apply-advance'] = { title:'Salary Advance', render:() => formScreenLight(`
  <div class="field"><label>Amount (₹)</label><input type="number" value="15000"></div>
  <div class="field"><label>Recover from</label><select><option>Next month payslip</option><option>Split over 2 months</option><option>Split over 3 months</option></select></div>
  <div class="field"><label>Reason</label><textarea rows="3" placeholder="Brief reason"></textarea></div>
  <p style="font-size:11.5px;color:var(--text-3);margin:-4px 2px 0">Max eligibility: ₹35,000 (50% of monthly net)</p>
`, 'Submit Request', 'Advance') };

SCREENS['apply-reimburse'] = { title:'Reimbursement', render:() => formScreenLight(`
  <div class="field"><label>Category</label><select><option>Travel / Cab</option><option>Meals (client)</option><option>Office supplies</option><option>Internet / Phone</option></select></div>
  <div class="field-row">
    <div class="field"><label>Date</label><input type="date" value="2026-05-07"></div>
    <div class="field"><label>Amount (₹)</label><input type="number" placeholder="0"></div>
  </div>
  <div class="field"><label>Attach receipt</label><button class="btn-secondary" data-act="noop" data-toast="Picker would open" style="margin-top:4px">${I('i-paperclip')} Attach photo or PDF</button></div>
  <div class="field"><label>Description</label><textarea rows="2" placeholder="What is this for?"></textarea></div>
`, 'Submit Claim', 'Reimbursement') };

SCREENS['me-payslips'] = {
  title:'Payslips',
  render: () => {
    const slips = [
      {month:'May 2026', amount:'7,302', date:'Credited 1 May', current:true},
      {month:'Apr 2026', amount:'7,302', date:'Credited 1 Apr'},
      {month:'Mar 2026', amount:'7,302', date:'Credited 1 Mar'},
      {month:'Feb 2026', amount:'7,302', date:'Credited 1 Feb'},
      {month:'Jan 2026', amount:'7,302', date:'Credited 1 Jan'},
    ];
    return `<div class="body-pad">
      <div class="list-card">
        ${slips.map(s => `<div class="list-row" data-nav="payslip-detail" data-ctx-month="${s.month}" data-ctx-amount="${s.amount}">
          <div class="lr-icon ${s.current?'':'blue'}">${I('i-rupee')}</div>
          <div class="lr-body"><div class="lr-title">${s.month}${s.current?' <span class="pill green" style="margin-left:6px">Current</span>':''}</div><div class="lr-sub">₹${s.amount} · ${s.date}</div></div>
          ${I('i-chev-r')}
        </div>`).join('')}
      </div>
    </div>`;
  }
};

SCREENS['payslip-detail'] = {
  title: (ctx) => ctx.month || 'Payslip',
  render: (p, ctx) => `<div class="body-pad">
    <div class="salary-hero" style="padding-top:8px">
      <div class="donut-amt" style="position:static"><div class="da-val">₹${ctx.amount || '7,302'}</div><div class="da-label">Net Pay</div></div>
    </div>
    <div class="title-sm">Earnings</div>
    <div class="list-card">
      <div class="list-row"><div class="lr-icon">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title">Basic</div></div><span class="lr-trail">₹4,500</span></div>
      <div class="list-row"><div class="lr-icon">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title">HRA</div></div><span class="lr-trail">₹2,250</span></div>
      <div class="list-row"><div class="lr-icon">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title">Conveyance</div></div><span class="lr-trail">₹700</span></div>
    </div>
    <div class="title-sm">Deductions</div>
    <div class="list-card">
      <div class="list-row"><div class="lr-icon red">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title">PF</div></div><span class="lr-trail">₹150</span></div>
    </div>
    <button class="btn-primary" style="margin-top:14px" data-act="noop" data-toast="Downloading payslip.pdf">${I('i-download')} Download PDF</button>
  </div>`
};

SCREENS['me-leaves'] = {
  title:'My Leaves',
  render: () => `<div class="body-pad">
    <div class="att-pair">
      <div class="att-card"><div class="ac-grid"><div class="att-cell"><div class="ac-num g">12</div><div class="ac-lbl">Available</div></div><div class="att-cell"><div class="ac-num">3</div><div class="ac-lbl">Used</div></div></div></div>
      <div class="att-card"><div class="ac-grid"><div class="att-cell"><div class="ac-num a">1</div><div class="ac-lbl">Pending</div></div><div class="att-cell"><div class="ac-num">15</div><div class="ac-lbl">Yearly</div></div></div></div>
    </div>
    <div class="title-sm">Balance by type</div>
    <div class="list-card">
      <div class="list-row" data-act="noop"><div class="lr-icon">${I('i-leave')}</div><div class="lr-body"><div class="lr-title">Casual Leave</div><div class="lr-sub">8 of 10 remaining</div></div>${I('i-chev-r')}</div>
      <div class="list-row" data-act="noop"><div class="lr-icon blue">${I('i-pin')}</div><div class="lr-body"><div class="lr-title">Sick Leave</div><div class="lr-sub">3 of 5 remaining</div></div>${I('i-chev-r')}</div>
      <div class="list-row" data-act="noop"><div class="lr-icon amber">${I('i-gift')}</div><div class="lr-body"><div class="lr-title">Earned Leave</div><div class="lr-sub">1 carried over</div></div>${I('i-chev-r')}</div>
    </div>
    <button class="btn-primary" style="margin-top:14px" data-nav="apply-leave">${I('i-plus')} Apply Leave</button>
  </div>`
};

SCREENS['me-attendance'] = {
  title:'My Attendance',
  render: () => {
    const days = ['M','T','W','T','F','S','S'];
    const data = ['p','p','p','h','p','o','o','p','p','l','p','p','o','o','p','p','p','p','p','o','o','p','p','p','a','p','o','o','p','p','c','','','',''];
    const map = {p:'#00B386', a:'#E5524F', l:'#1A73E8', h:'#9CA0AB', o:'transparent', c:'#FBBF24'};
    return `<div class="body-pad">
      <div class="att-pair">
        <div class="att-card"><div class="ac-grid"><div class="att-cell"><div class="ac-num g">22</div><div class="ac-lbl">Present</div></div><div class="att-cell"><div class="ac-num r">1</div><div class="ac-lbl">Absent</div></div></div></div>
        <div class="att-card"><div class="ac-grid"><div class="att-cell"><div class="ac-num">1</div><div class="ac-lbl">Leave</div></div><div class="att-cell"><div class="ac-num g">96%</div><div class="ac-lbl">Score</div></div></div></div>
      </div>
      <div class="title-sm">May 2026</div>
      <div class="card">
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;font-size:10px;color:var(--text-3);margin-bottom:6px;font-weight:600">
          ${days.map(d=>`<div>${d}</div>`).join('')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">
          ${data.map((s,i)=>`<div style="aspect-ratio:1;border-radius:6px;background:${s?(map[s]||'transparent'):'transparent'};opacity:${s==='o'?'0.25':s==='h'?'0.4':'0.9'};display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:600">${s && s!=='o' ? (i+1) : ''}</div>`).join('')}
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:12px;font-size:11px;color:var(--text-2)">
          <span><span style="width:8px;height:8px;border-radius:2px;background:#00B386;display:inline-block;vertical-align:middle;margin-right:4px"></span>Present</span>
          <span><span style="width:8px;height:8px;border-radius:2px;background:#E5524F;display:inline-block;vertical-align:middle;margin-right:4px"></span>Absent</span>
          <span><span style="width:8px;height:8px;border-radius:2px;background:#1A73E8;display:inline-block;vertical-align:middle;margin-right:4px"></span>Leave</span>
          <span><span style="width:8px;height:8px;border-radius:2px;background:#FBBF24;display:inline-block;vertical-align:middle;margin-right:4px"></span>Today</span>
        </div>
      </div>
    </div>`;
  }
};

SCREENS['holidays'] = {
  title:'Upcoming Holidays',
  render: () => {
    const list = [
      {d:'15', m:'May', name:'Buddha Purnima', day:'Wednesday'},
      {d:'26', m:'May', name:'Memorial Day', day:'Sunday'},
      {d:'15', m:'Aug', name:'Independence Day', day:'Friday'},
      {d:'02', m:'Oct', name:'Gandhi Jayanti', day:'Friday'},
      {d:'31', m:'Oct', name:'Diwali', day:'Saturday'},
      {d:'25', m:'Dec', name:'Christmas', day:'Friday'},
    ];
    return `<div class="body-pad"><div class="list-card">
      ${list.map(h => `<div class="list-row"><div style="width:42px;text-align:center;flex:0 0 auto;background:var(--green-soft);border-radius:8px;padding:4px 0"><div style="font-size:14px;font-weight:700;color:var(--green-press);line-height:1">${h.d}</div><div style="font-size:9px;color:var(--green-press);text-transform:uppercase;margin-top:1px">${h.m}</div></div><div class="lr-body"><div class="lr-title">${h.name}</div><div class="lr-sub">${h.day}</div></div></div>`).join('')}
    </div></div>`;
  }
};

SCREENS['documents'] = {
  title:'Documents',
  render: () => `<div class="body-pad"><div class="list-card">
    <div class="list-row" data-nav="me-payslips"><div class="lr-icon">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title">Payslips</div><div class="lr-sub">5 documents</div></div>${I('i-chev-r')}</div>
    <div class="list-row" data-act="noop"><div class="lr-icon blue">${I('i-card')}</div><div class="lr-body"><div class="lr-title">ID Proofs</div><div class="lr-sub">Aadhaar, PAN</div></div>${I('i-chev-r')}</div>
    <div class="list-row" data-act="noop"><div class="lr-icon amber">${I('i-doc')}</div><div class="lr-body"><div class="lr-title">Offer Letter</div></div>${I('i-chev-r')}</div>
    <div class="list-row" data-act="noop"><div class="lr-icon">${I('i-shield')}</div><div class="lr-body"><div class="lr-title">BG Verification</div><div class="lr-sub">Cleared · 12 Jan 2024</div></div>${I('i-chev-r')}</div>
    <div class="list-row" data-act="noop"><div class="lr-icon red">${I('i-doc')}</div><div class="lr-body"><div class="lr-title">Form 16 (FY24-25)</div><div class="lr-sub">1.2 MB · 28 Apr 2025</div></div>${I('i-chev-r')}</div>
  </div></div>`
};

SCREENS['handbook'] = {
  title:'Employee Handbook',
  render: () => `<div class="body-pad">
    <p style="font-size:12.5px;color:var(--text-2);margin:0 0 10px">Liberty Infospace · v3.2 · updated 1 Apr 2026</p>
    <div class="list-card">
      ${[
        ['i-book','1. Code of Conduct','Workplace behavior, ethics'],
        ['i-clock','2. Attendance & Working Hours','9:30 – 6:30, flexible'],
        ['i-leave','3. Leave Policy','15 PL · 12 SL · 12 CL'],
        ['i-rupee','4. Compensation & Payroll','Monthly · 1st · UPI'],
        ['i-shield','5. Data Protection','Confidentiality, IP, NDA'],
        ['i-people','6. Anti-Harassment','Zero tolerance, POSH'],
      ].map(([i,t,s]) => `<div class="list-row" data-act="noop"><div class="lr-icon amber">${I(i)}</div><div class="lr-body"><div class="lr-title">${t}</div><div class="lr-sub">${s}</div></div>${I('i-chev-r')}</div>`).join('')}
    </div>
    <button class="btn-primary" style="margin-top:14px" data-act="noop" data-toast="Downloading handbook.pdf">${I('i-download')} Download PDF (1.8 MB)</button>
  </div>`
};

SCREENS['approvals'] = {
  title:'Approvals',
  render: (p) => {
    const isCEO = p === 'E';
    const rows = [
      ...(isCEO ? [{n:'Karthik Iyer', av:'av5', meta:'Branch Manager · Mumbai · 20-22 May', type:'Casual Leave Request', tier:'L2'}] : []),
      {n:'Priya Sharma', av:'av4', meta:'Sales Exec · Kolkata · 15-17 May', type:'Casual Leave Request'},
      {n:'Rahul Mehta', av:'av3', meta:'Designer · 4 hours', type:'Overtime Request'},
      {n:'Soumyadeep', av:'av2', meta:'Developer · ₹8,000', type:'Salary Advance'},
      {n:'Rounik T', av:'av1', meta:'Developer · 9 May', type:'Sick Leave Request'},
    ];
    return `<div class="body-pad">
      <div class="chips">
        <button class="chip active">All (${rows.length})</button>
        <button class="chip">Leaves</button>
        <button class="chip">OT</button>
        <button class="chip">Advance</button>
        ${isCEO?'<button class="chip">From managers (1)</button>':''}
      </div>
      ${rows.map(r => `<div class="approval">
        <div class="approval-head">
          <div class="avatar ${r.av}">${r.n.split(' ').map(x=>x[0]).join('').slice(0,2)}</div>
          <div style="flex:1"><div class="ah-name">${r.n}${r.tier?` <span class="pill blue" style="margin-left:4px">${r.tier}</span>`:''}</div><div class="ah-meta">${r.meta}</div></div>
        </div>
        <div class="approval-type">${r.type}</div>
        <div class="approval-acts">
          <button class="btn-reject" data-act="reject">Reject</button>
          <button class="btn-approve" data-act="approve">Approve</button>
        </div>
      </div>`).join('')}
    </div>`;
  }
};

SCREENS['notifications'] = {
  title:'Notifications',
  render: () => {
    const items = [
      {icon:'i-check', tone:'', title:'Casual Leave approved', meta:'By Amulya Sir · 2 min ago'},
      {icon:'i-rupee', tone:'green', title:'Salary credited', meta:'₹7,302 · April · UPI'},
      {icon:'i-megaphone', tone:'purple', title:'Test announcement', meta:'All Branches · 7 May'},
      {icon:'i-bell-add', tone:'amber', title:'Reminder · Submit weekly report', meta:'Today, 4:00 PM'},
      {icon:'i-meet', tone:'blue', title:'Liberty Kolkata Dev starts in 30 min', meta:'2:00 PM · Group'},
      {icon:'i-people', tone:'', title:'Rounik joined iOS Testing Group', meta:'Yesterday'},
    ];
    return `<div class="body-pad"><div class="list-card">
      ${items.map(n => `<div class="list-row" data-act="noop"><div class="lr-icon ${n.tone}">${I(n.icon)}</div><div class="lr-body"><div class="lr-title">${n.title}</div><div class="lr-sub">${n.meta}</div></div></div>`).join('')}
    </div></div>`;
  }
};

SCREENS['chat-thread'] = {
  title: (ctx) => (CHATS.find(c => c.id === ctx.id)?.name || 'Chat'),
  render: (p, ctx) => {
    const sample = {
      ai:[
        {dir:'in', text:"Morning Sayantan! Want me to summarise today?", ts:'9:35 AM'},
        {dir:'out', text:'Yeah go ahead.', ts:'9:36 AM'},
        {dir:'in', text:'9 AM Design Sync · 11:30 review · 2 PM Liberty Kolkata standup. Reply "remind" to ping you 10 min before each.', ts:'9:36 AM'},
        {dir:'out', text:"Got it — I'll handle it.", ts:'5:06 PM'},
      ],
      amulya:[
        {dir:'in', text:'Hey, you around?', ts:'4:48 PM'},
        {dir:'out', text:'Yep, what\'s up?', ts:'4:50 PM'},
        {dir:'in', text:'Quick call before EOD? 15 mins should do.', ts:'5:02 PM'},
        {dir:'out', text:'Sounds good, thanks.', ts:'5:06 PM'},
      ],
      kolkata:[
        {dir:'in', text:'Standup at 2 PM today, share blockers ahead 🙏', ts:'9:10 AM'},
        {dir:'in', text:'Anyone free to pair on the staging issue?', ts:'11:25 AM'},
        {dir:'out', text:'I\'m on it, 30 min.', ts:'11:30 AM'},
        {dir:'in', text:'Sukanta: deploying tonight 🚀', ts:'5:06 PM'},
      ],
    };
    const msgs = sample[ctx.id] || [{dir:'in', text:'Hi! Start a conversation.', ts:'now'}];
    return `<div class="thread">
      <div class="thread-day">Today</div>
      ${msgs.map(m => `<div class="msg ${m.dir}"><div class="bubble">${m.text}</div><div class="ts">${m.ts}</div></div>`).join('')}
    </div>
    <div class="thread-input">
      <input type="text" placeholder="Message…" id="msgInput">
      <button class="send" data-act="noop" data-toast="(demo) message sent">${I('i-send')}</button>
    </div>`;
  }
};

SCREENS['task-detail'] = {
  title: (ctx) => ctx.title || 'Task',
  render: (p, ctx) => `<div class="body-pad">
    <h2 style="font-size:18px;font-weight:700;margin:6px 0">${ctx.title || 'Stress Test Report'}</h2>
    <div style="display:flex;gap:6px;margin-bottom:16px"><span class="pill amber">Due Today</span><span class="pill blue">#WORK</span></div>
    <div class="title-sm">Details</div>
    <div class="list-card">
      <div class="list-row"><div class="lr-body"><div class="lr-sub">Assigned to</div><div class="lr-title">Sayantan Ghosh</div></div></div>
      <div class="list-row"><div class="lr-body"><div class="lr-sub">Created by</div><div class="lr-title">Amulya Sir</div></div></div>
      <div class="list-row"><div class="lr-body"><div class="lr-sub">Due</div><div class="lr-title" style="color:var(--green)">11:30 AM today</div></div></div>
      <div class="list-row"><div class="lr-body"><div class="lr-sub">Priority</div><div class="lr-title">High</div></div></div>
    </div>
    <div class="title-sm">Description</div>
    <p style="font-size:13px;color:var(--text-2);line-height:1.55;margin:0 0 16px">Run stress tests on the API capacity tier and document the failure modes. Share preliminary findings in #WORK chat before EOD.</p>
    <button class="btn-primary" data-act="submit-form" data-toast="Marked done">${I('i-check')} Mark Done</button>
  </div>`
};

SCREENS['meet-detail'] = {
  title: (ctx) => ctx.title || 'Meeting',
  render: (p, ctx) => `<div class="body-pad">
    <h2 style="font-size:18px;font-weight:700;margin:6px 0">${ctx.title || 'Meeting'}</h2>
    <p style="font-size:12px;color:var(--text-2);margin:0 0 16px">Today · 2:00 – 3:00 PM · Group call · 8 invitees</p>
    <button class="btn-primary" data-act="noop" data-toast="Joining meeting…">${I('i-meet')} Join now</button>
    <div class="title-sm">Attendees</div>
    <div class="list-card">
      ${['Amulya Sir','Sukanta','Rounik T','Sayantan'].map((n,i) => `<div class="list-row"><div class="avatar av${(i%5)+1}" style="width:30px;height:30px;font-size:11px">${n.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div class="lr-body"><div class="lr-title">${n}</div></div><span class="lr-trail">${i<3?'Confirmed':'You'}</span></div>`).join('')}
    </div>
  </div>`
};

SCREENS['reminder-detail'] = {
  title: 'Reminder',
  render: (p, ctx) => `<div class="body-pad">
    <h2 style="font-size:18px;font-weight:700;margin:6px 0">${ctx.title || 'Reminder'}</h2>
    <p style="font-size:12px;color:var(--text-2)">Today · 4:00 PM · Notifies you when it triggers</p>
    <button class="btn-primary" style="margin-top:14px" data-act="submit-form" data-toast="Snoozed 1h">Snooze 1 hour</button>
  </div>`
};

SCREENS['day-detail'] = {
  title: (ctx) => `May ${ctx.date || '7'}, 2026`,
  render: (p, ctx) => `<div class="body-pad">
    <div class="empty"><div class="empty-icon">${I('i-leave')}</div><div class="empty-title">Day view</div><div class="empty-sub">Full day timeline for ${ctx.date || '7'} May.</div></div>
  </div>`
};

SCREENS['birthday-detail'] = {
  title: 'Birthday',
  render: (p, ctx) => `<div class="body-pad" style="text-align:center;padding-top:30px">
    <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#F59E0B,#F97316);margin:0 auto 14px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:700">RT</div>
    <h2 style="font-size:20px;font-weight:700;margin:0">${ctx.name || 'Rounik Tarafder'}</h2>
    <p style="font-size:12px;color:var(--text-2);margin:4px 0 18px">Developer · Head Office</p>
    <button class="btn-primary" data-act="noop" data-toast="Wish sent 🎂">🎂 Send birthday wish</button>
  </div>`
};

SCREENS['punch-location'] = {
  title:'Location Timeline',
  render: () => `<div class="body-pad">
    <div class="card tap" style="padding:0;overflow:hidden;margin-bottom:14px">
      <div style="background:linear-gradient(135deg,#E8F5F1,#D7EBE3);padding:50px 16px;text-align:center;color:var(--green-press);font-size:14px;font-weight:600;border-bottom:1px solid var(--line)">${I('i-pin')} Head Office, Hazra Centre</div>
      <div style="padding:14px;font-size:12px;color:var(--text-2)">Geofence: 200m radius · verified</div>
    </div>
    <div class="title-sm">Pings today</div>
    <div class="list-card">
      <div class="list-row"><div class="lr-icon">${I('i-clock')}</div><div class="lr-body"><div class="lr-title">09:30 — Punched In</div><div class="lr-sub">Head Office · verified</div></div></div>
      <div class="list-row"><div class="lr-icon blue">${I('i-pin')}</div><div class="lr-body"><div class="lr-title">12:42 — Location ping</div><div class="lr-sub">Head Office (in geofence)</div></div></div>
      <div class="list-row"><div class="lr-icon blue">${I('i-pin')}</div><div class="lr-body"><div class="lr-title">15:15 — Location ping</div><div class="lr-sub">Head Office</div></div></div>
    </div>
  </div>`
};

SCREENS['company-menu'] = {
  title:'Company',
  render: (p) => {
    const isCEO = p === 'E';
    return `<div class="body-pad">
      <div class="card" style="display:flex;gap:12px;align-items:center;margin-bottom:14px">
        <div style="width:42px;height:42px;border-radius:10px;background-image:linear-gradient(135deg,#fff 0%,#fff 50%,#dc2626 50%,#dc2626 100%);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#111">L</div>
        <div style="flex:1"><div style="font-size:15px;font-weight:700">Liberty Infospace</div><div style="font-size:11.5px;color:var(--text-2);margin-top:1px">${isCEO ? 'CEO · 3 branches · 23 staff' : 'Member · Head Office'}</div></div>
      </div>
      <div class="title-sm">Manage</div>
      <div class="list-card">
        ${isCEO ? `<div class="list-row" data-act="noop" data-toast="Company Settings"><div class="lr-icon">${I('i-bldg')}</div><div class="lr-body"><div class="lr-title">Company Settings</div><div class="lr-sub">Policies, billing, integrations</div></div>${I('i-chev-r')}</div>` : ''}
        <div class="list-row" data-act="noop" data-toast="Switch Company"><div class="lr-icon blue">${I('i-bldg')}</div><div class="lr-body"><div class="lr-title">Switch Company</div><div class="lr-sub">Liberty Infospace · 1 of 2</div></div>${I('i-chev-r')}</div>
        <div class="list-row" data-nav="register"><div class="lr-icon amber">${I('i-people')}</div><div class="lr-body"><div class="lr-title">Members</div><div class="lr-sub">23 staff across 3 branches</div></div>${I('i-chev-r')}</div>
      </div>
    </div>`;
  }
};

SCREENS['branch-menu'] = {
  title:'Branch',
  render: (p) => {
    const isCEO = p === 'E';
    const isManager = p === 'D' || p === 'E';
    return `<div class="body-pad">
      <div class="card" style="display:flex;gap:12px;align-items:center;margin-bottom:14px">
        <div style="width:42px;height:42px;border-radius:10px;background:var(--green-soft);color:var(--green);display:flex;align-items:center;justify-content:center">${I('i-bldg')}</div>
        <div style="flex:1"><div style="font-size:15px;font-weight:700">${isCEO ? 'All Branches' : 'Head Office'}</div><div style="font-size:11.5px;color:var(--text-2);margin-top:1px">${isCEO?'All branches scope':'Kolkata · 18 staff'}</div></div>
      </div>
      <div class="title-sm">Manage</div>
      <div class="list-card">
        ${isManager ? `<div class="list-row" data-act="noop" data-toast="Branch Settings"><div class="lr-icon">${I('i-bldg')}</div><div class="lr-body"><div class="lr-title">Branch Settings</div><div class="lr-sub">Hours, holidays, locations</div></div>${I('i-chev-r')}</div>` : ''}
        <div class="list-row" data-nav="branches-list"><div class="lr-icon blue">${I('i-bldg')}</div><div class="lr-body"><div class="lr-title">Switch Branch</div><div class="lr-sub">${isCEO?'3 branches available':'No other branches'}</div></div>${I('i-chev-r')}</div>
        <div class="list-row" data-nav="punch-location"><div class="lr-icon amber">${I('i-pin')}</div><div class="lr-body"><div class="lr-title">Location</div><div class="lr-sub">4B/2 Hazra Rd, Kolkata</div></div>${I('i-chev-r')}</div>
      </div>
    </div>`;
  }
};

SCREENS['register'] = {
  title:'Register',
  render: () => {
    const emps = [
      {n:'Amulya Sir', av:'av2', meta:'CEO · Head Office'},
      {n:'Sayantan Ghosh', av:'av1', meta:'JUNIOR AIML · Head Office'},
      {n:'Sukanta Goswami', av:'av3', meta:'Designer · Head Office'},
      {n:'Rounik Tarafder', av:'av4', meta:'Developer · Head Office'},
      {n:'Sankha Subhra Moitra', av:'av5', meta:'Developer · Head Office'},
      {n:'Priya Sharma', av:'av3', meta:'Sales Exec · Kolkata'},
      {n:'Rahul Mehta', av:'av2', meta:'Designer · Head Office'},
      {n:'Soumyadeep Goswami', av:'av1', meta:'Developer · Mumbai'},
    ];
    return `<div class="body-pad">
      <div class="search">${I('i-search')} Search employees</div>
      <div class="list-card">
        ${emps.map(e => `<div class="list-row" data-act="noop" data-toast="Employee profile">
          <div class="avatar ${e.av}">${e.n.split(' ').map(x=>x[0]).join('').slice(0,2)}</div>
          <div class="lr-body"><div class="lr-title">${e.n}</div><div class="lr-sub">${e.meta}</div></div>
          ${I('i-chev-r')}
        </div>`).join('')}
      </div>
    </div>`;
  }
};

SCREENS['bg-verification'] = { title:'BG Verification', render: () => `<div class="body-pad">
  <div class="att-pair">
    <div class="att-card"><div class="ac-grid"><div class="att-cell"><div class="ac-num g">15</div><div class="ac-lbl">Verified</div></div><div class="att-cell"><div class="ac-num a">2</div><div class="ac-lbl">In progress</div></div></div></div>
    <div class="att-card"><div class="ac-grid"><div class="att-cell"><div class="ac-num r">1</div><div class="ac-lbl">Failed</div></div><div class="att-cell"><div class="ac-num">0</div><div class="ac-lbl">Pending</div></div></div></div>
  </div>
  <div class="title-sm">Active checks</div>
  <div class="list-card">
    <div class="list-row"><div class="lr-icon">${I('i-shield')}</div><div class="lr-body"><div class="lr-title">Soumyadeep · Developer</div><div class="lr-sub">Address + Education · 3 days</div></div><span class="pill amber">In progress</span></div>
    <div class="list-row"><div class="lr-icon">${I('i-shield')}</div><div class="lr-body"><div class="lr-title">Rahul Mehta · Designer</div><div class="lr-sub">Criminal + Employment · 1 day</div></div><span class="pill amber">In progress</span></div>
  </div>
</div>`};

SCREENS['mgmt-review'] = { title:'Management Review', render: () => `<div class="body-pad">
  <p style="font-size:12.5px;color:var(--text-2);margin:0 0 12px">15 items needing your attention</p>
  <div class="list-card">
    <div class="list-row" data-act="noop"><div class="lr-icon red">${I('i-trend')}</div><div class="lr-body"><div class="lr-title">Attrition spike · Kolkata</div><div class="lr-sub">3 exits this month vs avg 1</div></div>${I('i-chev-r')}</div>
    <div class="list-row" data-act="noop"><div class="lr-icon amber">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title">Payroll variance · +6.2%</div><div class="lr-sub">May vs Apr</div></div>${I('i-chev-r')}</div>
    <div class="list-row" data-act="noop"><div class="lr-icon">${I('i-clock')}</div><div class="lr-body"><div class="lr-title">Late punches · 4 employees</div><div class="lr-sub">This week</div></div>${I('i-chev-r')}</div>
    <div class="list-row" data-act="noop"><div class="lr-icon blue">${I('i-leave')}</div><div class="lr-body"><div class="lr-title">Leave clusters · 22-24 May</div><div class="lr-sub">5 employees applied</div></div>${I('i-chev-r')}</div>
  </div>
</div>`};

SCREENS['announcements'] = { title:'Announcements', render: () => `<div class="body-pad">
  <button class="btn-primary" data-act="noop" data-toast="Compose">${I('i-megaphone')} Compose announcement</button>
  <div class="title-sm">Recent</div>
  <div class="list-card">
    <div class="list-row" data-nav="announce-detail"><div class="lr-icon purple">${I('i-megaphone')}</div><div class="lr-body"><div class="lr-title">Test announcement</div><div class="lr-sub">All Branches · 7 May · 194 reads</div></div>${I('i-chev-r')}</div>
    <div class="list-row" data-act="noop"><div class="lr-icon purple">${I('i-megaphone')}</div><div class="lr-body"><div class="lr-title">Quarterly results celebration</div><div class="lr-sub">All Branches · 28 Apr · 192 reads</div></div>${I('i-chev-r')}</div>
    <div class="list-row" data-act="noop"><div class="lr-icon purple">${I('i-megaphone')}</div><div class="lr-body"><div class="lr-title">Office closed for Holi</div><div class="lr-sub">All Branches · 14 Mar · 188 reads</div></div>${I('i-chev-r')}</div>
  </div>
</div>`};

SCREENS['announce-detail'] = { title:'Announcement', render: () => `<div class="body-pad">
  <p style="font-size:11px;color:var(--text-3);font-weight:600;letter-spacing:0.04em;text-transform:uppercase;margin:0 0 4px">All Branches · 7 May 2026</p>
  <h2 style="font-size:20px;font-weight:700;margin:0 0 14px">Test 3</h2>
  <p style="font-size:13.5px;color:var(--text-2);line-height:1.6">Test announcement content. This is a placeholder for the full text of the company-wide announcement, including any attached images or call-to-action.</p>
</div>`};

SCREENS['leaves-mgmt'] = SCREENS['approvals'];
SCREENS['reports'] = { title:'Reports', render: () => `<div class="body-pad"><div class="list-card">
  <div class="list-row" data-act="noop"><div class="lr-icon">${I('i-trend')}</div><div class="lr-body"><div class="lr-title">Attendance Report</div><div class="lr-sub">May 2026 · 96% avg</div></div>${I('i-chev-r')}</div>
  <div class="list-row" data-act="noop"><div class="lr-icon amber">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title">Payroll Report</div><div class="lr-sub">May 2026 · ₹19.4L</div></div>${I('i-chev-r')}</div>
  <div class="list-row" data-act="noop"><div class="lr-icon blue">${I('i-leave')}</div><div class="lr-body"><div class="lr-title">Leave Utilization</div><div class="lr-sub">34% of yearly quota</div></div>${I('i-chev-r')}</div>
  <div class="list-row" data-act="noop"><div class="lr-icon">${I('i-people')}</div><div class="lr-body"><div class="lr-title">Headcount</div><div class="lr-sub">23 staff · +2 vs Apr</div></div>${I('i-chev-r')}</div>
</div></div>`};

SCREENS['web-admin'] = { title:'Web Admin', render: () => `<div class="body-pad">
  <div class="empty"><div class="empty-icon">${I('i-monitor')}</div><div class="empty-title">Use the web console</div><div class="empty-sub">Web Admin gives you a full-screen experience for bulk operations, imports, exports, and audit logs.</div></div>
  <button class="btn-secondary" style="margin-top:6px" data-act="noop" data-toast="Web Admin URL copied">${I('i-paperclip')} Copy admin URL</button>
</div>`};

SCREENS['branches-list'] = { title:'Branches', render:(p) => {
  if (p !== 'E') return `<div class="body-pad"><div class="empty"><div class="empty-icon">${I('i-bldg')}</div><div class="empty-title">No other branches</div><div class="empty-sub">You only have access to Head Office.</div></div></div>`;
  return `<div class="body-pad"><div class="list-card">
    <div class="list-row" data-act="noop"><div class="lr-icon">${I('i-bldg')}</div><div class="lr-body"><div class="lr-title">Head Office · Ahmedabad</div><div class="lr-sub">12 staff · HQ</div></div>${I('i-chev-r')}</div>
    <div class="list-row" data-act="noop"><div class="lr-icon">${I('i-bldg')}</div><div class="lr-body"><div class="lr-title">Mumbai · Andheri East</div><div class="lr-sub">3 staff · since 2022</div></div>${I('i-chev-r')}</div>
    <div class="list-row" data-act="noop"><div class="lr-icon">${I('i-bldg')}</div><div class="lr-body"><div class="lr-title">Kolkata · Salt Lake</div><div class="lr-sub">8 staff · since 2020</div></div>${I('i-chev-r')}</div>
  </div></div>`;
}};

SCREENS['employee-score'] = { title:'Employee Score', render: () => `<div class="body-pad">
  <div class="card" style="text-align:center;padding:24px">
    <div style="font-size:42px;font-weight:700;color:var(--green);letter-spacing:-0.02em">82</div>
    <div style="font-size:13px;color:var(--text-2)">out of 100</div>
  </div>
  <div class="title-sm">Score breakdown</div>
  <div class="list-card">
    <div class="list-row"><div class="lr-icon">${I('i-check')}</div><div class="lr-body"><div class="lr-title">Attendance</div></div><span class="lr-trail">96%</span></div>
    <div class="list-row"><div class="lr-icon blue">${I('i-task')}</div><div class="lr-body"><div class="lr-title">Task completion</div></div><span class="lr-trail">88%</span></div>
    <div class="list-row"><div class="lr-icon amber">${I('i-star')}</div><div class="lr-body"><div class="lr-title">Peer review</div></div><span class="lr-trail">76%</span></div>
    <div class="list-row"><div class="lr-icon">${I('i-clock')}</div><div class="lr-body"><div class="lr-title">Punctuality</div></div><span class="lr-trail">94%</span></div>
  </div>
</div>`};

SCREENS['review-queue'] = { title:'Awaiting Review', render: () => `<div class="body-pad">
  <div class="list-card">
    <div class="list-row" data-nav="task-detail" data-ctx-title="Stress Test Report"><div class="lr-icon">${I('i-task')}</div><div class="lr-body"><div class="lr-title">Stress Test Capacity Report</div><div class="lr-sub">Delegated to Sayantan · marked done 4h ago</div></div>${I('i-chev-r')}</div>
  </div>
</div>`};

SCREENS['search'] = { title:'Search', render: () => `<div class="body-pad">
  <div class="empty"><div class="empty-icon">${I('i-search')}</div><div class="empty-title">Search anything</div><div class="empty-sub">Type to find tasks, meetings, people, documents.</div></div>
</div>`};

SCREENS['call'] = { title:'Call', render: () => `<div class="body-pad"><div class="empty"><div class="empty-icon">${I('i-phone')}</div><div class="empty-title">Call center</div><div class="empty-sub">Call recent contacts or dial in.</div></div></div>`};
SCREENS['cloud'] = { title:'Sync', render: () => `<div class="body-pad"><div class="empty"><div class="empty-icon">${I('i-cloud')}</div><div class="empty-title">All synced</div><div class="empty-sub">Last sync: just now</div></div></div>`};
SCREENS['agenda'] = { title:'Agenda', render: () => `<div class="body-pad"><div class="empty"><div class="empty-icon">${I('i-note')}</div><div class="empty-title">Full agenda</div><div class="empty-sub">List view of every event you have.</div></div></div>`};
SCREENS['more'] = { title:'More', render: () => `<div class="body-pad"><div class="list-card">
  <div class="list-row" data-act="noop" data-toast="Settings"><div class="lr-icon">${I('i-monitor')}</div><div class="lr-body"><div class="lr-title">Settings</div></div>${I('i-chev-r')}</div>
  <div class="list-row" data-act="noop" data-toast="Help"><div class="lr-icon blue">${I('i-info')}</div><div class="lr-body"><div class="lr-title">Help &amp; Support</div></div>${I('i-chev-r')}</div>
  <div class="list-row" data-act="sign-out"><div class="lr-icon red">${I('i-arrow-out')}</div><div class="lr-body"><div class="lr-title" style="color:var(--red)">Sign Out</div></div></div>
</div></div>`};
SCREENS['month-picker'] = { title:'Pick Month', render: () => `<div class="body-pad"><div class="empty"><div class="empty-icon">${I('i-leave')}</div><div class="empty-title">Month picker</div><div class="empty-sub">Tap to choose a different month.</div></div></div>`};

/* ============================================================
   PERSONA SWITCHER + INFO PANEL
============================================================ */
function renderPersonas() {
  const sw = document.getElementById('personaRow');
  sw.innerHTML = Object.entries(personas).map(([k,p]) => `
    <button class="persona-btn ${state.persona===k?'active':''}" data-persona="${k}">
      <span class="pb-tag">${k}</span>
      <span class="pb-name">${p.label}</span>
      <span class="pb-sub">${p.sub}</span>
    </button>
  `).join('');
  sw.querySelectorAll('.persona-btn').forEach(b => b.addEventListener('click', () => {
    state.persona = b.dataset.persona;
    const p = personas[state.persona];
    state.tab = p.tabs[0];
    state.officeTab = p.officeTabs ? p.officeTabs[0] : 'punchin';
    state.stack = [];
    render();
    document.getElementById('body').scrollTo(0,0);
  }));
}

function renderInfo() {
  const p = personas[state.persona];
  const info = document.getElementById('info');
  const top = state.stack[state.stack.length - 1];
  const screen = top ? (typeof SCREENS[top.id].title === 'function' ? SCREENS[top.id].title(top.ctx, state.persona) : SCREENS[top.id].title) :
                       state.tab === 'office' ? `Office › ${state.officeTab[0].toUpperCase()+state.officeTab.slice(1)}` :
                       state.tab[0].toUpperCase() + state.tab.slice(1);
  info.innerHTML = `
    <section>
      <h3>Currently viewing</h3>
      <div class="info-row"><span>Persona</span><b>${p.label}</b></div>
      <div class="info-row"><span>Screen</span><b>${screen}</b></div>
      <div class="info-row"><span>Tab count</span><b>${p.tabs.length}</b></div>
    </section>
    <section>
      <h3>Tab Bar (bottom)</h3>
      ${p.tabs.map((t,i) => `<div class="info-row"><span>${i+1}</span><b>${t[0].toUpperCase()+t.slice(1)}</b></div>`).join('')}
      ${p.officeTabs ? `<p class="note">Office has 5 top sub-tabs: ${p.officeTabs.map(t => t[0].toUpperCase()+t.slice(1)).join(' · ')}.</p>` : '<p class="note">App User has no Office tab.</p>'}
    </section>
    <section>
      <h3>Design system</h3>
      <p>Light theme · Groww emerald primary (#00B386) · GPay blue accent (#1A73E8). Big rounded cards, generous whitespace, friendly type.</p>
    </section>
    <section>
      <h3>What to try</h3>
      <p style="font-size:12px;line-height:1.7">
        • Today: tap a day, an event, the birthday card.<br>
        • Office › Punch In: hold the orb 1s to toggle.<br>
        • Office › Dashboard: tap Apply Request.<br>
        • Office › Salary: switch the Time Sheet / Earnings tabs.<br>
        • Office › Manager (D/E only): tap any tile + approve/reject.<br>
        • Chats: tap a row → message thread.<br>
        • Switch personas above to compare.
      </p>
    </section>`;
}

/* ============================================================
   RENDER
============================================================ */
function render() {
  renderHeader();
  renderTabs();
  document.getElementById('body').innerHTML = bodyHTML();
  wire(document.getElementById('body'));
  renderFabs();
  renderPersonas();
  renderInfo();
}

render();
