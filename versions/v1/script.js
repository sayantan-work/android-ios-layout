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
  <div class="section-head"><h2 class="title-2">Announcements</h2><span class="view-all">View All ›</span></div>
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
  <div class="section-head"><h2 class="title-2">Upcoming Holidays</h2><span class="view-all">View All ›</span></div>
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
    <div class="section-head"><h2 class="title-2">Today's Schedule</h2><span class="view-all">View All ›</span></div>
    ${items.map(it => `
      <div class="sched-row">
        <div class="sched-time">${it.time}</div>
        <div class="glass sched-card ${it.glow}">
          <div class="sched-icon" style="color:${it.color}">${I(it.icon)}</div>
          <div class="sched-body"><div class="sched-title">${it.title}</div><div class="sched-meta">${it.meta}</div></div>
        </div>
      </div>`).join('')}`;
};

const punchHero = () => `
  <div style="text-align:center;font-size:11px;color:var(--muted);margin:8px 0 4px;letter-spacing:0.02em">
    <b style="color:var(--fg);font-size:13px;font-feature-settings:'tnum';letter-spacing:-0.01em">05:06 PM</b> &nbsp;·&nbsp; Thursday, 7 May &nbsp;·&nbsp; IST
  </div>
  <div class="punch-hero">
    <div class="punch-orb">${I('i-punch')}</div>
    <div class="punch-label">Punch Out</div>
    <div class="punch-sub">Tap &amp; hold to confirm</div>
  </div>
  <div class="elapsed" style="max-width:230px;margin:12px auto 8px">
    <div class="elapsed-track"><div class="elapsed-fill" style="width:84%"></div></div>
    <div class="elapsed-labels"><span>9h goal</span><span><b>7h 36m</b></span></div>
  </div>
  <div class="punch-chips" style="max-width:280px;margin:10px auto 4px">
    <div class="punch-chip"><div class="pc-row" style="color:var(--success)">${I('i-arrow-ul')}In</div><div class="pc-val">09:30 AM</div></div>
    <div class="punch-chip"><div class="pc-row">${I('i-arrow-dr')}Out</div><div class="pc-val empty">--:--</div></div>
    <div class="punch-chip"><div class="pc-row" style="color:var(--primary)">${I('i-clock')}Total</div><div class="pc-val">07:36</div></div>
  </div>`;

/* Google Pay style icon tray for Home shortcuts */
const iconTray = (items) => `
  <div class="icon-tray">
    ${items.map(it => `
      <div class="icon-tray-item">
        <div class="ti-circle tint-${it.tint}">${I(it.icon)}</div>
        <div class="ti-label">${it.label}</div>
        ${it.badge ? `<div class="ti-badge">${it.badge}</div>` : ''}
      </div>
    `).join('')}
  </div>`;

/* Persona-specific shortcut tray items */
const trayItems = {
  A: [
    {icon:'i-tasks',     label:'New Task',   tint:'yellow'},
    {icon:'i-meet',      label:'New Meet',   tint:'teal'},
    {icon:'i-note',      label:'New Note',   tint:'purple'},
    {icon:'i-bell-add',  label:'Reminder',   tint:'peach'},
    {icon:'i-cloud',     label:'My Drive',   tint:'info'},
    {icon:'i-cal-sub',   label:'Calendar',   tint:'rose'},
    {icon:'i-search',    label:'Find',       tint:'bronze'},
    {icon:'i-star',      label:'Upgrade',    tint:'yellow'},
  ],
  B: [
    {icon:'i-cal-sub',   label:'Apply Leave',tint:'peach'},
    {icon:'i-clock',     label:'Apply OT',   tint:'teal'},
    {icon:'i-rupee',     label:'Advance',    tint:'yellow'},
    {icon:'i-card',      label:'Reimburse',  tint:'info'},
    {icon:'i-doc',       label:'Payslip',    tint:'green'},
    {icon:'i-trend',     label:'Attendance', tint:'bronze'},
    {icon:'i-gift',      label:'Holidays',   tint:'rose'},
    {icon:'i-book',      label:'Handbook',   tint:'purple'},
  ],
  D: [
    {icon:'i-check-seal',label:'Approvals',  tint:'yellow', badge:'4'},
    {icon:'i-star',      label:'Mgmt Review',tint:'rose',   badge:'15'},
    {icon:'i-people',    label:'Register',   tint:'info'},
    {icon:'i-megaphone', label:'Announce',   tint:'peach'},
    {icon:'i-cal-sub',   label:'Apply Leave',tint:'teal'},
    {icon:'i-doc',       label:'Documents',  tint:'purple'},
    {icon:'i-chart',     label:'Reports',    tint:'bronze'},
    {icon:'i-pin',       label:'Location',   tint:'green'},
  ],
  E: [
    {icon:'i-check-seal',label:'Approvals',  tint:'yellow', badge:'4'},
    {icon:'i-star',      label:'Mgmt Review',tint:'rose',   badge:'15'},
    {icon:'i-people',    label:'Register',   tint:'info'},
    {icon:'i-bldg',      label:'Branches',   tint:'teal'},
    {icon:'i-megaphone', label:'Announce',   tint:'peach'},
    {icon:'i-chart',     label:'Reports',    tint:'bronze'},
    {icon:'i-monitor',   label:'Web Admin',  tint:'purple'},
    {icon:'i-pin',       label:'Location',   tint:'green'},
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
    Punched in · <b>7h 36m</b> worked · 9h goal
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
const punchScreen = () => `
  <h1 class="title-1">Today</h1>
  <p class="subhead">Thursday, 7 May 2026 · IST</p>
  ${punchHero()}
  <div class="glass status-list" style="padding:4px 12px;margin-top:8px">
    <div class="list-row"><div class="list-icon success">${I('i-check-seal')}</div>
      <div class="list-body"><div class="list-title">Present today</div></div></div>
    <div class="list-row"><div class="list-icon info">${I('i-pin')}</div>
      <div class="list-body"><div class="list-title">Verified location</div></div></div>
    <div class="list-row"><div class="list-icon warn">${I('i-clock')}</div>
      <div class="list-body"><div class="list-title">Flexible hours</div><div class="list-meta">9h target</div></div></div>
    <div class="list-row"><div class="list-icon danger">${I('i-no-overtime')}</div>
      <div class="list-body"><div class="list-title">Overtime not allowed</div></div></div>
  </div>

  <div class="section-head"><h2 class="title-2">📍 Today's Location Timeline</h2><span class="view-all">View Full ›</span></div>
  <div class="glass loc-preview">
    <div class="loc-map">
      <span class="loc-tag">📍 Head Office, Hazra Centre</span>
      <span class="loc-walker">🚶</span>
    </div>
    <div class="loc-rows">
      <div class="loc-row">• Punched in at Head Office, 09:30 AM</div>
      <div class="loc-row muted">• 2 location pings since</div>
    </div>
  </div>

  <div class="section-head"><h2 class="title-2">This Week</h2><span class="view-all">View All ›</span></div>
  <div class="glass" style="padding:8px 12px">
    <div class="row-between" style="padding:6px 0;font-size:12px;border-bottom:1px solid var(--border)">
      <span>Mon, 5 May</span><span><b style="color:var(--success)">Present</b> · 09:25 → 18:42</span>
    </div>
    <div class="row-between" style="padding:6px 0;font-size:12px;border-bottom:1px solid var(--border)">
      <span>Tue, 6 May</span><span><b style="color:var(--success)">Present</b> · 09:18 → 19:01</span>
    </div>
    <div class="row-between" style="padding:6px 0;font-size:12px;border-bottom:1px solid var(--border)">
      <span>Wed, 7 May</span><span><b style="color:var(--success)">Present</b> · 09:30 → 18:50</span>
    </div>
    <div class="row-between" style="padding:6px 0;font-size:12px">
      <span>Today</span><span><b style="color:var(--primary)">Active</b> · 09:30 → ongoing</span>
    </div>
  </div>
`;

/* ─── WORKSPACE — universal ─── */
const workspace = () => `
  <div class="row-between"><h1 class="title-1">Workspace</h1><span class="muted" style="font-size:12px">Tasks · Meets · Notes</span></div>

  <div class="ws-cta">
    <div class="ws-cta-icon">${I('i-video-plus')}</div>
    <div class="ws-cta-text">
      <div class="mc-title">Start an Instant Meeting</div>
      <div class="mc-sub">Get a link in 2 seconds</div>
    </div>
  </div>

  <div class="search">${I('i-search')}Search workspace</div>
  <div class="chip-row">
    <span class="chip active">All</span>
    <span class="chip">Tasks (12)</span>
    <span class="chip">Meets (6)</span>
    <span class="chip">Reminders (5)</span>
    <span class="chip">Notes</span>
  </div>

  <h2 class="title-2">Today</h2>
  <div class="glass" style="padding:0 12px">
    <div class="ws-item">
      <div class="ws-time"><span class="h">11:30</span>AM</div>
      <div class="ws-icon task">${I('i-tasks')}</div>
      <div class="ws-info"><div class="ws-title">Stress Test Capacity Report</div><div class="ws-meta">Task · Due today <span class="task-tag">#WORK</span></div></div>
      <div class="ws-check"></div>
    </div>
    <div class="ws-item">
      <div class="ws-time"><span class="h">2:00</span>PM</div>
      <div class="ws-icon meet">${I('i-meet')}</div>
      <div class="ws-info"><div class="ws-title">Liberty Kolkata Dev Team</div><div class="ws-meta">Meeting · Group · 1h</div></div>
      <div class="ws-action">Join</div>
    </div>
    <div class="ws-item">
      <div class="ws-time"><span class="h">4:00</span>PM</div>
      <div class="ws-icon meet">${I('i-meet')}</div>
      <div class="ws-info"><div class="ws-title">1:1 with Soumyadeep</div><div class="ws-meta">Meeting · 30 min</div></div>
      <div class="ws-action">Join</div>
    </div>
    <div class="ws-item">
      <div class="ws-time"><span class="h">4:00</span>PM</div>
      <div class="ws-icon reminder">${I('i-bell-add')}</div>
      <div class="ws-info"><div class="ws-title">Submit weekly report</div><div class="ws-meta">Reminder</div></div>
      <div class="ws-check"></div>
    </div>
  </div>

  <h2 class="title-2">Tomorrow</h2>
  <div class="glass" style="padding:0 12px">
    <div class="ws-item">
      <div class="ws-time"><span class="h">10:00</span>AM</div>
      <div class="ws-icon meet">${I('i-meet')}</div>
      <div class="ws-info"><div class="ws-title">Sprint Planning</div><div class="ws-meta">Meeting · 8 invitees · 1h</div></div>
      <div class="ws-action">Join</div>
    </div>
    <div class="ws-item">
      <div class="ws-time"><span class="h">EOD</span></div>
      <div class="ws-icon task">${I('i-tasks')}</div>
      <div class="ws-info"><div class="ws-title">Update onboarding doc</div><div class="ws-meta">Task · Tomorrow</div></div>
      <div class="ws-check"></div>
    </div>
  </div>

  <h2 class="title-2">Awaiting Review</h2>
  <div class="glass" style="padding:0 12px">
    <div class="ws-item">
      <div class="ws-icon task" style="grid-column:1/3;width:30px;height:30px">${I('i-check-seal')}</div>
      <div class="ws-info"><div class="ws-title">Tasks Done — Awaiting Review (1)</div><div class="ws-meta">Delegated · The creator must review</div></div>
      <div class="ws-action">Review</div>
    </div>
  </div>

  <div class="fab" data-action="add-ws">${I('i-plus')}</div>
`;

/* ─── CHAT — universal ─── */
const chat = () => `
  <h1 class="title-1">Chat</h1>
  <div class="search">${I('i-search')}Search conversations</div>
  <div class="chip-row">
    <span class="chip active">All</span>
    <span class="chip">Unread</span>
    <span class="chip">Groups</span>
    <span class="chip">Labels</span>
    <span class="chip">Archived</span>
  </div>
  <div class="stats-row">
    <div class="stat-tile g-yellow"><div class="num">12</div><div class="lbl">My Tasks</div></div>
    <div class="stat-tile g-peach"><div class="num">1</div><div class="lbl">Delegated</div></div>
    <div class="stat-tile g-teal"><div class="num">6</div><div class="lbl">Meets</div></div>
    <div class="stat-tile g-bronze"><div class="num">0</div><div class="lbl">Notes</div></div>
  </div>
  <div class="list-row"><div class="list-avatar gradient-ai">AI</div><div class="list-body"><div class="list-title">EasyDo AI</div><div class="list-meta">Punch In...</div></div><div class="list-trail"><span class="list-time">5:06 PM</span></div></div>
  <div class="list-row"><div class="list-avatar av2">AS</div><div class="list-body"><div class="list-title">Amulya Sir</div><div class="list-meta">✓✓ 🚩 Attendance</div></div><div class="list-trail"><span class="list-time">5:06 PM</span></div></div>
  <div class="list-row"><div class="list-avatar av4">LK</div><div class="list-body"><div class="list-title">Liberty Kolkata Dev <span class="task-tag">#WORK</span></div><div class="list-meta">Stress Test Capacity Report</div></div><div class="list-trail"><span class="list-time">5:06 PM</span><span class="unread">2</span></div></div>
  <div class="list-row"><div class="list-avatar av3">UT</div><div class="list-body"><div class="list-title">UI Testing</div><div class="list-meta">Sukanta: 🤝 Meet</div></div><div class="list-trail"><span class="list-time">4:34 PM</span><span class="unread">52</span></div></div>
  <div class="list-row"><div class="list-avatar av1">IT</div><div class="list-body"><div class="list-title">iOS Testing Group</div><div class="list-meta">Sankha Subhra has left</div></div><div class="list-trail"><span class="list-time">Yesterday</span><span class="unread">28</span></div></div>
  <div class="list-row"><div class="list-avatar av5">BR</div><div class="list-body"><div class="list-title">Bug Resolve 2025</div><div class="list-meta">Sankha Subhra has left</div></div><div class="list-trail"><span class="list-time">Yesterday</span></div></div>
  <div class="fab">${I('i-pen')}</div>
`;

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
          ${cfg.verified ? '<span class="pill success">Verified</span>' : ''}
          ${cfg.completion ? `<span class="pill warn">Profile ${cfg.completion}%</span>` : ''}
          ${cfg.manager ? '<span class="pill info">Manager</span>' : ''}
          ${cfg.ceo ? '<span class="pill info">CEO</span>' : ''}
        </div>
      </div>
    </div>

    ${!isProd ? `
      <div class="glass pay-card">
        <div class="pay-row1"><span>This month · May 2026</span><span style="color:var(--success)">Credited 1st</span></div>
        <div class="pay-amt"><small>₹</small>${payAmount}</div>
        <div class="pay-sub">Net Pay</div>
        <div style="display:flex;gap:6px;margin-top:8px;font-size:10px">
          <span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:2px;background:var(--success);display:inline-block"></span>Earnings ${cfg.ceo?'₹5,12,000':(cfg.manager?'₹95,500':'₹7,452')}</span>
          <span style="display:flex;align-items:center;gap:4px;color:var(--muted)"><span style="width:8px;height:8px;border-radius:2px;background:var(--destructive);display:inline-block"></span>Deductions ${cfg.ceo?'₹30,000':(cfg.manager?'₹3,000':'₹150')}</span>
        </div>
        <div class="pay-cta"><span style="color:var(--muted);font-size:11px">Next payslip in 24 days</span><span>View payslip ${I('i-chev-r')}</span></div>
      </div>

      <h2 class="title-2">Activity</h2>
      <div class="att-grid" style="margin-bottom:14px">
        <div class="att-tile"><div class="num" style="color:var(--primary)">2</div><div class="lbl">Pending</div></div>
        <div class="att-tile"><div class="num" style="color:var(--success)">12</div><div class="lbl">Approved</div></div>
        <div class="att-tile"><div class="num">12</div><div class="lbl">Leaves Left</div></div>
        <div class="att-tile"><div class="num" style="color:var(--success)">86%</div><div class="lbl">Attendance</div></div>
      </div>

      <h2 class="title-2">My Records</h2>
      <div class="settings-row"><div class="list-icon warn">${I('i-card')}</div>
        <div class="settings-body"><div class="settings-title">My Requests</div><div class="settings-meta">12 approved · <span style="color:#facc15">2 pending</span></div></div>${I('i-chev-r')}</div>
      <div class="settings-row"><div class="list-icon success">${I('i-rupee')}</div>
        <div class="settings-body"><div class="settings-title">My Salary Slips</div><div class="settings-meta">5 months · tap to download PDF</div></div>${I('i-chev-r')}</div>
      <div class="settings-row"><div class="list-icon info">${I('i-cal-sub')}</div>
        <div class="settings-body"><div class="settings-title">My Leaves</div><div class="settings-meta">3 used · 12 remaining this year</div></div>${I('i-chev-r')}</div>
      <div class="settings-row"><div class="list-icon">${I('i-trend')}</div>
        <div class="settings-body"><div class="settings-title">My Attendance</div><div class="settings-meta">May · 6 of 7 working days</div></div>${I('i-chev-r')}</div>
      <div class="settings-row"><div class="list-icon">${I('i-doc')}</div>
        <div class="settings-body"><div class="settings-title">Documents</div><div class="settings-meta">Payslips, ID proofs, agreements</div></div>${I('i-chev-r')}</div>
      <div class="settings-row"><div class="list-icon">${I('i-book')}</div>
        <div class="settings-body"><div class="settings-title">Employee Handbook</div><div class="settings-meta">Policies &amp; guidelines</div></div>${I('i-chev-r')}</div>
    ` : `
      <h2 class="title-2">My Productivity</h2>
      <div class="settings-row"><div class="list-icon">${I('i-note')}</div><div class="settings-body"><div class="settings-title">Notes</div><div class="settings-meta">23 notes</div></div>${I('i-chev-r')}</div>
      <div class="settings-row"><div class="list-icon">${I('i-cloud')}</div><div class="settings-body"><div class="settings-title">My Drive</div><div class="settings-meta">2.4 GB used</div></div>${I('i-chev-r')}</div>
      <div class="settings-row"><div class="list-icon">${I('i-bell-add')}</div><div class="settings-body"><div class="settings-title">Reminders</div><div class="settings-meta">5 active</div></div>${I('i-chev-r')}</div>
      <div class="settings-row"><div class="list-icon">${I('i-cal-sub')}</div><div class="settings-body"><div class="settings-title">Calendar Sync</div><div class="settings-meta">Apple Calendar · Connected</div></div>${I('i-chev-r')}</div>
    `}

    ${isManager ? `
      <h2 class="title-2">${cfg.ceo ? 'CEO Tools' : 'Manager Tools'}</h2>
      <div class="settings-row"><div class="list-icon">${I('i-people')}</div><div class="settings-body"><div class="settings-title">Team Management</div><div class="settings-meta">${cfg.ceo ? 'All branches' : '8 direct reports'}</div></div>${I('i-chev-r')}</div>
      <div class="settings-row"><div class="list-icon">${I('i-bldg')}</div><div class="settings-body"><div class="settings-title">Branch Settings</div><div class="settings-meta">${cfg.ceo ? 'All 3 branches' : 'Hours, holidays, policies'}</div></div>${I('i-chev-r')}</div>
      ${cfg.ceo ? `<div class="settings-row"><div class="list-icon">${I('i-monitor')}</div><div class="settings-body"><div class="settings-title">Company Settings</div><div class="settings-meta">Policies, billing, integrations</div></div>${I('i-chev-r')}</div>` : ''}
    ` : ''}

    <h2 class="title-2">Account</h2>
    ${cfg.hrms ? `<div class="settings-row"><div class="list-icon">${I('i-bldg')}</div><div class="settings-body"><div class="settings-title">Switch Company</div><div class="settings-meta">Liberty Infospace · 1 of 2</div></div>${I('i-chev-r')}</div>` : ''}
    <div class="settings-row"><div class="list-icon">${I('i-gear')}</div><div class="settings-body"><div class="settings-title">Settings</div><div class="settings-meta">Theme, notifications, privacy</div></div>${I('i-chev-r')}</div>
    ${isProd ? `<div class="settings-row" style="border-color:rgba(229,206,43,0.25);background:rgba(229,206,43,0.06)"><div class="list-icon warn">${I('i-star')}</div><div class="settings-body"><div class="settings-title">Upgrade to HRMS</div><div class="settings-meta">Get attendance, payroll, leave</div></div>${I('i-chev-r')}</div>` : ''}

    <div class="signout">${I('i-arrow-out')}Sign Out</div>
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
    <p class="subhead">${scope} · ${totalStaff} staff total</p>
    ${branchPulse(scope.toLowerCase(), present, totalStaff, absent, 1)}

    <h2 class="title-2">Today's Attendance</h2>
    <div class="att-grid">
      <div class="att-tile"><div class="num" style="color:var(--success)">${present}</div><div class="lbl">Present</div></div>
      <div class="att-tile"><div class="num" style="color:var(--destructive)">${absent}</div><div class="lbl">Absent</div></div>
      <div class="att-tile"><div class="num">0</div><div class="lbl">Late</div></div>
      <div class="att-tile"><div class="num">1</div><div class="lbl">Half Day</div></div>
      <div class="att-tile"><div class="num">0</div><div class="lbl">Week Off</div></div>
      <div class="att-tile"><div class="num">1</div><div class="lbl">Leaves</div></div>
      <div class="att-tile"><div class="num">0</div><div class="lbl">Holiday</div></div>
      <div class="att-tile"><div class="num" style="color:var(--destructive)">${isCEO ? 5 : 3}</div><div class="lbl">Red Flags</div></div>
    </div>

    <h2 class="title-2">Quick Actions</h2>
    <div class="action-grid">
      <div class="action-tile"><span class="badge">4</span>${I('i-check-seal')}<div class="at-label">Approvals</div></div>
      <div class="action-tile"><span class="badge">15</span>${I('i-star')}<div class="at-label">Mgmt Review</div></div>
      <div class="action-tile">${I('i-people')}<div class="at-label">Register</div></div>
      <div class="action-tile">${I('i-shield')}<div class="at-label">BG Verification</div></div>
      ${isCEO ? `<div class="action-tile">${I('i-bldg')}<div class="at-label">Branches</div></div>` : ''}
      <div class="action-tile">${I('i-megaphone')}<div class="at-label">Announcements</div></div>
      <div class="action-tile">${I('i-doc')}<div class="at-label">Documents</div></div>
      <div class="action-tile">${I('i-cal-sub')}<div class="at-label">Leaves</div></div>
      <div class="action-tile">${I('i-gift')}<div class="at-label">Holidays</div></div>
      <div class="action-tile">${I('i-chart')}<div class="at-label">Reports</div></div>
      ${isCEO ? `<div class="action-tile">${I('i-monitor')}<div class="at-label">Web Admin</div></div>` : ''}
      <div class="action-tile">${I('i-pin')}<div class="at-label">Location</div></div>
    </div>

    <div class="section-head"><h2 class="title-2">Pending Approvals</h2><span class="view-all">View All ›</span></div>
    <div class="glass approval">
      <div class="approval-row">
        <div class="list-avatar av3" style="width:28px;height:28px;font-size:9px">PS</div>
        <div style="flex:1"><div class="approval-name">Priya Sharma</div><div class="approval-meta">${isCEO ? 'Kolkata' : 'Sales Exec'} · 15-17 May</div></div>
      </div>
      <div class="approval-type">Casual Leave Request</div>
      <div class="approval-actions"><div class="btn danger">Reject</div><div class="btn primary">Approve</div></div>
    </div>
    <div class="glass approval">
      <div class="approval-row">
        <div class="list-avatar av4" style="width:28px;height:28px;font-size:9px">RM</div>
        <div style="flex:1"><div class="approval-name">Rahul Mehta</div><div class="approval-meta">Designer · 4 hours</div></div>
      </div>
      <div class="approval-type">Overtime Request</div>
      <div class="approval-actions"><div class="btn danger">Reject</div><div class="btn primary">Approve</div></div>
    </div>
  `;
};

/* ─── STATE & ROUTING ─── */
let state = { persona:'A', tab:'home', deep:null }; // deep: 'me' | 'office' | null

function getBodyHTML() {
  if (state.deep === 'office') return officeScreen(state.persona);
  if (state.tab === 'home') return homeFor(state.persona);
  if (state.tab === 'workspace') return workspace();
  if (state.tab === 'punch') return punchScreen();
  if (state.tab === 'chat') return chat();
  if (state.tab === 'me') return meScreen(state.persona);
  return '<div style="padding:40px;text-align:center;color:var(--muted)">—</div>';
}

function renderHeader() {
  const p = personas[state.persona];
  const h = p.header;
  const hdr = document.getElementById('hdr');
  if (state.deep) {
    const title = state.persona === 'E' ? 'All Branches Office' : 'Office';
    hdr.innerHTML = `
      <div class="hdr-back" data-action="back">${I('i-chev-l')}</div>
      <div class="hdr-title">${title}</div>
      <div class="hdr-spacer"></div>
      <div class="hdr-bell">${I('i-bell')}</div>
    `;
  } else if (h.type === 'brand') {
    hdr.innerHTML = `
      <div class="hdr-logo brand">${h.logo}</div>
      <div class="hdr-name">${h.name}</div>
      <div class="hdr-spacer"></div>
      <div class="hdr-bell">${I('i-bell')}</div>
    `;
  } else {
    hdr.innerHTML = `
      <div class="hdr-logo">${h.logo}</div>
      <div class="hdr-name">${h.name}${I('i-chev-d')}</div>
      <div class="hdr-branch ${h.branch.readonly?'readonly':''}">${I('i-bldg')}<span class="b-label">${h.branch.label}</span><svg class="b-chev"><use href="#i-chev-d"/></svg></div>
      <div class="hdr-spacer"></div>
      <div class="hdr-bell">${I('i-bell')}</div>
    `;
  }
  hdr.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', () => {
      const a = el.dataset.action;
      if (a === 'back') state.deep = null;
      renderAll();
      document.getElementById('body').scrollTo(0,0);
    });
  });
}

function renderTabs() {
  const p = personas[state.persona];
  const tabs = document.getElementById('tabs');
  tabs.innerHTML = p.tabs.map(t =>
    `<button class="tab ${(!state.deep && t.id===state.tab)?'active':''}" data-tab="${t.id}">${I(t.icon)}<span class="t-label">${t.label}</span></button>`
  ).join('');
  tabs.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      state.tab = btn.dataset.tab;
      state.deep = null;
      renderAll();
      document.getElementById('body').scrollTo(0,0);
    });
  });
}

function renderBody() {
  const body = document.getElementById('body');
  body.innerHTML = getBodyHTML();
  body.querySelectorAll('[data-action="open-office"]').forEach(el => {
    el.addEventListener('click', () => {
      state.deep = 'office';
      renderAll();
      document.getElementById('body').scrollTo(0,0);
    });
  });
  body.querySelectorAll('[data-action="goto-punch"]').forEach(el => {
    el.addEventListener('click', () => {
      state.tab = 'punch';
      state.deep = null;
      renderAll();
      document.getElementById('body').scrollTo(0,0);
    });
  });
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
      state.deep = null;
      renderAll();
      document.getElementById('body').scrollTo(0,0);
    });
  });
}

function renderInfo() {
  const p = personas[state.persona];
  const info = document.getElementById('infoPanel');
  const moduleLabels = {prod:'Productivity', hrms:'HRMS', 'manage-branch':'Branch Mgmt', 'manage-company':'Company Mgmt'};
  const currentLabel = state.deep ? 'Office (deep)' : (p.tabs.find(t=>t.id===state.tab)?.label || '—');
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

function renderAll() {
  renderHeader();
  renderTabs();
  renderBody();
  renderPersonaSwitcher();
  renderInfo();
}

renderAll();
