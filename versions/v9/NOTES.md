# v9 — Quiet Vault (Wint·Groww·Todoist·Google synthesis)

## Design DNA · **warm linen edition**
**Warm-linen "quiet vault" with one dark moment for punch.** Background `#F7F4ED` (warm linen, not cool white), text `#1F1A14` (warm brown-black), pill buttons (Revolut), shadow-as-border (Vercel), uppercase tracked status chips (Verdana Health), single sage `#059669` accent for positive states. The greeting uses **system serif italic** for warmth — every other surface stays system sans with tabular-num for time and counts.

**One dark moment in the entire app:** Today's punch hero band, warm near-black `#181410` (not pure `#000` — pure black felt slabby against the linen). The band has soft warm inset shadows at top/bottom edges so it nestles into the page rather than slabbing. Outside Today everything is calm warm-linen. The drama is reserved for the punch.

**Cozy-minimalist tweaks (v9.1):**
- Linen `#F7F4ED` background (was `#FAFAF9` cool white)
- Warm near-black ink `#181410` with a subtle `#181410→#221C16` gradient on the band
- Cream radial-gradient on the circle button (`#FFFDF6 → #F2EBD9 → #E8DEC4`) — not bright white
- Italic-serif "Good morning" greeting (Georgia / Libre Baskerville system fallback) — sans-anchored "Sayantan" below
- Italic-serif help copy below the circle ("When you're ready") — invitational, not instructional
- Slightly larger padding around greeting (22px) and quick-rows (22px) for breathing room
- RFID card gets `border-radius: 16px` (was 12px) + a warm linen gradient + warmer hairlines

## Source proxies (Path B from designmd.ai)
| Proxy | Stands in for | Contribution |
|---|---|---|
| `brunopetrovic/revolut` | Wint (fintech precision) | Dark hero band · pill buttons · white-on-black CTAs · luminance-based depth |
| `chef/thoughtstream` | Todoist (zen minimal) | Warm white bg · sharp list rows · hairlines · generous whitespace · 17px reading body |
| `chef/verdana-health-design-system` | Groww (calm trust) | Sage `#059669` positive accent · uppercase tracked status chips · soft 8–12px radii on cards |
| `Akagi201/longcipher-design` | Google (Vercel restraint) | Shadow-as-border (`0 0 0 1px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)`) · tabular nums · single text color base |

## IA — bottom tab bar
**5 tabs, identical for every user** (carried verbatim from v7/v8): `Today · Tasks · Chats · Team · Me`

**No persona switcher.** Hardcoded identity: **Sayantan Ghosh · L2 Branch Manager · Liberty Infospace · Head Office**.

**Chat notifications live on the nav-bar bell**, not as a Today row. The bell shows a count badge; tapping it opens a notification drawer with chats, mentions, approvals.

## Permission model — "see all, act only if permitted"
Everyone sees every page and every icon. The disabled/locked state lives on the **action**, not on visibility. Tapping a locked action opens a bottom-sheet that explains why ("Needs L1 CEO permission · Ask your admin").

- Replaces v8's `LockedRow` with `LockedAction` — same visual shape, lock on the affordance
- Permission source: hardcoded `permissions` object on `user` for now
- Future: GitHub-style token/scope lookup per `project_rbac_direction.md` — UI doesn't change shape

## Today — the punch-anchored hero

```
┌────────────────────────────────────────┐
│  ☰  Today, 12 May              🔔(3)   │ ← NavHeader
├────────────────────────────────────────┤
│                                        │
│   Good morning, Sayantan              │
│                                        │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓                                    ▓ │
│ ▓        ╭─────────╮                 ▓ │
│ ▓        │  09:08  │                 ▓ │ ← PunchHeroBand
│ ▓        │  PUNCH  │                 ▓ │   single dark band
│ ▓        ╰─────────╯                 ▓ │   in entire app
│ ▓        Tap to punch in             ▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                        │
│   Attendance · This week              │
│  ╭────────────────────────────────╮   │
│  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │ ← AttendanceRFIDCard
│  │░ Mon  09:08 ─── 18:42        ░│   │   paper-grain
│  │░ Tue  09:12 ─── 19:01        ░│   │   texture
│  │░ Wed  [✦ PRESENT · 09:08]    ░│   │   stamp chip
│  │░ Thu  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    ░│   │
│  │░ Fri  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    ░│   │
│  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │
│  ╰────────────────────────────────╯   │
│                                        │
│   ▢ 3 tasks due today               → │ ← daily-use quick rows
│   🌴 Apply leave                     → │
│                                        │
├────────────────────────────────────────┤
│  Today  Tasks  Chats  Team  Me        │ ← TabBar
└────────────────────────────────────────┘
```

## Circle punch — interaction states
| State | Visual | Behavior |
|---|---|---|
| Idle (out) | 200px **white** circle on `#000` band, time at center in 40px tabular-num, "PUNCH" label below | Tap to start the day |
| Pressed | `transform: scale(0.98)`, inner luminance brightens | 50ms transition |
| Punched-in | Circle inverts to **sage `#059669`**, label flips to `OUT`, elapsed time below ("4h 32m") | Tap to punch out |
| Stamping | 250ms expand+fade burst from circle center landing on today's row in the RFID card | One-shot animation |

## RFID Attendance Card
- `border-radius: 12px` + Vercel **shadow-as-border** (`box-shadow: 0 0 0 1px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)`)
- Background **warm cream `#F5F4EE`** with a **CSS-only paper-grain texture** via SVG `<feTurbulence>` filter overlay at 6% opacity — no images, no JS
- Rows: tabular-num times in `#171717`, uppercase tracked sage chip `PRESENT · 09:08` for today
- Past rows: just times (slightly muted to `text2`), future rows: dashed `─ ─ ─` placeholders
- Subtle inner edge highlight (`inset 0 1px 0 rgba(255,255,255,.6)`) sells the "physical card" feel

## What stays at fingertip (daily-use surfaces)
1. **Punch** — the whole hero is the action (one tap)
2. **Today's tasks** — one tap on Today row
3. **Apply leave** — one tap on Today row
4. **Bell notifications** — chat unreads + mentions + approval pings (one tap on nav bell)
5. **Approve queue** — top of Team tab when manager

## What gets buried (per `project_mobile_information_hierarchy.md`)
3+ taps deep under **Me › Settings › Admin**:
- Change branch timing
- BG Verification
- Web Admin
- Branch settings
- Document settings
- v6's old 4×3 manager grid — collapsed entirely; replaced with **2 surfaced actions on Team** + a "More manager tools" link

## React Native port map

**Native primitives** — minimal:
- `SafeAreaView`, `View`, `Text`, `FlatList`/`SectionList`, `Pressable`, `Image`, `Animated.View`
- `react-native-svg` for line icons + the `feTurbulence` texture (RN-SVG supports filters via `<Filter>` + `<FeTurbulence>`)
- `react-native-gesture-handler` `Swipeable` for swipe actions on list rows (carried from v8)
- No `expo-blur` — there's no glass anywhere

**Navigation:**
- `@react-navigation/bottom-tabs` — 5 tabs, line icons, sage active
- `@react-navigation/native-stack` for sub-screens
- `@react-navigation/bottom-sheet` (or `@gorhom/bottom-sheet`) for the locked-action explanation sheet + the bell notification drawer

**Custom components → file paths (PascalCase, ready for 1:1 rename):**
| RN component | File | Purpose |
|---|---|---|
| `NavHeader` | `src/components/NavHeader.tsx` | Top bar: hamburger · title · bell w/ badge |
| `TabBar` | `src/navigation/TabBar.tsx` | 5 tabs, line icons, hairline-top |
| `PunchHeroBand` | `src/components/PunchHeroBand.tsx` | The single black band on Today |
| `CirclePunchButton` | `src/components/CirclePunchButton.tsx` | 200px circle, tabular-num time, state inversion on punch |
| `AttendanceRFIDCard` | `src/components/AttendanceRFIDCard.tsx` | Cream card + paper-grain SVG filter overlay |
| `StampChip` | `src/components/StampChip.tsx` | Uppercase tracked status chip (PRESENT/LATE/ABSENT/LEAVE) |
| `ListRow` | `src/components/ListRow.tsx` | Hairline-separated row (carry from v8) |
| `SectionHeader` | `src/components/SectionHeader.tsx` | Bold + meta inline |
| `FAB` | `src/components/FAB.tsx` | Floating action (sage on Tasks) |
| `LockedAction` | `src/components/LockedAction.tsx` | Disabled affordance + bottom-sheet trigger |
| `BellWithBadge` | `src/components/BellWithBadge.tsx` | Notification bell + count |
| `NotifSheet` | `src/components/NotifSheet.tsx` | Bottom drawer with chats, mentions, approvals |
| `BottomSheet` | `src/components/BottomSheet.tsx` | Reusable sheet for locked-action explanation |
| `BigNumber` | `src/components/BigNumber.tsx` | Hero numerals (payroll, punch elapsed) |
| `PriorityFlag` | `src/components/PriorityFlag.tsx` | Carried from v8 |
| `CircleCheckbox` | `src/components/CircleCheckbox.tsx` | Carried from v8 |

**Theme:** `tokens.json` → `src/theme.ts` via a ~10-line transform. 5 type sizes (11/13/15/22/40), 6 radii, single accent.

**Gotchas:**
- **`feTurbulence` performance on Android** — paper-grain filter can be expensive. Profile on a mid-range device; fall back to a pre-rendered PNG texture if jank.
- **No shadows on lists**, only on the RFID card and bottom-sheet. Don't accidentally add `elevation`.
- **Tabular-num must be wired** via `fontVariant: ['tabular-nums']` on `Text` for time/elapsed displays.
- **Circle punch button** — keep the 200×200 hit target; tap response under 50ms.

## Screens / pages (v9 launch set)

**Tab destinations:**
- `today` ✓ — full hero + RFID + 2 quick rows
- `tasks` ✓ — list w/ circle checkboxes + FAB
- `chats` ✓ — conversation list (notifications live on bell, but the tab still has the full list)
- `team` ✓ — Approvals + Branch pulse + locked "More tools"
- `me` ✓ — Profile · payroll glance · payslips · attendance · leaves · documents · Settings link

**Sub-screen registry (`SCREENS` — ~10 entries for v9 launch):**

Status legend: ✓ Done · ◐ Placeholder · ✗ Not implemented yet (next iteration)

- ✓ `notif-sheet` — bottom drawer; chats + mentions + approval pings
- ✓ `tasks-detail` — full task list
- ✓ `apply-leave` — leave form
- ✓ `approvals` — manager approval queue
- ✓ `me-payroll` — current payslip snapshot
- ✓ `me-attendance` — month grid
- ✓ `settings` — top-level settings menu
- ◐ `settings-admin` — admin sub-screen (BG verify, web admin, change branch timing) — **locked for our L2 user**, used to demo `LockedAction` bottom-sheet
- ✗ `me-payslips`, `me-leaves`, `documents`, `handbook` — list pages, defer to v9.1
- ✗ `chat-thread`, `chat-new` — defer to v9.1 (notifications on bell are the daily-use anchor)
- ✗ `task-detail`, `task-new` — defer to v9.1

## Diff from v8
- **Visual:** warm cream `#FAFAF9` replaces v8's pure white. Single dark moment (punch band) replaces v8's all-flat-white. **Sage `#059669` replaces v8's red** as the primary accent (red is now strictly destructive). Shadow-as-border on the RFID card breaks v8's strict "zero shadows" rule — but only on this one component.
- **IA:** unchanged (5 flat tabs). Chat notifications **move to nav bell** instead of being a Today quick-access row.
- **Permission model:** v8's `LockedRow` becomes `LockedAction` — same row appearance, lock lives on the affordance, tap reveals why via bottom-sheet. Visibility never changes.
- **No persona switcher.** Single hardcoded identity (Sayantan, L2). v8's `.persona-row` toggle is gone.
- **Mobile hierarchy:** `change branch timing`, `web admin`, `BG verify`, `branch settings` all buried 3 taps deep under Me › Settings › Admin. v6/v7's surfaced manager grid is collapsed.
- **Texture:** the **paper-grain RFID card** is a new visual primitive — no prior version uses SVG filter textures.

## Open questions / notes
- The `feTurbulence` paper texture should be tested on iOS Safari + Chrome desktop; if the filter is too noisy or causes shimmer on retina displays, swap `baseFrequency` to 0.65 or fall back to a base64-encoded PNG.
- The 200px circle button on a 340×736 phone frame leaves enough room around it — but verify the dark band height feels right (target ~280px). If too tall, time gets too dominant; if too short, the drama is lost.
- "Stamping" animation: the time burst should land precisely on today's RFID row. Easy in CSS via fixed coords; in RN this needs `useSharedValue` + position math via `measureInWindow`.
- v9 ships with a **minimal SCREENS set** (~10). Full feature parity with v8 (~30 screens) is v9.1 work — not blocking.
