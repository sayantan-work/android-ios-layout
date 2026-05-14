# v19 — Quiet

## Design DNA · Swiss minimalist, type-first

v19 is the **minimalist counter-iteration to v18 (Stacks)**. v18 packed the page with squircle tiles, coral CTAs, glowing rings, and live chips — it's information-dense by design. v19 strips all of that down to the minimum that still answers "what's my punch state?".

Lineage: **Apple Health single-stat screens · iA Writer · Patagonia editorial · Stripe Press · Helvetica Now**.

## Rules of restraint

1. **No tiles, no cards, no borders.** Hierarchy comes from **whitespace and type**, never from boxes.
2. **No color except one coral dot** at `#FF6B35` — appears only when punched in (the live indicator). Every other pixel is monochrome.
3. **Hairline dividers only.** A single `1px rgba(0,0,0,0.06)` line separates major sections. No background fills, no shadows, no glows.
4. **Type does the work.** Big sans display for the primary number. Small uppercase mono for labels. Body sans for context.
5. **Generous breathing room.** Tiles in v18 were 18px padded; v19 sections are 32–56px apart.
6. **One primary action per state, full-width text-style.** No pill chips, no icon buttons.

## The four states (same substance as v18, none of the chrome)

### Pre-punch
- Top stack: organisation line · current clock.
- Center: huge **09:08** display, "Tuesday, 13 May" caption.
- Below: single full-width action — **Punch in →** as underlined link, not a button.
- Bottom: hairline · "branch · 09:00–18:00 · you're 2.4 km out".

### Punch-in moment (sheet)
Same four-line content as v18's sheet, but rendered as text rows separated by hairlines — no check-circles, no coloured pills, no viewfinder ring. The face capture is a 1px square outline with a single thin scanning line.

### Mid-shift
- Tiny **● Live** indicator at top (the *only* coral pixel in the app).
- Huge mono **05:18:42** elapsed timer.
- Caption: "punched in at 09:12".
- Two text-style actions stacked: **Take a break** and **Punch out** — underlined, not buttoned.
- Below the hairline: today's three numbers as a single row — **09:12 · — · 5h 18m**.
- Tiny horizontal **rule** acting as today's timeline (filled in black up to "now", thin rule beyond).

### Post-punch
- Top: **✓** glyph in near-black (no green).
- Huge sans display **8h 24m**.
- Caption: "+ 24m over target · in 09:12 · out 18:24".
- Below hairline: **Request regularization →** as text action.
- Bottom: thin timeline rule with the day's punches as 1px ticks.

## Visual recipe

### Light canvas (default)
| Token | Value |
|---|---|
| `--bg` | `#FFFFFF` pure white |
| `--text` | `#0A0A0A` near-black |
| `--text-2` | `#525252` |
| `--text-3` | `#A3A3A3` |
| `--hairline` | `rgba(0,0,0,0.06)` |
| `--accent` | `#FF6B35` (used ONLY for the live dot, ~6×6px) |

### Dark canvas (mode toggle)
| Token | Value |
|---|---|
| `--bg` | `#000000` pure black |
| `--text` | `#FAFAFA` |
| `--text-2` | `#A3A3A3` |
| `--text-3` | `#525252` |
| `--hairline` | `rgba(255,255,255,0.08)` |
| `--accent` | `#FF6B35` (unchanged) |

### Typography
- **Inter** sans-serif throughout; **JetBrains Mono** for numbers and times.
- Display number: **88px**, weight 300 (light), letter-spacing `-0.04em`.
- Big total (post-shift): **64px** mono, weight 500.
- Live timer (mid-shift): **64px** mono, weight 500.
- Caption: **14px**, weight 400, `var(--text-2)`.
- Labels: **10px** mono, weight 500, uppercase, letter-spacing `0.18em`, `var(--text-3)`.
- Actions: **17px** sans, weight 500, underline `1px` `var(--text)`.

### Spacing
- Page horizontal padding: 28px (vs v18's 14px tile gutter)
- Section vertical rhythm: **48px** between major blocks
- Hairlines are full-width, no inset

### What's removed vs v18
| v18 has | v19 omits |
|---|---|
| 6 squircle tiles | All tiles |
| Coral primary buttons | All filled buttons |
| Mini geofence map | Map (replaced by 1 line of text) |
| Hours ring SVG | Ring (replaced by 1 number) |
| Team avatar row | Team display entirely |
| Up Next list with icons | Up next entirely (or 1 line max) |
| Background glows + inner highlights | All glows, shadows, highlights |
| 14 separate accent colours (emerald, amber, slate-blue, coral × 3) | 13 of them; only coral remains, and only as the live dot |

## Carries forward from v18 / earlier
- 5-tab IA at bottom (very thin, no labels — just icons at ~14% opacity until active)
- Single identity (Sayantan Ghosh, L2 Branch Manager, Liberty Infospace · Head Office)
- Light/dark toggle (key: `v19-mode`)
- All four punch states (pre · moment · mid · post)
- State cycler chip for prototype (but as a tiny mono text link, not a coral pill)

## Open notes
- v19 is **deliberately quiet to a fault**. If the user later wants something between v18's density and v19's hush, the answer is to make v20 with one or two of v18's tiles brought back as cards (location + hours, say), keep the typography from v19.
- The coral live dot is the only departure from pure monochrome. Pure-monochrome version (no coral at all) is one CSS variable swap away — change `--accent` to `var(--text)`.
- Tab bar icons are 14% opacity until active. This is intentional — they almost disappear, which is the point of minimalist. If they need to be more visible, bump to 28%.
