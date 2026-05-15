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

const state = { roleId: 'owner', tab: 'home' };
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
  const m = TAB_META[tabId];
  return `
    <section class="placeholder">
      <div class="pl-icon">${I(m.icon)}</div>
      <h2 class="pl-title">${m.label}</h2>
      <p class="pl-sub">${tabPlaceholder(tabId)}</p>
      <p class="pl-note">v23 prioritizes the role-distinct Home heroes. Deep screens reuse v22 — the tab bar still routes correctly per role.</p>
    </section>`;
}

function tabPlaceholder(tabId) {
  const r = role();
  switch (tabId) {
    case 'approvals':  return `Inbox of decisions awaiting ${r.label}. autoScope: ${r.autoScope}.`;
    case 'office':     return `Self / Manage segmented control. Manage view is gated by company-scope permissions.`;
    case 'workspace':  return `Tasks · meets · delegated · reminders, filtered to ${r.label}'s scope.`;
    case 'branch':     return `Branch-only attendance, exceptions, and approvals. Auto-scoped to ${r.identity.scope}.`;
    case 'team':       return `Department roster · capacity · pending approvals. Includes salary column (team-lead permission).`;
    case 'onboarding': return `Document upload checklist · verification status · HR contact.`;
    case 'punch':      return `Full-screen Punch hero with location + Wi-Fi verification.`;
    case 'chats':      return `Threads · groups · mentions. Scope: ${r.autoScope}.`;
    case 'me':         return `Profile · preferences · sign-out.`;
    default:           return '';
  }
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

state.tab = 'home';
render();
