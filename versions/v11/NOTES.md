# v11 — Crisp

## Design DNA · Pure white · Electric cobalt · High contrast

A deliberate departure from v9/v10's "soft warmth" and v10's serif editorial direction. v11 leans **all the way modern**: pure white canvas, near-black ink, **electric cobalt `#0052FF`** as the single saturated accent, system sans throughout in heavier weights for unmistakable contrast.

This is the "Coinbase × Linear × Stripe" lineage — financial trust meets tech precision. Banking-grade clarity without v10's vintage warmth or v9's muted indigo.

### Departures from prior versions
- ❌ Cream / linen backgrounds (v9 = `#F7F4ED`, v10 = `#F4EFE2`) — v11 is **pure `#FFFFFF`**
- ❌ Muted desaturated indigo (v9 `#5E6AD2`) — v11 uses **vivid electric cobalt `#0052FF`** at full saturation
- ❌ Muted earth red (v10 `#A63D40`) — v11 reds are pure (`#EF4444`)
- ❌ Serif typography (v10) — v11 is system-sans only, heavier weights (500–700)
- ❌ "One dark moment" rule — v11 has **no dark band**, hero lives on pure white
- ❌ Soft warm grays — v11 grays are neutral, sharp gradients

### What v11 introduces
- **Vivid contrast everywhere** — body text is `#525252`, not `#6B7280`; primary text is `#0A0A0A`, not `#1F1A14`
- **Visible 1px borders on cards** + subtle ambient shadow (`0 1px 2px rgba(10,10,10,0.04), 0 0 0 1px rgba(10,10,10,0.06)`) — cards feel lifted, not embedded
- **Solid-fill chips** in cobalt + white text — not bordered like v10 stamps. Confident and clean
- **No "dark moment"** — the punch experience inverts the circle to cobalt-on-white instead. White breathes through the whole app
- **Bold tabular numerals** — time, elapsed, salary all show big, bold, confident

### What v11 carries forward
- 5-tab IA from v9/v10: Home · Workspace · Punch · Chats · Me
- Punch in middle of tab bar (elevated pedestal, cobalt fill when active)
- Permission model: "see all, act only if permitted"
- Single identity, no persona switcher
- Combined company/branch chip with settings inside the sheet
- Requests consolidated under a single entry
- Location map on Punch tab (in cobalt hairlines on white)
- Stamp animation on punch — but now in cobalt

## Palette
| Token | Value | Role |
|---|---|---|
| `--bg` | `#FFFFFF` | Pure white canvas |
| `--text` | `#0A0A0A` | Near-pure black ink |
| `--text-2` | `#525252` | Strong secondary (no muted grays) |
| `--text-3` | `#A3A3A3` | Tertiary |
| `--sage` (accent) | `#0052FF` | **Electric cobalt** — vivid |
| `--sage-soft` | `#E5EBFF` | Pale cobalt wash for chip backgrounds |
| `--sage-deep` | `#003BCC` | Deep cobalt for chip text on soft fill |
| `--forest` | `#10B981` | Vivid emerald (earnings, positive) |
| `--red` | `#EF4444` | Pure red (deductions, negative) |
| `--amber` | `#F59E0B` | Saturated amber (warning) |
| `--line` | `#EAEAEA` | Crisp neutral hairline |

## Typography
- **Stack:** `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif`
- **Weights:** 400 (body), 500 (rows/meta), 600 (chips/buttons), 700 (display/headlines)
- **Tabular nums + ss01 stylistic set** via `font-feature-settings`
- Sizes (px / weight / letter-spacing):
  - Hero `44 / 700 / -0.035em`
  - Title `24 / 700 / -0.02em`
  - H2 `17 / 700 / -0.01em`
  - Row `15 / 500`
  - Meta `13 / 500`
  - Chip `12 / 600 / 0.02em`
  - Small caps `11 / 700 / 0.08em uppercase`

## IA — bottom tab bar (unchanged from v9/v10)
**5 tabs**, Punch in the middle (cobalt pedestal): Home · Workspace · Punch · Chats · Me

## Component inventory (RN-named, port-ready)
| RN component | v11-specific behavior |
|---|---|
| `NavHeader` | Hairline border bottom (`#EAEAEA`), no nested rules |
| `TabBar` | Cobalt active state, **white pedestal** for inactive Punch (becomes cobalt when active) |
| `PunchHeroCard` ⟵ renamed | No dark band. Cobalt-bordered white card on Punch tab. Hero stays bright |
| `CirclePunchButton` | White-fill idle with cobalt ring + cobalt time; **cobalt fill** when punched-in (inverts) |
| `AttendanceTable` ⟵ renamed | White card with crisp `#EAEAEA` borders, no paper grain, no rotation |
| `StatusChip` | Solid cobalt fill + white text — confident pill |
| `ListRow` | Hairline bottom, `#0A0A0A` titles, `#525252` meta — high contrast |
| `SalaryDonut` | Forest earnings + red deductions (kept from v10 fix) on white |
| `LocationMap` | Cobalt geofence + cobalt building marker on light-grey background |
| `LockedAction` | Bordered cobalt lock icon on neutral grey, same `<bottom-sheet>` pattern |

## RN port notes
- All system fonts; no custom font loading needed
- `fontVariant: ['tabular-nums']` for time displays
- Cobalt `#0052FF` translates 1:1; soft tints work as `#E5EBFF`
- Shadows render natively on iOS via `shadowColor`/`shadowOpacity`; on Android use `elevation: 1` for cards
- No `mix-blend-mode` (v10 had it for paper grain); v11 needs no such tricks

## Screens / pages
Identical to v9/v10. Tab destinations: `home` · `workspace` · `punch` · `chats` · `me`. All sub-screens unchanged (`my-requests`, `apply-leave`, etc).

## Diff from v10 (the immediate predecessor)
- v10 cream `#F4EFE2` → v11 **pure white `#FFFFFF`**
- v10 stamp red `#A63D40` → v11 **electric cobalt `#0052FF`**
- v10 serif everywhere → v11 **system sans, weight 500+**
- v10 muted earth tones → v11 **vivid saturated accents**
- v10 rotated rubber-stamp chips → v11 **solid cobalt fill chips, no rotation**
- v10 paper-grain texture → v11 **pure white, no texture**
- v10 hairline-on-rule headers → v11 **plain bold headers**
- v10 italic-serif greeting → v11 **bold sans greeting**

## Open questions / notes
- Cobalt `#0052FF` is intentionally one notch more vivid than v9's `#5E6AD2`. If it feels too aggressive on small phones, drop to `#1652EB`.
- Pure white background can feel sterile on its own — counter-balanced by warm-ish black ink (`#0A0A0A` with slight warmth) and the cobalt energy.
- No "dark moment" is a real shift from v9/v10. The energy comes from the cobalt circle on white instead.
- Best fit: enterprise SaaS clients who want a "clean modern tool" feel rather than v9's "calm" or v10's "design object" feel.
