# v13 — Tiffin

## Design DNA · Indian consumer-app energy applied to HRMS

v13 is a hard turn away from the disciplined, monochromatic v11/v12 lineage. Inspiration was pulled from the Indian consumer-app canon — **Swiggy** (green), **Zomato** (red), **Zepto** (hot pink + black), **Cult.fit** (orange + bold sans). The structural reference is the **FoodDash design system** on designmd.ai ([chef/fooddash](https://designmd.ai/chef/fooddash)) — the explicit "Swiggy/Zomato archetype" community kit.

Where v11/v12 said "banking trust + tech precision," v13 says "**speed, scannability, fun.**" Every interaction expects a thumb in a hurry. The punch-in button looks like an "Order Now" CTA. Status chips read like delivery states. Promo cards are pink and saturated. Color *is* the information hierarchy — not type weight, not borders.

The name **Tiffin** is distinctly Indian, food-coded (Swiggy/Zomato lineage), and work-coded (the tiffin box you take to office). It bridges the consumer-app idiom with the HRMS context without being a literal knockoff.

## The big shifts

| Concept | v12 (Method) | v13 (Tiffin) |
|---|---|---|
| Primary accent | Single cobalt `#0052FF` | **Brand red `#E23744`** (Zomato lineage) |
| Color hierarchy | Monochrome — cobalt or nothing | **Multi-color** — red/orange/pink/sky/violet/green each carry meaning |
| Type | Sans 500–700, editorial small-caps section heads on rule | Sans 600–800 (heavier), no rule treatment, bigger numbers |
| CTA pattern | Pill button, sage fill | **Pill button + colored shadow** (Zomato/Swiggy FAB energy) |
| Cards | 3-tier (hairline / subtle / hero) | **Material-style soft shadows everywhere** — cards lift more |
| Punch hero | White card | **Pink-soft gradient panel** with white-circle-on-red |
| Punch mini (Home) | White card | **Saturated red gradient strip** with white text + glowing dot |
| Status chips | Solid cobalt fill | **Soft-fill colored chips** (green=present, amber=late, red=absent) — Swiggy delivery-state pattern |
| Avatar (Me) | Grey circle | **Violet→pink gradient circle** with colored shadow |
| Announcement card | Cobalt-soft fill | **Orange-soft fill** (deals/promos energy) |
| Section heads | Small-caps on hairline rule (editorial) | Bold sans 18px (consumer-app shouty) |

## Palette
| Token | Value | Role |
|---|---|---|
| `--sage` (primary) | `#E23744` | **Zomato red** — CTAs, punch circle, brand identity (kept on `--sage*` for script compat) |
| `--sage-soft` | `#FEE7E9` | Pale red wash for soft pills, today-row, punch panel background |
| `--sage-deep` | `#B91C1C` | Deep red for pressed states |
| `--orange` | `#F97316` | Energy/streaks/deals/announcements |
| `--pink` | `#EC4899` | **Zepto pink** — celebrations, AI moments |
| `--sky` | `#0EA5E9` | Info/tracking (Swiggy delivery-blue) |
| `--violet` | `#8B5CF6` | Personal/profile/premium (gradient with pink for avatars) |
| `--forest` | `#16A34A` | **Swiggy green** — present/success/approved (status chip default) |
| `--amber` | `#F59E0B` | Warning/late |
| `--red` | `#DC2626` | Error/absent |
| `--text` | `#171717` | Warm near-black (Zomato lineage, slightly less stark than v11/v12's `#0A0A0A`) |
| `--line` | `#F0F0F0` | Lighter hairline (consumer apps lean borderless) |

## Typography
- **Stack:** system sans (RN-portable). FoodDash specifies Poppins display + DM Sans body — v13 mirrors that **rhythm** (heavier display weights, lighter body) but stays system-only.
- **Weights:** 500 (body), 600 (meta), 700 (rows), **800 (display + section heads)** — one notch heavier across the board vs v12.
- Hero: `42 / 800 / -0.04em`. Numbers: tabular nums, `28-30 / 800 / -0.03em`.
- Section heads: `18 / 800 / -0.02em` — bold sans, no editorial rule treatment (a deliberate departure from v10/v12).

## Punch experience
- **Idle state:** white circle with a 3px solid red ring + colored ambient shadow + soft glow halo
- **In state:** circle inverts to solid red `#E23744` with white text — looks like Zomato's "Track Order" pill
- **Stamp burst:** flies down as a **green** "PRESENT" pill (Swiggy delivery-state language)
- **Background panel:** subtle pink-soft gradient (vs v11/v12 white) — punch is now a *moment*, not a *card*

## Component inventory (RN-named)
| RN component | v13 behavior |
|---|---|
| `NavHeader` | Pill-shaped switcher with soft-grey fill (no border) |
| `TabBar` | Red active state · the Punch tab is a **proper FAB** — 48px circle with solid red fill + colored fab shadow + 4px white ring + 8px outer red-soft ring when active |
| `PunchHeroCard` | Pink-soft gradient panel (no card) hosting the circle |
| `CirclePunchButton` | White-with-red-ring → solid red on tap |
| `HomePunchMini` ⟵ refit | **Saturated red gradient strip** with white text + glowing white dot — looks like Swiggy's order-tracking strip |
| `AttendanceLogbook` | Hairline rows (kept from v12) but with Swiggy-style colored status chips |
| `StatusChip` | Soft-fill + dark text. Default green (PRESENT), amber (LATE), red (ABSENT) — Swiggy delivery state lineage |
| `CategoryQARow` | 42px colored icon tile + bigger title — Swiggy category-card energy on a list row |
| `MeProfileAvatar` | **Violet→pink gradient** with colored shadow (Zepto/Spotify-Wrapped avatar energy) |
| `SalaryDonut` | Hero card with a faint forest-soft gradient pulled diagonally — earnings/deductions in green/red |
| `AnnouncementCard` | Orange-soft fill (deals/promos energy) instead of cobalt-soft |
| `AnnouncementRow` | Multi-color tags — TOWNHALL=solid red, HR=pink-soft, BENEFITS=green-soft, POLICY=amber-soft, ANNOUNCEMENT=sky-soft |

## What v13 keeps from earlier versions
- **v7 / v12** — 5-tab IA, see-all/act-only-if-permitted permission model, locked-action sheets
- **v8 / v12** — attendance as a hairline logbook (still no big box around the days)
- **v11 / v12** — pure-white canvas, white circle that inverts on punch, dedicated announcements screen
- **v12** — the standalone announcements screen pattern (notice board, not chats)

## RN port notes
- Multi-color palette is the biggest port consideration — `tokens.json` now has 6 saturated accent families
- Pill buttons + colored shadows port natively: `shadowColor: tokens.sage` (and same for FAB)
- Gradient avatar uses `expo-linear-gradient`'s `LinearGradient` with `colors=[violet, pink]`
- Status chips: a single component that takes `tone="success|warning|error|info"` and maps to soft-fill + dark-text variants

## Diff from v12 (the immediate predecessor)
- v12 cobalt monochrome → v13 **multi-color hierarchy** (red/orange/pink/sky/violet/green)
- v12 editorial small-caps section heads → v13 **bold sans section heads** (no rule)
- v12 hairline lists discipline → v13 **lifted material cards** (FoodDash elevation pattern)
- v12 white punch card → v13 **pink-gradient panel** hosting a red-ringed circle
- v12 cobalt home-punch-mini → v13 **saturated red gradient strip** (consumer-app order-tracking energy)
- v12 grey profile avatar → v13 **violet→pink gradient avatar** with colored shadow
- v12 cobalt soft chips → v13 **Swiggy-style colored status chips** (green=present, amber=late)
- v12 cobalt announcement → v13 **orange announcement** (promos/deals lineage)

## Open questions / notes
- The brand red is a strong commitment. If the client wanted Swiggy-orange instead, the only change is `--sage: #FC8019` and the punch ring goes orange. The rest of the palette is intentionally Swiggy/Zomato shared idiom.
- The Punch FAB is now visually dominant (48px, red, colored shadow). If it feels too aggressive in the tab bar, drop to 44px and remove the outer ring.
- Best fit: consumer-facing companies whose employees already use 5+ delivery apps daily and expect that idiom from work tools. Less fit for enterprise / regulated industries (v11 is the right answer there).

## Reference
- **FoodDash** on DESIGNmd: https://designmd.ai/chef/fooddash — the explicit Swiggy/Zomato community design system. Pulled via the designmd MCP. v13 borrows its color philosophy (red CTA + green success + amber warning + colored shadows + pill buttons) but applies it to HRMS surfaces.
