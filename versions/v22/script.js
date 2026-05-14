/* ─────────────────────────────────────────────────────────────
   EasyDo 365 — v22 (Profile + Office)
   - v21 palette skeleton with a clearer IA split.
   - Avatar moves to the top nav (next to the bell) → opens slim Profile screen.
   - Bottom-bar Me tab is replaced by Office: a Self / Manage segmented view.
   ───────────────────────────────────────────────────────────── */

const I = (id) => `<svg><use href="#${id}"/></svg>`;

/* ─── User identity (replaces the persona switcher) ─── */
const USER = {
  name: 'Sayantan Ghosh',
  role: 'L2 Branch Manager',
  company: 'Liberty Infospace',
  branch: 'Head Office',
  initials: 'SG',
  // "See all, act only if permitted" — these gate ACTIONS, not visibility
  perms: {
    'punch.self':           true,
    'leave.apply':          true,
    'task.create':          true,
    'chat.send':            true,
    'approve.branch':       true,   // L2 can approve branch-scoped requests
    'view.branchPulse':     true,
    'view.payroll.self':    true,
    // Buried admin — only L1 has these
    'admin.webAdmin':       false,
    'admin.bgVerify':       false,
    'admin.changeBranchTiming': false,
    'admin.branchSettings': false,
    'admin.companyDocs':    false,
  },
};
const can = (perm) => !!USER.perms[perm];

/* ─── Permission-deny messages (the bottom-sheet content per locked action) ─── */
const DENY = {
  'admin.webAdmin':           { need:'L1 CEO',          why:'Web Admin is reserved for top-management for bulk operations and audit logs.' },
  'admin.bgVerify':           { need:'L1 CEO',          why:'Background verification kicks off third-party checks and incurs cost — only L1 can run.' },
  'admin.changeBranchTiming': { need:'L1 CEO',          why:'Changing branch hours affects payroll calculations across all branches.' },
  'admin.branchSettings':     { need:'L1 CEO',          why:'Branch settings (geofence, holidays, policy) need company-wide approval.' },
  'admin.companyDocs':        { need:'L1 CEO',          why:'Company-wide document templates are owned by HR + legal.' },
};

/* ─── App state ─── */
const state = {
  tab: 'home',             // home | workspace | punch | chats | office
  screen: null,            // null = tab body; otherwise a SCREENS key
  history: [],             // back stack
  punchedIn: false,
  punchTime: null,         // 'HH:MM' once punched in
  punchedAt: null,         // Date object
  notifCount: 3,
  workspaceFilter: 'all',  // all | tasks | meets | delegated | reminders
  chatFilter: 'all',       // all | unread | groups | mentions
  officeMode: 'self',      // self | manage  — segmented switcher inside Office tab
  company: 'liberty',
  branch:  'head-office',
};

/* ─── Multi-tenant context ─── */
const COMPANIES = [
  { id:'liberty',  name:'Liberty Infospace', logo:'L', tag:'Primary', branches:['head-office','mumbai','bangalore'] },
  { id:'easytech', name:'EasyTech LLP',      logo:'E', tag:'',        branches:['hq-pune'] },
];
const BRANCHES = {
  'head-office': { id:'head-office', name:'Head Office', city:'Ahmedabad',    companyId:'liberty',  open:'09:00–18:00', tz:'Asia/Kolkata' },
  'mumbai':      { id:'mumbai',      name:'Mumbai',      city:'Lower Parel',  companyId:'liberty',  open:'10:00–19:00', tz:'Asia/Kolkata' },
  'bangalore':   { id:'bangalore',   name:'Bangalore',   city:'Indiranagar',  companyId:'liberty',  open:'09:30–18:30', tz:'Asia/Kolkata' },
  'hq-pune':     { id:'hq-pune',     name:'HQ',          city:'Pune',         companyId:'easytech', open:'10:00–19:00', tz:'Asia/Kolkata' },
};
const currentCompany = () => COMPANIES.find(c => c.id === state.company);
const currentBranch  = () => BRANCHES[state.branch];

/* ─── Format helpers ─── */
const pad = (n) => String(n).padStart(2,'0');
function nowHHMM(d=new Date()){ return `${pad(d.getHours())}:${pad(d.getMinutes())}` }
function elapsed(from){
  if(!from) return '0h 0m';
  const ms = Date.now() - from.getTime();
  const m = Math.max(0, Math.floor(ms/60000));
  const h = Math.floor(m/60);
  return `${h}h ${m%60}m`;
}

/* ═════════════════════════════════════════════════════════════
   CHROME — Nav, Tabs
   ═════════════════════════════════════════════════════════════ */
function renderNav(){
  const nav = document.getElementById('nav');
  const bell = `<div class="nav-bell" onclick="openNotif()">${I('i-bell')}${state.notifCount?`<div class="nav-bell-badge">${state.notifCount}</div>`:''}</div>`;
  // v22: Profile pill sits at the rightmost position (after the bell).
  // Hidden when the user is already on the Profile screen (would be a no-op).
  const profile = (state.screen === 'profile') ? '' :
    `<div class="nav-profile" onclick="navigate('profile')" aria-label="Profile">
       <span class="np-av">${USER.initials}</span>
     </div>`;
  // Order: bell first, then profile → profile becomes the rightmost item.
  const rightCluster = `${bell}${profile}`;

  if (state.screen){
    const meta = SCREENS[state.screen];
    nav.innerHTML = `
      <div class="nav-back" onclick="goBack()">${I('i-back')}</div>
      <div class="nav-title">${meta?.title || ''}</div>
      ${rightCluster}
    `;
    return;
  }

  // Default tab body — company + branch chip stays on every tab (incl. Office).
  // The Office tab's Self / Manage switcher lives as a band BELOW the nav (see officeBody).
  const co = currentCompany();
  const br = currentBranch();
  nav.innerHTML = `
    <div class="nav-switcher" onclick="openSwitcherSheet()">
      <div class="ns-logo">${co.logo}</div>
      <div class="ns-l">
        <div class="ns-co">${co.name}</div>
        <div class="ns-br">${I('i-bldg')}<span>${br.name}, ${br.city}</span></div>
      </div>
      <div class="ns-caret">${I('i-chev-d')}</div>
    </div>
    ${rightCluster}
  `;
}

function setOfficeMode(mode){
  state.officeMode = mode;
  render();
}

function renderTabs(){
  // v22 IA: Home · Workspace · Punch (center, elevated) · Chats · Office
  // ("Me" lives in the top-right of the nav now; Office covers work-life.)
  const tabs = [
    ['home',      'Home',      'i-home',  false],
    ['workspace', 'Workspace', 'i-work',  false],
    ['punch',     'Punch',     'i-punch', true],   // ← center, elevated
    ['chats',     'Chats',     'i-chat',  false],
    ['office',    'Office',    'i-bldg',  false],
  ];
  document.getElementById('tabs').innerHTML = tabs.map(([id,label,icon,center])=>`
    <div class="tab ${center?'punch-tab':''} ${state.tab===id?'active':''}" onclick="setTab('${id}')">
      ${I(icon)}<span>${label}</span>
    </div>
  `).join('');
}

function setTab(id){
  state.tab = id; state.screen = null; state.history = [];
  render();
}
function navigate(screenId){
  if (!SCREENS[screenId]) return toast('Coming soon');
  state.history.push({ tab: state.tab, screen: state.screen });
  state.screen = screenId;
  render();
}
function goBack(){
  const prev = state.history.pop();
  if (prev){ state.tab = prev.tab; state.screen = prev.screen; }
  else { state.screen = null; }
  render();
}

/* ═════════════════════════════════════════════════════════════
   TAB BODIES
   ═════════════════════════════════════════════════════════════ */

/* ── HOME — shortcut launcher (essential features + at-a-glance info) ── */
function homeBody(){
  const co = currentCompany(); const br = currentBranch();
  return `
    <div class="greet">
      <p class="greet-hi">Good morning</p>
      <h1 class="greet-name">Sayantan</h1>
    </div>

    <div class="home-punch-mini" onclick="setTab('punch')">
      ${state.punchedIn
        ? `<div class="hpm-dot in"></div>
           <div class="hpm-l">
             <div class="hpm-t">Punched in at ${state.punchTime}</div>
             <div class="hpm-s">Elapsed ${elapsed(state.punchedAt)} · ${br.name}</div>
           </div>`
        : `<div class="hpm-dot out"></div>
           <div class="hpm-l">
             <div class="hpm-t">Ready to punch in</div>
             <div class="hpm-s">Tap to head over · ${br.name} · ${br.open}</div>
           </div>`}
      <div class="hpm-r">${I('i-chev-r')}</div>
    </div>

    <div class="home-stats">
      <div class="home-stat" onclick="setTab('workspace')">
        <div class="home-stat-i indigo">${I('i-tasks')}</div>
        <div class="home-stat-v">3</div>
        <div class="home-stat-l">Tasks today</div>
      </div>
      <div class="home-stat" onclick="setTab('chats')">
        <div class="home-stat-i amber">${I('i-chat')}</div>
        <div class="home-stat-v">3</div>
        <div class="home-stat-l">Unread</div>
      </div>
      <div class="home-stat" onclick="navigate('approvals')">
        <div class="home-stat-i">${I('i-approve')}</div>
        <div class="home-stat-v">5</div>
        <div class="home-stat-l">Approvals</div>
      </div>
    </div>

    <div class="home-announce" onclick="navigate('announcements')">
      <div class="ha-l">
        <div class="ha-tag">${co.name} · Announcement</div>
        <div class="ha-t">Quarterly all-hands on Friday 4 PM</div>
      </div>
      <div class="ha-r">${I('i-chev-r')}</div>
    </div>

    <ul class="qa-list">
      <li class="qa-row" onclick="navigate('my-requests')">
        <div class="qa-icon sage">${I('i-doc')}</div>
        <div class="qa-l">
          <div class="qa-t">Requests · 2 pending</div>
          <div class="qa-s">Apply leave · OT · advance · reimbursement</div>
        </div>
        <div class="qa-r">${I('i-chev-r')}</div>
      </li>
      <li class="qa-row" onclick="toast('Send birthday wish to Rounik')">
        <div class="qa-icon">🎂</div>
        <div class="qa-l">
          <div class="qa-t">Rounik's birthday today</div>
          <div class="qa-s">Send a wish — it's their day at work</div>
        </div>
        <div class="qa-r">${I('i-chev-r')}</div>
      </li>
    </ul>
    <div style="height:40px"></div>
  `;
}

/* ── PUNCH — center tab: hero band + status rows + location map + RFID weekly ── */
function punchBody(){
  return `
    ${punchHeroBand()}
    ${punchStatusRows()}

    <div class="sec">
      <div class="sec-h">
        <h2 class="sec-t">Location timeline</h2>
        <span class="sec-meta">Verified · 28m from center</span>
      </div>
    </div>
    ${locationMap()}

    <div class="sec">
      <div class="sec-h">
        <h2 class="sec-t">Attendance · This week</h2>
        <span class="sec-meta">Week 19</span>
      </div>
    </div>
    ${rfidCard()}
    <div style="height:40px"></div>
  `;
}

function locationMap(){
  return `
    <div class="loc-map" onclick="toast('Full map — v9.5')">
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
        <!-- Street grid (faint) -->
        <path d="M0,72 L320,82" stroke="rgba(60,40,20,0.10)" stroke-width="1" fill="none"/>
        <path d="M0,138 L320,146" stroke="rgba(60,40,20,0.10)" stroke-width="1" fill="none"/>
        <path d="M70,0 L66,200" stroke="rgba(60,40,20,0.10)" stroke-width="1" fill="none"/>
        <path d="M230,0 L234,200" stroke="rgba(60,40,20,0.10)" stroke-width="1" fill="none"/>
        <path d="M0,30 Q160,40 320,32" stroke="rgba(60,40,20,0.07)" stroke-width="14" fill="none" stroke-linecap="round"/>
        <path d="M0,180 Q160,190 320,178" stroke="rgba(60,40,20,0.05)" stroke-width="20" fill="none" stroke-linecap="round"/>
        <!-- Geofence (dashed indigo) -->
        <circle cx="160" cy="100" r="62" fill="rgba(94,106,210,0.10)" stroke="rgba(94,106,210,0.50)" stroke-width="1.5" stroke-dasharray="5,4"/>
        <!-- Office building marker -->
        <g transform="translate(160 100)">
          <circle r="16" fill="rgba(94,106,210,0.22)"/>
          <circle r="9" fill="#5E6AD2"/>
          <path d="M-4 -3 L-4 4 L4 4 L4 -3 L0 -7 Z" fill="#FFFCF6" stroke="none"/>
          <rect x="-1.5" y="0" width="3" height="4" fill="#5E6AD2"/>
        </g>
        <text x="160" y="138" text-anchor="middle" font-size="10" font-weight="700" fill="#3949AB" font-family="-apple-system,sans-serif" letter-spacing="0.10em">HEAD OFFICE</text>
        <!-- Surrounding labels -->
        <text x="40" y="42" font-size="9" fill="rgba(31,26,20,0.45)" font-family="-apple-system,sans-serif">NIIT Kolkata</text>
        <text x="250" y="178" font-size="9" fill="rgba(31,26,20,0.45)" font-family="-apple-system,sans-serif" text-anchor="end">Hazra Centre</text>
        <text x="40" y="180" font-size="9" fill="rgba(31,26,20,0.45)" font-family="-apple-system,sans-serif">Bishop Lefroy Rd</text>
        <!-- User pulse marker (you-are-here) -->
        <g transform="translate(176 92)">
          <circle r="6" fill="rgba(94,106,210,0.30)">
            <animate attributeName="r" values="4;9;4" dur="2.4s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.6;0.0;0.6" dur="2.4s" repeatCount="indefinite"/>
          </circle>
          <circle r="4" fill="#FFFCF6" stroke="#5E6AD2" stroke-width="2.2"/>
        </g>
      </svg>
      <div class="lm-overlay">
        <div class="lm-tag">${I('i-check')} Verified</div>
        <div class="lm-l">
          <div class="lm-t">Head Office, Ahmedabad</div>
          <div class="lm-s">28m from center · GPS ±6m</div>
        </div>
      </div>
    </div>
  `;
}

function punchHeroBand(){
  const inMode = state.punchedIn;
  const inAt = inMode ? state.punchTime : '—';
  const total = inMode ? elapsed(state.punchedAt) : '0h 0m';
  return `
    <div class="punch-band" id="punchBand">
      <div class="punch-meta">
        <span class="pill"><span class="dot"></span> Branch open · 09:00–18:00</span>
        <span class="pill">${inMode ? 'Punched in' : 'Flex hrs'}</span>
      </div>
      <div class="punch-circle ${inMode?'in':''}" id="punchCircle" onclick="togglePunch()">
        <div class="punch-time">${inMode ? state.punchTime : nowHHMM()}</div>
        <div class="punch-label">${inMode ? 'Out' : 'Punch'}</div>
      </div>
      <div class="punch-after">
        ${inMode
          ? `<div class="punch-elapsed"><span class="pe-l">Elapsed</span><span id="punchElapsed">${elapsed(state.punchedAt)}</span></div>
             <p class="punch-help">since ${state.punchTime} · tap to punch out</p>`
          : `<p class="punch-help">When you’re ready</p>`
        }
      </div>
      <div class="punch-trio">
        <div class="tc">
          <div class="tc-icon">${I('i-clock')}</div>
          <div class="tc-v">${inAt}</div>
          <div class="tc-l">Punch in</div>
        </div>
        <div class="tc">
          <div class="tc-icon">${I('i-clock')}</div>
          <div class="tc-v">—:—</div>
          <div class="tc-l">Punch out</div>
        </div>
        <div class="tc">
          <div class="tc-icon">${I('i-clock')}</div>
          <div class="tc-v" id="punchTotal">${total}</div>
          <div class="tc-l">Total</div>
        </div>
      </div>
    </div>
  `;
}

function punchStatusRows(){
  return `
    <div class="punch-status">
      <div class="punch-status-row">
        <div class="psr-i">${I('i-check')}</div>
        <div class="psr-l">
          <div class="psr-t">You're present today</div>
          <div class="psr-s">Marked at ${state.punchedIn ? state.punchTime : '—'} · Flexible hours</div>
        </div>
      </div>
      <div class="punch-status-row">
        <div class="psr-i">${I('i-pin')}</div>
        <div class="psr-l">
          <div class="psr-t">Verified location</div>
          <div class="psr-s">Head Office, Ahmedabad · 28m radius · within geofence</div>
        </div>
      </div>
      <div class="punch-status-row">
        <div class="psr-i muted">${I('i-clock')}</div>
        <div class="psr-l">
          <div class="psr-t">Working hours · 09H : 00M</div>
          <div class="psr-s">Overtime not allowed · Mon–Fri</div>
        </div>
      </div>
    </div>
  `;
}

function rfidCard(){
  // Static prior days, today depends on state.punchedIn
  const days = [
    { d:'MON', i:'09:08', o:'18:42', past:true },
    { d:'TUE', i:'09:12', o:'19:01', past:true },
    { d:'WED', i:state.punchedIn?state.punchTime:null, o:null, today:true },
    { d:'THU', future:true },
    { d:'FRI', future:true },
  ];
  const row = (r) => {
    if (r.future) return `
      <div class="rfid-row">
        <span class="rfid-day">${r.d}</span>
        <span class="rfid-times"><span class="ph">─ ─ ─ ─ ─ ─ ─ ─</span></span>
      </div>`;
    if (r.today){
      return `
        <div class="rfid-row today" id="rfidToday">
          <span class="rfid-day">${r.d}</span>
          <span class="rfid-times" id="rfidTodayTimes">
            ${r.i
              ? `<span class="stamp">${I('i-check')} Present · ${r.i}</span>`
              : `<span class="ph">awaiting punch</span>`
            }
          </span>
        </div>`;
    }
    return `
      <div class="rfid-row">
        <span class="rfid-day">${r.d}</span>
        <span class="rfid-times">
          <span>${r.i}</span><span class="dash">─</span><span>${r.o}</span>
        </span>
      </div>`;
  };
  return `
    <div class="rfid-card">
      <div class="rfid-h">
        <span class="rfid-h-l">Attendance card · 11 May–15 May</span>
        <span class="rfid-h-r">${USER.branch}</span>
      </div>
      ${days.map(row).join('')}
    </div>
  `;
}

function togglePunch(){
  if (!can('punch.self')) return openDeny({ need:'Employee', why:'Punch in/out requires an HRMS-active employee account.' });
  const wasIn = state.punchedIn;
  if (!wasIn){
    const inAt = nowHHMM();                 // capture locally so a rapid re-tap can't null the toast
    state.punchedIn = true;
    state.punchTime = inAt;
    state.punchedAt = new Date();
    animateStamp();
    setTimeout(()=>{ render(); toast(`Punched in at ${inAt}`); }, 720);
  } else {
    const outTime = nowHHMM();
    state.punchedIn = false;
    state.punchTime = null;
    state.punchedAt = null;
    render();
    toast(`Punched out at ${outTime}`);
  }
}

/* Animate stamp from circle center to today's RFID row */
function animateStamp(){
  const circle = document.getElementById('punchCircle');
  const target = document.getElementById('rfidToday');
  if (!circle || !target) return;
  const phone = document.querySelector('.phone');
  const cb = circle.getBoundingClientRect();
  const tb = target.getBoundingClientRect();
  const pb = phone.getBoundingClientRect();
  // Anchor inside .phone (relative)
  const startX = cb.left + cb.width/2 - pb.left;
  const startY = cb.top  + cb.height/2 - pb.top;
  const endX   = tb.left + tb.width*0.6 - pb.left;
  const endY   = tb.top  + tb.height/2  - pb.top;
  const burst = document.createElement('div');
  burst.className = 'stamp-burst';
  burst.innerHTML = `${I('i-check')} Present · ${nowHHMM()}`;
  burst.style.left = startX+'px';
  burst.style.top  = startY+'px';
  burst.style.setProperty('--stamp-x', `${endX-startX-burst.offsetWidth/2}px`);
  burst.style.setProperty('--stamp-y', `${endY-startY}px`);
  phone.appendChild(burst);
  setTimeout(()=> burst.remove(), 750);
}

/* ── WORKSPACE — Tasks + Meets unified (calendar + filter chips + list) ── */
function workspaceBody(){
  const filters = [
    ['all',       'All',       5],
    ['tasks',     'Tasks',     3],
    ['meets',     'Meets',     2],
    ['delegated', 'Delegated', 1],
    ['reminders', 'Reminders', 0],
  ];
  return `
    ${searchBar('Search tasks, meets, reminders')}
    <div class="chips">
      ${filters.map(([k,l,c])=>`
        <div class="chip ${state.workspaceFilter===k?'active':''}" onclick="setWorkspaceFilter('${k}')">${l}${c>0?`<span class="ct">${c}</span>`:''}</div>
      `).join('')}
    </div>

    <div class="cal-h">
      <div class="cal-month">May 2026 ${I('i-chev-d')}</div>
      <div class="cal-meta">Week 19</div>
    </div>
    ${weekStrip()}

    <div class="allday-h">All day</div>
    <div class="allday-cards">
      <div class="allday-card birthday" onclick="toast('Send birthday wish to Rounik')">
        <div class="ac-icon">🎂</div>
        <div class="ac-l">
          <div class="ac-t">Rounik Tarafder</div>
          <div class="ac-s">Send birthday wish — it's their day at work</div>
        </div>
        <div class="ac-tag">Birthday</div>
      </div>
      <div class="allday-card review" onclick="toast('Review pending tasks')">
        <div class="ac-icon">${I('i-check')}</div>
        <div class="ac-l">
          <div class="ac-t">Tasks done, awaiting review (1)</div>
          <div class="ac-s">Your delegated task is done — review it to close out.</div>
        </div>
        <div class="ac-tag">Delegated</div>
      </div>
    </div>

    <div class="allday-h">Today</div>
    ${hourGrid()}

    <div style="height:80px"></div>
  `;
}
function setWorkspaceFilter(k){ state.workspaceFilter = k; render(); }

function weekStrip(){
  const labels = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const todayIdx = 2; // Tuesday for the mock
  const startDay = 10;
  const events = [0,1,0,2,4,0,0]; // event count per day
  return `
    <div class="week-strip">
      ${labels.map((l,i)=>`
        <div class="wd ${i===todayIdx?'today':''}">
          <span class="wd-l">${l[0]}</span>
          <span class="wd-n">${startDay+i}</span>
          ${events[i]>0?`<span class="wd-dot"></span><span class="wd-n-cnt">${events[i]}</span>`:''}
        </div>
      `).join('')}
    </div>
  `;
}

function hourGrid(){
  // Mock day schedule with events at certain hours
  const slots = [
    { t:'09:00', items: [] },
    { t:'10:00', items: [{ kind:'meet', title:'1:1 with Amulya', meta:'30 min · Meet' }] },
    { t:'11:00', items: [] },
    { t:'12:00', items: [], now:true },
    { t:'01:00', items: [{ kind:'task', title:'Submit timesheet for week 19', meta:'P2 · Mine' }] },
    { t:'02:00', items: [] },
    { t:'03:00', items: [{ kind:'meet', title:'Liberty dev sync', meta:'60 min · Meet' }] },
    { t:'04:00', items: [{ kind:'reminder', title:'Approve travel reimbursement', meta:'Reminder · ₹12,400' }] },
    { t:'05:00', items: [] },
  ];
  return `
    <div class="hour-grid">
      ${slots.map(s=>`
        <div class="hour-row ${s.now?'now':''}" style="position:relative">
          <div class="hr-t">${s.t}</div>
          <div class="hr-events">
            ${s.items.map(it=>`
              <div class="hour-event ${it.kind}">
                <div class="he-bar"></div>
                <div>
                  <div class="he-t">${it.title}</div>
                  <div class="he-s">${it.meta}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function toggleTask(id, el){
  el.classList.toggle('done');
  el.closest('.task-row')?.classList.toggle('done');
}

function searchBar(placeholder){
  return `
    <div class="search-bar">
      ${I('i-search')}
      <input type="search" placeholder="${placeholder}" />
    </div>
  `;
}

/* ── CHATS — search + filters + EasyDo AI pinned + read receipts ── */
function chatsBody(){
  const filters = [
    ['all',     'All',     0],
    ['unread',  'Unread',  3],
    ['groups',  'Groups',  0],
    ['mentions','Mentions',1],
  ];
  const ai = { who:'EasyDo AI', preview:'How can I help you today?', time:'now', init:'AI', ai:true };
  const chats = [
    { who:'Amulya Reddy',  preview:'Sent you the updated client deck. Anything to flag?', time:'09:02', unread:2, init:'AR', sent:false },
    { who:'Rounik Sen',    preview:'Heads up — server migration starts at 11am.',        time:'08:48', unread:1, init:'RS', sent:false },
    { who:'#team-eng',     preview:'pushed the auth fix to staging',                     time:'08:14', unread:0, init:'#E', sent:true, seen:true, tag:'work' },
    { who:'Priya Patel',   preview:'Loved the v8 mockup. v9 next?',                       time:'Yesterday', unread:0, init:'PP', sent:true, seen:true },
    { who:'Ui Testing',    preview:'~Sukanta Goswami', icon:'meet', time:'Yesterday', unread:0, init:'UT', sent:false },
    { who:'#announcements',preview:'Quarterly all-hands on Friday 4 PM',                  time:'Mon', unread:0, init:'#A', sent:false },
  ];

  const chatRow = (c) => {
    const tickHtml = c.sent
      ? `<span class="read-tick ${c.seen?'seen':''}" style="font-family:-apple-system,sans-serif">${c.seen?'✓✓':'✓'}</span>`
      : '';
    const iconHtml = c.icon === 'meet' ? `<span class="ic">🤝</span>` : '';
    const tagHtml = c.tag ? `<span class="nm-flag ${c.tag}">${c.tag}</span>` : '';
    return `
      <li class="list-row chat-row ${c.ai?'ai':''}" onclick="toast('Chat thread — v9.4')">
        <div class="chat-av">${c.init}</div>
        <div class="chat-l">
          <div class="chat-name">${c.who} ${c.ai?'<span class="nm-flag ai">AI</span>':''}${tagHtml}</div>
          <div class="chat-preview">${tickHtml}${iconHtml}<span>${c.preview}</span></div>
        </div>
        <div class="list-r">${c.unread?`<span style="color:var(--sage);font-weight:700;font-feature-settings:'tnum'">${c.unread}</span>`:''}<span>${c.time}</span></div>
      </li>
    `;
  };

  return `
    ${searchBar('Search people, groups, messages')}
    <div class="chips">
      ${filters.map(([k,l,c])=>`
        <div class="chip ${state.chatFilter===k?'active':''}" onclick="setChatFilter('${k}')">${l}${c>0?`<span class="ct">${c}</span>`:''}</div>
      `).join('')}
    </div>

    <div class="ai-pinned-h">Pinned</div>
    <ul class="list" style="margin:0">${chatRow(ai)}</ul>

    <div class="ai-pinned-h">Recent</div>
    <ul class="list" style="margin:0">${chats.map(chatRow).join('')}</ul>
  `;
}
function setChatFilter(k){ state.chatFilter = k; render(); }

/* ── TEAM ── */
function teamBody(){
  return `
    <div class="team-hero">
      <div class="sec-h">
        <h2 class="sec-t">Team · Head Office</h2>
        <span class="sec-meta">42 members</span>
      </div>
    </div>

    <div class="att-summary">
      <div class="att-summary-cell"><div class="as-v sage">38</div><div class="as-l">Present</div></div>
      <div class="att-summary-cell"><div class="as-v amber">2</div><div class="as-l">Late</div></div>
      <div class="att-summary-cell"><div class="as-v">4</div><div class="as-l">Leave</div></div>
      <div class="att-summary-cell"><div class="as-v">0</div><div class="as-l">Absent</div></div>
    </div>

    <div class="team-actions">
      <div class="team-action" onclick="navigate('approvals')">
        <div class="ta-i">${I('i-approve')}</div>
        <div class="ta-t">Approve</div>
        <div class="ta-s">5 pending requests</div>
      </div>
      <div class="team-action" onclick="toast('Branch pulse — v9.1')">
        <div class="ta-i">${I('i-pulse')}</div>
        <div class="ta-t">Branch pulse</div>
        <div class="ta-s">38 in · 4 on leave</div>
      </div>
    </div>

    <div class="section-head"><h2>Manager tools</h2></div>
    <ul class="list">
      ${managerToolRow('Approvals',       'Leave · OT · advance',           true, ()=>navigate('approvals'))}
      ${managerToolRow('Branch pulse',    'Live attendance map',            true, ()=>toast('Branch pulse — v9.1'))}
      ${managerToolRow('More tools',      'Web Admin · BG verify · admin',  true, ()=>navigate('settings-admin'))}
    </ul>
  `;
}
function managerToolRow(t, s, allowed, onClickName){
  return `
    <li class="list-row ${allowed?'':'disabled'}" onclick="(${onClickName.toString()})()">
      <div class="list-l">
        <div class="list-t">${t}</div>
        <div class="list-s">${s}</div>
      </div>
      <div class="list-r">${allowed?I('i-chev-r'):`<span class="lock-i">${I('i-lock')}</span>`}</div>
    </li>
  `;
}

/* ── OFFICE — Self / Manage segmented tab (v22).
   Self  → personal records (salary, attendance, branch, my records).
   Manage → team-lead view; reuses teamBody().
   The Self / Manage segmented control sits as a band right below the nav,
   above the body content. Identity moved to the Profile sub-screen,
   opened from the avatar pill in the top-right of the nav. */
function officeBody(){
  const m = state.officeMode;
  const seg = `
    <div class="office-seg-wrap">
      <div class="office-seg" role="tablist" aria-label="Office mode">
        <button class="os-opt ${m==='self'?'active':''}"   onclick="setOfficeMode('self')"   role="tab" aria-selected="${m==='self'}">Me</button>
        <button class="os-opt ${m==='manage'?'active':''}" onclick="setOfficeMode('manage')" role="tab" aria-selected="${m==='manage'}">My Team</button>
      </div>
    </div>
  `;
  return seg + (m === 'manage' ? teamBody() : selfBody());
}

function selfBody(){
  return `
    <div class="section-head"><h2>Salary · May 2026</h2></div>
    ${salaryDonut(98000, 5550, 92450)}

    <div class="section-head"><h2>Attendance · This month</h2></div>
    <div class="att-summary">
      <div class="att-summary-cell"><div class="as-v sage">21</div><div class="as-l">Present</div></div>
      <div class="att-summary-cell"><div class="as-v">0</div><div class="as-l">Half day</div></div>
      <div class="att-summary-cell"><div class="as-v amber">0</div><div class="as-l">Late</div></div>
      <div class="att-summary-cell"><div class="as-v">1</div><div class="as-l">Leave</div></div>
    </div>

    <div class="section-head"><h2>Branch</h2></div>
    <div class="branch-card" onclick="navigate('settings-branch')">
      <div class="bc-clock">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-linecap="round">
          <circle cx="24" cy="24" r="21" stroke-width="2"/>
          <line x1="24" y1="6"  x2="24" y2="9"  stroke-width="1.6"/>
          <line x1="42" y1="24" x2="39" y2="24" stroke-width="1.2"/>
          <line x1="24" y1="42" x2="24" y2="39" stroke-width="1.2"/>
          <line x1="6"  y1="24" x2="9"  y2="24" stroke-width="1.2"/>
          <line x1="24" y1="24" x2="15.5" y2="19" stroke-width="2.4"/>
          <line x1="24" y1="24" x2="34"   y2="17" stroke-width="1.6"/>
          <circle cx="24" cy="24" r="1.8" fill="currentColor" stroke="none"/>
        </svg>
      </div>
      <div class="bc-l">
        <div class="bc-t">${USER.branch}, Ahmedabad</div>
        <div class="bc-s">09:00 AM — 18:00 PM · Mon–Fri</div>
        <div class="bc-tz">Asia / Kolkata</div>
      </div>
      <div>${I('i-chev-r')}</div>
    </div>

    <div class="section-head"><h2>My records</h2></div>
    <ul class="list">
      ${meRow('Requests',   '2 pending · leave · OT · advance · reimburse', 'my-requests', I('i-doc'))}
      ${meRow('Payslips',   '12 total · 1 unread', 'me-payroll',   I('i-rupee'))}
      ${meRow('Attendance', '21 present · 0 late this month','me-attendance', I('i-clock'))}
      ${meRow('Documents',  'Offer letter · PAN · Aadhaar','documents',     I('i-doc'))}
      ${meRow('Handbook',   'Policies · benefits · guidelines','handbook',  I('i-doc'))}
    </ul>
    <div style="height:40px"></div>
  `;
}

function salaryDonut(earning, deduction, netPay){
  // Donut math — circumference of r=36 stroke
  const C = 2 * Math.PI * 36;
  const total = earning;
  const earnFrac = (earning - deduction) / total;
  const dedFrac  = deduction / total;
  const earnLen  = C * earnFrac;
  const dedLen   = C * dedFrac;
  const gap      = 2;
  return `
    <div class="salary-card" onclick="navigate('me-payroll')">
      <div class="sc-donut">
        <svg viewBox="0 0 86 86">
          <circle cx="43" cy="43" r="36" class="sc-ring-bg"/>
          <circle cx="43" cy="43" r="36" class="sc-ring-earn"
            stroke-dasharray="${earnLen-gap} ${C-(earnLen-gap)}"
            stroke-dashoffset="0"/>
          <circle cx="43" cy="43" r="36" class="sc-ring-ded"
            stroke-dasharray="${dedLen-gap} ${C-(dedLen-gap)}"
            stroke-dashoffset="${-(earnLen)}"/>
        </svg>
        <div class="sc-donut-c">Net</div>
      </div>
      <div class="sc-l">
        <p class="sc-h">Take-home · May 2026</p>
        <div class="sc-amt">₹ ${netPay.toLocaleString('en-IN')}</div>
        <div class="sc-sub">Credits on May 30 · 24 days</div>
        <div class="sc-legend">
          <span><span class="swatch earn"></span>Earn ₹${earning.toLocaleString('en-IN')}</span>
          <span><span class="swatch ded"></span>Deduct ₹${deduction.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  `;
}
function meRow(t, s, screen, icon){
  return `
    <li class="list-row" onclick="navigate('${screen}')">
      <div class="qa-icon">${icon}</div>
      <div class="list-l">
        <div class="list-t">${t}</div>
        <div class="list-s">${s}</div>
      </div>
      <div class="list-r">${I('i-chev-r')}</div>
    </li>
  `;
}

/* ═════════════════════════════════════════════════════════════
   SUB-SCREENS
   ═════════════════════════════════════════════════════════════ */
const SCREENS = {};

SCREENS['tasks-detail'] = {
  title: 'All tasks',
  render: workspaceBody,
};

/* ── PROFILE — slim identity sheet (v22).
   Only profile-related stuff: identity card, account preferences, admin (locked
   for non-L1), sign out. Personal records and salary live in Office → Self. */
SCREENS['profile'] = {
  title: 'Profile',
  render: () => `
    <div class="me-prof">
      <div class="me-prof-av">${USER.initials}</div>
      <div class="me-prof-l">
        <div class="me-prof-n">${USER.name}</div>
        <div class="me-prof-r">${USER.role} · ${USER.branch}</div>
        <span class="me-prof-tag">${I('i-check')} Verified</span>
      </div>
    </div>

    <div class="section-head"><h2>Account</h2></div>
    <ul class="list">
      <li class="list-row" onclick="navigate('settings')">
        <div class="list-l"><div class="list-t">Preferences</div><div class="list-s">Notifications · appearance · language</div></div>
        <div class="list-r">${I('i-chev-r')}</div>
      </li>
      <li class="list-row" onclick="navigate('settings-admin')">
        <div class="list-l"><div class="list-t">Admin</div><div class="list-s">Branch settings · Web Admin · BG verify</div></div>
        <div class="list-r">${I('i-chev-r')}</div>
      </li>
      <li class="list-row" onclick="toast('Sign-out flow — v9.4')">
        <div class="list-l"><div class="list-t" style="color:var(--red)">Sign out</div></div>
      </li>
    </ul>
    <div style="height:40px"></div>
  `,
};

SCREENS['apply-leave'] = {
  title: 'Apply leave',
  render: () => `
    <form class="form" onsubmit="event.preventDefault();submitLeave()">
      <div class="field-row">
        <div class="field"><label>Type</label>
          <select><option>Casual leave</option><option>Sick leave</option><option>Earned leave</option></select>
        </div>
      </div>
      <div class="field-row">
        <div class="field"><label>From</label><input type="date" value="2026-05-15"></div>
        <div class="field"><label>To</label><input type="date" value="2026-05-16"></div>
      </div>
      <div class="field"><label>Reason</label><textarea rows="3" placeholder="Family function out of town"></textarea></div>
      <div class="field"><label>Notify</label><input placeholder="@amulya, @rounik"></div>
      <button type="submit" class="btn btn-primary btn-block">Submit request</button>
    </form>
  `,
};
function submitLeave(){ toast('Leave request submitted'); setTimeout(goBack, 600); }

SCREENS['approvals'] = {
  title: 'Approvals · 5 pending',
  render: () => {
    const items = [
      { who:'Amulya Reddy', what:'Casual leave · 2 days', when:'15 May–16 May' },
      { who:'Rounik Sen',   what:'Overtime · 3h',         when:'12 May' },
      { who:'Priya Patel',  what:'Advance ₹15,000',       when:'Submitted yesterday' },
      { who:'Karan Mehta',  what:'Reimburse ₹2,200',      when:'Submitted 2 days ago' },
      { who:'Riya Shah',    what:'Sick leave · 1 day',    when:'13 May' },
    ];
    return `
      <ul class="list">
        ${items.map(x=>`
          <li class="list-row" onclick="approveOne('${x.who}')">
            <div class="chat-av">${x.who.split(' ').map(s=>s[0]).join('')}</div>
            <div class="list-l">
              <div class="list-t">${x.who}</div>
              <div class="list-s">${x.what} · ${x.when}</div>
            </div>
            <div class="list-r"><span style="color:var(--sage);font-weight:700;font-size:13px">Approve</span></div>
          </li>
        `).join('')}
      </ul>
    `;
  },
};
function approveOne(who){ toast(`Approved · ${who}`); }

/* ── Unified switcher sheet (single-tap from nav chip) ──
   Shows Company + Branch sections in one place. Per-row gear shortcuts to that
   scope's settings screen. Add-company and add-branch affordances at the end. */
function openSwitcherSheet(){
  const co = currentCompany();

  const companyRows = COMPANIES.map(c => {
    const sel = c.id === state.company;
    return `
      <div class="sheet-list-row ${sel?'selected':''}" onclick="selectCompany('${c.id}')">
        <div class="sl-logo">${c.logo}</div>
        <div class="sl-l">
          <div class="sl-t">${c.name}</div>
          <div class="sl-s">${c.branches.length} branch${c.branches.length>1?'es':''}${c.tag?` · ${c.tag}`:''}</div>
        </div>
        <div class="sl-r">
          ${sel?`<span class="sl-check">${I('i-check')}</span>`:''}
          <div class="sl-gear" onclick="event.stopPropagation();closeSheet();setTimeout(()=>navigate('settings-company'),200)" title="Company settings">${I('i-gear')}</div>
        </div>
      </div>
    `;
  }).join('');

  const branchRows = co.branches.map(bid => {
    const b = BRANCHES[bid];
    const sel = bid === state.branch;
    return `
      <div class="sheet-list-row ${sel?'selected':''}" onclick="selectBranch('${b.id}')">
        <div class="sl-logo branch">${I('i-bldg')}</div>
        <div class="sl-l">
          <div class="sl-t">${b.name}, ${b.city}</div>
          <div class="sl-s">${b.open} · ${b.tz}</div>
        </div>
        <div class="sl-r">
          ${sel?`<span class="sl-check">${I('i-check')}</span>`:''}
          <div class="sl-gear" onclick="event.stopPropagation();closeSheet();setTimeout(()=>navigate('settings-branch'),200)" title="Branch settings">${I('i-gear')}</div>
        </div>
      </div>
    `;
  }).join('');

  openSheet({
    title:'Switch context',
    html:`
      <div class="sheet-divider">Company</div>
      <div class="sheet-list">
        ${companyRows}
        <div class="sheet-list-row add" onclick="closeSheet();setTimeout(()=>toast('Add company — v9.6'),200)">
          <div class="sl-logo branch">${I('i-plus')}</div>
          <div class="sl-l"><div class="sl-t">Add another company</div><div class="sl-s">Join via invite or admin code</div></div>
        </div>
      </div>

      <div class="sheet-divider">${co.name} · branches</div>
      <div class="sheet-list">
        ${branchRows}
        <div class="sheet-list-row add" onclick="closeSheet();setTimeout(()=>toast('Add branch — v9.6'),200)">
          <div class="sl-logo branch">${I('i-plus')}</div>
          <div class="sl-l"><div class="sl-t">Add another branch</div><div class="sl-s">Add a new location to ${co.name}</div></div>
        </div>
      </div>
    `,
  });
}
function selectCompany(id){
  if (id === state.company) { closeSheet(); return; }
  state.company = id;
  const co = COMPANIES.find(c => c.id === id);
  state.branch = co.branches[0];
  closeSheet();
  setTimeout(()=>{ render(); toast(`Switched to ${co.name}`); }, 200);
}
function selectBranch(id){
  if (id === state.branch) { closeSheet(); return; }
  state.branch = id;
  closeSheet();
  setTimeout(()=>{ render(); toast(`Switched to ${BRANCHES[id].name}`); }, 200);
}

SCREENS['me-payroll'] = {
  title: 'Payslip · May 2026',
  render: () => `
    <div class="me-payroll" style="margin:14px 16px">
      <p class="me-payroll-h">Estimated take-home</p>
      <div class="me-payroll-amt">₹ 92,450</div>
      <p class="me-payroll-sub">Credits on May 30, 2026</p>
    </div>
    <div class="section-head"><h2>Breakdown</h2></div>
    <ul class="list">
      ${[
        ['Basic', '₹ 60,000'],
        ['HRA',   '₹ 24,000'],
        ['Conveyance','₹ 1,800'],
        ['Special', '₹ 12,200'],
        ['Gross', '₹ 98,000'],
        ['EPF',   '−₹ 1,800'],
        ['Tax',   '−₹ 3,750'],
      ].map(([k,v])=>`
        <li class="list-row" style="cursor:default">
          <div class="list-l"><div class="list-t">${k}</div></div>
          <div class="list-r" style="font-feature-settings:'tnum';color:var(--text);font-weight:600">${v}</div>
        </li>
      `).join('')}
    </ul>
  `,
};

SCREENS['me-attendance'] = {
  title: 'Attendance · May 2026',
  render: () => {
    // 31 days · 1 May = Friday this year, so offset 4
    const states = ['present','present','weekend','weekend','present','present','present','present','present','weekend','weekend','present','today','future','future','weekend','weekend','future','future','future','future','future','weekend','weekend','future','future','future','future','future','weekend','weekend'];
    const cells = [];
    const days = ['M','T','W','T','F','S','S'];
    days.forEach(d=> cells.push(`<div class="att-cell weekend" style="font-size:10px;color:var(--text-3);font-weight:700;letter-spacing:0.08em">${d}</div>`));
    // 1 May is Friday → 4 blank cells
    for (let i=0;i<4;i++) cells.push('<div class="att-cell weekend" style="visibility:hidden"></div>');
    for (let day=1; day<=31; day++){
      const s = states[day-1] || 'future';
      const isToday = s==='today';
      cells.push(`<div class="att-cell ${s==='today'?'present':s}">${day}${isToday?'<div style="font-size:8px;letter-spacing:0.06em;font-weight:700">TODAY</div>':''}</div>`);
    }
    return `
      <div class="att-grid">${cells.join('')}</div>
      <div style="display:flex;gap:14px;padding:0 16px 24px;flex-wrap:wrap;font-size:11.5px">
        <span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:var(--sage-soft);vertical-align:-1px"></span> Present</span>
        <span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:var(--amber-soft);vertical-align:-1px"></span> Late</span>
        <span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:var(--red-soft);vertical-align:-1px"></span> Absent</span>
        <span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;border:1px solid var(--line);vertical-align:-1px"></span> Upcoming</span>
      </div>
    `;
  },
};

SCREENS['documents'] = {
  title: 'Documents',
  render: () => `
    <ul class="list">
      ${['Offer letter','PAN card','Aadhaar','Form 16 — FY2025','Bank passbook'].map(t=>`
        <li class="list-row" onclick="toast('Open · ${t}')">
          <div class="qa-icon">${I('i-doc')}</div>
          <div class="list-l"><div class="list-t">${t}</div><div class="list-s">PDF · viewed last month</div></div>
          <div class="list-r">${I('i-chev-r')}</div>
        </li>
      `).join('')}
    </ul>
  `,
};

SCREENS['settings'] = {
  title: 'Preferences',
  render: () => `
    <ul class="list">
      <li class="list-row"><div class="list-l"><div class="list-t">Notifications</div><div class="list-s">Push · email · in-app</div></div><div class="list-r">${I('i-chev-r')}</div></li>
      <li class="list-row"><div class="list-l"><div class="list-t">Appearance</div><div class="list-s">Light · auto-dark planned</div></div><div class="list-r">${I('i-chev-r')}</div></li>
      <li class="list-row"><div class="list-l"><div class="list-t">Language</div><div class="list-s">English (India)</div></div><div class="list-r">${I('i-chev-r')}</div></li>
      <li class="list-row"><div class="list-l"><div class="list-t">Privacy</div><div class="list-s">Location, biometrics, analytics</div></div><div class="list-r">${I('i-chev-r')}</div></li>
    </ul>
  `,
};

/* Announcements — company notice board (broadcasts, read-only).
   Not chats (no replies). Not notifications (not personal). Its own surface. */
SCREENS['announcements'] = {
  title: 'Announcements',
  render: () => {
    const co = currentCompany();
    const pinned = [
      {
        title:'Quarterly all-hands on Friday 4 PM',
        author:'Aditya Bansal · CEO',
        when:'Mon · 09:00',
        body:'Townhall in the 4th-floor auditorium. Branch managers please join 15 mins early. Q&A in the second half — submit questions via the form linked in chat.',
        tag:'TOWNHALL',
      },
    ];
    const recent = [
      {
        title:'Revised holiday calendar · 2026',
        author:'Priya Patel · HR',
        when:'2d ago',
        body:'Three regional holidays added (Ratha Yatra, Onam, Bhai Phonta). Updated list is in Documents · HR Policies.',
        tag:'HR',
      },
      {
        title:'Health insurance enrolment open till 25 May',
        author:'Priya Patel · HR',
        when:'4d ago',
        body:'New family-floater option available. Existing enrolments auto-renew unless you change. Forms in Documents · Benefits.',
        tag:'BENEFITS',
      },
      {
        title:'Kolkata branch opens 1 June',
        author:'Aditya Bansal · CEO',
        when:'1w ago',
        body:'Our 4th branch goes live. Welcome event on June 3. Bengal-based team members get first-week WFH option.',
        tag:'ANNOUNCEMENT',
      },
      {
        title:'AI policy update · effective 1 June',
        author:'Rounik Sen · IT',
        when:'2w ago',
        body:'External AI tools must be cleared by IT. Internal EasyDo AI assistant is approved for all use cases. Full policy in Documents.',
        tag:'POLICY',
      },
    ];
    const tagStyle = (t) => {
      if (t === 'TOWNHALL')    return 'background:var(--sage);color:#fff';
      if (t === 'HR')          return 'background:var(--pink-soft);color:#9D174D';
      if (t === 'BENEFITS')    return 'background:var(--forest-soft);color:#065F46';
      if (t === 'POLICY')      return 'background:var(--amber-soft);color:#92400E';
      if (t === 'ANNOUNCEMENT')return 'background:var(--sky-soft);color:#075985';
      return 'background:var(--surface-2);color:var(--text-2)';
    };
    const row = (a, isPinned) => `
      <li class="ann-row ${isPinned?'pinned':''}" onclick="toast('Announcement detail — v13 stub')">
        <div class="ann-h">
          <span class="ann-tag" style="${tagStyle(a.tag)}">${a.tag}</span>
          <span class="ann-when">${a.when}</span>
        </div>
        <div class="ann-t">${a.title}</div>
        <div class="ann-body">${a.body}</div>
        <div class="ann-author">${a.author}</div>
      </li>
    `;
    return `
      <div class="sec"><div class="sec-h"><div class="sec-t">Pinned</div><div class="sec-meta">${co.name}</div></div></div>
      <ul class="ann-list">${pinned.map(a => row(a, true)).join('')}</ul>

      <div class="sec"><div class="sec-h"><div class="sec-t">Recent</div><div class="sec-meta">${recent.length} this month</div></div></div>
      <ul class="ann-list">${recent.map(a => row(a, false)).join('')}</ul>
      <div style="height:40px"></div>
    `;
  },
};

/* My Requests — surfaced from Home, shows pending + approved + entry to file new */
SCREENS['my-requests'] = {
  title: 'My requests',
  render: () => {
    const pending = [
      { kind:'Casual leave',  detail:'15–16 May · 2 days',  who:'Awaiting Amulya', when:'1d ago',  icon:'i-leave', tone:'amber' },
      { kind:'Reimbursement', detail:'Travel ₹2,200',        who:'Awaiting approval', when:'2d ago', icon:'i-doc',   tone:'amber' },
    ];
    const done = [
      { kind:'Casual leave',  detail:'10 May · 1 day',      who:'Approved by Amulya', when:'3d ago', icon:'i-leave', tone:'sage' },
      { kind:'Overtime',      detail:'8 May · 2h',           who:'Rejected · policy',  when:'4d ago', icon:'i-clock', tone:'red'  },
    ];
    const reqRow = (r) => `
      <li class="list-row" onclick="toast('Request detail — v9.6')">
        <div class="qa-icon ${r.tone==='sage'?'sage':r.tone==='amber'?'amber':''}" ${r.tone==='red'?'style="background:var(--red-soft);color:#9b1c1c"':''}>${I(r.icon)}</div>
        <div class="list-l">
          <div class="list-t">${r.kind}</div>
          <div class="list-s">${r.detail} · ${r.who}</div>
        </div>
        <div class="list-r">
          <span style="font-size:11.5px;color:var(--text-3);font-feature-settings:'tnum'">${r.when}</span>
        </div>
      </li>
    `;
    const fileRow = (label, sub, screen, icon, locked, perm) => {
      const allowed = !locked;
      const onclickAttr = allowed
        ? `navigate('${screen}')`
        : `openDeny(DENY['${perm}'] || {need:'Company policy', why:'${sub}'}, '${label}')`;
      return `
        <li class="list-row ${allowed?'':'disabled'}" onclick="${onclickAttr}">
          <div class="qa-icon">${I(icon)}</div>
          <div class="list-l">
            <div class="list-t">${label}</div>
            <div class="list-s">${sub}</div>
          </div>
          <div class="list-r">${allowed?I('i-chev-r'):`<span class="lock-i">${I('i-lock')}</span>`}</div>
        </li>
      `;
    };
    return `
      <div class="section-head"><h2>Pending · ${pending.length}</h2></div>
      <ul class="list">${pending.map(reqRow).join('')}</ul>

      <div class="section-head"><h2>Recent · ${done.length}</h2></div>
      <ul class="list">${done.map(reqRow).join('')}</ul>

      <div class="section-head"><h2>File a new request</h2></div>
      <ul class="list">
        ${fileRow('Leave',         '14 casual · 8 sick remaining',    'apply-leave',     'i-leave',  false)}
        ${fileRow('Overtime',      'Not allowed this month · policy', 'apply-ot',        'i-clock',  true, 'admin.changeBranchTiming')}
        ${fileRow('Salary advance','Up to ₹25,000 against this month','apply-advance',   'i-rupee',  false)}
        ${fileRow('Reimbursement', '2 receipts pending submission',   'apply-reimburse', 'i-doc',    false)}
      </ul>
      <div style="height:40px"></div>
    `;
  },
};

/* Company settings (most locked for L2 user, demonstrates permission gating) */
SCREENS['settings-company'] = {
  title: 'Company settings',
  render: () => {
    const co = currentCompany();
    const items = [
      ['Company profile',     `${co.name} · founded 2018`,        'admin.webAdmin'],
      ['Working hours policy','Flexible · Standard · Strict',      'admin.changeBranchTiming'],
      ['Payroll setup',       'GST · TDS · PF · ESI',              'admin.webAdmin'],
      ['Leave policies',      'CL / SL / EL · accrual rules',      'admin.webAdmin'],
      ['Statutory & compliance','Filings · returns · reports',     'admin.webAdmin'],
      ['Brand & identity',    'Logo · colors · email domain',      'admin.webAdmin'],
    ];
    return `
      <div class="hint">Company-wide settings — L1 CEO permissions required. You can view but tap a locked row to see why.</div>
      <ul class="list" style="margin-top:8px">
        ${items.map(([t,s,perm])=>{
          const allowed = can(perm);
          return `
            <li class="list-row ${allowed?'':'disabled'}" onclick="${allowed?`toast('${t} — v9.5')`:`openDeny(DENY['${perm}'],'${t}')`}">
              <div class="qa-icon">${I('i-gear')}</div>
              <div class="list-l"><div class="list-t">${t}</div><div class="list-s">${s}</div></div>
              <div class="list-r">${allowed?I('i-chev-r'):`<span class="lock-i">${I('i-lock')}</span>`}</div>
            </li>
          `;
        }).join('')}
      </ul>
    `;
  },
};

/* Branch settings (scoped to currentBranch; L2 manager has SOME access for own branch) */
SCREENS['settings-branch'] = {
  title: 'Branch settings',
  render: () => {
    const br = currentBranch();
    const items = [
      ['Branch profile',      `${br.name} · ${br.city}`,                       'admin.branchSettings'],
      ['Branch timing',       `${br.open} · ${br.tz}`,                         'admin.changeBranchTiming'],
      ['Geofence & location', '28m radius · GPS strict',                       'admin.branchSettings'],
      ['Holiday calendar',    '14 holidays this year',                         'admin.branchSettings'],
      ['Week off pattern',    'Sat (alternating) · Sun',                       'admin.branchSettings'],
      ['Team & roles',        '42 members · 1 manager (you)',                  'admin.branchSettings'],
    ];
    return `
      <div class="hint">Branch settings for <b>${br.name}, ${br.city}</b>. Configuration is L1-only — view-only access for L2 managers.</div>
      <ul class="list" style="margin-top:8px">
        ${items.map(([t,s,perm])=>{
          const allowed = can(perm);
          return `
            <li class="list-row ${allowed?'':'disabled'}" onclick="${allowed?`toast('${t} — v9.5')`:`openDeny(DENY['${perm}'],'${t}')`}">
              <div class="qa-icon">${I('i-gear')}</div>
              <div class="list-l"><div class="list-t">${t}</div><div class="list-s">${s}</div></div>
              <div class="list-r">${allowed?I('i-chev-r'):`<span class="lock-i">${I('i-lock')}</span>`}</div>
            </li>
          `;
        }).join('')}
      </ul>
    `;
  },
};

/* The buried admin screen — exists for everyone, but ACTIONS are locked for non-L1 */
SCREENS['settings-admin'] = {
  title: 'Admin',
  render: () => {
    const items = [
      ['Web Admin',          'Bulk ops · audit logs',              'admin.webAdmin'],
      ['BG Verification',    '15 verified · 2 in progress',        'admin.bgVerify'],
      ['Change branch timing','9:00–18:00 (Mon–Fri)',              'admin.changeBranchTiming'],
      ['Branch settings',    'Geofence · holidays · policies',     'admin.branchSettings'],
      ['Company documents',  'Templates · policies · NDA',         'admin.companyDocs'],
    ];
    return `
      <div class="hint">Every item below is <i>visible</i> to you, but action is permission-gated. As an L2 Manager, these L1-only admin actions are locked — tap to see why.</div>
      <ul class="list" style="margin-top:8px">
        ${items.map(([t,s,perm])=>{
          const allowed = can(perm);
          return `
            <li class="list-row ${allowed?'':'disabled'}" onclick="${allowed?`toast('${t} — v9.1')`:`openDeny(DENY['${perm}'],'${t}')`}">
              <div class="qa-icon">${I('i-gear')}</div>
              <div class="list-l"><div class="list-t">${t}</div><div class="list-s">${s}</div></div>
              <div class="list-r">${allowed?I('i-chev-r'):`<span class="lock-i">${I('i-lock')}</span>`}</div>
            </li>
          `;
        }).join('')}
      </ul>
    `;
  },
};

/* ═════════════════════════════════════════════════════════════
   NOTIFICATION DRAWER (bell)
   ═════════════════════════════════════════════════════════════ */
function openNotif(){
  state.notifCount = 0; renderNav();
  openSheet({
    title: 'Notifications',
    html: `
      <div class="notif-section-h">Mentions</div>
      <div class="notif-row">
        <div class="nr-i">${I('i-mention')}</div>
        <div class="nr-l">
          <div class="nr-t">Amulya Reddy mentioned you</div>
          <div class="nr-s">"@sayantan can you review the deck before EOD?"</div>
        </div>
        <div class="nr-time">9:02</div>
      </div>
      <div class="notif-section-h">Chat</div>
      <div class="notif-row">
        <div class="nr-i">${I('i-chat')}</div>
        <div class="nr-l">
          <div class="nr-t">Rounik Sen</div>
          <div class="nr-s">Heads up — server migration starts at 11am.</div>
        </div>
        <div class="nr-time">8:48</div>
      </div>
      <div class="notif-section-h">Approvals waiting</div>
      <div class="notif-row">
        <div class="nr-i">${I('i-approve')}</div>
        <div class="nr-l">
          <div class="nr-t">5 pending requests</div>
          <div class="nr-s">2 leave · 1 OT · 1 advance · 1 reimbursement</div>
        </div>
        <div class="nr-time">now</div>
      </div>
    `,
  });
}

/* ═════════════════════════════════════════════════════════════
   LOCKED-ACTION BOTTOM SHEET
   ═════════════════════════════════════════════════════════════ */
function openDeny(deny, label){
  openSheet({
    title: '',
    html: `
      <div class="locked-explain">
        <div class="le-i">${I('i-lock')}</div>
        <h3 class="le-t">${label || 'Action locked'}</h3>
        <p class="le-s">${deny?.why || 'You don’t have permission to do this here.'}</p>
        <p class="le-meta">Needs ${deny?.need || 'higher access'}</p>
        <button class="btn btn-secondary" style="margin-top:18px" onclick="closeSheet()">Got it</button>
      </div>
    `,
  });
}

/* ═════════════════════════════════════════════════════════════
   SHEET / TOAST PRIMITIVES
   ═════════════════════════════════════════════════════════════ */
function openSheet({ title, html }){
  const sheet = document.getElementById('sheet');
  const bg = document.getElementById('sheetBg');
  sheet.innerHTML = `
    <div class="sheet-handle"></div>
    ${title?`<div class="sheet-h"><h3>${title}</h3><div class="sheet-close" onclick="closeSheet()">${I('i-close')}</div></div>`:''}
    <div class="sheet-body">${html}</div>
  `;
  requestAnimationFrame(()=>{ sheet.classList.add('show'); bg.classList.add('show'); });
}
function closeSheet(){
  document.getElementById('sheet').classList.remove('show');
  document.getElementById('sheetBg').classList.remove('show');
}
document.getElementById('sheetBg')?.addEventListener('click', closeSheet);

let toastTimer;
function toast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> el.classList.remove('show'), 1800);
}

/* ═════════════════════════════════════════════════════════════
   RENDER
   ═════════════════════════════════════════════════════════════ */
function render(){
  renderNav();
  renderTabs();
  const body = document.getElementById('body');
  if (state.screen){
    body.innerHTML = `<div>${SCREENS[state.screen].render()}</div>`;
    body.scrollTop = 0;
    return;
  }
  const bodyMap = {
    home:      homeBody,
    workspace: workspaceBody,
    punch:     punchBody,
    chats:     chatsBody,
    office:    officeBody,
  };
  body.innerHTML = (bodyMap[state.tab] || homeBody)();
  body.scrollTop = 0;
}

/* Elapsed-time tick while punched in */
setInterval(()=>{
  if (!state.punchedIn) return;
  const el = document.getElementById('punchElapsed');
  if (el) el.textContent = elapsed(state.punchedAt);
}, 30_000);

render();


/* =============================================================
   COLOR CUSTOMIZER — v21
   Live palette editor. Swaps CSS custom properties on :root so
   every color role in the app updates in real time without a
   page reload.
   ============================================================= */

/* Preset palettes */
// shadcn defaults as OKLCH triples [L, C, H] or [L, C, H, alpha]
const SHADCN_THEME_OKLCH = {
  light: {
    background:                [1, 0, 0],
    foreground:                [0.147, 0.004, 49.3],
    card:                      [1, 0, 0],
    cardForeground:            [0.147, 0.004, 49.3],
    popover:                   [1, 0, 0],
    popoverForeground:         [0.147, 0.004, 49.3],
    primary:                   [0.527, 0.154, 150.069],
    primaryForeground:         [0.982, 0.018, 155.826],
    secondary:                 [0.967, 0.001, 286.375],
    secondaryForeground:       [0.21, 0.006, 285.885],
    muted:                     [0.96, 0.002, 17.2],
    mutedForeground:           [0.547, 0.021, 43.1],
    accent:                    [0.527, 0.154, 150.069],
    accentForeground:          [0.982, 0.018, 155.826],
    destructive:               [0.577, 0.245, 27.325],
    border:                    [0.922, 0.005, 34.3],
    input:                     [0.922, 0.005, 34.3],
    ring:                      [0.714, 0.014, 41.2],
    chart1:                    [0.81, 0.117, 11.638],
    chart2:                    [0.645, 0.246, 16.439],
    chart3:                    [0.586, 0.253, 17.585],
    chart4:                    [0.514, 0.222, 16.935],
    chart5:                    [0.455, 0.188, 13.697],
    sidebar:                   [0.986, 0.002, 67.8],
    sidebarForeground:         [0.147, 0.004, 49.3],
    sidebarPrimary:            [0.627, 0.194, 149.214],
    sidebarPrimaryForeground:  [0.982, 0.018, 155.826],
    sidebarAccent:             [0.96, 0.002, 17.2],
    sidebarAccentForeground:   [0.214, 0.009, 43.1],
    sidebarBorder:             [0.922, 0.005, 34.3],
    sidebarRing:               [0.714, 0.014, 41.2],
  },
  dark: {
    background:                [0.147, 0.004, 49.3],
    foreground:                [0.986, 0.002, 67.8],
    card:                      [0.214, 0.009, 43.1],
    cardForeground:            [0.986, 0.002, 67.8],
    popover:                   [0.214, 0.009, 43.1],
    popoverForeground:         [0.986, 0.002, 67.8],
    primary:                   [0.448, 0.119, 151.328],
    primaryForeground:         [0.982, 0.018, 155.826],
    secondary:                 [0.274, 0.006, 286.033],
    secondaryForeground:       [0.985, 0, 0],
    muted:                     [0.268, 0.011, 36.5],
    mutedForeground:           [0.714, 0.014, 41.2],
    accent:                    [0.448, 0.119, 151.328],
    accentForeground:          [0.982, 0.018, 155.826],
    destructive:               [0.704, 0.191, 22.216],
    border:                    [1, 0, 0, 0.10],
    input:                     [1, 0, 0, 0.15],
    ring:                      [0.547, 0.021, 43.1],
    chart1:                    [0.81, 0.117, 11.638],
    chart2:                    [0.645, 0.246, 16.439],
    chart3:                    [0.586, 0.253, 17.585],
    chart4:                    [0.514, 0.222, 16.935],
    chart5:                    [0.455, 0.188, 13.697],
    sidebar:                   [0.214, 0.009, 43.1],
    sidebarForeground:         [0.986, 0.002, 67.8],
    sidebarPrimary:            [0.723, 0.219, 149.579],
    sidebarPrimaryForeground:  [0.982, 0.018, 155.826],
    sidebarAccent:             [0.268, 0.011, 36.5],
    sidebarAccentForeground:   [0.986, 0.002, 67.8],
    sidebarBorder:             [1, 0, 0, 0.10],
    sidebarRing:               [0.547, 0.021, 43.1],
  }
};

// Compute hex defaults + alpha map from OKLCH triples
const SHADCN_DEFAULTS = { light: {}, dark: {} };
const SHADCN_ALPHA_DEFAULTS = { light: {}, dark: {} };
for(const mode of ["light", "dark"]){
  for(const [key, triple] of Object.entries(SHADCN_THEME_OKLCH[mode])){
    SHADCN_DEFAULTS[mode][key] = oklchToHex(triple[0], triple[1], triple[2]);
    if(triple.length === 4) SHADCN_ALPHA_DEFAULTS[mode][key] = triple[3];
  }
}

// css-var-name → key mapping, ordered to match shadcn's template
const SHADCN_VAR_ORDER = [
  ["background", "background"],
  ["foreground", "foreground"],
  ["card", "card"],
  ["card-foreground", "cardForeground"],
  ["popover", "popover"],
  ["popover-foreground", "popoverForeground"],
  ["primary", "primary"],
  ["primary-foreground", "primaryForeground"],
  ["secondary", "secondary"],
  ["secondary-foreground", "secondaryForeground"],
  ["muted", "muted"],
  ["muted-foreground", "mutedForeground"],
  ["accent", "accent"],
  ["accent-foreground", "accentForeground"],
  ["destructive", "destructive"],
  ["border", "border"],
  ["input", "input"],
  ["ring", "ring"],
  ["chart-1", "chart1"],
  ["chart-2", "chart2"],
  ["chart-3", "chart3"],
  ["chart-4", "chart4"],
  ["chart-5", "chart5"],
  ["sidebar", "sidebar"],
  ["sidebar-foreground", "sidebarForeground"],
  ["sidebar-primary", "sidebarPrimary"],
  ["sidebar-primary-foreground", "sidebarPrimaryForeground"],
  ["sidebar-accent", "sidebarAccent"],
  ["sidebar-accent-foreground", "sidebarAccentForeground"],
  ["sidebar-border", "sidebarBorder"],
  ["sidebar-ring", "sidebarRing"],
];

const CP_GROUPS = [
  { name: "Brand", keys: [
    { key: "primary",                  label: "Primary" },
    { key: "primaryForeground",        label: "On Primary" },
    { key: "accent",                   label: "Accent" },
    { key: "accentForeground",         label: "On Accent" },
  ]},
  { name: "Surface", keys: [
    { key: "background",               label: "Background" },
    { key: "foreground",               label: "Foreground" },
    { key: "card",                     label: "Card" },
    { key: "cardForeground",           label: "Card FG" },
    { key: "popover",                  label: "Popover" },
    { key: "popoverForeground",        label: "Popover FG" },
  ]},
  { name: "Semantic", keys: [
    { key: "secondary",                label: "Secondary" },
    { key: "secondaryForeground",      label: "On Secondary" },
    { key: "muted",                    label: "Muted" },
    { key: "mutedForeground",          label: "Muted FG" },
    { key: "destructive",              label: "Destructive" },
  ]},
  { name: "Form", keys: [
    { key: "border",                   label: "Border" },
    { key: "input",                    label: "Input" },
    { key: "ring",                     label: "Ring" },
  ]},
  { name: "Charts", keys: [
    { key: "chart1",                   label: "Chart 1" },
    { key: "chart2",                   label: "Chart 2" },
    { key: "chart3",                   label: "Chart 3" },
    { key: "chart4",                   label: "Chart 4" },
    { key: "chart5",                   label: "Chart 5" },
  ]},
  { name: "Sidebar", keys: [
    { key: "sidebar",                  label: "Sidebar" },
    { key: "sidebarForeground",        label: "Sidebar FG" },
    { key: "sidebarPrimary",           label: "Sidebar Primary" },
    { key: "sidebarPrimaryForeground", label: "On Sidebar Pri" },
    { key: "sidebarAccent",            label: "Sidebar Accent" },
    { key: "sidebarAccentForeground",  label: "On Sidebar Acc" },
    { key: "sidebarBorder",            label: "Sidebar Border" },
    { key: "sidebarRing",              label: "Sidebar Ring" },
  ]},
];

function hexToRgb(hex){ return { r:parseInt(hex.slice(1,3),16), g:parseInt(hex.slice(3,5),16), b:parseInt(hex.slice(5,7),16) }; }
function toRgbStr(hex){ const {r,g,b}=hexToRgb(hex); return r+","+g+","+b; }
function lighten(hex,t){ const {r,g,b}=hexToRgb(hex); const m=c=>Math.round(c+(255-c)*t).toString(16).padStart(2,"0"); return "#"+m(r)+m(g)+m(b); }
function darken(hex,t){ const {r,g,b}=hexToRgb(hex); const m=c=>Math.round(c*t).toString(16).padStart(2,"0"); return "#"+m(r)+m(g)+m(b); }
function luminance(hex){ const {r,g,b}=hexToRgb(hex); return (0.299*r+0.587*g+0.114*b)/255; }

function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }
function rgbToHsb(r,g,b){
  r/=255; g/=255; b/=255;
  const mx = Math.max(r,g,b), mn = Math.min(r,g,b), d = mx - mn;
  let h = 0;
  if(d !== 0){
    if(mx === r) h = ((g - b) / d) % 6;
    else if(mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60; if(h < 0) h += 360;
  }
  return { h, s: mx === 0 ? 0 : (d / mx) * 100, v: mx * 100 };
}
function hsbToRgb(h, s, v){
  s /= 100; v /= 100;
  const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
  let r=0,g=0,b=0;
  if(h < 60){ r=c; g=x; }
  else if(h < 120){ r=x; g=c; }
  else if(h < 180){ g=c; b=x; }
  else if(h < 240){ g=x; b=c; }
  else if(h < 300){ r=x; b=c; }
  else { r=c; b=x; }
  return { r: Math.round((r+m)*255), g: Math.round((g+m)*255), b: Math.round((b+m)*255) };
}
function hexToHsb(hex){ const {r,g,b} = hexToRgb(hex); return rgbToHsb(r,g,b); }

// hex → OKLCH (Ottosson's coefficients)
function hexToOklch(hex){
  const {r,g,b} = hexToRgb(hex);
  const toLin = c => { const cn = c/255; return cn <= 0.04045 ? cn/12.92 : Math.pow((cn+0.055)/1.055, 2.4); };
  const rl = toLin(r), gl = toLin(g), bl = toLin(b);
  const l = 0.4122214708*rl + 0.5363325363*gl + 0.0514459929*bl;
  const m = 0.2119034982*rl + 0.6806995451*gl + 0.1073969566*bl;
  const s = 0.0883024619*rl + 0.2817188376*gl + 0.6299787005*bl;
  const lc = Math.cbrt(l), mc = Math.cbrt(m), sc = Math.cbrt(s);
  const L = 0.2104542553*lc + 0.7936177850*mc - 0.0040720468*sc;
  const A = 1.9779984951*lc - 2.4285922050*mc + 0.4505937099*sc;
  const B = 0.0259040371*lc + 0.7827717662*mc - 0.8086757660*sc;
  const C = Math.sqrt(A*A + B*B);
  let H = Math.atan2(B, A) * 180 / Math.PI;
  if(H < 0) H += 360;
  return { L, C, H };
}
function fmtOklch(hex){
  const {L, C, H} = hexToOklch(hex);
  const f = n => Number(n.toFixed(3)).toString();
  return C < 0.001 ? `oklch(${f(L)} 0 0)` : `oklch(${f(L)} ${f(C)} ${f(H)})`;
}
// Foreground for a given hex: white if dark, near-black if light
function fmtOklchFg(hex){
  return luminance(hex) < 0.5 ? "oklch(0.985 0 0)" : "oklch(0.205 0 0)";
}
// OKLCH triple → hex (clipped to sRGB gamut)
function oklchToHex(L, C, H){
  const Hr = H * Math.PI / 180;
  const A = C * Math.cos(Hr);
  const B = C * Math.sin(Hr);
  const lc = L + 0.3963377774*A + 0.2158037573*B;
  const mc = L - 0.1055613458*A - 0.0638541728*B;
  const sc = L - 0.0894841775*A - 1.2914855480*B;
  const l = lc*lc*lc, m = mc*mc*mc, s = sc*sc*sc;
  const rl =  4.0767416621*l - 3.3077115913*m + 0.2309699292*s;
  const gl = -1.2684380046*l + 2.6097574011*m - 0.3413193965*s;
  const bl = -0.0041960863*l - 0.7034186147*m + 1.7076147010*s;
  const fromLin = c => {
    const cl = Math.max(0, Math.min(1, c));
    return cl <= 0.0031308 ? 12.92*cl : 1.055*Math.pow(cl, 1/2.4) - 0.055;
  };
  const r8 = Math.round(255 * fromLin(rl));
  const g8 = Math.round(255 * fromLin(gl));
  const b8 = Math.round(255 * fromLin(bl));
  const hx = c => c.toString(16).padStart(2, "0");
  return "#" + hx(r8) + hx(g8) + hx(b8);
}
function hsbToHex({h,s,v}){
  const {r,g,b} = hsbToRgb(h,s,v);
  const m = c => c.toString(16).padStart(2,"0");
  return "#" + m(r) + m(g) + m(b);
}

// Maps shadcn theme → v21 internal CSS vars for the phone preview
function applyPalette(t){
  const root=document.documentElement;
  const set=(k,v)=>root.style.setProperty(k,v);
  set("--sage",t.primary); set("--sage-rgb",toRgbStr(t.primary));
  set("--sage-soft",lighten(t.primary,0.88)); set("--sage-deep",darken(t.primary,0.70));
  set("--ring-fab","0 8px 20px rgba("+toRgbStr(t.primary)+",0.32), 0 2px 6px rgba("+toRgbStr(t.primary)+",0.20)");
  // Warm accent role
  set("--orange",t.accent); set("--orange-soft",lighten(t.accent,0.88));
  set("--amber",t.accent);  set("--amber-soft",lighten(t.accent,0.88));
  // Cool accent role — use chart3 as a hue-distinct accent
  const cool = t.chart3 || t.accent;
  set("--pink",cool);   set("--pink-soft",lighten(cool,0.88));
  set("--violet",cool); set("--violet-soft",lighten(cool,0.88));
  set("--sky",cool);    set("--sky-soft",lighten(cool,0.88));
  // Success stays semantic-green; destructive comes from shadcn var
  set("--forest","#16A34A"); set("--forest-rgb","22,163,74"); set("--forest-soft",lighten("#16A34A",0.88));
  set("--red",t.destructive); set("--red-soft",lighten(t.destructive,0.88));
  // Surface
  const isDark=luminance(t.background)<0.5;
  set("--bg",t.background); set("--surface",t.background); set("--text",t.foreground);
  if(isDark){
    set("--surface-2",lighten(t.background,0.08)); set("--surface-3",lighten(t.background,0.14));
    set("--line",lighten(t.background,0.20)); set("--line-2",lighten(t.background,0.14)); set("--line-strong",lighten(t.background,0.35));
    set("--text-2",darken(t.foreground,0.72)); set("--text-3",darken(t.foreground,0.52)); set("--text-4",darken(t.foreground,0.36));
    set("--ink",t.foreground); set("--on-ink",t.background);
  } else {
    set("--surface-2","#FAFAFA"); set("--surface-3","#F4F4F5");
    set("--line","#F0F0F0"); set("--line-2","#F5F5F5"); set("--line-strong","#D4D4D4");
    set("--text-2",lighten(t.foreground,0.46)); set("--text-3",lighten(t.foreground,0.70)); set("--text-4",lighten(t.foreground,0.84));
    set("--ink","#171717"); set("--on-ink","#FFFFFF");
  }
  try{ localStorage.setItem("v21-shadcn-theme", JSON.stringify({theme: cpTheme, alpha: cpAlpha, mode: cpMode})); }catch(e){}
}

let cpMode = "light";
let cpTheme = {
  light: { ...SHADCN_DEFAULTS.light },
  dark:  { ...SHADCN_DEFAULTS.dark }
};
let cpAlpha = {
  light: { ...SHADCN_ALPHA_DEFAULTS.light },
  dark:  { ...SHADCN_ALPHA_DEFAULTS.dark }
};

function el(tag, attrs, text){
  const node = document.createElement(tag);
  if(attrs) for(const [k,v] of Object.entries(attrs)){
    if(k === "class") node.className = v;
    else node.setAttribute(k, v);
  }
  if(text != null) node.textContent = text;
  return node;
}

function renderColorPanel(){
  const panel = document.getElementById("colorPanel");
  if(!panel) return;
  panel.replaceChildren();

  // Header with title + Mode toggle + Export + Reset
  const header = el("div", {class:"cp-header"});
  header.append(el("p", {class:"cp-title"}, "shadcn palette"));

  const actions = el("div", {class:"cp-actions"});

  const modeWrap = el("div", {class:"cp-mode-toggle"});
  const mkModeBtn = (mode, label) => {
    const b = el("button", {type:"button", class:"cp-mode-btn" + (cpMode===mode ? " active" : "")}, label);
    b.addEventListener("click", () => {
      if(cpMode === mode) return;
      closePicker();
      cpMode = mode;
      applyPalette(cpTheme[cpMode]);
      renderColorPanel();
    });
    return b;
  };
  modeWrap.append(mkModeBtn("light", "Light"), mkModeBtn("dark", "Dark"));
  actions.append(modeWrap);

  const exportBtn = el("button", {class:"cp-export-btn", type:"button", id:"cpExportBtn"}, "Export shadcn");
  exportBtn.addEventListener("click", cpExport);
  actions.append(exportBtn);

  const resetBtn = el("button", {class:"cp-reset-btn", type:"button"}, "↻ Reset");
  resetBtn.addEventListener("click", cpReset);
  actions.append(resetBtn);

  header.append(actions);
  panel.append(header);

  // Paste row
  const pasteRow = el("div", {class:"cp-paste"});
  const pasteInput = el("input", {
    type:"text", class:"cp-paste-input", id:"cpPasteInput",
    placeholder:"Paste Coolors URL or hex codes…",
    autocomplete:"off", spellcheck:"false"
  });
  pasteInput.addEventListener("input", e => {
    const n = cpApplyPastedText(e.target.value);
    if(n > 0){
      e.target.value = "";
      e.target.classList.add("is-ok");
      e.target.placeholder = `Loaded ${n} color${n>1?"s":""} ✓`;
      clearTimeout(pasteInput._t);
      pasteInput._t = setTimeout(() => {
        e.target.classList.remove("is-ok");
        e.target.placeholder = "Paste Coolors URL or hex codes…";
      }, 1500);
    }
  });
  pasteRow.append(pasteInput);
  panel.append(pasteRow);

  // Grouped sections — render only current mode's values
  const colors = cpTheme[cpMode];
  for(const group of CP_GROUPS){
    panel.append(el("div", {class:"cp-group"}, group.name));
    for(const f of group.keys){
      const hex = colors[f.key] || "#000000";
      const row = el("div", {class:"cp-row"});
      row.append(el("span", {class:"cp-row-label"}, f.label));
      const sw = el("button", {type:"button", class:"cp-swatch", id:"cp-"+f.key, "aria-label": f.label + " color"});
      sw.style.background = hex;
      sw.addEventListener("click", e => {
        e.stopPropagation();
        if(cpPickerTarget === f.key){ closePicker(); return; }
        openPicker(f.key, sw);
      });
      row.append(sw);
      row.append(el("span", {class:"cp-hex", id:"cp-hex-"+f.key}, hex.toUpperCase()));
      panel.append(row);
    }
  }
}

// Paste targets — applied to the CURRENT mode in order
const PASTE_TARGETS = ["primary", "accent", "chart1", "chart2", "chart3"];

function parseHexes(text){
  const tokens = String(text || "").match(/[a-f0-9]+/gi) || [];
  return tokens.filter(t => t.length === 6).map(h => "#" + h.toLowerCase());
}

function cpApplyPastedText(text){
  const hexes = parseHexes(text);
  if(hexes.length === 0) return 0;
  closePicker();
  const n = Math.min(hexes.length, PASTE_TARGETS.length);
  const colors = cpTheme[cpMode];
  for(let i = 0; i < n; i++){
    const key = PASTE_TARGETS[i];
    colors[key] = hexes[i];
    const swatch = document.getElementById("cp-" + key);
    if(swatch) swatch.style.background = hexes[i];
    const label = document.getElementById("cp-hex-" + key);
    if(label) label.textContent = hexes[i].toUpperCase();
  }
  applyPalette(colors);
  return n;
}

function emitOklchValue(hex, alpha){
  const oklch = fmtOklch(hex);
  if(alpha === undefined || alpha >= 1) return oklch;
  // Inject alpha: oklch(L C H) → oklch(L C H / N%)
  const inner = oklch.slice(6, -1);
  return `oklch(${inner} / ${Math.round(alpha * 100)}%)`;
}

function buildExportCss(){
  const emitBlock = (selector, mode, includeRadius) => {
    const colors = cpTheme[mode];
    const alphas = cpAlpha[mode];
    const lines = [`${selector} {`];
    for(const [varName, key] of SHADCN_VAR_ORDER){
      if(colors[key] === undefined) continue;
      lines.push(`  --${varName}: ${emitOklchValue(colors[key], alphas[key])};`);
      // shadcn template places --radius after --chart-5 in :root only
      if(includeRadius && varName === "chart-5"){
        lines.push(`  --radius: 0.875rem;`);
      }
    }
    lines.push("}");
    return lines.join("\n");
  };
  return emitBlock(":root", "light", true) + "\n\n" + emitBlock(".dark", "dark", false) + "\n";
}

async function cpExport(){
  const btn = document.getElementById("cpExportBtn");
  const css = buildExportCss();
  let ok = false;
  try{
    await navigator.clipboard.writeText(css);
    ok = true;
  } catch(e){
    const ta = document.createElement("textarea");
    ta.value = css; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try{ ok = document.execCommand("copy"); }catch(_){}
    document.body.removeChild(ta);
  }
  if(!btn) return;
  const original = btn.textContent;
  btn.textContent = ok ? "Copied ✓" : "Copy failed";
  btn.classList.add(ok ? "is-ok" : "is-err");
  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove("is-ok", "is-err");
  }, 1500);
}

// ─── HSB picker ───────────────────────────────────────
let cpPickerTarget = null;
let cpPickerHsb = null;

function buildPickerDom(){
  if(document.getElementById("cpPicker")) return;
  const pk = el("div", {class:"cp-picker", id:"cpPicker"});

  // Current preview + hex
  const top = el("div", {class:"cp-picker-top"});
  top.append(el("div", {class:"cp-current", id:"cpPkCurrent"}));
  const hexInp = el("input", {type:"text", class:"cp-hex-input", id:"cpPkHex", maxlength:"7", spellcheck:"false", autocomplete:"off"});
  top.append(hexInp);
  pk.append(top);

  // Three plain sliders + numeric mirrors
  const channels = [
    { key:"h", label:"H", max:360 },
    { key:"s", label:"S", max:100 },
    { key:"v", label:"B", max:100 },
  ];
  for(const ch of channels){
    const row = el("div", {class:"cp-slider-row"});
    row.append(el("span", {class:"cp-slider-label"}, ch.label));
    const range = el("input", {type:"range", class:"cp-range" + (ch.key==="h" ? " is-hue" : ""), id:"cpPk-"+ch.key+"-range", min:"0", max:String(ch.max), step:"1"});
    const num = el("input", {type:"number", class:"cp-num-input", id:"cpPk-"+ch.key+"-num", min:"0", max:String(ch.max)});
    row.append(range, num);
    pk.append(row);
    const update = v => {
      cpPickerHsb = { ...cpPickerHsb, [ch.key]: clamp(+v || 0, 0, ch.max) };
      renderPicker();
      commitColor();
    };
    range.addEventListener("input", e => update(e.target.value));
    num.addEventListener("input", e => update(e.target.value));
  }

  document.body.append(pk);

  pk.addEventListener("mousedown", e => e.stopPropagation());

  const onHexCommit = e => {
    const val = e.target.value.trim();
    if(/^#?[0-9a-f]{6}$/i.test(val)){
      const norm = val.startsWith("#") ? val : "#" + val;
      cpPickerHsb = hexToHsb(norm);
      renderPicker(); commitColor();
    } else {
      e.target.value = hsbToHex(cpPickerHsb);
    }
  };
  hexInp.addEventListener("change", onHexCommit);
  hexInp.addEventListener("keydown", e => { if(e.key === "Enter") e.target.blur(); });
}

function openPicker(key, swatchEl){
  cpPickerTarget = key;
  cpPickerHsb = hexToHsb(cpTheme[cpMode][key]);
  positionPicker(swatchEl);
  renderPicker();
  document.getElementById("cpPicker").classList.add("open");
  // Defer adding outside-click handler so the click that opened it doesn't close it
  setTimeout(() => {
    document.addEventListener("mousedown", onPickerOutsideClick);
    document.addEventListener("keydown", onPickerKey);
    window.addEventListener("scroll", onPickerScroll, true);
    window.addEventListener("resize", onPickerScroll);
  }, 0);
}
function closePicker(){
  const pk = document.getElementById("cpPicker");
  if(pk) pk.classList.remove("open");
  cpPickerTarget = null;
  cpPickerHsb = null;
  document.removeEventListener("mousedown", onPickerOutsideClick);
  document.removeEventListener("keydown", onPickerKey);
  window.removeEventListener("scroll", onPickerScroll, true);
  window.removeEventListener("resize", onPickerScroll);
}
function onPickerOutsideClick(e){
  const pk = document.getElementById("cpPicker");
  if(!pk || pk.contains(e.target)) return;
  if(e.target.classList && e.target.classList.contains("cp-swatch")) return;
  closePicker();
}
function onPickerKey(e){ if(e.key === "Escape") closePicker(); }
function onPickerScroll(){
  if(!cpPickerTarget) return;
  const sw = document.getElementById("cp-" + cpPickerTarget);
  if(sw) positionPicker(sw); else closePicker();
}

function positionPicker(swatchEl){
  const pk = document.getElementById("cpPicker");
  if(!pk) return;
  const r = swatchEl.getBoundingClientRect();
  const pkW = 240, pkH = 170, gap = 10;
  let left = r.left - pkW - gap;
  if(left < 8) left = r.right + gap;
  let top = r.top + r.height / 2 - pkH / 2;
  top = clamp(top, 8, window.innerHeight - pkH - 8);
  pk.style.left = left + "px";
  pk.style.top = top + "px";
}

function renderPicker(){
  const pk = document.getElementById("cpPicker");
  if(!pk || !cpPickerHsb) return;
  const { h, s, v } = cpPickerHsb;
  const hex = hsbToHex(cpPickerHsb);
  const setChan = (key, val, isFocused) => {
    if(!isFocused){
      const r = document.getElementById("cpPk-" + key + "-range"); if(r) r.value = val;
      const n = document.getElementById("cpPk-" + key + "-num");   if(n) n.value = val;
    }
  };
  // Don't overwrite a field the user is actively editing
  const active = document.activeElement;
  const focusedId = active && active.id ? active.id : "";
  setChan("h", Math.round(h), focusedId === "cpPk-h-range" || focusedId === "cpPk-h-num");
  setChan("s", Math.round(s), focusedId === "cpPk-s-range" || focusedId === "cpPk-s-num");
  setChan("v", Math.round(v), focusedId === "cpPk-v-range" || focusedId === "cpPk-v-num");
  document.getElementById("cpPkCurrent").style.background = hex;
  const hexInp = document.getElementById("cpPkHex");
  if(active !== hexInp) hexInp.value = hex;
}

function commitColor(){
  if(!cpPickerTarget || !cpPickerHsb) return;
  const hex = hsbToHex(cpPickerHsb);
  cpTheme[cpMode][cpPickerTarget] = hex;
  // Editing a swatch implies a solid color — drop any alpha overlay on this key
  if(cpAlpha[cpMode][cpPickerTarget] !== undefined) delete cpAlpha[cpMode][cpPickerTarget];
  const sw = document.getElementById("cp-" + cpPickerTarget);
  if(sw) sw.style.background = hex;
  const lbl = document.getElementById("cp-hex-" + cpPickerTarget);
  if(lbl) lbl.textContent = hex.toUpperCase();
  applyPalette(cpTheme[cpMode]);
}
// ──────────────────────────────────────────────────────

function cpReset(){
  closePicker();
  cpTheme = {
    light: { ...SHADCN_DEFAULTS.light },
    dark:  { ...SHADCN_DEFAULTS.dark }
  };
  cpAlpha = {
    light: { ...SHADCN_ALPHA_DEFAULTS.light },
    dark:  { ...SHADCN_ALPHA_DEFAULTS.dark }
  };
  applyPalette(cpTheme[cpMode]);
  renderColorPanel();
}

(function cpInit(){
  try{
    // Sweep older storage keys
    localStorage.removeItem("v21-palette");
    localStorage.removeItem("v21-palette-key");
    const saved = localStorage.getItem("v21-shadcn-theme");
    if(saved){
      const data = JSON.parse(saved);
      if(data && data.theme && data.theme.light && data.theme.dark){
        // Fill in any keys missing from the saved state with defaults
        cpTheme = {
          light: { ...SHADCN_DEFAULTS.light, ...data.theme.light },
          dark:  { ...SHADCN_DEFAULTS.dark,  ...data.theme.dark  },
        };
        cpAlpha = {
          light: { ...SHADCN_ALPHA_DEFAULTS.light, ...(data.alpha && data.alpha.light || {}) },
          dark:  { ...SHADCN_ALPHA_DEFAULTS.dark,  ...(data.alpha && data.alpha.dark  || {}) },
        };
        if(data.mode === "dark") cpMode = "dark";
      }
    }
  }catch(e){}
  applyPalette(cpTheme[cpMode]);
  buildPickerDom();
  renderColorPanel();
})();
