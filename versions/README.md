# EasyDo 365 — iOS Design Versions

Every iteration of the iOS prototype lives as its own folder. Each version is self-contained: open `index.html` directly in a browser, or copy the folder anywhere — it has no external dependencies.

## Layout per version

```
versions/vN/
  index.html      ← markup (HTML structure only)
  styles.css      ← all CSS for this version
  script.js       ← all JS for this version
  tokens.json     ← extracted design tokens (RN-port-friendly)
  NOTES.md        ← design DNA, IA, components, diff from previous
```

## Versions

| # | Theme | IA | Headline change |
|---|---|---|---|
| [v1](v1/) | Dark glass · yellow `#E5CE2B` | 5/4 tabs (`Home·Workspace·[Punch]·Chat·Me`) | Foundational iOS skeleton + A/B/D/E personas |
| [v2](v2/) | Dark glass · yellow | Same as v1 | Hairline/border tuning |
| [v3](v3/) | Dark glass · yellow | 3 tabs (`Home·Workspace·Chat`) + avatar→Me | Compact tab bar experiment + Manage Office sub-screen |
| [v4](v4/) | Dark glass · yellow | 5/4 tabs (reverts v3) | GPay icon tray on Home + louder Punch + Me Requests/Salary |
| [v5](v5/) | Dark glass · yellow | 5/4 tabs (canonical) | Punch as own tab · Me back in tab bar · avatar removed |
| [v6](v6/) | **Light · Groww emerald + GPay blue** | 3 tabs (`Today·Chats·Office`) + 5 Office sub-tabs | Full redesign · real-app grounded · light theme |
| [v7](v7/) | Light · emerald + blue (cream bg) | **5 flat tabs**, persona-invariant | Locked-card permission model replaces conditional tabs |
| [v8](v8/) | Pure white · single red `#DC4C3E` | Same 5 tabs as v7 | Todoist visual reset · hairlines, no cards, circle checkboxes |
| [v9](v9/) | Warm linen · modern indigo `#5E6AD2` + one dark moment | Home · Workspace · **Punch** (center) · Chats · Me | Quiet Vault · circle punch + paper-grain RFID · location map · no persona switcher · combined company/branch chip |
| [v10](v10/) | Cream paper · stamp-red `#A63D40` · serif everywhere | Same 5 tabs as v9 | Field Ledger · editorial newspaper meets employee logbook · rubber-stamp attendance · postcard treatments · system serif type stack |
| [v11](v11/) | Pure white · electric cobalt `#0052FF` · system sans 500–700 | Same 5 tabs as v9 | Crisp · Coinbase × Linear × Stripe lineage · no dark band anywhere · solid cobalt fill chips · visible 1px borders + ambient shadows · banking-grade clarity |
| [v12](v12/) | Synthesis — v11 cobalt + v8 hairlines + v10 editorial heads + v7 permissions | Same 5 tabs as v9 | Method · 3-tier elevation (hairline / subtle / hero) · attendance logbook · small-caps section heads on hairline rule · dedicated announcements screen |
| [v13](v13/) | Zomato red `#E23744` + Swiggy green + Zepto pink + Cult orange · multi-color hierarchy | Same 5 tabs as v9 | Tiffin · Indian consumer-app energy applied to HRMS · FAB-style punch · saturated colored shadows · status chips speak Swiggy delivery-state · violet→pink gradient avatar · references FoodDash (designmd.ai/chef/fooddash) |
| [v14](v14/) | Cult.fit black `#0A0A0A` + electric lime `#D4F33F` · runtime theme switcher | Same v13 layout | Reps · Cult.fit lineage by default · live theme switcher cycles Cult / Swiggy / Zepto / PhonePe · same layout, four palette identities · localStorage persistence |
| [v15](v15/) | Manila `#F2EAD3` + CRT amber `#FF6B00` + navy `#0E1A2B` · IBM Plex Mono | Same v13 IA | Mainframe · literal IBM punch card hero (column markers · perforated dashed rules · serial-number header · deep-recessed "hole" circle) · mono everywhere · 4px hard stamp shadows · bracket-typography section heads |
| [v16](v16/) | Near-black `#0A0A0B` + violet `#A78BFA` → cyan `#22D3EE` gradient · light/dark toggle | Same v13 IA | Console · modern dark-mode tech (Linear × Vercel × Cursor × Anthropic) · first dark theme since v1–v5 · single gradient brand mark · glow > shadow · 1px hairline borders · Inter sans + JetBrains Mono · runtime light/dark switcher |
| [**v17**](v17/) **(current)** | **Mesh gradient (4-blob aurora) + grainy noise · violet `#A855F7` + magenta `#EC4899` + cyan `#06B6D4` + warm pink `#F472B6`** | Same v13 IA | Aurora · 2026 gradient renaissance applied to HRMS · 4 stacked radial-gradient blobs at quadrant anchors · SVG feTurbulence noise overlay (grainy aurora texture) · frosted-glass punch disc with backdrop-blur · 3-keyframe cycling halo (violet → magenta → cyan) · carries v16's light/dark toggle |

## Reading order

If you're new to the codebase:
1. Read **v13/NOTES.md** — this is the current target (Tiffin · Indian consumer-app energy).
2. Read **v12/NOTES.md** — the Method (synthesis of v7/v8/v10/v11). v13 keeps its 5-tab IA + permission model + announcements screen, replaces everything visual.
3. Read **v11/NOTES.md** — the Crisp predecessor (pure white + electric cobalt). v13 is the consumer-app counterpoint to v11's banking-trust direction.
4. Read **v10/NOTES.md** — the Field Ledger (cream + serif + stamp-red). v12 borrows its editorial section-head pattern.
5. Read **v9/NOTES.md** — the Quiet Vault (warm linen + indigo) where the 5-tab IA, circle punch, and combined company/branch chip originated.
6. Skim **v8/NOTES.md** — establishes the hairline-list discipline that v12 reinstates as the default surface.
7. Skim **v7/NOTES.md** — establishes the IA and permission model that v8/v9/v10/v11/v12/v13 all keep intact.
8. Skim **v6/NOTES.md** — explains the light-theme reset and where the real-app structure came from.
9. v1–v5 are historical context (the dark/yellow line) — useful only if you want to understand what was rejected and why.

## Tokens (for React Native port)

Each `tokens.json` extracts colors, type scale, radii, and the phone-frame dimensions. A 10-line transform turns it into a `theme.ts` for RN. Don't hand-extract tokens from the CSS — use the JSON.

## Cross-version navigation

The "Version" switcher at the top of each `index.html` links between sibling versions (`href="../v3/"` etc.). Open any version's `index.html` and you can jump between them.

## Design memory

Long-form design DNA notes live in user-memory (`C:\Users\dj\.claude\projects\C--Users-dj-Desktop-ios-design\memory\`):
- `project_v6_design_dna.md`
- `project_v7_ia_and_permissions.md`
- `project_v8_todoist_dna.md`
- `project_v9_direction.md`
- `project_mobile_information_hierarchy.md`
- `project_rbac_direction.md`
- `feedback_versioning.md`
- `feedback_version_folder_structure.md`
