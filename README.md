# EasyDo 365 — iOS Skeleton

Glassmorphic skeleton for the iOS port of EasyDo 365.

Open `index.html` in any browser. Pick a persona at the top, click any tab in the bottom Tab Bar to switch screens, tap the avatar (top-right of the Nav Bar) to open Me.

## Tab Bar — 3 tabs, universal

| Slot | Name | Holds |
|---|---|---|
| 1 | **Home** | Personalized launcher per persona — greeting, big Punch button (HRMS), Google-Pay-style icon tray, schedule, announcements, etc. |
| 2 | **Workspace** | Tasks + Meets + Notes + Reminders rolled into one — universal across all personas, including HRMS L1/L2/L3 |
| 3 | **Chat** | Conversations + AI assistant + task/meet stat banner |

## Nav Bar (persistent top)

- HRMS users: company switcher chevron + branch chip + bell + avatar
- App Users (productivity-only): EasyDo brand + bell + avatar
- **Avatar tap → opens Me** as a deep screen with a back arrow

## Personas

| Code | Persona | Modules | Default tab |
|---|---|---|---|
| **A** | App User | Productivity-only (free) | Home |
| **B** | HRMS Regular Employee | Productivity + HRMS | Home |
| **C** | HRMS L3 | Same as B (visually identical) | Home |
| **D** | HRMS L2 (Branch Manager) | Productivity + HRMS + Branch mgmt | Home |
| **E** | HRMS L1 (CEO / Top Mgmt) | Productivity + HRMS + Company mgmt | Home |

## Home composition (varies by persona)

- **A. App User**: greeting → icon tray (Notes, Drive, Reminders, etc) → today's schedule → birthdays
- **B. HRMS Regular**: greeting → BIG PUNCH BUTTON → icon tray (Apply Leave, OT, Advance, Reimburse, Payslip, etc) → schedule → birthdays → announcements → holidays → EOTM
- **D. HRMS L2**: greeting → BIG PUNCH BUTTON → Branch Pulse → Manage Office card → icon tray (Approvals, Mgmt Review, etc) → schedule → announcements
- **E. HRMS L1**: greeting → BIG PUNCH BUTTON → Company Pulse + Branch Breakdown → Manage Office card → icon tray → schedule → announcements

## Me (deep screen, opened from avatar)

For HRMS users:
- Profile card with verification + completion ring
- **Pay summary card** with earnings/deductions breakdown
- **Activity grid** — Pending requests · Approved · Leaves left · Attendance %
- **My Records** section — My Requests, My Salary Slips, My Leaves, My Attendance, Documents, Handbook
- Manager Tools (L1/L2 only)
- Account (Switch Company, Settings)
- Sign Out

For App Users: Profile + My Productivity (Notes, Drive, Reminders, Calendar) + Account + "Upgrade to HRMS" CTA.

## Office (deep screen, managers only)

Opened from "Manage Office" card on Home. Contains: Branch/Company pulse hero, today's attendance breakdown grid, action grid (10 tiles for L2, 12 for L1), pending approvals.

## Design tokens

- Brand primary: `#E5CE2B` (yellow-lime) — reserved for the Punch button, icon-tray accents, active tab indicator, FAB
- Backdrop: warm gradient mesh (yellows + peach + indigo shadow)
- Glass: `backdrop-filter: blur(20-30px)` with hairline white borders + 1pt top inner highlight
- Typography: Inter as SF Pro substitute

## Versions (git history)

- `v3` — initial commit: 3-tab structure, avatar opens Me, Manage Office sub-screen
- `v4` — Google Pay icon tray on Home, louder centered Punch button (172pt orb with intensified halo), Me with My Requests + Salary sections + Activity grid
