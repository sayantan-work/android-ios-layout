const I = (id) => `<svg><use href="#${id}"/></svg>`;

/* ─── PERSONAS ─── */
const TAB_HOME      = {id:'home',     label:'Home',     icon:'i-home'};
const TAB_WORKSPACE = {id:'workspace',label:'Workspace',icon:'i-workspace'};
const TAB_PUNCH     = {id:'punch',    label:'Punch',    icon:'i-punch'};
const TAB_CHAT      = {id:'chat',     label:'Chat',     icon:'i-chat'};
const TAB_ME        = {id:'me',       label:'Me',       icon:'i-me'};

const personas = {
  A: { label:'App User', sub:'Productivity-only · free · no employer', modules:['prod'], default:'home',
    tabs:[ TAB_HOME, TAB_WORKSPACE, TAB_CHAT, TAB_ME ],
    header:{ type:'brand', logo:'E', name:'EasyDo 365' },
    profile:{ name:'Jordan Smith', role:'App User · Member since 2024', initials:'JS', verified:true } },
  B: { label:'HRMS Regular Employee / L3', sub:'Employee user · sees only themselves · branch read-only', modules:['prod','hrms'], default:'punch',
    tabs:[ TAB_HOME, TAB_WORKSPACE, TAB_PUNCH, TAB_CHAT, TAB_ME ],
    header:{ type:'company', logo:'L', name:'Liberty Infospace', branch:{label:'Head Office',readonly:true} },
    profile:{ name:'Sayantan Ghosh', role:'JUNIOR AIML · Head Office', initials:'SG', verified:true, completion:80, hrms:true } },
  D: { label:'HRMS L2 — Branch Manager', sub:'Manages a branch · branch chip interactive · can approve', modules:['prod','hrms','manage-branch'], default:'home',
    tabs:[ TAB_HOME, TAB_WORKSPACE, TAB_PUNCH, TAB_CHAT, TAB_ME ],
    header:{ type:'company', logo:'L', name:'Liberty Infospace', branch:{label:'Head Office',readonly:false} },
    profile:{ name:'Sayantan Ghosh', role:'L2 · Branch Manager · Head Office', initials:'SG', verified:true, manager:true, hrms:true } },
  E: { label:'HRMS L1 — CEO / Top Mgmt', sub:'Company-wide oversight · default scope All Branches', modules:['prod','hrms','manage-company'], default:'home',
    tabs:[ TAB_HOME, TAB_WORKSPACE, TAB_PUNCH, TAB_CHAT, TAB_ME ],
    header:{ type:'company', logo:'L', name:'Liberty Infospace', branch:{label:'All Branches',readonly:false} },
    profile:{ name:'Sayantan Ghosh', role:'L1 · CEO · Liberty Infospace', initials:'SG', verified:true, ceo:true, hrms:true } },
};

/* ─── REUSABLE BLOCKS ─── */
const announcementsBlock = () => `
  <div class="section-head"><h2 class="title-2">Announcements</h2></div>
  <div class="glass announce-card">
    <div>
      <div class="ac-meta">All Branches · 7 May</div>
      <div class="ac-title">Test 3</div>
      <div class="ac-body">Test announcement content</div>
    </div>
    <div class="announce-thumb">194</div>
  </div>
  <div class="dots"><span class="on"></span><span></span><span></span><span></span></div>`;

const holidaysBlock = () => `
  <div class="section-head"><h2 class="title-2">Upcoming Holidays</h2></div>
  <div class="glass" style="padding:0 12px">
    <div class="holiday-row"><div class="date-pill"><div class="d">15</div><div class="m">May</div></div><div class="list-body"><div class="h-name">Buddha Purnima</div><div class="h-day">Wednesday</div></div></div>
    <div class="holiday-row"><div class="date-pill"><div class="d">26</div><div class="m">May</div></div><div class="list-body"><div class="h-name">Memorial Day</div><div class="h-day">Sunday</div></div></div>
  </div>`;

const eotmBlock = () => `
  <div class="section-head"><h2 class="title-2">Employee of Month <span style="color:var(--primary);font-weight:500;font-size:11px">Apr 2026</span></h2></div>
  <div class="glass eotm">
    <div class="eotm-avatar"></div>
    <div><div class="eotm-name">Sankha Subhra Moitra</div><div class="eotm-meta">Head Office</div><div class="eotm-score">Score 66.67</div></div>
  </div>`;

const birthdayBlock = () => `
  <div class="section-head"><h2 class="title-2">Birthdays Today</h2></div>
  <div class="glass sched-card glow-rose" style="margin-bottom:8px">
    <div class="list-avatar av3" style="width:30px;height:30px;font-size:10px">RT</div>
    <div class="sched-body"><div class="sched-title">Rounik Tarafder</div><div class="sched-meta">Send a wish 🎂</div></div>
    <span class="pill danger">Birthday</span>
  </div>`;

const todayScheduleBlock = (variant='full') => {
  const items = variant === 'ceo' ? [
    {time:'10:00<br>AM', glow:'glow-yellow', icon:'i-people', color:'var(--primary)', title:'Board Sync', meta:'All branches · 1h'},
    {time:'2:00<br>PM',  glow:'glow-teal',   icon:'i-meet',   color:'var(--teal)',    title:'Investor call', meta:'Quarterly · 45 min'},
  ] : [
    {time:'9:00<br>AM',  glow:'glow-peach',  icon:'i-people', color:'var(--peach)',   title:'Design Sync', meta:'with Sukanta · 30 min'},
    {time:'11:30<br>AM', glow:'glow-yellow', icon:'i-tasks',  color:'var(--primary)', title:'Stress Test Report', meta:'Due today · #WORK'},
    {time:'2:00<br>PM',  glow:'glow-teal',   icon:'i-meet',   color:'var(--teal)',    title:'Liberty Kolkata Dev', meta:'Group · 1 hour'},
  ];
  return `
    <div class="section-head"><h2 class="title-2">Today's Schedule</h2></div>
    ${items.map(it => {
      const nav = it.icon === 'i-tasks' ? 'task-detail' : 'meet-detail';
      return `
      <div class="sched-row">
        <div class="sched-time">${it.time}</div>
        <div class="glass sched-card ${it.glow}" data-nav="${nav}" data-ctx-title="${it.title}">
          <div class="sched-icon">${I(it.icon)}</div>
          <div class="sched-body"><div class="sched-title">${it.title}</div><div class="sched-meta">${it.meta}</div></div>
        </div>
      </div>`;
    }).join('')}`;
};

const punchHero = () => {
  const inLabel = state.punchedIn ? 'Punch Out' : 'Punch In';
  const fill = state.punchedIn ? 84 : 0;
  const inTime = '09:30 AM';
  const outTime = state.punchedIn ? '--:--' : '05:06 PM';
  const total = state.punchedIn ? '07:36' : '07:36';
  return `
  <div style="text-align:center;font-size:11px;color:var(--muted);margin:8px 0 4px;letter-spacing:0.02em">
    <b style="color:var(--fg);font-size:13px;font-feature-settings:'tnum';letter-spacing:-0.01em">05:06 PM</b>
  </div>
  <div class="punch-hero">
    <div class="punch-orb" data-action="punch-hold"><div class="hold-ring"></div>${I('i-punch')}</div>
    <div class="punch-label">${inLabel}</div>
    <div style="font-size:10px;color:var(--muted-2);text-align:center;margin-top:2px">Press &amp; hold to confirm</div>
  </div>
  <div class="elapsed" style="max-width:230px;margin:12px auto 8px">
    <div class="elapsed-track"><div class="elapsed-fill" style="width:${fill}%"></div></div>
    <div class="elapsed-labels" style="justify-content:flex-end"><span style="font-feature-settings:'tnum'"><b>${total}</b> <span style="color:var(--muted-2)">/ 9h</span></span></div>
  </div>
  <div class="punch-chips" style="max-width:280px;margin:10px auto 4px">
    <div class="punch-chip"><div class="pc-row" style="color:var(--success)">${I('i-arrow-ul')}In</div><div class="pc-val">${inTime}</div></div>
    <div class="punch-chip"><div class="pc-row">${I('i-arrow-dr')}Out</div><div class="pc-val ${state.punchedIn?'empty':''}">${outTime}</div></div>
    <div class="punch-chip"><div class="pc-row" style="color:var(--primary)">${I('i-clock')}Total</div><div class="pc-val">${total}</div></div>
  </div>`;
};

/* Google Pay style icon tray for Home shortcuts */
const iconTray = (items) => `
  <div class="icon-tray">
    ${items.map(it => `
      <div class="icon-tray-item" ${it.nav?`data-nav="${it.nav}"`:''} ${it.action?`data-action="${it.action}"`:''} ${it.toast?`data-toast="${it.toast}"`:''}>
        <div class="ti-circle tint-${it.tint}">${I(it.icon)}</div>
        <div class="ti-label">${it.label}</div>
        ${it.badge ? `<div class="ti-badge">${it.badge}</div>` : ''}
      </div>
    `).join('')}
  </div>`;

/* Persona-specific shortcut tray items */
const trayItems = {
  A: [
    {icon:'i-tasks',     label:'New Task',   tint:'yellow', nav:'task-new'},
    {icon:'i-meet',      label:'New Meet',   tint:'teal',   nav:'meet-new'},
    {icon:'i-note',      label:'New Note',   tint:'purple', nav:'note-new'},
    {icon:'i-bell-add',  label:'Reminder',   tint:'peach',  nav:'reminder-new'},
    {icon:'i-cloud',     label:'My Drive',   tint:'info',   action:'noop', toast:'My Drive screen'},
    {icon:'i-cal-sub',   label:'Calendar',   tint:'rose',   action:'noop', toast:'Calendar Sync settings'},
    {icon:'i-search',    label:'Find',       tint:'bronze', action:'noop', toast:'Global search'},
    {icon:'i-star',      label:'Upgrade',    tint:'yellow', action:'noop', toast:'Upgrade to HRMS'},
  ],
  B: [
    {icon:'i-cal-sub',   label:'Apply Leave',tint:'peach',  nav:'apply-leave'},
    {icon:'i-clock',     label:'Apply OT',   tint:'teal',   nav:'apply-ot'},
    {icon:'i-rupee',     label:'Advance',    tint:'yellow', nav:'advance'},
    {icon:'i-card',      label:'Reimburse',  tint:'info',   nav:'reimburse'},
    {icon:'i-doc',       label:'Payslip',    tint:'green',  nav:'me-payslips'},
    {icon:'i-trend',     label:'Attendance', tint:'bronze', nav:'me-attendance'},
    {icon:'i-gift',      label:'Holidays',   tint:'rose',   nav:'holidays'},
    {icon:'i-book',      label:'Handbook',   tint:'purple', nav:'handbook'},
  ],
  D: [
    {icon:'i-check-seal',label:'Approvals',  tint:'yellow', badge:'4',  nav:'approvals'},
    {icon:'i-star',      label:'Mgmt Review',tint:'rose',   badge:'15', nav:'mgmt-review'},
    {icon:'i-people',    label:'Register',   tint:'info',   nav:'register'},
    {icon:'i-megaphone', label:'Announce',   tint:'peach',  nav:'announce'},
    {icon:'i-cal-sub',   label:'Apply Leave',tint:'teal',   nav:'apply-leave'},
    {icon:'i-doc',       label:'Documents',  tint:'purple', nav:'documents'},
    {icon:'i-chart',     label:'Reports',    tint:'bronze', nav:'reports'},
    {icon:'i-pin',       label:'Location',   tint:'green',  nav:'punch-location'},
  ],
  E: [
    {icon:'i-check-seal',label:'Approvals',  tint:'yellow', badge:'4',  nav:'approvals'},
    {icon:'i-star',      label:'Mgmt Review',tint:'rose',   badge:'15', nav:'mgmt-review'},
    {icon:'i-people',    label:'Register',   tint:'info',   nav:'register'},
    {icon:'i-bldg',      label:'Branches',   tint:'teal',   nav:'branches-list'},
    {icon:'i-megaphone', label:'Announce',   tint:'peach',  nav:'announce'},
    {icon:'i-chart',     label:'Reports',    tint:'bronze', nav:'reports'},
    {icon:'i-monitor',   label:'Web Admin',  tint:'purple', nav:'web-admin'},
    {icon:'i-pin',       label:'Location',   tint:'green',  nav:'punch-location'},
  ],
};

const branchPulse = (label, present, total, absent, leave) => `
  <div class="glass who-hero">
    <div class="who-row">
      <div><div class="who-num">${present}<small>/${total}</small></div><div class="who-meta">Present at ${label}</div></div>
      <div class="who-icon">🏢</div>
    </div>
    <div class="who-bar"><div class="seg-p" style="flex:${present}"></div><div class="seg-a" style="flex:${absent}"></div><div class="seg-l" style="flex:${leave}"></div></div>
    <div class="who-legend">
      <span><span class="dot" style="background:var(--success)"></span>Present ${present}</span>
      <span><span class="dot" style="background:var(--destructive)"></span>Absent ${absent}</span>
      <span><span class="dot" style="background:var(--info)"></span>Leave ${leave}</span>
    </div>
  </div>`;

const manageOfficeCard = (label, count) => `
  <div class="glass manage-card" data-action="open-office">
    <div class="manage-card-icon">${I('i-office')}</div>
    <div class="manage-card-text">
      <div class="manage-card-title">Manage Office</div>
      <div class="manage-card-sub">${label} · approvals, reports, register</div>
      <div class="manage-card-meta">
        <span><b>${count}</b> pending approvals</span>
      </div>
    </div>
    ${I('i-chev-r')}
  </div>`;

/* Compact punch status pill — shown on HRMS Home, taps to Punch tab */
const punchStatusPill = () => `
  <div class="punch-status" data-action="goto-punch">
    <span class="dot"></span>
    ${state.punchedIn ? 'Punched in · <b>7h 36m</b> worked · 9h goal' : 'Punched out · <b>9h 17m</b> today · ready tomorrow'}
    <span class="chev">›</span>
  </div>`;

/* ─── HOME (per persona) — Punch is now its own tab, so Home shows the launcher ─── */
const homeFor = (p) => {
  if (p === 'A') {
    return `
      <h1 class="title-1">Good evening, Jordan</h1>
      <p class="subhead">Thursday, 7 May 2026</p>
      ${iconTray(trayItems.A)}
      ${todayScheduleBlock()}
      ${birthdayBlock()}
    `;
  }
  if (p === 'B') {
    return `
      <h1 class="title-1">Good evening</h1>
      <p class="subhead">Sayantan · Thu, 7 May 2026</p>
      ${punchStatusPill()}
      ${iconTray(trayItems.B)}
      ${todayScheduleBlock()}
      ${birthdayBlock()}
      ${announcementsBlock()}
      ${holidaysBlock()}
      ${eotmBlock()}
    `;
  }
  if (p === 'D') {
    return `
      <h1 class="title-1">Good evening</h1>
      <p class="subhead">Sayantan · Branch Manager · Thu, 7 May</p>
      ${punchStatusPill()}
      ${branchPulse('Head Office', 7, 18, 10, 1)}
      ${manageOfficeCard('Head Office', 4)}
      ${iconTray(trayItems.D)}
      ${todayScheduleBlock()}
      ${announcementsBlock()}
      ${birthdayBlock()}
    `;
  }
  if (p === 'E') {
    return `
      <h1 class="title-1">Good evening</h1>
      <p class="subhead">Sayantan · CEO · Thu, 7 May</p>
      ${punchStatusPill()}
      ${branchPulse('all branches', 7, 23, 15, 1)}
      <div class="glass" style="padding:12px;margin-bottom:10px">
        <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px">Branch Breakdown</div>
        <div class="row-between" style="font-size:11px;padding:3px 0"><span>Head Office</span><span><b>5</b><span class="muted">/12</span></span></div>
        <div class="row-between" style="font-size:11px;padding:3px 0"><span>Kolkata</span><span><b>2</b><span class="muted">/8</span></span></div>
        <div class="row-between" style="font-size:11px;padding:3px 0"><span>Mumbai</span><span><b>0</b><span class="muted">/3</span></span></div>
      </div>
      ${manageOfficeCard('All Branches', 4)}
      ${iconTray(trayItems.E)}
      ${todayScheduleBlock('ceo')}
      ${announcementsBlock()}
      ${eotmBlock()}
    `;
  }
};

/* ─── PUNCH (own tab, HRMS users only) ─── */
const punchScreen = () => {
  const weekDays = [
    {day:'Mon, 5 May', summary:'Present · 09:25 → 18:42', status:'Present', tone:'var(--success)'},
    {day:'Tue, 6 May', summary:'Present · 09:18 → 19:01', status:'Present', tone:'var(--success)'},
    {day:'Wed, 7 May', summary:'Present · 09:30 → 18:50', status:'Present', tone:'var(--success)'},
  ];
  const todayRow = state.punchedIn
    ? {day:'Today', summary:'Active · 09:30 → ongoing', status:'Active', tone:'var(--primary)'}
    : {day:'Today', summary:'Done · 09:30 → 05:06 PM', status:'Done', tone:'var(--success)'};
  const rows = [...weekDays, todayRow];
  return `
  <h1 class="title-1">Today</h1>
  <p class="subhead">Thursday, 7 May 2026</p>
  ${punchHero()}

  <div class="section-head"><h2 class="title-2">Location</h2></div>
  <div class="glass loc-preview" data-nav="punch-location">
    <div class="loc-map">
      <span class="loc-tag">📍 Head Office, Hazra Centre</span>
      <span class="loc-walker">🚶</span>
    </div>
    <div class="loc-rows">
      <div class="loc-row">• Punched in at Head Office, 09:30 AM</div>
      <div class="loc-row muted">• 2 location pings since</div>
    </div>
  </div>

  <div class="section-head"><h2 class="title-2">This Week</h2></div>
  <div class="glass" style="padding:8px 12px">
    ${rows.map((r,i) => `
      <div class="row-between" style="padding:6px 0;font-size:12px;${i<rows.length-1?'border-bottom:1px solid var(--border);':''}cursor:pointer" data-nav="punch-day" data-ctx-day="${r.day}" data-ctx-summary="${r.summary}">
        <span>${r.day}</span><span><b style="color:${r.tone}">${r.status}</b> · ${r.summary.split(' · ').slice(1).join(' · ')}</span>
      </div>`).join('')}
  </div>
`;
};

/* ─── WORKSPACE — universal ─── */
const WS_ITEMS = [
  {id:'t1', kind:'task', section:'today', time:'11:30', ampm:'AM', title:'Stress Test Capacity Report', meta:'Task · Due today', tag:'#WORK'},
  {id:'m1', kind:'meet', section:'today', time:'2:00', ampm:'PM', title:'Liberty Kolkata Dev Team', meta:'Meeting · Group · 1h'},
  {id:'m2', kind:'meet', section:'today', time:'4:00', ampm:'PM', title:'1:1 with Soumyadeep', meta:'Meeting · 30 min'},
  {id:'r1', kind:'reminder', section:'today', time:'4:00', ampm:'PM', title:'Submit weekly report', meta:'Reminder'},
  {id:'m3', kind:'meet', section:'tomorrow', time:'10:00', ampm:'AM', title:'Sprint Planning', meta:'Meeting · 8 invitees · 1h'},
  {id:'t2', kind:'task', section:'tomorrow', time:'EOD', ampm:'', title:'Update onboarding doc', meta:'Task · Tomorrow'},
];

const wsItemRow = (it) => {
  const done = state.wsDone.has(it.id);
  const icon = it.kind==='task'?'i-tasks':it.kind==='meet'?'i-meet':it.kind==='reminder'?'i-bell-add':'i-note';
  const trail = (it.kind==='meet')
    ? `<div class="ws-action" data-nav="meet-detail" data-ctx-title="${it.title}">Join</div>`
    : `<div class="ws-check ${done?'done':''}" data-action="toggle-task" data-task="${it.id}"></div>`;
  const navAttr = it.kind==='task'
    ? `data-nav="task-detail" data-ctx-title="${it.title}"`
    : it.kind==='meet'
      ? `data-nav="meet-detail" data-ctx-title="${it.title}"`
      : `data-action="noop" data-toast="${it.kind} detail"`;
  return `<div class="ws-item ${done?'done':''}">
    <div class="ws-time" ${navAttr} style="cursor:pointer"><span class="h">${it.time}</span>${it.ampm}</div>
    <div class="ws-icon ${it.kind}" ${navAttr}>${I(icon)}</div>
    <div class="ws-info" ${navAttr} style="cursor:pointer"><div class="ws-title">${it.title}</div><div class="ws-meta">${it.meta}${it.tag?` <span class="task-tag">${it.tag}</span>`:''}</div></div>
    ${trail}
  </div>`;
};

const workspace = () => {
  const filter = state.wsFilter;
  const matches = (it) => filter==='all' || (filter==='task'&&it.kind==='task') || (filter==='meet'&&it.kind==='meet') || (filter==='reminder'&&it.kind==='reminder') || (filter==='note'&&it.kind==='note');
  const todayItems = WS_ITEMS.filter(i=>i.section==='today' && matches(i));
  const tomorrowItems = WS_ITEMS.filter(i=>i.section==='tomorrow' && matches(i));
  const counts = {
    all: WS_ITEMS.length,
    task: WS_ITEMS.filter(i=>i.kind==='task').length,
    meet: WS_ITEMS.filter(i=>i.kind==='meet').length,
    reminder: WS_ITEMS.filter(i=>i.kind==='reminder').length,
  };
  const chip = (id, label) => `<span class="chip ${filter===id?'active':''}" data-action="ws-filter" data-filter="${id}">${label}</span>`;
  return `
    <h1 class="title-1">Workspace</h1>

    <div class="ws-cta" data-nav="meet-new">
      <div class="ws-cta-icon">${I('i-video-plus')}</div>
      <div class="ws-cta-text">
        <div class="mc-title">Start an Instant Meeting</div>
        <div class="mc-sub">Get a link in 2 seconds</div>
      </div>
    </div>

    <div class="search" data-action="noop" data-toast="Search workspace">${I('i-search')}Search workspace</div>
    <div class="chip-row">
      ${chip('all','All ('+counts.all+')')}
      ${chip('task','Tasks ('+counts.task+')')}
      ${chip('meet','Meets ('+counts.meet+')')}
      ${chip('reminder','Reminders ('+counts.reminder+')')}
      ${chip('note','Notes')}
    </div>

    ${todayItems.length>0 ? `
      <h2 class="title-2">Today</h2>
      <div class="glass" style="padding:0 12px">
        ${todayItems.map(wsItemRow).join('')}
      </div>` : ''}

    ${tomorrowItems.length>0 ? `
      <h2 class="title-2">Tomorrow</h2>
      <div class="glass" style="padding:0 12px">
        ${tomorrowItems.map(wsItemRow).join('')}
      </div>` : ''}

    ${(filter==='all') ? `
      <h2 class="title-2">Awaiting Review</h2>
      <div class="glass" style="padding:0 12px">
        <div class="ws-item" data-action="noop" data-toast="Review queue">
          <div class="ws-icon task" style="grid-column:1/3;width:30px;height:30px">${I('i-check-seal')}</div>
          <div class="ws-info"><div class="ws-title">Tasks Done — Awaiting Review (1)</div><div class="ws-meta">Delegated · The creator must review</div></div>
          <div class="ws-action">Review</div>
        </div>
      </div>` : ''}

    ${todayItems.length===0 && tomorrowItems.length===0 ? empty('i-filter', 'No items match', 'Try another filter or create something new.') : ''}

    <div class="fab" data-action="fab-open">${I('i-plus')}</div>
  `;
};

/* ─── CHAT — universal ─── */
const CHAT_ROWS = [
  {id:'ai', av:'gradient-ai', initials:'AI', title:'EasyDo AI', meta:'Punch In...', time:'5:06 PM', kind:'ai'},
  {id:'amulya', av:'av2', initials:'AS', title:'Amulya Sir', meta:'✓✓ 🚩 Attendance', time:'5:06 PM', kind:'dm'},
  {id:'liberty-kolkata', av:'av4', initials:'LK', title:'Liberty Kolkata Dev', tag:'#WORK', meta:'Stress Test Capacity Report', time:'5:06 PM', unread:2, kind:'group'},
  {id:'ui-testing', av:'av3', initials:'UT', title:'UI Testing', meta:'Sukanta: 🤝 Meet', time:'4:34 PM', unread:52, kind:'group'},
  {id:'ios-testing', av:'av1', initials:'IT', title:'iOS Testing Group', meta:'Sankha Subhra has left', time:'Yesterday', unread:28, kind:'group'},
  {id:'bug-resolve', av:'av5', initials:'BR', title:'Bug Resolve 2025', meta:'Sankha Subhra has left', time:'Yesterday', kind:'group'},
];

const chat = () => {
  const f = state.chatFilter;
  const rows = CHAT_ROWS.filter(r => f==='all' || (f==='unread'&&r.unread) || (f==='groups'&&r.kind==='group'));
  const chip = (id, label) => `<span class="chip ${f===id?'active':''}" data-action="chat-filter" data-filter="${id}">${label}</span>`;
  return `
    <h1 class="title-1">Chat</h1>
    <div class="search" data-action="noop" data-toast="Search chats">${I('i-search')}Search conversations</div>
    <div class="chip-row">
      ${chip('all','All')}
      ${chip('unread','Unread')}
      ${chip('groups','Groups')}
      <span class="chip" data-action="noop" data-toast="Manage labels">Labels</span>
      <span class="chip" data-action="noop" data-toast="Archived chats">Archived</span>
    </div>
    ${rows.length===0 ? empty('i-chat', 'Nothing here', 'Try the All filter or start a new chat.') : ''}
    ${rows.map(r => `
      <div class="list-row" data-nav="chat-thread" data-ctx-id="${r.id}">
        <div class="list-avatar ${r.av}">${r.initials}</div>
        <div class="list-body"><div class="list-title">${r.title}${r.tag?` <span class="task-tag">${r.tag}</span>`:''}</div><div class="list-meta">${r.meta}</div></div>
        <div class="list-trail"><span class="list-time">${r.time}</span>${r.unread?`<span class="unread">${r.unread}</span>`:''}</div>
      </div>`).join('')}
    <div class="fab" data-action="fab-open">${I('i-pen')}</div>`;
};
/* ─── ME (deep screen, persona-adapted) ─── */
const meScreen = (p) => {
  const cfg = personas[p].profile;
  const isProd = !cfg.hrms;
  const isManager = cfg.manager || cfg.ceo;
  const payAmount = cfg.ceo ? '4,82,000' : (cfg.manager ? '92,500' : '7,302');
  return `
    <div class="glass profile">
      <div class="profile-avatar">${cfg.initials}</div>
      <div class="profile-info">
        <div class="profile-name">${cfg.name}</div>
        <div class="profile-role">${cfg.role}</div>
        <div class="profile-pills">
          ${cfg.verified ? '<span class="pill">Verified</span>' : ''}
          ${cfg.completion ? `<span class="pill">Profile ${cfg.completion}%</span>` : ''}
        </div>
      </div>
    </div>

    ${!isProd ? `
      <div class="glass pay-card" data-nav="payslip-detail" data-ctx-month="May 2026" data-ctx-amount="${payAmount}">
        <div class="pay-row1"><span>Net Pay · May 2026</span><span>Credited 1st</span></div>
        <div class="pay-amt"><small>₹</small>${payAmount}</div>
        <div style="margin-top:6px;font-size:10px;color:var(--muted-2);font-feature-settings:'tnum'">
          Earnings ${cfg.ceo?'₹5,12,000':(cfg.manager?'₹95,500':'₹7,452')} &nbsp;·&nbsp; Deductions ${cfg.ceo?'₹30,000':(cfg.manager?'₹3,000':'₹150')}
        </div>
        <div class="pay-cta"><span style="color:var(--muted);font-size:11px">Next payslip in 24 days</span><span>View payslip ${I('i-chev-r')}</span></div>
      </div>

      <h2 class="title-2">My Records</h2>
      ${settingsList([
        {icon:'i-card', title:'My Requests', meta:'12 approved · 2 pending', nav:'me-requests'},
        {icon:'i-rupee', title:'My Salary Slips', meta:'5 months', nav:'me-payslips'},
        {icon:'i-cal-sub', title:'My Leaves', meta:'3 used · 12 remaining this year', nav:'me-leaves'},
        {icon:'i-trend', title:'My Attendance', meta:'May · 6 of 7 working days', nav:'me-attendance'},
        {icon:'i-doc', title:'Documents', meta:'Payslips, ID proofs, agreements', nav:'documents'},
        {icon:'i-book', title:'Employee Handbook', meta:'Policies & guidelines', nav:'handbook'},
      ])}
    ` : `
      <h2 class="title-2">My Productivity</h2>
      ${settingsList([
        {icon:'i-note', title:'Notes', meta:'23 notes', action:'noop', toast:'Notes screen'},
        {icon:'i-cloud', title:'My Drive', meta:'2.4 GB used', action:'noop', toast:'Drive screen'},
        {icon:'i-bell-add', title:'Reminders', meta:'5 active', action:'noop', toast:'Reminders list'},
        {icon:'i-cal-sub', title:'Calendar Sync', meta:'Apple Calendar · Connected', action:'noop', toast:'Calendar settings'},
      ])}
    `}

    ${isManager ? `
      <h2 class="title-2">${cfg.ceo ? 'CEO Tools' : 'Manager Tools'}</h2>
      ${settingsList([
        {icon:'i-people', title:'Team Management', meta:cfg.ceo?'All branches':'8 direct reports', nav:'register'},
        {icon:'i-bldg', title:'Branch Settings', meta:cfg.ceo?'All 3 branches':'Hours, holidays, policies', nav:'branch-settings'},
        ...(cfg.ceo ? [{icon:'i-monitor', title:'Company Settings', meta:'Policies, billing, integrations', nav:'company-settings'}] : []),
      ])}
    ` : ''}

    <h2 class="title-2">Account</h2>
    ${settingsList([
      ...(cfg.hrms ? [{icon:'i-bldg', title:'Switch Company', meta:'Liberty Infospace · 1 of 2', nav:'switch-company'}] : []),
      {icon:'i-gear', title:'Settings', meta:'Theme, notifications, privacy', nav:'settings'},
    ])}
    ${isProd ? `<div class="settings-row" style="border-color:rgba(229,206,43,0.25);background:rgba(229,206,43,0.06)" data-action="noop" data-toast="Upgrade flow"><div class="list-icon warn">${I('i-star')}</div><div class="settings-body"><div class="settings-title">Upgrade to HRMS</div><div class="settings-meta">Get attendance, payroll, leave</div></div>${I('i-chev-r')}</div>` : ''}

    <div class="signout" data-action="sign-out">${I('i-arrow-out')}Sign Out</div>
  `;
};

/* ─── OFFICE (deep screen, manager only) ─── */
const officeScreen = (p) => {
  const isCEO = p === 'E';
  const scope = isCEO ? 'All Branches' : 'Head Office';
  const totalStaff = isCEO ? 23 : 18;
  const present = 7;
  const absent = isCEO ? 15 : 10;
  return `
    ${branchPulse(scope.toLowerCase(), present, totalStaff, absent, 1)}

    <h2 class="title-2">Today's Attendance</h2>
    <div class="att-grid">
      <div class="att-tile"><div class="num">0</div><div class="lbl">Late</div></div>
      <div class="att-tile"><div class="num">1</div><div class="lbl">Half Day</div></div>
      <div class="att-tile"><div class="num">0</div><div class="lbl">Week Off</div></div>
      <div class="att-tile"><div class="num" style="color:var(--destructive)">${isCEO ? 5 : 3}</div><div class="lbl">Red Flags</div></div>
    </div>

    <h2 class="title-2">Quick Actions</h2>
    <div class="action-grid">
      <div class="action-tile" data-nav="approvals"><span class="badge">4</span>${I('i-check-seal')}<div class="at-label">Approvals</div></div>
      <div class="action-tile" data-nav="mgmt-review"><span class="badge">15</span>${I('i-star')}<div class="at-label">Mgmt Review</div></div>
      <div class="action-tile" data-nav="register">${I('i-people')}<div class="at-label">Register</div></div>
      <div class="action-tile" data-nav="bg-verification">${I('i-shield')}<div class="at-label">BG Verification</div></div>
      ${isCEO ? `<div class="action-tile" data-nav="branches-list">${I('i-bldg')}<div class="at-label">Branches</div></div>` : ''}
      <div class="action-tile" data-nav="announce">${I('i-megaphone')}<div class="at-label">Announcements</div></div>
      <div class="action-tile" data-nav="documents">${I('i-doc')}<div class="at-label">Documents</div></div>
      <div class="action-tile" data-nav="leaves-mgmt">${I('i-cal-sub')}<div class="at-label">Leaves</div></div>
      <div class="action-tile" data-nav="holidays">${I('i-gift')}<div class="at-label">Holidays</div></div>
      <div class="action-tile" data-nav="reports">${I('i-chart')}<div class="at-label">Reports</div></div>
      ${isCEO ? `<div class="action-tile" data-nav="web-admin">${I('i-monitor')}<div class="at-label">Web Admin</div></div>` : ''}
      <div class="action-tile" data-nav="punch-location">${I('i-pin')}<div class="at-label">Location</div></div>
    </div>

    <div class="section-head"><h2 class="title-2">Pending Approvals</h2></div>
    <div class="glass approval">
      <div class="approval-row">
        <div class="list-avatar av3" style="width:28px;height:28px;font-size:9px">PS</div>
        <div style="flex:1"><div class="approval-name">Priya Sharma</div><div class="approval-meta">${isCEO ? 'Kolkata' : 'Sales Exec'} · 15-17 May</div></div>
      </div>
      <div class="approval-type">Casual Leave Request</div>
      <div class="approval-actions"><div class="btn danger" data-action="reject">Reject</div><div class="btn primary" data-action="approve">Approve</div></div>
    </div>
    <div class="glass approval">
      <div class="approval-row">
        <div class="list-avatar av4" style="width:28px;height:28px;font-size:9px">RM</div>
        <div style="flex:1"><div class="approval-name">Rahul Mehta</div><div class="approval-meta">Designer · 4 hours</div></div>
      </div>
      <div class="approval-type">Overtime Request</div>
      <div class="approval-actions"><div class="btn danger" data-action="reject">Reject</div><div class="btn primary" data-action="approve">Approve</div></div>
    </div>
  `;
};

/* ─── STATE & ROUTING ─── */
let state = {
  persona:'A',
  tab:'home',
  stack:[],
  wsFilter:'all',
  wsDone:new Set(),
  chatFilter:'all',
  punchedIn:true,
  holdTimer:null,
  fabOpen:false,
};

/* Toast utility */
function toast(msg, opts={}) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = 'toast' + (opts.kind ? ' toast-'+opts.kind : '');
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 220); }, opts.ms || 2000);
}

/* Navigation */
function navigate(id, ctx={}) {
  if (!SCREENS[id]) { toast('Screen "'+id+'" not built yet'); return; }
  state.fabOpen = false;
  state.stack.push({id, ctx:{...ctx}});
  renderAll();
  document.getElementById('body').scrollTo(0,0);
}
function back() {
  state.stack.pop();
  renderAll();
  document.getElementById('body').scrollTo(0,0);
}
function resetDeep() { state.stack = []; closeFab(); }

/* The SCREENS registry — populated in the screens block below */
const SCREENS = {};

function getBodyHTML() {
  if (state.stack.length > 0) {
    const top = state.stack[state.stack.length - 1];
    return SCREENS[top.id].render(state.persona, top.ctx);
  }
  if (state.tab === 'home') return homeFor(state.persona);
  if (state.tab === 'workspace') return workspace();
  if (state.tab === 'punch') return punchScreen();
  if (state.tab === 'chat') return chat();
  if (state.tab === 'me') return meScreen(state.persona);
  return '<div style="padding:40px;text-align:center;color:var(--muted)">—</div>';
}

/* Unified click delegation */
function wire(root) {
  root.querySelectorAll('[data-action]:not([data-wired])').forEach(el => {
    el.setAttribute('data-wired','1');
    const a = el.dataset.action;
    if (a === 'punch-hold') {
      const start = (e) => { e.preventDefault(); startPunchHold(el); };
      const cancel = () => cancelPunchHold();
      el.addEventListener('mousedown', start);
      el.addEventListener('touchstart', start, {passive:false});
      el.addEventListener('mouseup', cancel);
      el.addEventListener('mouseleave', cancel);
      el.addEventListener('touchend', cancel);
      el.addEventListener('touchcancel', cancel);
    } else {
      el.addEventListener('click', (e) => handleAction(a, el, e));
    }
  });
  root.querySelectorAll('[data-nav]:not([data-wired])').forEach(el => {
    el.setAttribute('data-wired','1');
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const ctx = {};
      Array.from(el.attributes).forEach(att => {
        if (att.name.startsWith('data-ctx-')) ctx[att.name.slice(9)] = att.value;
      });
      navigate(el.dataset.nav, ctx);
    });
  });
}

function handleAction(a, el, e) {
  if (a === 'back') back();
  else if (a === 'open-office') navigate('office');
  else if (a === 'goto-punch') { state.tab='punch'; resetDeep(); renderAll(); }
  else if (a === 'toggle-task') {
    const id = el.dataset.task;
    if (state.wsDone.has(id)) state.wsDone.delete(id); else state.wsDone.add(id);
    renderAll();
  }
  else if (a === 'ws-filter') { state.wsFilter = el.dataset.filter; renderAll(); }
  else if (a === 'chat-filter') { state.chatFilter = el.dataset.filter; renderAll(); }
  else if (a === 'approve') {
    const row = el.closest('.approval');
    toast('Approved', {kind:'success'});
    if (row) { row.style.transition='opacity 0.2s, transform 0.2s'; row.style.opacity='0'; row.style.transform='translateX(20px)'; setTimeout(()=>row.remove(),200); }
  }
  else if (a === 'reject') {
    const row = el.closest('.approval');
    toast('Rejected', {kind:'danger'});
    if (row) { row.style.transition='opacity 0.2s, transform 0.2s'; row.style.opacity='0'; row.style.transform='translateX(-20px)'; setTimeout(()=>row.remove(),200); }
  }
  else if (a === 'sign-out') { toast('Signed out (demo)'); }
  else if (a === 'send-msg') { sendMessage(); }
  else if (a === 'fab-open') openFab();
  else if (a === 'fab-close') closeFab();
  else if (a === 'submit-form') { toast(el.dataset.toast || 'Submitted', {kind:'success'}); back(); }
  else if (a === 'copy-link') { toast('Link copied to clipboard'); }
  else if (a === 'noop') { toast(el.dataset.toast || 'Coming soon'); }
}

/* Punch hold-to-confirm */
function startPunchHold(orb) {
  cancelPunchHold();
  orb.classList.add('holding');
  state.holdTimer = setTimeout(() => {
    state.punchedIn = !state.punchedIn;
    orb.classList.remove('holding');
    toast(state.punchedIn ? 'Punched In · 09:30 AM' : 'Punched Out · 05:06 PM', {kind:'success'});
    renderAll();
  }, 1100);
}
function cancelPunchHold() {
  clearTimeout(state.holdTimer);
  state.holdTimer = null;
  document.querySelectorAll('.punch-orb.holding').forEach(o => o.classList.remove('holding'));
}

/* Chat thread send */
function sendMessage() {
  const input = document.querySelector('.thread-input input');
  if (!input || !input.value.trim()) return;
  const text = input.value.trim();
  input.value = '';
  const top = state.stack[state.stack.length - 1];
  if (!top || top.id !== 'chat-thread') return;
  top.ctx.msgs = top.ctx.msgs || [];
  const now = new Date();
  const ts = now.getHours()%12 + ':' + String(now.getMinutes()).padStart(2,'0') + ' ' + (now.getHours()>=12?'PM':'AM');
  top.ctx.msgs.push({dir:'out', text, ts});
  renderAll();
  requestAnimationFrame(() => {
    const body = document.getElementById('body');
    body.scrollTop = body.scrollHeight;
    document.querySelector('.thread-input input')?.focus();
  });
}

/* FAB menu */
function openFab() { state.fabOpen = true; renderAll(); }
function closeFab() { state.fabOpen = false; const ov = document.querySelector('.fab-menu'); if (ov) ov.remove(); }
function renderFabMenu() {
  if (!state.fabOpen) { closeFab(); return; }
  let existing = document.querySelector('.fab-menu');
  if (existing) existing.remove();
  const items = state.tab === 'workspace' ? [
    {icon:'i-tasks', title:'New Task', sub:'Add to your list', nav:'task-new'},
    {icon:'i-video-plus', title:'New Meeting', sub:'Schedule or start now', nav:'meet-new'},
    {icon:'i-note', title:'New Note', sub:'Quick capture', nav:'note-new'},
    {icon:'i-bell-add', title:'New Reminder', sub:'One-time alert', nav:'reminder-new'},
  ] : state.tab === 'chat' ? [
    {icon:'i-pen', title:'New Chat', sub:'Pick a contact', nav:'chat-new'},
    {icon:'i-people', title:'New Group', sub:'Multi-person thread', nav:'chat-new-group'},
    {icon:'i-megaphone', title:'New Channel', sub:'Broadcast to many', nav:'chat-new-channel'},
  ] : [];
  if (items.length === 0) return;
  const overlay = document.createElement('div');
  overlay.className = 'fab-menu';
  overlay.innerHTML = `<div class="fab-menu-panel">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div style="font-size:14px;font-weight:600">Create</div>
      <div class="hdr-back" data-action="fab-close" style="margin:0">${I('i-x')}</div>
    </div>
    ${items.map(it => `<div class="fab-menu-row" data-nav="${it.nav}">
      <div class="list-icon">${I(it.icon)}</div>
      <div style="flex:1"><div class="fmr-title">${it.title}</div><div class="fmr-sub">${it.sub}</div></div>
      ${I('i-chev-r')}
    </div>`).join('')}
  </div>`;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeFab(); });
  document.body.appendChild(overlay);
  wire(overlay);
  // Close fab AFTER nav triggers
  overlay.querySelectorAll('[data-nav]').forEach(el => el.addEventListener('click', closeFab));
}

function renderHeader() {
  const p = personas[state.persona];
  const h = p.header;
  const hdr = document.getElementById('hdr');
  const top = state.stack[state.stack.length - 1];
  if (top) {
    const s = SCREENS[top.id];
    const title = typeof s.title === 'function' ? s.title(top.ctx, state.persona) : s.title;
    hdr.innerHTML = `
      <div class="hdr-back" data-action="back">${I('i-chev-l')}</div>
      <div class="hdr-title">${title}</div>
      <div class="hdr-spacer"></div>
      <div class="hdr-bell" data-nav="notifications">${I('i-bell')}</div>
    `;
  } else if (h.type === 'brand') {
    hdr.innerHTML = `
      <div class="hdr-logo brand">${h.logo}</div>
      <div class="hdr-name">${h.name}</div>
      <div class="hdr-spacer"></div>
      <div class="hdr-bell" data-nav="notifications">${I('i-bell')}</div>
    `;
  } else {
    hdr.innerHTML = `
      <div class="hdr-logo">${h.logo}</div>
      <div class="hdr-name" data-nav="company-menu">${h.name}${I('i-chev-d')}</div>
      <div class="hdr-branch ${h.branch.readonly?'readonly':''}" ${h.branch.readonly?'':'data-nav="branch-menu"'}>${I('i-bldg')}<span class="b-label">${h.branch.label}</span><svg class="b-chev"><use href="#i-chev-d"/></svg></div>
      <div class="hdr-spacer"></div>
      <div class="hdr-bell" data-nav="notifications">${I('i-bell')}</div>
    `;
  }
  wire(hdr);
}

function renderTabs() {
  const p = personas[state.persona];
  const tabs = document.getElementById('tabs');
  tabs.innerHTML = p.tabs.map(t =>
    `<button class="tab ${(state.stack.length===0 && t.id===state.tab)?'active':''}" data-tab="${t.id}">${I(t.icon)}<span class="t-label">${t.label}</span></button>`
  ).join('');
  tabs.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      state.tab = btn.dataset.tab;
      resetDeep();
      renderAll();
      document.getElementById('body').scrollTo(0,0);
    });
  });
}

function renderBody() {
  const body = document.getElementById('body');
  body.innerHTML = getBodyHTML();
  wire(body);
}

function renderPersonaSwitcher() {
  const sw = document.getElementById('personaSwitcher');
  sw.innerHTML = Object.entries(personas).map(([k,p]) =>
    `<button class="persona-btn ${state.persona===k?'active':''}" data-persona="${k}">
       <span class="pb-tag">${k}</span>
       <div><span class="pb-name">${p.label}</span><span class="pb-sub">${p.sub}</span></div>
     </button>`
  ).join('');
  sw.querySelectorAll('.persona-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.persona = btn.dataset.persona;
      state.tab = personas[state.persona].default;
      resetDeep();
      renderAll();
      document.getElementById('body').scrollTo(0,0);
    });
  });
}

function renderInfo() {
  const p = personas[state.persona];
  const info = document.getElementById('infoPanel');
  const moduleLabels = {prod:'Productivity', hrms:'HRMS', 'manage-branch':'Branch Mgmt', 'manage-company':'Company Mgmt'};
  const top = state.stack[state.stack.length - 1];
  const currentLabel = top ? (typeof SCREENS[top.id].title === 'function' ? SCREENS[top.id].title(top.ctx, state.persona) : SCREENS[top.id].title) : (p.tabs.find(t=>t.id===state.tab)?.label || '—');
  const isHRMS = p.modules.includes('hrms');
  info.innerHTML = `
    <section>
      <h3>Currently viewing</h3>
      <div class="info-row"><span>Persona</span><b>${p.label}</b></div>
      <div class="info-row"><span>Screen</span><b>${currentLabel}</b></div>
      <div class="info-row"><span>Default tab</span><b>${p.tabs.find(t=>t.id===p.default)?.label}</b></div>
      <div class="info-row"><span>Tab count</span><b>${p.tabs.length}</b></div>
    </section>
    <section>
      <h3>Tab Bar</h3>
      ${p.tabs.map((t,i) => `<div class="info-row"><span>${i+1}</span><b>${t.label}${t.id===p.default?' <span class="muted" style="font-weight:400;font-size:10px">(default)</span>':''}</b></div>`).join('')}
      <p class="note" style="margin-top:8px">${isHRMS ? '5 tabs · Punch is its own dedicated tab' : '4 tabs · No Punch (productivity-only)'}</p>
    </section>
    <section>
      <h3>Nav Bar (top)</h3>
      <p style="font-size:12px;color:var(--muted);line-height:1.5;margin:0">
        ${isHRMS
          ? '<b style="color:var(--fg)">Company switcher</b> + <b style="color:var(--fg)">Branch chip</b> + Bell. Avatar moved to bottom Tab Bar (Me tab).'
          : 'EasyDo brand + Bell. No company/branch chip for productivity-only users.'}
      </p>
    </section>
    <section>
      <h3>Module access</h3>
      <p>${p.modules.map(m=>`<span class="module-pill ${m==='prod'?'prod':'hrms'}">${moduleLabels[m]||m}</span>`).join('')}</p>
      <p class="note">${
        state.persona === 'A' ? 'No company affiliation. No Punch tab. Tasks + Meet inside Workspace.' :
        state.persona === 'B' ? 'Sees own attendance/payroll only. Punch tab is the default landing. Status pill on Home shows current punch state.' :
        state.persona === 'D' ? 'Manages a single branch. Branch Pulse + Manage Office card on Home. Tap Manage Office for the company control panel.' :
        'Company-wide oversight. All Branches scope. Branch breakdown on Home.'
      }</p>
    </section>
    <section>
      <h3>How to navigate</h3>
      <p style="font-size:12px;color:var(--muted);line-height:1.7;margin:0">
        • Click any tab in the bottom Tab Bar to switch.<br>
        ${isHRMS ? '• <b style="color:var(--fg)">Punch</b> tab = standalone punch in/out + status + location + week.<br>• Punch status pill on Home → tap to jump to Punch tab.<br>' : ''}
        • <b style="color:var(--fg)">Me</b> tab = profile + ${isHRMS ? 'pay summary, requests, salary slips, leaves' : 'productivity tools (Notes, Drive, Reminders)'}.<br>
        ${p.modules.includes('manage-branch') || p.modules.includes('manage-company') ? '• Tap "Manage Office" card on Home → opens Office sub-screen.<br>' : ''}
        • Switch personas above to compare.
      </p>
    </section>
  `;
}

/* ─── SUB-SCREEN RENDERERS ─── */

/* ---- Shared helpers ---- */
const empty = (icon, title, sub) => `<div class="empty">
  <div class="empty-icon">${I(icon)}</div>
  <div class="empty-title">${title}</div>
  <div class="empty-sub">${sub}</div>
</div>`;

const formScreen = (fields, submitLabel, toastMsg) => `
  <div style="padding:2px 0 80px">
    ${fields}
    <div style="position:sticky;bottom:0;padding:14px 0 0;background:linear-gradient(to top,#0a0a0d 60%,transparent)">
      <button class="btn-block primary" data-action="submit-form" data-toast="${toastMsg}">${submitLabel}</button>
    </div>
  </div>`;

const settingsList = (rows) => rows.map(r => `
  <div class="settings-row" ${r.nav?`data-nav="${r.nav}"`:''} ${r.action?`data-action="${r.action}"`:''}>
    <div class="list-icon ${r.warn?'warn':''}">${I(r.icon)}</div>
    <div class="settings-body"><div class="settings-title">${r.title}</div>${r.meta?`<div class="settings-meta">${r.meta}</div>`:''}</div>
    ${r.toggle!==undefined ? `<div class="toggle ${r.toggle?'on':''}"></div>` : (r.trail || I('i-chev-r'))}
  </div>`).join('');

/* ---- Company / Branch menus ---- */
SCREENS['company-menu'] = {
  title: 'Company',
  render: (p) => {
    const isCEO = p === 'E';
    const persona = personas[p];
    const compName = persona.header.name || 'Liberty Infospace';
    return `
      <div class="menu-current">
        <div class="mc-logo">L</div>
        <div style="flex:1"><div class="mc-name">${compName}</div><div class="mc-sub">${isCEO ? 'CEO · 3 branches · 23 staff' : 'Member · Head Office'}</div></div>
      </div>
      <h2 class="title-2">Manage</h2>
      ${settingsList([
        ...(isCEO ? [{icon:'i-gear', title:'Company Settings', meta:'Policies, billing, integrations', nav:'company-settings'}] : []),
        {icon:'i-bldg', title:'Switch Company', meta:'Liberty Infospace · 1 of 2', nav:'switch-company'},
        {icon:'i-people', title:'Members', meta:'23 staff across 3 branches', nav:'register'},
        {icon:'i-info', title:'About this company', meta:'Founded 2018 · liberty.example', action:'noop', toast:'About panel coming soon'},
      ])}
    `;
  }
};

SCREENS['branch-menu'] = {
  title: 'Branch',
  render: (p) => {
    const isManager = p === 'D' || p === 'E';
    const isCEO = p === 'E';
    const branchLabel = personas[p].header.branch?.label || 'Head Office';
    return `
      <div class="menu-current">
        <div class="mc-logo" style="background:rgba(229,206,43,0.18);color:var(--primary)">${I('i-bldg')}</div>
        <div style="flex:1"><div class="mc-name">${branchLabel}</div><div class="mc-sub">${isCEO?'All Branches scope':'Kolkata · 18 staff'}</div></div>
      </div>
      <h2 class="title-2">Manage</h2>
      ${settingsList([
        ...(isManager ? [{icon:'i-gear', title:'Branch Settings', meta:'Hours, holidays, locations, policies', nav:'branch-settings'}] : []),
        {icon:'i-bldg', title:'Switch Branch', meta:isCEO?'3 branches available':'No other branches', nav:'branches-list'},
        {icon:'i-pin', title:'Branch Location', meta:'4B/2 Hazra Rd, Kolkata 700026', nav:'punch-location'},
        ...(isCEO ? [{icon:'i-people', title:'Branch Roster', meta:'18 employees in this branch', nav:'register'}] : []),
      ])}
    `;
  }
};

/* ---- Settings screens ---- */
SCREENS['company-settings'] = {
  title: 'Company Settings',
  render: () => `
    <h2 class="title-2">General</h2>
    ${settingsList([
      {icon:'i-bldg', title:'Company Profile', meta:'Name, logo, address, GST', action:'noop', toast:'Edit Profile screen'},
      {icon:'i-people', title:'Roles & Permissions', meta:'3 roles defined', action:'noop'},
      {icon:'i-card', title:'Billing & Plan', meta:'Growth · ₹4,800/mo · renews 1 Jun', action:'noop'},
    ])}
    <h2 class="title-2">Policies</h2>
    ${settingsList([
      {icon:'i-cal-sub', title:'Leave Policy', meta:'15 PL · 12 SL · 12 CL per year', action:'noop'},
      {icon:'i-clock', title:'Attendance Policy', meta:'9h work · flexible · OT off', action:'noop'},
      {icon:'i-rupee', title:'Payroll Policy', meta:'Credit 1st of month · UPI', action:'noop'},
    ])}
    <h2 class="title-2">Integrations</h2>
    ${settingsList([
      {icon:'i-cal-sub', title:'Calendar Sync', meta:'Google Workspace · Connected', toggle:true},
      {icon:'i-monitor', title:'Slack', meta:'Notifications to #hr-feed', toggle:true},
      {icon:'i-cloud', title:'Drive Backup', meta:'Daily · 02:00 IST', toggle:false},
    ])}
    <h2 class="title-2">Danger Zone</h2>
    <div class="settings-row" style="border-color:rgba(229,82,79,0.25);background:rgba(229,82,79,0.05)" data-action="noop" data-toast="Confirm dialog would appear">
      <div class="list-icon" style="background:rgba(229,82,79,0.15);color:#fca5a5">${I('i-no-overtime')}</div>
      <div class="settings-body"><div class="settings-title" style="color:#fca5a5">Delete Company</div><div class="settings-meta">Permanent · cannot be undone</div></div>
      ${I('i-chev-r')}
    </div>
  `
};

SCREENS['branch-settings'] = {
  title: 'Branch Settings',
  render: (p) => {
    const branchLabel = personas[p].header.branch?.label || 'Head Office';
    return `
      <p class="subhead" style="margin:0 0 10px">${branchLabel}</p>
      <h2 class="title-2">Working Hours</h2>
      ${settingsList([
        {icon:'i-clock', title:'Office Hours', meta:'9:30 AM – 6:30 PM', action:'noop'},
        {icon:'i-cal-sub', title:'Working Days', meta:'Mon – Sat (alt Sat off)', action:'noop'},
        {icon:'i-no-overtime', title:'Overtime', meta:'Disabled', toggle:false},
        {icon:'i-pin', title:'Flexible hours', meta:'Allowed within 30 min window', toggle:true},
      ])}
      <h2 class="title-2">Location & Geofence</h2>
      ${settingsList([
        {icon:'i-pin', title:'Office Locations', meta:'1 active · Head Office', action:'noop'},
        {icon:'i-shield', title:'Punch Geofence', meta:'200m radius', toggle:true},
        {icon:'i-trend', title:'Location Tracking', meta:'During work hours only', toggle:true},
      ])}
      <h2 class="title-2">Holidays & Leaves</h2>
      ${settingsList([
        {icon:'i-gift', title:'Holiday Calendar', meta:'12 holidays this year', nav:'holidays'},
        {icon:'i-cal-sub', title:'Branch Leave Cap', meta:'Max 3 on leave per day', action:'noop'},
      ])}
    `;
  }
};

SCREENS['settings'] = {
  title: 'Settings',
  render: () => `
    <h2 class="title-2">Appearance</h2>
    ${settingsList([
      {icon:'i-monitor', title:'Theme', meta:'Dark (system)', action:'noop'},
      {icon:'i-info', title:'Text Size', meta:'Default', action:'noop'},
    ])}
    <h2 class="title-2">Notifications</h2>
    ${settingsList([
      {icon:'i-bell', title:'Push notifications', toggle:true},
      {icon:'i-bell-add', title:'Reminders', toggle:true},
      {icon:'i-megaphone', title:'Announcements', toggle:true},
      {icon:'i-chat', title:'New messages', toggle:true},
    ])}
    <h2 class="title-2">Privacy & Security</h2>
    ${settingsList([
      {icon:'i-shield', title:'App Lock', meta:'Face ID', toggle:false},
      {icon:'i-pin', title:'Location sharing', meta:'During work hours', toggle:true},
      {icon:'i-doc', title:'Privacy Policy', action:'noop'},
      {icon:'i-book', title:'Terms of Service', action:'noop'},
    ])}
    <h2 class="title-2">About</h2>
    ${settingsList([
      {icon:'i-info', title:'Version', meta:'5.0.1 (build 412)', action:'noop'},
      {icon:'i-megaphone', title:"What's new", action:'noop'},
    ])}
  `
};

SCREENS['switch-company'] = {
  title: 'Switch Company',
  render: () => `
    <p class="subhead" style="margin:0 0 10px">Choose a company to switch into</p>
    ${settingsList([
      {icon:'i-bldg', title:'Liberty Infospace', meta:'Current · 23 staff · 3 branches', action:'noop', toast:'Already on Liberty', trail:`<div class="list-icon" style="background:rgba(16,185,129,0.18);color:#34d399;width:24px;height:24px">${I('i-check')}</div>`},
      {icon:'i-bldg', title:'Personal Projects', meta:'Solo workspace · No HRMS', action:'noop', toast:'Switched to Personal Projects'},
    ])}
    <h2 class="title-2">Other</h2>
    ${settingsList([
      {icon:'i-plus', title:'Join another company', meta:'Enter invite code', action:'noop', toast:'Invite-code form would open'},
    ])}
  `
};

/* ---- Notifications ---- */
SCREENS['notifications'] = {
  title: 'Notifications',
  render: () => {
    const items = [
      {icon:'i-check-seal', title:'Casual Leave approved', meta:'By Amulya Sir · 2 min ago', tone:'success'},
      {icon:'i-rupee', title:'Salary credited', meta:'₹92,500 · April · UPI', tone:'success'},
      {icon:'i-megaphone', title:'Test announcement', meta:'All Branches · 7 May'},
      {icon:'i-bell-add', title:'Reminder: Submit weekly report', meta:'Today, 4:00 PM'},
      {icon:'i-meet', title:'Liberty Kolkata Dev starts in 30 min', meta:'2:00 PM · Group'},
      {icon:'i-people', title:'Rounik joined iOS Testing Group', meta:'Yesterday'},
      {icon:'i-gift', title:'Buddha Purnima on 15 May', meta:'Office closed'},
    ];
    return `
      <p class="subhead" style="margin:0 0 8px">7 new · this week</p>
      ${items.map(n => `
        <div class="list-row" style="padding:12px 8px">
          <div class="list-icon ${n.tone==='success'?'':''}" style="${n.tone==='success'?'background:rgba(16,185,129,0.12);color:#34d399':''}">${I(n.icon)}</div>
          <div class="list-body"><div class="list-title">${n.title}</div><div class="list-meta">${n.meta}</div></div>
        </div>
      `).join('')}
      <div style="text-align:center;color:var(--muted);font-size:11px;padding:12px 0">— end —</div>
    `;
  }
};

/* ---- Me sub-screens ---- */
SCREENS['me-requests'] = {
  title: 'My Requests',
  render: () => {
    const reqs = [
      {icon:'i-cal-sub', title:'Casual Leave · 15-17 May', meta:'Submitted 3 days ago', status:'pending'},
      {icon:'i-clock', title:'Overtime · 4 hours', meta:'1 May · Stress test', status:'approved'},
      {icon:'i-rupee', title:'Salary Advance · ₹15,000', meta:'Apr 28 · Family medical', status:'approved'},
      {icon:'i-card', title:'Reimburse · ₹2,400', meta:'Apr 22 · Cab vouchers', status:'rejected'},
      {icon:'i-cal-sub', title:'Sick Leave · 18 Apr', meta:'1 day · Approved by manager', status:'approved'},
    ];
    const statusBadge = (s) => s==='pending' ? `<span class="pill warn">Pending</span>` : s==='approved' ? `<span class="pill" style="background:rgba(16,185,129,0.15);color:#34d399">Approved</span>` : `<span class="pill" style="background:rgba(229,82,79,0.15);color:#fca5a5">Rejected</span>`;
    return `
      <div style="display:flex;gap:6px;margin-bottom:10px">
        <span class="chip active">All (5)</span><span class="chip">Pending (1)</span><span class="chip">Approved (3)</span><span class="chip">Rejected (1)</span>
      </div>
      ${reqs.map(r => `
        <div class="settings-row" data-action="noop" data-toast="Request detail screen">
          <div class="list-icon">${I(r.icon)}</div>
          <div class="settings-body"><div class="settings-title">${r.title}</div><div class="settings-meta">${r.meta}</div></div>
          ${statusBadge(r.status)}
        </div>`).join('')}
      <div style="height:80px"></div>
      <div style="position:fixed;bottom:90px;right:24px"><div class="fab" data-nav="apply-leave">${I('i-plus')}</div></div>
    `;
  }
};

SCREENS['me-payslips'] = {
  title: 'My Salary Slips',
  render: () => {
    const slips = [
      {month:'May 2026', amount:'92,500', date:'Credited 1 May', current:true},
      {month:'Apr 2026', amount:'92,500', date:'Credited 1 Apr'},
      {month:'Mar 2026', amount:'92,500', date:'Credited 1 Mar'},
      {month:'Feb 2026', amount:'88,000', date:'Credited 1 Feb'},
      {month:'Jan 2026', amount:'88,000', date:'Credited 1 Jan'},
    ];
    return slips.map(s => `
      <div class="settings-row" data-nav="payslip-detail" data-ctx-month="${s.month}" data-ctx-amount="${s.amount}">
        <div class="list-icon ${s.current?'warn':''}">${I('i-rupee')}</div>
        <div class="settings-body"><div class="settings-title">${s.month} ${s.current?'· <span style="color:var(--primary);font-weight:500;font-size:11px">Current</span>':''}</div><div class="settings-meta">₹${s.amount} · ${s.date}</div></div>
        ${I('i-chev-r')}
      </div>`).join('');
  }
};

SCREENS['payslip-detail'] = {
  title: (ctx) => ctx.month || 'Payslip',
  render: (p, ctx) => {
    const amount = ctx.amount || '92,500';
    return `
      <div class="glass pay-card">
        <div class="pay-row1"><span>Net Pay · ${ctx.month||'May 2026'}</span><span>Credited 1st</span></div>
        <div class="pay-amt"><small>₹</small>${amount}</div>
        <div style="margin-top:6px;font-size:10px;color:var(--muted-2)">Sayantan Ghosh · L1 · UAN 100234567890</div>
      </div>
      <h2 class="title-2">Earnings</h2>
      <div class="glass" style="padding:8px 12px">
        <div class="row-between" style="padding:6px 0;font-size:12px;border-bottom:1px solid var(--border)"><span>Basic</span><span style="font-feature-settings:'tnum'">₹45,000</span></div>
        <div class="row-between" style="padding:6px 0;font-size:12px;border-bottom:1px solid var(--border)"><span>HRA</span><span style="font-feature-settings:'tnum'">₹22,500</span></div>
        <div class="row-between" style="padding:6px 0;font-size:12px;border-bottom:1px solid var(--border)"><span>Special Allowance</span><span style="font-feature-settings:'tnum'">₹18,000</span></div>
        <div class="row-between" style="padding:6px 0;font-size:12px;border-bottom:1px solid var(--border)"><span>Conveyance</span><span style="font-feature-settings:'tnum'">₹7,000</span></div>
        <div class="row-between" style="padding:6px 0;font-size:12px"><span>OT (4 hrs)</span><span style="font-feature-settings:'tnum'">₹3,000</span></div>
      </div>
      <h2 class="title-2">Deductions</h2>
      <div class="glass" style="padding:8px 12px">
        <div class="row-between" style="padding:6px 0;font-size:12px;border-bottom:1px solid var(--border)"><span>PF (12%)</span><span style="font-feature-settings:'tnum'">₹2,400</span></div>
        <div class="row-between" style="padding:6px 0;font-size:12px;border-bottom:1px solid var(--border)"><span>Professional Tax</span><span style="font-feature-settings:'tnum'">₹200</span></div>
        <div class="row-between" style="padding:6px 0;font-size:12px"><span>Income Tax (TDS)</span><span style="font-feature-settings:'tnum'">₹400</span></div>
      </div>
      <div class="cta-row" style="margin-top:14px">
        <button class="btn-block" data-action="noop" data-toast="Sharing PDF...">${I('i-paperclip')}Share</button>
        <button class="btn-block primary" data-action="noop" data-toast="Downloading payslip.pdf">${I('i-download')}Download PDF</button>
      </div>
    `;
  }
};

SCREENS['me-leaves'] = {
  title: 'My Leaves',
  render: () => `
    <div class="att-grid" style="margin-bottom:14px">
      <div class="att-tile"><div class="num" style="color:var(--primary)">12</div><div class="lbl">Available</div></div>
      <div class="att-tile"><div class="num">3</div><div class="lbl">Used</div></div>
      <div class="att-tile"><div class="num">1</div><div class="lbl">Pending</div></div>
      <div class="att-tile"><div class="num">15</div><div class="lbl">Year quota</div></div>
    </div>
    <h2 class="title-2">Balance by type</h2>
    ${settingsList([
      {icon:'i-cal-sub', title:'Casual Leave', meta:'8 of 10 remaining', action:'noop'},
      {icon:'i-pin', title:'Sick Leave', meta:'3 of 5 remaining', action:'noop'},
      {icon:'i-gift', title:'Earned Leave', meta:'1 of 0 (carried over)', action:'noop'},
    ])}
    <h2 class="title-2">Recent</h2>
    ${settingsList([
      {icon:'i-cal-sub', title:'Casual Leave · 15-17 May', meta:'3 days · Pending approval', action:'noop', trail:`<span class="pill warn">Pending</span>`},
      {icon:'i-pin', title:'Sick Leave · 18 Apr', meta:'1 day · Approved', action:'noop', trail:`<span class="pill" style="background:rgba(16,185,129,0.15);color:#34d399">Approved</span>`},
    ])}
    <div style="position:fixed;bottom:90px;right:24px"><div class="fab" data-nav="apply-leave">${I('i-plus')}</div></div>
  `
};

SCREENS['apply-leave'] = {
  title: 'Apply Leave',
  render: () => formScreen(`
    <div class="field"><label>Leave Type</label>
      <select><option>Casual Leave (8 remaining)</option><option>Sick Leave (3 remaining)</option><option>Earned Leave (1 remaining)</option></select>
    </div>
    <div class="field-row">
      <div class="field"><label>From</label><input type="date" value="2026-05-15"></div>
      <div class="field"><label>To</label><input type="date" value="2026-05-17"></div>
    </div>
    <div class="field"><label>Reason</label><textarea placeholder="Briefly describe the reason for your leave...">Family function out of town</textarea></div>
    <div class="field"><label>Notify (optional)</label><input placeholder="Search by name or @handle" value="@amulya, @rounik"></div>
  `, 'Submit Request', 'Leave request submitted')
};

SCREENS['apply-ot'] = {
  title: 'Apply Overtime',
  render: () => formScreen(`
    <div class="field"><label>Date</label><input type="date" value="2026-05-08"></div>
    <div class="field-row">
      <div class="field"><label>Start</label><input type="time" value="19:00"></div>
      <div class="field"><label>End</label><input type="time" value="23:00"></div>
    </div>
    <div class="field"><label>Reason</label><textarea placeholder="What requires overtime?"></textarea></div>
  `, 'Request Overtime', 'Overtime request submitted')
};

SCREENS['advance'] = {
  title: 'Salary Advance',
  render: () => formScreen(`
    <div class="field"><label>Amount</label><input type="number" placeholder="0" value="15000"></div>
    <div class="field"><label>Recover from</label><select><option>Next month payslip</option><option>Split over 2 months</option><option>Split over 3 months</option></select></div>
    <div class="field"><label>Reason</label><textarea placeholder="Brief reason"></textarea></div>
    <p style="font-size:11px;color:var(--muted);margin:6px 0 0">Max eligibility: ₹35,000 (50% of monthly net)</p>
  `, 'Submit Request', 'Advance request submitted')
};

SCREENS['reimburse'] = {
  title: 'Reimbursement',
  render: () => formScreen(`
    <div class="field"><label>Category</label>
      <select><option>Travel / Cab</option><option>Meals (client)</option><option>Office supplies</option><option>Internet / Phone</option><option>Other</option></select>
    </div>
    <div class="field-row">
      <div class="field"><label>Date</label><input type="date" value="2026-05-07"></div>
      <div class="field"><label>Amount (₹)</label><input type="number" placeholder="0"></div>
    </div>
    <div class="field"><label>Attach receipt</label>
      <button class="btn-block" data-action="noop" data-toast="Picker would open" style="margin-top:4px">${I('i-paperclip')}Attach photo or PDF</button>
    </div>
    <div class="field"><label>Description</label><textarea placeholder="What is this for?"></textarea></div>
  `, 'Submit Claim', 'Reimbursement submitted')
};

SCREENS['me-attendance'] = {
  title: 'My Attendance',
  render: () => {
    const days = ['M','T','W','T','F','S','S'];
    const data = [
      ['p','p','p','h','p','o','o'],
      ['p','p','l','p','p','o','o'],
      ['p','p','p','p','p','o','o'],
      ['p','p','p','a','p','o','o'],
      ['p','p','c','','','',''],
    ];
    const colorMap = {p:'var(--success)', a:'var(--destructive)', l:'var(--info)', h:'var(--muted-2)', o:'var(--muted-2)', c:'var(--primary)'};
    return `
      <div class="att-grid" style="margin-bottom:14px">
        <div class="att-tile"><div class="num" style="color:var(--success)">22</div><div class="lbl">Present</div></div>
        <div class="att-tile"><div class="num" style="color:var(--destructive)">1</div><div class="lbl">Absent</div></div>
        <div class="att-tile"><div class="num" style="color:var(--info)">1</div><div class="lbl">Leave</div></div>
        <div class="att-tile"><div class="num">96%</div><div class="lbl">Score</div></div>
      </div>
      <h2 class="title-2">May 2026</h2>
      <div class="glass" style="padding:12px">
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;font-size:9px;color:var(--muted-2);margin-bottom:6px">
          ${days.map(d=>`<div>${d}</div>`).join('')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">
          ${data.flat().map((s,i)=>`<div style="aspect-ratio:1;border-radius:6px;background:${s?`${colorMap[s]||'rgba(255,255,255,0.04)'}`:'transparent'};opacity:${s==='o'?'0.25':'0.85'};display:flex;align-items:center;justify-content:center;font-size:9px;color:${s==='c'?'var(--primary-fg)':'#fff'};font-weight:600">${s && s!=='o' && s!=='h' ? (i+1) : (s==='o'?'·':(s==='h'?'H':''))}</div>`).join('')}
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;font-size:9.5px;color:var(--muted)">
          <span><span style="width:8px;height:8px;border-radius:2px;background:var(--success);display:inline-block;vertical-align:middle;margin-right:3px"></span>Present</span>
          <span><span style="width:8px;height:8px;border-radius:2px;background:var(--destructive);display:inline-block;vertical-align:middle;margin-right:3px"></span>Absent</span>
          <span><span style="width:8px;height:8px;border-radius:2px;background:var(--info);display:inline-block;vertical-align:middle;margin-right:3px"></span>Leave</span>
          <span><span style="width:8px;height:8px;border-radius:2px;background:var(--primary);display:inline-block;vertical-align:middle;margin-right:3px"></span>Today</span>
        </div>
      </div>
    `;
  }
};

SCREENS['documents'] = {
  title: 'Documents',
  render: () => {
    const cats = [
      {icon:'i-rupee', title:'Payslips', meta:'5 documents · last May 2026', nav:'me-payslips'},
      {icon:'i-card', title:'ID Proofs', meta:'Aadhaar, PAN', action:'noop'},
      {icon:'i-doc', title:'Offer & Appointment', meta:'2 documents', action:'noop'},
      {icon:'i-shield', title:'Background Verification', meta:'Cleared · 12 Jan 2024', action:'noop'},
      {icon:'i-doc', title:'Form 16 (FY24-25)', meta:'1.2 MB · 28 Apr 2025', action:'noop', toast:'Downloading Form 16…'},
      {icon:'i-card', title:'Bank Details', meta:'HDFC · ••••5421', action:'noop'},
    ];
    return settingsList(cats);
  }
};

SCREENS['handbook'] = {
  title: 'Employee Handbook',
  render: () => `
    <p class="subhead" style="margin:0 0 10px">Liberty Infospace · v3.2 · updated 1 Apr 2026</p>
    ${settingsList([
      {icon:'i-book', title:'1. Code of Conduct', meta:'Workplace behavior, ethics', action:'noop'},
      {icon:'i-clock', title:'2. Attendance & Working Hours', meta:'9:30 – 6:30, flexible', action:'noop'},
      {icon:'i-cal-sub', title:'3. Leave Policy', meta:'15 PL · 12 SL · 12 CL', action:'noop'},
      {icon:'i-rupee', title:'4. Compensation & Payroll', meta:'Monthly · 1st · UPI', action:'noop'},
      {icon:'i-no-overtime', title:'5. Overtime Policy', meta:'Disabled by default', action:'noop'},
      {icon:'i-shield', title:'6. Data Protection', meta:'Confidentiality, IP, NDA', action:'noop'},
      {icon:'i-people', title:'7. Anti-Harassment', meta:'Zero tolerance, POSH', action:'noop'},
      {icon:'i-doc', title:'8. Exit & Notice', meta:'30/60 days based on level', action:'noop'},
    ])}
    <button class="btn-block" style="margin-top:14px" data-action="noop" data-toast="Downloading handbook.pdf">${I('i-download')}Download full PDF (1.8 MB)</button>
  `
};

/* ---- Task / Meet detail + creation ---- */
SCREENS['task-detail'] = {
  title: (ctx) => ctx.title || 'Task',
  render: (p, ctx) => `
    <h1 class="title-1" style="font-size:18px;margin-bottom:6px">${ctx.title || 'Stress Test Capacity Report'}</h1>
    <div style="display:flex;gap:6px;margin-bottom:14px">
      <span class="pill warn">Due today</span>
      <span class="task-tag" style="margin:0">#WORK</span>
    </div>
    <h2 class="title-2">Details</h2>
    <div class="glass" style="padding:0 12px">
      <div class="row-between" style="padding:10px 0;font-size:12px;border-bottom:1px solid var(--border)"><span class="muted">Assigned to</span><span>Sayantan Ghosh</span></div>
      <div class="row-between" style="padding:10px 0;font-size:12px;border-bottom:1px solid var(--border)"><span class="muted">Created by</span><span>Amulya Sir</span></div>
      <div class="row-between" style="padding:10px 0;font-size:12px;border-bottom:1px solid var(--border)"><span class="muted">Due</span><span style="color:var(--primary)">11:30 AM today</span></div>
      <div class="row-between" style="padding:10px 0;font-size:12px"><span class="muted">Priority</span><span>High</span></div>
    </div>
    <h2 class="title-2">Description</h2>
    <p style="font-size:12.5px;color:var(--muted);line-height:1.55;margin:0 0 14px">Run stress tests on the API capacity tier and document the failure modes. Share preliminary findings in #WORK chat before EOD.</p>
    <h2 class="title-2">Activity</h2>
    <div class="glass" style="padding:10px 12px;font-size:12px;color:var(--muted)">
      <div style="margin-bottom:8px"><b style="color:var(--fg)">Amulya Sir</b> created this task · 2 days ago</div>
      <div style="margin-bottom:8px"><b style="color:var(--fg)">Sayantan</b> set due date to today · yesterday</div>
      <div><b style="color:var(--fg)">Amulya Sir</b> commented "Focus on the 10k-rps tier first" · 4h ago</div>
    </div>
    <div class="cta-row">
      <button class="btn-block" data-action="noop" data-toast="Snoozed to tomorrow">Snooze</button>
      <button class="btn-block primary" data-action="submit-form" data-toast="Marked done">${I('i-check')}Mark Done</button>
    </div>
  `
};

SCREENS['meet-detail'] = {
  title: (ctx) => ctx.title || 'Meeting',
  render: (p, ctx) => `
    <h1 class="title-1" style="font-size:18px;margin-bottom:6px">${ctx.title || 'Liberty Kolkata Dev Team'}</h1>
    <p class="subhead" style="margin:0 0 14px">Today · 2:00 – 3:00 PM · Group call · 8 invitees</p>
    <button class="btn-block primary" data-action="noop" data-toast="Joining meeting…">${I('i-meet')}Join now</button>
    <h2 class="title-2">Attendees</h2>
    <div class="glass" style="padding:6px 12px">
      ${['Amulya Sir','Sankha Subhra','Rounik T','Sukanta','Soumyadeep','Priya S','Rahul M','You'].map((n,i) => `
        <div class="row-between" style="padding:8px 0;font-size:12px;${i<7?'border-bottom:1px solid var(--border)':''}">
          <span style="display:flex;align-items:center;gap:8px"><span class="list-avatar av${(i%5)+1}" style="width:24px;height:24px;font-size:9px">${n.split(' ').map(x=>x[0]).join('').slice(0,2)}</span>${n}</span>
          ${i<3 ? '<span style="color:var(--success);font-size:11px">Confirmed</span>' : i<6 ? '<span style="color:var(--muted-2);font-size:11px">Invited</span>' : '<span style="color:var(--primary);font-size:11px">You</span>'}
        </div>`).join('')}
    </div>
    <h2 class="title-2">Agenda</h2>
    <p style="font-size:12.5px;color:var(--muted);line-height:1.55;margin:0 0 14px">Sprint demo · stress test results · next-sprint planning</p>
    <div class="cta-row">
      <button class="btn-block" data-action="copy-link">${I('i-paperclip')}Copy link</button>
      <button class="btn-block" data-action="noop" data-toast="Reminder set">${I('i-bell-add')}Remind</button>
    </div>
  `
};

['task-new','meet-new','note-new','reminder-new'].forEach(key => {
  const labelMap = {'task-new':'New Task','meet-new':'New Meeting','note-new':'New Note','reminder-new':'New Reminder'};
  const toastMap = {'task-new':'Task created','meet-new':'Meeting scheduled','note-new':'Note saved','reminder-new':'Reminder set'};
  SCREENS[key] = {
    title: labelMap[key],
    render: () => formScreen(`
      <div class="field"><label>Title</label><input placeholder="Give it a name..."></div>
      ${key==='task-new'?`<div class="field-row"><div class="field"><label>Due date</label><input type="date"></div><div class="field"><label>Priority</label><select><option>Low</option><option>Medium</option><option selected>High</option></select></div></div>`:''}
      ${key==='meet-new'?`<div class="field-row"><div class="field"><label>Date</label><input type="date" value="2026-05-08"></div><div class="field"><label>Time</label><input type="time" value="14:00"></div></div><div class="field"><label>Invitees</label><input placeholder="Search people..." value="@amulya, @rounik"></div>`:''}
      ${key==='reminder-new'?`<div class="field"><label>Remind at</label><input type="datetime-local" value="2026-05-08T16:00"></div>`:''}
      ${key==='note-new'?`<div class="field"><label>Tag</label><input placeholder="#WORK"></div>`:''}
      <div class="field"><label>${key==='note-new'?'Body':'Description'}</label><textarea placeholder="${key==='note-new'?'Type your note...':'Add details (optional)'}"></textarea></div>
    `, 'Create', toastMap[key])
  };
});

/* ---- Chat thread + new ---- */
const SAMPLE_CHATS = {
  'ai':   {name:'EasyDo AI', avatar:'gradient-ai', initials:'AI', sub:'Always available'},
  'amulya':{name:'Amulya Sir', avatar:'av2', initials:'AS', sub:'last seen 5 min ago'},
  'liberty-kolkata':{name:'Liberty Kolkata Dev', avatar:'av4', initials:'LK', sub:'12 members'},
  'ui-testing':{name:'UI Testing', avatar:'av3', initials:'UT', sub:'5 members'},
  'ios-testing':{name:'iOS Testing Group', avatar:'av1', initials:'IT', sub:'18 members'},
  'bug-resolve':{name:'Bug Resolve 2025', avatar:'av5', initials:'BR', sub:'8 members'},
};

const SAMPLE_MSGS = {
  'amulya':[
    {dir:'in', text:'Hey, can you push the stress test report by EOD?', ts:'4:48 PM'},
    {dir:'out', text:'Yes, working on the 10k-rps tier right now.', ts:'4:50 PM'},
    {dir:'in', text:'🚩 Attendance — pls confirm your punch-in time', ts:'5:02 PM'},
    {dir:'in', text:'✓✓', ts:'5:06 PM'},
  ],
  'liberty-kolkata':[
    {dir:'in', text:'Standup at 2 PM today, everyone share blockers please', ts:'9:10 AM'},
    {dir:'in', text:'Stress Test Capacity Report needs review', ts:'11:25 AM'},
    {dir:'out', text:'I\'ll have a draft by 4', ts:'11:30 AM'},
    {dir:'in', text:'Perfect 👍', ts:'5:06 PM'},
  ],
  'ai':[
    {dir:'in', text:'Hi Sayantan! I noticed you usually punch in by 9:30. You\'re a few minutes late today — want me to remind your manager when you punch in?', ts:'9:35 AM'},
    {dir:'out', text:'No thanks, I\'ll handle it.', ts:'9:36 AM'},
    {dir:'in', text:'Got it. Btw, today\'s schedule has 3 items: Design Sync, Stress Test Report (due), and Liberty Kolkata Dev meeting at 2 PM.', ts:'9:36 AM'},
  ],
};

SCREENS['chat-thread'] = {
  title: (ctx) => SAMPLE_CHATS[ctx.id]?.name || 'Chat',
  render: (p, ctx) => {
    if (!ctx.msgs) ctx.msgs = (SAMPLE_MSGS[ctx.id] || [{dir:'in', text:'Hi! Start a conversation.', ts:'now'}]).slice();
    const chat = SAMPLE_CHATS[ctx.id] || {name:'Chat', sub:''};
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:4px 0 10px;border-bottom:1px solid var(--border);margin-bottom:8px">
        <div class="list-avatar ${chat.avatar||''}" style="width:36px;height:36px;font-size:11px">${chat.initials||''}</div>
        <div style="flex:1"><div style="font-size:13.5px;font-weight:600">${chat.name}</div><div style="font-size:11px;color:var(--muted)">${chat.sub||''}</div></div>
        <div class="hdr-back" data-action="noop" data-toast="Call started" style="margin:0">${I('i-meet')}</div>
      </div>
      <div class="thread">
        <div class="thread-day">Today</div>
        ${ctx.msgs.map(m => `<div class="thread-msg ${m.dir}"><div class="bubble">${m.text.replace(/</g,'&lt;')}</div><div class="ts">${m.ts}</div></div>`).join('')}
      </div>
      <div class="thread-input">
        <div data-action="noop" data-toast="Attach panel" style="width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:var(--muted);cursor:pointer">${I('i-paperclip')}</div>
        <input type="text" placeholder="Message..." onkeydown="if(event.key==='Enter'){sendMessage();}">
        <div class="send" data-action="send-msg">${I('i-send')}</div>
      </div>
    `;
  }
};

SCREENS['chat-new'] = {
  title: 'New Chat',
  render: () => {
    const contacts = [
      {id:'amulya', name:'Amulya Sir', sub:'Liberty Infospace · Head Office', avatar:'av2', initials:'AS'},
      {id:'sukanta', name:'Sukanta', sub:'Designer · Head Office', avatar:'av3', initials:'SK'},
      {id:'rounik', name:'Rounik Tarafder', sub:'Developer · Head Office', avatar:'av1', initials:'RT'},
      {id:'priya', name:'Priya Sharma', sub:'Sales Exec · Kolkata', avatar:'av4', initials:'PS'},
      {id:'rahul', name:'Rahul Mehta', sub:'Designer · Head Office', avatar:'av5', initials:'RM'},
      {id:'soumyadeep', name:'Soumyadeep', sub:'Developer · Mumbai', avatar:'av2', initials:'SD'},
    ];
    return `
      <div class="search" style="margin-bottom:10px">${I('i-search')}Search contacts</div>
      ${contacts.map(c => `
        <div class="list-row" data-nav="chat-thread" data-ctx-id="${c.id}">
          <div class="list-avatar ${c.avatar}">${c.initials}</div>
          <div class="list-body"><div class="list-title">${c.name}</div><div class="list-meta">${c.sub}</div></div>
        </div>`).join('')}
    `;
  }
};
SCREENS['chat-new-group'] = SCREENS['chat-new'];
SCREENS['chat-new-channel'] = {
  title: 'New Channel',
  render: () => formScreen(`
    <div class="field"><label>Channel name</label><input placeholder="e.g. announcements"></div>
    <div class="field"><label>Description</label><textarea placeholder="What is this channel for?"></textarea></div>
    <div class="field"><label>Audience</label><select><option>All Branches</option><option>Head Office only</option><option>Kolkata only</option><option>Custom</option></select></div>
  `, 'Create Channel', 'Channel created')
};

/* ---- Punch detail screens ---- */
SCREENS['punch-day'] = {
  title: (ctx) => ctx.day || 'Day Detail',
  render: (p, ctx) => `
    <p class="subhead" style="margin:0 0 10px">${ctx.day || 'Mon, 5 May 2026'} · ${ctx.summary || 'Present · 09:25 → 18:42'}</p>
    <h2 class="title-2">Timeline</h2>
    <div class="glass timeline" style="padding:6px 12px">
      <div class="timeline-row"><div class="tl-time">09:25</div><div class="tl-body"><div class="tl-title">Punched In</div><div class="tl-meta">Head Office, Hazra Centre</div></div></div>
      <div class="timeline-row"><div class="tl-time">11:30</div><div class="tl-body"><div class="tl-title">Stress Test Report — started</div><div class="tl-meta">Task</div></div></div>
      <div class="timeline-row"><div class="tl-time">13:00</div><div class="tl-body"><div class="tl-title">Lunch break</div><div class="tl-meta">45 min</div></div></div>
      <div class="timeline-row"><div class="tl-time">14:00</div><div class="tl-body"><div class="tl-title">Liberty Kolkata Dev</div><div class="tl-meta">Meeting · 1h</div></div></div>
      <div class="timeline-row"><div class="tl-time">16:42</div><div class="tl-body"><div class="tl-title">Stress Test Report — marked done</div><div class="tl-meta">Task</div></div></div>
      <div class="timeline-row"><div class="tl-time">18:42</div><div class="tl-body"><div class="tl-title">Punched Out</div><div class="tl-meta">Head Office · 9h 17m total</div></div></div>
    </div>
  `
};

SCREENS['punch-location'] = {
  title: 'Location Timeline',
  render: () => `
    <div class="glass loc-preview" style="margin-bottom:14px">
      <div class="loc-map">
        <span class="loc-tag">📍 Head Office, Hazra Centre</span>
        <span class="loc-walker">🚶</span>
      </div>
      <div class="loc-rows">
        <div class="loc-row">• Punched in at Head Office, 09:30 AM</div>
        <div class="loc-row muted">• Geofence verified · 200m radius</div>
      </div>
    </div>
    <h2 class="title-2">Pings today</h2>
    <div class="glass timeline" style="padding:6px 12px">
      <div class="timeline-row"><div class="tl-time">09:30</div><div class="tl-body"><div class="tl-title">Punched In</div><div class="tl-meta">Head Office · verified</div></div></div>
      <div class="timeline-row"><div class="tl-time">12:42</div><div class="tl-body"><div class="tl-title">Location ping</div><div class="tl-meta">Head Office (still in geofence)</div></div></div>
      <div class="timeline-row"><div class="tl-time">15:15</div><div class="tl-body"><div class="tl-title">Location ping</div><div class="tl-meta">Head Office</div></div></div>
    </div>
  `
};

/* ---- Manage Office sub-screens ---- */
SCREENS['approvals'] = {
  title: 'Approvals',
  render: () => `
    <div style="display:flex;gap:6px;margin-bottom:10px">
      <span class="chip active">All (4)</span><span class="chip">Leaves (2)</span><span class="chip">OT (1)</span><span class="chip">Advance (1)</span>
    </div>
    ${[
      {n:'Priya Sharma', av:'av3', meta:'Sales Exec · Kolkata · 15-17 May', type:'Casual Leave Request'},
      {n:'Rahul Mehta', av:'av4', meta:'Designer · 4 hours', type:'Overtime Request'},
      {n:'Soumyadeep', av:'av2', meta:'Developer · ₹8,000', type:'Salary Advance'},
      {n:'Rounik T', av:'av1', meta:'Developer · 9 May', type:'Sick Leave Request'},
    ].map(r => `
      <div class="glass approval">
        <div class="approval-row">
          <div class="list-avatar ${r.av}" style="width:28px;height:28px;font-size:9px">${r.n.split(' ').map(x=>x[0]).join('').slice(0,2)}</div>
          <div style="flex:1"><div class="approval-name">${r.n}</div><div class="approval-meta">${r.meta}</div></div>
        </div>
        <div class="approval-type">${r.type}</div>
        <div class="approval-actions"><div class="btn danger" data-action="reject">Reject</div><div class="btn primary" data-action="approve">Approve</div></div>
      </div>`).join('')}
  `
};

SCREENS['mgmt-review'] = {
  title: 'Management Review',
  render: () => `
    <p class="subhead" style="margin:0 0 10px">15 items needing your attention</p>
    ${settingsList([
      {icon:'i-trend', title:'Attrition spike · Kolkata', meta:'3 exits this month vs avg 1', action:'noop'},
      {icon:'i-rupee', title:'Payroll variance · +6.2%', meta:'May vs Apr', action:'noop'},
      {icon:'i-clock', title:'Late punches · 4 employees', meta:'This week', action:'noop'},
      {icon:'i-cal-sub', title:'Leave clusters · 22-24 May', meta:'5 employees applied', action:'noop'},
      {icon:'i-shield', title:'BG pending · 2 new joiners', meta:'>5 days', action:'noop'},
    ])}
  `
};

SCREENS['register'] = {
  title: 'Register',
  render: () => {
    const emps = [
      {n:'Amulya Sir', av:'av2', meta:'CEO · Head Office'},
      {n:'Sayantan Ghosh', av:'av1', meta:'L1 · Head Office'},
      {n:'Sukanta', av:'av3', meta:'Designer · Head Office'},
      {n:'Rounik Tarafder', av:'av4', meta:'Developer · Head Office'},
      {n:'Sankha Subhra Moitra', av:'av5', meta:'Developer · Head Office'},
      {n:'Priya Sharma', av:'av3', meta:'Sales Exec · Kolkata'},
      {n:'Rahul Mehta', av:'av2', meta:'Designer · Head Office'},
      {n:'Soumyadeep', av:'av1', meta:'Developer · Mumbai'},
    ];
    return `
      <div class="search" style="margin-bottom:10px">${I('i-search')}Search employees</div>
      <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
        <span class="chip active">All (18)</span><span class="chip">Head Office (12)</span><span class="chip">Kolkata (3)</span><span class="chip">Mumbai (3)</span>
      </div>
      ${emps.map(e => `
        <div class="list-row" data-action="noop" data-toast="Employee profile">
          <div class="list-avatar ${e.av}">${e.n.split(' ').map(x=>x[0]).join('').slice(0,2)}</div>
          <div class="list-body"><div class="list-title">${e.n}</div><div class="list-meta">${e.meta}</div></div>
          ${I('i-chev-r')}
        </div>`).join('')}
    `;
  }
};

SCREENS['bg-verification'] = {
  title: 'BG Verification',
  render: () => `
    <div class="att-grid" style="margin-bottom:14px">
      <div class="att-tile"><div class="num" style="color:var(--success)">15</div><div class="lbl">Verified</div></div>
      <div class="att-tile"><div class="num" style="color:var(--primary)">2</div><div class="lbl">In progress</div></div>
      <div class="att-tile"><div class="num" style="color:var(--destructive)">1</div><div class="lbl">Failed</div></div>
      <div class="att-tile"><div class="num">0</div><div class="lbl">Pending</div></div>
    </div>
    <h2 class="title-2">Active checks</h2>
    ${settingsList([
      {icon:'i-shield', title:'Soumyadeep · Developer', meta:'Address + Education · 3 days', action:'noop', trail:`<span class="pill warn">In progress</span>`},
      {icon:'i-shield', title:'Rahul Mehta · Designer', meta:'Criminal + Employment · 1 day', action:'noop', trail:`<span class="pill warn">In progress</span>`},
      {icon:'i-shield', title:'Anonymous · Withdrew', meta:'Did not consent', action:'noop', trail:`<span class="pill" style="background:rgba(229,82,79,0.15);color:#fca5a5">Failed</span>`},
    ])}
  `
};

SCREENS['announce'] = {
  title: 'Announcements',
  render: () => `
    <button class="btn-block primary" data-action="noop" data-toast="Compose screen">${I('i-pen')}Compose announcement</button>
    <h2 class="title-2">Recent</h2>
    ${settingsList([
      {icon:'i-megaphone', title:'Test announcement', meta:'All Branches · 7 May · 194 reads', action:'noop'},
      {icon:'i-megaphone', title:'Quarterly results celebration', meta:'All Branches · 28 Apr · 192 reads', action:'noop'},
      {icon:'i-megaphone', title:'Office closed for Holi', meta:'All Branches · 14 Mar · 188 reads', action:'noop'},
    ])}
  `
};

SCREENS['leaves-mgmt'] = {
  title: 'Leaves Management',
  render: () => `
    <div class="att-grid" style="margin-bottom:14px">
      <div class="att-tile"><div class="num" style="color:var(--primary)">5</div><div class="lbl">Pending</div></div>
      <div class="att-tile"><div class="num" style="color:var(--success)">42</div><div class="lbl">Approved</div></div>
      <div class="att-tile"><div class="num">3</div><div class="lbl">On leave today</div></div>
      <div class="att-tile"><div class="num">22-24 May</div><div class="lbl">Hot cluster</div></div>
    </div>
    <h2 class="title-2">Pending review</h2>
    ${settingsList([
      {icon:'i-cal-sub', title:'Priya · Casual · 15-17 May', meta:'3 days · Kolkata', nav:'approvals'},
      {icon:'i-cal-sub', title:'Rounik · Sick · 9 May', meta:'1 day · Head Office', nav:'approvals'},
    ])}
  `
};

SCREENS['reports'] = {
  title: 'Reports',
  render: () => settingsList([
    {icon:'i-trend', title:'Attendance Report', meta:'May 2026 · 96% avg', action:'noop'},
    {icon:'i-rupee', title:'Payroll Report', meta:'May 2026 · ₹19.4L', action:'noop'},
    {icon:'i-cal-sub', title:'Leave Utilization', meta:'34% of yearly quota used', action:'noop'},
    {icon:'i-clock', title:'Overtime Report', meta:'12 hours total', action:'noop'},
    {icon:'i-people', title:'Headcount Report', meta:'23 staff · +2 vs Apr', action:'noop'},
    {icon:'i-chart', title:'Attrition Report', meta:'8.7% trailing-12-mo', action:'noop'},
    {icon:'i-shield', title:'Compliance Report', meta:'PF · ESI · TDS · all current', action:'noop'},
  ])
};

SCREENS['web-admin'] = {
  title: 'Web Admin',
  render: () => `
    ${empty('i-monitor', 'Use the web console', 'Web Admin gives you a full-screen experience for bulk operations: imports, exports, payroll runs, and audit logs.')}
    <button class="btn-block primary" style="margin:20px auto 0;max-width:240px" data-action="copy-link" data-toast="Web Admin link copied">${I('i-paperclip')}Copy admin URL</button>
  `
};

SCREENS['branches-list'] = {
  title: 'Branches',
  render: (p) => {
    const isCEO = p === 'E';
    if (!isCEO) return empty('i-bldg', 'No other branches', 'You only have access to Head Office.');
    return settingsList([
      {icon:'i-bldg', title:'Head Office · Kolkata', meta:'12 staff · HQ', action:'noop'},
      {icon:'i-bldg', title:'Mumbai · Andheri East', meta:'3 staff · since 2022', action:'noop'},
      {icon:'i-bldg', title:'Kolkata · Salt Lake', meta:'8 staff · since 2020', action:'noop'},
      {icon:'i-plus', title:'Add a new branch', meta:'Free on Growth plan', action:'noop', toast:'New branch wizard'},
    ]);
  }
};

SCREENS['holidays'] = {
  title: 'Upcoming Holidays',
  render: () => `
    ${[
      {d:'15',m:'May',name:'Buddha Purnima',day:'Wednesday'},
      {d:'26',m:'May',name:'Memorial Day',day:'Sunday'},
      {d:'15',m:'Aug',name:'Independence Day',day:'Friday'},
      {d:'02',m:'Oct',name:'Gandhi Jayanti',day:'Friday'},
      {d:'31',m:'Oct',name:'Diwali',day:'Saturday'},
      {d:'25',m:'Dec',name:'Christmas',day:'Friday'},
    ].map(h => `
      <div class="glass" style="padding:0 12px;margin-bottom:6px"><div class="holiday-row">
        <div class="date-pill"><div class="d">${h.d}</div><div class="m">${h.m}</div></div>
        <div class="list-body"><div class="h-name">${h.name}</div><div class="h-day">${h.day}</div></div>
      </div></div>`).join('')}
  `
};

SCREENS['location'] = SCREENS['punch-location'];
SCREENS['attendance'] = SCREENS['me-attendance'];

/* ---- Register existing officeScreen ---- */
SCREENS['office'] = { title:(_, p)=>p==='E'?'All Branches Office':'Office', render: officeScreen };

function renderAll() {
  renderHeader();
  renderTabs();
  renderBody();
  renderPersonaSwitcher();
  renderInfo();
  renderFabMenu();
}

renderAll();
