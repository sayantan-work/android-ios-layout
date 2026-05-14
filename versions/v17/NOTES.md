# v17 — Aurora

## Design DNA · 2026 mesh gradient applied to HRMS

v17 takes the **2026 gradient renaissance** and applies its most distinctive technique — the **mesh gradient** — to the punch hero card. Where v16 used a clean violet→cyan linear gradient (Linear-coded), v17 stacks **four radial-gradient blobs** at the corners of the hero panel to fake a true mesh gradient. Violet bleeds into magenta, magenta into warm pink, warm pink into cyan, cyan back into violet. Plus a subtle SVG-noise overlay for the **"grainy aurora"** texture that's become a 2026 brand signature (Google's gradient G, Cursor, Arc, recent Anthropic).

The result is an animated organic glow on a single hero surface — calmer than a video, more alive than a flat color. The punch circle becomes a **frosted-glass disc** sitting on the aurora, with a backdrop-blur and a cycling multi-color halo.

## The mesh palette

Four blobs at quadrant anchors:

| Position | Color | Hex | Role |
|---|---|---|---|
| **Top-left** (18% / 20%) | Violet | `#A855F7` | Primary brand — Linear lineage |
| **Top-right** (82% / 28%) | Cyan | `#06B6D4` | Tech/data |
| **Bottom-center** (50% / 82%) | Magenta | `#EC4899` | Warmth, AI moments |
| **Bottom-right** (92% / 92%) | Warm pink | `#F472B6` | Soft glow corner |

Each blob is a `radial-gradient` with 0.40–0.55 alpha at the center, fading to transparent at ~50%. Stacked in CSS as a comma-separated multi-background — first color renders on top.

```css
.punch-band {
  background:
    radial-gradient(at 18% 20%, rgba(168,85,247,0.55) 0%, transparent 50%),
    radial-gradient(at 82% 28%, rgba(6,182,212,0.45) 0%, transparent 50%),
    radial-gradient(at 50% 82%, rgba(236,72,153,0.50) 0%, transparent 55%),
    radial-gradient(at 92% 92%, rgba(244,114,182,0.40) 0%, transparent 50%),
    var(--surface);  /* dark base under the mesh */
}
```

## The grainy noise overlay

On top of the mesh, a low-opacity SVG `feTurbulence` filter via data URI:

```css
.punch-band::before {
  content: ""; position: absolute; inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg ...feTurbulence baseFrequency=0.85 ...>");
  mix-blend-mode: overlay;   /* dark mode */
  /* mix-blend-mode: multiply; in light mode */
  opacity: 1;
  pointer-events: none;
}
```

This adds the texture that makes the aurora feel "hand-crafted" rather than CSS-default. Borrowed from designmd's grainy-gradient pattern.

## The frosted-glass punch circle

Instead of a solid colored circle, v17's circle is a glass disc on the mesh:

```css
.punch-circle {
  background: rgba(10,10,11,0.55);
  backdrop-filter: blur(8px);
  box-shadow:
    0 0 0 1.5px rgba(255,255,255,0.30),  /* white ring */
    0 0 24px rgba(168,85,247,0.36),       /* violet halo */
    0 0 48px rgba(236,72,153,0.18);       /* magenta outer halo */
}
```

When punched in, the circle fills with the 3-stop linear gradient (`#A855F7 → #EC4899 → #06B6D4`). The halo cycles through violet → magenta → cyan in a 4.2s `aurora-pulse` animation.

## Linear brand gradient (chips, buttons, FAB tags)

Same colors as the mesh but compressed into a 135° linear 3-stop:

```css
--gradient-brand: linear-gradient(135deg, #A855F7 0%, #EC4899 50%, #06B6D4 100%);
```

Applied to: primary buttons, FAB toast, today-row pill, AI avatar, profile avatar, version-pill active state, TOWNHALL announcement tag.

## Carries forward from v16
- **Light/dark mode toggle** (with `body.light` overrides and localStorage persistence — key updated to `v17-mode`)
- **Modern dev-tool DNA** — Inter sans + JetBrains Mono pairing, 1px hairline borders, glow > shadow
- **5-tab IA + permission model + announcements screen** (v7 lineage, intact)
- **Lightning bolt FAB icon** — same SVG, now sits on the aurora

## Light mode behavior
- Mesh uses `--gradient-mesh-soft` (~0.18–0.20 alpha blobs vs dark's ~0.40–0.55) so colors don't blow out the white canvas
- Noise overlay flips from `overlay` blend to `multiply` for visibility on light bg
- Punch circle becomes a semi-transparent white glass disc with a violet ring (instead of dark glass with white ring)

## RN port notes
- Mesh gradient: `expo-linear-gradient` doesn't do radials. Use `react-native-linear-gradient` with multiple stacked `<RadialGradient>` from `react-native-svg`, or 3-4 stacked `<View>`s with `borderRadius:50%` + `position:absolute`
- SVG noise overlay: render once as a static PNG asset and overlay with `<Image opacity={0.18} resizeMode="repeat" />` — cheaper than runtime SVG
- Backdrop-filter: iOS supports via `expo-blur`'s `<BlurView intensity={...}>`; Android has limited support, fallback to a flat rgba background

## Diff from v16 (the immediate predecessor)
- v16 single linear gradient → v17 **mesh + noise** (4 radials stacked + SVG turbulence)
- v16 violet `#A78BFA` + cyan `#22D3EE` → v17 **vivid violet `#A855F7` + magenta `#EC4899` + cyan `#06B6D4` + pink `#F472B6`** (warmer 4-color palette)
- v16 punch circle = black-inside violet-ring → v17 **frosted-glass disc, multi-color cycling halo**
- v16 home punch mini = solid surface with gradient left bar → v17 **soft-mesh background**
- v16 pulse animation 2-keyframe → v17 **3-keyframe cycling pulse** (violet → magenta → cyan)

## Open questions / notes
- The mesh is striking but heavy on the hero panel only. Consider if it should also bleed onto the home announcement card or stay confined to the punch experience.
- Some users may find the cycling pulse animation distracting on a long session — could add a `prefers-reduced-motion` switch that swaps the keyframe for a static glow.
- The grainy noise is subtle by design (0.18 opacity). If it doesn't read on retina/3x displays, bump to 0.25.
- Best fit: AI-native products, design-led teams, modern tech startups. Less fit for traditional enterprise (v11/v15 remain better there).

## Research sources
- [Why Gradients Are Coming Back in 2026 — Medium](https://medium.com/write-a-catalyst/why-gradients-are-coming-back-in-2026-and-what-you-need-to-know-about-it-12216ccdc5b8)
- [UI Color Trends That Define 2026 — Recursion](https://recursion.software/blog/ui-color-trends-2026)
- [Google's Gradient G — LogoDix](https://logodix.com/articles/google-gradient-g-logo-2026)
- [Brand identity trends 2026 — Threerooms](https://www.threerooms.com/blog/8-design-trends-shaping-brand-identity-in-2026)
- [Beyond 2 Colors: CSS Gradients 2026 — Nine Hub](https://nineproo.com/blog/css-gradient-generator-guide)
