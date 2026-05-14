# v8 — Todoist visual on v7's IA (current)

## Design DNA
Todoist's design language applied to v7's IA and permission model. **Pure white surfaces, hairline-separated lists (no cards), system fonts, single red accent `#DC4C3E`, zero shadows, generous whitespace.** Circle checkboxes. Strikethrough on completion is the only celebration.

Hold the line: no shadows, no gradients, no colored icon circles, no pastel backgrounds, no quick-stat carousels.

## IA — bottom tab bar
**Unchanged from v7:** 5 flat tabs identical for every persona — `Today · Tasks · Chats · Team · Me`. Permission gating still drives content visibility, now as **dashed locked rows** instead of card-style locked panels.

## Personas
Same A/B/D/E. See `project_v7_ia_and_permissions.md` and `project_rbac_direction.md` for the long-term plan.

## Component inventory
- `NavBar` (minimal, hairline border, no blur)
- `TabBar` (5 tabs, line icons, red active, no fill)
- `ListRow` — the central unit, replaces all card containers
- `SectionHeader` (small bold + item count inline, e.g. `"11 May · Today · Monday  1"`)
- `CircleCheckbox` — empty outline → green check + strikethrough
- `FAB` (big red, `+` icon, on primary tabs)
- `QuickAddInput` (natural language: `"Buy milk tomorrow #shopping p2"`)
- `LockedRow` (dashed-border list row, replaces v7's `LockedCard`)
- `DateBadge` ("Today" rendered in red)
- `PriorityFlag` (P1 red · P2 orange · P3 blue · P4 none)
- `BigNumber` (payroll · punch hero — typographic, no chart chrome)

## React Native port map

**Native primitives** (very minimal — Todoist style maps cleanly to RN):
- `SafeAreaView`, `View`, `Text`, `FlatList` / `SectionList`, `Pressable`, `Image`, `TextInput`

**Navigation:**
- `@react-navigation/bottom-tabs` — 5 tabs, red active, line icons, no fill
- `@react-navigation/native-stack` for sub-screens

**Visual effects:**
- **No blur, no shadow.** Drop `expo-blur` entirely. Don't set `elevation` or `shadowOpacity` on anything.
- `react-native-svg` for the line icons, or `lucide-react-native` (matches the line aesthetic naturally)
- `react-native-gesture-handler`'s `Swipeable` for right→complete / left→schedule on `ListRow`

**Custom components → files:**
| RN component | Path | Purpose |
|---|---|---|
| `NavHeader` | `src/components/NavHeader.tsx` | Top bar (hairline border, no blur) |
| `TabBar` | `src/navigation/TabBar.tsx` | 5 tabs, line icons, red active |
| `ListRow` | `src/components/ListRow.tsx` | **The central unit** — replaces all cards |
| `SectionHeader` | `src/components/SectionHeader.tsx` | Small bold + item count inline |
| `CircleCheckbox` | `src/components/CircleCheckbox.tsx` | Empty outline → green check + strikethrough |
| `FAB` | `src/components/FAB.tsx` | Big red `+`, on primary tabs |
| `QuickAddInput` | `src/components/QuickAddInput.tsx` | Natural-lang parser (use `chrono-node` for dates) |
| `LockedRow` | `src/components/LockedRow.tsx` | Replaces v7's `LockedCard` — dashed-border list row |
| `DateBadge` | `src/components/DateBadge.tsx` | "Today" in red |
| `PriorityFlag` | `src/components/PriorityFlag.tsx` | P1/P2/P3/P4 |
| `BigNumber` | `src/components/BigNumber.tsx` | Payroll/punch hero numerals |

**Theme:** `tokens.json` → `src/theme.ts` via a ~10-line transform. Use `Text` `fontSize`/`fontWeight` directly — 4 sizes only (12/15/22/28), no font library needed.

**Gotchas:**
- **Strikethrough is the entire success animation.** Don't add confetti, modals, or toasts on completion.
- `FAB` sits above the tab bar — `position: 'absolute', bottom: tabBarHeight + 16`.
- Strikethrough timing: animate `textDecorationLine` under 200ms.
- The 4-priority flag (P1/P2/P3/P4) maps cleanly for tasks — reconsider if reused for approvals or other lists.

## Screens / pages

**Tab destinations:**
- `today` ✓ · `tasks` ✓ · `chats` ✓ · `team` ✓ · `me` ✓ — same IA as v7, Todoist visual.

**Sub-screen registry (`SCREENS` — ~30 entries, near-clone of v7):**

Status legend: ✓ Done · ◐ Placeholder (empty-state only) · → Alias

- **Forms ✓** — `apply-request`, `apply-leave`, `apply-ot`, `apply-advance`, `apply-reimburse`, `task-new`, `chat-new`, `announce-new`
- **Me / HR ✓** — `me-payroll` (→ `payslip-detail`), `me-payslips`, `me-leaves`, `me-attendance`, `documents`, `handbook`
- **Detail views ✓** — `announce-detail`, `task-detail`, `meet-detail`, `birthday`, `chat-thread`, `chat-channel`
- **Tasks ✓** — `tasks-detail`
- **Manager ✓** — `approvals` (→ `leaves-queue`), `register`, `punch-location`, `branch-menu`, `branches-list`, `reports` (→ `mgmt-review`)
- **Operational ✓** — `holidays`
- **Settings ✓** — `company-settings`, `branch-settings`, `settings`, `about`
- **Placeholders ◐** — `bg-verify`, `web-admin` (both render Todoist-style empty states)
- **Not implemented** — any route id outside the registry (toast "coming soon")

**Persona gating (now via `<LockedRow />`):**
- Same gating rules as v7. Locked rows render as dashed-border list rows with muted text — visually flat, occupy same vertical space as the unlocked version.

## Diff from v7
- **Visual reset.** Same IA, same permission model, totally different visual layer.
- Cards → lists with hairlines.
- Multi-color accent palette → **one red**.
- Shadows → none.
- Custom-tinted typography → 3-4 sizes only, system stack.
- Colored icon circles → line icons.
- `LockedCard` → `LockedRow` (dashed border, list-shape).
- `SCREENS` registry near-identical to v7; render functions rewritten in Todoist style (hairline lists, no cards).

## Open questions / notes
- This is the **current target** for a future React Native port.
- The 4-priority flag system (P1/P2/P3/P4) is borrowed wholesale from Todoist — fine for tasks but reconsider if used for non-task lists (e.g. approvals).
- Strikethrough is the entire success animation — don't add confetti, modals, or toasts on completion.
