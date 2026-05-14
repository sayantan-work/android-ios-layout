# v10 — Field Ledger

## Design DNA · Editorial newspaper meets employee logbook

A deliberate **departure** from v6–v9's "modern productivity app" feel. This one reads as a beautifully bound logbook — cream paper, whisper-faint notebook rules, serif typography throughout (display *and* body), stamp-red ink, and rubber-stamp impressions for status. The aesthetic is "vintage personnel office reimagined for 2026".

### What v10 explicitly avoids
- ❌ Indigo / blue accents (v9 already owns that lane)
- ❌ Sage / Todoist red (v8 owns it)
- ❌ Emerald Groww + GPay blue (v6/v7 own it)
- ❌ Yellow + dark glassmorphism (v1–v5)
- ❌ Terracotta Ember, mint BudgetZen, coral Stay, navy Boardroom (the four designmd research proxies — all consciously *not* the direction here)
- ❌ Modern sans-serif everywhere (v9 owns that)
- ❌ The Vercel "shadow-as-border + tabular nums" stack (v9's signature)

### What v10 introduces
- **Serif typography throughout** — system serif stack (Iowan Old Style → Hoefler Text → PT Serif → Georgia). Punch time, greeting, body — all serif. This is the single biggest deviation.
- **Cream paper canvas** `#F4EFE2` with whisper-faint horizontal ruled lines on backgrounds (not borders) — like notebook paper, almost invisible until you look.
- **Stamp-red accent** `#A63D40` — used like ink. Reserved for: punch-in confirmations, today's stamp on the attendance ledger, the FAB, drop cap.
- **Rubber-stamp metaphor** on the attendance row — slight rotation (-3°), uppercase tracked text, soft ink-bleed shadow, dashed border to suggest stamp boundary. The visual centerpiece of the app.
- **Drop cap** on the home greeting — a 56px italic-serif "S" beside "ayantan".
- **Postcard treatment** on the birthday card — slight rotation, dashed border, "stamp" corner.
- **Receipt-style** list rows for reimbursement — narrow leading column for amounts, dotted leaders between label + value.
- **No shadows-as-border** — uses actual hairlines + soft `rgba(60,40,20,...)` shadows (paper-on-desk feeling).

### What v10 carries forward
- **5-tab IA** from v9: Home · Workspace · Punch · Chats · Me
- **Permission model** from v7/v8/v9: "see all, act only if permitted" with locked-action bottom sheet
- **No persona switcher** — single hardcoded identity (Sayantan, L2 Manager)
- **Punch in middle of tab bar** as the elevated/pedestal tab
- **Single combined company+branch chip** in single-row nav, settings inside the sheet only
- **Requests consolidated** under one entry (Home Requests row + Me records Requests row)
- **Location map** on Punch tab (now drawn in red ink hairlines instead of indigo)

## Palette
| Token | Value | Role |
|---|---|---|
| `--bg` | `#F4EFE2` | Cream paper canvas |
| `--bg-rule` | `#E4DCC4` | Faint ruled lines (notebook paper) |
| `--surface` | `#FFFCF6` | Card surface — slightly inset from bg |
| `--text` | `#1A1612` | Warm ink (no pure black) |
| `--text-2` | `#5C5246` | Secondary ink |
| `--ink` | `#1A1612` | Dark band, primary CTA |
| `--sage` | `#A63D40` | **Stamp red** — the single accent |
| `--sage-soft` | `#F1DCD2` | Stamp impression fill |
| `--sage-deep` | `#6E1E20` | Stamp text on red |
| `--forest` | `#2D5F4F` | "Approved" semantic only |
| `--amber` | `#A8842A` | "Pending" semantic only |
| `--line` | `#D6CFC0` | Hairline |

## Typography
- **Display + body**: system serif stack — `'Iowan Old Style', 'Hoefler Text', 'PT Serif', Georgia, serif`
- **UI labels (tabs, chips, status bar)**: system sans — `-apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, sans-serif`
- **Tabular numerals**: enabled via `font-feature-settings: 'tnum'` on all time/elapsed/count displays
- **No Google Fonts dependency** — pure system stack for performance + RN parity

Sizes (px / weight / extras):
- Masthead `32 / 700 italic / -0.025em`
- Headline `22 / 700 / -0.015em`
- H2 `17 / 700`
- Body row `16 / 400 / 1.45`
- Meta italic `13 / 400 italic`
- Small caps `11 / 700 / 0.16em uppercase`
- Stamp `12 / 800 / 0.22em uppercase`
- Drop cap `56 / 700 italic`

## IA — bottom tab bar (unchanged from v9)
**5 tabs, identical for every user:** Home · Workspace · **Punch (center, elevated)** · Chats · Me

## Component inventory (RN-named, port-ready)
| RN component | Purpose | What's new vs v9 |
|---|---|---|
| `NavHeader` | Top bar w/ combined company-branch chip + bell | Hairline rule below uses `--bg-rule` for the notebook feel |
| `TabBar` | 5 tabs, line icons, punch pedestal | Active state uses **stamp-red** instead of indigo |
| `PunchHeroBand` | Single dark band on Punch tab | Now `--ink` (warm near-black) with cream pin-dots in corners (like a card-stock punch card) |
| `CirclePunchButton` | The hero circle | Cream gradient, ink time, **subtle serif numerals** — feels like a vintage time-clock |
| `StampCard` ⟵ replaces `AttendanceRFIDCard` | Cream paper card listing weekly attendance | Today's row gets a **rotated rubber-stamp** ("PRESENT · 09:08" red ink, -3° rotation, dashed border, ink-bleed shadow) |
| `StampChip` | Status indicator | Same rubber-stamp visual — used for "APPROVED", "PENDING", "DENIED" |
| `ListRow` | Standard list row | Body in serif, meta in italic-serif |
| `ReceiptRow` ⟵ new | Reimbursement / payslip line items | Dotted leaders between label and value, tabular nums |
| `PostcardCard` ⟵ new | Birthday / announcement | Slight -1° rotation, dashed border, stamp icon in corner |
| `DropCap` ⟵ new | Greeting first letter | 56px italic serif, drops 2 lines |
| `RuledLine` ⟵ new | Section divider | Hairline rule with serif title overlay (newspaper sub-headline) |
| `LocationMap` | Punch geofence | Re-drawn in **red ink hairlines** on cream, single thin dashed circle, no fills |
| `LockedAction` | Permission-denied affordance | Stamp-style "RESTRICTED" mark instead of generic lock |
| `FAB` | Primary action | Cream paper square (slight rotation), ink "+" — like a sticky note |
| `BellWithBadge` | Notification | Badge in stamp red, not indigo |

## React Native port map

**Native primitives:** `SafeAreaView`, `View`, `Text`, `FlatList`, `Pressable`, `Image`, `Animated.View`.

**Type stack:** RN supports system serif via `Platform.select`:
- iOS: `'Iowan Old Style'` or `'Times New Roman'`
- Android: load `'PT Serif'` via `expo-font` or use `'serif'` system fallback

**Navigation:** Same as v9 — `@react-navigation/bottom-tabs` (5 tabs, stamp-red active), `@react-navigation/native-stack` for sub-screens.

**Stamp rotation:** RN supports `transform: [{ rotate: '-3deg' }]` on `Animated.View`. The ink-bleed effect needs `shadowColor` + `shadowOpacity` + `shadowRadius` (iOS) or a layered `View` with `elevation` (Android).

**Faint rule lines on bg:** use a `<View>` background pattern via `react-native-svg` `<Pattern>` or a tiled `Image` with a single 1px line PNG.

**Gotchas:**
- Serif rendering on Android can vary — test before launch. May need to ship PT Serif as an `expo-font` asset.
- `letterSpacing: '0.22em'` doesn't work in RN (no em units) — convert to px values per font size.
- No `font-feature-settings` in RN — use `fontVariant: ['tabular-nums']` for tabular figures.
- Stamp ink-bleed shadow is iOS-easy, Android requires elevation hacks. Profile.

## Screens / pages

Tab destinations: `home` ✓ · `workspace` ✓ · `punch` ✓ · `chats` ✓ · `me` ✓ — identical IA to v9.

Sub-screens: All v9 sub-screens carry over (`my-requests`, `tasks-detail`, `apply-leave`, `apply-ot`, `apply-advance`, `apply-reimburse`, `approvals`, `me-payroll`, `me-attendance`, `documents`, `settings`, `settings-company`, `settings-branch`, `settings-admin`, `task-detail`, `meet-detail`, `chat-thread`, `chat-channel`, `announce-detail`, `birthday`).

## Diff from v9 (the big one)
- **Visual reset.** Same IA, same permission model, **completely different visual layer**.
- v9 indigo → v10 **stamp red**
- v9 sans-serif → v10 **serif everywhere**
- v9 warm linen + paper grain → v10 **cream paper + ruled lines + rubber stamps**
- v9 Vercel shadow-as-border → v10 **hairlines + soft ambient shadows**
- v9 modern → v10 **vintage editorial**
- All RFID-card mentions → renamed `StampCard`, real stamp visual on today's row
- New components: `ReceiptRow`, `PostcardCard`, `DropCap`, `RuledLine`

## Open questions / notes
- Serif body text at 15–16px reads slightly slower than sans — verify on smaller phones. Could bump to 16–17px for body to compensate.
- The stamp rotation (-3°) must NOT animate on initial render (jarring); only the stamp-burst animation (on punch-in) rotates. Past entries stay static.
- The ruled-line background should be **so faint it disappears at first glance** — `#E4DCC4` on `#F4EFE2` = barely 8% contrast. If it's too loud, drop opacity further.
- This direction is the **most distinctive of the 10 versions** — also the most polarizing. It's the "design-y" version. Manager-heavy enterprises may prefer v9's productivity-app feel; smaller HR teams or design-conscious orgs may love v10.
