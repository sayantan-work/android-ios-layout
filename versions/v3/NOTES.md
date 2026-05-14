# v3 — 3-tab Tab Bar + avatar→Me + Manage Office sub-screen

## Design DNA
Same dark glassmorphism + yellow primary as v1/v2. IA reduction is the headline change.

## IA
Per commit `028dbfa`: **"3-tab Tab Bar (Home / Workspace / Chat) + avatar opens Me + Manage Office sub-screen"**.

The persona-driven tab arrays in `script.js` still reference `TAB_PUNCH`/`TAB_ME` — but the visible tab bar collapses to 3 primary tabs. **Me** is reached by tapping the avatar in the nav bar (not from the tab bar). **Punch** and **Manage Office** become sub-screens rather than top-level destinations.

## Personas
Unchanged (A/B/D/E).

## Component inventory
Adds:
- `ManageOfficeScreen` (sub-screen for L2/L1 management actions)
- Avatar in nav bar becomes a primary entry point to Me

## React Native port map

**Native primitives:** same as v1 plus `Modal` / `BottomSheet` for the new sub-screen pattern.

**Navigation:**
- Now needs `@react-navigation/native-stack` on top of `@react-navigation/bottom-tabs` — sub-screens (Manage Office, etc.) push onto a stack.
- The avatar→Me transition is a stack push, not a tab switch.

**New custom components introduced in v3:**
- `<ManageOfficeScreen />` — sub-screen pattern entry
- `<AvatarMenuTrigger />` — replaces the Me tab as the entry to Me
- Carryover from v1/v2: `<NavHeader />`, `<TabBar />` (now 3 tabs), `<GlassCard />`, `<PunchOrb />`, etc.

**Gotchas:** same as v1 (BlurView, gradient).

## Screens / pages

**Tab destinations (`renderBody` inline):** `home` · `workspace` · `chat` (3 tabs; punch + me are sub-screens now).

**Sub-screen registry (`SCREENS` — first appears in v3, ~32 entries):**

Status legend: ✓ Done · ◐ Placeholder · → Alias

- **Forms ✓** — `apply-leave`, `apply-ot`, `advance`, `reimburse`
- **Me / HR ✓** — `me-requests`, `me-payslips`, `payslip-detail`, `me-leaves`, `me-attendance`, `documents`, `handbook`
- **Detail views ✓** — `task-detail`, `meet-detail`, `chat-thread`
- **Chat ✓** — `chat-new`, `chat-new-channel` (→ `chat-new-group` alias)
- **Punch ✓** — `punch-day`, `punch-location` (→ `location` alias)
- **Manager ✓** — `approvals`, `mgmt-review`, `register`, `bg-verification`, `announce`, `leaves-mgmt`, `reports`, `web-admin`, `branches-list`, `holidays`
- **Settings ✓** — `company-menu`, `branch-menu`, `company-settings`, `branch-settings`, `settings`, `switch-company`, `notifications`
- **Office ✓** — `office` (Manage Office sub-screen, the headline new feature)
- **Aliases →** — `attendance` → `me-attendance`, `location` → `punch-location`

**Not implemented:** any route id passed to `navigate()` that isn't in `SCREENS` (toast "coming soon").

## Diff from v2
- Tab bar dropped from 4/5 to 3 tabs
- Me promoted to nav-bar avatar, demoted from tab bar
- Manage Office introduced as a dedicated sub-screen
- **`SCREENS` registry + `navigate()` introduced — first version with real sub-screen navigation**

## Open questions / notes
- This direction was reverted in v5 (Me goes back to tab bar, avatar removed from nav). v3 is the "compact tab bar" experiment.
