# TKD Mobile UI Rules

This file is the compact, enforceable rule set for building UI in `taekwondo-mobile`. It is intentionally stricter than a generic Expo/React Native style guide because this app already has a Figma language and reusable project primitives.

## 1. Design identity

The app is **Taekwondo Văn Quán**, not a stock Material demo. Use Material/native principles for interaction quality, accessibility, touch targets and platform behavior, while preserving the existing TKD visual language from Figma.

Core visual identity:

- Primary red: `#D71113`
- Dark brand/header red: `#A21D22`
- Primary text: `#000000`
- Secondary text: `#6F6F6F`
- Divider/border: `#CACCCD`
- App background: `#FAFAFC`
- Surface/card: `#FFFFFF`
- Main font: Roboto
- Common final-screen radii: 10, 15, 20, 30 and pill/circle radii
- Shadows should map to `effects.soft`, `effects.card` or `effects.glass`

## 2. Source priority

When there is a conflict, resolve it in this order:

1. Current user/task requirement.
2. Existing business behavior and permissions.
3. Existing shared component contracts and semantic theme tokens.
4. The exact target Figma node.
5. Existing implemented screen in the same family.
6. Material 3 / iOS / Android convention as fallback.

Important nuance: if a shared component itself is the source of repeated visual mismatch, update that shared component instead of copying a local workaround into every screen.

## 3. Figma is measured reference, not generated code

For Figma-backed work:

- Always use the exact target node, not only the page-level URL.
- Read design context before coding.
- Use screenshots/metadata only to orient or validate.
- Translate Figma dimensions into responsive React Native layout.
- Do not copy generated HTML, Tailwind or absolute-position code into React Native.
- Do not download a random icon substitute when the project already has the exact Figma icon.
- If Figma contains an exported image/icon not present in the app, add the exact asset and register it rather than hand-drawing an approximation.

Figma file:
`yIRtDotMj9UQNlwgBzbr47 / App-phu-huynh`

Primary design page:
`288:658 / Design`

## 4. Never treat 393x852 as a fixed device

Most final mobile frames are 393px wide. This is a design canvas, not a runtime width.

Rules:

- Use flex layout and screen padding.
- Do not set page width to 393.
- Do not scale every value by `Dimensions.width / 393`.
- Preserve optical sizes for text, icons, rows and touch targets unless the component genuinely needs responsive sizing.
- Use `useWindowDimensions` for layout decisions that truly depend on available space.
- Prefer `maxWidth` for tablet/web containment instead of proportionally inflating mobile UI.

## 5. Header rule: Figma 110 is not app content height

The Figma top region around 110px includes iOS status-bar space (roughly 59px in the reference frames) plus the visible app header.

Therefore:

- Never write `height: 110` for `headerContent` just because Figma says H=110.
- Use safe-area insets for device chrome.
- Reuse `BottomTabScreenLayout` or `StackScreenLayout`.
- If changing the shared header, reason about safe-area + toolbar content separately.
- Keep title centered while left/right actions remain independently positioned.
- Header icon controls must keep a touch box of about 44x44 even when the glyph is 24–30px.

## 6. Bottom-tab rule

The Figma bottom bar is approximately 352–353px wide on a 393px frame because the design uses about 20px left/right margins.

Therefore:

- Prefer a full-width tab list inside a container with 20px horizontal padding.
- Do not hard-code `width: '90%'` merely to approximate the Figma number.
- Keep the center QR action visually stronger than the other tabs.
- Active state uses brand primary; inactive state uses secondary text.
- Keep tab labels short and allow the icon to carry most visual weight.
- Preserve bottom safe-area behavior.

## 7. Use existing visual primitives

Before creating a new component, search for an existing one.

Mandatory defaults:

- Text → `ThemedText`
- App/Figma icon → `AppIcon`
- Root tab screen → `BottomTabScreenLayout`
- Stack/detail screen → `StackScreenLayout`
- Header icon action → `HeaderActionButton`
- Default header actions → `DefaultHeaderActions`
- Filters/pickers/selection surfaces → `BottomSheetWindow`
- Project colors/radii/effects/type → `@/theme`
- Images → `expo-image` unless another existing component requires otherwise

Do not introduce a new visual primitive if the only difference is a local margin or content composition.

## 8. Icon rules

The app uses `reicon-react-native` icon components through `AppIcon`.

Rules:

- Prefer `AppIcon` for product UI and pass a Reicon element with `icon={<SomeIcon />}`.
- Import the needed Reicon component at the usage site.
- Do not add new app icon SVG assets or inline arbitrary SVG path data in screen files.
- Do not use emoji as interface icons.
- Do not introduce Lucide simply because it is convenient when the Figma glyph already exists.
- Direct Lucide usage in older auth/home/debug screens is legacy, not a precedent for new visual work.
- Tint only icons whose SVG is designed to accept tinting; preserve multicolor assets when color is part of the artwork.

## 9. Typography rules

Use the project Roboto families and named typography tokens.

Canonical Figma text ramp observed in final screens:

- Heading: 20 / 28, Roboto Medium 500
- Subtitle: 18 / 26, Roboto ExtraBold 800
- Title: 17 / 26, Roboto SemiBold 600
- Body: 18 / 24, Roboto Regular 400
- Body Small: 15 / 20, Roboto Regular 400
- Caption: 10 / 16, Roboto ExtraBold 800
- Common feature label in the feature grid: 13 / 20, Roboto SemiBold 600
- Common action: around 16 / 24, Roboto Medium 500

Do not create a new font size for a screen if an existing token expresses the same semantic role. If a Figma-backed size repeats across multiple components, add a token rather than repeating literals.

Do not disable font scaling globally. Layout should tolerate larger text where practical.

## 10. Color rules

Use semantic project tokens first.

Do not repeat hard-coded hex values in screen files. A one-off semantic status color can be local temporarily, but if it appears in more than one feature/component it belongs in the theme.

Legacy warning:

- `#A9151A` appears repeatedly in older auth/debug code.
- It is not the current Figma primary.
- Do not propagate it into new Figma-backed UI.
- Use `#D71113` / `Colors.light.primary` and `#A21D22` / `Colors.light.header` according to role.

For alpha variants, prefer `hexToRgba` over manually inventing nearby colors.

## 11. Radius and surface rules

Use `radii` where possible.

Observed final-frame usage favors:

- 10px for many cards, rows and content surfaces
- 15–16px for stronger tiles/cards
- 20px for some large buttons
- 30px for large rounded/pill actions
- fully rounded values for badges/circles

Do not force generic “8/12/16 Material radius” values if the target Figma uses the TKD radii. The local Figma variable collections named `WF*` are wireframe-oriented and do not override actual final-frame values.

## 12. Shadow/effect rules

Map Figma effects to project effects:

- Figma Effect 1 → `effects.soft`
- Figma Effect 2 → `effects.card`
- Figma Effect 3 visual shadow/glass intent → `effects.glass`

Do not add shadows to every card. Use them when the Figma surface is elevated or when the existing family uses elevation.

Do not create decorative glass/blur just because `expo-glass-effect` is installed.

## 13. Spacing and rhythm

Prefer the established screen rhythm:

- 20px horizontal screen padding is a recurring canonical value.
- Section gaps commonly live around 20–32px.
- Repeated list/card gaps commonly live around 10–20px.
- Use `gap` for sibling spacing when possible.
- Prefer padding inside components over external negative margins.
- Keep related elements closer than unrelated sections.

Existing `Spacing` is sparse. If a new spacing scale is introduced, extend the existing theme rather than creating a second spacing object.

## 14. Interactive states

Every interactive custom control should have relevant states:

- default
- pressed
- selected, when applicable
- disabled, when applicable
- loading/busy, when applicable
- error, when applicable

The current app often uses pressed opacity around 0.75–0.82 and sometimes `scale: 0.98`. Keep feedback subtle and consistent.

Do not animate every tap. Motion should communicate state or navigation, not decorate.

## 15. Bottom-sheet rules

Use `BottomSheetWindow` for app-level filters, pickers and selection surfaces unless the task explicitly requires a different native behavior.

Existing behaviors to preserve:

- dismiss via backdrop
- dismiss via close button
- pan/drag dismissal
- spring return when not dismissed
- reduced-motion support
- accessibility modal semantics
- optional footer action area
- safe bounded height

Do not create a second custom `Modal` sheet for a new filter.

Centered modal dialogs remain appropriate for consequential confirmation flows such as logout.

## 16. Card/list rules

Do not make every grouping a floating card.

Use a card when the design communicates a distinct elevated/contained object, e.g.:

- schedule item
- profile summary
- history record
- notification item
- training score section

Use hairlines/grouped rows when the design communicates a list, e.g.:

- account menu rows
- general info rows
- filter options

## 17. Screen families

Choose the correct family before writing JSX:

- Bottom-tab root screen
- Stack/detail screen
- Feature catalog
- Schedule/list screen
- History/result screen
- Profile/account screen
- Notification center/detail
- Bottom-sheet filter/picker
- Confirmation dialog

Read `SCREEN_PATTERNS.md` before inventing another page skeleton.

## 18. Accessibility

At minimum:

- icon-only buttons require an accessibility label
- tabs expose selected state
- checkboxes expose checked state
- disabled/loading controls expose state
- modal/sheet content is exposed as modal
- touch target remains practical even when visual glyph is small
- do not encode status only by color when text/badge state can also communicate it

## 19. Business logic and UI ownership

Visual refactors must not silently alter:

- permission gates
- active-person/context rules
- router destinations
- API contracts
- persisted state
- query invalidation
- attendance rules
- notification read semantics

UI components receive business state; they do not invent authorization or data policy.

## 20. “Existing code” does not always mean “canonical design”

Use existing code as precedent only after classifying it.

Canonical visual references currently include:

- `src/routes/navigation/layouts/*`
- `src/routes/navigation/components/*`
- `src/routes/account/AccountScreen.tsx`
- `src/routes/account/GeneralInfoScreen.tsx`
- `src/routes/activities/ActivitiesScreen.tsx`
- `src/features/activities/components/*`
- `src/features/attendance-history/*`
- `src/features/class-schedule/screens/ScheduleScreen/*`
- newer notification components that already use the theme/shared primitives

Behavioral-but-not-visual references include:

- current debug-oriented `src/routes/home/HomeScreen.tsx`
- older authentication/context screens with direct Lucide/raw colors/raw Text

Do not copy their hard-coded visual values into new screens.

## 21. Known design drift to avoid copying

Current implementation contains some differences from the Figma source.

Examples:

- Feature-grid quick tile: Figma final screen uses about 60x60 visible tile; current `ActivitiesActionButton` uses 70x70.
- Final Figma feature labels commonly use 13/20 SemiBold; current generic `featureLabel` token is 14/20 and declares weight 700 on a SemiBold family.
- Figma Heading is Roboto Medium 500; current `typography.heading` sets the Medium family but also declares `fontWeight: 600`.
- Some auth/debug surfaces use `#A9151A` instead of the canonical Figma primary/header pair.
- Several older screens use direct Lucide and raw `Text`.

When touching one of these areas, do not treat the drift as a new rule. Reconcile against Figma and update the shared token/component when safe.

## 22. Definition of done for a UI task

A UI task is not done until:

- behavior still works
- permission/navigation behavior is unchanged unless requested
- exact target Figma state has been consulted
- existing primitives have been reused
- no avoidable raw color/font/radius duplication was introduced
- loading/empty/error/disabled states are considered when relevant
- accessibility labels/state exist for custom controls
- layout works outside the exact 393px reference width
- typecheck passes
- relevant tests pass
- final render has been compared with Figma or the nearest canonical screen
