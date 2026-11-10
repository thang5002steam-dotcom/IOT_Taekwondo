# TKD Mobile Component Rules

## Goal

This file tells an implementation agent **which existing component to use**, when to extract a new one, and which behaviors must remain consistent across the app.

## 1. Shared primitives first

Search before building.

### Text

Use:
`src/shared/ui/ThemedText.tsx`

Why:

- central typography mapping
- theme-aware text color
- shared semantic variants
- avoids local font-size drift

Use raw `Text` only inside the implementation of a shared primitive or in legacy code being migrated. New Figma-backed screen code should default to `ThemedText`.

### Icons

Use:
`src/shared/ui/AppIcon.tsx`

Source registry:
`src/theme/icons.ts`

Icon source:
`reicon-react-native`

Usage sites import the Reicon component they need and pass JSX through `AppIcon`, for example `icon={<Bell />}`.

### Themed surfaces

Use:
`src/shared/ui/ThemedView.tsx`

when a simple semantic themed background is enough.

Do not wrap every `View` in `ThemedView`; use it where a semantic background role matters.

### Bottom sheets

Use:
`src/shared/ui/BottomSheetWindow.tsx`

Current responsibilities include:

- modal shell
- backdrop
- drag-to-dismiss gesture
- rubber-band overscroll behavior
- projected dismiss threshold
- spring animation
- reduced-motion handling
- accessibility modal behavior
- title/handle/close affordance
- optional footer
- bounded height

A new picker/filter should compose inside this shell rather than recreating those behaviors.

For feature content inset, scrolling and footer composition, follow [Bottom-sheet content rules](./BOTTOM_SHEET_CONTENT_RULES.md).

## 2. Screen chrome

### Root bottom-tab screen

Use:
`src/routes/navigation/layouts/BottomTabScreenLayout.tsx`

Current consumers include Activities and Schedule.

Responsibilities:

- app canvas
- branded red header
- safe-area handling
- logo
- centered title
- right-side actions
- scroll container
- bottom-tab clearance

Do not rebuild a red header locally inside a tab screen.

### Stack/detail screen

Use:
`src/routes/navigation/layouts/StackScreenLayout.tsx`

Responsibilities:

- white/elevated stack header
- safe-area handling
- back button
- centered title
- right actions
- scroll/non-scroll content mode
- optional floating content

Current consumers include General Info, Attendance History and Notifications.

Do not use Expo Router's default visual header on one screen and the custom TKD stack header on another unless the design explicitly requires that split.

## 3. Header actions

Use:

- `HeaderActionButton`
- `DefaultHeaderActions`
- `NotificationHeaderButton`
- `HomeHeaderButton`

### HeaderActionButton contract

Use it for icon-only top-right actions.

It already provides:

- accessible button role
- label
- 44-ish minimum target
- optional dot/count badge
- tab/stack badge theme
- pressed feedback
- app icon rendering

Do not hand-code another notification badge in a screen header.

### Default header actions

`DefaultHeaderActions` means:

- notification
- home

Use it when that is the expected shared chrome.

If the screen needs an extra action, compose that extra `HeaderActionButton` beside `DefaultHeaderActions`.

## 4. Bottom tab bar

Implementation:
`src/routes/navigation/AppTabsLayout.tsx`

Configuration:
`src/routes/navigation/appTabs.config.tsx`

Rules:

- add/remove tabs in the config, not by duplicating tab JSX
- preserve permission filtering
- use `AppIcon`
- preserve center QR action semantics
- preserve accessible tab role and selected state
- preserve 20px outer horizontal inset relationship
- preserve minimum touch height
- use active/inactive semantic theme colors

Do not embed business permission checks directly in visual tab button code if they belong in the config/authorization layer.

## 5. Feature catalog components

Implementation:

- `src/features/activities/components/ActivitiesGridSection.tsx`
- `src/features/activities/components/ActivitiesActionButton.tsx`
- `src/features/activities/components/activities.constants.tsx`

Use these for the “Tính năng” family.

### ActivitiesGridSection

Owns:

- section title
- quick-feature panel
- quick decorative masks
- 4-column grid
- quick/default variants

### ActivitiesActionButton

Owns:

- feature tile
- icon
- edit badge
- label
- quick/default visual variant
- pressed feedback

Do not create a second 4-column action grid on another feature screen without first evaluating whether this component should be generalized.

Known mismatch:
Figma's final visible tile is around 60x60 while the current component uses 70x70. If this component is modified for parity, change it centrally and revalidate both quick and default states.

## 6. Schedule family

Implementation:

- `ScheduleScreen.tsx`
- `ScheduleCard.tsx`
- `ScheduleWeekTabBar.tsx`
- `ScheduleFilterContent.tsx`

### ScheduleWeekTabBar

Owns the day-of-week horizontal selector.

Keep:

- selected tab semantics
- underline indicator
- count display
- full-width placement below the branded header
- hairline divider

Do not wrap each weekday in a floating chip unless Figma changes.

### ScheduleCard

Use the established two-column image + content pattern for class schedule cards.

Keep:

- white elevated surface
- 10-ish radius
- explicit image crop
- branch title
- level/coach metadata
- tinted time pill

If schedule data changes, adapt the data model before adding layout-specific conditional hacks.

### Schedule filters

Use `BottomSheetWindow`.

Keep filter groups as grouped rows with checkboxes, not one card per option.

## 7. Attendance history family

Implementation:

- `AttendanceHistoryScreen.tsx`
- `HistoryRecordCard.tsx`
- `HistorySelectSheet.tsx`
- `HistoryModePickerSheet.tsx`
- `TrainingScoreFloatingButton.tsx`
- `TrainingScoreSheet.tsx`

### HistoryRecordCard

Owns one result record:

- date
- status badge
- branch
- shift
- attendance status
- note panel

Do not place business filtering logic inside the card.

Status tone belongs to view-model/semantic mapping. If tone colors become app-wide, move them into theme semantics.

### HistorySelectSheet

Use it for simple single-choice year/quarter selection.

It already provides:

- haptic selection
- preview selection state
- delayed commit
- selected check icon
- standard sheet shell

Do not replace it with a generic centered modal.

### HistoryModePickerSheet

Use when permissions imply multiple history modes, such as student attendance vs coach timesheet.

Keep authorization decision outside the sheet; the sheet only presents available mode choices.

### TrainingScoreFloatingButton

This is a feature-specific floating action, not a generic FAB primitive.

Do not generalize it solely because it floats.

### TrainingScoreSheet

Use its section-header + grouped-row pattern for the training score domain.

Do not reuse it for unrelated data tables unless the visual structure and semantics genuinely match.

## 8. Account/profile family

Implementation:

- `src/routes/account/AccountScreen.tsx`
- `src/routes/account/GeneralInfoScreen.tsx`

### AccountScreen

Canonical patterns:

- profile summary card
- grouped menu sections
- rating card
- strong red logout action
- destructive confirmation modal

The menu section uses grouped rows inside a single surface. Do not convert each menu item into a separate card.

### GeneralInfoScreen

Canonical patterns:

- stack header
- centered overlapping avatar
- one contained white profile card
- vertical information rows with dividers
- feature-specific floating support actions

Use this as the reference for “detail profile information”, not the older auth/context cards.

## 9. Notification family

Implementation:

- `NotificationScreen.tsx`
- `NotificationDetailScreen.tsx`
- `NotificationCard.tsx`
- `NotificationFilterBar.tsx`
- `NotificationPill.tsx`
- `NotificationStateView.tsx`
- `NotificationSummaryCard.tsx`
- `NotificationDetailInfoPanel.tsx`

This feature is newer than the original Figma screens but already follows the shared theme and navigation shell well.

Use it as a reference for:

- list loading/empty/error states
- semantic unread state
- summary card
- pills
- searchable/filterable list
- detail information panels

Do not use its red summary card as a generic hero on every screen.

## 10. Buttons

There is not yet one universal `Button` primitive covering every app use case.

Therefore:

- do not create a giant universal button API prematurely
- reuse an existing feature/shared button when semantics match
- otherwise keep a local button until a second real use case appears
- when extraction is justified, define variant/size/state contracts clearly

Every custom button should account for:

- accessibility role
- label
- pressed state
- disabled state if relevant
- loading/busy state if relevant
- minimum practical touch target

For a strong primary full-width action, prefer:

- primary red background
- white text
- about 50–60px control height depending on target Figma
- token radius matching target design
- no arbitrary gradient unless Figma has one

## 11. Inputs

Current auth inputs are partly legacy-styled.

For new product screens:

- use semantic theme values
- preserve native `TextInput` behavior
- pair label, input and error text clearly
- use minimum height around 48–54px
- use theme divider for default border
- use semantic error color for invalid state
- do not shrink text to make a crowded layout fit

If a new input pattern is repeated in multiple Figma-backed features, extract a shared field component then.

## 12. Badges, pills and chips

Use pills for compact metadata/state, not for arbitrary navigation.

Existing examples:

- history status badges
- schedule time pill
- notification pills
- filter chips

Rules:

- keep text short
- use semantic background/text contrast
- use pill radius
- do not use a chip where a standard row/button is clearer
- expose selected state for interactive chips

## 13. Lists versus cards

Use a grouped list when:

- items share the same parent section
- each row is lightweight
- separators communicate grouping
- Figma presents a single container

Use cards when:

- each item is an independently contained object
- elevation or background differentiates items
- content is multi-line/complex
- the Figma design gives each item a distinct surface

Do not apply `effects.card` to every row.

## 14. Confirmation dialogs

A centered modal is acceptable for consequential confirmation, e.g. logout.

Requirements:

- dimmed backdrop
- clear question/title
- short consequence text
- cancel and confirm actions
- destructive action visually clear
- accessibility modal semantics
- loading state on confirm if async

Do not use centered dialogs for ordinary filtering or option selection; use a sheet.

## 15. Animation and haptics

Use motion to explain state.

Good existing examples:

- bottom-sheet spring and drag
- subtle press scale 0.98
- haptic selection in HistorySelectSheet

Rules:

- respect reduced motion
- avoid decorative bounce on every card
- avoid long animation before a navigation action
- use haptics sparingly for meaningful selection/confirmation
- keep transition ownership inside shared components where the behavior is shared

## 16. Component extraction rule

Extract to shared UI only when:

1. there are at least two genuine consumers or a clearly imminent second consumer
2. the component has a nameable UI role
3. its public API is smaller/simpler than its internal implementation
4. extracting it will reduce visual drift rather than merely move code

Promotion path:

screen JSX
→ feature-local component
→ shared component

Do not jump directly to a global component for a single Figma fragment.

## 17. Style overrides

Shared visual components may accept a `style` prop for layout integration.

A caller may adjust:

- margin
- flex
- placement
- width constraints

A caller should not routinely override:

- identity color
- typography identity
- radius identity
- shadow identity
- selected/disabled visuals

If callers repeatedly override identity, the shared component API/token is missing a real variant.

## 18. Data and presentation boundary

Screen/container owns:

- queries
- mutations
- authorization decisions
- routing
- persistence
- filter state
- error handling strategy

Presentational component owns:

- semantic display of provided state
- interaction callbacks
- accessibility for its own controls
- layout/visual states

Do not fetch data from a low-level visual primitive.

## 19. Test expectations

For shared or behavior-heavy components, tests should cover applicable states such as:

- visible/hidden
- selected/unselected
- enabled/disabled
- loading
- permission-driven rendering
- navigation callback
- mark-read behavior
- sheet close/apply/reset flow

Pixel parity is validated by rendered comparison, not by unit tests alone.

## 20. Before adding a new component

Ask:

- Does a shared component already solve this?
- Does a feature-local component already solve this?
- Is the difference only content?
- Is the difference only margin?
- Is the target Figma actually a different component/state?
- Will this create a second visual system?
- Can the existing component be extended with one semantic variant instead?

If the answer points to reuse, reuse it.
