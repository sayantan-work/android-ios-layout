# v16 — Console

## Design DNA · Modern dark-mode tech

v16 is the first dark theme since the v1–v5 era (and that era was yellow-on-glass — totally different DNA). v16's lineage is **modern AI / dev-tool**: **Linear** (violet), **Vercel** (stark monochrome restraint), **Cursor** (gradient AI accents), **Anthropic Claude** (warm conversational tech), **Arc** (glass + neon).

The canvas is near-pure black `#0A0A0B`. The brand is a **single gradient mark**: violet `#A78BFA` → cyan `#22D3EE` at 135°. Every accent surface uses it — the punch circle in-state, the FAB toast, today's calendar pill, the AI avatar conic, the primary buttons. Everything else is monochrome.

The visual idea: a calm, AI-native dev tool. Glow > shadow. Border = card identity. Mono = data. Sans = words.

## Palette

| Token | Value | Role |
|---|---|---|
| `--bg` | `#0A0A0B` | Near-pure black canvas (never `#000`) |
| `--surface` | `#111113` | Card surface, lifted by 1px hairline only |
| `--text` | `#FAFAFA` | Soft white ink (easier on eyes than pure white) |
| `--sage` (primary) | `#A78BFA` | **Linear violet** — kept on `--sage*` for script compat |
| `--cyan` | `#22D3EE` | Info, data, secondary action |
| `--coral` | `#FB923C` | AI moments, bell badge |
| `--gradient-brand` | `linear-gradient(135deg, #A78BFA → #22D3EE)` | The signature brand mark |
| `--glow-violet` | `0 0 24px rgba(167,139,250,0.4), 0 0 48px rgba(167,139,250,0.18)` | The brand's halo |
| `--line` | `#27272A` | The workhorse 1px hairline |

## Typography
- **Sans:** Inter — body copy, list titles, section heads, button text
- **Mono:** JetBrains Mono — every number / time / code / chip label / day-of-week / tag / nav switcher meta
- `font-feature-settings: 'tnum','ss01','cv11'` — tabular nums, alternate 1, slashed zero

## The punch hero

The hero card sits on a dark surface (`#111113`) with a 1px line border. A subtle violet glow falls from the top via a `radial-gradient` `::before`. The punch circle is 184px, dark canvas inside, wrapped in a 1.5px violet ring + multi-layer violet glow shadow + an inset 1px violet hint at the rim.

- **Idle**: black inside, white time text, violet ring + glow pulses every 3.6s
- **In**: fills with the violet→cyan gradient, dark ink time text — the active moment

Below the circle, in-mode shows a glass capsule (rgba bg + blur backdrop + 1px violet border) for the elapsed counter. Idle mode strips the capsule to a muted helper.

## Status chips
Soft-fill background + bright text + 1px tinted ring:
- Default (PRESENT): violet — `var(--sage-soft)` bg, `var(--sage)` text
- LATE: amber soft + amber text
- ABSENT: red soft + red text

## Section heads
Plain bold sans, no decoration. No `[ BRACKETS ]` (that was v15). No editorial rule (v12). Just 14px / 700 / -0.015em letter-spacing.

## Component inventory (RN-named)

| RN component | v16 treatment |
|---|---|
| `NavHeader` | Soft-grey square buttons with hover transitions, gradient logo on switcher |
| `TabBar` | Flat row — no FAB pedestal. Active state is violet ink only |
| `PunchHeroCard` | Dark card with violet glow from top, gradient-ringed circle |
| `CirclePunchButton` | Black-inside with violet ring → fills gradient on punch |
| `AttendanceLogbook` | Hairline rows, mono times, today gets violet-soft gradient wash |
| `StatusChip` | Soft-bg + bright text + 1px ring (signature dark-mode pattern) |
| `ProfileAvatar` | Round, filled with the brand gradient, casts violet glow |
| `SalaryDonut` | Dark card with a violet radial wash in the corner. Earnings forest, deductions coral |
| `AIChatRow` | Conic-gradient avatar (violet → cyan → coral cycle) with glow |
| `Buttons` | Primary = gradient fill + violet glow. Secondary = surface fill + 1px line |
| `AnnouncementTags` | TOWNHALL = gradient fill. Others = soft-bg + colored ring (cyan/forest/amber/coral) |

## What's missing on purpose
- **No multi-color hierarchy** (v13/v14 did that). v16 is monochrome with one accent gradient.
- **No FAB pedestal** (v13/v14/v15 had one). The punch tab sits in the row.
- **No bracket typography** (v15 did that). Clean modern sans/mono pairing.
- **No editorial section heads with rules** (v12 did that). Plain bold heads.

## RN port notes
- The gradient brand mark: `LinearGradient` from `expo-linear-gradient` with `colors=['#A78BFA', '#22D3EE']` and `start={{x:0,y:0}} end={{x:1,y:1}}`
- The violet glow: iOS `shadowColor:'#A78BFA', shadowOpacity:0.4, shadowRadius:24, shadowOffset:{width:0,height:0}`. Android can't replicate true outer-glow — use multiple stacked `View`s with reduced opacity
- Backdrop-filter blur on the in-state capsule won't port to Android — fallback to solid `rgba` background

## Diff from v13 / v14 / v15
- v13/v14 multi-color or theme-switchable → v16 **monochrome dark + one gradient**
- v15 manila card stock + retro mono everywhere → v16 **dark glass + measured mono use**
- v13/v14/v15 prominent FAB → v16 **flat tab row, gradient ink for active state only**
- v13/v14/v15 light surfaces → v16 **near-pure black canvas**
- All prior versions sharp/separated → v16 **glow + 1px lines = soft tech depth**

## Open questions / notes
- Pure-dark themes are polarizing in HRMS contexts. Some clients will love it; some will find it too dev-tool. Easy to flip via a body class if needed.
- The gradient brand reads as "AI / modern" — if a client wants pure Linear-purple monochrome, swap `--gradient-brand` to a solid `var(--sage)` value in one place.
- Best fit: dev-heavy companies, AI startups, fintech with modern brand, design-led teams.
