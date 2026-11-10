# Taekwondo Mobile — Agent Rules

## Architecture source of truth

Before adding, moving, or refactoring source files or platform adapters, read
`docs/architecture/REACT_NATIVE_PROJECT_STRUCTURE_V2.md`.

V2 is the current standard. `REACT_NATIVE_PROJECT_STRUCTURE.md` is retained as
the v1 historical reference.

## Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v58.0.0/ before writing any code.

This repository currently targets Expo SDK 58 (package.json: expo ^58.0.19), React Native 0.88.x, React 19.3.x, Expo Router ~58.0.x and Reanimated 4.x. Do not answer from older Expo conventions when the versioned docs disagree.

## Mandatory UI references

Before creating, redesigning, or refactoring mobile UI, read:

1. `docs/design-system/rule.md`
2. `docs/design-system/DESIGN_SYSTEM.md`
3. `docs/design-system/COMPONENT_RULES.md`
4. `docs/design-system/SCREEN_PATTERNS.md`
5. `docs/design-system/FIGMA_REFERENCE.md`
6. `.agents/skills/tkd-mobile-ui/SKILL.md`

The Figma design file is:
`https://www.figma.com/design/yIRtDotMj9UQNlwgBzbr47/App-phu-huynh?node-id=288-658`

## Source-of-truth priority

When sources disagree, use this order:

1. Explicit requirement in the current task.
2. Existing business behavior, authorization, navigation, data contracts and accessibility requirements.
3. Existing shared project primitives and semantic theme tokens.
4. The target Figma node for visual composition, hierarchy, dimensions, iconography and visual intent.
5. An already-implemented screen from the same Figma family.
6. Material 3 / native mobile principles only as a fallback where the project and Figma are silent.

This does **not** mean an old shared component can permanently override Figma. If a shared component is demonstrably wrong for multiple Figma-backed screens, fix the shared component once instead of forking local copies.

## Canonical implementation surfaces

Prefer these existing building blocks before creating equivalents:

- `@/theme`: colors, typography, radii, effects, gradients, spacing exports.
- `ThemedText` for application text.
- `AppIcon` + `reicon-react-native` for app icon rendering.
- `BottomTabScreenLayout` for root tab screens.
- `StackScreenLayout` for pushed/detail screens.
- `HeaderActionButton`, `DefaultHeaderActions`, `NotificationHeaderButton`, `HomeHeaderButton` for header actions.
- `BottomSheetWindow` for app sheets/pickers/filters.
- Existing feature-local components when they already implement the same pattern.

Do not create a second design system, second icon registry, second sheet implementation, or second screen chrome system without an explicit architectural reason.

## Visual guardrails

- Brand primary is `#D71113`; dark brand/header surface used by Figma is `#A21D22`.
- Main app background is `#FAFAFC`; surface is `#FFFFFF`; primary text is `#000000`; secondary text is `#6F6F6F`; divider is `#CACCCD`.
- Roboto is the product typeface and is loaded through the Expo font config plugin.
- A Figma frame width of 393 is a reference canvas, **not** a hard-coded device width.
- Figma's 110px top area includes the iOS status-bar region. Do not set application header content to 110px. Use safe-area insets plus the shared header layout.
- The bottom navigation in the 393px design is approximately 353px wide because it has 20px screen margins; preserve that relationship with container padding rather than hard-coding “90%”.
- Keep touch targets at least about 44x44 even when the visible glyph is smaller.
- Use semantic tokens. A raw hex/font/radius repeated twice should be promoted to the theme instead of copied again.
- Use pressed/selected/disabled/loading feedback and accessibility state on interactive controls.

## Figma implementation workflow

For any Figma-backed task:

1. Identify the exact target node.
2. Fetch Figma design context for that node before coding.
3. Inspect the nearest existing project screen/component family.
4. Map Figma values onto existing project tokens/components.
5. Implement business behavior without changing IA unless requested.
6. Compare the rendered result with Figma at the target state.
7. Fix systemic differences in shared tokens/components when appropriate.
8. Run typecheck/tests relevant to the change.

Never paste generated Figma HTML/Tailwind code into React Native. Treat Figma output as measured reference data.

## Do not use legacy/debug UI as a visual template

The current `src/routes/home/HomeScreen.tsx` and much of the older auth/context UI contain hard-coded colors, raw `Text`, and direct Lucide usage. They remain useful for behavior, but they are **not** the canonical visual language for new Figma-backed work.

Do not propagate `#A9151A` as the product primary just because legacy screens use it. New Figma-matched work should use the theme/Figma colors above.

## Change discipline

- Keep business logic out of visual primitives.
- Preserve typed Expo Router routes and permission guards.
- Prefer feature-local composition until a pattern is genuinely reused.
- When a repeated pattern deserves promotion, extract it once and migrate callers gradually.
- Do not “improve” Figma with arbitrary gradients, glass, shadows, cards, or animation.
- Do not remove intentional branding to make the app look like stock Material.
- If the design is ambiguous, preserve the app's established TKD visual language rather than inventing a new one.
