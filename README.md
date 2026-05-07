# EasyDo 365 — iOS Skeleton

Glassmorphic skeleton for the iOS port of EasyDo 365.

Open `index.html` in any browser. Pick a persona at the top, then click any tab in the bottom Tab Bar to switch.

## Tab Bar

**HRMS users (B/C/D/E) — 5 tabs:**

| Slot | Name | Holds |
|---|---|---|
| 1 | **Home** | Launcher — greeting, punch status pill, branch pulse (managers), Google-Pay icon tray, schedule, announcements |
| 2 | **Workspace** | Tasks + Meets + Notes + Reminders unified |
| 3 | **Punch** | Standalone punch in/out — big orb, time, elapsed bar, In/Out/Total chips, status list, location timeline, week summary |
| 4 | **Chat** | Conversations + AI assistant + task/meet stat banner |
| 5 | **Me** | Profile + pay summary + Activity grid + My Records (Requests / Salary Slips / Leaves / Attendance / Documents / Handbook) + Manager Tools |

**App Users (A) — 4 tabs:** Home · Workspace · Chat · Me  *(no Punch — productivity-only)*

## Nav Bar (persistent top)

- HRMS users: company switcher chevron + branch chip + bell
- App Users: EasyDo brand + bell

(No avatar — Me lives in the bottom Tab Bar instead.)

## Personas

| Code | Persona | Modules | Default tab |
|---|---|---|---|
| **A** | App User | Productivity-only (free) | Home |
| **B** | HRMS Regular Employee | Productivity + HRMS | Punch |
| **C** | HRMS L3 | Same as B | Punch |
| **D** | HRMS L2 (Branch Manager) | + Branch mgmt | Home |
| **E** | HRMS L1 (CEO / Top Mgmt) | + Company mgmt | Home |

## Home composition (per persona)

- **A. App User**: greeting → icon tray (New Task / New Meet / New Note / Reminder / Drive / Calendar / Find / Upgrade) → today's schedule → birthdays
- **B. HRMS Regular**: greeting → punch status pill → icon tray (Apply Leave / OT / Advance / Reimburse / Payslip / Attendance / Holidays / Handbook) → schedule → birthdays → announcements → holidays → EOTM
- **D. HRMS L2**: greeting → punch status pill → Branch Pulse → Manage Office card → manager icon tray (Approvals / Mgmt Review / Register / Announce / Apply Leave / Documents / Reports / Location) → schedule → announcements
- **E. HRMS L1**: greeting → punch status pill → Company Pulse + Branch Breakdown → Manage Office card → CEO icon tray → schedule → announcements → EOTM

## Punch tab (HRMS standalone)

Big 172pt orb (loud, central) with halo glow → "PUNCH OUT" label → elapsed bar (7h 36m / 9h goal) → In/Out/Total chips → Status list (Present / Verified location / Flexible hours / Overtime not allowed) → Today's Location Timeline (map + ping list) → This Week summary (Mon-Today).

## Office (deep screen, managers only)

Opened from "Manage Office" card on Home. Branch/Company pulse hero → today's attendance breakdown grid → action grid (10 tiles for L2, 12 for L1) → pending approvals.

## Me (Tab 5 for HRMS, Tab 4 for productivity)

HRMS users:
- Profile + verification + completion ring
- **Pay summary card** with earnings/deductions breakdown
- **Activity grid** (Pending · Approved · Leaves Left · Attendance %)
- **My Records** — My Requests, My Salary Slips, My Leaves, My Attendance, Documents, Handbook
- Manager Tools (L1/L2 only)
- Account · Sign Out

App Users: Profile + My Productivity (Notes / Drive / Reminders / Calendar) + Account + "Upgrade to HRMS" CTA.

## Design tokens

- Brand primary: `#E5CE2B` — Punch button, icon-tray accents, active tab indicator, FAB
- Backdrop: warm gradient mesh (yellows + peach + indigo)
- Glass: `backdrop-filter: blur(20-30px)` + hairline border + top inner highlight
- Typography: Inter as SF Pro substitute

## Versions (git log)

- `v3` — 3-tab Tab Bar + avatar opens Me + Manage Office sub-screen
- `v4` — Google Pay icon tray + louder Punch button + Me with Requests/Salary
- `v5` — **Punch is its own bottom tab** + Me back in Tab Bar (avatar removed from Nav Bar) + 5 tabs for HRMS / 4 for productivity
