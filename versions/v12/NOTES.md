# v12 — Method

## Design DNA · A disciplined synthesis of v7 + v8 + v10 + v11

v12 is not another fresh aesthetic — it is a deliberate **merge of the four best moments** in the design history. It keeps v11's pure-white canvas and electric cobalt accent, but applies v8's hairline-list discipline so the app stops feeling like cards-on-cards. From v10 it borrows the editorial section-header pattern (small-caps tracked label riding a hairline rule). From v7 it inherits the flat-5-tab IA and the "see-all, act-only-if-permitted" permission model unchanged.

The point of v12 is that **most things are lists, not cards.** A card is reserved for a hero: the Punch circle, the Salary donut, the Announcement teaser, the Home punch-status. Everything else — attendance days, requests, chats, Me items, the locked-action rows — is a hairline row on pure white. This is the productivity-tool discipline of Linear / Things / Todoist applied to a banking-trust palette.

### Where each ancestor shows up

**From v7** — flat 5-tab IA (Home · Workspace · Punch · Chats · Me); persona-invariant; locked-action pattern with bottom-sheet explanations.

**From v8** — hairline lists replace cards as the default surface. Circle checkboxes. System fonts only. Single saturated accent applied with restraint.

**From v10** — editorial section headers: a small-caps tracked label sitting on a hairline rule that runs the width of the section. The attendance becomes a logbook list (day-of-week + date + times + status chip).

**From v11** — pure `#FFFFFF` canvas, electric cobalt `#0052FF`, system sans 500–700, high-contrast text scale, solid-fill cobalt chips, the white-circle-inverts-to-cobalt punch hero with no dark band.

## The 3-tier elevation hierarchy

The core idea that makes v12 different from v11:

| Tier | What | Treatment | Examples |
|---|---|---|---|
| **Hairline** | Lists of equal-weight rows | `0 0 0 1px var(--line)` between rows; no fill; no shadow | Quick-access list, requests, chats, attendance logbook, notifications |
| **Subtle card** | Grids of small actions/stats | `0 0 0 1px var(--line)`; white fill; no shadow | Me tiles, Home stats, team actions, attendance summary cells |
| **Hero card** | Anchor surfaces — the user's eye lands here | `0 1px 2px / 0 4px 16px` ambient shadow + 1px border | Punch hero, salary donut, home announcement, home punch-status, all-day cards |

This means v12 has a visible rhythm: scrolling past lists feels flat (v8), but heroes lift off the page so the user knows where to look.

## Editorial section heads

```
┌───────── ATTENDANCE · MAY 2026 ─────────────────────── ON TIME ────┐
                                                          ▲
                       small-caps tracked label           hairline rule
                       at section start                   runs through, breaks for both labels
```

CSS sketch:
```css
.sec-h::before { position:absolute; left:0; right:0; top:50%; height:1px; background:var(--line); }
.sec-t { background:var(--bg); padding-right:10px; position:relative; z-index:1; }
.sec-meta { background:var(--bg); padding-left:10px; position:relative; z-index:1; }
```

Pure CSS, zero assets, RN-portable: the React Native equivalent draws a horizontal `View` with a 1px height behind a `Text` that has padding + a `backgroundColor` matching the canvas. The rule "breaks" because the text covers it.

## Attendance · logbook (v10 spirit, v8 execution)

v9/v10's RFID card metaphor and v11's clean card both wrapped attendance in a box. v12 removes the box entirely. Each day is a hairline-separated row:

```
─────────────────────────────────────────────
 MON   09:08 — 18:14            PRESENT · 09:08
─────────────────────────────────────────────
 TUE   09:03 — 18:01            PRESENT · 09:03
─────────────────────────────────────────────
 WED   09:15 — 18:10            LATE · 09:15
─────────────────────────────────────────────
 TODAY 09:08 — ——:——            ON TIME       ← cobalt-tint background
─────────────────────────────────────────────
```

Today's row gets a left-to-right cobalt-soft gradient wash (subtle highlight without a box).

## Palette
| Token | Value | Role |
|---|---|---|
| `--bg` | `#FFFFFF` | Pure white canvas (v11) |
| `--text` | `#0A0A0A` | Near-pure black (v11) |
| `--text-2` | `#525252` | Strong secondary (v11) |
| `--sage` | `#0052FF` | Electric cobalt — single saturated accent (v11) |
| `--sage-soft` | `#E5EBFF` | Pale cobalt wash for chip backgrounds, today-row, AI thread (v11) |
| `--sage-deep` | `#003BCC` | Deep cobalt for chip text on soft fill (v11) |
| `--forest` | `#10B981` | Earnings (kept from v10 donut fix) |
| `--red` | `#EF4444` | Deductions (kept from v10 donut fix) |
| `--line` | `#EAEAEA` | The workhorse hairline (v8) |
| `--line-2` | `#F0F0F0` | Lighter rule for section heads |

## Typography
- **Stack:** `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif` (v11)
- **Weights:** 500 (body/rows), 600 (chips/buttons/list-titles), 700 (display/section heads/numbers) — no 400, no italic
- Section heads: `10.5px / 700 / 0.14em uppercase` riding a hairline rule (v10 editorial idea in sans)
- Hero numerals: `28-40px / 700 / -0.03em` with `font-feature-settings: 'tnum','ss01'`

## IA — bottom tab bar (unchanged from v7→v11)
**5 tabs**, Punch elevated in the center: Home · Workspace · Punch · Chats · Me

## Component inventory (RN-named)
| RN component | v12 behavior |
|---|---|
| `NavHeader` | Hairline border bottom, combined company/branch chip (v9 carry-forward) |
| `TabBar` | Cobalt active, white pedestal for Punch (inverts to cobalt when active) |
| `PunchHeroCard` | Lifted white card with cobalt-ring circle (v11) |
| `CirclePunchButton` | White-fill idle with cobalt ring; **cobalt fill** when punched-in |
| `AttendanceLogbook` ⟵ renamed | Hairline rows on pure white, day-of-week column, today highlighted with cobalt-soft wash (v8 + v10) |
| `SectionHead` ⟵ new | Small-caps label riding a hairline rule (v10 editorial in sans) |
| `StatusChip` | Solid cobalt fill + white text (v11) |
| `ListRow` | Hairline rows, no card (v8) |
| `MeTileGrid` ⟵ renamed | Subtle cards in a 2-col grid — middle tier of the elevation hierarchy |
| `SalaryDonut` | Hero card; forest earnings + red deductions (v10 donut fix on v11 card) |
| `LocationMap` | Cobalt geofence + cobalt building marker on neutral grey |
| `LockedAction` | Bordered cobalt lock icon, same `<bottom-sheet>` pattern (v7 model) |

## RN port notes
- All hairlines map to `borderTopWidth: 1, borderColor: '#EAEAEA'` — no extra views needed
- Editorial section heads: render `<Text>` with `paddingHorizontal: 10, backgroundColor: '#FFF'` inside a relatively-positioned row whose `View` parent draws a 1px tall `View` at `top: '50%'` — text covers the rule
- 3-tier shadow tokens map directly to RN `shadowColor/shadowOffset/shadowOpacity/shadowRadius` + Android `elevation`

## Diff from v11 (the immediate predecessor)
- v11 over-cards (border + shadow on everything) → v12 **3-tier hierarchy** (hairlines / subtle cards / hero cards)
- v11 boxed white RFID attendance → v12 **attendance logbook** (hairline rows, no card, today highlight gradient)
- v11 plain bold section heads → v12 **editorial small-caps headers riding a hairline rule** (v10 idea in sans)
- v11 grid cards have ambient shadows → v12 grid cards are **hairline-only** (visible, not lifted)
- Same cobalt, same sans, same high-contrast type — the visual language is the same; the **rhythm** is different

## Diff from v8
- v8 single red accent → v12 single cobalt accent (v11 palette)
- v8 hero is just a typographic moment → v12 hero is a lifted card with breathing-glow circle
- v8 had no section heads (just rows) → v12 has editorial small-caps section heads

## Open questions / notes
- Is the `sec-h::before` hairline-rule readable on all section widths? Tested in 340px phone frame; if section meta is long, the right padding may need to grow.
- The attendance logbook reads top-down — older days first. Today is at the bottom. We may want to invert this so today is at the top of the list. Current rendering follows v9's data order; adjustable in script.js.
- Best fit: teams that loved v11's banking-trust feel but found it visually busy. v12 is the same color story but with more whitespace and discipline.
