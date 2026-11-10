# TKD Mobile Screen Patterns

## Purpose

Choose a screen family before composing UI. Most inconsistency in mobile apps comes from rebuilding page chrome, spacing and state handling differently on each feature.

The patterns below are grounded in the current project and the Figma `App-phu-huynh` file.

---

## Pattern A — Bottom-tab root screen

Use when the screen is a first-class tab destination such as:

- Tính năng
- Lịch học
- Tài khoản
- future root tab pages that intentionally share the branded shell

Implementation shell:

`BottomTabScreenLayout`

### Structure

1. Safe-area-aware branded header
2. Left brand logo
3. Centered page title
4. Right header actions
5. Scrollable/light app canvas
6. Page-specific content
7. Floating bottom tab bar supplied by tab layout

### Visual behavior

- header background: `Colors.light.header`
- page background: `Colors.light.background`
- title: white Heading
- header icons: white
- default horizontal content inset: 20px
- bottom content must clear the floating tab bar

### Figma interpretation

Figma shows a top block around 110px. That includes the status-bar region. Runtime code should not use 110px for the app toolbar itself.

### Do not

- recreate the red header inside each screen
- make the title left aligned unless the new design explicitly changes the family
- hard-code screen width
- place content under the bottom bar without clearance

---

## Pattern B — Stack/detail screen

Use for:

- General Info
- Attendance/Timesheet history
- Notifications
- Notification detail
- pushed detail/editor screens

Implementation shell:

`StackScreenLayout`

### Structure

1. Safe-area-aware white/elevated header
2. Back action left
3. Centered title
4. Right actions
5. Main content
6. Optional floating feature-specific control

### Visual behavior

- white surface header
- soft shadow
- black title
- black header actions
- content horizontal inset typically 20px
- back touch target at least around 44px
- content can be scroll or non-scroll based on child structure

### Do not

- use a different header height just because the target Figma frame has a different total top block
- add another inline “back” row below the shared header
- use bottom tab chrome inside a stack detail screen

For searchable or paginated stack lists, follow
[`STACK_VIRTUALIZED_LIST_RULES.md`](./STACK_VIRTUALIZED_LIST_RULES.md) so the
virtualized list remains the only scroll owner.

For searchable or paginated stack lists, follow
[`STACK_VIRTUALIZED_LIST_RULES.md`](./STACK_VIRTUALIZED_LIST_RULES.md) so the
virtualized list remains the only scroll owner.

---

## Pattern C — Feature catalog

Reference:

- Figma `434:594 / TINH NANG`
- `ActivitiesScreen`
- `ActivitiesGridSection`
- `ActivitiesActionButton`

### Structure

1. Bottom-tab branded header
2. Quick-feature panel
3. Major feature section
4. Optional common utilities section
5. 4-column action layout

### Quick panel

The quick panel is a dark brand red surface with decorative Figma masks.

The quick feature buttons are visually stronger:

- white tile
- icon centered
- white text label outside/below tile on dark panel
- edit add/remove badge when quick-list editing is active

### Default feature tiles

- primary red soft tint
- app/Figma icon
- black label
- 4 columns
- labels may wrap to two lines

### Interaction

When edit mode is active:

- tapping quick item removes it
- tapping normal item adds it
- edit badge communicates add/remove
- maximum quick count remains business state, not a visual constant hidden in the tile

### Current parity note

Figma final feature tile is approximately 60x60; current implementation uses 70x70. Do not create more 70x70 duplicates if parity work is underway—fix the shared component.

---

## Pattern D — Schedule/list screen

Reference:

- Figma `288:1068 / LỊCH HOC`
- `ScheduleScreen`
- `ScheduleWeekTabBar`
- `ScheduleCard`
- `ScheduleFilterContent`

### Structure

1. Bottom-tab branded header
2. Weekday selector immediately below header
3. Schedule card list
4. Header filter action
5. Filter bottom sheet

### Weekday selector

Use a flat horizontal tab row, not floating chips.

State:

- active day
- item count where applicable
- active underline indicator
- hairline bottom divider

### Schedule card

Typical composition:

- left class image
- right textual information
- branch name
- class level
- coach
- time pill

The card is one contained schedule object, so a white elevated card is appropriate.

### Empty schedule state

If no schedule exists for a selected day/filter, use a clear empty state in the content area. Do not leave a blank page.

### Filter

Use the shared bottom sheet.

Use grouped checkbox rows:

- group title
- “Tất cả”
- “Huỷ”
- option rows
- footer with reset/apply

Do not make each option a card.

---

## Pattern E — Attendance/history search screen

Reference:

- Figma attendance section `288:659`
- `AttendanceHistoryScreen`
- `HistorySelectSheet`
- `HistoryRecordCard`

### Structure

1. Stack header
2. Primary period selectors
3. Search action
4. Optional result date range
5. Result records
6. Filter header action only when results exist
7. Optional training score floating entry for student mode

### Period selectors

The primary year/quarter selection remains visible after search. Search results appear below it.

Do not hide the year/quarter controls after the user searches.

### Primary selection flow

Recommended flow already implemented:

- tap Year → select from `HistorySelectSheet`
- tap Quarter without Year → show validation
- tap Quarter after Year → select quarter
- tap Tra cứu
- retain selected Year/Quarter on screen
- render results below
- reveal additional filter action for result refinement

This creates two distinct filter layers:

1. primary period selector on the screen
2. secondary result filter in the bottom sheet

Do not merge both into one hidden filter sheet unless product requirements change.

### Search action

Disabled until required period values exist.

Use a strong primary action when enabled and visually disabled state when not.

### Result records

Use `HistoryRecordCard`.

One card should communicate:

- date
- attendance/timesheet outcome
- branch
- shift
- status
- note/reason

### No results

Render a deliberate empty state with guidance to change filters.

---

## Pattern F — History mode chooser

Reference:

`HistoryModePickerSheet`

Use when one feature entry can legally route to more than one business mode based on the active person's permissions/context.

Example:

- Học viên → điểm danh history
- HLV → chấm công history

### Rule

Authorization logic decides whether the chooser is needed. The chooser itself does not calculate permissions.

Possible outcomes from domain logic:

- direct route to student mode
- direct route to coach mode
- picker because both are available
- deny/hidden if neither is available

Do not encode role-name strings directly inside the visual sheet.

---

## Pattern G — Bottom-sheet filter/picker

Reference:

- `BottomSheetWindow`
- `HistorySelectSheet`
- `HistoryModePickerSheet`
- Schedule filter
- History secondary filter
- Training score sheet

### Structure

Shared shell:

1. backdrop
2. draggable surface
3. top handle
4. centered title
5. close affordance
6. body
7. optional sticky/floating footer

### Use for

- option selection
- filters
- secondary detail panels
- compact mode chooser
- training score panel

### Height

Use a meaningful `heightRatio` only when the content is predictably bounded.

Examples already used:

- about 1/3 for two-mode chooser
- about 0.4 for a short select list
- about 0.88 for training score

Avoid setting arbitrary absolute heights copied from one device.

### Footer actions

Common filter footer:

- reset/cancel secondary action
- apply primary action

The footer should not scroll away when the user needs it to commit the selection.

---

## Pattern H — Account/profile root

Reference:

- Figma `288:1283 / TAI KHOAN`
- `AccountScreen`

### Structure

1. Bottom-tab branded header
2. profile summary card
3. grouped personal-profile menu
4. grouped settings menu
5. evaluation/rating panel
6. logout action

### Profile card

Use:

- brand/profile background image where specified
- avatar
- name
- role/context label
- “Chuyển tài khoản” when multiple contexts exist

Do not expose multiple-account/context switching elsewhere in the page without need.

### Menu sections

A section is a single container with rows and dividers.

Good:

`Hồ sơ cá nhân`
- Thông tin chung
- Ví điện tử
- Thành tích

Bad:
three independent elevated cards for the three rows.

### Logout

Strong red action is appropriate because it is a distinct account action.

Actual logout still uses a confirmation modal.

---

## Pattern I — General information/profile detail

Reference:

- Figma `288:1361 / THONG TIN CHUNG`
- `GeneralInfoScreen`

### Structure

1. Stack header
2. white bordered/elevated card
3. avatar overlapping card top edge
4. centered name
5. vertical profile information rows
6. row dividers
7. optional support actions floating at lower-right

### Information row

Each row:

- semantic profile icon
- label
- value
- divider except last row

Keep label visually quieter than value.

Do not add a separate card around each field.

### Avatar

The overlapping avatar is a deliberate profile pattern. Do not copy it into unrelated detail screens.

---

## Pattern J — Training score detail sheet

Reference:

- Figma `423:22089 / DIEM REN LUYEN`
- `TrainingScoreSheet`

### Structure

1. sheet header
2. summary status
3. quarter label/info
4. repeated score sections
5. final total

### Score section

- tinted header band
- icon
- section title
- optional section total
- white row body
- hairline row separators

This is a structured report pattern. Keep numerical values right-aligned when practical.

### Status

Use text plus color. Do not represent pass/warning/error only with color.

---

## Pattern K — Notification center

Reference:

- `NotificationScreen`
- `NotificationSummaryCard`
- `NotificationFilterBar`
- `NotificationCard`
- `NotificationStateView`

This feature is not the original Figma screen family but is a good example of using the shared design language for a newer domain.

### Structure

1. Stack header
2. summary card
3. read/unread tabs
4. search input
5. type chips
6. notification list
7. pagination/load more

### Read state

Unread should be communicated with more than one cue where possible:

- unread dot
- subtle tinted card
- “Chưa đọc” pill

### Loading/empty/error

Always distinguish:

- initial loading
- empty data
- empty due to filter
- request error
- loading next page
- pull-to-refresh state

Do not flash “Chưa có thông báo” before the first request resolves.

---

## Pattern L — Notification detail

Reference:

- `NotificationDetailScreen`
- `NotificationDetailInfoPanel`

### Structure

1. stack header
2. title/icon/meta panel
3. notification body card
4. reference information panel
5. action back to list if useful

Mark-read behavior belongs in the screen/query layer, not inside the visual information panel.

---

## Pattern M — Confirmation dialog

Reference:

- account logout confirmation
- authentication logout confirmation

### Use only for consequential decisions

Examples:

- logout
- destructive deletion
- irreversible action
- financial confirmation where product requirements require explicit confirmation

### Structure

- centered card
- dim backdrop
- title/question
- short consequence text
- two actions
- safe cancel
- explicit confirm
- busy state during mutation

Do not use a confirmation dialog merely to say “feature is under development”.

For a non-blocking “feature is being developed” message from a tapped button, use the app's transient feedback/toast pattern when available; do not navigate to a dead-end screen only to display that message.

---

## Pattern N — Under-development action

When a visible button is intentionally present but the feature is not ready:

Preferred behavior:

- keep the user on the current screen
- show a concise non-blocking transient message
- do not create a fake destination screen
- do not show a modal requiring “OK” unless the information is genuinely blocking

Example message:

`Tính năng đang được phát triển.`

If the action is disabled rather than tappable, it should look disabled and have an accessibility state. Do not make a disabled-looking control secretly tappable.

---

## Pattern O — Context selection

Current implementation:

`ContextSelectionScreen`

Use its **behavioral model**:

- list all accessible contexts
- show current context when switching
- block duplicate active selection
- persist/switch through the authentication domain
- show request error
- permit back only in switch mode

Do not treat its current hard-coded visual styling as the design reference for new Figma work. When redesigned, migrate it onto the theme/shared primitives.

---

## Responsive layout rules shared by all patterns

### Horizontal spacing

On phone layouts, begin from the Figma rhythm of about 20px screen inset.

Do not automatically scale the inset on a 393px ratio.

For large width:

- keep mobile content readable
- introduce a max content width
- center content where appropriate
- do not stretch cards to absurd widths

### Vertical sizing

Prefer:

- `minHeight`
- content-driven growth
- safe-area insets
- list/container padding

Avoid fixed overall page heights.

### Text wrapping

Allow:

- two-line feature labels
- multi-line descriptions
- card height growth

Use `numberOfLines` only when truncation is part of the design and lost content is acceptable.

### Keyboard

For forms:

- use `KeyboardAvoidingView`/appropriate keyboard behavior
- ensure submit actions stay reachable
- scroll when necessary
- do not use absolute positioning that keyboard can cover

---

## State checklist per screen

Before calling a screen complete, ask whether it needs:

- loading
- initial error
- retry
- empty
- empty after filter
- permission denied
- offline/recoverable state
- disabled action
- mutation pending
- success feedback
- partial data
- pagination
- refresh
- stale data indicator

Only implement states relevant to the feature, but do not design only the “happy screenshot”.

---

## Navigation checklist

Before adding a route:

- Is it a root tab or a stack detail?
- Does the parent already have a layout shell?
- Should Back dismiss, pop, or return to a fixed route?
- Does the active person/context affect visibility?
- Does permission affect visibility or only action availability?
- Should the target keep bottom tabs visible?
- Can deep linking reach it safely?

Use typed Expo Router routes where possible.

---

## Choosing between a sheet, modal, route and toast

### Use a route when

- content is a real destination
- user may spend time there
- back navigation makes sense
- URL/deep-link identity is useful

### Use a bottom sheet when

- selection/filtering is secondary to the current screen
- content is temporary/contextual
- user should return to the underlying task after choosing

Compose sheet content according to [Bottom-sheet content rules](./BOTTOM_SHEET_CONTENT_RULES.md).

### Use a centered confirmation modal when

- the decision is consequential
- explicit confirmation is required

### Use transient feedback/toast when

- the message is short
- no decision is required
- current task should not be interrupted
- example: action succeeded, feature unavailable, temporary info

Do not use one pattern for all four cases.

---

## Final composition test

A new screen should look as though it came from the same app even if the screenshot reference is removed.

Check:

- same red hierarchy
- same text ramp
- same page insets
- same header family
- same icon system
- same radii
- same shadow restraint
- same button language
- same bottom-sheet language
- same list/card logic
- same state feedback
- same accessibility quality

If several local overrides are needed to force a component to match, stop and inspect whether the shared component/token is the true source of the mismatch.
