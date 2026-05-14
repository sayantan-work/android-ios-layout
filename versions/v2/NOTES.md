# v2 — iOS Skeleton (refinement of v1)

## Design DNA
Identical to v1 visually — dark glassmorphism, yellow primary `#E5CE2B`. Subtle border/glass tuning.

## IA
Same as v1: 5 tabs (HRMS) / 4 tabs (App User). `Home · Workspace · [Punch] · Chat · Me`.

## Personas
Unchanged from v1 (A/B/D/E).

## Component inventory
Same as v1.

## React Native port map
Identical to v1's port map — same primitives, same components, same gotchas. Only difference: tweak the `BlurView`/`GlassCard` border colour to a lower-alpha `rgba(255,255,255,0.06)` to match v2's hairline tuning. See [v1/NOTES.md](../v1/NOTES.md#react-native-port-map).

## Screens / pages

Same as v1: 5/4 tab destinations rendered inline, **no `SCREENS` registry**, no drill-down sub-screens.

| Tab | Status |
|---|---|
| `home`, `workspace`, `punch` (HRMS), `chat`, `me` | ✓ Done |
| Any drill-down (payslip, leave, chat-thread, etc.) | ✗ Not implemented |

## Diff from v1
- Border alpha lowered: `--border` `rgba(255,255,255,0.10)` → `rgba(255,255,255,0.06)`, `--border-strong` `0.18` → `0.12`. The glass surfaces read more subtly.
- Section-head simplified (no `view-all` link in announcements).
- Otherwise a cleanup pass — no structural changes.

## Open questions / notes
- Hairline tuning is the entire story of this version. Consider this an iteration on v1, not a new direction.
