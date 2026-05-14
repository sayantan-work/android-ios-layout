# v15 — Mainframe

## Design DNA · IBM punch card meets minimal techie terminal

v15 leans hard into a single bold metaphor: **the attendance app IS a punch card.** Not metaphorical — visually literal. The hero surfaces use **manila card stock `#F2EAD3`** with warm tan edges, **dashed perforation rules**, **column markers**, and an **IBM-style serial-number header** stamped across the top of the punch hero. The active "hole" is a deep-recessed circle that lights up **CRT amber `#FF6B00`** when punched in.

But it's not a costume. The techie counterpoint is loud: **pure white canvas** underneath, **IBM Plex Mono** for every number / time / code / label, **sharp 0–4px corners** (no rounded pill anywhere except round status dots), tabular numerals with `'ss01','zero'` features, and **hard 4px-offset shadows** that read like a stamping press more than a soft drop.

The result reads as "what if you ran modern Bloomberg Terminal on a manila punch card." Retro paper, techie ink, mechanical interaction.

## Palette

| Token | Value | Role |
|---|---|---|
| `--bg` | `#FFFFFF` | Pure white canvas (techie) |
| `--card` | `#F2EAD3` | Manila punch-card paper (retro) — hero surfaces only |
| `--card-2` | `#E8DCB8` | Darker manila gradient stop |
| `--card-line` | `#C8B98A` | Warm tan card edge |
| `--text` | `#0E1A2B` | Printed-ink navy (slightly warm letterpress) |
| `--sage` (primary) | `#FF6B00` | **CRT amber** — the active hole, brand, FAB |
| `--crt` | `#00BF63` | **CRT green** — live status, success |
| `--ibm` | `#0F62FE` | **IBM blue** — info, AI moments (sparing) |
| `--amber` / `--red` | `#F59E0B` / `#DC2626` | Late / absent |

## Typography
- **Sans:** `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif` (body copy only)
- **Mono:** `'IBM Plex Mono', 'JetBrains Mono', 'SF Mono', ui-monospace, ...` — **everything else**
- Numbers, times, codes, labels, section heads, button text, chip labels, statusbar — all mono
- `font-feature-settings: 'tnum','ss01','zero'` — tabular numerals, alternate 1/4, slashed zero
- Section heads wrapped in `[ BRACKETS ]` (`::before` and `::after` pseudo-content)
- Greeting prefix `>` (terminal prompt), info-aside prefix `//` (comment)

## The punch card itself

The `.punch-band` hero is the visual centerpiece:

1. **Background**: layered — repeating vertical hairlines every 12px (column markers) on top of a manila-to-darker-manila gradient
2. **Inner border**: 1.5px card-line ring + 4px manila + 1px deeper card-line — looks like a real card edge with print register marks
3. **Header strip**: `::before` content `EASYDO-365 / ATTENDANCE / SERIAL 0001 / 2026.MAY` — 8.5px mono, all-caps, tracked at 0.14em, sitting above a dashed perforation rule
4. **Footer strip**: `::after` content `01  02  03  04 ... 12` — the column ruler running along the bottom
5. **The circle**: 172px circle in pure white, set into the manila — with a 3px navy ring + inset shadow that makes it look like an actual hole punched through the card; idle state pulses a faint amber glow
6. **On punch-in**: the circle fills CRT amber — the "active hole" lights up

## Section heads in COBOL bracket syntax

Every section header on every screen wraps its label in `[ ]`:
- `[ ATTENDANCE · MAY 2026 ]`
- `[ SALARY · MAY 2026 ]`
- `[ PINNED ]`
- `[ RECENT · 4 THIS MONTH ]`

Implementation: pure CSS via `::before`/`::after` pseudo-content. The label remains semantic plain text in the HTML.

## Hard shadows everywhere

No soft material blurs. Buttons and chips get **4px×4px offset hard shadows** in the brand color or the card-line tan — looks like the print impression of a mechanical stamp.

```css
.btn-primary { box-shadow: 4px 4px 0 var(--sage-deep); }
.btn-primary:active { box-shadow: 2px 2px 0 var(--sage-deep); transform: translate(2px, 2px); }
```

When pressed, the shadow halves and the button translates 2px — feels like the stamp pressing down.

## Component inventory (RN-named)

| RN component | v15 treatment |
|---|---|
| `NavHeader` | Pill switcher chip becomes a sharp-cornered manila card with mono label |
| `TabBar` | Black square FAB with amber lightning + 4px hard shadow + active state adds an amber ring |
| `PunchHeroCard` | Manila card with column-marker bg, serial-number header, dashed perforation borders, deep-recessed white "hole" circle |
| `CirclePunchButton` | White circle as a "hole" in the manila; lights amber on punch-in |
| `AttendanceLogbook` | Hairline rows (dashed!) with mono times. Today row gets manila wash |
| `StatusChip` | Rectangular code label with 1px ring outline (not pill). Default amber-bg + dark text |
| `ProfileAvatar` | Sharp-cornered navy square with amber initials + tan 4px drop shadow |
| `SalaryCard` | Manila card with hard 2px stamp shadow. Donut uses CRT green / CRT amber |
| `Buttons` | 4px-offset hard shadows in brand color; press translates 2px |
| `AnnouncementTags` | TOWNHALL = solid ink + amber text. HR/BENEFITS/POLICY in IBM blue / CRT green / amber-soft, each with 1px ring outline |

## What carries forward from v13

- 5-tab IA · permission model · attendance logbook · dedicated announcements screen
- Lightning bolt FAB icon — same SVG, now amber-on-navy
- Sayantan as single identity, same flows, same script.js (with one tagStyle tweak for the new palette)

## RN port notes
- Manila card backgrounds need a `LinearGradient` + a `View` overlay for the column markers OR a static pattern image
- The bracket typography is achieved via `Text` wrappers like `<Text>[ {title} ]</Text>` — clean RN port
- 4px hard shadows: `shadowColor: tokens.sageDeep, shadowOffset: {width:4, height:4}, shadowOpacity:1, shadowRadius:0` (iOS); Android via `elevation` won't replicate the hard offset — use a positioned `View` behind
- IBM Plex Mono needs to be loaded explicitly in RN (`expo-font` or otherwise) — system mono is a reasonable fallback

## Diff from v13 / v14
- v13/v14 saturated consumer-app palettes → v15 **manila + CRT amber + navy** (warm + technical)
- v13/v14 rounded everything (8–20px) → v15 **sharp 0–4px corners** + dashed perforations
- v13/v14 sans throughout → v15 **mono for all numbers, codes, times, labels**
- v13/v14 soft material shadows → v15 **hard 4px stamped shadows**
- v13 lime/red/cyan multi-color → v15 **two-color hierarchy** (amber primary, CRT green support, IBM blue accent)
- v13 pink-soft punch band → v15 **literal punch card** with column markers + serial header + perforations

## Open questions / notes
- The mono-everywhere choice is heavy. If it feels too retro for a real client, body copy can shift back to sans while keeping numbers/codes mono — one CSS rule change.
- The manila punch card hero is the centerpiece. If clients prefer pure-white minimalism, that one surface can flip white without breaking the rest of the language.
- Best fit: enterprise / govt / financial / dev-tool brands. **Not** a fit for consumer-facing companies — v13/v14 remain the right answer there.
- This is the only version in the set where typography carries as much identity as color.
