# v14 — Reps

## Design DNA · Cult.fit lineage + live theme switcher

v14 takes the **exact layout** of v13 (Tiffin) and applies the **Cult.fit-coded palette**: pure black `#0A0A0A` as the primary CTA / brand, **electric lime `#D4F33F`** as the active-state signal, **workout orange `#FF6B35`** as the secondary heat, **cyan glow `#22D3EE`** as info. The punch hero is now a black band — the dramatic gym moment. The punch-in state lights up in lime instead of red.

The bonus: v14 ships with a **runtime theme switcher** at the top of the page. The same layout cycles through four consumer-app palettes:
- **Cult** (default) — black + electric lime
- **Swiggy** — Swiggy-orange CTA + green success
- **Zepto** — hot magenta + yellow energy
- **PhonePe** — deep purple banking + bright green

This is the first version in the project where colors are decoupled from structure. Layout is locked; palette is liquid.

## Theme switcher

A pill-row at the top of the demo page lists the 4 themes. Click → body class swaps (`theme-swiggy`, `theme-zepto`, `theme-phonepe`, or none for Cult). Each theme overrides the brand CSS variables.

### Variables overridden per theme

| Variable | Cult (default) | Swiggy | Zepto | PhonePe |
|---|---|---|---|---|
| `--sage` (primary) | `#0A0A0A` black | `#FC8019` orange | `#E2007A` magenta | `#5F259F` purple |
| `--lime` (signal) | `#D4F33F` lime | `#60B246` green | `#FCD34D` yellow | `#00C853` green |
| `--orange` (heat) | `#FF6B35` | `#E23744` red | `#7C3AED` violet | `#FBC02D` gold |
| `--cyan` (info) | `#22D3EE` | `#3D4152` slate | `#10B981` mint | `#00ACC1` teal |

Plus each theme overrides `*-soft`, `*-deep`, and `*-ink` variants.

### Persistence
The chosen theme is saved to `localStorage('v14-theme')` so reloads preserve the selection.

## Cult-specific design moves (the default theme)

- **Punch hero band is BLACK** — the "dramatic moment" of v14 (echoes v9's "one dark moment" rule with a Cult.fit twist)
- **Punch circle pulses with a lime ring** — always lime, the active-state signal
- **Punch-in inverts to LIME fill with black ink** (`#D4F33F` background, `#1A2400` text) — stark contrast, gym energy
- **Tab FAB is BLACK** with a lime halo — black is the resting visual identity, lime is the always-visible "ready" signal
- **Avatar (Me)** is a pure black circle with a lime ring + lime initials — Cult-coded profile chip
- **Today's row** in attendance gets a lime-soft gradient wash
- **Status chips default LIME** (PRESENT = lime-fill + dark text) — replaces v13's Swiggy-green
- **Stamp burst** flies as a lime pill with black text — the active-state signal
- **CTA buttons (.btn-primary)** are black with lime text + a 2px inset lime ring — Cult's "Start Workout" button DNA
- **The lightning bolt FAB icon** from v13 is kept — now LIME on BLACK (was white on red)

## What carries forward from v13

The exact same layout. The exact same structure. The exact same script. The exact same component inventory. Only the color identity changes per theme.

- 5-tab IA (Home · Workspace · Punch FAB · Chats · Me)
- Permission model (locked rows, deny sheets)
- Attendance hairline logbook with today-row gradient
- Lifted hero cards with material-style shadows
- Dedicated announcements screen
- Lightning bolt FAB icon

## Component inventory (RN-named)

Identical to v13 — only the color tokens differ. For RN port, the `tokens.json` `themes` map can be loaded as four ThemeProviders and switched at runtime.

## RN port notes
- All 4 themes can be expressed as React Native `ThemeContext` providers
- The runtime switcher pattern translates 1:1 — `setTheme('zepto')` swaps which token set the components consume
- Light surfaces are theme-invariant (`#FFFFFF` canvas, `#FAFAFA` surface-2) — only brand/accent vars change
- Heavy gradient surfaces (`.punch-band`, `.home-punch-mini`) use the theme's `--sage` so they automatically re-color

## Diff from v13 (the immediate predecessor)

- v13 hardcoded Zomato red + multi-color → v14 **theme-switchable** with Cult as default
- v13 pink-soft punch band → v14 **black punch band** (Cult signature)
- v13 red punch circle on punch-in → v14 **lime punch circle on punch-in** (the active-state signal)
- v13 red TOWNHALL tag → v14 **black TOWNHALL tag with lime text**
- v13 violet→pink gradient avatar → v14 **pure black avatar with lime ring**
- v13 single palette → v14 **four palettes** switchable at runtime

## Open questions / notes

- The black punch band is a strong commitment. In themes where `--sage` isn't black (Swiggy orange, Zepto magenta, PhonePe purple), the band uses the theme's primary color — which can be visually aggressive for orange/magenta. If feedback says any theme's band is too loud, that theme can override `.punch-band` background separately.
- The Swiggy theme uses Swiggy's actual brand orange `#FC8019` — distinct from Cult orange `#FF6B35` and Zomato red `#E23744`. This is intentional — each theme stays faithful to its source app.
- Best fit: clients who want to compare 4 visual directions on the SAME structure before committing. v14 is the showroom; v15+ would be the chosen direction baked in.
