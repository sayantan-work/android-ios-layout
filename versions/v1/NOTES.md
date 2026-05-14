# v1 — iOS Skeleton (foundational)

## Design DNA
Dark glassmorphism iOS shell. Yellow primary (`#E5CE2B`) on near-black surfaces, frosted glass nav/tab bars (`backdrop-filter: blur(30px) saturate(140%)`), peach/teal/bronze secondary accents. 340×736 phone frame.

## IA — bottom tab bar
Tab count is per-persona:
- **HRMS users (B/D/E):** 5 tabs — `Home · Workspace · Punch · Chat · Me`
- **App User (A):** 4 tabs — `Home · Workspace · Chat · Me` (no Punch)

## Personas (established here, stable through v5)
- **A** App User — productivity-only
- **B** HRMS L3 — Employee, sees only self, branch read-only
- **D** HRMS L2 — Branch Manager, can approve, branch-scoped
- **E** HRMS L1 — CEO, company-wide scope

## Component inventory
- `NavBar` (glass blur, back · title · brand-logo · name · bell)
- `TabBar` (glass blur, persona-driven 4/5 tabs, yellow active state)
- `GlassCard` (translucent surface used for announcements, schedule, etc.)
- `AnnouncementsBlock`, `ScheduleBlock`, `PunchOrb`
- `SectionHead` (title-2 + view-all)
- `Chip` / `Tag` (pill borders, brand variant in yellow)
- `Toast`, `Toggle`, `Empty`, `Field`, `BtnBlock`

## React Native port map

**Native primitives:** `SafeAreaView`, `View`, `Text`, `ScrollView`, `Pressable`, `Image`, `Animated.View` (for tab-press scale + toast).

**Navigation:**
- `@react-navigation/bottom-tabs` with a custom `tabBar` prop to render the glass-blur background
- `@react-navigation/native-stack` for any future drill-down (none in v1)
- App-User vs HRMS: same navigator, conditionally include `<Tab.Screen name="Punch">` based on persona (the locked-card model arrives in v7)

**Visual effects:**
- `expo-blur` (`<BlurView intensity={30} tint="dark" />`) for `NavHeader`, `TabBar`, `GlassCard`, `Toast` — RN has no native `backdrop-filter`
- `react-native-svg` or `lucide-react-native` for the inline `<symbol>` icon set

**Custom components → file paths (rename 1:1 PascalCase):**
- `NavHeader`, `TabBar`, `GlassCard`, `PunchOrb`
- `AnnouncementsBlock`, `ScheduleBlock`, `SectionHead`
- `Chip`, `Tag`, `Toggle`, `FieldInput`, `Toast`, `EmptyState`, `BtnBlock`

**Proposed RN layout:**
```
src/
  navigation/{ RootTabs.tsx, TabBar.tsx }
  components/{ NavHeader, GlassCard, PunchOrb, ... }.tsx
  screens/{ Home, Workspace, Punch, Chat, Me }Screen.tsx
  theme.ts                ← derived from tokens.json
```

**Gotchas:**
- `BlurView` on Android renders flat/grey — use a `Platform.OS === 'android'` `rgba()` fallback.
- The phone-frame multi-stop radial gradient is demo dressing — drop it in RN, use solid `#0F0F12`.
- Yellow primary `#E5CE2B` on dark fails AA contrast at small sizes — bump weight or use `--peach` for small text.

## Screens / pages

**Tab destinations** (rendered inline by `renderBody` — no `SCREENS` registry yet):
| Tab | Status | Notes |
|---|---|---|
| `home` | ✓ Done | Greeting · punch pill · icon tray · schedule · announcements |
| `workspace` | ✓ Done | Tasks/Meets/Notes/Reminders unified |
| `punch` | ✓ Done | HRMS only — orb · elapsed bar · status chips · location · week summary |
| `chat` | ✓ Done | Conversations · AI assistant · stat banner |
| `me` | ✓ Done | Profile · pay summary · Activity grid · My Records · Manager Tools |

**Sub-screens:** ✗ **Not implemented in v1.** Drill-downs (payslip detail, individual leave, chat thread, etc.) are no-ops visually — content sits inline inside the relevant tab body. The `SCREENS` registry + `navigate()` pattern arrives in **v3**.

## Diff from previous
First version — sets the baseline shell, persona model, and tab IA reused through v5.

## Open questions / notes
- Phone-frame gradient is heavily decorated (multi-stop radials + linear). On RN port, simplify to solid `#0F0F12` background — the gradient is just demo dressing.
- No locked-card concept yet; tabs are conditionally hidden per persona (changes in v7).
