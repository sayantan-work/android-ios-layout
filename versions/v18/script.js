/* v18 — Stacks · Punch page state machine
   States: pre · moment · mid · post
   Hero tile morphs; supporting tiles update their content.
   State cycler chip in nav cycles Pre → Mid → Post (Moment is a sheet over Pre). */

(function(){
  var body = document.getElementById('body');
  var stateChip = document.getElementById('stateChip');
  var stateChipLbl = document.getElementById('stateChipLbl');
  var sheet = document.getElementById('sheet');
  var sheetBg = document.getElementById('sheetBg');

  // ── State data ────────────────────────────────────────────────
  var state = 'pre'; // pre | mid | post
  var midStartMs = null; // when we entered mid-shift, for live timer
  var liveTickHandle = null;

  // Simulated "punch in" time used for mid + post states
  // (in real product, comes from server)
  function fakeInTime(){ return '09:12'; }
  function fakeOutTime(){ return '18:24'; }

  // For mid-shift, "elapsed since 09:12 to now"
  // We pin a start moment when entering mid so the timer feels alive.
  function startLiveTimer(){
    stopLiveTimer();
    // Start at 5h 18m 42s for a richer-looking timer than 0
    var base = 5*3600 + 18*60 + 42;
    var t0 = Date.now();
    function tick(){
      var el = document.getElementById('liveTimer');
      if (!el) return;
      var sec = base + Math.floor((Date.now() - t0) / 1000);
      el.textContent = fmtHMS(sec);
      updateHoursRing(sec);
      updateTimelineNow(sec);
    }
    tick();
    liveTickHandle = setInterval(tick, 1000);
  }
  function stopLiveTimer(){
    if (liveTickHandle){ clearInterval(liveTickHandle); liveTickHandle = null; }
  }

  function fmtHMS(sec){
    var h = Math.floor(sec/3600);
    var m = Math.floor((sec%3600)/60);
    var s = sec%60;
    return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  }

  function updateHoursRing(elapsedSec){
    var ring = document.getElementById('ringFill');
    var center = document.getElementById('ringCenter');
    if (!ring) return;
    var targetSec = 8.5 * 3600; // 8h 30m
    var pct = Math.min(1, elapsedSec / targetSec);
    var circumference = 2 * Math.PI * 42;
    ring.setAttribute('stroke-dasharray', circumference);
    ring.setAttribute('stroke-dashoffset', circumference * (1 - pct));
    if (center){
      var h = Math.floor(elapsedSec/3600);
      var m = Math.floor((elapsedSec%3600)/60);
      center.querySelector('.ring-num').textContent = h+'h '+String(m).padStart(2,'0')+'m';
    }
  }

  function updateTimelineNow(elapsedSec){
    var nowNode = document.getElementById('tNow');
    var filled = document.getElementById('tFilled');
    var projected = document.getElementById('tProjected');
    if (!nowNode) return;
    // Shift window: 09:00 → 18:00 = 9h = 32400s
    // Punch-in at 09:12 = 12m into the bar = 12/540 of width
    // "now" position based on actual elapsed
    var inMin = 12; // 09:12
    var nowMin = inMin + (elapsedSec / 60);
    var totalMin = 9 * 60; // 09:00 → 18:00 span
    var pctNow = Math.min(1, nowMin / totalMin);
    var pctIn = inMin / totalMin;
    nowNode.style.left = (pctNow * 100) + '%';
    if (filled){
      filled.style.left = (pctIn * 100) + '%';
      filled.style.width = ((pctNow - pctIn) * 100) + '%';
    }
    if (projected){
      projected.style.left = (pctNow * 100) + '%';
      projected.style.width = ((1 - pctNow) * 100) + '%';
    }
  }

  // ── Renderers ─────────────────────────────────────────────────
  function renderPre(){
    return `
      <div class="tile hero">
        <span class="hero-tag"><span class="dot"></span>Shift · 09:00–18:00</span>
        <div class="hero-num">09:08</div>
        <div class="hero-sub">Branch opens in <span class="mono">52 min</span> · You're <span class="mono">2.4 km</span> out</div>
        <button class="btn-punch-in" id="btnPunchIn">
          <svg><use href="#i-zap"/></svg>
          Punch In
        </button>
        <div class="hero-context">
          <svg><use href="#i-pin"/></svg>
          ETA Head Office · ~12 min by car
        </div>
      </div>

      <div class="row-2up">
        <div class="tile">
          <div class="tile-head"><div class="tile-title">Location</div></div>
          <div class="loc-map">
            <div class="loc-geofence out"></div>
            <div class="loc-dot out"></div>
          </div>
          <div class="loc-status">
            <span class="badge warn">Outside</span>
          </div>
          <div class="loc-sub">2.4 km from geofence</div>
        </div>

        <div class="tile">
          <div class="tile-head"><div class="tile-title">Hours</div></div>
          <div class="ring-wrap">
            <svg class="ring-svg" viewBox="0 0 100 100">
              <circle class="ring-track" cx="50" cy="50" r="42"/>
              <circle class="ring-fill" cx="50" cy="50" r="42" stroke-dasharray="263.9" stroke-dashoffset="263.9"/>
            </svg>
            <div class="ring-center">
              <div class="ring-num">0h 00m</div>
              <div class="ring-lbl">Worked</div>
            </div>
          </div>
          <div class="ring-target">Target <span class="val">8h 30m</span></div>
        </div>
      </div>

      <div class="tile timeline-tile">
        <div class="tile-head">
          <div class="tile-title">Today's Timeline</div>
          <div class="tile-action">Logbook <svg><use href="#i-chev-r"/></svg></div>
        </div>
        <div class="timeline-axis">
          <div class="timeline-track"></div>
          <div class="timeline-planned" style="left:0;width:100%"></div>
          <div class="timeline-node out-planned" style="left:100%"></div>
        </div>
        <div class="timeline-ticks">
          <span>09:00</span><span>12:00</span><span>15:00</span><span>18:00</span>
        </div>
        <div class="timeline-legend">
          <div class="timeline-legend-item"><div class="timeline-legend-dot future"></div>Planned shift</div>
        </div>
      </div>

      <div class="tile">
        <div class="tile-head">
          <div class="tile-title">Team Today</div>
          <div class="tile-action">View all <svg><use href="#i-chev-r"/></svg></div>
        </div>
        <div class="team-row">
          <div class="team-avatars">
            <div class="team-av c0">AK</div>
            <div class="team-av c1">PD</div>
            <div class="team-av c2">RN</div>
            <div class="team-av more">+5</div>
          </div>
          <div class="team-meta">
            <div class="team-stat"><span class="num">3</span><span>in</span> <span class="sep">·</span> <span class="num leave">2</span><span>on leave</span></div>
            <div class="team-sub">Be early — 9 expected</div>
          </div>
        </div>
      </div>

      <div class="tile">
        <div class="tile-head"><div class="tile-title">Up Next</div></div>
        <div class="upn-list">
          <div class="upn-row">
            <div class="upn-icon"><svg><use href="#i-clock"/></svg></div>
            <div class="upn-body">
              <div class="upn-when">09:00 · 52m</div>
              <div class="upn-title">Branch opens</div>
              <div class="upn-sub">Liberty Infospace · Head Office</div>
            </div>
          </div>
          <div class="upn-row future">
            <div class="upn-icon meet"><svg><use href="#i-cal"/></svg></div>
            <div class="upn-body">
              <div class="upn-when">10:00 · 1h 52m</div>
              <div class="upn-title">Team standup</div>
              <div class="upn-sub">Conference Room B · 30 min</div>
            </div>
          </div>
          <div class="upn-row dim">
            <div class="upn-icon lunch"><svg><use href="#i-coffee"/></svg></div>
            <div class="upn-body">
              <div class="upn-when">13:00 · Scheduled</div>
              <div class="upn-title">Lunch break</div>
              <div class="upn-sub">45 min · Flex-time</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderMid(){
    return `
      <div class="tile hero">
        <span class="hero-tag live"><span class="dot"></span>Live · Punched in at ${fakeInTime()}</span>
        <div class="hero-num mono" id="liveTimer">05:18:42</div>
        <div class="hero-sub">Hours worked today</div>
        <div class="hero-actions">
          <button class="btn-secondary" id="btnBreak">
            <svg><use href="#i-coffee"/></svg>
            Take a Break
          </button>
          <button class="btn-secondary outline-coral" id="btnPunchOut">
            <svg><use href="#i-stop"/></svg>
            Punch Out
          </button>
        </div>
        <div class="hero-times">
          <div class="hero-time">
            <div class="tv mono">${fakeInTime()}</div>
            <div class="tl">In</div>
          </div>
          <div class="hero-time-sep">→</div>
          <div class="hero-time">
            <div class="tv mono">— : —</div>
            <div class="tl">Out</div>
          </div>
          <div class="hero-time-sep">·</div>
          <div class="hero-time">
            <div class="tv mono">2</div>
            <div class="tl">Breaks</div>
          </div>
        </div>
      </div>

      <div class="row-2up">
        <div class="tile">
          <div class="tile-head"><div class="tile-title">Location</div></div>
          <div class="loc-map">
            <div class="loc-geofence"></div>
            <div class="loc-dot"></div>
          </div>
          <div class="loc-status">
            <span class="badge">Inside</span>
          </div>
          <div class="loc-sub">Head Office · strong signal</div>
        </div>

        <div class="tile">
          <div class="tile-head"><div class="tile-title">Hours</div></div>
          <div class="ring-wrap">
            <svg class="ring-svg" viewBox="0 0 100 100">
              <circle class="ring-track" cx="50" cy="50" r="42"/>
              <circle class="ring-fill" id="ringFill" cx="50" cy="50" r="42" stroke-dasharray="263.9" stroke-dashoffset="100"/>
            </svg>
            <div class="ring-center" id="ringCenter">
              <div class="ring-num">5h 18m</div>
              <div class="ring-lbl">Worked</div>
            </div>
          </div>
          <div class="ring-target">of <span class="val">8h 30m</span> · <span class="val">62%</span></div>
        </div>
      </div>

      <div class="tile timeline-tile">
        <div class="tile-head">
          <div class="tile-title">Today's Timeline</div>
          <div class="tile-action">Logbook <svg><use href="#i-chev-r"/></svg></div>
        </div>
        <div class="timeline-axis">
          <div class="timeline-track"></div>
          <div class="timeline-filled" id="tFilled" style="left:2.2%;width:57%"></div>
          <div class="timeline-projected" id="tProjected" style="left:59.2%;width:40.8%"></div>
          <div class="timeline-node in" style="left:2.2%"></div>
          <div class="timeline-node break" style="left:22%" title="break"></div>
          <div class="timeline-node break" style="left:38%" title="break"></div>
          <div class="timeline-node now" id="tNow" style="left:59.2%"></div>
          <div class="timeline-node out-planned" style="left:100%"></div>
        </div>
        <div class="timeline-ticks">
          <span>09:00</span><span>12:00</span><span class="now">14:30</span><span>18:00</span>
        </div>
        <div class="timeline-legend">
          <div class="timeline-legend-item"><div class="timeline-legend-dot"></div>Worked</div>
          <div class="timeline-legend-item"><div class="timeline-legend-dot break"></div>Break</div>
          <div class="timeline-legend-item"><div class="timeline-legend-dot future"></div>Projected</div>
        </div>
      </div>

      <div class="tile">
        <div class="tile-head">
          <div class="tile-title">Team Today</div>
          <div class="tile-action">View all <svg><use href="#i-chev-r"/></svg></div>
        </div>
        <div class="team-row">
          <div class="team-avatars">
            <div class="team-av c0">AK</div>
            <div class="team-av c1">PD</div>
            <div class="team-av c2">RN</div>
            <div class="team-av c3">SM</div>
            <div class="team-av c4">VK</div>
            <div class="team-av more">+4</div>
          </div>
          <div class="team-meta">
            <div class="team-stat"><span class="num">9</span><span>in</span> <span class="sep">·</span> <span class="num leave">2</span><span>on leave</span></div>
            <div class="team-sub">Full bench today</div>
          </div>
        </div>
      </div>

      <div class="tile">
        <div class="tile-head"><div class="tile-title">Up Next</div></div>
        <div class="upn-list">
          <div class="upn-row dim">
            <div class="upn-icon lunch"><svg><use href="#i-coffee"/></svg></div>
            <div class="upn-body">
              <div class="upn-when">15:00 · in 22m</div>
              <div class="upn-title">Tea break</div>
              <div class="upn-sub">15 min · Auto-logged</div>
            </div>
          </div>
          <div class="upn-row future">
            <div class="upn-icon meet"><svg><use href="#i-cal"/></svg></div>
            <div class="upn-body">
              <div class="upn-when">16:00 · in 1h 22m</div>
              <div class="upn-title">Branch sync</div>
              <div class="upn-sub">With AK, PD · Conference B</div>
            </div>
          </div>
          <div class="upn-row close-row">
            <div class="upn-icon close"><svg><use href="#i-stop"/></svg></div>
            <div class="upn-body">
              <div class="upn-when">18:00 · in 3h 22m</div>
              <div class="upn-title">Shift ends</div>
              <div class="upn-sub">Planned punch-out · 8h 30m total</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderPost(){
    return `
      <div class="tile hero">
        <span class="hero-tag done"><span class="dot"></span>Day complete</span>
        <div class="hero-num post mono">8h 24m</div>
        <div class="hero-sub">+ <span class="mono">24 min</span> overtime · Target <span class="mono">8h 30m</span></div>
        <div class="hero-times">
          <div class="hero-time">
            <div class="tv mono">${fakeInTime()}</div>
            <div class="tl">In</div>
          </div>
          <div class="hero-time-sep">→</div>
          <div class="hero-time">
            <div class="tv mono">${fakeOutTime()}</div>
            <div class="tl">Out</div>
          </div>
          <div class="hero-time-sep">·</div>
          <div class="hero-time">
            <div class="tv mono">42m</div>
            <div class="tl">Breaks</div>
          </div>
        </div>
        <div class="hero-actions">
          <button class="btn-secondary"><svg><use href="#i-clock"/></svg>Logbook</button>
          <button class="btn-secondary outline-coral">Regularize</button>
        </div>
      </div>

      <div class="row-2up">
        <div class="tile">
          <div class="tile-head"><div class="tile-title">Location</div></div>
          <div class="loc-map">
            <div class="loc-geofence"></div>
            <div class="loc-dot faded"></div>
          </div>
          <div class="loc-status">
            <span class="badge faded">Last seen</span>
          </div>
          <div class="loc-sub">Head Office · 18:24</div>
        </div>

        <div class="tile">
          <div class="tile-head"><div class="tile-title">Hours</div></div>
          <div class="ring-wrap">
            <svg class="ring-svg" viewBox="0 0 100 100">
              <circle class="ring-track" cx="50" cy="50" r="42"/>
              <circle class="ring-fill done" cx="50" cy="50" r="42" stroke-dasharray="263.9" stroke-dashoffset="0"/>
              <circle class="ring-overtime" cx="50" cy="50" r="42" stroke-dasharray="12 263.9" stroke-dashoffset="-263.9"/>
            </svg>
            <div class="ring-center">
              <div class="ring-num">8h 24m</div>
              <div class="ring-lbl">Done</div>
            </div>
          </div>
          <div class="ring-target"><span class="val">100% + OT</span> · Above target</div>
        </div>
      </div>

      <div class="tile timeline-tile">
        <div class="tile-head">
          <div class="tile-title">Today's Timeline</div>
          <div class="tile-action">Logbook <svg><use href="#i-chev-r"/></svg></div>
        </div>
        <div class="timeline-axis">
          <div class="timeline-track"></div>
          <div class="timeline-filled done" style="left:2.2%;width:97.8%"></div>
          <div class="timeline-node in" style="left:2.2%"></div>
          <div class="timeline-node break" style="left:22%"></div>
          <div class="timeline-node break" style="left:38%"></div>
          <div class="timeline-node break" style="left:55%"></div>
          <div class="timeline-node done" style="left:100%"></div>
        </div>
        <div class="timeline-ticks">
          <span>09:00</span><span>12:00</span><span>15:00</span><span>18:24</span>
        </div>
        <div class="timeline-legend">
          <div class="timeline-legend-item"><div class="timeline-legend-dot" style="background:var(--emerald)"></div>Worked</div>
          <div class="timeline-legend-item"><div class="timeline-legend-dot break"></div>3 breaks · 42m</div>
        </div>
      </div>

      <div class="tile">
        <div class="tile-head">
          <div class="tile-title">Team Today</div>
          <div class="tile-action">View all <svg><use href="#i-chev-r"/></svg></div>
        </div>
        <div class="team-row">
          <div class="team-avatars">
            <div class="team-av c1">PD</div>
            <div class="team-av c2">RN</div>
            <div class="team-av c3">SM</div>
            <div class="team-av c4">VK</div>
            <div class="team-av more">+1</div>
          </div>
          <div class="team-meta">
            <div class="team-stat"><span class="num">5</span><span>still in</span></div>
            <div class="team-sub">4 punched out · 2 on leave</div>
          </div>
        </div>
      </div>

      <div class="tile">
        <div class="tile-head"><div class="tile-title">Up Next</div></div>
        <div class="upn-list">
          <div class="upn-row future">
            <div class="upn-icon meet"><svg><use href="#i-cal"/></svg></div>
            <div class="upn-body">
              <div class="upn-when">Tomorrow · 09:00</div>
              <div class="upn-title">Branch opens</div>
              <div class="upn-sub">Mon · Liberty Infospace · Head Office</div>
            </div>
          </div>
          <div class="upn-row dim">
            <div class="upn-icon"><svg><use href="#i-flame"/></svg></div>
            <div class="upn-body">
              <div class="upn-when">7-day streak</div>
              <div class="upn-title">Punched in on time</div>
              <div class="upn-sub">Up from 5-day last week</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function render(){
    stopLiveTimer();
    if (state === 'pre'){
      body.innerHTML = renderPre();
      stateChip.dataset.state = 'pre';
      stateChipLbl.textContent = 'PRE';
      wirePre();
    } else if (state === 'mid'){
      body.innerHTML = renderMid();
      stateChip.dataset.state = 'mid';
      stateChipLbl.textContent = 'MID';
      wireMid();
      startLiveTimer();
    } else if (state === 'post'){
      body.innerHTML = renderPost();
      stateChip.dataset.state = 'post';
      stateChipLbl.textContent = 'POST';
    }
    body.scrollTop = 0;
  }

  function wirePre(){
    var btn = document.getElementById('btnPunchIn');
    if (btn) btn.addEventListener('click', openPunchInSheet);
  }
  function wireMid(){
    var brk = document.getElementById('btnBreak');
    if (brk) brk.addEventListener('click', openBreakSheet);
    var out = document.getElementById('btnPunchOut');
    if (out) out.addEventListener('click', openPunchOutSheet);
  }

  // ── Sheets ────────────────────────────────────────────────────
  function openSheet(html){
    sheet.innerHTML = html;
    sheet.classList.add('open');
    sheetBg.classList.add('open');
  }
  function closeSheet(){
    sheet.classList.remove('open');
    sheetBg.classList.remove('open');
  }
  sheetBg.addEventListener('click', closeSheet);

  function openPunchInSheet(){
    openSheet(`
      <div class="sheet-grab"></div>
      <h2 class="sheet-title">Confirm Punch In</h2>
      <p class="sheet-sub">${new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'short'})} · 09:08</p>
      <div class="viewfinder">
        <svg><use href="#i-user"/></svg>
        <div class="scan"></div>
      </div>
      <div class="sheet-check-row">
        <div class="ic"><svg><use href="#i-check"/></svg></div>
        <div style="flex:1">
          <div class="lbl">Inside Head Office</div>
          <div class="val">Geofence locked · 12m signal</div>
        </div>
      </div>
      <div class="sheet-check-row">
        <div class="ic"><svg><use href="#i-check"/></svg></div>
        <div style="flex:1">
          <div class="lbl">Liberty Infospace</div>
          <div class="val">Head Office · Ahmedabad</div>
        </div>
      </div>
      <button class="sheet-confirm" id="confirmIn">
        <svg><use href="#i-zap"/></svg>
        Confirm Punch In
      </button>
      <a class="sheet-cancel" id="cancelSheet">Cancel</a>
    `);
    document.getElementById('confirmIn').addEventListener('click', function(){
      closeSheet();
      state = 'mid';
      render();
    });
    document.getElementById('cancelSheet').addEventListener('click', closeSheet);
  }

  function openBreakSheet(){
    openSheet(`
      <div class="sheet-grab"></div>
      <h2 class="sheet-title">On a break</h2>
      <p class="sheet-sub">Pause the timer · auto-end at 15:00</p>
      <div class="break-timer" id="breakTimer">00:00:08</div>
      <p class="break-since">Since 14:30 · Auto-end 15 min</p>
      <button class="sheet-confirm" id="endBreak">
        <svg><use href="#i-zap"/></svg>
        End Break
      </button>
      <a class="sheet-cancel" id="cancelSheet">Stay on break</a>
    `);
    // Mini break ticker
    var t0 = Date.now();
    var btSec = 8;
    var bt = setInterval(function(){
      var el = document.getElementById('breakTimer');
      if (!el){ clearInterval(bt); return; }
      var s = btSec + Math.floor((Date.now()-t0)/1000);
      el.textContent = fmtHMS(s);
    }, 1000);
    document.getElementById('endBreak').addEventListener('click', function(){
      clearInterval(bt);
      closeSheet();
    });
    document.getElementById('cancelSheet').addEventListener('click', function(){
      clearInterval(bt);
      closeSheet();
    });
  }

  function openPunchOutSheet(){
    openSheet(`
      <div class="sheet-grab"></div>
      <h2 class="sheet-title">Punch Out for the day?</h2>
      <p class="sheet-sub">8h 24m worked · +24m overtime</p>
      <div class="sheet-check-row">
        <div class="ic"><svg><use href="#i-check"/></svg></div>
        <div style="flex:1">
          <div class="lbl">Inside Head Office</div>
          <div class="val">Still in geofence</div>
        </div>
      </div>
      <div class="sheet-check-row">
        <div class="ic" style="background:var(--slate-blue-soft);color:var(--slate-blue)"><svg><use href="#i-clock"/></svg></div>
        <div style="flex:1">
          <div class="lbl">3 breaks · 42m total</div>
          <div class="val">Within policy · Net 8h 24m</div>
        </div>
      </div>
      <button class="sheet-confirm" id="confirmOut">
        <svg><use href="#i-stop"/></svg>
        Confirm Punch Out
      </button>
      <a class="sheet-cancel" id="cancelSheet">Keep working</a>
    `);
    document.getElementById('confirmOut').addEventListener('click', function(){
      closeSheet();
      state = 'post';
      render();
    });
    document.getElementById('cancelSheet').addEventListener('click', closeSheet);
  }

  // ── State cycler ──────────────────────────────────────────────
  stateChip.addEventListener('click', function(){
    state = state === 'pre' ? 'mid' : state === 'mid' ? 'post' : 'pre';
    render();
  });

  // Initial render
  render();
})();
