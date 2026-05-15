/* ─────────────────────────────────────────────────────────────
   EasyDo 365 — v23 (Role-distinct heroes)

   The first version that gives every role its own Home hero card
   instead of stretching the Employee Punch hero across all of them.

   Role catalog mirrors backend authz.ts ROLE_CATALOG (project sister
   directory easydo_native/easydo-convex/packages/backend/src/authz.ts).
   ───────────────────────────────────────────────────────────── */

const I = (id) => `<svg><use href="#${id}"/></svg>`;

const ROLES = {
  owner: {
    label: 'Owner',
    sub: 'Full control · company-wide scope',
    identity: { name: 'Sayantan Ghosh',  role: 'Owner · Founder',     company: 'EasyDo Inc',          scope: 'All branches',   initials: 'SG' },
    autoScope: 'company',
    accent: 'navy',
    perms: { approve: true, payroll: true, transfer: true, admin: true, hr: true, punch: true },
    tabs: ['home', 'approvals', 'office', 'chats', 'me'],
    defaultTab: 'home',
  },
  admin: {
    label: 'HR Admin',
    sub: 'Day-to-day HR ops · company-wide',
    identity: { name: 'Aanya Patel',     role: 'HR Admin · L1',       company: 'EasyDo Inc',          scope: 'All branches',   initials: 'AP' },
    autoScope: 'company',
    accent: 'plum',
    perms: { approve: true, payroll: true, transfer: false, admin: true, hr: true, punch: true },
    tabs: ['home', 'approvals', 'office', 'chats', 'me'],
    defaultTab: 'home',
  },
  manager: {
    label: 'Manager',
    sub: 'Branch-scoped · own branch only',
    identity: { name: 'Rajesh Kumar',    role: 'Manager · L2',        company: 'EasyDo Inc',          scope: 'Mumbai Branch',  initials: 'RK' },
    autoScope: 'branch',
    accent: 'teal',
    perms: { approve: true, payroll: false, transfer: false, admin: false, hr: false, punch: true },
    tabs: ['home', 'branch', 'punch', 'chats', 'me'],
    defaultTab: 'home',
  },
  team_lead: {
    label: 'Team Lead',
    sub: 'Department-scoped · own team incl. salary',
    identity: { name: 'Priya Sharma',    role: 'Team Lead · Engineering', company: 'EasyDo Inc',      scope: 'Engineering · Mumbai', initials: 'PS' },
    autoScope: 'dept',
    accent: 'olive',
    perms: { approve: true, payroll: false, transfer: false, admin: false, hr: false, punch: true, viewTeamSalary: true },
    tabs: ['home', 'team', 'punch', 'chats', 'me'],
    defaultTab: 'home',
  },
  employee: {
    label: 'Employee',
    sub: 'Self-scope · the canonical Punch hero',
    identity: { name: 'Karan Mehta',     role: 'Software Engineer · L3', company: 'EasyDo Inc',       scope: 'Mumbai · Engineering', initials: 'KM' },
    autoScope: 'self',
    accent: 'coral',
    perms: { approve: false, payroll: false, transfer: false, admin: false, hr: false, punch: true },
    tabs: ['home', 'workspace', 'punch', 'chats', 'me'],
    defaultTab: 'punch',
  },
  member: {
    label: 'Member',
    sub: 'Pre-onboarding · upload documents first',
    identity: { name: 'Rohit Singh',     role: 'Member · invitation accepted', company: 'EasyDo Inc', scope: 'Onboarding',     initials: 'RS' },
    autoScope: 'self',
    accent: 'amber',
    perms: { approve: false, payroll: false, transfer: false, admin: false, hr: false, punch: false },
    tabs: ['home', 'onboarding', 'chats', 'me'],
    defaultTab: 'home',
  },
};

const ROLE_ORDER = ['owner', 'admin', 'manager', 'team_lead', 'employee', 'member'];

const TAB_META = {
  home:       { label: 'Home',       icon: 'i-house' },
  approvals:  { label: 'Approvals',  icon: 'i-tray' },
  office:     { label: 'Office',     icon: 'i-briefcase' },
  workspace:  { label: 'Workspace',  icon: 'i-briefcase' },
  branch:     { label: 'Branch',     icon: 'i-building' },
  team:       { label: 'Team',       icon: 'i-team' },
  onboarding: { label: 'Onboarding', icon: 'i-badge-plus' },
  punch:      { label: 'Punch',      icon: 'i-fingerprint' },
  chats:      { label: 'Chat',       icon: 'i-bubble' },
  me:         { label: 'Me',         icon: 'i-person' },
};

const state = {
  roleId: 'owner',
  tab: 'home',
  meMode: 'me',                // Me tab segmented: 'me' | 'team' (only visible for team-scoped roles)
  officeMode: 'self',          // Office tab segmented: 'self' | 'manage'
  chatFilter: 'all',           // Chats tab: 'all' | 'unread' | 'groups' | 'mentions'
  workspaceFilter: 'tasks',    // Workspace tab: 'tasks' | 'meets' | 'delegated' | 'reminders'
  punchedIn: false,            // Punch tab interactive state
};
const role = () => ROLES[state.roleId];

function render() {
  renderRoleSwitcher();
  renderNav();
  renderBody();
  renderTabs();
  renderInfoPanel();
}

function renderRoleSwitcher() {
  const sw = document.getElementById('roleSwitcher');
  const html = ROLE_ORDER.map(id => {
    const r = ROLES[id];
    return `
      <button class="rb-btn ${state.roleId === id ? 'active' : ''}" data-role="${id}" type="button">
        <span class="rb-icon">${I(roleIcon(id))}</span>
        <span class="rb-text">
          <span class="rb-name">${r.label}</span>
          <span class="rb-sub">${r.sub}</span>
        </span>
      </button>`;
  }).join('');
  sw.innerHTML = html;
  sw.querySelectorAll('.rb-btn').forEach(btn => {
    btn.addEventListener('click', () => setRole(btn.dataset.role));
  });
}

function roleIcon(id) {
  switch (id) {
    case 'owner':     return 'i-buildings';
    case 'admin':     return 'i-badge-plus';
    case 'manager':   return 'i-building';
    case 'team_lead': return 'i-team';
    case 'employee':  return 'i-fingerprint';
    case 'member':    return 'i-doc';
    default:          return 'i-person';
  }
}

function setRole(id) {
  if (!ROLES[id]) return;
  state.roleId = id;
  // Demo always lands on Home so the role-distinct hero is what viewers see.
  // Production app would honour ROLES[id].defaultTab.
  state.tab = 'home';
  state.meMode = 'me';
  state.officeMode = 'self';
  state.chatFilter = 'all';
  state.workspaceFilter = 'tasks';
  render();
}

function setTab(id) {
  if (!role().tabs.includes(id)) return;
  state.tab = id;
  renderBody();
  renderTabs();
}

function renderNav() {
  const r = role();
  const { name, role: roleLine, scope, initials } = r.identity;
  document.getElementById('nav').innerHTML = `
    <div class="nav-l">
      <div class="nav-id">
        <span class="nav-name">${name}</span>
        <span class="nav-meta">${roleLine} · ${scope}</span>
      </div>
    </div>
    <div class="nav-r">
      <button class="nav-bell" type="button" aria-label="Notifications">${I('i-bell')}<span class="nav-bell-badge">3</span></button>
      <button class="nav-avatar" type="button" aria-label="Profile">${initials}</button>
    </div>`;
}

function renderBody() {
  const body = document.getElementById('body');
  if (state.tab !== 'home') {
    body.innerHTML = renderNonHomeTab(state.tab);
    return;
  }
  switch (state.roleId) {
    case 'owner':     body.innerHTML = ownerHome();     break;
    case 'admin':     body.innerHTML = adminHome();     break;
    case 'manager':   body.innerHTML = managerHome();   break;
    case 'team_lead': body.innerHTML = teamLeadHome();  break;
    case 'employee':  body.innerHTML = employeeHome();  break;
    case 'member':    body.innerHTML = memberHome();    break;
  }
}

/* OWNER · Attention queue ─────────────────────────────────── */
function ownerHome() {
  return `
  <section class="hero hero--owner">
    <div class="hero-eyebrow">Today · ${todayStr()}</div>
    <div class="metric-strip">
      <div class="metric">
        <span class="m-icon">${I('i-buildings')}</span>
        <span class="m-val">5</span>
        <span class="m-lbl">branches</span>
      </div>
      <div class="metric">
        <span class="m-icon">${I('i-bolt')}</span>
        <span class="m-val">847</span>
        <span class="m-lbl">active today</span>
        <span class="m-delta up">${I('i-arrow-up-r')} +12</span>
      </div>
      <div class="metric">
        <span class="m-icon">${I('i-rupee')}</span>
        <span class="m-val">3.2L</span>
        <span class="m-lbl">payroll MTD</span>
      </div>
      <div class="metric urgent">
        <span class="m-icon">${I('i-tray')}</span>
        <span class="m-val">7</span>
        <span class="m-lbl">awaiting you</span>
      </div>
    </div>
  </section>

  <section class="queue">
    <header class="section-head"><span class="sh-label">Awaiting you</span><span class="sh-count">7</span></header>
    <ul class="queue-list">
      ${queueRow('warn',  '3 leave requests',         '1 over 48h',                            'leave')}
      ${queueRow('rupee', '2 expense approvals',      '₹84,300 · all in Mumbai',               'expense')}
      ${queueRow('badge', '4 appointment letters',    'pending — Aanya prepared',              'onboarding')}
      ${queueRow('warn',  '1 face-match exception',   'Karan H · 37 min ago',                  'exception')}
      ${queueRow('chart', 'Q3 payroll variance',      '+8% vs last month · review',            'variance')}
    </ul>
  </section>

  <section class="branch-grid">
    <header class="section-head"><span class="sh-label">Branches</span><span class="sh-link">All ${I('i-chev-r')}</span></header>
    <div class="bg-list">
      ${branchTile('Mumbai HO',   '312 · 287 in', 92)}
      ${branchTile('Delhi NCR',   '187 · 169 in', 90)}
      ${branchTile('Bangalore',   '203 · 198 in', 97)}
      ${branchTile('Pune',        '94 · 81 in',   86)}
      ${branchTile('Kolkata ⚠',   '51 · 38 in',   75)}
    </div>
  </section>

  ${punchedOutCard()}
  `;
}

function queueRow(iconKind, title, sub, kind) {
  const iconMap = { warn: 'i-warn-tri', rupee: 'i-rupee', badge: 'i-badge-plus', chart: 'i-chart', people: 'i-people' };
  const tone = iconKind === 'warn' ? 'urgent' : '';
  return `
    <li class="queue-row ${tone}" data-kind="${kind}">
      <span class="qr-icon">${I(iconMap[iconKind] || 'i-tray')}</span>
      <span class="qr-text">
        <span class="qr-title">${title}</span>
        <span class="qr-sub">${sub}</span>
      </span>
      <span class="qr-chev">${I('i-chev-r')}</span>
    </li>`;
}

function branchTile(name, sub, pct) {
  return `
    <div class="branch-tile">
      <div class="bt-name">${name}</div>
      <div class="bt-bar"><span style="width:${pct}%"></span></div>
      <div class="bt-sub">${sub} · ${pct}%</div>
    </div>`;
}

/* ADMIN (HR) · Onboarding pipeline ───────────────────────── */
function adminHome() {
  return `
  <section class="hero hero--admin">
    <div class="hero-eyebrow">HR Operations · ${todayStr()}</div>
    <div class="metric-strip">
      <div class="metric">
        <span class="m-icon">${I('i-badge-plus')}</span>
        <span class="m-val">8</span>
        <span class="m-lbl">new hires</span>
        <span class="m-delta up">${I('i-arrow-up-r')} +3</span>
      </div>
      <div class="metric">
        <span class="m-icon">${I('i-people')}</span>
        <span class="m-val">847</span>
        <span class="m-lbl">employees</span>
      </div>
      <div class="metric">
        <span class="m-icon">${I('i-check-circle')}</span>
        <span class="m-val">93%</span>
        <span class="m-lbl">attendance</span>
      </div>
      <div class="metric urgent">
        <span class="m-icon">${I('i-doc')}</span>
        <span class="m-val">12</span>
        <span class="m-lbl">docs to review</span>
      </div>
    </div>
  </section>

  <section class="pipeline">
    <header class="section-head"><span class="sh-label">Onboarding pipeline</span><span class="sh-count">12 active</span></header>
    <div class="pipe-row"><span class="pipe-stage">Invited</span><span class="pipe-count">7</span><span class="pipe-bar"><span style="width:100%"></span></span></div>
    <div class="pipe-row"><span class="pipe-stage">Documents pending</span><span class="pipe-count">12</span><span class="pipe-bar amber"><span style="width:75%"></span></span></div>
    <div class="pipe-row"><span class="pipe-stage">Verification in review</span><span class="pipe-count">5</span><span class="pipe-bar plum"><span style="width:45%"></span></span></div>
    <div class="pipe-row"><span class="pipe-stage">Appointment letters</span><span class="pipe-count">4</span><span class="pipe-bar teal"><span style="width:30%"></span></span></div>
    <div class="pipe-row done"><span class="pipe-stage">Onboarded this month</span><span class="pipe-count">31</span><span class="pipe-bar success"><span style="width:100%"></span></span></div>
  </section>

  <section class="queue">
    <header class="section-head"><span class="sh-label">Today's HR actions</span></header>
    <ul class="queue-list">
      ${queueRow('badge', '4 appointment letters',    'ready to send · check + approve',     'letters')}
      ${queueRow('warn',  '2 onboarding docs',        'rejected by reviewer · re-review',    'docs')}
      ${queueRow('rupee', 'Payroll Oct cycle',        'preview ready · ₹3.2L gross',         'payroll')}
      ${queueRow('chart', 'Attrition report',         'Sep 2026 · 2.1% (down 0.4)',          'attrition')}
    </ul>
  </section>

  ${punchedOutCard()}
  `;
}

/* MANAGER · Branch pulse ─────────────────────────────────── */
function managerHome() {
  const branch = role().identity.scope;
  return `
  <section class="hero hero--manager">
    <div class="hero-eyebrow">${branch} · ${todayStr()}</div>

    <div class="pulse-grid">
      <div class="pulse-stat in">
        <span class="ps-val">287</span>
        <span class="ps-lbl">in today</span>
      </div>
      <div class="pulse-stat out">
        <span class="ps-val">18</span>
        <span class="ps-lbl">on leave</span>
      </div>
      <div class="pulse-stat late">
        <span class="ps-val">5</span>
        <span class="ps-lbl">late</span>
      </div>
      <div class="pulse-stat missing">
        <span class="ps-val">2</span>
        <span class="ps-lbl">missing</span>
      </div>
    </div>

    <div class="pulse-bar">
      <span class="pb-in" style="width:91.4%"></span>
      <span class="pb-leave" style="width:5.7%"></span>
      <span class="pb-late" style="width:1.6%"></span>
      <span class="pb-missing" style="width:0.6%"></span>
    </div>
    <div class="pulse-caption">312 in branch · 92% present · 8:00 AM cutoff</div>
  </section>

  <section class="queue">
    <header class="section-head"><span class="sh-label">Awaiting you</span><span class="sh-count">5</span></header>
    <ul class="queue-list">
      ${queueRow('warn',  '3 leave requests',         'Karan · Anuj · Meera',                 'leave')}
      ${queueRow('rupee', '1 advance request',        '₹15,000 · Rohit S',                    'advance')}
      ${queueRow('warn',  '2 missed-punch reviews',   'Priya · Sahil · yesterday',            'missed')}
    </ul>
  </section>

  <section class="exceptions">
    <header class="section-head"><span class="sh-label">Today's exceptions</span><span class="sh-link">All ${I('i-chev-r')}</span></header>
    <ul class="exception-list">
      <li><span class="ex-dot ex-warn"></span><span class="ex-name">Sahil Kapoor</span><span class="ex-meta">Late 47 min · IT</span></li>
      <li><span class="ex-dot ex-warn"></span><span class="ex-name">Priya Vora</span><span class="ex-meta">No punch · Ops</span></li>
      <li><span class="ex-dot ex-ok"></span><span class="ex-name">Karan H</span><span class="ex-meta">Geofence breach · resolved</span></li>
    </ul>
  </section>

  ${punchedOutCard()}
  `;
}

/* TEAM LEAD · Team status with salary peek ───────────────── */
function teamLeadHome() {
  return `
  <section class="hero hero--lead">
    <div class="hero-eyebrow">Engineering · Mumbai · ${todayStr()}</div>
    <div class="metric-strip">
      <div class="metric">
        <span class="m-icon">${I('i-team')}</span>
        <span class="m-val">14</span>
        <span class="m-lbl">team size</span>
      </div>
      <div class="metric">
        <span class="m-icon">${I('i-bolt')}</span>
        <span class="m-val">12</span>
        <span class="m-lbl">active</span>
      </div>
      <div class="metric urgent">
        <span class="m-icon">${I('i-tray')}</span>
        <span class="m-val">2</span>
        <span class="m-lbl">approvals</span>
      </div>
      <div class="metric">
        <span class="m-icon">${I('i-clock')}</span>
        <span class="m-val">4</span>
        <span class="m-lbl">overdue tasks</span>
      </div>
    </div>
  </section>

  <section class="queue">
    <header class="section-head"><span class="sh-label">Your team — today</span></header>
    <ul class="team-list">
      ${teamRow('AS', 'Aditya Sharma',  'SDE 2 · in',         '12,40,000',  'in')}
      ${teamRow('MV', 'Meera Venkat',   'SDE 1 · in',         '9,20,000',   'in')}
      ${teamRow('NK', 'Nishant Kohli',  'SDE 1 · in',         '9,80,000',   'in')}
      ${teamRow('SP', 'Sahil Patel',    'SDE 2 · late 23m',   '13,10,000',  'late')}
      ${teamRow('RV', 'Riya Verma',     'SDE 1 · on leave',   '10,50,000',  'leave')}
      ${teamRow('--', '+ 9 more',       'View all',           '',           '')}
    </ul>
  </section>

  <section class="queue">
    <header class="section-head"><span class="sh-label">Decisions waiting</span><span class="sh-count">2</span></header>
    <ul class="queue-list">
      ${queueRow('warn',  'Riya — sick leave',        '3 days · medical certificate attached', 'leave')}
      ${queueRow('chart', 'Sprint 47 retro',          'team review · Friday 4pm',              'meeting')}
    </ul>
  </section>

  ${punchedOutCard()}
  `;
}

function teamRow(initials, name, meta, salary, status) {
  const showSalary = role().perms.viewTeamSalary && salary;
  const dot = status ? `<span class="tr-dot tr-${status}"></span>` : '';
  return `
    <li class="team-row">
      <span class="tr-avatar">${initials}</span>
      <span class="tr-body">
        <span class="tr-name">${dot}${name}</span>
        <span class="tr-meta">${meta}</span>
      </span>
      ${showSalary ? `<span class="tr-salary">₹${salary}</span>` : `<span class="tr-chev">${I('i-chev-r')}</span>`}
    </li>`;
}

/* EMPLOYEE · Punch hero (v22 lineage) ────────────────────── */
function employeeHome() {
  return `
  <section class="hero hero--employee">
    <div class="hero-eyebrow">${todayStr()} · 9:00 AM shift</div>

    <div class="punch-card">
      <div class="punch-eyebrow">When you're ready</div>
      <button class="punch-disc" type="button" aria-label="Punch in">
        <span class="pd-halo"></span>
        <span class="pd-fp">${I('i-fingerprint')}</span>
        <span class="pd-cta">Punch In</span>
        <span class="pd-time">9:08 AM</span>
      </button>
      <div class="punch-sub">
        <span class="ps-loc">${I('i-mappin')} Mumbai HO · inside geofence</span>
        <span class="ps-net">${I('i-wifi')} Wi-Fi verified</span>
      </div>
    </div>

    <div class="hero-stats">
      <div class="hs-stat">
        <span class="hs-val">8h 12m</span>
        <span class="hs-lbl">avg this week</span>
      </div>
      <div class="hs-stat">
        <span class="hs-val">2/12</span>
        <span class="hs-lbl">leave taken</span>
      </div>
      <div class="hs-stat">
        <span class="hs-val">21</span>
        <span class="hs-lbl">days to payday</span>
      </div>
    </div>
  </section>

  <section class="queue">
    <header class="section-head"><span class="sh-label">Today</span></header>
    <ul class="queue-list">
      ${queueRow('chart', 'Sprint standup',           '9:30 AM · #engineering',      'meet')}
      ${queueRow('badge', 'Design review',            '2:00 PM · with Priya',        'meet')}
      ${queueRow('rupee', 'Payslip · Sep 2026',       '₹98,400 net · view',          'pay')}
    </ul>
  </section>
  `;
}

/* MEMBER · Onboarding checklist ──────────────────────────── */
function memberHome() {
  return `
  <section class="hero hero--member">
    <div class="hero-eyebrow">Welcome, Rohit</div>
    <h2 class="member-h">Let's get you onboarded</h2>
    <p class="member-sub">Upload these 5 documents to unlock attendance, payroll, and the colleague directory. HR usually verifies within one business day.</p>

    <div class="onboard-progress">
      <div class="op-track"><span class="op-fill" style="width:40%"></span></div>
      <div class="op-meta"><span><b>2</b> of <b>5</b> uploaded</span><span>40%</span></div>
    </div>

    <ul class="onboard-list">
      ${docRow('Government ID',             'Aadhaar · uploaded',              'done')}
      ${docRow('PAN card',                  'uploaded · verifying',            'review')}
      ${docRow('Address proof',             'utility bill, bank statement, or rent agreement', 'todo')}
      ${docRow('Educational certificate',   'highest qualification',           'todo')}
      ${docRow('Bank account details',      'for salary deposit',              'todo')}
    </ul>

    <div class="onboard-cta">
      <button class="ob-btn primary" type="button">${I('i-upload')} Upload next document</button>
      <button class="ob-btn ghost" type="button">${I('i-envelope')} Contact HR</button>
    </div>
  </section>

  <section class="queue muted-section">
    <header class="section-head"><span class="sh-label">Available after onboarding</span></header>
    <ul class="queue-list locked">
      ${queueRow('badge', 'Punch & attendance',       'unlocks after document verification', 'gate')}
      ${queueRow('rupee', 'Payroll & payslips',       'unlocks after appointment letter',    'gate')}
      ${queueRow('people','Colleague directory',     'unlocks after appointment letter',    'gate')}
    </ul>
  </section>
  `;
}

function docRow(title, sub, status) {
  const iconMap = { done: 'i-check-circle', review: 'i-clock', todo: 'i-circle-dash' };
  return `
    <li class="onboard-row st-${status}">
      <span class="or-icon">${I(iconMap[status])}</span>
      <span class="or-text">
        <span class="or-title">${title}</span>
        <span class="or-sub">${sub}</span>
      </span>
      <span class="or-chev">${I('i-chev-r')}</span>
    </li>`;
}

function punchedOutCard() {
  if (!role().perms.punch) return '';
  return `
  <section class="punch-mini">
    <span class="pm-icon">${I('i-fingerprint')}</span>
    <span class="pm-text">
      <span class="pm-title">You haven't punched in today</span>
      <span class="pm-sub">Mumbai HO · 9:08 AM</span>
    </span>
    <button class="pm-btn" type="button">Punch in</button>
  </section>`;
}

function renderNonHomeTab(tabId) {
  switch (tabId) {
    case 'approvals':  return approvalsTab();
    case 'office':     return officeTab();
    case 'branch':     return branchTab();
    case 'team':       return teamTab();
    case 'workspace':  return workspaceTab();
    case 'onboarding': return onboardingTab();
    case 'punch':      return punchTab();
    case 'chats':      return chatsTab();
    case 'me':         return meTab();
    default:           return placeholderTab(tabId);
  }
}

function placeholderTab(tabId) {
  const m = TAB_META[tabId] || { icon: 'i-house', label: tabId };
  return `
    <section class="placeholder">
      <div class="pl-icon">${I(m.icon)}</div>
      <h2 class="pl-title">${m.label}</h2>
    </section>`;
}


function renderTabs() {
  const r = role();
  const tabs = document.getElementById('tabs');
  tabs.innerHTML = r.tabs.map(id => {
    const m = TAB_META[id];
    const isCenter = id === 'punch';
    return `
      <button class="tab ${state.tab === id ? 'active' : ''} ${isCenter ? 'tab-center' : ''}" data-tab="${id}" type="button">
        <span class="t-icon">${I(m.icon)}</span>
        <span class="t-label">${m.label}</span>
      </button>`;
  }).join('');
  tabs.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => setTab(btn.dataset.tab));
  });
}

function renderInfoPanel() {
  const r = role();
  document.getElementById('infoPanel').innerHTML = `
    <div class="ip-head">
      <span class="ip-eyebrow">Currently viewing</span>
      <h3 class="ip-title">${r.label}</h3>
      <p class="ip-sub">${r.sub}</p>
    </div>

    <dl class="ip-facts">
      <div class="ip-fact">
        <dt>Identity</dt>
        <dd>${r.identity.name}<br><span class="ip-faint">${r.identity.role}</span></dd>
      </div>
      <div class="ip-fact">
        <dt>Scope</dt>
        <dd>${r.identity.scope}<br><span class="ip-faint">autoScope: <code>${r.autoScope}</code></span></dd>
      </div>
      <div class="ip-fact">
        <dt>Tabs</dt>
        <dd>${r.tabs.map(t => TAB_META[t].label).join(' · ')}<br><span class="ip-faint">defaults to ${TAB_META[r.defaultTab].label}</span></dd>
      </div>
      <div class="ip-fact">
        <dt>Hero shape</dt>
        <dd>${heroShape(state.roleId)}</dd>
      </div>
    </dl>

    <div class="ip-note">
      <span class="ip-note-h">Why this hero?</span>
      <p>${heroRationale(state.roleId)}</p>
    </div>

    <div class="ip-backend">
      Roles mirror <code>authz.ts:ROLE_CATALOG</code> — same IDs, same <code>autoScope</code>, same <code>kind</code>. Wiring this UI to the real backend is a 1-to-1 mapping, no translation layer.
    </div>
  `;
}

function heroShape(id) {
  switch (id) {
    case 'owner':     return 'Metric strip + attention queue + branch grid';
    case 'admin':     return 'Onboarding pipeline + HR action queue';
    case 'manager':   return 'Branch pulse grid + branch-scoped approvals';
    case 'team_lead': return 'Team metric strip + team roster (with salary)';
    case 'employee':  return 'Punch disc · large, centred, primary action';
    case 'member':    return 'Onboarding checklist with progress + gated features';
    default:          return '—';
  }
}

function heroRationale(id) {
  switch (id) {
    case 'owner':     return 'No daily ritual — the job is decision allocation. Hero is an inbox of items that need company-scope judgement, not a button to press.';
    case 'admin':     return 'HR ops live in a few recurring queues: onboarding, leave, payroll, documents. The hero shows pipeline state + today\'s ops actions.';
    case 'manager':   return 'A branch manager opens the app to know one thing first: <em>is my branch running</em>? The pulse grid answers in one glance, before any decision.';
    case 'team_lead': return 'Team Leads have salary visibility for their own department only. The hero foregrounds the team roster with that permission used, plus the decisions waiting from direct reports.';
    case 'employee':  return 'The Punch action <em>is</em> the daily ritual. Big disc, single CTA, location + Wi-Fi verification visible. This is the only role where v22\'s hero treatment is dead-correct.';
    case 'member':    return 'Pre-onboarding. The hero is "complete your verification" — a 5-document checklist with a progress bar. Punch, payroll, directory are visibly locked.';
    default:          return '';
  }
}

function todayStr() {
  const d = new Date(2026, 4, 15);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

/* ─────────────────────────────────────────────────────────────
   Tab renderers — role-aware where needed, role-agnostic where
   the chassis is the same across all roles (chats, me).
   ─────────────────────────────────────────────────────────── */

/* APPROVALS — owner & admin (and falls back gracefully for others) */
function approvalsTab() {
  const r = role();
  const items = approvalsFor(state.roleId);
  return `
  <div class="tab-h">
    <div class="th-eyebrow">${approvalsScope(r)}</div>
    <h2 class="th-title">Approvals</h2>
    <p class="th-sub">${items.length} decisions awaiting you</p>
  </div>

  <div class="chips">
    ${chip('all',        'All',         items.length, true)}
    ${chip('leave',      'Leave',       items.filter(i => i.kind === 'leave').length)}
    ${chip('expense',    'Expense',     items.filter(i => i.kind === 'expense').length)}
    ${chip('onboarding', 'Onboarding',  items.filter(i => i.kind === 'onboarding').length)}
  </div>

  <ul class="approval-list">
    ${items.map(approvalRow).join('')}
  </ul>
  `;
}

function approvalsFor(roleId) {
  if (roleId === 'owner') return [
    { kind: 'leave',      who: 'Karan Hegde',     branch: 'Mumbai',     ctx: 'Sick leave · 3 days · medical cert', age: '2h', urgent: false },
    { kind: 'leave',      who: 'Anuj Iyer',       branch: 'Bangalore',  ctx: 'Casual leave · 1 day',               age: '8h', urgent: false },
    { kind: 'leave',      who: 'Meera Pillai',    branch: 'Delhi NCR',  ctx: 'Earned leave · 5 days · 52h ago',    age: '52h', urgent: true },
    { kind: 'expense',    who: 'Sahil Patel',     branch: 'Mumbai',     ctx: '₹48,300 · client dinner · receipts', age: '5h', urgent: false },
    { kind: 'expense',    who: 'Riya Verma',      branch: 'Mumbai',     ctx: '₹36,000 · travel · Bangalore trip',  age: '1d', urgent: false },
    { kind: 'onboarding', who: 'Nishant Kohli',   branch: 'Mumbai',     ctx: 'Appointment letter ready',           age: '—',   urgent: false },
    { kind: 'onboarding', who: 'Priya Vora',      branch: 'Pune',       ctx: 'Background verification complete',   age: '—',   urgent: false },
  ];
  if (roleId === 'admin') return [
    { kind: 'onboarding', who: 'Nishant Kohli',   branch: 'Mumbai',     ctx: 'Appointment letter ready · review',   age: '—',  urgent: false },
    { kind: 'onboarding', who: 'Priya Vora',      branch: 'Pune',       ctx: 'Background verification complete',    age: '—',  urgent: false },
    { kind: 'onboarding', who: 'Aditya Sharma',   branch: 'Mumbai',     ctx: 'Docs rejected · re-verify',           age: '4h', urgent: true },
    { kind: 'leave',      who: 'Karan Hegde',     branch: 'Mumbai',     ctx: 'Sick leave · 3 days · medical cert',  age: '2h', urgent: false },
    { kind: 'expense',    who: 'Sahil Patel',     branch: 'Mumbai',     ctx: '₹48,300 · client dinner',             age: '5h', urgent: false },
  ];
  if (roleId === 'manager') return [
    { kind: 'leave',      who: 'Karan',           branch: '',           ctx: 'Sick leave · 3 days',                 age: '2h', urgent: false },
    { kind: 'leave',      who: 'Anuj',            branch: '',           ctx: 'Casual leave · 1 day',                age: '8h', urgent: false },
    { kind: 'leave',      who: 'Meera',           branch: '',           ctx: 'Earned leave · 5 days',               age: '52h', urgent: true },
    { kind: 'expense',    who: 'Rohit S',         branch: '',           ctx: 'Advance · ₹15,000',                   age: '1d', urgent: false },
    { kind: 'leave',      who: 'Priya · missed punch', branch: '',      ctx: 'Yesterday · justify',                 age: '20h', urgent: false },
  ];
  if (roleId === 'team_lead') return [
    { kind: 'leave',      who: 'Riya Verma',      branch: '',           ctx: 'Sick leave · 3 days · medical cert',  age: '3h', urgent: false },
    { kind: 'leave',      who: 'Sahil Patel',     branch: '',           ctx: 'Casual leave · today',                age: '7h', urgent: false },
  ];
  return [];
}

function approvalsScope(r) {
  switch (r.autoScope) {
    case 'company': return 'All branches · all departments';
    case 'branch':  return `${r.identity.scope} only`;
    case 'dept':    return r.identity.scope;
    default:        return 'Your scope';
  }
}

function approvalRow(item) {
  const iconMap = { leave: 'i-airplane', expense: 'i-rupee', onboarding: 'i-badge-plus' };
  const tone = item.urgent ? 'urgent' : '';
  const ageBadge = item.age && item.age !== '—'
    ? `<span class="ap-age ${item.urgent ? 'warn' : ''}">${item.age}</span>` : '';
  const branchTag = item.branch ? `<span class="ap-branch">${item.branch}</span>` : '';
  return `
    <li class="approval-row ${tone}">
      <span class="ap-icon">${I(iconMap[item.kind] || 'i-tray')}</span>
      <div class="ap-body">
        <div class="ap-l1">
          <span class="ap-who">${item.who}</span>
          ${branchTag}${ageBadge}
        </div>
        <div class="ap-ctx">${item.ctx}</div>
        <div class="ap-actions">
          <button class="ap-btn approve" type="button">${I('i-check')} Approve</button>
          <button class="ap-btn deny" type="button">${I('i-close')} Deny</button>
        </div>
      </div>
    </li>`;
}

function chip(id, label, count, active = false) {
  return `
    <button class="chip ${active ? 'active' : ''}" type="button">
      <span class="chip-label">${label}</span>
      ${count > 0 ? `<span class="chip-count">${count}</span>` : ''}
    </button>`;
}

/* OFFICE — owner & admin · Self/Manage segmented control */
function officeTab() {
  const isManage = state.officeMode === 'manage';
  return `
  <div class="tab-h">
    <h2 class="th-title">Office</h2>
  </div>

  <div class="segmented" role="tablist">
    <button class="seg-opt ${!isManage ? 'active' : ''}" data-office="self"   type="button" role="tab" aria-selected="${!isManage}">Self</button>
    <button class="seg-opt ${ isManage ? 'active' : ''}" data-office="manage" type="button" role="tab" aria-selected="${isManage}">Manage</button>
  </div>

  ${isManage ? officeManage() : officeSelf()}
  `;
}

function officeSelf() {
  const r = role();
  return `
  <section class="self-card">
    <div class="sc-row">
      <span class="sc-avatar">${r.identity.initials}</span>
      <div class="sc-id">
        <div class="sc-name">${r.identity.name}</div>
        <div class="sc-meta">${r.identity.role}</div>
      </div>
    </div>
  </section>

  <header class="section-head"><span class="sh-label">My records</span></header>
  <ul class="list">
    ${listRow('i-creditcard', 'Payslip · Sep 2026',     '₹98,400 net · view PDF')}
    ${listRow('i-airplane',   'Leave balance',          '10 days remaining · 2 used')}
    ${listRow('i-clock',      'Attendance · this month','21 days · 0 missing · 1 late')}
    ${listRow('i-doc',        'My documents',           'Aadhaar · PAN · Education · Bank')}
  </ul>

  <header class="section-head"><span class="sh-label">Preferences</span></header>
  <ul class="list">
    ${listRow('i-bell',  'Notifications', 'On · push · email digest')}
    ${listRow('i-gear',  'App settings',  'Theme, language, units')}
  </ul>
  `;
}

function officeManage() {
  const r = role();
  return `
  <header class="section-head"><span class="sh-label">Company</span></header>
  <ul class="list">
    ${listRow('i-buildings', 'Branches',           '5 active · 1 expansion')}
    ${listRow('i-people',    'Employees',          '847 · 8 onboarding')}
    ${listRow('i-team',      'Departments',        '12 · 14 team leads')}
    ${listRow('i-shield-check','Roles & permissions','9 system · 3 custom')}
  </ul>

  <header class="section-head"><span class="sh-label">Cycles</span></header>
  <ul class="list">
    ${listRow('i-rupee',     'Payroll',            'Oct cycle · ₹3.2L preview')}
    ${listRow('i-calendar',  'Holidays',           '14 set for 2026')}
    ${listRow('i-clock',     'Shift policies',     '3 active · weekly off ruleset')}
  </ul>

  ${r.perms.transfer ? `
  <header class="section-head"><span class="sh-label">Owner-only</span></header>
  <ul class="list">
    ${listRow('i-arrow-up-r', 'Transfer ownership', 'Permanent · 2-step auth')}
    ${listRow('i-close',      'Delete company',     'Irreversible')}
  </ul>` : ''}
  `;
}

function listRow(icon, title, sub) {
  return `
    <li class="list-row">
      <span class="lr-icon">${I(icon)}</span>
      <div class="lr-body">
        <div class="lr-title">${title}</div>
        <div class="lr-sub">${sub}</div>
      </div>
      <span class="lr-chev">${I('i-chev-r')}</span>
    </li>`;
}

/* BRANCH — manager */
function branchTab() {
  return `
  <div class="tab-h">
    <div class="th-eyebrow">Branch detail</div>
    <h2 class="th-title">Mumbai HO</h2>
    <p class="th-sub">312 employees · 4 departments · Andheri East</p>
  </div>

  <section class="info-card">
    <div class="ic-row">
      <span class="ic-icon">${I('i-mappin')}</span>
      <div class="ic-body">
        <div class="ic-title">Location</div>
        <div class="ic-sub">Andheri East, Mumbai · Plot 42, MIDC</div>
      </div>
    </div>
    <div class="ic-row">
      <span class="ic-icon">${I('i-clock')}</span>
      <div class="ic-body">
        <div class="ic-title">Hours</div>
        <div class="ic-sub">Mon–Fri · 9:00 AM – 6:00 PM · Sat half-day</div>
      </div>
    </div>
    <div class="ic-row">
      <span class="ic-icon">${I('i-shield-check')}</span>
      <div class="ic-body">
        <div class="ic-title">Geofence</div>
        <div class="ic-sub">200m radius · Wi-Fi: <code>liberty-office</code></div>
      </div>
    </div>
  </section>

  <header class="section-head"><span class="sh-label">Today's attendance</span><span class="sh-count">287 / 312</span></header>
  <ul class="att-list">
    ${attRow('AS', 'Aditya Sharma',  'SDE 2 · Engineering',  '9:02 AM',  'in')}
    ${attRow('MV', 'Meera Venkat',   'SDE 1 · Engineering',  '8:54 AM',  'in')}
    ${attRow('NK', 'Nishant Kohli',  'SDE 1 · Engineering',  '9:08 AM',  'in')}
    ${attRow('SP', 'Sahil Patel',    'SDE 2 · Engineering',  '9:47 AM',  'late')}
    ${attRow('PV', 'Priya Vora',     'Ops Lead · Ops',       '—',         'missing')}
    ${attRow('RV', 'Riya Verma',     'SDE 1 · Engineering',  '— · leave', 'leave')}
    ${attRow('AK', 'Anuj Khanna',    'Designer · Design',    '8:59 AM',  'in')}
    ${attRow('++', '+ 305 more',     'View full list',       '',          '')}
  </ul>

  <header class="section-head"><span class="sh-label">Branch settings</span></header>
  <ul class="list">
    ${listRow('i-gear',       'Geofence & Wi-Fi',  'Edit radius, Wi-Fi SSIDs')}
    ${listRow('i-calendar',   'Holiday calendar',  '6 left in 2026')}
    ${listRow('i-clock',      'Shift timings',     '9:00 cutoff · 30-min grace')}
  </ul>
  `;
}

function attRow(initials, name, meta, time, status) {
  const dot = status ? `<span class="tr-dot tr-${status}"></span>` : '';
  const timeColor = status === 'late' ? 'warn' : status === 'missing' ? 'warn' : '';
  return `
    <li class="att-row">
      <span class="tr-avatar">${initials}</span>
      <div class="tr-body">
        <div class="tr-name">${dot}${name}</div>
        <div class="tr-meta">${meta}</div>
      </div>
      <span class="att-time ${timeColor}">${time}</span>
    </li>`;
}

/* TEAM — team_lead */
function teamTab() {
  return `
  <div class="tab-h">
    <div class="th-eyebrow">Engineering · Mumbai</div>
    <h2 class="th-title">My team</h2>
    <p class="th-sub">14 engineers · 12 active · 2 not in today</p>
  </div>

  <div class="metric-strip">
    <div class="metric">
      <span class="m-icon">${I('i-bolt')}</span>
      <span class="m-val">12</span>
      <span class="m-lbl">in today</span>
    </div>
    <div class="metric">
      <span class="m-icon">${I('i-clock')}</span>
      <span class="m-val">14</span>
      <span class="m-lbl">overdue tasks</span>
    </div>
    <div class="metric">
      <span class="m-icon">${I('i-calendar')}</span>
      <span class="m-val">3</span>
      <span class="m-lbl">leaves this wk</span>
    </div>
    <div class="metric urgent">
      <span class="m-icon">${I('i-tray')}</span>
      <span class="m-val">2</span>
      <span class="m-lbl">decisions</span>
    </div>
  </div>

  <header class="section-head"><span class="sh-label">Engineering · full roster</span><span class="sh-count">14</span></header>
  <ul class="team-list">
    ${teamFullRow('AS', 'Aditya Sharma',     'SDE 2',  'in',    '12,40,000')}
    ${teamFullRow('MV', 'Meera Venkat',      'SDE 1',  'in',    '9,20,000')}
    ${teamFullRow('NK', 'Nishant Kohli',     'SDE 1',  'in',    '9,80,000')}
    ${teamFullRow('SP', 'Sahil Patel',       'SDE 2',  'late',  '13,10,000')}
    ${teamFullRow('RV', 'Riya Verma',        'SDE 1',  'leave', '10,50,000')}
    ${teamFullRow('AK', 'Anuj Khanna',       'SDE 2',  'in',    '12,80,000')}
    ${teamFullRow('IS', 'Ishaan Sen',        'SDE 1',  'in',    '8,90,000')}
    ${teamFullRow('NJ', 'Naina Joshi',       'SDE 3',  'in',    '18,40,000')}
    ${teamFullRow('VR', 'Vikram Raman',      'SDE 1',  'in',    '9,10,000')}
    ${teamFullRow('TG', 'Tara Ghosh',        'SDE 2',  'in',    '12,20,000')}
    ${teamFullRow('KM', 'Karan Mehta',       'SDE 3',  'in',    '17,80,000')}
    ${teamFullRow('SD', 'Sneha Das',         'SDE 1',  'in',    '9,40,000')}
    ${teamFullRow('YB', 'Yash Bhatia',       'SDE 1',  'in',    '9,00,000')}
    ${teamFullRow('OM', 'Ojas Mehra',        'SDE 2',  'in',    '12,60,000')}
  </ul>
  `;
}

function teamFullRow(initials, name, level, status, salary) {
  const dot = `<span class="tr-dot tr-${status}"></span>`;
  return `
    <li class="team-row">
      <span class="tr-avatar">${initials}</span>
      <div class="tr-body">
        <div class="tr-name">${dot}${name}</div>
        <div class="tr-meta">${level} · ${status}</div>
      </div>
      <span class="tr-salary">₹${salary}</span>
    </li>`;
}

/* WORKSPACE — employee */
function workspaceTab() {
  const filter = state.workspaceFilter;
  return `
  <div class="tab-h">
    <h2 class="th-title">Workspace</h2>
    <p class="th-sub">Today · Fri, 15 May · 4 tasks · 3 meetings</p>
  </div>

  <div class="chips">
    ${wsChip('tasks',     'Tasks',     4)}
    ${wsChip('meets',     'Meets',     3)}
    ${wsChip('delegated', 'Delegated', 2)}
    ${wsChip('reminders', 'Reminders', 1)}
  </div>

  ${filter === 'tasks' ? `
    <header class="section-head"><span class="sh-label">Today's tasks</span></header>
    <ul class="list">
      ${taskRow('Code review · auth-middleware PR',      '#engineering · due 2pm',     'open')}
      ${taskRow('Sprint standup notes',                  'Daily · 9:30 AM',            'done')}
      ${taskRow('Database migration plan',               '#engineering · this week',   'open')}
      ${taskRow('Update onboarding doc',                 '#docs · low priority',       'open')}
    </ul>
  ` : ''}

  ${filter === 'meets' ? `
    <header class="section-head"><span class="sh-label">Today's meetings</span></header>
    <ul class="list">
      ${listRow('i-calendar', 'Sprint standup',     '9:30 AM · #engineering · 15 min')}
      ${listRow('i-calendar', 'Design review',      '2:00 PM · with Priya · 30 min')}
      ${listRow('i-calendar', 'All-hands',          '5:00 PM · company-wide · 45 min')}
    </ul>
  ` : ''}

  ${filter === 'delegated' ? `
    <header class="section-head"><span class="sh-label">Delegated to you</span></header>
    <ul class="list">
      ${listRow('i-person', 'Demo prep for client', 'From Priya · due Friday')}
      ${listRow('i-person', 'Onboard new SDE',      'From Aditya · ongoing')}
    </ul>
  ` : ''}

  ${filter === 'reminders' ? `
    <header class="section-head"><span class="sh-label">Reminders</span></header>
    <ul class="list">
      ${listRow('i-clock', 'Submit timesheet by Friday EOD', 'Recurring · weekly')}
    </ul>
  ` : ''}
  `;
}

function wsChip(id, label, count) {
  const active = state.workspaceFilter === id;
  return `
    <button class="chip ${active ? 'active' : ''}" data-ws="${id}" type="button">
      <span class="chip-label">${label}</span>
      ${count > 0 ? `<span class="chip-count">${count}</span>` : ''}
    </button>`;
}

function taskRow(title, sub, status) {
  const ic = status === 'done' ? 'i-check-circle' : 'i-circle-dash';
  return `
    <li class="list-row task ${status}">
      <span class="lr-icon">${I(ic)}</span>
      <div class="lr-body">
        <div class="lr-title">${title}</div>
        <div class="lr-sub">${sub}</div>
      </div>
      <span class="lr-chev">${I('i-chev-r')}</span>
    </li>`;
}

/* ONBOARDING — member */
function onboardingTab() {
  return `
  <div class="tab-h">
    <h2 class="th-title">Onboarding</h2>
    <p class="th-sub">2 of 5 documents uploaded · usually 1 business day to verify</p>
  </div>

  <section class="info-card">
    <div class="onboard-progress">
      <div class="op-track"><span class="op-fill" style="width:40%"></span></div>
      <div class="op-meta"><span><b>2</b> of <b>5</b> uploaded</span><span>40%</span></div>
    </div>
  </section>

  <header class="section-head"><span class="sh-label">Your documents</span></header>
  <ul class="onboard-list">
    ${onbFull('Government ID',           'Aadhaar', 'done',   'Uploaded · verified Tue 12 May')}
    ${onbFull('PAN card',                'PAN',     'review', 'Uploaded · HR reviewing')}
    ${onbFull('Address proof',           '',        'todo',   'Utility bill, bank statement, or rent agreement')}
    ${onbFull('Educational certificate', '',        'todo',   'Highest qualification only')}
    ${onbFull('Bank account details',    '',        'todo',   'For salary deposit')}
  </ul>

  <header class="section-head"><span class="sh-label">Verification timeline</span></header>
  <ul class="timeline">
    ${tlStep('done',   'Invitation accepted',         'Tue 12 May'      )}
    ${tlStep('done',   'Member account created',      'Tue 12 May'      )}
    ${tlStep('active', 'Documents under review',      '2 of 5 · ongoing')}
    ${tlStep('todo',   'Background verification',     'Triggered after docs')}
    ${tlStep('todo',   'Appointment letter',          'HR signs · ~1 day')}
    ${tlStep('todo',   'Employee account active',     'You unlock Punch, Payroll, Directory')}
  </ul>

  <section class="contact-card">
    <span class="cc-icon">${I('i-envelope')}</span>
    <div class="cc-body">
      <div class="cc-title">Need help?</div>
      <div class="cc-sub">HR usually replies within 4 hours</div>
    </div>
    <button class="cc-btn" type="button">Contact HR</button>
  </section>
  `;
}

function onbFull(title, doc, status, sub) {
  const iconMap = { done: 'i-check-circle', review: 'i-clock', todo: 'i-circle-dash' };
  const docTag = doc ? `<span class="onb-doc">${doc}</span>` : '';
  return `
    <li class="onboard-row st-${status}">
      <span class="or-icon">${I(iconMap[status])}</span>
      <div class="or-text">
        <div class="or-title">${title}${docTag}</div>
        <div class="or-sub">${sub}</div>
      </div>
      <span class="or-chev">${I('i-chev-r')}</span>
    </li>`;
}

function tlStep(status, title, sub) {
  return `
    <li class="tl-step st-${status}">
      <span class="tl-marker"></span>
      <div class="tl-body">
        <div class="tl-title">${title}</div>
        <div class="tl-sub">${sub}</div>
      </div>
    </li>`;
}

/* PUNCH — manager, team_lead, employee */
function punchTab() {
  return `
  <div class="tab-h">
    <div class="th-eyebrow">${todayStr()} · 9:00 AM shift</div>
    <h2 class="th-title">Punch</h2>
  </div>

  <div class="punch-card full">
    <div class="punch-eyebrow">When you're ready</div>
    <button class="punch-disc" type="button" aria-label="Punch in">
      <span class="pd-halo"></span>
      <span class="pd-fp">${I('i-fingerprint')}</span>
      <span class="pd-cta">Punch In</span>
      <span class="pd-time">9:08 AM</span>
    </button>
    <div class="punch-sub">
      <span class="ps-loc">${I('i-mappin')} Mumbai HO · inside geofence (12m)</span>
      <span class="ps-net">${I('i-wifi')} Wi-Fi <code>liberty-office</code> verified</span>
    </div>
  </div>

  <header class="section-head"><span class="sh-label">Today's log</span></header>
  <ul class="log-list">
    <li class="log-row"><span class="lg-dot lg-pending"></span><span class="lg-t">9:08 AM</span><span class="lg-l">Awaiting punch in</span></li>
  </ul>

  <header class="section-head"><span class="sh-label">This week</span></header>
  <div class="week-row">
    ${weekDay('Mon', '8h 04m', 'done')}
    ${weekDay('Tue', '8h 22m', 'done')}
    ${weekDay('Wed', '7h 58m', 'done')}
    ${weekDay('Thu', '8h 14m', 'done')}
    ${weekDay('Fri', '—',      'today')}
  </div>
  <div class="week-summary">Avg <b>8h 09m</b> · 4 of 5 days complete</div>
  `;
}

function weekDay(label, hours, status) {
  return `
    <div class="wd st-${status}">
      <span class="wd-label">${label}</span>
      <span class="wd-bar"><span style="height:${status === 'today' ? '20%' : '80%'}"></span></span>
      <span class="wd-hours">${hours}</span>
    </div>`;
}

/* CHATS — all roles */
function chatsTab() {
  return `
  <div class="tab-h">
    <h2 class="th-title">Chat</h2>
    <p class="th-sub">${chatScopeLabel()}</p>
  </div>

  <section class="ai-card">
    <span class="ai-icon">${I('i-bolt')}</span>
    <div class="ai-body">
      <div class="ai-title">EasyDo Copilot</div>
      <div class="ai-sub">Ask anything about leaves, payroll, attendance…</div>
    </div>
    <span class="ai-chev">${I('i-chev-r')}</span>
  </section>

  <div class="chips">
    ${cfChip('all',      'All',      8)}
    ${cfChip('unread',   'Unread',   3)}
    ${cfChip('groups',   'Groups',   4)}
    ${cfChip('mentions', 'Mentions', 2)}
  </div>

  <ul class="chat-list">
    ${chatRow('PS', 'Priya Sharma',          'Can you push the migration PR today?', '4:36 PM', 2, false)}
    ${chatRow('EN', '#engineering',          'Sahil: standup notes attached',         '3:14 PM', 0, true)}
    ${chatRow('AS', 'Aditya Sharma',         '👍 confirmed for tomorrow',             '2:02 PM', 0, false)}
    ${chatRow('HR', '#hr-announcements',     'Aanya: Diwali holiday list updated',    '11:48 AM', 1, true)}
    ${chatRow('MV', 'Meera Venkat',          'Sent the design file. LMK!',            '10:21 AM', 0, false)}
    ${chatRow('OP', '#ops',                  'Karan H: branch outage resolved',       '9:53 AM',  0, true)}
    ${chatRow('SP', 'Sahil Patel',           'Re: late punch — explanation attached', '9:12 AM',  0, false)}
    ${chatRow('RV', 'Riya Verma',            'On leave today, will revert Monday',    'Yesterday', 0, false)}
  </ul>
  `;
}

function chatRow(initials, name, last, time, unread, isGroup) {
  return `
    <li class="chat-row">
      <span class="cr-avatar ${isGroup ? 'group' : ''}">${initials}</span>
      <div class="cr-body">
        <div class="cr-l1">
          <span class="cr-name">${name}</span>
          <span class="cr-time">${time}</span>
        </div>
        <div class="cr-l2">
          <span class="cr-last">${last}</span>
          ${unread > 0 ? `<span class="cr-unread">${unread}</span>` : ''}
        </div>
      </div>
    </li>`;
}

function cfChip(id, label, count) {
  const active = state.chatFilter === id;
  return `
    <button class="chip ${active ? 'active' : ''}" data-cf="${id}" type="button">
      <span class="chip-label">${label}</span>
      ${count > 0 ? `<span class="chip-count">${count}</span>` : ''}
    </button>`;
}

function chatScopeLabel() {
  const r = role();
  switch (r.autoScope) {
    case 'company': return 'All branches · all departments';
    case 'branch':  return r.identity.scope;
    case 'dept':    return r.identity.scope;
    default:        return r.identity.scope;
  }
}

/* ME — all roles · Me/My Team segmented for team-scoped roles */
function meTab() {
  const r = role();
  const canManage = r.perms.approve;        // Owner/Admin/Manager/Team Lead have someone to manage
  const isTeam = canManage && state.meMode === 'team';

  const header = canManage ? `
    <div class="segmented" role="tablist">
      <button class="seg-opt ${!isTeam ? 'active' : ''}" data-me="me"   type="button" role="tab" aria-selected="${!isTeam}">Me</button>
      <button class="seg-opt ${ isTeam ? 'active' : ''}" data-me="team" type="button" role="tab" aria-selected="${isTeam}">My Team</button>
    </div>` : '';

  return `${header}${isTeam ? myTeamView() : myMeView()}`;
}

function myMeView() {
  const r = role();
  return `
  <section class="me-card">
    <span class="mc-avatar">${r.identity.initials}</span>
    <div class="mc-name">${r.identity.name}</div>
    <div class="mc-role">${r.identity.role}</div>
    <div class="mc-scope">${r.identity.company} · ${r.identity.scope}</div>
    <div class="mc-badge">${r.label}</div>
  </section>

  <header class="section-head"><span class="sh-label">Account</span></header>
  <ul class="list">
    ${listRow('i-person',       'Profile',         'Name, photo, contact info')}
    ${listRow('i-shield-check', 'Security',        '2-factor on · last login Today 9:08 AM')}
    ${listRow('i-bell',         'Notifications',   'Push on · 3 channels muted')}
    ${listRow('i-globe',        'Language & region','English · IN')}
  </ul>

  ${r.perms.punch ? `
  <header class="section-head"><span class="sh-label">Work</span></header>
  <ul class="list">
    ${listRow('i-creditcard',  'Payslips',         'View Sep 2026 + 11 months back')}
    ${listRow('i-airplane',    'Leave balance',    '10 days remaining · history')}
    ${listRow('i-doc',         'My documents',     'Aadhaar · PAN · Education · Bank')}
  </ul>` : ''}

  <header class="section-head"><span class="sh-label">App</span></header>
  <ul class="list">
    ${listRow('i-gear',        'App settings',     'Theme, units, sync')}
    ${listRow('i-envelope',    'Send feedback',    'Help shape EasyDo')}
    ${listRow('i-doc',         'Privacy policy',   'Last updated Apr 2026')}
  </ul>

  <button class="signout" type="button">Sign out</button>
  `;
}

function myTeamView() {
  switch (state.roleId) {
    case 'owner':     return teamSummaryOwner();
    case 'admin':     return teamSummaryAdmin();
    case 'manager':   return teamSummaryManager();
    case 'team_lead': return teamSummaryTeamLead();
    default:          return '';
  }
}

function teamSummaryOwner() {
  return `
  <section class="team-summary-h">
    <div class="tsh-eyebrow">Company at a glance · ${todayStr()}</div>
    <div class="metric-strip">
      <div class="metric">
        <span class="m-icon">${I('i-buildings')}</span>
        <span class="m-val">5</span>
        <span class="m-lbl">branches</span>
      </div>
      <div class="metric">
        <span class="m-icon">${I('i-people')}</span>
        <span class="m-val">847</span>
        <span class="m-lbl">employees</span>
      </div>
      <div class="metric">
        <span class="m-icon">${I('i-team')}</span>
        <span class="m-val">12</span>
        <span class="m-lbl">departments</span>
      </div>
      <div class="metric">
        <span class="m-icon">${I('i-badge-plus')}</span>
        <span class="m-val">8</span>
        <span class="m-lbl">onboarding</span>
      </div>
    </div>
  </section>

  <header class="section-head"><span class="sh-label">Branches</span><span class="sh-count">5</span></header>
  <ul class="list">
    ${listRow('i-building',  'Mumbai HO',    '312 employees · 287 in today · 92%')}
    ${listRow('i-building',  'Delhi NCR',    '187 employees · 169 in · 90%')}
    ${listRow('i-building',  'Bangalore',    '203 employees · 198 in · 97%')}
    ${listRow('i-building',  'Pune',         '94 employees · 81 in · 86%')}
    ${listRow('i-building',  'Kolkata',      '51 employees · 38 in · 75% ⚠')}
  </ul>

  <header class="section-head"><span class="sh-label">This week</span></header>
  <ul class="list">
    ${listRow('i-badge-plus','3 new hires',     'Nishant Kohli · Priya Vora · Aditya Sharma')}
    ${listRow('i-arrow-up-r','1 promotion',     'Naina Joshi → SDE 3 · Mumbai')}
    ${listRow('i-airplane',  '12 leave requests', 'All resolved · 0 pending')}
  </ul>

  <p class="hint-cta">Open <b>Office</b> tab for full company management.</p>
  `;
}

function teamSummaryAdmin() {
  return `
  <section class="team-summary-h">
    <div class="tsh-eyebrow">HR snapshot · ${todayStr()}</div>
    <div class="metric-strip">
      <div class="metric">
        <span class="m-icon">${I('i-badge-plus')}</span>
        <span class="m-val">8</span>
        <span class="m-lbl">new hires</span>
      </div>
      <div class="metric urgent">
        <span class="m-icon">${I('i-doc')}</span>
        <span class="m-val">12</span>
        <span class="m-lbl">docs to review</span>
      </div>
      <div class="metric">
        <span class="m-icon">${I('i-check-circle')}</span>
        <span class="m-val">31</span>
        <span class="m-lbl">onboarded MTD</span>
      </div>
      <div class="metric">
        <span class="m-icon">${I('i-chart')}</span>
        <span class="m-val">2.1%</span>
        <span class="m-lbl">attrition</span>
      </div>
    </div>
  </section>

  <header class="section-head"><span class="sh-label">Onboarding · in progress</span><span class="sh-count">8</span></header>
  <ul class="list">
    ${listRow('i-person',  'Nishant Kohli',     'Appointment letter ready · review')}
    ${listRow('i-person',  'Priya Vora',        'Background verification complete')}
    ${listRow('i-person',  'Aditya Sharma',     'Docs rejected · re-verify')}
    ${listRow('i-person',  '+ 5 more',          'View pipeline in Office tab')}
  </ul>

  <header class="section-head"><span class="sh-label">This week</span></header>
  <ul class="list">
    ${listRow('i-calendar',  'Payroll cutoff', '5 days · Oct cycle preview ready')}
    ${listRow('i-shield-check','BG verification', 'Vendor returned 3 · 2 clean · 1 flag')}
    ${listRow('i-airplane',  'Leave approvals',  '12 resolved · avg time 4h')}
  </ul>

  <p class="hint-cta">Open <b>Office</b> tab for the full HR pipeline + cycles.</p>
  `;
}

function teamSummaryManager() {
  return `
  <section class="team-summary-h">
    <div class="tsh-eyebrow">Mumbai Branch · ${todayStr()}</div>
    <div class="metric-strip">
      <div class="metric">
        <span class="m-icon">${I('i-people')}</span>
        <span class="m-val">312</span>
        <span class="m-lbl">on rolls</span>
      </div>
      <div class="metric">
        <span class="m-icon">${I('i-bolt')}</span>
        <span class="m-val">287</span>
        <span class="m-lbl">in today</span>
      </div>
      <div class="metric urgent">
        <span class="m-icon">${I('i-warn-tri')}</span>
        <span class="m-val">5</span>
        <span class="m-lbl">late</span>
      </div>
      <div class="metric urgent">
        <span class="m-icon">${I('i-warn-tri')}</span>
        <span class="m-val">2</span>
        <span class="m-lbl">missing</span>
      </div>
    </div>
  </section>

  <header class="section-head"><span class="sh-label">Departments in this branch</span></header>
  <ul class="list">
    ${listRow('i-team',     'Engineering',    '14 size · 12 in · 1 late · 1 leave')}
    ${listRow('i-team',     'Operations',     '38 size · 32 in · 2 late · 4 missing')}
    ${listRow('i-team',     'Sales',          '57 size · 51 in · 2 late')}
    ${listRow('i-team',     'Design',         '8 size · 8 in')}
  </ul>

  <header class="section-head"><span class="sh-label">Today's exceptions</span></header>
  <ul class="list">
    ${listRow('i-warn-tri', 'Sahil Kapoor · late 47 min', 'IT · re-verify entry')}
    ${listRow('i-warn-tri', 'Priya Vora · no punch',      'Ops · contact + grace')}
  </ul>

  <p class="hint-cta">Open <b>Branch</b> tab for the full attendance roster + branch settings.</p>
  `;
}

function teamSummaryTeamLead() {
  return `
  <section class="team-summary-h">
    <div class="tsh-eyebrow">Engineering · Mumbai · ${todayStr()}</div>
    <div class="metric-strip">
      <div class="metric">
        <span class="m-icon">${I('i-team')}</span>
        <span class="m-val">14</span>
        <span class="m-lbl">team size</span>
      </div>
      <div class="metric">
        <span class="m-icon">${I('i-bolt')}</span>
        <span class="m-val">12</span>
        <span class="m-lbl">active</span>
      </div>
      <div class="metric urgent">
        <span class="m-icon">${I('i-tray')}</span>
        <span class="m-val">2</span>
        <span class="m-lbl">approvals</span>
      </div>
      <div class="metric">
        <span class="m-icon">${I('i-clock')}</span>
        <span class="m-val">4</span>
        <span class="m-lbl">overdue tasks</span>
      </div>
    </div>
  </section>

  <header class="section-head"><span class="sh-label">Salary range · Engineering</span></header>
  <section class="salary-card">
    <div class="sal-row"><span class="sal-lbl">Min</span><span class="sal-val">₹8,90,000</span><span class="sal-meta">Yash B · SDE 1</span></div>
    <div class="sal-row"><span class="sal-lbl">Median</span><span class="sal-val">₹10,80,000</span><span class="sal-meta">14 engineers</span></div>
    <div class="sal-row"><span class="sal-lbl">Max</span><span class="sal-val">₹18,40,000</span><span class="sal-meta">Naina J · SDE 3</span></div>
  </section>

  <header class="section-head"><span class="sh-label">This week</span></header>
  <ul class="list">
    ${listRow('i-airplane', '2 leave requests', 'Riya · Sahil — your approval')}
    ${listRow('i-clock',    '4 overdue tasks',  'Sprint 47 · review with team')}
    ${listRow('i-calendar', 'Sprint retro',     'Friday 4pm · all hands')}
  </ul>

  <p class="hint-cta">Open <b>Team</b> tab for the full roster (incl. salary column).</p>
  `;
}

/* Setters wired via event delegation in renderBody — see boot below */
function setMeMode(m)          { state.meMode = m;          renderBody(); }
function setOfficeMode(m)      { state.officeMode = m;      renderBody(); }
function setChatFilter(f)      { state.chatFilter = f;      renderBody(); }
function setWorkspaceFilter(f) { state.workspaceFilter = f; renderBody(); }

/* Event delegation: chips and segmented controls inside the body */
document.addEventListener('click', (e) => {
  const ws = e.target.closest('[data-ws]');         if (ws) return setWorkspaceFilter(ws.dataset.ws);
  const cf = e.target.closest('[data-cf]');         if (cf) return setChatFilter(cf.dataset.cf);
  const so = e.target.closest('[data-office]');     if (so) return setOfficeMode(so.dataset.office);
  const sm = e.target.closest('[data-me]');         if (sm) return setMeMode(sm.dataset.me);
});



state.tab = 'home';
render();
