# v18 — Stacks

## Design DNA · widget-gallery for HRMS

v18 is the **first iteration that's only the punch page**. Across v1–v17 the punch screen has been the same skeleton: one giant circle with current time inside, one "When you're ready" caption, three sub-stats. Only the skin changed. v18 throws out the skeleton.

The page is now a **stack of discrete modular tiles** — each tile is one concern, each tile morphs by time-of-day, and the *hero tile* changes shape across the day's four states (pre-punch · punch moment · mid-shift · post-punch). Lineage: **iOS widget gallery · Apple Sports · Apple Watch face stack · Arc Search cards**.

The accent is a single **warm coral `#FF6B35`** — untouched in v1–v17 (every prior version used violet, cobalt, red-stamp, amber-CRT, or emerald; never coral). Coral signals action without the corporate-banking weight of cobalt or the AI-cliché of violet.

## The four states

The page renders different content depending on what state you're in:

### 1 · Pre-punch (before shift start, or before tap)
- **Hero tile** — coral "Punch In" CTA (big, full-width), subtitle with branch window + your distance.
- **Location tile** — mini map with geofence ring, you-dot either inside (green) or outside (amber).
- **Hours tile** — empty ring with target "Aim 8h 30m".
- **Timeline tile** — empty 09:00 → 18:00 strip, shift window highlighted.
- **Team tile** — "Be the first in" or "3 already in".
- **Up next tile** — "Branch opens in 30m".

### 2 · Punch-in moment (modal sheet)
Slides up over the hero:
- Face capture viewfinder (decorative — circle silhouette).
- Geofence confirm row with green check.
- Branch confirm row.
- "Confirm Punch In" coral button.
- Cancel chip.
Dismissing returns to mid-shift state.

### 3 · Mid-shift (punched in)
- **Hero tile** — live `HH:MM:SS` mono timer (counts up every second from punched-in time), "In at 09:12" subtitle, two action buttons: Break (secondary) and Punch Out (coral).
- **Location tile** — green geofence lock, "Inside · strong signal".
- **Hours tile** — filled ring at current %, with break segments shown as gaps.
- **Timeline tile** — filled bar from punch-in to now, dashed projection to 18:00.
- **Team tile** — "9 in · 2 on leave" with avatar overlap.
- **Up next tile** — "Lunch in 22m" or next meeting.

### 4 · Post-punch (day complete)
- **Hero tile** — emerald check, big "8h 24m" total, "+ 24m overtime" line, In/Out times, "Request regularize" secondary button.
- **Location tile** — faded "Last seen Head Office".
- **Hours tile** — full ring + overtime arc segment.
- **Timeline tile** — complete arc with all events.
- **Team tile** — "5 still in".
- **Up next tile** — "Tomorrow · 09:00".

## Visual recipe

### Canvas
| Token | Value | Use |
|---|---|---|
| `--bg` | `#0B0F14` | Deep slate canvas (cooler than v16's `#0A0A0B`) |
| `--surface` | `#151A22` | Tile surface — flat, no gradient |
| `--surface-2` | `#1D2330` | Raised elements inside tiles (chips, ring tracks) |
| `--line` | `rgba(255,255,255,0.06)` | Tile hairline border, 1px |
| `--text` | `#F3F4F6` | Primary text |
| `--text-2` | `#9CA3AF` | Secondary text |
| `--text-3` | `#6B7280` | Tertiary / labels |

### Accents
| Token | Value | Use |
|---|---|---|
| `--coral` | `#FF6B35` | Single primary accent — CTAs, live indicator, brand mark |
| `--coral-soft` | `rgba(255,107,53,0.16)` | Tinted backgrounds |
| `--coral-glow` | `rgba(255,107,53,0.32)` | Outer glow on active hero |
| `--emerald` | `#22C55E` | In-state, done, geofence-inside |
| `--amber` | `#F59E0B` | Late, outside geofence, warning |
| `--slate-blue` | `#60A5FA` | Info chips, links |

### Tile shape
- Border radius **28px** (large squircle, distinctive vs v17's 14px)
- 1px hairline border `rgba(255,255,255,0.06)`
- Inner top highlight `rgba(255,255,255,0.04)` (1px linear-gradient at top)
- No drop shadow on tiles in dark mode — depth comes from the highlight + glow
- **Hero tile only** gets a soft coral outer glow when state-active

### Typography
- Inter sans for UI (system fallback)
- JetBrains Mono for all numbers, times, codes
- Mid-shift timer: 56px mono, weight 700, letter-spacing -0.04em, tabular nums
- Post-shift total: 44px mono, weight 700
- Tile titles: 10px sans, weight 600, uppercase, 0.12em tracking
- Tile body: 13px sans

### Light mode
- Canvas flips to `#FAFAFA`
- Tiles become `#FFFFFF` with `1px solid rgba(0,0,0,0.06)` border + `0 1px 2px rgba(0,0,0,0.04)` shadow
- Inner highlight removed (it's a dark-mode trick)
- Coral accent **stays the same coral** — it works on both

## Interactions
- **Hero tile** is the primary tap target — opens punch-in/out sheet
- **Mid-shift swipe-down on hero** → break sheet
- **Tap Location tile** → full map detail sheet
- **Long-press hero post-punch** → regularization request sheet
- **State cycler chip** (top-right of phone, prototype-only) → cycles Pre → Mid → Post for demo

## Carries forward from v17
- 5-tab IA (Home / Workspace / Punch / Chats / Me)
- Permission model (Sayantan as L2 Branch Manager)
- Single identity, no switcher
- Light/dark toggle pattern (key: `v18-mode`)
- Org chip + bell + status bar header

## Diff from v17
| Aspect | v17 (Aurora) | v18 (Stacks) |
|---|---|---|
| Hero | Single mesh-gradient band with frosted circle | Stack of squircle tiles, hero morphs by state |
| Visual texture | 4-blob radial mesh + SVG grain | Flat tiles with hairline + inner highlight |
| Brand mark | Violet→Magenta→Cyan 3-stop gradient | Single coral solid `#FF6B35` |
| Punch surface | One circle, "When you're ready" + 3 stats below | Hero · Location · Hours · Timeline · Team · Up next |
| Punch states surfaced | 1 (idle) + 1 (in) | 4 (pre / moment / mid / post) |
| Tile radius | 14px | 28px |
| Numbers | Live elapsed counter (in-state) | Live HH:MM:SS timer in mid-state hero |

## RN port notes
- Tiles are plain `View`s with `borderRadius:28` and `backgroundColor` — no special primitives needed.
- Inner top highlight: render a 1px `View` with `position:absolute; top:0; left:0; right:0; height:1; backgroundColor:rgba(255,255,255,0.04)`.
- Hero glow: `shadowColor:'#FF6B35'; shadowOpacity:0.32; shadowRadius:24; elevation:8` (iOS only — Android use a faint border).
- Live timer: a single `setInterval(1000)` that updates a Text component with formatted elapsed seconds. Make sure to clear on unmount.
- Mini-map: `react-native-maps` with a circle overlay for the geofence; for prototype, a static `Image` works.

## Open questions
- Should the timeline tile be tappable to enter a full day-history view, or stay decorative? (Currently decorative.)
- The break sheet auto-dismisses after 30s for prototype — real product needs a configurable "max break duration" tied to attendance policy.
- Selfie capture in punch-in moment is a placeholder silhouette — real product needs face-match API integration.

## Research signals
- iOS 17/18 widget gallery aesthetic (large squircle, single-purpose tiles).
- Apple Sports app — single-team focus, modular cards, big numbers.
- Apple Watch faces (Modular / Modular XL) — discrete data complications stacked.
- Arc Search "Browse for me" result cards — flat surfaces, hairline borders.
