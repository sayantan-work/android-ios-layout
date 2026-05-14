/* v19 — Quiet · Minimalist punch page
   States: pre · moment · mid · post
   No tiles, no chips, no badges. Hairlines + type.
   Coral is reserved for the live state dot only. */

(function(){
  var body = document.getElementById('body');
  var stateChip = document.getElementById('stateChip');
  var stateChipLbl = document.getElementById('stateChipLbl');
  var sheet = document.getElementById('sheet');
  var sheetBg = document.getElementById('sheetBg');

  var state = 'pre';
  var liveTickHandle = null;

  function fmtHMS(sec){
    var h = Math.floor(sec/3600);
    var m = Math.floor((sec%3600)/60);
    var s = sec%60;
    return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  }

  function startLiveTimer(){
    stopLiveTimer();
    var base = 5*3600 + 18*60 + 42;
    var t0 = Date.now();
    function tick(){
      var el = document.getElementById('liveTimer');
      if (!el) return;
      var sec = base + Math.floor((Date.now() - t0) / 1000);
      el.textContent = fmtHMS(sec);
      updateTimelineNow(sec);
    }
    tick();
    liveTickHandle = setInterval(tick, 1000);
  }
  function stopLiveTimer(){
    if (liveTickHandle){ clearInterval(liveTickHandle); liveTickHandle = null; }
  }

  function updateTimelineNow(elapsedSec){
    var nowTick = document.getElementById('tNow');
    var fill = document.getElementById('tFill');
    if (!nowTick) return;
    var inMin = 12;
    var nowMin = inMin + (elapsedSec / 60);
    var totalMin = 9 * 60;
    var pctNow = Math.min(1, nowMin / totalMin);
    nowTick.style.left = (pctNow * 100) + '%';
    if (fill) fill.style.width = (pctNow * 100) + '%';
  }

  // ── Renderers ──
  function renderPre(){
    return `
      <div class="section">
        <div class="label">Today · Tuesday, 13 May</div>
        <p class="display">09:08</p>
        <p class="caption">Branch opens at <span class="mono">09:00</span> · you're <span class="mono">2.4&nbsp;km</span> out</p>
      </div>

      <div class="section" style="text-align:center">
        <button class="cta-round" id="actPunchIn" type="button" aria-label="Punch in">
          <span class="cr-glyph"><svg><use href="#i-zap"/></svg></span>
          <span class="cr-lbl">Punch in</span>
        </button>
        <p class="cta-caption">ETA Head Office · <span class="v">~12 min by car</span></p>
      </div>

      <div class="section">
        <div class="label">Shift window</div>
        <div class="timeline-thin">
          <div class="tick" style="left:0"></div>
          <div class="tick" style="left:100%"></div>
        </div>
        <div class="timeline-ticks"><span>09:00</span><span>13:00</span><span>18:00</span></div>
        <p class="branch-line" style="margin-top:14px">
          Liberty Infospace, Head Office · <span class="v">flexible hours</span><br>
          target <span class="v">8h 30m</span> · 3 already in
        </p>
      </div>
    `;
  }

  function renderMid(){
    return `
      <div class="section">
        <span class="live">Live · in at 09:12</span>
        <p class="big-num" id="liveTimer">05:18:42</p>
        <p class="caption tight">Hours worked today · target 8h 30m</p>
      </div>

      <div class="section" style="text-align:center">
        <button class="cta-round" id="actPunchOut" type="button" aria-label="Punch out">
          <span class="cr-glyph"><svg><use href="#i-stop"/></svg></span>
          <span class="cr-lbl">Punch out</span>
        </button>
        <p class="cta-caption">or <span class="action" id="actBreak" style="font-size:11px;border-bottom-width:1px;padding-bottom:0">take a break</span></p>
      </div>

      <div class="section">
        <div class="label">Today</div>
        <div class="timeline-thin">
          <div class="fill" id="tFill" style="width:60%"></div>
          <div class="tick" style="left:2.2%"></div>
          <div class="tick break" style="left:22%"></div>
          <div class="tick break" style="left:38%"></div>
          <div class="tick now" id="tNow" style="left:60%"></div>
          <div class="tick" style="left:100%"></div>
        </div>
        <div class="timeline-ticks"><span>09:00</span><span>13:00</span><span>18:00</span></div>
        <div class="numrow">
          <div><span class="v">09:12</span><span class="l">In</span></div>
          <div><span class="v dim">— : —</span><span class="l">Out</span></div>
          <div><span class="v">2</span><span class="l">Breaks</span></div>
        </div>
      </div>
    `;
  }

  function renderPost(){
    return `
      <div class="section">
        <div class="check-glyph">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <p class="big-num">8h 24m</p>
        <p class="caption">Day complete · <span class="mono">+24 min</span> over target</p>
      </div>

      <div class="section">
        <span class="action muted">Request regularization</span>
      </div>

      <div class="section">
        <div class="label">Today</div>
        <div class="timeline-thin">
          <div class="fill" style="width:97.8%"></div>
          <div class="tick" style="left:2.2%"></div>
          <div class="tick break" style="left:22%"></div>
          <div class="tick break" style="left:38%"></div>
          <div class="tick break" style="left:55%"></div>
          <div class="tick" style="left:100%"></div>
        </div>
        <div class="timeline-ticks"><span>09:12</span><span>13:00</span><span>18:24</span></div>
        <div class="numrow">
          <div><span class="v">09:12</span><span class="l">In</span></div>
          <div><span class="v">18:24</span><span class="l">Out</span></div>
          <div><span class="v">42m</span><span class="l">Breaks</span></div>
        </div>
      </div>
    `;
  }

  function render(){
    stopLiveTimer();
    if (state === 'pre'){
      body.innerHTML = renderPre();
      stateChip.dataset.state = 'pre';
      stateChipLbl.textContent = 'pre';
      var ab = document.getElementById('actPunchIn');
      if (ab) ab.addEventListener('click', openPunchInSheet);
    } else if (state === 'mid'){
      body.innerHTML = renderMid();
      stateChip.dataset.state = 'mid';
      stateChipLbl.textContent = 'live';
      var b = document.getElementById('actBreak');
      if (b) b.addEventListener('click', openBreakSheet);
      var o = document.getElementById('actPunchOut');
      if (o) o.addEventListener('click', openPunchOutSheet);
      startLiveTimer();
    } else if (state === 'post'){
      body.innerHTML = renderPost();
      stateChip.dataset.state = 'post';
      stateChipLbl.textContent = 'done';
    }
    body.scrollTop = 0;
  }

  // ── Sheet helpers ──
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
      <h2 class="sheet-title">Confirm punch in</h2>
      <p class="sheet-sub">Tuesday, 13 May · 09:08</p>

      <div class="viewfinder">
        <svg><use href="#i-user"/></svg>
        <div class="scan"></div>
      </div>

      <div class="sheet-row">
        <span class="k">Location</span>
        <span class="v">Inside Head Office</span>
      </div>
      <div class="sheet-row">
        <span class="k">Branch</span>
        <span class="v">Liberty Infospace</span>
      </div>
      <div class="sheet-row">
        <span class="k">Signal</span>
        <span class="v mono">12m · strong</span>
      </div>

      <div class="sheet-actions" style="align-items:stretch">
        <button class="cta" id="confirmIn" type="button">Confirm punch in</button>
        <span class="action muted" id="cancelSheet" style="border-bottom-color:transparent;color:var(--text-3);align-self:center">Cancel</span>
      </div>
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
      <p class="sheet-sub">Auto-end at 15:00 · 15 min</p>

      <div class="break-timer" id="breakTimer">00:00:08</div>
      <p class="break-since">since 14:30</p>

      <div class="sheet-actions" style="align-items:stretch">
        <button class="cta" id="endBreak" type="button">End break</button>
        <span class="action muted" id="cancelSheet" style="border-bottom-color:transparent;color:var(--text-3);align-self:center">Stay on break</span>
      </div>
    `);
    var t0 = Date.now();
    var btSec = 8;
    var bt = setInterval(function(){
      var el = document.getElementById('breakTimer');
      if (!el){ clearInterval(bt); return; }
      var s = btSec + Math.floor((Date.now()-t0)/1000);
      el.textContent = fmtHMS(s);
    }, 1000);
    document.getElementById('endBreak').addEventListener('click', function(){ clearInterval(bt); closeSheet(); });
    document.getElementById('cancelSheet').addEventListener('click', function(){ clearInterval(bt); closeSheet(); });
  }

  function openPunchOutSheet(){
    openSheet(`
      <div class="sheet-grab"></div>
      <h2 class="sheet-title">Punch out for the day?</h2>
      <p class="sheet-sub">8h 24m worked · +24 min over target</p>

      <div class="sheet-row">
        <span class="k">In</span>
        <span class="v mono">09:12</span>
      </div>
      <div class="sheet-row">
        <span class="k">Now</span>
        <span class="v mono">18:24</span>
      </div>
      <div class="sheet-row">
        <span class="k">Breaks</span>
        <span class="v mono">3 · 42m</span>
      </div>

      <div class="sheet-actions" style="align-items:stretch">
        <button class="cta" id="confirmOut" type="button">Confirm punch out</button>
        <span class="action muted" id="cancelSheet" style="border-bottom-color:transparent;color:var(--text-3);align-self:center">Keep working</span>
      </div>
    `);
    document.getElementById('confirmOut').addEventListener('click', function(){
      closeSheet();
      state = 'post';
      render();
    });
    document.getElementById('cancelSheet').addEventListener('click', closeSheet);
  }

  stateChip.addEventListener('click', function(){
    state = state === 'pre' ? 'mid' : state === 'mid' ? 'post' : 'pre';
    render();
  });

  render();
})();
