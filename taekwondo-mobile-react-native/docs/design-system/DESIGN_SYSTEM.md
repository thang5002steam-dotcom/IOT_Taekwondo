# TKD Mobile Design System

## Purpose

This document describes the visual system actually used by the Taekwondo Văn Quán mobile app after reconciling the current React Native codebase with the Figma file `App-phu-huynh`. It is not a generic design-system proposal.

The implementation source lives primarily in:

- `src/theme/colors.ts`
- `src/theme/typography.ts`
- `src/theme/radii.ts`
- `src/theme/effects.ts`
- `src/theme/theme.ts`
- `src/theme/icons.ts`
- `src/shared/ui/*`
- `src/routes/navigation/*`

## Visual model

The product language is a clean red/white martial-arts mobile UI:

- branded red headers and action surfaces
- light app canvas
- white elevated cards where containment is meaningful
- strong black/near-black content text
- gray secondary text/dividers
- compact iconography
- rounded but not excessively bubbly surfaces
- moderate shadows based on Figma effects
- 20px horizontal page rhythm
- 4-column feature grids
- floating bottom tab bar with a stronger QR center action

The design should feel branded and sporty, but still calm and usable. Do not turn every surface into a red card or add decorative gradients/glass that are not present in the design.

## Color system

### Final Figma paint styles

| Role | Value | Project mapping |
|---|---|---|
| Primary red | `#D71113` | `figmaColors.color1`, `Colors.light.primary` |
| Primary text | `#000000` | `figmaColors.color2`, `Colors.light.text` |
| Secondary text | `#6F6F6F` | `figmaColors.color3`, `Colors.light.textSecondary` |
| Divider/border | `#CACCCD` | `figmaColors.color4`, `Colors.light.divider` |
| Light element bg | `#FAFAFC` | `figmaColors.color5`, `Colors.light.backgroundElement` |
| App canvas | `#FAFAFC` | `figmaColors.bg1`, `Colors.light.background` |
| Surface | `#FFFFFF` | `figmaColors.bg2`, `Colors.light.surface` |
| Dark header red | `#A21D22` | `colorPrimitives.red[700]`, `Colors.light.header` |

### Gradient

Figma's named gradient is:

- start `#FD9956`
- end `#C2A5FD`
- opacity 0.5

Project mapping: `Gradients.gradient0`.

Do not use it as a generic hero background. Use only where the target design actually uses this gradient.

### Accent and semantic status colors

The project currently has a blue accent family, with `Colors.light.accent = #1E78BC`, used for secondary/support affordances.

Observed status colors in Figma/current components include:

- success: around `#16A34A`
- warning: around `#D97706`
- error: around `#DC2626`

If these status values continue to appear across features, promote them into semantic theme tokens rather than keeping feature-local copies.

### Legacy red warning

Older auth/debug screens use `#A9151A`. This value is not the current final-Figma primary. Do not copy it into new Figma-backed UI.

The two brand reds with explicit roles are:

- `#D71113`: primary/action/accent
- `#A21D22`: dark header/quick-feature panel

## Typography

Roboto is loaded by the Expo font config plugin from `@expo-google-fonts/roboto`.

### Canonical Figma text styles

| Semantic role | Family / weight | Size | Line height | Project token |
|---|---|---:|---:|---|
| Heading | Roboto Medium 500 | 20 | 28 | `typography.heading` |
| Subtitle | Roboto ExtraBold 800 | 18 | 26 | `typography.subtitle` |
| Title | Roboto SemiBold 600 | 17 | 26 | `typography.title` |
| Body | Roboto Regular 400 | 18 | 24 | `typography.body` |
| Body Small | Roboto Regular 400 | 15 | 20 | `typography.bodySmall` |
| Caption | Roboto ExtraBold 800 | 10 | 16 | `typography.caption` |
| Action | Roboto Medium 500 | 16 | 24 | `typography.action` |

Feature-grid labels in final Figma commonly appear as Roboto SemiBold around 13/20. The current generic `featureLabel` token is close but not exact; see `rule.md` and the audit notes below.

### Typography rules

- Prefer `ThemedText` with a semantic type.
- Do not style ordinary text with raw `fontSize` in each screen.
- Use local text overrides only when the target Figma has a legitimate special case.
- If the special case repeats, add/adjust a token.
- Avoid declaring a `fontWeight` that conflicts with an already weight-specific bundled font family.
- Keep text scaling enabled and allow rows/cards to grow where possible.

### Known typography drift

Current `typography.heading` uses `Roboto_500Medium` but also declares `fontWeight: "600"`. Figma says Medium 500.

Current `featureLabel` uses `Roboto_600SemiBold`, font size 14, and `fontWeight: "700"`. Final feature-screen Figma commonly uses about 13/20 SemiBold 600.

Do not spread these mismatches into new local styles. When touching the shared typography layer, reconcile the token centrally after checking every consumer.

## Spacing

The final UI repeatedly uses a 20px horizontal page inset. Treat this as the primary screen-edge rhythm.

Common recurring spacing seen in implemented/Figma-backed screens:

- 4–8px: icon/text micro-gap
- 10–12px: compact card/list gap
- 14–16px: card internal padding
- 20px: primary screen edge and common section/card gap
- 24px: comfortable modal/card padding
- 30–32px: separation between major sections
- 60–70px: repeated row/header component heights, not general spacing tokens

The current `Spacing` object is:

- 2
- 4
- 8
- 16
- 24
- 32
- 64

It is intentionally sparse. Do not introduce a competing spacing scale. If values such as 12 or 20 need repeated semantic use, extend the existing theme.

## Radii

Current project tokens:

- `radii.none = 0`
- `radii.sm = 4`
- `radii.md = 10`
- `radii.lg = 15`
- `radii.xl = 20`
- `radii.header = 30`
- `radii.pill = 100`

These values align better with final Figma frames than the generic local Figma collections named `WF Spacing`, which contain 8/12/16/999. The WF variables should be treated as wireframe/generic variables, not as automatic overrides of final node values.

Observed final-screen patterns:

- 10px: many cards, input/select rows, profile surfaces
- 15–16px: feature tiles and stronger cards
- 20px: some large buttons
- 30px: header corner / large pill actions
- 100/full: badges, circles and capsules

## Effects

### Figma Effect 1

- drop shadow
- offset 0, 5
- blur/radius 5
- black at 5%

Project: `effects.soft`.

Use for subtle floating content, stack header elevation, light cards.

### Figma Effect 2

- drop shadow
- offset 0, 0
- blur/radius 4
- black at 20%

Project: `effects.card`.

Use for visibly elevated cards, tiles, bottom navigation.

### Figma Effect 3

Figma contains a glass effect plus a 0/0/4 black 25% shadow. React Native implementation currently represents the useful visual part via `effects.glass`.

Do not assume every Figma glass effect requires runtime blur. Match the rendered intent and existing app behavior first.

## Surfaces

### App canvas

Use `Colors.light.background` for main screen background.

### Standard surface

Use `Colors.light.surface` for cards, sheets, white stack headers and grouped row containers.

### Dark brand surface

Use `Colors.light.header` for the red bottom-tab header and quick-feature panel when matching the current Figma family.

### Soft primary tint

Use `hexToRgba(Colors.light.primary, alpha)` for light red backgrounds rather than inventing unrelated pinks.

Common useful alphas in current code are around 0.04, 0.08, 0.10, 0.20 and 0.30 depending on emphasis.

## Icon system

The app icon pipeline is:

`reicon-react-native`
→ usage-site JSX icon import
→ `AppIcon`

Rules:

- Use `AppIcon` for product UI.
- Import the needed Reicon component where the icon is configured or rendered.
- Pass the icon as JSX, for example `icon={<Calendar />}`.
- Keep explicit width/height when the icon is not square.
- Keep artwork and multi-color images as image assets rather than coercing them through app icon logic.

## Screen geometry

### Reference width

Most main Figma mobile frames are 393px wide. Common heights differ because some frames capture scroll content:

- 852
- 922
- 1042
- 1145
- 1154
- 1177
- 1393
- 1593

Only the width is a common mobile reference. The varied heights prove that frame height should not be treated as a fixed device viewport.

### Header geometry

Figma frequently shows a total top area around 110px. That number includes status-bar content. Runtime code must use safe-area insets plus the app toolbar, not a raw 110px headerContent.

### Bottom navigation geometry

Reference Figma:

- outer screen width: 393
- tab bar width: roughly 352–353
- horizontal margin: roughly 20px each side
- bar height: 70
- rounded radius: around 15
- center QR action: around 46 square

The current `AppTabsLayout` reproduces this structure with a 20px padded container and a full-width inner bar.

## Reusable component ownership

The design system is not only tokens. Structure belongs to shared components:

- `ThemedText`: text semantics
- `ThemedView`: themed background wrapper
- `AppIcon`: app icon registry renderer
- `BottomSheetWindow`: sheet behavior and shell
- navigation layouts: screen chrome
- navigation action components: top-right actions

Feature-specific repeated patterns remain under their feature until they are truly shared across unrelated feature modules.

## Light and dark mode

The theme defines both light and dark values, and app config uses `userInterfaceStyle: "automatic"`. The current Figma source is primarily light-mode reference material.

For Figma-parity tasks:

- match the light target exactly first
- keep semantic token usage so dark mode can remain structurally possible
- do not invent a fully new dark visual language from scratch in a feature file
- when a dark-mode design is required, design it deliberately at the theme/shared-component layer

## Responsive behavior

Do:

- use flex
- use `useWindowDimensions` where layout decisions need width/height
- use screen padding and max widths
- let content wrap
- allow cards/rows to grow
- preserve safe-area insets

Do not:

- make all dimensions percentages
- scale fonts proportionally with device width
- hard-code page width to 393
- hard-code a 110px Figma status+header block as app content
- use absolute positioning for normal document flow just because Figma exports absolute coordinates

## Material/native relationship

Material 3 and platform conventions are implementation principles, not the product skin.

Use them for:

- touch-target sizing
- semantic roles/state
- accessibility
- predictable navigation
- platform text input behavior
- reduced motion
- safe-area handling
- disabled/loading/error states

Do not replace TKD's red/white language, iconography, card shapes, header treatment, feature grid, or branded hierarchy with generic Material defaults.

## Quick code mapping

Prefer:

`Colors.light.primary`
over:
`"#D71113"`

Prefer:

`Colors.light.header`
over:
`"#A21D22"`

Prefer:

`radii.md`
over:
`borderRadius: 10`

Prefer:

`effects.card`
over:
copying shadow properties into each screen.

Prefer:

`ThemedText type="bodySmall"`
over:
a raw `Text` with `fontSize: 15, lineHeight: 20`.

Prefer:

`AppIcon name="..."`
over:
new direct Lucide usage when the corresponding Figma asset exists.

## Audit snapshot

The source review that produced these rules found roughly 295 non-test TS/TSX files under `src`.

Design-system adoption is already meaningful:

- `Colors.light` appears across many implementation files
- `ThemedText` is widely used
- `AppIcon` is widely used
- shared stack/tab layouts exist
- five current usages of `BottomSheetWindow` were found during the scan

Remaining visual drift is concentrated around older auth/home/debug code and a few token mismatches, not a lack of a design system.

The correct next step is to strengthen the existing system, not replace it.
