# v23 — Role-distinct heroes

## Design DNA · the audit that the iOS prototype was overdue for

v23 is the first iteration that admits the central design flaw across **v1 → v22**: the prototype only ever designed **one Home hero card** — the Punch tile — and stretched it across every persona. The four-persona switcher in the root demo (A/B/D/E) was a coarse stand-in for the real role model; in practice all four landed on a Punch-flavoured layout, only the chrome shifted.

That choice was right for the **L3 employee**, whose job-to-be-done literally *is* clocking in. It was a quiet disaster for every other reader: a director scrubbing the demo, an HR admin, an investor, a branch owner all saw "tap to clock in" as the first frame and concluded *"this is attendance software."* The data was always in the app (cross-branch metrics, approvals, payroll, onboarding queues) — it just wasn't where the eye landed.

v23 fixes that by **matching the role catalog in the production backend** (`easydo_native/easydo-convex/packages/backend/src/authz.ts::ROLE_CATALOG`) one-to-one, and giving each role its own Home hero shape. Same chassis (phone, status bar, nav, tab bar, scroll body). Six distinct first frames.

## The role catalog (mirrored from authz.ts)

| Role id      | kind         | autoScope   | Hero shape                                                 |
|---           |---           |---          |---                                                         |
| `owner`      | permanent    | company     | Metric strip + attention queue + branch grid               |
| `admin`      | permanent    | company     | Onboarding pipeline + HR action queue                      |
| `manager`    | permanent    | ownBranch   | Branch pulse grid + branch-scoped approvals                |
| `team_lead`  | permanent    | ownDept     | Team metric strip + team roster (with salary peek)         |
| `employee`   | permanent    | self        | Punch disc (v22 lineage)                                   |
| `member`     | permanent    | self        | Onboarding checklist with progress + gated features        |

The three time-bounded roles (`salary_auditor`, `document_reviewer`, `branch_consultant`) are visible in `authz.ts` but deferred — they're external/specialist personas, not the demo audience. They'll inherit Manager-or-Admin chassis when added.

## Why each hero is shaped the way it is

### Owner — attention queue

The Owner doesn't have a daily ritual. Their job is **decision allocation**: which leave to approve, which expense to sign, which face-match exception to investigate, which payroll variance to drill into. The hero is therefore an *inbox*, not a button:

- **Metric strip (4 stats):** branches, active today, payroll MTD, awaiting you. The "awaiting you" tile is the only one marked urgent (1.5px warn border) — it's the single thing the Owner needs to react to.
- **Attention queue (5 rows):** each row is one *decision class* with a count + one-line context (e.g., "3 leave requests · 1 over 48h"). Tap → drill into that class. No row is itself an item; they're aggregates. This is the IA pattern of Linear's inbox and the Stripe dashboard's top strip.
- **Branch grid (5 tiles):** quick health bar per branch (attendance %), one warn glyph when below 80%. Doubles as nav.

Lineage: **Linear inbox · Stripe dashboard · Things 3 "Today" · Apple Sports league overview.**

### Admin (HR) — onboarding pipeline + HR queue

HR ops is a flow problem, not a decision problem. Onboarding has *stages* and you want to see how full each one is at a glance:

- **Metric strip:** new hires, total employees, attendance %, docs to review (urgent).
- **Pipeline:** 5 horizontal bars — Invited / Documents pending / Verification in review / Appointment letters / Onboarded this month. Width = relative load. Color codes by stage type.
- **HR queue:** appointment letters, rejected docs, payroll preview, attrition report. Same `queueRow` primitive as Owner.

Lineage: **Stripe Atlas onboarding · Pipedrive's funnel view · Linear cycle progress.**

### Manager — branch pulse

A branch manager opens the app to answer one question: *is my branch running right now?* The hero answers in **<1 second**, before any decision:

- **4-tile pulse grid:** `287 in · 18 leave · 5 late · 2 missing`. Each tile has a 2px color strip up top (success / teal / amber / warn). No icons — pure numerals.
- **Stacked horizontal bar:** same data, visualised as proportions. Below it, a single line of caption: total · % present · cutoff.
- **Awaiting you (3 rows):** branch-scoped approvals only (leave, advance, missed-punch reviews).
- **Today's exceptions (3 rows):** who's late, who's missing, who breached the geofence.

The data is identical to what a Manager would see in v22, but reorganised so *branch state* leads and *individual approvals* follow. autoScope: `branch` means the same code on a different role's data renders a different branch.

### Team Lead — team roster with salary peek

The Team Lead role has one distinctive permission that no other manager-tier role has: `viewTeamSalary` for their own department. The hero foregrounds that:

- **Metric strip:** team size, active, approvals, overdue tasks.
- **Team list:** 5 rows + "view all" — each row shows initials avatar, name, role + status, **salary** in the right rail. Status dot (in / late / leave) sits before the name. The right column is salary text, not a chevron — uses the permission, doesn't hide it behind a tap.
- **Decisions waiting:** approvals scoped to direct reports only.

Salary tone: olive accent (`#5C6F2A`), tabular-nums. Calm, not loud.

### Employee — Punch (v22 lineage)

This is the only role where v22's hero design is *correct*. v23 keeps the visual treatment intact:

- Coral radial-gradient disc, fingerprint icon (Lucide port), "Punch In" CTA, current time.
- Location + Wi-Fi verification chips below.
- 3-stat row: avg this week, leave taken, days to payday.
- Below the hero: today's meetings + payslip preview.

defaultTab is `'punch'` for Employee (and only for Employee) — the muscle-memory case where the employee opens the app and the Punch screen is already there.

### Member — onboarding checklist

The Member role is the pre-onboarded state: invitation accepted, but no employee record yet. The hero is **"complete your verification"**:

- **Welcome eyebrow:** "Welcome, Rohit"
- **Headline:** "Let's get you onboarded" (22px, semi-bold)
- **Progress bar:** 40% (2 of 5 documents uploaded), amber accent
- **5-document checklist:** ID, PAN, address, education, bank. Each row has status icon: `check-circle` (done) / `clock` (review) / `circle-dash` (todo).
- **Two CTAs:** upload next + contact HR.
- **Gated section below:** "Available after onboarding" — punch, payroll, directory, dimmed at 0.55 opacity. Visible-but-locked, not hidden. Signals what's waiting.

This solves a real bug in v22: a new hire who accepts the invitation would land on an empty Punch screen they couldn't even use, because they have no employee record yet. v23 gives Members a meaningful first screen.

## What's NOT new

- **Phone frame.** Same 340×736, same notch, same status bar.
- **Tab bar primitive.** Same `.tab` shape and behaviour, the *contents* are role-driven.
- **Queue row primitive (`.queue-row`).** Owner, Admin, Manager, Team Lead, Employee, and Member all reuse the same queue-row pattern. The chassis is shared; the data shape per role is different.
- **Section header (`.section-head` with `.sh-label`/`.sh-count`/`.sh-link`).** Standardised across every hero.

This is the design ethos: **one app, six contexts.** Not six apps.

## SF Symbols

Icons are inline `<symbol>` SVGs styled to match Apple SF Symbols' visual language: 24×24 viewBox, 1.5px stroke, rounded caps/joins, slightly heavier proportions than Lucide, Apple-geometric shapes. No external font dependency — drop-in compatible with the v22 `${I('i-x')}` helper. ~35 symbols cover the surface area.

If/when the production app ships, the iOS native target can swap these for true SF Symbols via name mapping (e.g., our `i-buildings` → `building.2`), since the IDs already follow SF Symbol naming.

## Mapping to backend authz.ts

| v23 `ROLES[id]`      | authz.ts `ROLE_CATALOG[id]` | autoScope match     | Hero implication                      |
|---                   |---                          |---                  |---                                    |
| `owner`              | `owner`                     | "company" → company | Full attention queue + branch grid    |
| `admin`              | `admin`                     | "company" → company | HR pipeline (same scope, narrower JTBD)|
| `manager`            | `manager`                   | `ownBranch`         | Branch pulse only                     |
| `team_lead`          | `team_lead`                 | `ownDepartment`     | Team roster with salary peek          |
| `employee`           | `employee`                  | self                | Punch                                 |
| `member`             | `member`                    | self (pre-employee) | Onboarding checklist                  |

Direct 1-to-1 by ID. When the real backend wires up, the role switcher in this demo becomes a `roleId` selector against `getUserRoles(ctx, userId, scope)` — no translation layer.

## What v23 deliberately does NOT do

- **No new screens.** All non-Home tabs render a placeholder card explaining what the screen will be when built. v23 is a *hero audit*, not a full app build.
- **No theme switcher.** v14/v16 explored runtime theming. v23 stays single-theme to keep the contrast between role heroes clean.
- **No animation.** Heroes are static. Once the role-distinct shapes are validated, v24+ can introduce motion (e.g., metric strip slot-machine on data update, queue rows sliding in).
- **No persona switcher inside the phone.** The role switcher is *above* the phone, framed as a demo control. Inside the phone, the user is whoever they are — there's no in-app role chooser.

## Next iterations this opens up

- **v24: the four "exec" heroes refined** — Owner, Admin, Manager, Team Lead each get one more pass focused on what real data shape they need. Branch grid becomes a heatmap; attention queue gets time-since-arrival on each item; pipeline gets click-to-filter.
- **v25: the Member onboarding flow** as a full screen, not just the hero. The checklist row → full document upload flow with face capture and address autocomplete.
- **v26+: the time-bounded roles.** Salary Auditor, Document Reviewer, Branch Consultant. These get *short-form* heroes: a single decision queue scoped to their permission set, an "ends in N days" countdown chip.
