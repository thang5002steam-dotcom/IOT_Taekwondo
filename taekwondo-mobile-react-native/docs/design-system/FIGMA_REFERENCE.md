# Figma Reference Map — App phụ huynh

## File

Name:
`App-phu-huynh`

File key:
`yIRtDotMj9UQNlwgBzbr47`

Design URL:
`https://www.figma.com/design/yIRtDotMj9UQNlwgBzbr47/App-phu-huynh?node-id=288-658`

Primary design page:
`288:658 / Design`

Icon page:
`346:1810 / Icon`

This map exists so implementation agents do not guess node IDs or use only a page-level screenshot when a specific screen/state is available.

---

## Main sections

### 1. Activities / attendance / training-score section

Section:
`288:659 / HOAT DONG 800+0+500+0+800+800=2900`

Known screen frames:

| Node | Figma name | Size | Meaning/reference |
|---|---|---:|---|
| `434:594` | TINH NANG | 393x922 | Feature catalog / quick actions |
| `288:758` | DIEM DANH 1 | 393x852 | Attendance flow/state |
| `420:21779` | DIEM DANH 7 | 393x852 | Attendance flow/state |
| `484:3954` | DIEM DANH 11 | 393x852 | Attendance flow/state |
| `420:21859` | DIEM DANH 8 | 393x852 | Attendance flow/state |
| `420:21916` | DIEM DANH 9 | 393x852 | Attendance flow/state |
| `484:4037` | DIEM DANH 12 | 393x852 | Attendance flow/state |
| `420:22000` | DIEM DANH 10 | 393x852 | Attendance flow/state |
| `288:987` | DIEM DANH 2 | 393x1393 | Long attendance/history state |
| `423:22089` | DIEM REN LUYEN | 393x1145 | Training-score report |

Implementation references:

- `src/routes/activities/ActivitiesScreen.tsx`
- `src/features/activities/components/*`
- `src/features/attendance-history/*`

### 2. Class schedule section

Section:
`288:1067 / LICH HOC 800+500=1300`

Known frames:

| Node | Figma name | Size |
|---|---|---:|
| `288:1068` | LỊCH HOC | 393x1042 |
| `462:2747` | LỊCH HOC | 393x852 |
| `529:4792` | LỊCH HOC | 393x1177 |
| `462:3238` | LỊCH HOC | 393x1177 |
| `476:3433` | LỊCH HOC | 393x852 |
| `525:4455` | DIEM DANH 13 | 393x1593 |

Implementation references:

- `src/features/class-schedule/screens/ScheduleScreen/ScheduleScreen.tsx`
- `ScheduleCard.tsx`
- `ScheduleWeekTabBar.tsx`
- `ScheduleFilterContent.tsx`

The differently sized frames represent screen states/scroll content. Do not interpret their height as a fixed device height.

### 3. Account section

Section:
`288:1282 / TAI KHOAN 800+500=1300`

Known frames:

| Node | Figma name | Size | Implementation |
|---|---|---:|---|
| `288:1283` | TAI KHOAN | 393x1154 | `AccountScreen.tsx` |
| `288:1361` | THONG TIN CHUNG | 393x852 | `GeneralInfoScreen.tsx` |

### 4. Logo

Section:
`293:1599 / Logo`

Main logo artwork:
`293:1597 / Copy of LOGO 1`

Project asset currently used by navigation/header:
`assets/taekwondo-removebg-preview.png`

### 5. Final color/style board

Section:
`311:1633 / MAU CHU DAO`

This board plus local paint styles is the reference for the red/black/gray/background language.

Important final paint styles retrieved from Figma:

| Style | Value |
|---|---|
| Màu chủ đạo 1 | `#D71113` |
| Màu chủ đạo 2 | `#000000` |
| Màu chủ đạo 3 | approximately `#6F6F6F` |
| Màu chủ đạo 4 | approximately `#CACCCD` |
| Màu nền 1 | `#FAFAFC` |
| Màu nền 2 | `#FFFFFF` |
| Màu chủ đạo gradient | `#FD9956 → #C2A5FD`, opacity 0.5 |

These match `src/theme/colors.ts` closely.

### 6. Icon reference board

Section:
`311:1650 / ICON`

Representative nodes include:

- Home
- Calendar
- QR code
- Person
- Logout
- Bell
- Wallet
- Verified
- Cup
- Activity
- Clock
- Headphones
- Location
- Filter
- Pin
- Bar chart
- Sliders
- Note
- Star
- Dashboard
- Plus/Minus
- Database
- Info

The app now renders product icons with `reicon-react-native` through `AppIcon`.

Before adding an icon, inspect both the Figma board and the available Reicon glyph names.

### 7. Components

Section:
`478:3540 / Component`

Known component set:

`484:3832 / Danh gia`

Instance:
`527:4680 / Danh gia`

This corresponds to the evaluation/rating panel family seen in Account.

---

## Figma local styles

### Text styles

Retrieved local text styles:

| Figma style | Font | Size/line |
|---|---|---|
| `WF/Title` | Roboto SemiBold 600 | 17 / 26 |
| `WF/Subtitle` | Roboto ExtraBold 800 | 18 / 26 |
| `WF/Heading` | Roboto Medium 500 | 20 / 28 |
| `WF/Body` | Roboto Regular 400 | 18 / 24 |
| `WF/Body 1` | Roboto Regular 400 | 15 / 20 |
| `WF/Caption` | Roboto ExtraBold 800 | 10 / 16 |

These are strongly aligned with `src/theme/typography.ts`.

Important:
actual final nodes also contain local/special text values, e.g. 13/20 SemiBold feature labels and schedule-specific 13/22, 15/25 values. Do not turn every special value into a global token unless it repeats with a semantic role.

### Effect styles

Retrieved Figma effect styles:

#### Effect 1

Drop shadow:

- x: 0
- y: 5
- blur: 5
- black alpha: 0.05

Project match:
`effects.soft`

#### Effect 2

Drop shadow:

- x: 0
- y: 0
- blur: 4
- black alpha: 0.20

Project match:
`effects.card`

#### Effect 3

Glass effect plus:

- drop shadow x: 0
- y: 0
- blur: 4
- black alpha: 0.25

Project visual mapping:
`effects.glass`

#### Effect 4

A stronger glass/multi-shadow style exists in Figma but is not a general app default. Use only where the target node actually requires it.

---

## Figma variable collections: caution

The file contains local variable collections named:

- `WF Primitives`
- `WF Color`
- `WF Spacing`

Examples include generic gray/accent colors and radii 8/12/16/999.

These are **not automatically the final product source of truth**.

Why:

- actual final frame nodes use `#D71113`, `#A21D22`, 10px radii, 15px radii, etc.
- final paint/text/effect styles line up with the current project theme
- “WF” naming indicates wireframe-oriented/generic variables

Rule:

When the WF variable value conflicts with the measured final node or named final paint/effect style, use the final node/style for implementation.

---

## Measured final-screen observations

A programmatic scan of representative final nodes found the following.

### TINH NANG — `434:594`

Size:
393x922

Frequent fills include:

- white
- primary red `#D71113`
- black
- success/error colors
- secondary gray
- dark header red `#A21D22`
- app background `#FAFAFC`

Frequent radii include:

- 16 on feature tiles
- 10 on key containers
- 15 on bottom navigation
- 30 on header treatment
- 100 on circular/pill shapes

Feature labels:
Roboto SemiBold about 13/20.

### DIEM DANH 1 — `288:758`

Size:
393x852

Dominant visual system:

- black text
- white surfaces
- primary red
- app background
- divider gray
- 10px and pill-like radii

This frame reinforces the stack/detail and picker/filter language rather than introducing a second palette.

### LỊCH HỌC — `288:1068`

Size:
393x1042

Frequent values:

- primary red
- white cards
- black text
- secondary gray
- app background
- dark header red
- 10px card radius
- 5px smaller pills/details
- 15px bottom-nav radius

Common text styles include:

- 15/20 Regular
- 18/26 ExtraBold
- 13/22 Regular
- 15/25 Medium
- 10/16 ExtraBold

This supports keeping schedule-specific typography local unless repeated elsewhere.

### TÀI KHOẢN — `288:1283`

Size:
393x1154

Common values:

- primary red
- black
- white
- secondary gray
- divider gray
- yellow rating stars
- 10px content surfaces
- 20px larger action radius
- 15px bottom navigation radius

### THÔNG TIN CHUNG — `288:1361`

Size:
393x852

Common values:

- black text
- primary red icons
- divider gray
- white surface
- app background
- mostly row/divider composition
- 10px primary card radius

This confirms that General Info should remain one grouped information card, not a collection of independent cards.

### DIEM REN LUYEN — `423:22089`

Size:
393x1145

Common values:

- black text
- primary red
- white rows
- warning `#D97706`
- success `#16A34A`
- divider gray
- app background
- many 10px section radii
- 30px status/action pills

Most score values use Body 18/24.

---

## Design-context workflow

When implementing a specific screen:

1. Use the node ID above or locate a more specific child/state.
2. Fetch design context for that exact node.
3. Inspect generated reference code only for measured properties/assets.
4. Map those properties to React Native and this project.
5. Reuse existing components.
6. Render and compare.
7. If the current implementation and Figma differ, determine whether:
   - Figma changed
   - current code drifted
   - the state differs
   - a shared token is wrong
8. Fix at the correct ownership level.

Do not implement from the table in this document alone when a more specific Figma node exists.

---

## Asset policy

Figma-generated temporary asset URLs are short-lived and are not a durable application asset strategy.

For committed code:

- use existing local asset if exact
- otherwise export/download the exact Figma asset into the project
- register icons through the existing icon pipeline
- keep content images in the feature/assets location or data/CDN source appropriate to the feature

Do not commit a placeholder icon while claiming Figma parity.

---

## Naming mismatch warning

Some Figma frames retain legacy names such as `DIEM DANH 13` even when the visual state may belong to another sub-flow/filter context.

Use:

- node ID
- visual content
- design context
- surrounding section

as the reliable identity, not the frame name alone.

---

## Figma review checklist

For every UI implementation, compare:

- overall screen family
- header type/color
- status-bar safe-area separation
- horizontal edges
- major vertical gaps
- title hierarchy
- icon glyph and size
- card radius
- shadow/elevation
- background tint
- row height
- dividers
- button height/radius
- active/selected state
- disabled state
- sheet height/content
- bottom bar width/margin
- scrolling behavior
- long text behavior

The goal is not “same screenshot at one size”; it is “same design intent implemented responsively and consistently.”
