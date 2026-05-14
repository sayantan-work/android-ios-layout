# v7 — Flat 5-tab IA + locked-card permission model

## Design DNA
Carries v6's light theme + Groww emerald + GPay blue palette, but **shifts the background warmer** (`--bg: #FAFAF7` cream vs v6's cooler `#F4F5F8`). Expanded color palette (amber/red/purple/pink soft tones for category accents). Cards more restrained than v6.

## IA — bottom tab bar
**5 flat tabs, identical for every persona:**
1. **Today** — hero punch card · schedule · announcements carousel · birthdays · pinned tasks
2. **Tasks** — productivity hub (tasks, meets, reminders, notes)
3. **Chats** — conversations + Channels (announcements appear as a Channel)
4. **Team** — approvals · branch pulse · management tiles
5. **Me** — profile · payroll · attendance · leaves · documents · settings

Roles **never change navigation** — they change content visibility.

## Personas & permission model
Same A/B/D/E as v1-v6, but a feature the user lacks renders a **locked card** in place (muted icon, title, one-line explanation, optional "Learn more"). The feature **always occupies its position** so the UI shape is identical across personas.

- **A** App User — productivity-only; locked cards on HRMS features
- **B** L3 — own punch/salary/attendance/leaves/docs
- **D** L2 Manager — B + branch-scoped team management + approvals
- **E** L1 CEO — D + company-wide scope

This is scaffolding for the long-term **GitHub-style token/permission model** (see `project_rbac_direction.md`).

## Component inventory
- `NavBar`, `TabBar` (5 flat tabs, emerald active)
- `LockedCard` ⟵ new in v7; central abstraction for permission gating
- `HeroPunchCard` (Today's centerpiece)
- `AnnouncementsCarousel`, `BirthdaysBlock`, `PinnedTasks`
- `TasksScreen` w/ filter chips
- `Channels` (in Chats)
- `ApprovalsList` (Team)
- `PayrollBlock`, `AttendanceBlock`, `LeavesBlock`, `DocumentsBlock` (Me)

## React Native port map

**Native primitives:** `SafeAreaView`, `View`, `Text`, `FlatList`/`SectionList`, `Pressable`, `Image`.

**Navigation:**
- `@react-navigation/bottom-tabs` — **5 tabs, identical across personas.** Configure once; never conditionally render.
- `@react-navigation/native-stack` for SCREENS-based sub-screen pushes.

**Custom components:**
- `<NavHeader />`, `<TabBar />` (5 tabs, emerald active)
- **`<LockedCard />`** ⟵ central abstraction. Wraps any feature; renders the muted "you don't have access" card when `usePermission(feature)` returns falsy.
- `<HeroPunchCard />`, `<AnnouncementsCarousel />`, `<BirthdaysBlock />`, `<PinnedTasks />`
- `<TaskFilterChips />`, `<TaskList />`, `<ChannelList />`
- `<ApprovalsList />`, `<PayrollBlock />`, `<AttendanceBlock />`, `<LeavesBlock />`, `<DocumentsBlock />`

**Permission hook (proposed):**
```ts
function usePermission(feature: Feature): { allowed: boolean; reason?: string }
// Today: hardcoded persona→permission map.
// Future: token-set lookup (see project_rbac_direction.md).
```
Pattern in every gated screen: `if (!allowed) return <LockedCard reason={reason} />;` — keep equal layout height so UI shape is invariant across personas.

**Gotchas:**
- Never `null`-return on permission denial — use a placeholder of equal height.
- Don't add a "lock" icon variation per feature; the visual is a single shared `<LockedCard />`.

## Screens / pages

**Tab destinations:**
- `today` ✓ · `tasks` ✓ · `chats` ✓ · `team` ✓ · `me` ✓

**Sub-screen registry (`SCREENS` — ~30 entries):**

Status legend: ✓ Done · ◐ Placeholder (empty-state only) · → Alias

- **Forms ✓** — `apply-request`, `apply-leave`, `apply-ot`, `apply-advance`, `apply-reimburse`, `task-new`, `chat-new`, `announce-new`
- **Me / HR ✓** — `me-payroll` (→ `payslip-detail`), `me-payslips`, `me-leaves`, `me-attendance`, `documents`, `handbook`
- **Detail views ✓** — `announce-detail`, `task-detail`, `meet-detail`, `birthday`, `chat-thread`, `chat-channel`
- **Tasks ✓** — `tasks-detail` (full list, `tasksScreen`)
- **Manager ✓** — `approvals` (→ `leaves-queue`), `register`, `punch-location`, `branch-menu`, `branches-list`, `reports` (→ `mgmt-review`)
- **Operational ✓** — `holidays`
- **Settings ✓** — `company-settings`, `branch-settings`, `settings`, `about`
- **Placeholders ◐** — `bg-verify` (empty: "All clear · 15 verified · 2 in progress"), `web-admin` (empty: "Use the web admin for bulk operations")
- **Not implemented** — any route id outside the registry (toast "coming soon")

**Persona content gates** (each gated screen renders `<LockedCard />` when not allowed):
- Punch / Attendance / Leaves / Payroll → A locked, B+/D/E unlocked
- Team approvals → A/B locked, D/E unlocked
- Manager grid (register, branches, reports, web-admin) → A/B locked, D scoped to branch, E company-wide

## Diff from v6
- Tab bar: 3 (variable) → **5 (flat, persona-invariant)**.
- v6's Office tab with 5 sub-tabs is **dissolved** into Today (Punch) + Team (Manager) + Me (Salary).
- **Locked cards** replace conditional tab hiding — same screens for everyone.
- Background warms from cool gray to cream.
- Adds soft accent tones (amber/red/purple/pink) for category use.
- `SCREENS` registry similar in shape to v3-v5 but uses `me-payroll`/`tasks-detail`/`birthday` ids matching the new IA.

## Open questions / notes
- The locked-card pattern must survive v8's Todoist visual reset — confirmed in v8 as "dashed locked rows".
- Never hide tabs based on persona, even after RBAC tokens arrive.
