const I = (id) => `<svg><use href="#${id}"/></svg>`;

/* ─── PERSONAS ─── */
const PERSONAS = {
  A: { label:'A · App User',           sub:'Productivity-only · no employer',     name:'Jordan',         role:'Member',                  initials:'JD', branch:null,                       perms:'A' },
  B: { label:'B · L3 Employee',        sub:'HRMS employee · own data only',       name:'Sayantan Ghosh', role:'JUNIOR AIML · Head Office',initials:'SG', branch:'Head Office, Ahmedabad',   perms:'B', tier:'L3' },
  D: { label:'D · L2 Branch Manager',  sub:'HRMS + branch-scoped management',     name:'Sayantan Ghosh', role:'Branch Manager · Head Office',initials:'SG', branch:'Head Office, Ahmedabad', perms:'D', tier:'L2' },
  E: { label:'E · L1 CEO / Top Mgmt',  sub:'Company-wide + auto-approves own',    name:'Sayantan Ghosh', role:'CEO · Liberty Infospace', initials:'SG', branch:'All Branches',             perms:'E', tier:'L1' },
};

/* ─── PERMISSION MAP ─── */
/* This is the "scoped user thing" — when real tokens arrive,
   replace with a token-set lookup. UI shape doesn't change. */
const PERMS = {
  A: new Set(['tasks','chats','profile.basic','settings']),
  B: new Set(['tasks','chats','profile.basic','settings',
              'punch','attendance.own','salary.own','leaves.apply','leaves.view-own',
              'announcements.view','documents.own','handbook']),
  D: new Set(['tasks','chats','profile.basic','settings',
              'punch','attendance.own','salary.own','leaves.apply','leaves.view-own',
              'announcements.view','announcements.create','documents.own','handbook',
              'team.view','attendance.team.branch','leaves.approve.branch','reports.branch','register.branch','documents.team.branch']),
  E: new Set(['tasks','chats','profile.basic','settings',
              'punch','attendance.own','salary.own','leaves.apply','leaves.view-own',
              'announcements.view','announcements.create','documents.own','handbook',
              'team.view','attendance.team.all','leaves.approve.all','reports.all','register.all','documents.team.all',
              'company.settings','branches.switch','branches.manage','web-admin']),
};
function can(persona, perm) { return PERMS[persona].has(perm); }
function isHRMS(persona) { return persona !== 'A'; }
function isMgr(persona) { return persona === 'D' || persona === 'E'; }
function isCEO(persona) { return persona === 'E'; }

/* ─── STATE ─── */
const state = {
  persona:'B',
  tab:'today',          // today | tasks | chats | team | me
  stack:[],             // deep-nav
  taskChip:'all',
  chatChip:'all',
  todayDate:7,
  punchedIn:true,
  holdTimer:null,
  sheet:null,           // 'notifications' | null
  doneTasks:new Set(),
};

/* ─── UTILITIES ─── */
function toast(msg, kind='') {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = 'toast' + (kind ? ' '+kind : '');
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 200); }, 2000);
}
function nav(id, ctx={}) {
  if (!SCREENS[id]) { toast(`"${id}" — coming soon`); return; }
  state.stack.push({id, ctx:{...ctx}});
  render();
  document.getElementById('body').scrollTo(0,0);
}
function back() { state.stack.pop(); render(); document.getElementById('body').scrollTo(0,0); }
function openSheet(name) { state.sheet = name; render(); }
function closeSheet() { state.sheet = null; render(); }

/* ─── LOCKED CARD COMPONENT ─── */
function lockedCard(title, reason, learnLabel='Learn more') {
  return `<div class="locked">
    <div class="lk-icon">${I('i-lock')}</div>
    <div class="lk-body">
      <div class="lk-title">${title}</div>
      <div class="lk-sub">${reason}</div>
      <span class="lk-learn" data-act="locked-learn" data-toast="${reason}">${learnLabel} →</span>
    </div>
  </div>`;
}
const reasonHRMS  = 'Activate HRMS to unlock this feature for your account.';
const reasonMgr   = 'Manager permissions required. Ask your admin for access.';
const reasonCEO   = 'Available to L1 / company-wide roles.';

/* ─── DATA ─── */
const PINNED_TASKS = [
  {id:'t1', title:'Stress Test Capacity Report', due:'today'},
  {id:'t2', title:'Review onboarding doc',       due:'today'},
  {id:'t3', title:'Reply to Sukanta\'s thread',  due:'tomorrow'},
];
const ALL_TASKS = [
  {id:'t1', kind:'task',     section:'today',    title:'Stress Test Capacity Report', sub:'Due 11:30 AM · #WORK', when:'11:30 AM'},
  {id:'m1', kind:'meet',     section:'today',    title:'Design Sync',                 sub:'Sukanta · 30 min',       when:'9:00 AM'},
  {id:'m2', kind:'meet',     section:'today',    title:'Liberty Kolkata Dev',         sub:'Group · 1 hour',         when:'2:00 PM'},
  {id:'r1', kind:'reminder', section:'today',    title:'Submit weekly report',        sub:'Reminder',               when:'4:00 PM'},
  {id:'m3', kind:'meet',     section:'tomorrow', title:'Sprint Planning',             sub:'8 invitees · 1h',        when:'10:00 AM'},
  {id:'t2', kind:'task',     section:'tomorrow', title:'Update onboarding doc',       sub:'Task · Tomorrow',        when:'EOD'},
  {id:'n1', kind:'note',     section:'this-week',title:'Architecture review notes',   sub:'Draft · last edited yesterday', when:''},
];
const CHATS = [
  {id:'channel-announce', av:'channel', initials:'A', kind:'channel',  name:'Announcements', tag:'channel', preview:'Test 3 — Liberty Infospace', time:'7 May', unread:1},
  {id:'ai',               av:'ai',      initials:'AI',kind:'ai',       name:'EasyDo AI',        preview:"Got it — I'll handle it.",     time:'5:06 PM'},
  {id:'amulya',           av:'av2',     initials:'AS',kind:'dm',       name:'Amulya Sir',       preview:'Sounds good, thanks.',          time:'5:06 PM'},
  {id:'kolkata',          av:'av1',     initials:'LK',kind:'group',    name:'Liberty Kolkata Dev', preview:'Sukanta: deploying tonight 🚀', time:'5:06 PM', unread:2},
  {id:'uitest',           av:'av4',     initials:'UT',kind:'group',    name:'UI Testing',       preview:'Priya: can someone review screen 3?', time:'4:34 PM', unread:5},
  {id:'iostest',          av:'av3',     initials:'IT',kind:'group',    name:'iOS Testing Group',preview:'Rounik joined the group',       time:'Yesterday', unread:3},
  {id:'bug',              av:'av5',     initials:'BR',kind:'group',    name:'Bug Resolve 2025', preview:'Sankha Subhra left the group',  time:'Yesterday'},
  {id:'soumya',           av:'av2',     initials:'SG',kind:'dm',       name:'Soumyadeep Goswami', preview:'🤝 Meet at 4',                time:'Yesterday'},
];

/* ─── SCREEN REGISTRY ─── */
const SCREENS = {};

/* ─── HEADER ─── */
function renderHeader() {
  const p = PERSONAS[state.persona];
  const top = state.stack[state.stack.length - 1];
  const hdr = document.getElementById('hdr');
  if (top) {
    const title = typeof SCREENS[top.id].title === 'function' ? SCREENS[top.id].title(top.ctx, state.persona) : SCREENS[top.id].title;
    hdr.innerHTML = `
      <button class="hdr-back" data-act="back">${I('i-chev-l')}</button>
      <div class="hdr-title center">${title}</div>
      <button class="hdr-btn" data-act="open-notifs">${I('i-bell')}</button>`;
  } else {
    const tierBadge = p.tier ? `<span class="tier-pip">${p.tier.slice(1)}</span>` : '';
    const greeting = state.tab === 'today' ? hello() : tabTitle(state.tab);
    if (state.tab === 'today') {
      hdr.innerHTML = `
        <button class="hdr-greet" data-act="open-profile">
          <div class="hdr-avatar ${p.tier==='L1'?'tier':''}">${p.initials}${tierBadge}</div>
          <div style="min-width:0;flex:1">
            <div class="hdr-name">${greeting}, ${p.name.split(' ')[0]}</div>
            <div class="hdr-sub">${p.branch || 'Personal workspace'}</div>
          </div>
        </button>
        <button class="hdr-btn" data-act="open-search">${I('i-search')}</button>
        <button class="hdr-btn has-dot" data-act="open-notifs">${I('i-bell')}</button>`;
    } else {
      hdr.innerHTML = `
        <div class="hdr-title">${greeting}</div>
        <button class="hdr-btn" data-act="open-search">${I('i-search')}</button>
        <button class="hdr-btn has-dot" data-act="open-notifs">${I('i-bell')}</button>`;
    }
  }
  wire(hdr);
}
function hello() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}
function tabTitle(t) { return {today:'Today', tasks:'Tasks', chats:'Chats', team:'Team', me:'Me'}[t]; }

/* ─── TAB BAR ─── */
function renderTabs() {
  const tabs = [
    {id:'today', label:'Today', icon:'i-today'},
    {id:'tasks', label:'Tasks', icon:'i-task'},
    {id:'chats', label:'Chats', icon:'i-chat', badge: CHATS.filter(c=>c.unread).length || ''},
    {id:'team',  label:'Team',  icon:'i-team'},
    {id:'me',    label:'Me',    icon:'i-me'},
  ];
  const el = document.getElementById('tabs');
  el.innerHTML = tabs.map(t => `
    <button class="tab ${(state.stack.length===0 && state.tab===t.id)?'active':''}" data-tab="${t.id}">
      ${I(t.icon)}<span class="tab-l">${t.label}</span>
      ${t.badge ? `<span class="tab-badge">${t.badge}</span>` : ''}
    </button>`).join('');
  el.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => {
    state.tab = b.dataset.tab;
    state.stack = [];
    state.sheet = null;
    render();
    document.getElementById('body').scrollTo(0,0);
  }));
}

/* ─── OVERLAYS ─── */
function renderOverlay() {
  const el = document.getElementById('overlay');
  if (state.sheet === 'notifications') {
    el.innerHTML = renderNotifSheet();
    wire(el);
  } else {
    el.innerHTML = '';
  }
}
function renderNotifSheet() {
  const p = state.persona;
  const items = [];
  if (can(p,'leaves.view-own')) items.push({i:'i-check',  tone:'green', t:'Casual Leave approved', m:'By Amulya Sir · 2 min ago', unread:true});
  if (can(p,'salary.own'))      items.push({i:'i-rupee',  tone:'green', t:'Salary credited',        m:'₹7,302 · Apr · UPI'});
  if (can(p,'announcements.view'))items.push({i:'i-megaphone',tone:'purple',t:'Test 3 announcement', m:'All Branches · 7 May'});
  items.push({i:'i-bell-add',  tone:'amber', t:'Reminder · Submit weekly report', m:'Today, 4:00 PM'});
  items.push({i:'i-meet',      tone:'blue',  t:'Liberty Kolkata Dev in 30 min',    m:'2:00 PM · Group call'});
  items.push({i:'i-people',    tone:'gray',  t:'Rounik joined iOS Testing Group',  m:'Yesterday'});
  return `<div class="sheet" data-act="close-sheet">
    <div class="sheet-panel" data-stop>
      <div class="sheet-handle"></div>
      <div class="sheet-head">
        <h3>Notifications</h3>
        <button class="hdr-btn" data-act="close-sheet">${I('i-x')}</button>
      </div>
      <div class="sheet-body">
        ${items.map(n => `<div class="notif-row ${n.unread?'unread':''}">
          <div class="nr-i ${n.tone}">${I(n.i)}</div>
          <div style="flex:1"><div class="nr-title">${n.t}</div><div class="nr-meta">${n.m}</div></div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

/* ─── WIRE (click delegation) ─── */
function wire(root) {
  root.querySelectorAll('[data-act]').forEach(el => {
    if (el.dataset.wired) return; el.dataset.wired = '1';
    const a = el.dataset.act;
    if (a === 'punch-hold') {
      const orb = el;
      const start = (e) => { e.preventDefault(); orb.parentElement.classList.add('hold'); state.holdTimer = setTimeout(() => {
        state.punchedIn = !state.punchedIn;
        orb.parentElement.classList.remove('hold');
        toast(state.punchedIn ? 'Punched In · 09:30 AM' : 'Punched Out · 05:06 PM', 'success');
        render();
      }, 1100); };
      const cancel = () => { clearTimeout(state.holdTimer); orb.parentElement.classList.remove('hold'); };
      el.addEventListener('mousedown', start); el.addEventListener('touchstart', start, {passive:false});
      el.addEventListener('mouseup', cancel); el.addEventListener('mouseleave', cancel);
      el.addEventListener('touchend', cancel); el.addEventListener('touchcancel', cancel);
      return;
    }
    el.addEventListener('click', (e) => {
      if (el.hasAttribute('data-stop')) e.stopPropagation();
      e.stopPropagation();
      if (a === 'back') back();
      else if (a === 'open-notifs') openSheet('notifications');
      else if (a === 'close-sheet') closeSheet();
      else if (a === 'open-search') toast('Search');
      else if (a === 'open-profile') { state.tab='me'; state.stack=[]; render(); }
      else if (a === 'task-chip') { state.taskChip = el.dataset.chip; render(); }
      else if (a === 'chat-chip') { state.chatChip = el.dataset.chip; render(); }
      else if (a === 'toggle-task') {
        const id = el.dataset.task;
        if (state.doneTasks.has(id)) state.doneTasks.delete(id); else state.doneTasks.add(id);
        render();
      }
      else if (a === 'approve') { const row = el.closest('.approval'); toast('Approved', 'success'); if (row) { row.style.transition='opacity 0.2s, transform 0.2s'; row.style.opacity='0'; row.style.transform='translateX(20px)'; setTimeout(()=>row.remove(),200); } }
      else if (a === 'reject')  { const row = el.closest('.approval'); toast('Rejected', 'danger');  if (row) { row.style.transition='opacity 0.2s, transform 0.2s'; row.style.opacity='0'; row.style.transform='translateX(-20px)'; setTimeout(()=>row.remove(),200); } }
      else if (a === 'submit-form') { toast(el.dataset.toast || 'Submitted', 'success'); back(); }
      else if (a === 'submit-request') {
        const route = state.persona === 'E' ? 'auto-approved' : state.persona === 'D' ? 'sent to L1' : 'sent to manager';
        toast(`${el.dataset.kind || 'Request'} · ${route}`, 'success');
        back();
      }
      else if (a === 'locked-learn') toast(el.dataset.toast || 'Permission required');
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
}

/* ============================================================
   TAB: TODAY
============================================================ */
function todayScreen() {
  const p = state.persona;
  return `<div class="body-pad">
    ${can(p,'punch')
      ? punchHero()
      : lockedCard('Punch & attendance', 'Sign in with an HRMS account or activate HRMS on your plan to track time at work.', 'About HRMS')}

    <div class="qa-row">
      ${can(p,'leaves.apply') ? `<button class="qa" data-nav="apply-request"><div class="qa-i blue">${I('i-leave')}</div>Apply Request</button>` : ''}
      ${can(p,'salary.own') ? `<button class="qa" data-nav="me-payroll"><div class="qa-i amber">${I('i-rupee')}</div>Payslip</button>` : ''}
      ${can(p,'leaves.view-own') ? `<button class="qa" data-nav="me-leaves"><div class="qa-i purple">${I('i-leave')}</div>My Leaves</button>` : ''}
      ${can(p,'attendance.own') ? `<button class="qa" data-nav="me-attendance"><div class="qa-i pink">${I('i-trend')}</div>Attendance</button>` : ''}
      <button class="qa" data-nav="tasks-detail"><div class="qa-i red">${I('i-task')}</div>My Tasks</button>
      <button class="qa" data-nav="holidays"><div class="qa-i">${I('i-gift')}</div>Holidays</button>
    </div>

    <div class="row-between" style="margin-top:18px"><div class="h-block" style="margin:0">Today's schedule</div><span class="see-all" data-nav="tasks-detail">See all ${I('i-chev-r')}</span></div>
    <div class="sched-list">
      ${ALL_TASKS.filter(t => t.section==='today').map(schedPill).join('')}
    </div>

    ${can(p,'announcements.view') ? `
      <div class="row-between" style="margin-top:20px"><div class="h-block" style="margin:0">From the company</div><span class="see-all" data-nav="chat-channel" data-ctx-id="channel-announce">All ${I('i-chev-r')}</span></div>
      <div class="ann-track">
        <div class="ann-card" data-nav="announce-detail" data-ctx-id="a1"><div class="ann-thumb purple">A</div><div class="ann-body"><div class="ann-tag">All Branches · 7 May</div><div class="ann-title">Test 3</div><div class="ann-body-text">Test announcement content. Tap to read more from the company.</div></div></div>
        <div class="ann-card" data-nav="announce-detail" data-ctx-id="a2"><div class="ann-thumb amber">📅</div><div class="ann-body"><div class="ann-tag">HR · 5 May</div><div class="ann-title">Q2 OKRs published</div><div class="ann-body-text">Quarter goals are live. Sync with your manager this week.</div></div></div>
        <div class="ann-card" data-nav="announce-detail" data-ctx-id="a3"><div class="ann-thumb pink">🎉</div><div class="ann-body"><div class="ann-tag">Culture · 1 May</div><div class="ann-title">Foundation Day celebration</div><div class="ann-body-text">All-hands lunch at the rooftop, Friday 1 PM.</div></div></div>
      </div>
    ` : ''}

    ${can(p,'announcements.view') ? `
      <div class="h-block">Birthdays today</div>
      <div class="bday-strip">
        <button class="bday-card" data-nav="birthday" data-ctx-name="Rounik Tarafder"><div class="bd-av av4">RT</div><div class="bd-name">Rounik</div></button>
        <button class="bday-card" data-nav="birthday" data-ctx-name="Priya Sharma"><div class="bd-av av6">PS</div><div class="bd-name">Priya</div></button>
      </div>
    ` : ''}

    <div class="row-between" style="margin-top:20px"><div class="h-block" style="margin:0">Pinned tasks</div><span class="see-all" data-nav="tasks-detail">All ${I('i-chev-r')}</span></div>
    <div class="pinned">
      ${PINNED_TASKS.map(t => {
        const done = state.doneTasks.has(t.id);
        return `<div class="pinned-row ${done?'done':''}">
          <span class="pr-check" data-act="toggle-task" data-task="${t.id}"></span>
          <div class="pr-title" data-nav="task-detail" data-ctx-title="${t.title}">${t.title}</div>
          <span class="pr-due ${t.due==='tomorrow'?'tomorrow':t.due==='later'?'later':''}">${t.due==='today'?'Today':t.due==='tomorrow'?'Tomorrow':'Later'}</span>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function punchHero() {
  const inLabel = state.punchedIn ? 'Punch Out' : 'Punch In';
  const status  = state.punchedIn ? 'Punched in' : 'Not punched in';
  const elapsed = state.punchedIn ? '7h 36m' : '0h 0m';
  const fill    = state.punchedIn ? 84 : 0;
  const inTime  = state.punchedIn ? '09:30 AM' : '—';
  return `<div class="punch-hero">
    <div class="ph-row">
      <div>
        <div class="ph-status"><span class="dot"></span>${status}</div>
        <div class="ph-time" style="margin-top:4px">Thursday, 7 May · IST</div>
      </div>
      <div class="ph-time">${state.punchedIn ? `In at ${inTime}` : 'Ready when you are'}</div>
    </div>
    <div class="ph-progress">
      <div class="ph-elapsed"><span class="ph-h">${elapsed}</span><span class="ph-of">/ 9h target</span></div>
      <div class="ph-bar"><div class="ph-fill" style="width:${fill}%"></div></div>
    </div>
    <div class="ph-actions">
      <button class="ph-btn ${state.punchedIn?'out':''}" data-act="punch-hold">${I('i-power')} ${inLabel} · hold</button>
      <button class="ph-aux" data-nav="punch-location">${I('i-pin')} Map</button>
    </div>
    <div class="ph-meta">
      <span><b>9h</b> target</span><span class="separator">·</span>
      <span><b>Flexible</b> hours</span><span class="separator">·</span>
      <span><b>Geofence</b> on</span>
    </div>
  </div>`;
}

function schedPill(t) {
  const done = state.doneTasks.has(t.id);
  const trail = t.kind === 'meet'
    ? `<div class="sp-action" data-nav="meet-detail" data-ctx-title="${t.title}">Join</div>`
    : `<div class="sp-check" data-act="toggle-task" data-task="${t.id}"></div>`;
  return `<div class="sched-pill ${t.kind} ${done?'done':''}">
    <div class="sp-time"><span class="sp-h">${t.when.split(' ')[0]}</span>${t.when.split(' ')[1]||''}</div>
    <div class="sp-dot"></div>
    <div class="sp-body" data-nav="${t.kind==='meet'?'meet-detail':'task-detail'}" data-ctx-title="${t.title}">
      <div class="sp-title">${t.title}</div>
      <div class="sp-meta">${t.sub}</div>
    </div>
    ${trail}
  </div>`;
}

/* ============================================================
   TAB: TASKS
============================================================ */
function tasksScreen() {
  const chips = [
    {id:'all',     label:'All'},
    {id:'task',    label:'Tasks'},
    {id:'meet',    label:'Meets'},
    {id:'reminder',label:'Reminders'},
    {id:'note',    label:'Notes'},
  ];
  const days = [['S',3],['M',4],['T',5],['W',6],['T',7],['F',8],['S',9]];
  const f = state.taskChip;
  const rows = ALL_TASKS.filter(t => f==='all' || t.kind===f);
  const groups = {today:[], tomorrow:[], 'this-week':[]};
  rows.forEach(r => groups[r.section]?.push(r));
  return `<div class="body-pad">
    <div class="search" data-act="open-search">${I('i-search')} Search tasks, meetings, notes…</div>
    <div class="chips">
      ${chips.map(c => `<button class="chip ${state.taskChip===c.id?'active':''}" data-act="task-chip" data-chip="${c.id}">${c.label}</button>`).join('')}
    </div>
    <div class="date-strip">
      ${days.map(([d,n]) => `<button class="day-pill ${n===state.todayDate?'today':''} ${[5,7].includes(n)?'has-events':''}">
        <span class="dp-d">${d}</span><span class="dp-n">${n}</span><span class="dp-dot"></span>
      </button>`).join('')}
    </div>
    ${['today','tomorrow','this-week'].map(sec => groups[sec].length ? `
      <div class="h-section ${sec==='today'?'first':''}">${sec==='today'?'Today':sec==='tomorrow'?'Tomorrow':'This week'}</div>
      <div class="sched-list">${groups[sec].map(schedPill).join('')}</div>
    ` : '').join('')}
    ${rows.length===0 ? `<div class="empty"><div class="empty-i">${I('i-task')}</div><div class="empty-t">No items in this filter</div><div class="empty-s">Try another filter or add a new item.</div></div>` : ''}
    <button class="fab" data-nav="task-new">${I('i-plus')}</button>
  </div>`;
}

/* ============================================================
   TAB: CHATS
============================================================ */
function chatsScreen() {
  const p = state.persona;
  const chips = [
    {id:'all',     label:'All'},
    {id:'unread',  label:'Unread'},
    {id:'channels',label:'Channels'},
    {id:'groups',  label:'Groups'},
    {id:'dms',     label:'Direct'},
  ];
  const f = state.chatChip;
  const rows = CHATS.filter(c => {
    if (c.kind === 'channel' && !can(p,'announcements.view')) return false;
    if (f === 'all') return true;
    if (f === 'unread') return c.unread;
    if (f === 'channels') return c.kind === 'channel';
    if (f === 'groups') return c.kind === 'group';
    if (f === 'dms') return c.kind === 'dm' || c.kind === 'ai';
    return true;
  });
  return `<div class="body-pad">
    <div class="search" data-act="open-search">${I('i-search')} Search conversations</div>
    <div class="chips">
      ${chips.map(c => `<button class="chip ${state.chatChip===c.id?'active':''}" data-act="chat-chip" data-chip="${c.id}">${c.label}</button>`).join('')}
    </div>
    ${rows.length===0 ? `<div class="empty"><div class="empty-i">${I('i-chat')}</div><div class="empty-t">No conversations</div><div class="empty-s">Try a different filter or start a new chat.</div></div>` : ''}
    ${rows.map(c => `
      <div class="chat-row" data-nav="${c.kind==='channel'?'chat-channel':'chat-thread'}" data-ctx-id="${c.id}">
        <div class="av ${c.av}">${c.initials}</div>
        <div class="c-body">
          <div class="c-name">${c.name}${c.tag?`<span class="c-tag">${c.tag}</span>`:''}</div>
          <div class="c-prev">${c.preview}</div>
        </div>
        <div class="c-meta">
          <span class="c-time">${c.time}</span>
          ${c.unread?`<span class="unread">${c.unread}</span>`:''}
        </div>
      </div>`).join('')}
    <button class="fab" data-nav="chat-new">${I('i-plus')}</button>
  </div>`;
}

/* ============================================================
   TAB: TEAM
============================================================ */
function teamScreen() {
  const p = state.persona;
  if (!can(p,'team.view')) {
    return `<div class="body-pad">
      <div class="perm-banner">
        <div class="pb-i">${I('i-lock')}</div>
        <div>
          <div class="pb-title">Team is for managers</div>
          <div class="pb-sub">${isHRMS(p) ? 'Ask your admin to grant you manager permissions.' : 'Activate HRMS to access team management features.'}</div>
        </div>
      </div>
      <div class="h-section first">Available tools (locked)</div>
      <div class="tile-grid">
        ${tile('i-check','Approvals',true)}
        ${tile('i-people','Register',true)}
        ${tile('i-trend','Reports',true)}
        ${tile('i-shield','BG Verification',true)}
        ${tile('i-megaphone','Announce',true)}
        ${tile('i-leave','Leaves',true)}
        ${tile('i-bldg','Branches',true)}
        ${tile('i-doc','Documents',true)}
      </div>
    </div>`;
  }
  const isC = isCEO(p);
  return `<div class="body-pad">
    <div class="branch-chip">
      <div class="bc-logo">L</div>
      <div style="flex:1;min-width:0">
        <div class="bc-name">${isC?'All Branches':'Head Office'}</div>
        <div class="bc-sub">${isC?'3 branches · 23 staff':'18 staff · Ahmedabad'}</div>
      </div>
      <button class="bc-change" data-nav="branch-menu">${isC?'Change':'Branch ›'}</button>
    </div>

    <div class="row-between"><div class="h-block" style="margin:0">Pending approvals</div><span class="see-all" data-nav="approvals">View all (${isC?5:4}) ${I('i-chev-r')}</span></div>
    ${approvalCard({n:'Priya Sharma', av:'av6', meta:'Sales Exec · Kolkata · 15-17 May', type:'Casual Leave Request'})}
    ${isC ? approvalCard({n:'Karthik Iyer', av:'av5', meta:'Branch Manager · Mumbai · 20-22 May', type:'Casual Leave Request', tier:'L2'}) : ''}

    <div class="h-block">Today's branch pulse</div>
    ${branchPulse(isC)}

    <div class="h-section">Management tools</div>
    <div class="tile-grid">
      ${tile('i-people','Register',         false, 'register')}
      ${tile('i-trend','Reports',           !can(p,'reports.branch') && !can(p,'reports.all'), 'reports')}
      ${tile('i-chart','Mgmt Review',       false, 'mgmt-review', 15)}
      ${tile('i-shield','BG Verify',        false, 'bg-verify')}
      ${tile('i-megaphone','Announce',      !can(p,'announcements.create'), 'announce-new')}
      ${tile('i-leave','Leaves',            false, 'leaves-queue')}
      ${tile('i-bldg','Branches',           !isC, isC?'branches-list':null)}
      ${tile('i-monitor','Web Admin',       !can(p,'web-admin'), 'web-admin')}
    </div>
  </div>`;
}

function tile(icon, label, locked, navTarget=null, badge=null) {
  if (locked) {
    return `<div class="tile locked-state" data-act="locked-learn" data-toast="Locked — requires manager permissions">
      <div class="ti locked">${I(icon)}</div>
      <div class="tl">${label}</div>
    </div>`;
  }
  const navAttr = navTarget ? `data-nav="${navTarget}"` : 'data-act="noop"';
  return `<button class="tile" ${navAttr}>
    ${badge?`<span class="ti-badge">${badge}</span>`:''}
    <div class="ti">${I(icon)}</div>
    <div class="tl">${label}</div>
  </button>`;
}

function approvalCard(r) {
  return `<div class="approval">
    <div class="appr-head">
      <div class="av appr-av ${r.av}">${r.n.split(' ').map(x=>x[0]).join('').slice(0,2)}</div>
      <div style="flex:1;min-width:0">
        <div class="appr-name">${r.n}${r.tier?` <span class="appr-tier">${r.tier}</span>`:''}</div>
        <div class="appr-meta">${r.meta}</div>
      </div>
    </div>
    <div class="appr-type">${r.type}</div>
    <div class="appr-acts">
      <button class="btn-reject" data-act="reject">Reject</button>
      <button class="btn-approve" data-act="approve">Approve</button>
    </div>
  </div>`;
}

function branchPulse(isC) {
  const present = isC?7:7, absent = isC?15:10, leave = 1;
  const total = present+absent+leave;
  return `<div class="pulse">
    <div class="pulse-top">
      <div>
        <div class="pulse-num">${present}<small>/${total}</small></div>
        <div class="pulse-sub">Present · ${isC?'all branches':'Head Office'}</div>
      </div>
      <div class="pulse-pct">
        <div class="pp-v">${Math.round(present/total*100)}%</div>
        <div class="pp-l">attendance</div>
      </div>
    </div>
    <div class="pulse-bar">
      <div class="pb-s s-p" style="flex:${present}"></div>
      <div class="pb-s s-a" style="flex:${absent}"></div>
      <div class="pb-s s-l" style="flex:${leave}"></div>
    </div>
    <div class="pulse-legend">
      <span><span class="lg-d" style="background:var(--green)"></span>Present ${present}</span>
      <span><span class="lg-d" style="background:var(--red)"></span>Absent ${absent}</span>
      <span><span class="lg-d" style="background:var(--blue)"></span>Leave ${leave}</span>
    </div>
  </div>`;
}

/* ============================================================
   TAB: ME
============================================================ */
function meScreen() {
  const p = state.persona;
  const P = PERSONAS[p];
  return `<div class="body-pad">
    <div class="profile-hero">
      <div class="av ph-av ${P.tier==='L1'?'av3':'av1'}">${P.initials}</div>
      <div style="flex:1;min-width:0">
        <div class="ph-name">${P.name}</div>
        <div class="ph-role">${P.role}</div>
        <div class="ph-pills">
          <span class="pill green">Verified</span>
          ${P.tier?`<span class="pill blue">${P.tier}</span>`:''}
        </div>
      </div>
    </div>

    ${can(p,'salary.own')
      ? `<div class="payroll" data-nav="payslip-detail" data-ctx-month="May 2026">
          <div class="pr-head"><div class="pr-month">May 2026 ${I('i-chev-d')}</div><div class="pr-label">Net pay</div></div>
          <div class="pr-amt"><small>₹</small>${p==='E'?'4,82,000':p==='D'?'92,500':'7,302'}</div>
          <div class="pr-split">
            <div><span class="pr-dot" style="background:var(--blue)"></span>Earnings ${p==='E'?'₹5,12,000':p==='D'?'₹95,500':'₹7,452'}</div>
            <div><span class="pr-dot" style="background:var(--red)"></span>Deductions ${p==='E'?'₹30,000':p==='D'?'₹3,000':'₹150'}</div>
          </div>
          <div class="pr-foot">
            <span class="pr-tag">Next payslip in 24 days</span>
            <span class="pr-cta">View payslip ${I('i-chev-r')}</span>
          </div>
        </div>`
      : lockedCard('Payroll', reasonHRMS)}

    <div class="h-section first">Records</div>
    <div class="list-card">
      ${can(p,'attendance.own') ? row('i-trend','My Attendance','May · 96% · 6 of 7 days', 'me-attendance') : lockedRow('Attendance', reasonHRMS)}
      ${can(p,'leaves.view-own') ? row('i-leave','My Leaves','3 used · 12 remaining', 'me-leaves', 'blue') : lockedRow('Leaves', reasonHRMS)}
      ${can(p,'salary.own') ? row('i-rupee','Payslips','5 months', 'me-payslips', 'amber') : ''}
      ${can(p,'leaves.apply') ? row('i-card','Apply Request','Leave · OT · Advance · Reimburse', 'apply-request', 'purple') : ''}
    </div>

    <div class="h-section">Documents</div>
    <div class="list-card">
      ${row('i-doc','My Documents','Payslips, ID proofs, agreements', 'documents')}
      ${can(p,'handbook') ? row('i-book','Employee Handbook','Policies & guidelines', 'handbook', 'amber') : lockedRow('Handbook', reasonHRMS)}
    </div>

    ${can(p,'company.settings') ? `
      <div class="h-section">Admin tools</div>
      <div class="list-card">
        ${row('i-bldg','Company Settings','Policies, billing, integrations', 'company-settings')}
        ${row('i-gear','Branch Settings','Hours, holidays, locations', 'branch-settings', 'blue')}
      </div>
    ` : ''}

    <div class="h-section">Account</div>
    <div class="list-card">
      ${row('i-gear','Settings','Theme, notifications, privacy', 'settings')}
      ${row('i-info','About','Version 7.0 · Help', 'about', 'blue')}
    </div>

    <button class="btn-block" style="margin-top:14px;color:var(--red);border-color:var(--red-soft)" data-act="sign-out">${I('i-out')} Sign Out</button>
  </div>`;
}

function row(icon, title, sub, navTarget, tint='') {
  return `<div class="lr" data-nav="${navTarget}">
    <div class="lr-i ${tint}">${I(icon)}</div>
    <div class="lr-body"><div class="lr-title">${title}</div>${sub?`<div class="lr-sub">${sub}</div>`:''}</div>
    ${I('i-chev-r')}
  </div>`;
}
function lockedRow(title, reason) {
  return `<div class="lr" data-act="locked-learn" data-toast="${reason}" style="opacity:0.7">
    <div class="lr-i gray">${I('i-lock')}</div>
    <div class="lr-body"><div class="lr-title" style="color:var(--text-2)">${title}</div><div class="lr-sub">${reason.split('.')[0]}</div></div>
    <span class="pill gray">Locked</span>
  </div>`;
}

/* ============================================================
   SUB-SCREENS
============================================================ */
const formScreen = (fields, label, kind, isRequest=false) => `<div class="body-pad">${fields}
  <button class="btn-primary" style="margin-top:14px" data-act="${isRequest?'submit-request':'submit-form'}" ${isRequest?`data-kind="${kind}"`:`data-toast="${kind} submitted"`}>${label}</button>
</div>`;

SCREENS['apply-request'] = {
  title:'Apply Request',
  render: (p) => {
    const route = p === 'E' ? {tone:'green',title:'Auto-approved',note:"You're at the top of the chain — your requests auto-approve as soon as you submit."}
                : p === 'D' ? {tone:'blue',title:'Routes to L1',note:'Routes to L1 (CEO). Typical turnaround under 24 hours.'}
                : {tone:'gray',title:'Routes to your manager',note:"Routes to your reporting manager. You'll get a notification once it's reviewed."};
    const types = [
      {icon:'i-leave', tint:'',       title:'Leave',          sub:'Casual · Sick · Earned',          nav:'apply-leave'},
      {icon:'i-clock', tint:'blue',   title:'Overtime',       sub:'Pre-approval for extra hours',    nav:'apply-ot'},
      {icon:'i-rupee', tint:'amber',  title:'Salary Advance', sub:'Recover from next payslip',       nav:'apply-advance'},
      {icon:'i-card',  tint:'purple', title:'Reimbursement',  sub:'Travel, meals, supplies',         nav:'apply-reimburse'},
      {icon:'i-pin',   tint:'red',    title:'Work-from-home', sub:'Single day or extended',          act:'noop'},
      {icon:'i-doc',   tint:'pink',   title:'Document Request',sub:'Letters, certificates',          act:'noop'},
    ];
    return `<div class="body-pad">
      <div style="font-size:13px;color:var(--text-2);margin-bottom:12px">Pick a request type</div>
      <div class="list-card">
        ${types.map(t => `<div class="lr" ${t.nav?`data-nav="${t.nav}"`:`data-act="${t.act}"`}>
          <div class="lr-i ${t.tint}">${I(t.icon)}</div>
          <div class="lr-body"><div class="lr-title">${t.title}</div><div class="lr-sub">${t.sub}</div></div>
          ${I('i-chev-r')}
        </div>`).join('')}
      </div>
      <div style="margin-top:14px;padding:12px 14px;border-radius:var(--r-md);background:${route.tone==='green'?'var(--green-soft)':route.tone==='blue'?'var(--blue-soft)':'var(--surface-3)'};border:1px solid ${route.tone==='green'?'#BFE8DC':route.tone==='blue'?'#C7DDF8':'var(--line)'};display:flex;gap:10px;align-items:flex-start">
        <div style="color:${route.tone==='green'?'var(--green)':route.tone==='blue'?'var(--blue)':'var(--text-3)'};margin-top:1px">${I('i-info')}</div>
        <div style="flex:1">
          <div style="font-size:12.5px;font-weight:700;color:${route.tone==='green'?'var(--green-deep)':route.tone==='blue'?'var(--blue)':'var(--text-2)'}">${route.title}</div>
          <div style="font-size:11.5px;color:var(--text-2);line-height:1.5;margin-top:3px">${route.note}</div>
        </div>
      </div>
    </div>`;
  }
};

SCREENS['apply-leave'] = { title:'Apply Leave', render: () => formScreen(`
  <div class="field"><label>Leave type</label><select><option>Casual Leave (8 remaining)</option><option>Sick Leave (3 remaining)</option><option>Earned Leave (1 remaining)</option></select></div>
  <div class="field-row">
    <div class="field"><label>From</label><input type="date" value="2026-05-15"></div>
    <div class="field"><label>To</label><input type="date" value="2026-05-17"></div>
  </div>
  <div class="field"><label>Reason</label><textarea rows="3" placeholder="Briefly describe…">Family function out of town</textarea></div>
`, 'Submit Request', 'Leave', true) };

SCREENS['apply-ot'] = { title:'Apply Overtime', render: () => formScreen(`
  <div class="field"><label>Date</label><input type="date" value="2026-05-08"></div>
  <div class="field-row">
    <div class="field"><label>Start</label><input type="time" value="19:00"></div>
    <div class="field"><label>End</label><input type="time" value="23:00"></div>
  </div>
  <div class="field"><label>Reason</label><textarea rows="3" placeholder="What requires overtime?"></textarea></div>
`, 'Request Overtime', 'Overtime', true) };

SCREENS['apply-advance'] = { title:'Salary Advance', render: () => formScreen(`
  <div class="field"><label>Amount (₹)</label><input type="number" value="15000"></div>
  <div class="field"><label>Recover from</label><select><option>Next month payslip</option><option>Split over 2 months</option></select></div>
  <div class="field"><label>Reason</label><textarea rows="3"></textarea></div>
`, 'Submit Request', 'Advance', true) };

SCREENS['apply-reimburse'] = { title:'Reimbursement', render: () => formScreen(`
  <div class="field"><label>Category</label><select><option>Travel / Cab</option><option>Meals</option><option>Supplies</option></select></div>
  <div class="field-row">
    <div class="field"><label>Date</label><input type="date" value="2026-05-07"></div>
    <div class="field"><label>Amount (₹)</label><input type="number" placeholder="0"></div>
  </div>
  <div class="field"><label>Attach receipt</label><button class="btn-secondary" data-act="noop" data-toast="Picker">${I('i-paperclip')} Attach photo or PDF</button></div>
  <div class="field"><label>Description</label><textarea rows="2"></textarea></div>
`, 'Submit Claim', 'Reimbursement', true) };

SCREENS['task-new'] = { title:'New Task', render: () => formScreen(`
  <div class="field"><label>Title</label><input placeholder="What needs doing?"></div>
  <div class="field-row">
    <div class="field"><label>Due date</label><input type="date"></div>
    <div class="field"><label>Priority</label><select><option>Low</option><option>Medium</option><option selected>High</option></select></div>
  </div>
  <div class="field"><label>Notes</label><textarea rows="3"></textarea></div>
`, 'Create Task', 'Task created') };

SCREENS['chat-new'] = { title:'New Chat', render: () => {
  const contacts = [
    {id:'amulya', name:'Amulya Sir', sub:'Liberty Infospace · Head Office', av:'av2', initials:'AS'},
    {id:'sukanta', name:'Sukanta', sub:'Designer · Head Office', av:'av4', initials:'SK'},
    {id:'rounik', name:'Rounik Tarafder', sub:'Developer · Head Office', av:'av1', initials:'RT'},
    {id:'priya', name:'Priya Sharma', sub:'Sales Exec · Kolkata', av:'av6', initials:'PS'},
  ];
  return `<div class="body-pad">
    <div class="search">${I('i-search')} Search contacts</div>
    <div class="list-card">
      ${contacts.map(c => `<div class="lr" data-nav="chat-thread" data-ctx-id="${c.id}">
        <div class="av ${c.av}" style="width:36px;height:36px;font-size:12px">${c.initials}</div>
        <div class="lr-body"><div class="lr-title">${c.name}</div><div class="lr-sub">${c.sub}</div></div>
      </div>`).join('')}
    </div>
  </div>`;
}};

SCREENS['chat-thread'] = {
  title: (ctx) => (CHATS.find(c => c.id === ctx.id)?.name || 'Chat'),
  render: (p, ctx) => {
    const sample = {
      ai: [
        {dir:'in', text:"Morning Sayantan! Want me to summarise today?", ts:'9:35 AM'},
        {dir:'out', text:'Yeah go ahead.', ts:'9:36 AM'},
        {dir:'in', text:'9 AM Design Sync · 11:30 review · 2 PM Liberty Kolkata standup. Reply "remind" to ping 10 min before each.', ts:'9:36 AM'},
        {dir:'out', text:"Got it — I'll handle it.", ts:'5:06 PM'},
      ],
      amulya: [
        {dir:'in', text:'Hey, you around?', ts:'4:48 PM'},
        {dir:'out', text:'Yep, what\'s up?', ts:'4:50 PM'},
        {dir:'in', text:'Quick call before EOD? 15 mins should do.', ts:'5:02 PM'},
        {dir:'out', text:'Sounds good, thanks.', ts:'5:06 PM'},
      ],
      kolkata: [
        {dir:'in', text:'Standup at 2 PM, share blockers ahead 🙏', ts:'9:10 AM'},
        {dir:'in', text:'Anyone free to pair on staging?', ts:'11:25 AM'},
        {dir:'out', text:"I'm on it, 30 min.", ts:'11:30 AM'},
        {dir:'in', text:'Sukanta: deploying tonight 🚀', ts:'5:06 PM'},
      ],
    };
    const msgs = sample[ctx.id] || [{dir:'in', text:'Hi! Start a conversation.', ts:'now'}];
    return `<div class="body-pad" style="padding:14px 12px 80px;display:flex;flex-direction:column;gap:4px">
      <div style="text-align:center;font-size:10.5px;color:var(--text-3);font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin:6px 0">Today</div>
      ${msgs.map(m => `<div style="display:flex;flex-direction:column;max-width:78%;margin-bottom:2px;${m.dir==='out'?'align-self:flex-end;align-items:flex-end':'align-self:flex-start'}">
        <div style="padding:9px 13px;font-size:13.5px;border-radius:18px;line-height:1.42;${m.dir==='out'?'background:var(--green);color:#fff;border-bottom-right-radius:4px':'background:var(--surface);border:1px solid var(--line);color:var(--text);border-bottom-left-radius:4px'}">${m.text.replace(/</g,'&lt;')}</div>
        <div style="font-size:10px;color:var(--text-3);margin:2px 6px 0">${m.ts}</div>
      </div>`).join('')}
    </div>
    <div style="position:sticky;bottom:0;background:var(--surface);border-top:1px solid var(--line);padding:10px 12px;display:flex;gap:8px;align-items:center;margin:0 -16px -100px">
      <input type="text" placeholder="Message…" style="flex:1;padding:11px 16px;border-radius:var(--r-pill);background:var(--surface-3);border:1px solid var(--line);font-size:14px">
      <button style="width:40px;height:40px;border-radius:50%;background:var(--green);color:#fff" data-act="noop" data-toast="(demo) sent">${I('i-send')}</button>
    </div>`;
  }
};

SCREENS['chat-channel'] = {
  title:'Announcements',
  render: (p, ctx) => `<div class="body-pad">
    <p style="font-size:12px;color:var(--text-2);margin:0 0 12px">Broadcast channel from Liberty Infospace</p>
    <div class="ann-card" data-nav="announce-detail" data-ctx-id="a1" style="margin-bottom:8px">
      <div class="ann-thumb purple">A</div>
      <div class="ann-body"><div class="ann-tag">All Branches · 7 May</div><div class="ann-title">Test 3</div><div class="ann-body-text">Test announcement content. Tap to read more.</div></div>
    </div>
    <div class="ann-card" data-nav="announce-detail" data-ctx-id="a2" style="margin-bottom:8px">
      <div class="ann-thumb amber">📅</div>
      <div class="ann-body"><div class="ann-tag">HR · 5 May</div><div class="ann-title">Q2 OKRs published</div><div class="ann-body-text">Quarter goals are live. Sync with your manager this week.</div></div>
    </div>
    <div class="ann-card" data-nav="announce-detail" data-ctx-id="a3">
      <div class="ann-thumb pink">🎉</div>
      <div class="ann-body"><div class="ann-tag">Culture · 1 May</div><div class="ann-title">Foundation Day celebration</div><div class="ann-body-text">All-hands lunch at the rooftop, Friday 1 PM.</div></div>
    </div>
  </div>`
};

SCREENS['announce-detail'] = {
  title:'Announcement',
  render: (p, ctx) => `<div class="body-pad">
    <p style="font-size:10.5px;color:var(--text-3);font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 4px">All Branches · 7 May 2026</p>
    <h2 style="font-size:22px;font-weight:700;margin:0 0 14px;letter-spacing:-0.02em">Test 3</h2>
    <p style="font-size:13.5px;color:var(--text-2);line-height:1.6">Test announcement content. This is a placeholder for the full text of the company-wide announcement.</p>
    <div style="display:flex;gap:14px;margin-top:18px;font-size:12px;color:var(--text-3)">
      <span>👁 194 reads</span><span>📌 Pinned</span>
    </div>
  </div>`
};

SCREENS['task-detail'] = {
  title: (ctx) => ctx.title || 'Task',
  render: (p, ctx) => `<div class="body-pad">
    <h2 style="font-size:20px;font-weight:700;margin:6px 0;letter-spacing:-0.015em">${ctx.title || 'Task'}</h2>
    <div style="display:flex;gap:6px;margin-bottom:16px"><span class="pill amber">Due Today</span><span class="pill blue">#WORK</span></div>
    <div class="h-section first">Details</div>
    <div class="list-card">
      <div class="lr"><div class="lr-body"><div class="lr-sub">Assigned to</div><div class="lr-title">Sayantan Ghosh</div></div></div>
      <div class="lr"><div class="lr-body"><div class="lr-sub">Created by</div><div class="lr-title">Amulya Sir</div></div></div>
      <div class="lr"><div class="lr-body"><div class="lr-sub">Due</div><div class="lr-title" style="color:var(--green)">11:30 AM today</div></div></div>
    </div>
    <div class="h-section">Description</div>
    <p style="font-size:13px;color:var(--text-2);line-height:1.55;margin:0 0 16px">Run stress tests on the API capacity tier and document failure modes.</p>
    <button class="btn-primary" data-act="submit-form" data-toast="Marked done">${I('i-check')} Mark Done</button>
  </div>`
};

SCREENS['meet-detail'] = {
  title: (ctx) => ctx.title || 'Meeting',
  render: (p, ctx) => `<div class="body-pad">
    <h2 style="font-size:20px;font-weight:700;margin:6px 0">${ctx.title || 'Meeting'}</h2>
    <p style="font-size:12px;color:var(--text-2);margin:0 0 16px">Today · 2:00 – 3:00 PM · Group · 8 invitees</p>
    <button class="btn-primary" data-act="noop" data-toast="Joining…">${I('i-meet')} Join now</button>
    <div class="h-section">Attendees</div>
    <div class="list-card">
      ${['Amulya Sir','Sukanta','Rounik T','You'].map((n,i) => `<div class="lr"><div class="av av${(i%5)+1}" style="width:30px;height:30px;font-size:11px">${n.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div class="lr-body"><div class="lr-title">${n}</div></div><span class="lr-trail">${i<3?'Confirmed':'You'}</span></div>`).join('')}
    </div>
  </div>`
};

SCREENS['me-payroll'] = SCREENS['payslip-detail'] = {
  title: (ctx) => ctx.month || 'Payslip',
  render: (p, ctx) => {
    const amt = p==='E'?'4,82,000':p==='D'?'92,500':'7,302';
    return `<div class="body-pad">
      <div class="payroll" style="margin-bottom:14px">
        <div class="pr-head"><div class="pr-month">${ctx.month||'May 2026'} ${I('i-chev-d')}</div><div class="pr-label">Net pay</div></div>
        <div class="pr-amt"><small>₹</small>${amt}</div>
      </div>
      <div class="h-section first">Earnings</div>
      <div class="list-card">
        <div class="lr"><div class="lr-i amber">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title">Basic</div></div><span class="lr-trail">${p==='E'?'₹2,80,000':p==='D'?'₹56,000':'₹4,500'}</span></div>
        <div class="lr"><div class="lr-i amber">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title">HRA</div></div><span class="lr-trail">${p==='E'?'₹1,40,000':p==='D'?'₹28,000':'₹2,250'}</span></div>
        <div class="lr"><div class="lr-i amber">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title">Conveyance</div></div><span class="lr-trail">${p==='E'?'₹15,000':p==='D'?'₹7,500':'₹700'}</span></div>
      </div>
      <div class="h-section">Deductions</div>
      <div class="list-card">
        <div class="lr"><div class="lr-i red">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title">PF (12%)</div></div><span class="lr-trail">${p==='E'?'₹21,600':p==='D'?'₹2,400':'₹150'}</span></div>
      </div>
      <button class="btn-primary" style="margin-top:14px" data-act="noop" data-toast="Downloading">${I('i-doc')} Download PDF</button>
    </div>`;
  }
};

SCREENS['me-payslips'] = {
  title:'Payslips',
  render: (p) => {
    const amt = p==='E'?'4,82,000':p==='D'?'92,500':'7,302';
    const slips = ['May','Apr','Mar','Feb','Jan'].map((m,i) => ({month:`${m} 2026`, current:i===0, amt}));
    return `<div class="body-pad"><div class="list-card">
      ${slips.map(s => `<div class="lr" data-nav="payslip-detail" data-ctx-month="${s.month}">
        <div class="lr-i amber">${I('i-rupee')}</div>
        <div class="lr-body"><div class="lr-title">${s.month}${s.current?' <span class="pill green">Current</span>':''}</div><div class="lr-sub">₹${s.amt} · credited 1st</div></div>
        ${I('i-chev-r')}
      </div>`).join('')}
    </div></div>`;
  }
};

SCREENS['me-leaves'] = {
  title:'My Leaves',
  render: () => `<div class="body-pad">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px">
      ${[['12','Available','green'],['3','Used','gray'],['1','Pending','amber'],['15','Yearly','blue']].map(([n,l,c]) => `<div style="background:var(--surface);border:1px solid var(--line);border-radius:var(--r-md);padding:12px 6px;text-align:center;box-shadow:var(--shadow)"><div style="font-size:18px;font-weight:700;color:var(--${c==='gray'?'text':c})">${n}</div><div style="font-size:10.5px;color:var(--text-3);margin-top:2px">${l}</div></div>`).join('')}
    </div>
    <div class="h-section first">Balance by type</div>
    <div class="list-card">
      <div class="lr"><div class="lr-i">${I('i-leave')}</div><div class="lr-body"><div class="lr-title">Casual Leave</div><div class="lr-sub">8 of 10 remaining</div></div>${I('i-chev-r')}</div>
      <div class="lr"><div class="lr-i blue">${I('i-pin')}</div><div class="lr-body"><div class="lr-title">Sick Leave</div><div class="lr-sub">3 of 5 remaining</div></div>${I('i-chev-r')}</div>
      <div class="lr"><div class="lr-i amber">${I('i-gift')}</div><div class="lr-body"><div class="lr-title">Earned Leave</div><div class="lr-sub">1 carried over</div></div>${I('i-chev-r')}</div>
    </div>
    <button class="btn-primary" style="margin-top:14px" data-nav="apply-request">${I('i-plus')} Apply Leave</button>
  </div>`
};

SCREENS['me-attendance'] = {
  title:'My Attendance',
  render: () => {
    const days = ['M','T','W','T','F','S','S'];
    const data = ['p','p','p','h','p','o','o','p','p','l','p','p','o','o','p','p','p','p','p','o','o','p','p','p','a','p','o','o','p','p','c','','','',''];
    const map = {p:'#00B386', a:'#DC4438', l:'#1A73E8', h:'#C1C5CC', o:'transparent', c:'#FBBF24'};
    return `<div class="body-pad">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px">
        ${[['22','Present','green'],['1','Absent','red'],['1','Leave','blue'],['96%','Score','green']].map(([n,l,c]) => `<div style="background:var(--surface);border:1px solid var(--line);border-radius:var(--r-md);padding:12px 6px;text-align:center"><div style="font-size:18px;font-weight:700;color:var(--${c})">${n}</div><div style="font-size:10.5px;color:var(--text-3);margin-top:2px">${l}</div></div>`).join('')}
      </div>
      <div class="h-section first">May 2026</div>
      <div class="card padded">
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;font-size:10px;color:var(--text-3);margin-bottom:6px;font-weight:600">${days.map(d=>`<div>${d}</div>`).join('')}</div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">
          ${data.map((s,i)=>`<div style="aspect-ratio:1;border-radius:6px;background:${s?(map[s]||'transparent'):'transparent'};opacity:${s==='o'?'0.3':s==='h'?'0.5':'0.95'};display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:700">${s && s!=='o' ? (i+1) : ''}</div>`).join('')}
        </div>
      </div>
    </div>`;
  }
};

SCREENS['documents'] = {
  title:'Documents',
  render: (p) => `<div class="body-pad"><div class="list-card">
    <div class="lr" data-nav="me-payslips"><div class="lr-i amber">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title">Payslips</div><div class="lr-sub">5 documents</div></div>${I('i-chev-r')}</div>
    <div class="lr" data-act="noop"><div class="lr-i blue">${I('i-card')}</div><div class="lr-body"><div class="lr-title">ID Proofs</div><div class="lr-sub">Aadhaar, PAN</div></div>${I('i-chev-r')}</div>
    <div class="lr" data-act="noop"><div class="lr-i">${I('i-doc')}</div><div class="lr-body"><div class="lr-title">Offer Letter</div></div>${I('i-chev-r')}</div>
    <div class="lr" data-act="noop"><div class="lr-i red">${I('i-doc')}</div><div class="lr-body"><div class="lr-title">Form 16 (FY24-25)</div><div class="lr-sub">1.2 MB</div></div>${I('i-chev-r')}</div>
  </div></div>`
};

SCREENS['handbook'] = {
  title:'Employee Handbook',
  render: () => `<div class="body-pad">
    <p style="font-size:12.5px;color:var(--text-2);margin:0 0 10px">Liberty Infospace · v3.2 · updated 1 Apr 2026</p>
    <div class="list-card">
      ${[['i-book','1. Code of Conduct'],['i-clock','2. Attendance & Hours'],['i-leave','3. Leave Policy'],['i-rupee','4. Compensation'],['i-shield','5. Data Protection'],['i-people','6. Anti-Harassment']].map(([i,t]) => `<div class="lr"><div class="lr-i amber">${I(i)}</div><div class="lr-body"><div class="lr-title">${t}</div></div>${I('i-chev-r')}</div>`).join('')}
    </div>
  </div>`
};

SCREENS['approvals'] = {
  title:'Approvals',
  render: (p) => {
    const rows = [
      ...(isCEO(p) ? [{n:'Karthik Iyer', av:'av5', meta:'Branch Manager · Mumbai · 20-22 May', type:'Casual Leave Request', tier:'L2'}] : []),
      {n:'Priya Sharma', av:'av6', meta:'Sales Exec · Kolkata · 15-17 May', type:'Casual Leave Request'},
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
        ${isCEO(p)?'<button class="chip">From managers (1)</button>':''}
      </div>
      ${rows.map(approvalCard).join('')}
    </div>`;
  }
};

SCREENS['register'] = {
  title:'Register',
  render: () => {
    const emps = [
      {n:'Amulya Sir', av:'av2', meta:'CEO · Head Office'},
      {n:'Sayantan Ghosh', av:'av1', meta:'JUNIOR AIML · Head Office'},
      {n:'Sukanta Goswami', av:'av4', meta:'Designer · Head Office'},
      {n:'Rounik Tarafder', av:'av3', meta:'Developer · Head Office'},
      {n:'Priya Sharma', av:'av6', meta:'Sales Exec · Kolkata'},
      {n:'Rahul Mehta', av:'av5', meta:'Designer · Head Office'},
    ];
    return `<div class="body-pad">
      <div class="search">${I('i-search')} Search employees</div>
      <div class="list-card">
        ${emps.map(e => `<div class="lr" data-act="noop" data-toast="Profile">
          <div class="av ${e.av}" style="width:36px;height:36px;font-size:12px">${e.n.split(' ').map(x=>x[0]).join('').slice(0,2)}</div>
          <div class="lr-body"><div class="lr-title">${e.n}</div><div class="lr-sub">${e.meta}</div></div>
          ${I('i-chev-r')}
        </div>`).join('')}
      </div>
    </div>`;
  }
};

SCREENS['punch-location'] = {
  title:'Location',
  render: () => `<div class="body-pad">
    <div class="card padded" style="margin-bottom:14px">
      <div style="background:linear-gradient(135deg,#E8F5F1,#D7EBE3);padding:50px 16px;text-align:center;color:var(--green-deep);font-size:14px;font-weight:600;border-radius:var(--r-md)">${I('i-pin')} Head Office, Hazra Centre</div>
      <div style="font-size:12px;color:var(--text-2);margin-top:10px">Geofence: 200m radius · verified</div>
    </div>
    <div class="h-section first">Pings today</div>
    <div class="list-card">
      <div class="lr"><div class="lr-i">${I('i-clock')}</div><div class="lr-body"><div class="lr-title">09:30 — Punched In</div><div class="lr-sub">Head Office · verified</div></div></div>
      <div class="lr"><div class="lr-i blue">${I('i-pin')}</div><div class="lr-body"><div class="lr-title">12:42 — Location ping</div><div class="lr-sub">Head Office</div></div></div>
      <div class="lr"><div class="lr-i blue">${I('i-pin')}</div><div class="lr-body"><div class="lr-title">15:15 — Location ping</div><div class="lr-sub">Head Office</div></div></div>
    </div>
  </div>`
};

SCREENS['branch-menu'] = {
  title:'Branch',
  render: (p) => `<div class="body-pad">
    <div class="card padded" style="margin-bottom:14px">
      <div style="display:flex;gap:12px;align-items:center">
        <div class="av brand" style="width:42px;height:42px;border-radius:10px;font-size:10px;font-weight:800">L</div>
        <div style="flex:1"><div style="font-size:15px;font-weight:700">${isCEO(p)?'All Branches':'Head Office'}</div><div style="font-size:11.5px;color:var(--text-2);margin-top:1px">${isCEO(p)?'3 branches':'Kolkata · 18 staff'}</div></div>
      </div>
    </div>
    <div class="h-section first">Manage</div>
    <div class="list-card">
      <div class="lr" data-act="noop" data-toast="Branch settings"><div class="lr-i">${I('i-gear')}</div><div class="lr-body"><div class="lr-title">Branch Settings</div><div class="lr-sub">Hours, holidays, locations</div></div>${I('i-chev-r')}</div>
      <div class="lr" data-nav="branches-list"><div class="lr-i blue">${I('i-bldg')}</div><div class="lr-body"><div class="lr-title">Switch Branch</div><div class="lr-sub">${isCEO(p)?'3 branches available':'No other branches'}</div></div>${I('i-chev-r')}</div>
      <div class="lr" data-nav="punch-location"><div class="lr-i amber">${I('i-pin')}</div><div class="lr-body"><div class="lr-title">Location</div><div class="lr-sub">4B/2 Hazra Rd, Kolkata</div></div>${I('i-chev-r')}</div>
    </div>
  </div>`
};

SCREENS['branches-list'] = {
  title:'Branches',
  render: (p) => isCEO(p) ? `<div class="body-pad"><div class="list-card">
    <div class="lr" data-act="noop"><div class="lr-i">${I('i-bldg')}</div><div class="lr-body"><div class="lr-title">Head Office · Ahmedabad</div><div class="lr-sub">12 staff · HQ</div></div>${I('i-chev-r')}</div>
    <div class="lr" data-act="noop"><div class="lr-i">${I('i-bldg')}</div><div class="lr-body"><div class="lr-title">Mumbai · Andheri East</div><div class="lr-sub">3 staff</div></div>${I('i-chev-r')}</div>
    <div class="lr" data-act="noop"><div class="lr-i">${I('i-bldg')}</div><div class="lr-body"><div class="lr-title">Kolkata · Salt Lake</div><div class="lr-sub">8 staff</div></div>${I('i-chev-r')}</div>
  </div></div>` : `<div class="body-pad"><div class="empty"><div class="empty-i">${I('i-bldg')}</div><div class="empty-t">No other branches</div><div class="empty-s">You only have access to Head Office.</div></div></div>`
};

SCREENS['reports'] = { title:'Reports', render:() => `<div class="body-pad"><div class="list-card">
  <div class="lr" data-act="noop"><div class="lr-i">${I('i-trend')}</div><div class="lr-body"><div class="lr-title">Attendance Report</div><div class="lr-sub">May · 96% avg</div></div>${I('i-chev-r')}</div>
  <div class="lr" data-act="noop"><div class="lr-i amber">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title">Payroll Report</div><div class="lr-sub">May · ₹19.4L</div></div>${I('i-chev-r')}</div>
  <div class="lr" data-act="noop"><div class="lr-i blue">${I('i-leave')}</div><div class="lr-body"><div class="lr-title">Leave Utilization</div></div>${I('i-chev-r')}</div>
  <div class="lr" data-act="noop"><div class="lr-i">${I('i-people')}</div><div class="lr-body"><div class="lr-title">Headcount</div></div>${I('i-chev-r')}</div>
</div></div>`};
SCREENS['mgmt-review'] = SCREENS['reports'];
SCREENS['bg-verify'] = { title:'BG Verification', render:() => `<div class="body-pad"><div class="empty"><div class="empty-i">${I('i-shield')}</div><div class="empty-t">All clear</div><div class="empty-s">15 verified · 2 in progress · 1 failed.</div></div></div>`};
SCREENS['announce-new'] = { title:'New Announcement', render:() => formScreen(`
  <div class="field"><label>Title</label><input placeholder="Announcement title"></div>
  <div class="field"><label>Audience</label><select><option>All Branches</option><option>Head Office only</option></select></div>
  <div class="field"><label>Body</label><textarea rows="5"></textarea></div>
`, 'Publish', 'Announcement published')};
SCREENS['leaves-queue'] = SCREENS['approvals'];
SCREENS['web-admin'] = { title:'Web Admin', render:() => `<div class="body-pad"><div class="empty"><div class="empty-i">${I('i-monitor')}</div><div class="empty-t">Web console</div><div class="empty-s">Use the web admin for bulk operations and audit logs.</div></div></div>`};
SCREENS['tasks-detail'] = { title:'All Tasks', render:tasksScreen };
SCREENS['holidays'] = { title:'Holidays', render:() => `<div class="body-pad"><div class="list-card">
  ${[['15','May','Buddha Purnima','Wednesday'],['26','May','Memorial Day','Sunday'],['15','Aug','Independence Day','Friday'],['02','Oct','Gandhi Jayanti','Friday'],['31','Oct','Diwali','Saturday'],['25','Dec','Christmas','Friday']].map(([d,m,n,day]) => `<div class="lr"><div style="width:44px;text-align:center;background:var(--green-soft);border-radius:8px;padding:5px 0;flex:0 0 auto"><div style="font-size:14px;font-weight:700;color:var(--green-deep);line-height:1">${d}</div><div style="font-size:9px;color:var(--green-deep);text-transform:uppercase;margin-top:1px">${m}</div></div><div class="lr-body"><div class="lr-title">${n}</div><div class="lr-sub">${day}</div></div></div>`).join('')}
</div></div>`};
SCREENS['birthday'] = { title:'Birthday', render:(p,ctx) => `<div class="body-pad" style="text-align:center;padding-top:30px">
  <div style="width:90px;height:90px;border-radius:50%;background:linear-gradient(135deg,#6D4AE0,#A855F7);margin:0 auto 14px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:26px;font-weight:700">RT</div>
  <h2 style="font-size:22px;font-weight:700;margin:0">${ctx.name||'Rounik Tarafder'}</h2>
  <p style="font-size:12px;color:var(--text-2);margin:4px 0 18px">Developer · Head Office</p>
  <button class="btn-primary" data-act="noop" data-toast="Wish sent 🎂">🎂 Send birthday wish</button>
</div>`};
SCREENS['company-settings'] = { title:'Company Settings', render:() => `<div class="body-pad"><div class="list-card">
  <div class="lr" data-act="noop"><div class="lr-i">${I('i-bldg')}</div><div class="lr-body"><div class="lr-title">Company Profile</div></div>${I('i-chev-r')}</div>
  <div class="lr" data-act="noop"><div class="lr-i blue">${I('i-people')}</div><div class="lr-body"><div class="lr-title">Roles &amp; Permissions</div></div>${I('i-chev-r')}</div>
  <div class="lr" data-act="noop"><div class="lr-i amber">${I('i-rupee')}</div><div class="lr-body"><div class="lr-title">Billing &amp; Plan</div></div>${I('i-chev-r')}</div>
</div></div>`};
SCREENS['branch-settings'] = { title:'Branch Settings', render:() => `<div class="body-pad"><div class="list-card">
  <div class="lr" data-act="noop"><div class="lr-i">${I('i-clock')}</div><div class="lr-body"><div class="lr-title">Office Hours</div><div class="lr-sub">9:30 AM – 6:30 PM</div></div>${I('i-chev-r')}</div>
  <div class="lr" data-act="noop"><div class="lr-i blue">${I('i-pin')}</div><div class="lr-body"><div class="lr-title">Geofence</div><div class="lr-sub">200m</div></div>${I('i-chev-r')}</div>
</div></div>`};
SCREENS['settings'] = { title:'Settings', render:() => `<div class="body-pad"><div class="list-card">
  <div class="lr" data-act="noop"><div class="lr-i">${I('i-monitor')}</div><div class="lr-body"><div class="lr-title">Appearance</div><div class="lr-sub">Light</div></div>${I('i-chev-r')}</div>
  <div class="lr" data-act="noop"><div class="lr-i blue">${I('i-bell')}</div><div class="lr-body"><div class="lr-title">Notifications</div></div>${I('i-chev-r')}</div>
  <div class="lr" data-act="noop"><div class="lr-i amber">${I('i-shield')}</div><div class="lr-body"><div class="lr-title">Privacy</div></div>${I('i-chev-r')}</div>
</div></div>`};
SCREENS['about'] = { title:'About', render:() => `<div class="body-pad" style="text-align:center;padding-top:24px">
  <div style="width:70px;height:70px;border-radius:18px;background:linear-gradient(135deg,var(--green),#10B981);margin:0 auto 14px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:30px;font-weight:800">E</div>
  <div style="font-size:18px;font-weight:700">EasyDo 365</div>
  <div style="font-size:12px;color:var(--text-2);margin-top:4px">Version 7.0 · build 001</div>
</div>`};

/* ─── BODY ROUTER ─── */
function bodyHTML() {
  if (state.stack.length) {
    const top = state.stack[state.stack.length - 1];
    return SCREENS[top.id].render(state.persona, top.ctx);
  }
  if (state.tab === 'today') return todayScreen();
  if (state.tab === 'tasks') return tasksScreen();
  if (state.tab === 'chats') return chatsScreen();
  if (state.tab === 'team')  return teamScreen();
  if (state.tab === 'me')    return meScreen();
  return '';
}

/* ─── PERSONA ROW ─── */
function renderPersonas() {
  const sw = document.getElementById('personaRow');
  sw.innerHTML = Object.entries(PERSONAS).map(([k,p]) => `
    <button class="pb ${state.persona===k?'active':''}" data-persona="${k}">
      <div class="pb-row"><span class="pb-tag">${k}</span><span class="pb-name">${p.label.split(' · ')[1] || p.label}</span></div>
      <div class="pb-sub">${p.sub}</div>
    </button>
  `).join('');
  sw.querySelectorAll('.pb').forEach(b => b.addEventListener('click', () => {
    state.persona = b.dataset.persona;
    state.tab = 'today';
    state.stack = [];
    state.sheet = null;
    render();
    document.getElementById('body').scrollTo(0,0);
  }));
}

/* ─── INFO ─── */
function renderInfo() {
  const p = state.persona;
  const P = PERSONAS[p];
  const info = document.getElementById('info');
  const top = state.stack[state.stack.length - 1];
  const screen = top ? (typeof SCREENS[top.id].title === 'function' ? SCREENS[top.id].title(top.ctx, p) : SCREENS[top.id].title) : tabTitle(state.tab);
  const lockedFeatures = [];
  ['punch','salary.own','leaves.apply','attendance.own','team.view','announcements.create','reports.branch'].forEach(perm => {
    if (!can(p,perm)) lockedFeatures.push(perm);
  });
  info.innerHTML = `
    <section>
      <h3>Currently viewing</h3>
      <div class="info-row"><span>Persona</span><b>${P.label}</b></div>
      <div class="info-row"><span>Screen</span><b>${screen}</b></div>
      <div class="info-row"><span>Tabs visible</span><b>5 (always)</b></div>
    </section>
    <section>
      <h3>Permissions held</h3>
      <p style="font-size:11.5px;line-height:1.7"><b>${PERMS[p].size}</b> permissions active for this persona.</p>
      ${lockedFeatures.length ? `<p style="font-size:11.5px;color:var(--text-3);line-height:1.7;margin-top:6px"><b>Locked features:</b><br>${lockedFeatures.map(f=>`<code style="font-size:11px;background:var(--surface-3);padding:1px 5px;border-radius:4px;font-family:ui-monospace,monospace">${f}</code>`).join(' ')}</p>` : '<p style="font-size:11.5px;color:var(--green);margin-top:6px">All features unlocked.</p>'}
    </section>
    <section>
      <h3>v7 design intent</h3>
      <p><b>Same 5 tabs for all 4 personas.</b> Permissions gate content, not navigation. Locked features render as dashed cards in their layout slot so the UI shape never changes. This is the foundation for the future token-based access model.</p>
    </section>
    <section>
      <h3>What to try</h3>
      <p style="font-size:12px;line-height:1.7">
        • Switch personas: A's Today shows <i>locked Punch card</i>; B/D/E see the hero.<br>
        • A's Team tab shows the manager-only banner + all locked tiles.<br>
        • E's Approvals queue has an L2 manager row at top.<br>
        • Press &amp; hold the punch button on Today to toggle in/out.<br>
        • Bell icon → Notifications sheet.
      </p>
    </section>`;
}

/* ─── RENDER ─── */
function render() {
  renderHeader();
  renderTabs();
  document.getElementById('body').innerHTML = bodyHTML();
  wire(document.getElementById('body'));
  renderOverlay();
  renderPersonas();
  renderInfo();
}

render();
