# v6 — Fresh redesign: light theme, Groww + GPay

## Design DNA
First **light theme**. Groww emerald `#00B386` (primary, positive numbers, active states) + Google Pay blue `#1A73E8` (secondary, info, links). Big rounded cards, soft shadows, friendly type. Activity-feed layout throughout.

Grounded in the real EasyDo 365 screenshots at `C:\Users\dj\Desktop\mobile-ui` — no invented tabs/sections.

## IA — bottom tab bar
**3 primary tabs:** `Today · Chats · Office`. The "Office" tab has **5 top sub-tabs**: `Punch In · Dashboard · Notice · Salary · Manager`.

- **Today** = calendar view (week strip · All Day cards · hourly time grid)
- **Chats** = list view (no task-counter tiles — explicitly removed)
- **Office › Punch In** = personal punch
- **Office › Dashboard** = employee self-service (Apply Request · Statistics · Leave · Holiday · Reports)
- **Office › Notice** = announcements/notice board
- **Office › Salary** = donut chart + Time Sheet / Earnings / Allowance / Deductions tabs
- **Office › Manager** = company dashboard (4×3 grid: Register · BG Verification · Management Review · Location · Branch · Announcement · Documents · Leaves · Holidays · Web Admin · Reports · Approvals) — **L1/L2 only**

## Personas
- **A** App User — `tabs: [today, chats]`, no HRMS
- **B** L3 Employee — `tabs: [today, chats, office]`, officeTabs: [punchin, dashboard, notice, salary]
- **D** L2 Branch Manager — adds `manager` office sub-tab
- **E** L1 CEO — same as D plus company-wide scope

## Component inventory
- `NavBar` (clean, no glass blur — light theme)
- `TabBar` (3 tabs, emerald active state)
- `Today › WeekStrip`, `AllDayCard`, `HourGrid`
- `OfficeSubTabs` (5 horizontal sub-tabs)
- `PunchInScreen`, `DashboardScreen`, `NoticeScreen`, `SalaryScreen`, `ManagerGrid`
- `ApplyRequestCard` (consolidated request entry)
- `DonutChart` (salary breakdown)
- `BranchChip` (company/branch indicator)
- Big rounded cards (`--r-md: 12`, generous padding)

## React Native port map

**Native primitives:** `SafeAreaView`, `View`, `Text`, `ScrollView`, `FlatList` (activity feed), `Pressable`, `Image`.

**Navigation:**
- `@react-navigation/bottom-tabs` (3 tabs: Today / Chats / Office, emerald active)
- `@react-navigation/material-top-tabs` for the 5 Office sub-tabs (`Punch In · Dashboard · Notice · Salary · Manager`)
- `@react-navigation/native-stack` for SCREENS sub-screen pushes

**Visual effects:**
- **No glass blur** — drop `expo-blur`. Light theme = direct port to RN as-is.
- `react-native-svg` for the donut chart in Salary (or `react-native-gifted-charts`)
- `react-native-svg` for line icons

**Custom components:**
- `<NavHeader />` (light, no blur), `<TabBar />` (3 tabs), `<OfficeSubTabs />`
- `<TodayWeekStrip />`, `<AllDayCard />`, `<HourGrid />`
- `<PunchInScreen />`, `<DashboardScreen />`, `<NoticeScreen />`, `<SalaryScreen />`, `<ManagerGrid />`
- `<ApplyRequestCard />` (consolidated request entry), `<DonutChart />`, `<BranchChip />`
- Big rounded cards (`borderRadius: 12`, generous padding)

**Gotchas:**
- `ManagerGrid` 4×3 → `FlatList` with `numColumns={3}` (or 2 on small phones).
- Donut chart needs SVG; avoid third-party chart libs if possible (heavy).

## Screens / pages

**Tab destinations:**
- `today` ✓ — week strip · All Day cards · hourly time grid
- `chats` ✓ — list view (no task-counter tiles — explicitly removed)
- `office` ✓ — container w/ 5 sub-tabs:
  - `office.punchin` ✓ — personal punch
  - `office.dashboard` ✓ — employee self-service
  - `office.notice` ✓ — announcements
  - `office.salary` ✓ — donut + Time Sheet / Earnings / Allowance / Deductions
  - `office.manager` ✓ — 4×3 grid (L1/L2 only)

**Sub-screen registry (`SCREENS` — ~28 entries):**

Status legend: ✓ Done · ◐ Placeholder (empty-state only) · → Alias

- **Forms ✓** — `apply-request`, `apply-leave`, `apply-ot`, `apply-advance`, `apply-reimburse`
- **Me / HR ✓** — `me-payslips`, `payslip-detail`, `me-leaves`, `me-attendance`, `holidays`, `documents`, `handbook`
- **Detail views ✓** — `task-detail`, `meet-detail`, `reminder-detail`, `day-detail`, `birthday-detail`, `announce-detail`, `chat-thread`
- **Manager ✓** — `approvals` (→ `leaves-mgmt`), `register`, `announcements`, `employee-score`, `review-queue`
- **Settings ✓** — `company-menu`, `branch-menu`, `notifications`, `punch-location`
- **Placeholders ◐** — `bg-verification`, `mgmt-review`, `reports`, `web-admin`, `branches-list` (for non-E), `search`, `call`, `cloud`, `agenda`, `more`, `month-picker` — all render empty-states with friendly copy
- **Not implemented** — any route id outside the registry (toast "coming soon")

## Diff from v5
- **Complete redesign.** Different palette (dark→light), different IA (5/4 tabs → 3 tabs with sub-tabs in Office), different visual philosophy (glass → clean cards).
- Persona-driven tab arrays use lowercase keys (`today/chats/office`) instead of v1-v5's `TAB_*` constants.
- New: real-app grounding from screenshots.
- Many manager screens collapse from rich UIs (v5) to friendly empty-state placeholders — v6 focused on Today/Chats and the Office shell first.

## Open questions / notes
- This version is where the IA starts feeling "right" for the actual product — but v7 then argues that conditional tab arrays per persona is the wrong abstraction (locked-cards model).
