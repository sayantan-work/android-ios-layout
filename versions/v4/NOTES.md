# v4 — Google Pay icon tray + louder Punch + richer Me

## Design DNA
Same dark glassmorphism + yellow primary. Home gets a Google-Pay-style icon tray; Punch grows louder; Me expands.

## IA
Per commit `1bde0d9`: **"Google Pay icon tray on Home + louder centered Punch + Me with Requests & Salary"**.

Tab bar still references 5 (HRMS) / 4 (App User) — same structure as v1/v2.

## Personas
Unchanged (A/B/D/E).

## Component inventory
Adds:
- `IconTray` (Home — GPay-inspired grid of quick-action icons)
- Punch CTA is centered & enlarged (the orb gets visual weight)
- `Me · Requests` section (employee self-service requests)
- `Me · Salary` section (payroll glimpse)

## React Native port map

**Native primitives:** same as v3.

**Navigation:** `@react-navigation/bottom-tabs` (5/4 tabs again) + `@react-navigation/native-stack` for the same SCREENS-based sub-screens v3 introduced.

**New custom components introduced in v4:**
- `<IconTray />` — Google Pay-style quick-action grid on Home (precursor to v6's Today layout)
- `<FabMenu />` — `renderFabMenu` at line 701 — a floating action menu for the productivity hub
- Beefed-up `<MeScreen />` with Requests + Salary blocks

**Gotchas:** same as v1.

## Screens / pages

**Tab destinations (`renderBody`):** `home` · `workspace` · `punch` (HRMS) · `chat` · `me` (back to 5/4).

**Sub-screen registry (`SCREENS` — ~38 entries, v3's set + new):**

Status legend: ✓ Done · ◐ Placeholder · → Alias

- **Forms ✓** — `apply-request` (new — consolidated entry), `apply-leave`, `apply-ot`, `advance`, `reimburse`
- **Me / HR ✓** — `me-requests`, `me-payslips`, `payslip-detail`, `me-leaves`, `me-attendance`, `documents`, `handbook`
- **Detail views ✓** — `task-detail`, `meet-detail`, `chat-thread`
- **Chat ✓** — `chat-new`, `chat-new-channel` (→ `chat-new-group`)
- **Punch ✓** — `punch-day`, `punch-location`
- **Manager ✓** — `approvals`, `mgmt-review`, `register`, `bg-verification`, `announce`, `leaves-mgmt`, `reports`, `web-admin`, `branches-list`, `holidays`
- **Settings ✓** — `company-menu`, `branch-menu`, `company-settings`, `branch-settings`, `settings`, `switch-company`, `notifications`
- **Office ✓** — `office`
- **Aliases →** — `location` → `punch-location`, `attendance` → `me-attendance`

**Not implemented:** anything not in `SCREENS` (toast "coming soon"). Same fallback as v3.

## Diff from v3
- v3's 3-tab compaction is **reverted** here — tab bar restored to 5/4.
- Home introduces the icon-tray pattern (precursor to v6's Today layout).
- Punch becomes visually dominant on Home.
- Me grows from a simple profile screen to a hub with Requests + Salary.
- New `apply-request` consolidated form (entry point to apply-leave/ot/advance/reimburse).
- New `<FabMenu />` for quick-create.

## Open questions / notes
- The GPay icon tray idea matures into v6's quick-action grid.
- Punch's visual prominence on Home foreshadows v5 promoting Punch to its own tab.
