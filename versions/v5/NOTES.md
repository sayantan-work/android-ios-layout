# v5 — Punch as its own tab + Me back in Tab Bar

## Design DNA
Same dark glassmorphism + yellow primary. Final iteration of the dark/yellow line before the v6 redesign.

## IA
Per commit `eb76308`: **"Punch as own bottom tab + Me back in Tab Bar (avatar removed from Nav Bar)"**.

Tab bar (HRMS): `Home · Workspace · Punch · Chat · Me`. App User: `Home · Workspace · Chat · Me`.

This is the v1/v2/v4 tab structure made canonical — v3's compaction experiment is fully discarded.

## Personas
Unchanged (A/B/D/E).

## Component inventory
- `PunchTab` (Punch is now a primary destination, not embedded in Home)
- `MeTab` (restored to tab bar; avatar in nav bar is gone)

## React Native port map

Same shape as v4 — primitives, libraries, gotchas unchanged.

**Custom components introduced/promoted in v5:**
- `<PunchScreen />` — now a primary tab destination, not a Home block
- `<MeScreen />` — restored from sub-screen to tab destination
- `<AvatarMenuTrigger />` — **removed** (v3/v4 only)

**RN navigator note:** This is the cleanest of the dark/yellow line. The `<Tab.Navigator>` shape lands here as a stable 5/4-tab layout that v7 will then re-think entirely (flat 5 tabs, no conditional hiding).

## Screens / pages

**Tab destinations (`renderBody`):** `home` · `workspace` · `punch` (HRMS) · `chat` · `me`.

**Sub-screen registry (`SCREENS` — ~38 entries, near-clone of v4):**

Status legend: ✓ Done · ◐ Placeholder · → Alias

- **Forms ✓** — `apply-request`, `apply-leave`, `apply-ot`, `advance`, `reimburse`
- **Me / HR ✓** — `me-requests`, `me-payslips`, `payslip-detail`, `me-leaves`, `me-attendance`, `documents`, `handbook`
- **Detail views ✓** — `task-detail`, `meet-detail`, `chat-thread`
- **Chat ✓** — `chat-new`, `chat-new-channel` (→ `chat-new-group`)
- **Punch ✓** — `punch-day`, `punch-location`
- **Manager ✓** — `approvals`, `mgmt-review`, `register`, `bg-verification`, `announce`, `leaves-mgmt`, `reports`, `web-admin`, `branches-list`, `holidays`
- **Settings ✓** — `company-menu`, `branch-menu`, `company-settings`, `branch-settings`, `settings`, `switch-company`, `notifications`
- **Office ✓** — `office`
- **Aliases →** — `location` → `punch-location`, `attendance` → `me-attendance`

**Not implemented:** anything not in `SCREENS` (toast "coming soon"). Same as v3/v4.

## Diff from v4
- Avatar removed from nav bar.
- Me restored to tab bar (was sub-screen in v3, mixed in v4).
- Punch elevated from CTA-on-Home (v4) to its own primary tab.
- Manage Office sub-screen retained from v3.
- Screen registry essentially identical to v4 — this version is an IA cleanup, not a feature add.

## Open questions / notes
- This is the **end of the dark/yellow line**. v6 is a from-scratch redesign with a completely different palette, IA, and grounding (light theme, real-app screenshots, 3 primary tabs).
