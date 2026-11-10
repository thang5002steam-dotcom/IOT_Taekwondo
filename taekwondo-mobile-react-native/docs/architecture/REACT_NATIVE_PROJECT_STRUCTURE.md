# React Native + TypeScript Project Structure & File Placement Rulebook

> Historical reference (v1). The current project standard is
> [REACT_NATIVE_PROJECT_STRUCTURE_V2.md](./REACT_NATIVE_PROJECT_STRUCTURE_V2.md).

> **Status:** Architecture Source of Truth  
> **Target:** React Native + TypeScript, iOS + Android  
> **Compatible with:** Expo and React Native Bare/CLI  
> **Primary goals:** Correct placement, reusability, discoverability, maintainability, scalability, AI-readability  
> **Core principle:** **Reuse before recreate, but do not generalize before necessary.**

---

## Table of Contents

1. [Document Purpose and Scope](#1-document-purpose-and-scope)
2. [Technical Baseline](#2-technical-baseline)
3. [Expo vs React Native Bare](#3-expo-vs-react-native-bare)
4. [Architecture Principles](#4-architecture-principles)
5. [Recommended Project Tree](#5-recommended-project-tree)
6. [Folder Rules](#6-folder-rules)
7. [Feature Folder Standard](#7-feature-folder-standard)
8. [Local vs Shared Decision](#8-local-vs-shared-decision)
9. [When to Promote Local Code to Shared](#9-when-to-promote-local-code-to-shared)
10. [File Placement Decision Tree](#10-file-placement-decision-tree)
11. [AI File Placement Algorithm](#11-ai-file-placement-algorithm)
12. [Keyword → Folder Mapping](#12-keyword--folder-mapping)
13. [Naming Conventions](#13-naming-conventions)
14. [`.ts` vs `.tsx`](#14-ts-vs-tsx)
15. [When to Split a File](#15-when-to-split-a-file)
16. [Component Splitting Rules](#16-component-splitting-rules)
17. [Hook Rules](#17-hook-rules)
18. [API & Data Access Rules](#18-api--data-access-rules)
19. [Server State vs Client State](#19-server-state-vs-client-state)
20. [Types & DTO Rules](#20-types--dto-rules)
21. [Constants Rules](#21-constants-rules)
22. [Config vs Constants](#22-config-vs-constants)
23. [Utils vs Helpers vs Services](#23-utils-vs-helpers-vs-services)
24. [Native / Device Integration](#24-native--device-integration)
25. [Platform-Specific Code](#25-platform-specific-code)
26. [Android / iOS Native Folders](#26-android--ios-native-folders)
27. [Navigation](#27-navigation)
28. [Screens vs Components](#28-screens-vs-components)
29. [Styling / Theme](#29-styling--theme)
30. [Assets](#30-assets)
31. [Test Structure](#31-test-structure)
32. [Barrel Files / `index.ts`](#32-barrel-files--indexts)
33. [Import Rules](#33-import-rules)
34. [Path Aliases](#34-path-aliases)
35. [Circular Dependency Rules](#35-circular-dependency-rules)
36. [Error Handling](#36-error-handling)
37. [Environment Management](#37-environment-management)
38. [Example Feature — CRUD/API: `fitness-record`](#38-example-feature--crudapi-fitness-record)
39. [Example Feature — Device Heavy: `high-knee`](#39-example-feature--device-heavy-high-knee)
40. [Example File Placement Cases](#40-example-file-placement-cases)
41. [Common Architecture Mistakes](#41-common-architecture-mistakes)
42. [New File Checklist](#42-new-file-checklist)
43. [New Folder Checklist](#43-new-folder-checklist)
44. [Refactor / Move File Rules](#44-refactor--move-file-rules)
45. [Reuse Audit Before Creating New Code](#45-reuse-audit-before-creating-new-code)
46. [Instructions for AI Coding Agents](#46-instructions-for-ai-coding-agents)
47. [AI Placement Rules — Compact Reference](#47-ai-placement-rules--compact-reference)
48. [Placement Score](#48-placement-score)
49. [Architecture Decision Formula](#49-architecture-decision-formula)
50. [Recommended Final Project Tree](#50-recommended-final-project-tree)
51. [Quick Reference Table](#51-quick-reference-table)
52. [Quality Requirements](#52-quality-requirements)
53. [Core Architecture Principle](#53-core-architecture-principle)
54. [Final Self-Review](#54-final-self-review)

---

# 1. Document Purpose and Scope

This document is the **authoritative source-code architecture rulebook** for a production React Native + TypeScript application targeting iOS and Android.

It exists to answer architectural placement questions consistently:

- Where should a new file live?
- Which feature/domain owns it?
- Should it be reused, extended, composed, moved, split, or kept local?
- Is it UI, application logic, domain logic, data access, or infrastructure?
- Is it shared because it is truly reusable, or only because someone predicts future reuse?
- Does it belong in TypeScript, a platform-specific `.ios/.android` implementation, or native Kotlin/Swift?
- Which modules may import it?
- What is its public API?
- Which tests should accompany it?

The architecture is designed for both humans and AI coding agents. The most important objective is **deterministic reasoning**, not an aesthetically symmetrical folder tree.

## Architectural stance

```text
Feature-first
+ Colocation
+ Explicit ownership
+ Reuse before recreate
+ Minimal shared surface
+ Clear dependency direction
+ High cohesion
+ Low coupling
+ Platform isolation
+ No premature abstraction
```

A directory is not created because an architecture diagram says it *could exist*. A directory exists only when real code requires that responsibility.

---

# 2. Technical Baseline

This rulebook assumes:

```text
React Native
TypeScript
iOS
Android
```

It is intentionally library-neutral where possible. The architecture remains valid whether the project uses:

- Expo or Bare React Native;
- React Navigation or Expo Router;
- TanStack Query, RTK Query, Apollo, or another server-state library;
- Zustand, Redux Toolkit, Context, Jotai, or another client-state solution;
- Zod, Valibot, Yup, or another schema library;
- Axios, `fetch`, or another transport client.

Libraries affect implementation details. **Ownership and dependency rules must remain stable.**

## Production quality attributes

The structure optimizes for:

- maintainability;
- scalability;
- testability;
- refactorability;
- discoverability;
- predictable ownership;
- low coupling;
- high cohesion;
- platform isolation;
- reusability without premature generalization;
- AI-agent readability.

## Architecture that is explicitly rejected

Do **not** build the entire application around giant global type buckets:

```text
src/
├── components/
├── screens/
├── hooks/
├── services/
├── utils/
└── types/
```

This organization groups code by technical type but hides business ownership. It tends to create:

- giant folders;
- implicit cross-feature dependencies;
- duplicate domain rules;
- uncontrolled shared APIs;
- weak discoverability;
- refactors that require repository-wide search.

Technical-type folders are acceptable **inside an owning feature** or for truly global infrastructure.

---

# 3. Expo vs React Native Bare

The business/source architecture should be stable across both modes.

| Concern | Expo | React Native Bare / CLI | Rulebook stance |
|---|---|---|---|
| JS/TS feature architecture | Same | Same | **Both** |
| Native folders | Generated/managed depending on workflow | Directly maintained | Platform shell only |
| Native modules | Expo Module/config plugin or compatible library | Direct Kotlin/Swift bridge possible | Hide behind TS boundary |
| Build config | `app.json`, `app.config.ts`, EAS config | Gradle/Xcode/CI | App/platform config |
| Navigation | Expo Router or React Navigation | Usually React Navigation, but not required | Router must not own domain logic |
| OTA | Expo tooling may provide it | Separate setup | Operational concern |
| Config plugins | Expo capability | Not applicable in same form | Infrastructure |
| Kotlin/Swift custom bridge | Development build/prebuild/native module | Direct native project code | Adapter behind feature/shared native interface |

## Expo-only examples

```text
app.json
app.config.ts
eas.json
Expo config plugins
Expo Router filesystem routes
```

## Bare-only or Bare-direct examples

```text
android/
ios/
custom Gradle/Xcode setup
direct native build configuration
manual native SDK wiring
```

## Both

```text
src/features/
src/shared/
src/app/
src/navigation/     # if using React Navigation
src/native/         # TS-facing native abstractions
src/theme/
src/config/
assets/
```

## Router independence

The following must **not** depend on whether navigation uses Expo Router or React Navigation:

- domain calculations;
- API functions;
- DTO mapping;
- validation;
- storage abstractions;
- native capability adapters;
- business services;
- feature hooks that do not inherently navigate.

A route file may import a feature screen. A feature domain module must never import a route file.

---

# 4. Architecture Principles

## 4.1 Feature Ownership

Every non-trivial file must have an identifiable owner.

Default rule:

```text
If code directly serves one business capability
→ the feature owns it.
```

Examples:

```text
FitnessRecordForm
→ fitness-record

calculateFitnessLevel
→ fitness-record domain

useHighKneeSession
→ high-knee

MediaPipe high-knee native bridge
→ high-knee native
```

Global placement requires evidence that responsibility is global, cross-feature, or infrastructure-level.

## 4.2 Colocation

Keep code near its consumers.

```text
one screen only
→ colocate with screen

one feature only
→ keep inside feature

multiple features, identical responsibility and contract
→ evaluate promotion

global infrastructure
→ shared/infrastructure or dedicated global concern
```

The objective is to reduce **distance between ownership and implementation**.

## 4.3 Reusability First, but Scope-Aware

Before creating anything new:

1. Search for exact and similar names.
2. Search the same business noun.
3. Search the same endpoint.
4. Search the same UI behavior.
5. Search the same validation rule.
6. Search equivalent type shapes.
7. Search the same native/device capability.
8. Evaluate direct reuse.
9. Evaluate extension.
10. Evaluate composition.
11. Create feature-local code only if needed.
12. Promote to shared only when reuse is real.

Preferred sequence:

```text
Reuse existing implementation
        ↓
Extend existing abstraction
        ↓
Compose existing building blocks
        ↓
Create feature-local implementation
        ↓
Promote to shared only when reuse is proven
```

**Code duplication is not automatically business duplication.**

Two implementations may look alike but express different policies. If future changes can diverge because the business meanings differ, keep them separate.

## 4.4 Shared Is Earned, Not Assumed

`shared` is not a convenient place for uncertain ownership.

Promote code because:

- it has multiple real consumers;
- its responsibility is domain-agnostic; or
- it is global infrastructure by definition.

Do **not** promote code because:

- “it may be useful later”;
- the file is long;
- the name sounds generic;
- moving it makes the tree look cleaner.

## 4.5 Clear Dependency Direction

Preferred conceptual direction:

```text
app / router composition
        ↓
features
        ↓
shared domain contracts + shared UI + shared infrastructure abstractions
        ↓
platform/runtime libraries
```

More precisely:

- `app` may compose features and shared modules.
- a feature may import public shared modules;
- a feature should not import private internals of another feature;
- shared modules must not depend on feature implementations;
- domain logic should not depend on React UI;
- transport/native details should be hidden behind stable interfaces where useful.

## 4.6 Public API

A feature may expose a narrow public API when external consumers exist.

Example:

```text
features/authentication/index.ts
```

May export:

```ts
export { useAuthSession } from './hooks/useAuthSession'
export type { AuthUser } from './domain/auth.types'
```

It should not export every internal component/helper by default.

Internal files should import each other **directly**, not through the feature's own barrel, to reduce circular dependency risk.

## 4.7 Avoid God Files

A single file should not own unrelated concerns such as:

```text
render UI
+ HTTP requests
+ business calculation
+ persistent storage
+ native device access
+ analytics
+ navigation policy
```

The goal is not maximum file count. The goal is a coherent responsibility boundary.

## 4.8 Avoid Premature Abstraction

Create an abstraction when it improves one or more of:

- proven reuse;
- dependency isolation;
- testability;
- stable contract;
- meaningful duplication reduction;
- platform isolation.

Do not create a generic “engine”, “manager”, “processor”, or “helper” with one speculative consumer unless it establishes a genuinely necessary boundary.

## 4.9 Platform Isolation

Prefer:

```text
CameraAdapter.ios.ts
CameraAdapter.android.ts
```

or a dedicated native adapter over repeated:

```ts
if (Platform.OS === 'android') { ... }
```

Small cosmetic differences can still use `Platform.select`. Substantial behavioral differences should be isolated.

## 4.10 Business Logic Isolation

Business rules should be expressible and testable without rendering a React component whenever practical.

Good:

```text
HighKneeScreen
→ useHighKneeSession
→ highKneeCounter domain state machine
```

Bad:

```text
HighKneeScreen.tsx
contains 400 lines of pose thresholds, counting rules,
camera lifecycle, permissions, API calls, and UI rendering
```

---

# 5. Recommended Project Tree

This is a **capability map**, not a requirement to create every folder on day one.

```text
project-root/
├── android/                         # Bare/prebuild native Android shell
├── ios/                             # Bare/prebuild native iOS shell
├── assets/
│   ├── fonts/
│   ├── images/
│   ├── icons/
│   └── models/                      # Only globally owned bundled ML assets
├── e2e/
│   ├── flows/
│   ├── fixtures/
│   └── helpers/
├── src/
│   ├── app/
│   │   ├── bootstrap/
│   │   ├── providers/
│   │   ├── error-boundary/
│   │   └── App.tsx
│   ├── navigation/                  # React Navigation variant
│   │   ├── navigators/
│   │   ├── linking/
│   │   └── navigation.types.ts
│   ├── routes/                      # Optional route adapters / Expo Router bridge
│   ├── features/
│   │   ├── authentication/
│   │   ├── fitness-record/
│   │   ├── high-knee/
│   │   ├── attendance/
│   │   └── profile/
│   ├── shared/
│   │   ├── ui/
│   │   ├── hooks/
│   │   ├── domain/
│   │   └── utils/
│   ├── infrastructure/
│   │   ├── http/
│   │   ├── storage/
│   │   ├── permissions/
│   │   ├── analytics/
│   │   ├── logging/
│   │   ├── notifications/
│   │   └── errors/
│   ├── native/
│   │   ├── camera/
│   │   ├── bluetooth/
│   │   └── sensors/
│   ├── config/
│   ├── theme/
│   ├── i18n/
│   └── test/
│       ├── fixtures/
│       ├── mocks/
│       └── render/
├── app/                             # Expo Router variant, if used
│   ├── _layout.tsx
│   ├── (auth)/
│   └── (app)/
├── app.config.ts                    # Expo when applicable
├── eas.json                         # Expo/EAS when applicable
├── tsconfig.json
└── package.json
```

### Important interpretation

- `src/features/*` is the default home for business-owned code.
- `src/shared/*` is intentionally small.
- `src/infrastructure/*` contains global technical capabilities.
- `src/native/*` is for **cross-feature TS-facing native capability abstractions**, not every native use case.
- Feature-specific native code stays under the feature.
- `src/app/` (or `app/` at repository root) contains thin Expo Router filesystem route entrypoints. A route file must remain minimal and delegate screen rendering to `src/features/` or `src/routes/`.
- `src/routes/` contains navigation layout chrome (`StackScreenLayout`, `BottomTabScreenLayout`), navigation tab configuration (`appTabs.config.tsx`), and shared header action controls (`HomeHeaderButton`, `NotificationHeaderButton`).
- Do not maintain duplicate routing systems unless migration requires it.

---

# 6. Folder Rules

## `src/app/`

### Purpose
Expo Router filesystem routing root and composition entrypoints.

### Put here
- Route layout files (`_layout.tsx`);
- Thin route entrypoints (`index.tsx`) delegating to feature screens;
- Route group parameters and route parameter validation wrappers.

### Do NOT put here
- Heavy feature screens or inline business calculations;
- Feature API clients or DTO mappers;
- Generic UI primitives.

### Naming convention
Folders: `kebab-case`. React files: `PascalCase.tsx`.

### Internal structure
```text
app/
├── bootstrap/
├── providers/
├── error-boundary/
└── App.tsx
```

### Allowed dependencies
May import features, navigation/router adapters, infrastructure, theme, shared modules.

### Forbidden dependencies
Nothing lower-level should import `src/app` internals.

### Reuse rules
App composition is not a reusable domain. Extract reusable behavior to its correct lower-level owner instead.

### When to create a new file
When a global provider/bootstrap responsibility is independently testable or changes for independent reasons.

### When NOT to create a new file
Do not create a provider wrapper for a single component solely to mimic enterprise structure.

### Keywords
`bootstrap`, `provider`, `root`, `app lifecycle`, `composition`, `error boundary`.

### Examples
`QueryProvider.tsx`, `AppBootstrap.tsx`, `RootErrorBoundary.tsx`.

### Wrong placement examples
`fitnessRecordApi.ts` under `app/` — business data access has a feature owner.

---

## `src/features/`

### Purpose
Own business capabilities and their feature-local UI, hooks, domain rules, data access, state, schemas, and native adapters.

### Put here
Anything whose primary reason to change is a business capability.

### Do NOT put here
Global HTTP client, design tokens, domain-agnostic `Button`, universal secure storage adapter.

### Naming convention
Feature folder: `kebab-case`, based on domain language: `fitness-record`, `high-knee`, `attendance`.

### Internal structure
Create only folders that are used:

```text
feature/
├── api/
├── components/
├── hooks/
├── screens/
├── domain/
├── services/
├── store/
├── schemas/
├── native/
├── assets/
├── __tests__/
└── index.ts          # only if external consumers need public API
```

### Allowed dependencies
Shared UI/domain/utils, infrastructure clients, global native abstractions, config/theme/i18n.

### Forbidden dependencies
Private internals of another feature; `src/app`; filesystem route files.

### Reuse rules
Feature code remains local until multiple real consumers justify promotion.

### When to create a new file
When a concern gains independent responsibility, lifecycle, side effects, test boundary, or reuse.

### When NOT to create a new file
Do not split every three-line transform or prop type into separate files.

### Keywords
Business nouns: `fitness`, `attendance`, `profile`, `authentication`, `high knee`.

### Examples
`features/fitness-record/api/fitnessRecordApi.ts`.

### Wrong placement examples
`features/common/` as a pseudo-shared dump — use a real owner or `shared`.

---

## `src/shared/ui/`

### Purpose
Domain-agnostic reusable UI primitives and design-system components.

### Put here
`Button`, `TextField`, `Modal`, `Badge`, `Screen`, `EmptyState` when genuinely generic.

### Do NOT put here
`FitnessRecordCard`, `HighKneeCounter`, `AttendanceStatusSummary`.

### Naming convention
`PascalCase.tsx`, optionally one folder per complex component.

### Internal structure
Simple:
```text
ui/
├── Button.tsx
├── Badge.tsx
└── Modal/
    ├── Modal.tsx
    ├── styles.ts
    └── Modal.test.tsx
```

### Allowed dependencies
React Native, theme, shared hooks/utils, infrastructure-independent contracts.

### Forbidden dependencies
Feature modules.

### Reuse rules
A shared UI component must remain domain-agnostic. If its props accumulate business nouns, demote or split.
Shared UI primitives must not hardcode feature vocabulary, accessibility copy,
analytics names, or business labels. Pass feature-specific content through props
or compose it in the owning feature.

### When to create a new file
When there is a stable generic visual/interaction primitive.

### When NOT to create a new file
Do not wrap a library component with no meaningful API normalization or design-system value.

### Keywords
`button`, `input`, `modal`, `typography`, `badge`, `layout`, `skeleton`.

### Examples
`Button.tsx`, `FormField.tsx`.

### Wrong placement examples
`FitnessRecordFilter.tsx` in shared UI — business semantics belong to `fitness-record`.

---

## `src/shared/hooks/`

### Purpose
Domain-agnostic React hooks reused across features.

### Put here
`useDebounce`, `usePrevious`, `useAppState` if contracts are generic.

### Do NOT put here
`useFitnessRecords`, `useHighKneeSession`.

### Allowed dependencies
React/RN APIs, shared/infrastructure abstractions.

### Forbidden dependencies
Feature code.

### Reuse rules
Usually require multiple real consumers or clearly universal lifecycle responsibility.

### Keywords
`debounce`, `previous`, `interval`, `mounted`, `app state`.

### Wrong placement examples
A hook whose return type is `FitnessRecord[]`.

---

## `src/shared/domain/`

### Purpose
Cross-feature domain contracts and pure domain concepts that genuinely belong to multiple bounded capabilities.

### Put here
A `StudentSummary` contract if Attendance and Fitness use the same semantic entity and contract; shared pagination model if transport-neutral.

### Do NOT put here
API DTOs; feature-specific status enums; generic technical interfaces.

### Allowed dependencies
Pure TypeScript and lower-level shared contracts.

### Forbidden dependencies
React, navigation, feature implementations, HTTP client.

### Reuse rules
Only concepts with stable cross-feature meaning belong here.

### Keywords
`student`, `identity`, `money`, `date range` when semantically cross-feature.

### Wrong placement examples
`HighKneePhase` in shared domain.

---

## `src/shared/utils/`

### Purpose
Small, pure, domain-agnostic reusable transformations.

### Put here
`formatDate`, `clamp`, `assertNever`, `formatDuration` if truly generic.

### Do NOT put here
Network calls, storage, mutable singleton state, domain policy calculations.

### Allowed dependencies
Pure libraries and shared contracts.

### Reuse rules
Do not turn `utils` into a junk drawer. Prefer named modules over `misc.ts`.

### Keywords
`format`, `parse`, `clamp`, `sort` when domain-agnostic.

### Wrong placement examples
`calculateFitnessLevel` — that is business logic.

---

## `src/infrastructure/http/`

### Purpose
Global HTTP transport and cross-cutting request behavior.

### Put here
HTTP client creation, interceptors/middleware, auth header injection, timeout normalization, transport error normalization.

### Do NOT put here
`getFitnessRecords()` or feature endpoints.

### Internal structure
```text
http/
├── httpClient.ts
├── http.types.ts
├── interceptors/
└── mapHttpError.ts
```

### Allowed dependencies
Config, logging, storage abstraction where needed.

### Forbidden dependencies
Feature modules.

### Reuse rules
Global by definition; endpoint-specific logic stays feature-local.

### Keywords
`baseURL`, `request`, `interceptor`, `timeout`, `HTTP error`.

### Wrong placement examples
`attendanceApi.ts` in global HTTP folder.

---

## `src/infrastructure/storage/`

### Purpose
Storage mechanisms and secure/persisted technical abstractions.

### Put here
Secure token storage adapter, key-value store adapter, serialization helpers, storage migration infrastructure.

### Do NOT put here
Feature-specific draft policy unless cross-feature.

### Examples
`secureStorage.ts`, `keyValueStorage.ts`.

### Wrong placement examples
`highKneeLastResultStorage.ts` if only high-knee uses it.

---

## `src/infrastructure/permissions/`

### Purpose
Cross-feature permission primitives and normalized permission statuses.

### Put here
Generic camera/location/Bluetooth permission gateway if multiple features share capability.

### Do NOT put here
High-knee-specific rules such as “permission denial cancels session”.

### Reuse rules
Capability mechanism may be shared; feature policy remains local.

---

## `src/infrastructure/analytics/`

### Purpose
Analytics transport and global event dispatch contract.

### Put here
`analyticsClient`, provider adapter, common metadata enrichment.

### Do NOT put here
Feature event naming if events are only meaningful to one feature; those may remain feature-local and call the global client.

---

## `src/infrastructure/logging/`

### Purpose
Structured logging abstraction and sinks.

### Put here
`logger.ts`, crash-reporting integration, redaction rules.

### Do NOT put here
Feature business decisions.

---

## `src/infrastructure/notifications/`

### Purpose
Cross-feature push/local-notification capability.

### Put here
Token registration, platform channels/categories, notification permission adapter.

### Do NOT put here
Feature-specific notification orchestration unless it is globally coordinated.

---

## `src/infrastructure/errors/`

### Purpose
Technical error normalization and common user-facing mapping primitives.

### Put here
`AppError`, `NetworkError`, common transport-to-app error mapping.

### Do NOT put here
Feature domain errors such as `HighKneeCalibrationError` unless truly global.

---

## `src/native/`

### Purpose
TS-facing abstractions for native/device capabilities reused across multiple features.

### Put here
Shared Camera/Bluetooth/Sensors bridge interfaces and platform adapters.

### Do NOT put here
Native behavior that only exists for one business feature.

### Internal structure
```text
native/
└── camera/
    ├── camera.types.ts
    ├── cameraAdapter.ios.ts
    ├── cameraAdapter.android.ts
    └── index.ts
```

### Allowed dependencies
RN/native libraries, infrastructure logging/errors, shared contracts.

### Forbidden dependencies
Business feature modules.

### Reuse rules
Use this only when native capability is cross-feature. Otherwise use `features/<feature>/native`.

---

## `src/config/`

### Purpose
Validated runtime/build-derived configuration exposed to application code.

### Put here
Environment parsing, API base URL selection, feature flags, build-channel mapping.

### Do NOT put here
Business constants.

### Keywords
`env`, `base URL`, `feature flag`, `build channel`.

---

## `src/theme/`

### Purpose
Global visual design system values and icon registry contracts.

### Put here
Colors, spacing, typography, radii, shadows/elevation tokens, theme contracts, and app icon element type contracts (`src/theme/icons.ts`).

### Icon System Standard
- All app icons MUST use `AppIcon` (from `@/shared/ui/AppIcon`) combined with `reicon-react-native`.
- Do NOT generate custom SVG icon components or run SVG icon transformation scripts. Icon generation scripts have been retired.
- Individual `.svg` assets are forbidden for general UI icons; only decorative background mask SVGs (e.g. `feature-quick-mask-primary.svg`) may be stored in `assets/` and rendered via `SvgXml`.

### Do NOT put here
Feature-specific component layout values unless they are real design tokens.

---

## `src/i18n/`

### Purpose
Localization engine setup and cross-feature translation resources/policies.

### Put here
i18n bootstrap, locale detection, shared translation keys.

Feature-specific strings may be colocated under a feature if tooling supports it, then registered centrally.

---

## `src/test/`

### Purpose
Reusable test infrastructure.

### Put here
Custom render, global mocks, shared fixtures/builders, test server setup.

### Do NOT put here
Every unit test. Unit/component tests should normally colocate with source.

---

## `assets/`

### Purpose
Bundled static resources.

### Put here
Global images, fonts, logo assets, and decorative background SVGs.

### Do NOT put here
Individual UI SVG icons (use `reicon-react-native` + `AppIcon` instead).

---

## `android/` and `ios/`

See [Section 26](#26-android--ios-native-folders). These are platform shells, not React business-code folders.

---

# 7. Feature Folder Standard

A feature is a business capability, not merely a screen.

Typical examples:

```text
authentication
fitness-record
high-knee
attendance
profile
notifications
```

## Full-capability shape

```text
features/
└── fitness-record/
    ├── api/
    ├── components/
    ├── hooks/
    ├── screens/
    ├── services/
    ├── domain/
    ├── store/
    ├── types/
    ├── utils/
    ├── constants/
    ├── schemas/
    ├── __tests__/
    └── index.ts
```

This is **not a template to instantiate blindly**.

## Small feature shape

```text
features/profile/
├── screens/
│   └── ProfileScreen.tsx
├── api/
│   └── profileApi.ts
└── profile.types.ts
```

Do not add empty:

```text
services/
hooks/
utils/
store/
domain/
schemas/
```

just to satisfy symmetry.

## Recommended feature subfolder semantics

| Folder | Responsibility | Create only when |
|---|---|---|
| `api/` | Transport-level feature endpoints + DTO mapping edge | Feature talks to remote API |
| `components/` | Feature-owned reusable/sub-view UI | Used by multiple views/files in feature |
| `screens/` | Route-level UI owned by feature | Feature has navigable screen |
| `hooks/` | React lifecycle integration | Hook has meaningful feature role |
| `domain/` | Pure business rules/models/state machines | Non-trivial domain behavior exists |
| `services/` | Application orchestration across concerns | Orchestration is more than simple API call |
| `store/` | Feature client-state module | State outlives one component and needs central coordination |
| `schemas/` | Validation/parsing schemas | Runtime validation exists |
| `types/` | Larger grouped feature types | Multiple cohesive type modules exist |
| `utils/` | Feature-local pure non-domain utilities | More than one consumer and not domain policy |
| `constants/` | Feature-local constants | Enough constants to justify module/folder |
| `native/` | Feature-specific native integration | Native capability belongs only to feature |
| `assets/` | Feature-only bundled assets | Asset has feature ownership |
| `__tests__/` | Cross-file feature integration tests | Test spans multiple units |

### `index.ts`

Create only if external consumers need a controlled feature public API. A feature with no cross-feature public API does not need one.

---

# 8. Local vs Shared Decision

## Universal rule

```text
Used by exactly one feature
→ keep inside that feature.

Used by many files in the same feature
→ still keep inside that feature.

Used by ≥2 features
AND same responsibility
AND same semantic contract
→ consider promotion.

Domain-agnostic reusable primitive
→ shared.

Global infrastructure
→ infrastructure/native/config/app-level owner.
```

## Component decision

| Component | Default location | Reason |
|---|---|---|
| `FitnessRecordCard` | `features/fitness-record/components/` | Business-owned |
| `HighKneeCounter` | `features/high-knee/components/` | Business semantics |
| `Button` | `shared/ui/` | Domain-agnostic primitive |
| `StudentAvatar` | Start with owning feature | Promote only if semantics/props match across features |
| `CameraPreview` | Depends | Shared only if generic camera rendering is actually reused |

A UI component becomes shared because its **contract is generic**, not because its JSX could render anywhere.

## Hook decision

| Hook | Placement |
|---|---|
| `useFitnessRecords` | `features/fitness-record/hooks/` |
| `useHighKneeSession` | `features/high-knee/hooks/` |
| `useDebounce` | `shared/hooks/` if reused/generic |
| `useCameraPermission` | Feature-local if policy-specific; `native/camera` or shared hook if capability contract is generic |

## Type decision

| Type | Placement |
|---|---|
| `FitnessRecord` domain model | `features/fitness-record/domain/` or feature types |
| `FitnessRecordDto` | `features/fitness-record/api/` |
| `ApiResponse<T>` transport contract | `infrastructure/http/` |
| `Pagination` | Transport-level under HTTP or shared domain only if transport-neutral |
| `StudentSummary` | `shared/domain/` only when same semantic contract spans features |
| `CameraFacingMode` | `src/native/camera/` if cross-feature; otherwise high-knee native |

## Utility decision

| Function | Placement |
|---|---|
| `calculateFitnessLevel` | `features/fitness-record/domain/` |
| `formatDate` | `shared/utils/` if generic/reused |
| `formatDuration` | shared only if semantics are generic |
| `normalizePoseLandmarks` | `features/high-knee/domain/` or `native/` depending on responsibility |

---

# 9. When to Promote Local Code to Shared

Promote only when most of the following are true:

- at least two **real** consumers exist;
- responsibility is the same;
- semantic contract is the same;
- abstraction name makes sense outside either feature;
- no feature-specific dependency leaks into it;
- API is reasonably stable;
- extraction reduces actual duplication or centralizes global policy;
- promotion does not create feature-to-feature coupling through a fake shared module.

## Promotion workflow

```text
1. Identify duplicated/equivalent responsibility.
2. Compare semantic meaning, not only syntax.
3. Design the smallest common contract.
4. Move only the stable common core.
5. Keep business-specific adapters in each feature.
6. Update imports.
7. Add shared tests.
8. Recheck circular dependencies.
```

## When to Demote Shared Code Back to Feature

Demote when:

- only one business consumer remains;
- the module increasingly contains one feature's vocabulary;
- its public API keeps expanding for a single use case;
- it imports feature-specific contracts;
- sharing now causes more conditionals than reuse;
- consumers require incompatible behavior.

A shared module is not permanent. Architecture should evolve with real usage.

---

# 10. File Placement Decision Tree

```text
NEW FILE
│
├─ 1. Does equivalent code already exist?
│   ├─ YES → Reuse / extend / compose / refactor first.
│   └─ NO  → Continue.
│
├─ 2. Does it directly implement one business capability?
│   ├─ YES → features/<owner>/
│   │        │
│   │        ├─ Route-level UI?        → screens/
│   │        ├─ Feature UI?            → components/
│   │        ├─ React lifecycle?       → hooks/
│   │        ├─ HTTP endpoint/DTO?     → api/
│   │        ├─ Business rule/model?   → domain/
│   │        ├─ Orchestration?         → services/
│   │        ├─ Feature client state?  → store/
│   │        ├─ Runtime validation?    → schemas/
│   │        ├─ Native capability only
│   │        │  for this feature?      → native/
│   │        ├─ Feature-only asset?    → assets/
│   │        └─ Small local helper?    → colocate first; utils/ only if justified
│   │
│   └─ NO → Continue.
│
├─ 3. Is it generic UI?
│   ├─ YES + reusable/stable → shared/ui/
│   └─ NO → Continue.
│
├─ 4. Is it a generic React hook?
│   ├─ YES + reusable/stable → shared/hooks/
│   └─ NO → Continue.
│
├─ 5. Is it a cross-feature domain concept?
│   ├─ YES → shared/domain/
│   └─ NO → Continue.
│
├─ 6. Is it a small pure domain-agnostic transform?
│   ├─ YES → shared/utils/
│   └─ NO → Continue.
│
├─ 7. Is it global technical infrastructure?
│   ├─ HTTP          → infrastructure/http/
│   ├─ Storage       → infrastructure/storage/
│   ├─ Permissions   → infrastructure/permissions/
│   ├─ Logging       → infrastructure/logging/
│   ├─ Analytics     → infrastructure/analytics/
│   ├─ Notifications → infrastructure/notifications/
│   └─ Errors        → infrastructure/errors/
│
├─ 8. Is it a cross-feature native/device capability?
│   ├─ YES → native/<capability>/
│   └─ NO → Continue.
│
├─ 9. Is it global app composition?
│   ├─ YES → app/
│   └─ NO → Continue.
│
├─ 10. Is it navigation/router composition?
│   ├─ React Navigation → navigation/
│   ├─ Expo Router      → root app/ route adapter
│   └─ neither          → do not invent navigation folders
│
└─ 11. Still ambiguous?
    → Choose the narrowest valid scope with the clearest owner.
      Document a new architecture concept before adding a new top-level folder.
```

---

# 11. AI File Placement Algorithm

AI coding agents must execute these steps before creating a file.

## Step 1 — Determine Responsibility
Write one sentence:

> “This file is responsible for ___.”

If the sentence contains several unrelated verbs, splitting may be needed.

## Step 2 — Search Existing Implementation
Search:

- exact name;
- synonyms;
- same feature noun;
- same endpoint;
- same UI interaction;
- same hook purpose;
- same validation;
- same type shape;
- same native capability.

## Step 3 — Determine Ownership
Identify the business capability or infrastructure owner.

## Step 4 — Determine Reuse Scope

Choose exactly one:

```text
file-local
screen-local
feature-local
domain-shared
cross-feature
global-infrastructure
```

## Step 5 — Determine Layer

Choose the dominant layer:

```text
UI
application
domain
data
infrastructure
```

## Step 6 — Determine Platform Scope

```text
both
iOS
Android
native-platform-shell
```

## Step 7 — Determine Lifecycle

```text
pure/stateless
request lifecycle
component lifecycle
screen lifecycle
feature lifecycle
app lifecycle
process/native singleton
```

Lifecycle often exposes wrong placement. Example: an app-wide native listener should not be recreated inside every screen.

## Step 8 — Choose Placement
Choose the **narrowest scope with correct ownership**.

## Step 9 — Check Whether to Split
Apply Section 15.

## Step 10 — Check Dependency Direction
Ensure lower-level/shared code does not import feature/app code.

## Step 11 — Check Reuse Potential
Prefer reuse/extension/composition over duplicate implementation.

## Step 12 — Validate Naming
The filename must communicate responsibility and role.

## Required AI placement record

For non-trivial new files, an agent should be able to state:

```text
Responsibility:
Owner:
Reuse scope:
Layer:
Platform:
Lifecycle:
Chosen path:
Existing implementation searched:
Why reuse was/wasn't possible:
```

---

# 12. Keyword → Folder Mapping

| Keyword / Responsibility | Preferred location | Notes |
|---|---|---|
| screen, route-level page | `features/<feature>/screens/` | Expo route file may only adapt to this screen |
| feature component | `features/<feature>/components/` | Business semantics |
| screen-only subview | beside screen | Prefer nearest scope |
| reusable generic UI | `shared/ui/` | Must be domain-agnostic |
| API endpoint | `features/<feature>/api/` | HTTP transport for feature |
| HTTP client | `infrastructure/http/` | Global transport |
| query hook | `features/<feature>/hooks/` | Server-state integration |
| mutation hook | `features/<feature>/hooks/` | Server-state integration |
| business calculation | `features/<feature>/domain/` | Pure if possible |
| domain model | `features/<feature>/domain/` | Or shared/domain if truly cross-feature |
| API DTO | `features/<feature>/api/` | Do not leak by default |
| DTO mapper | `features/<feature>/api/` | Boundary conversion |
| validation schema | `features/<feature>/schemas/` | Or colocate if one use |
| form model | feature form/screen module | UI/application concern |
| feature state machine | `features/<feature>/domain/` | Pure transitions preferred |
| feature store | `features/<feature>/store/` | Client state |
| persisted generic storage | `infrastructure/storage/` | Mechanism, not feature policy |
| auth token storage | `infrastructure/storage/` or auth adapter | Avoid raw access everywhere |
| camera bridge | `native/camera/` | If cross-feature |
| feature-only camera adapter | `features/<feature>/native/` | E.g. high-knee processing |
| Bluetooth | `native/bluetooth/` | Cross-feature mechanism |
| NFC | `native/nfc/` | If cross-feature |
| GPS | `native/location/` | Cross-feature mechanism |
| sensor | `native/sensors/` | Cross-feature |
| Kotlin bridge | `android/` + TS adapter owner | Native implementation + TS contract |
| Swift bridge | `ios/` + TS adapter owner | Native implementation + TS contract |
| MediaPipe wrapper | `features/high-knee/native/` if feature-specific | Keep ownership explicit |
| permission mechanism | `infrastructure/permissions/` | Feature policy stays local |
| navigation composition | `navigation/` | React Navigation |
| Expo filesystem route | root `app/` | Thin route adapter |
| analytics client | `infrastructure/analytics/` | Global |
| feature analytics event | feature-local | Calls analytics client |
| theme token | `theme/` | Global design system |
| screen styles | beside screen | `styles.ts` |
| component styles | beside component | Avoid global stylesheet dump |
| formatter | `shared/utils/` if generic/reused | Otherwise local |
| parser | local/shared based on semantics | Validation parsers may be schemas |
| enum | owner module | Avoid giant global enum folder |
| error boundary | `app/error-boundary/` | Global UI failure boundary |
| transport error | `infrastructure/errors/` or http | Normalize globally |
| domain error | feature domain | Business semantics |
| test fixture | colocated or `src/test/fixtures/` | Based on reuse |
| mock API | `src/test/mocks/` | Shared test infrastructure |
| feature integration test | feature `__tests__/` | Spans feature modules |
| E2E flow | `e2e/flows/` | App-level behavior |
| localization engine | `i18n/` | Global |
| feature translation file | feature/locales if tooling supports | Register globally |
| env schema | `config/` | Validate early |
| feature flag | `config/` | Runtime/build config |
| app constant | closest global owner | Do not create junk constants |
| feature constant | feature-local | Prefer colocated constant file |
| notification registration | `infrastructure/notifications/` | Platform/global mechanism |
| deep linking | `navigation/linking/` | Router concern |
| bootstrap | `app/bootstrap/` | App lifecycle |
| provider | `app/providers/` | App-wide provider only |
| secure store | `infrastructure/storage/` | Global storage mechanism |
| offline query persistence | app provider + infrastructure storage | Composition + mechanism |
| repository | feature data layer | Only if datasource abstraction is needed |
| application service | `features/<feature>/services/` | Orchestration, not HTTP wrapper |
| utility | closest valid scope | “utils” is not a default answer |

---

# 13. Naming Conventions

## Folder names

Use **kebab-case** for source folders:

```text
fitness-record/
high-knee/
error-boundary/
```

Reasons:

- stable across case-sensitive and case-insensitive filesystems;
- readable in paths;
- consistent with feature names;
- avoids platform-specific casing surprises.

## React components

```text
FitnessRecordCard.tsx
CameraPreview.tsx
Button.tsx
```

Use `PascalCase`.

## Screens

```text
FitnessRecordHistoryScreen.tsx
HighKneeScreen.tsx
```

Suffix `Screen` identifies route-level UI.

## Hooks

```text
useFitnessRecords.ts
useCameraPermission.ts
useHighKneeSession.ts
```

Always prefix React hooks with `use`.

## Services

```text
fitnessRecordService.ts
highKneeSessionService.ts
```

Use `Service` only for orchestration/service responsibility, not every file that calls a function.

## API

```text
fitnessRecordApi.ts
attendanceApi.ts
```

API modules own remote transport operations for the feature.

## Types

Default preference:

- colocate tiny local types in the consuming file;
- use `fitnessRecord.types.ts` when several related feature types need one module;
- use domain-specific files such as `fitnessRecord.model.ts` when domain semantics matter;
- avoid `FitnessRecord.ts` solely to store an interface unless that file represents a real domain unit.

Recommended:

```text
fitnessRecord.types.ts
fitnessRecord.dto.ts
highKnee.types.ts
```

Avoid a monolithic root `types.ts`.

## Schemas

```text
fitnessRecord.schema.ts
highKneeSession.schema.ts
```

## Stores

```text
fitnessRecord.store.ts
highKneeSession.store.ts
```

Follow the selected state library's convention if it adds clarity, but keep ownership.

## Constants

```text
fitnessRecord.constants.ts
highKnee.constants.ts
```

Only when grouping is justified.

## Utils

Prefer descriptive filenames:

```text
formatFitnessDuration.ts
normalizePoseLandmarks.ts
```

over:

```text
fitnessRecord.utils.ts
```

when functions have independent stable responsibilities.

## Tests

```text
FitnessRecordCard.test.tsx
fitnessRecordApi.test.ts
calculateFitnessLevel.test.ts
```

## Platform-specific

Use identical base module names:

```text
cameraAdapter.ios.ts
cameraAdapter.android.ts
```

or for JSX:

```text
CameraPreview.ios.tsx
CameraPreview.android.tsx
```

Consistency of the basename enables React Native resolution.

---

# 14. `.ts` vs `.tsx`

Use:

```text
.ts
```

for TypeScript without JSX.

Examples:

```text
fitnessRecordApi.ts
calculateFitnessLevel.ts
camera.types.ts
highKnee.store.ts
```

Use:

```text
.tsx
```

only when JSX exists.

Examples:

```text
HighKneeScreen.tsx
FitnessRecordForm.tsx
Button.tsx
```

Do not use `.tsx` for service/type/helper files merely because they belong to a React project.

Platform/test suffixes compose normally:

```text
cameraAdapter.ios.ts
CameraPreview.android.tsx
fitnessRecordApi.test.ts
FitnessRecordCard.test.tsx
```

---

# 15. When to Split a File

Do not use line count as the primary rule.

Evaluate:

- number of responsibilities;
- cohesion;
- ownership;
- reuse;
- testability;
- complexity;
- lifecycle;
- dependency set;
- side effects;
- readability;
- domain boundary;
- change frequency.

## Strong split signals

Split when one file:

- fetches API **and** renders UI **and** calculates business rules;
- manages camera stream **and** pose counting domain state;
- contains separate concepts with different owners;
- has independently reusable subparts;
- requires different platform implementations;
- has side effects mixed with pure business logic;
- is difficult to test because dependencies are entangled;
- changes for unrelated reasons.

## Do not split merely because

- file is 180 lines;
- a function is 20 lines;
- a component has several local subcomponents that are never reused;
- a type is used once;
- a helper could technically be exported.

## Soft line-count guidance

Line count can trigger a review, not an automatic refactor:

```text
~150–250 lines:
review cohesion, but no mandatory split.

~300–500 lines:
strongly inspect responsibilities and internal sections.

>500 lines:
require explicit justification if kept whole.
```

Generated files, schemas, declarative maps, and highly cohesive state machines may legitimately be longer.

---

# 16. Component Splitting Rules

## Feature component

Use:

```text
features/<feature>/components/
```

when the component is reused across multiple screens/subviews in that feature.

## Screen-colocated component

Use:

```text
features/high-knee/screens/HighKneeScreen/
├── HighKneeScreen.tsx
├── CameraPanel.tsx
├── ResultPanel.tsx
└── styles.ts
```

when subcomponents:

- are only used by that screen;
- are tightly coupled to screen props/state vocabulary;
- would pollute feature-wide `components/`.

## Shared UI

Promote to:

```text
shared/ui/
```

only when:

- business nouns can be removed without hiding behavior;
- two or more real consumers exist, or it is a foundational design-system primitive;
- props express generic UI semantics;
- feature dependencies are absent.

## Wrong abstraction example

Bad:

```ts
<UniversalCard
  fitnessRecord={record}
  attendance={attendance}
  mode="fitness"
/>
```

This is a shared component carrying feature-specific branches.

Better:

```text
shared/ui/Card.tsx
features/fitness-record/components/FitnessRecordCard.tsx
features/attendance/components/AttendanceCard.tsx
```

Feature components compose the primitive.

---

# 17. Hook Rules

## UI hook

Examples: modal visibility, keyboard handling.

Placement:
- screen-local if one screen;
- feature hook if feature-specific;
- `shared/hooks` if generic/reused.

## Feature hook

Example:

```text
useHighKneeSession
```

Placement:

```text
features/high-knee/hooks/useHighKneeSession.ts
```

May orchestrate feature state, services, native adapters, and domain functions but should avoid becoming a god hook.

## Data/query hook

Examples:

```text
useFitnessRecords
useFitnessRecord
```

Placement:

```text
features/fitness-record/hooks/
```

It integrates server-state library lifecycle with feature API.

## Mutation hook

Examples:

```text
useCreateFitnessRecord
useDeleteFitnessRecord
```

Same feature-local placement.

## Native/device hook

Example:

```text
useCameraPermission
```

Placement depends on semantics:

- feature-specific policy → feature hook/native;
- capability-level generic hook reused by multiple features → `src/native/camera/` or `shared/hooks` depending on ownership.

## Shared generic hook

Examples:

```text
useDebounce
usePrevious
```

Placement:

```text
shared/hooks/
```

Do not put a hook in shared if its signature contains feature-specific entities.

---

# 18. API & Data Access Rules

These terms are not interchangeable.

## `api`

Responsibility:

> Translate a feature operation into remote transport calls and map transport DTO boundaries.

Example:

```text
features/fitness-record/api/fitnessRecordApi.ts
```

## `service`

Responsibility:

> Application/business orchestration across one or more operations or capabilities.

Example: create fitness record, enqueue local update, emit analytics, and return domain result.

Do not create a service that merely forwards every API function 1:1.

## `repository`

Responsibility:

> Abstract one or more interchangeable data sources behind a domain/application contract.

Use only when there is a real need, such as:

- remote + local database;
- offline synchronization;
- testable domain port;
- multiple data providers.

A repository for every CRUD endpoint is over-engineering.

## query hook

Responsibility:

> Connect server-state/data operations to React lifecycle.

## business service/domain function

- Pure policy/calculation → domain.
- Side-effect orchestration → application service.

## Simple data flow

```text
FitnessRecordHistoryScreen
        ↓
useFitnessRecords()
        ↓
fitnessRecordApi.getList()
        ↓
httpClient
        ↓
Backend
```

This is sufficient for many applications.

## More complex data flow

```text
Screen
  ↓
hook
  ↓
application service
  ↓
repository interface
  ↓
remote/local data sources
```

Use this only when the complexity is real.

### Over-engineering signal

If:

- there is one backend;
- no offline cache abstraction;
- no alternate datasource;
- service is only forwarding repository;
- repository only forwards API;

then remove unnecessary layers.

---

# 19. Server State vs Client State

## Server state

Data whose authoritative source is external/server-side.

Examples:

```text
fitness records
profile loaded from API
notifications
leaderboard
```

Prefer a server-state cache/query tool rather than copying everything into a global client store.

## Client state

Local application interaction/session state.

Examples:

```text
selected tab
modal open
draft form
camera facing mode
high-knee session phase
temporary filters
```

Keep state at the narrowest lifecycle.

## Persistent client state

Examples:

```text
auth token
theme preference
onboarding status
user-selected locale
```

Persistence mechanism belongs to infrastructure. Feature policy around what/when to persist belongs to the feature/app owner.

## Placement is library-independent

```text
TanStack Query
Redux Toolkit
Zustand
Context
Jotai
```

do not change ownership. They only implement storage/subscription behavior.

---

# 20. Types & DTO Rules

Do not treat all TypeScript types as one category.

## API DTO

Represents transport shape: data received from the backend or sent to the backend.

DTOs belong to the remote data boundary. They are not frontend/domain/view models by default, even when the fields happen to match today.

Placement:

```text
features/<feature>/api/*.dto.ts
```

or colocated with the API module.

DTOs should not leak into screens, components, or hooks unless the feature is doing a tiny pass-through with no mapping, no business semantics, and no UI-specific shape.

Recommended naming:

```text
<feature>.dto.ts
```

## Domain Model

Represents business meaning.

Placement:

```text
features/<feature>/domain/
```

DTO and domain model may happen to match today but should not be assumed identical when business semantics differ.

## View Model

UI-ready shape used by frontend code.

Placement near the screen/component/hook that creates it.

## Form Model

Form-specific values such as text strings, drafts, optional validation state.

Placement with form/screen or feature schemas.

## FE-facing Type

Application/view/form types represent the shape the frontend uses internally. They should be named and placed by frontend meaning, not by backend response shape.

Use:

```text
<feature>.types.ts
```

only when several cohesive feature-level types need a shared module. Use `domain/` when the type carries business meaning.

## Navigation Param Type

Placement:

```text
navigation/navigation.types.ts
```

for global navigator contract, or near route definition.

## Global Utility Type

Only truly generic types belong in shared technical modules.

Examples:

```ts
type Nullable<T> = T | null
```

Avoid a giant `src/types/`.

## DTO mapping rule

Use mapping when:

- API names differ from domain names;
- date/string parsing is needed;
- nullability differs;
- domain invariants exist;
- endpoint response contains transport-only metadata.

Mapper placement:

```text
features/<feature>/api/<feature>.mapper.ts
```

The mapper converts DTOs into domain, view, or application types at the transport boundary.

Colocate a tiny mapper in `<feature>Api.ts` only when the endpoint is simple and the mapping is obvious. Split a dedicated `<feature>.mapper.ts` when mapping is non-trivial, DTOs are large, multiple endpoints reuse the conversion, or mapper tests would improve confidence.

---

# 21. Constants Rules

Constants are owned by meaning.

## Feature constant

```text
HIGH_KNEE_MIN_CONFIDENCE
```

→ `features/high-knee/...`

## App constant

A global operational value belongs to the nearest global owner.

## UI constant

If it is a design token → `theme/`.

If local layout value → colocate with component styles.

## Environment config

`API_BASE_URL` is configuration, not a constant.

## Magic number

A number becomes a named constant when the name captures meaning and improves correctness.

Do not extract every numeric literal.

## Enum

Place with the domain/type that owns the states. Do not create `src/enums/`.

---

# 22. Config vs Constants

## `config/`

Values are derived from environment/build/runtime deployment context.

Examples:

```text
API_BASE_URL
APP_ENV
feature flags
build channel
analytics provider key identifier
```

Values may differ across development/staging/production.

## constants

Stable semantic values in application behavior.

Examples:

```text
DEFAULT_PAGE_SIZE
MAX_UPLOAD_SIZE
HIGH_KNEE_MIN_CONFIDENCE
```

A constant may still change through code deployment, but it is not chosen by runtime environment.

---

# 23. Utils vs Helpers vs Services

## Utility

Usually:

- pure;
- stateless;
- domain-agnostic or clearly scoped;
- deterministic.

Example:

```text
formatDate
clamp
```

## Helper

`helper` is too vague to be an architectural category.

Avoid creating a root `helpers/` folder. Name the real responsibility.

Instead of:

```text
helpers/cameraHelper.ts
```

prefer:

```text
native/camera/cameraAdapter.ts
```

or:

```text
features/high-knee/domain/normalizePoseLandmarks.ts
```

## Service

Coordinates side effects or application operations.

A service is not “any function not in a component”.

## Domain function

Encodes business policy/invariant/calculation.

Example:

```text
calculateFitnessLevel
```

belongs to fitness domain, even if technically it is a pure “utility”.

**Semantics outrank implementation shape.**


# 24. Native / Device Integration

Mobile architecture must treat native/device access as a first-class boundary.

Capabilities include:

- Camera
- Bluetooth/BLE
- NFC
- GPS/location
- accelerometer/gyroscope/sensors
- filesystem
- permissions
- push notifications
- background tasks
- biometric authentication
- native modules
- Kotlin bridges
- Swift bridges
- on-device ML runtimes such as MediaPipe

## 24.1 Cross-feature native infrastructure

Use:

```text
src/native/<capability>/
```

when several features use the same device capability through the same contract.

Example:

```text
src/native/camera/
├── camera.types.ts
├── cameraAdapter.ios.ts
├── cameraAdapter.android.ts
├── useCameraPermission.ts
└── index.ts
```

Responsibilities:

- normalize platform/library APIs;
- expose stable TypeScript contracts;
- isolate platform quirks;
- centralize capability-level errors;
- avoid business rules.

## 24.2 Feature-specific native integration

Use:

```text
features/<feature>/native/
```

when the native code exists specifically to implement one business feature.

Example:

```text
features/high-knee/native/
├── poseLandmarker.types.ts
├── poseLandmarkerAdapter.ts
├── highKneeCameraPipeline.ts
└── index.ts
```

The generic camera mechanism may still come from `src/native/camera`, while high-knee pose processing stays feature-owned.

## 24.3 Kotlin / Swift native implementation

There are two layers:

```text
TypeScript-facing contract/adaptor
+
Actual native platform implementation
```

Example:

```text
src/features/high-knee/native/
└── mediaPipePose.ts              # TypeScript contract/adaptor

android/app/src/main/java/.../
└── HighKneePoseModule.kt         # Android native implementation

ios/.../
└── HighKneePoseModule.swift      # iOS native implementation
```

The Kotlin/Swift source must not become the owner of React feature business rules. It should implement the native computation/bridge contract.

## 24.4 Capability vs policy

Separate:

```text
Capability:
"Request camera permission"

Policy:
"If camera is denied during High Knee setup,
show remediation UI and keep session in NEEDS_PERMISSION."
```

Capability can be shared. Policy belongs to High Knee.

## 24.5 Native lifecycle rule

Any native integration must explicitly define:

- initialization;
- permission dependency;
- resource acquisition;
- active lifecycle;
- pause/background behavior;
- cleanup;
- cancellation;
- error mapping;
- platform differences;
- concurrency/race handling.

For camera streams, sensors, BLE scans, and native model instances, cleanup is not optional.

---

# 25. Platform-Specific Code

React Native can resolve platform-specific modules by filename.

Typical variants:

```text
File.ts
File.native.ts
File.ios.ts
File.android.ts
```

## Recommended use

Use `.ios.ts(x)` / `.android.ts(x)` when platform behavior differs materially.

Example:

```text
cameraAdapter.ios.ts
cameraAdapter.android.ts
```

Callers import:

```ts
import { cameraAdapter } from './cameraAdapter'
```

They should not care which platform implementation is loaded.

## Resolution principle

When building for iOS or Android, Metro resolves the most specific matching platform file before a generic fallback, subject to project resolver configuration.

Design with an identical exported contract across variants.

## `.native.ts`

Use when:

- the project also has web or another non-native implementation;
- iOS and Android share one native implementation.

Example:

```text
secureStorage.native.ts
secureStorage.web.ts
```

For an iOS/Android-only app, `.native.ts` is usually unnecessary unless it clarifies an actual split.

## Use `Platform.OS` when

- branch is tiny;
- behavior remains one responsibility;
- abstraction would be noisier than branch;
- difference is mostly styling or one argument.

## Do not use scattered platform branches when

- lifecycle differs;
- permissions differ;
- APIs differ;
- error recovery differs;
- implementation has several branches;
- platform code requires different dependencies.

Bad:

```ts
if (Platform.OS === 'ios') { ... }
...
if (Platform.OS === 'android') { ... }
...
if (Platform.OS === 'ios') { ... }
```

Good:

```text
backgroundTask.ios.ts
backgroundTask.android.ts
```

---

# 26. Android / iOS Native Folders

These folders are **platform project shells**.

## `android/`

May contain:

- Gradle configuration;
- `AndroidManifest.xml`;
- Kotlin/Java native modules;
- Android SDK integrations;
- resources;
- ProGuard/R8 config;
- native permissions;
- package/build configuration.

## `ios/`

May contain:

- Xcode project/workspace;
- Swift/Objective-C native modules;
- `Info.plist`;
- CocoaPods configuration;
- native SDK integration;
- entitlements/capabilities;
- iOS permissions descriptions.

## Forbidden

Do not move React business logic into `android/` or `ios/`.

Bad:

```text
android/.../FitnessLevelCalculator.kt
```

when the rule can be shared and implemented in TypeScript domain logic.

Good reason for native code:

- MediaPipe native API;
- camera frame processor;
- BLE API;
- high-performance image processing;
- platform-only SDK;
- OS background service.

## Native bridge ownership

A native module should have a TS-side owner documented in source architecture.

Example:

```text
HighKneePoseModule.kt
↔ features/high-knee/native/mediaPipePose.ts
```

This makes the bridge discoverable to both developers and AI agents.

---

# 27. Navigation

Navigation is composition/infrastructure for moving between route-level UI. It must not own business logic.

## 27.1 React Navigation variant

Recommended:

```text
src/navigation/
├── navigators/
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── MainNavigator.tsx
├── linking/
│   └── linkingConfig.ts
└── navigation.types.ts
```

Feature screens remain:

```text
src/features/<feature>/screens/
```

Example:

```tsx
<Stack.Screen
  name="FitnessRecordHistory"
  component={FitnessRecordHistoryScreen}
/>
```

## 27.2 Expo Router variant

Filesystem routes live at root `app/`:

```text
app/
├── _layout.tsx
├── (auth)/
│   └── login.tsx
└── (app)/
    └── fitness-record/
        └── index.tsx
```

Keep route modules thin:

```tsx
export { FitnessRecordHistoryScreen as default }
  from '@/features/fitness-record/screens/FitnessRecordHistoryScreen'
```

or create a tiny adapter if route params must be converted.

Do not move feature domain/API/hooks into the root `app/` route tree.

### Project rule: bottom tab route grouping

For this app, bottom navigation belongs to the route shell, not to a screen
layout component.

```text
src/app/(app)/
├── _layout.tsx              # authenticated stack shell, no bottom tabs
├── (tabs)/
│   ├── _layout.tsx          # the only place that renders AppTabs
│   ├── index.tsx            # /
│   ├── activities.tsx       # /activities
│   ├── check-in.tsx         # /check-in
│   ├── schedule.tsx         # /schedule
│   └── account.tsx          # /account
└── account/
    └── general-info.tsx     # /account/general-info, no bottom tabs
```

Rules:

- Main tab routes must live under `(tabs)`.
- Detail, stack, and modal routes must live outside `(tabs)`, even when they
  share a URL prefix with a tab route such as `/account/...`.
- `BottomTabScreenLayout` is only a visual layout helper. It must not decide
  whether bottom navigation is visible.
- Expo route files stay thin and should only adapt or re-export feature screens
  from `src/features/<feature>/screens`.
- `src/routes` may contain route shell, navigation layout, or legacy route
  adapters during migration. Do not place new or substantially reworked
  business screen implementations under `src/routes`.

## 27.3 Navigation side effects

A feature hook may intentionally trigger navigation only if navigation is part of application-flow orchestration. Prefer injecting callbacks/navigation ports rather than importing router singleton into pure domain code.

Never import navigation into:

- domain calculations;
- DTO mappers;
- schemas;
- pure utilities.

## 27.4 Cross-feature navigation

Feature A may navigate to a public route owned by Feature B without importing B's private implementation.

Prefer route contracts/names or router paths over importing B's internal screen helpers.

---

# 28. Screens vs Components

## Screen

A Screen is route-level UI.

It typically:

- receives route params;
- composes feature components;
- invokes feature hooks;
- coordinates page/screen UX state;
- handles route-level loading/error/empty composition.

Examples:

```text
FitnessRecordHistoryScreen
HighKneeScreen
ProfileScreen
```

## Component

A Component is a reusable or subordinate UI unit.

Examples:

```text
FitnessRecordCard
FitnessRecordFilter
CameraPanel
ResultPanel
```

## Screen should not become business layer

Bad:

```text
Screen
├─ fetch API inline
├─ calculate domain levels inline
├─ call native module inline
├─ store token inline
└─ render UI
```

Better:

```text
Screen
├─ feature hook
├─ feature components
└─ navigation UX
```

---

# 29. Styling / Theme

## Global theme

Use:

```text
src/theme/
├── colors.ts
├── spacing.ts
├── typography.ts
├── radii.ts
├── theme.types.ts
└── index.ts
```

Only include actual design tokens.

## Component-specific styles

Colocate:

```text
Button/
├── Button.tsx
└── styles.ts
```

or keep `StyleSheet.create` in the component if small and cohesive.

## Screen-specific styles

```text
HighKneeScreen/
├── HighKneeScreen.tsx
├── CameraPanel.tsx
└── styles.ts
```

## Do not create

```text
src/styles/allStyles.ts
```

containing unrelated style rules from the whole application.

## Theme vs local constant

Global `spacing.md` or tokenized spacing belongs in theme. A one-off camera preview aspect ratio belongs with the component/feature.

---

# 30. Assets

## Global assets

```text
assets/
├── fonts/
├── images/
├── icons/
└── models/
```

Use for resources whose ownership is application-wide.

## Feature-specific assets

Prefer:

```text
features/high-knee/assets/
```

for feature-only instructional images, animations, or model metadata when bundler/toolchain support makes this practical.

Example:

```text
src/features/class-schedule/assets/images/class-basic.png
```

Use this shape for bundled images that are only meaningful inside one feature's
screen or workflow.

## AI/ML models

Choose ownership based on usage.

```text
assets/models/
```

when one bundled model is global infrastructure used by many features.

Use:

```text
features/high-knee/assets/models/
```

when the model is specifically part of High Knee.

For models not bundled into JS assets but shipped through platform native resources, document the native path and maintain a TS-side loader/contract at the owning feature/native boundary.

## Asset naming

Use descriptive lowercase/kebab-case file names unless platform tooling imposes another convention.

Avoid:

```text
image1.png
model_final_v2_really_final.task
```

Prefer:

```text
high-knee-guide-front.png
pose-landmarker-full.task
```

---

# 31. Test Structure

Use a **hybrid strategy**.

## Unit/component tests

Colocate with source:

```text
calculateFitnessLevel.ts
calculateFitnessLevel.test.ts
```

or:

```text
FitnessRecordCard/
├── FitnessRecordCard.tsx
└── FitnessRecordCard.test.tsx
```

Benefits:

- ownership is obvious;
- refactors move source and tests together;
- discoverability is high.

## Feature integration tests

Use:

```text
features/<feature>/__tests__/
```

when tests span multiple feature modules.

Example:

```text
features/fitness-record/__tests__/
└── createFitnessRecordFlow.test.ts
```

## Shared test infrastructure

Use:

```text
src/test/
├── fixtures/
├── mocks/
└── render/
```

Examples:

- custom React Native render wrapper;
- mock HTTP server;
- common builders;
- fake storage implementation.

## E2E

Use a repository-level folder:

```text
e2e/
```

E2E is application behavior, not feature source implementation.

## Fixture rule

A fixture used only by one test stays near that test. Promote to `src/test/fixtures` only if reused.

---

# 32. Barrel Files / `index.ts`

Barrels are **API boundaries**, not decoration.

## Good use

Feature external public API:

```text
features/authentication/index.ts
```

Shared UI package:

```text
shared/ui/index.ts
```

if the team intentionally exposes a stable public UI surface.

## Bad use

Creating `index.ts` in every folder:

```text
hooks/index.ts
components/index.ts
domain/index.ts
utils/index.ts
```

without a boundary reason.

## Circular dependency risk

Internal feature modules should usually import directly:

```ts
import { calculateFitnessLevel } from '../domain/calculateFitnessLevel'
```

not:

```ts
import { calculateFitnessLevel } from '../index'
```

The latter may route internal dependency through the public barrel and create cycles.

## Public API rule

Only export what external consumers are allowed to depend on.

A public feature API is a contract. Removing/restructuring exported internals becomes more expensive later.

---

# 33. Import Rules

## Direction

Conceptual dependency graph:

```text
                app / routes / navigation
                         ↓
                      features
                         ↓
        ┌─────────────────────────────────┐
        │ shared/ui   shared/domain       │
        │ shared/hooks shared/utils       │
        └─────────────────────────────────┘
                         ↓
              infrastructure / native
                         ↓
             platform libraries / OS
```

This diagram is conceptual, not a strict Clean Architecture dependency graph. Some shared UI may consume theme, and feature data code may consume HTTP infrastructure.

## Required rules

1. `shared/*` must not import `features/*`.
2. `infrastructure/*` must not import feature implementations.
3. `native/*` cross-feature capability modules must not import feature business code.
4. `domain/*` should avoid React and navigation.
5. Feature A must not import Feature B private internals.
6. App/navigation may compose multiple features.
7. Feature external contracts should be imported from a narrow public API where cross-feature interaction is unavoidable.

## Cross-feature interaction patterns

Prefer one of:

- shared domain contract;
- route/navigation contract;
- app-level orchestration;
- event/message contract;
- feature public API;
- injected interface/callback.

Do not solve cross-feature coupling by moving random code into `shared`.

---

# 34. Path Aliases

Keep aliases minimal.

Recommended:

```json
{
  "paths": {
    "@app/*": ["src/app/*"],
    "@features/*": ["src/features/*"],
    "@shared/*": ["src/shared/*"],
    "@infra/*": ["src/infrastructure/*"],
    "@native/*": ["src/native/*"],
    "@theme/*": ["src/theme/*"],
    "@config/*": ["src/config/*"]
  }
}
```

A smaller alternative is:

```json
{
  "paths": {
    "@/*": ["src/*"]
  }
}
```

Choose one project convention.

## Rules

- Do not create aliases for every subfolder.
- Alias does not grant architectural permission.
- `@features/attendance/internal/...` is still a forbidden cross-feature import if it bypasses public API.
- Keep Metro/Babel/TypeScript/test resolver config synchronized.

---

# 35. Circular Dependency Rules

Bad:

```text
feature A
  ↓
feature B
  ↓
feature A
```

Common causes:

- feature-to-feature private imports;
- overused barrels;
- shared file importing a feature;
- domain module importing UI;
- service importing store while store imports service.

## Resolution strategies

1. Identify the actual shared contract.
2. Move only that stable contract to the proper shared/domain layer.
3. Or move orchestration upward to `app`.
4. Or inject a callback/interface.
5. Replace internal barrel imports with direct imports.
6. Split mutually dependent responsibilities if ownership is mixed.

Do not create a meaningless `shared/common.ts` merely to hide a cycle.

## CI recommendation

Add a dependency-cycle check once the codebase is large enough to benefit. Architecture rules remain mandatory even without tooling.

---

# 36. Error Handling

Errors have owners.

## Transport errors

Normalize near HTTP infrastructure:

```text
infrastructure/http/mapHttpError.ts
```

Examples:

- timeout;
- offline;
- HTTP status;
- malformed response.

## Domain errors

Feature domain:

```text
features/high-knee/domain/highKnee.errors.ts
```

Examples:

- invalid calibration state;
- impossible session transition.

## Native capability errors

Normalize at native adapter boundary:

```text
CameraPermissionDenied
CameraUnavailable
NativeModelInitializationFailed
```

Feature then maps these into business/user behavior.

## Global error boundary

Use:

```text
app/error-boundary/
```

for render-level unexpected failure containment.

## User-facing mapping

Do not make every Screen invent its own translation from technical error to message.

Use:

- common mapping for global technical errors;
- feature mapper for feature-specific semantics.

## Logging

Unexpected errors should go through global logging/crash reporting with privacy/redaction policy.

---

# 37. Environment Management

Support at least:

```text
development
staging
production
```

## Config location

```text
src/config/
├── env.schema.ts
├── env.ts
├── featureFlags.ts
└── appConfig.ts
```

## Principles

- validate required configuration during bootstrap;
- expose a typed config object;
- do not read raw environment variables throughout the app;
- separate secrets from client-visible config;
- remember that values shipped in a mobile binary are not truly secret.

## Never commit real secrets

Do not commit:

- private API keys that grant privileged access;
- service-account secrets;
- signing credentials;
- production private tokens.

Use CI/secret management and platform tooling.

---

# 38. Example Feature — CRUD/API: `fitness-record`

This example demonstrates a server-backed CRUD feature without unnecessary repository/service layers.

## Tree

```text
src/features/fitness-record/
├── api/
│   ├── fitnessRecordApi.ts
│   ├── fitnessRecord.dto.ts
│   └── fitnessRecord.mapper.ts
├── components/
│   ├── FitnessRecordCard.tsx
│   ├── FitnessRecordFilter.tsx
│   └── FitnessRecordForm/
│       ├── FitnessRecordForm.tsx
│       └── FitnessRecordForm.test.tsx
├── domain/
│   ├── fitnessRecord.types.ts
│   ├── calculateFitnessLevel.ts
│   └── calculateFitnessLevel.test.ts
├── hooks/
│   ├── useFitnessRecords.ts
│   ├── useCreateFitnessRecord.ts
│   ├── useUpdateFitnessRecord.ts
│   └── useDeleteFitnessRecord.ts
├── schemas/
│   └── fitnessRecord.schema.ts
├── screens/
│   └── FitnessRecordHistoryScreen.tsx
└── index.ts
```

## File responsibilities

### `api/fitnessRecordApi.ts`

Owns remote calls:

```ts
getList(params)
create(input)
update(id, input)
remove(id)
```

It imports the global HTTP client. It does not render UI or calculate fitness level.

### `api/fitnessRecord.dto.ts`

Defines transport shapes such as:

```ts
FitnessRecordResponseDto
CreateFitnessRecordRequestDto
```

### `api/fitnessRecord.mapper.ts`

Maps API transport representation into domain representation when needed.

### `domain/fitnessRecord.types.ts`

Defines business-facing model:

```ts
interface FitnessRecord { ... }
```

This file should not include HTTP client configuration.

### `domain/calculateFitnessLevel.ts`

Pure business rule:

```text
duration + amount + skill policy
→ fitness level / qualification
```

It is **not** a generic `shared/utils` function because its meaning is Fitness business logic.

### `hooks/useFitnessRecords.ts`

Connects the chosen server-state library to:

```text
fitnessRecordApi.getList
```

Owns query key conventions for this feature.

### mutation hooks

Own cache invalidation/optimistic behavior for create/update/delete.

### `schemas/fitnessRecord.schema.ts`

Owns form/input validation. It may produce form types but should not redefine domain semantics unnecessarily.

### `FitnessRecordForm`

Feature component. It remains feature-local even if several screens use it.

### `FitnessRecordHistoryScreen`

Route-level composition:

```text
filters
+ query hook
+ loading/error/empty states
+ list/table/cards
+ navigation/modal state
```

It does not directly call `httpClient`.

## Why no repository?

If the feature only reads/writes one backend and server-state cache is handled by query tooling, a repository would add a pass-through layer without meaningful abstraction.

Add a repository later only if real requirements appear, e.g.:

```text
remote API
+
SQLite/offline source
+
sync/conflict strategy
```

## Public API

Example `index.ts`:

```ts
export { FitnessRecordHistoryScreen } from './screens/FitnessRecordHistoryScreen'
export type { FitnessRecord } from './domain/fitnessRecord.types'
```

Do not export every internal hook unless another feature genuinely needs it.

---

# 39. Example Feature — Device Heavy: `high-knee`

This example demonstrates camera, native/on-device ML, state-machine logic, platform integration, and UI composition.

## Tree

```text
src/features/high-knee/
├── assets/
│   └── models/
│       └── pose-landmarker-full.task
├── components/
│   ├── CameraPanel.tsx
│   ├── HighKneeCounter.tsx
│   ├── ResultPanel.tsx
│   └── SessionControls.tsx
├── domain/
│   ├── highKnee.types.ts
│   ├── highKnee.constants.ts
│   ├── highKneeCounter.ts
│   ├── highKneeCounter.test.ts
│   ├── highKneeSessionMachine.ts
│   └── highKneeSessionMachine.test.ts
├── hooks/
│   └── useHighKneeSession.ts
├── native/
│   ├── poseLandmarker.types.ts
│   ├── poseLandmarkerAdapter.ts
│   ├── poseLandmarkerAdapter.ios.ts
│   ├── poseLandmarkerAdapter.android.ts
│   └── highKneeFramePipeline.ts
├── screens/
│   └── HighKneeScreen/
│       ├── HighKneeScreen.tsx
│       └── styles.ts
├── services/
│   └── highKneeSessionService.ts       # only if orchestration warrants it
└── index.ts
```

## Architecture flow

```text
HighKneeScreen
      ↓
useHighKneeSession
      ├──────────────→ generic camera capability (if shared)
      │
      ├──────────────→ poseLandmarkerAdapter
      │
      ├──────────────→ highKneeFramePipeline
      │
      └──────────────→ highKneeSessionMachine / highKneeCounter
```

## Responsibility split

### `HighKneeScreen.tsx`

Owns route-level presentation and screen composition.

It should not implement pose math.

### `CameraPanel.tsx`

Owns High Knee camera presentation:

- preview;
- orientation layout;
- mirror presentation;
- overlays;
- local controls.

If a generic camera preview later appears in multiple features, extract only the truly generic primitive.

### `useHighKneeSession.ts`

Owns React integration and lifecycle orchestration:

- prepare;
- start;
- pause;
- resume;
- finish;
- reset;
- switch camera;
- cleanup on unmount/background;
- expose stable view/actions to UI.

It may call domain functions and native adapters, but pose-counting math should remain outside the hook.

### `highKneeSessionMachine.ts`

Pure state-transition rules:

```text
IDLE
→ MODEL_READY
→ CAMERA_READY
→ LINE_EDIT
→ RUNNING
→ PAUSED
→ FINISHED
```

Exact states are project-specific, but transitions should be centralized when session complexity warrants it.

### `highKneeCounter.ts`

Pure counting algorithm/state:

- landmark interpretation;
- threshold crossing;
- debounce/state;
- count invariants.

This allows deterministic tests without a camera.

### `poseLandmarkerAdapter.*`

Own native/platform differences for pose inference.

If both platforms use identical RN library behavior, a single adapter may be enough. Do not create platform files without actual differences.

### `highKneeFramePipeline.ts`

Owns the technical pipeline between camera frames and normalized pose samples if complexity is significant.

It must not own UI or remote API CRUD.

## Kotlin/Swift MediaPipe wrapper

If direct native MediaPipe is required:

```text
android/app/src/main/java/<package>/highknee/
├── HighKneePoseModule.kt
└── HighKneePosePackage.kt

ios/<App>/HighKnee/
└── HighKneePoseModule.swift
```

TS-side owner remains:

```text
src/features/high-knee/native/
```

### Rule

Native code performs platform/native computation. TypeScript domain code owns platform-independent business semantics whenever feasible.

## Camera sharing decision

If only High Knee uses camera:

```text
features/high-knee/native/camera...
```

is acceptable.

If Attendance and Profile also use camera with the same acquisition/permission contract:

```text
src/native/camera/
```

should own generic camera capability, while High Knee keeps:

```text
features/high-knee/native/highKneeFramePipeline.ts
```

This is the intended **reuse without leaking domain** pattern.

## Platform variants

Do not create:

```text
poseLandmarkerAdapter.ios.ts
poseLandmarkerAdapter.android.ts
```

merely to match a tree. Create them only when implementation differs.

## ML asset ownership

A pose model used only by High Knee belongs under the feature. If later several features use the exact same model/runtime contract, evaluate promotion of the model loader/runtime—not automatically every feature pipeline.


# 40. Example File Placement Cases

The following cases are intended as classification examples for developers and AI agents.

## Case 01 — Global Button

**Input:** I need a Button used across the app.  
**Decision:** Shared generic UI.  
**Path:** `src/shared/ui/Button.tsx`  
**Reason:** Domain-agnostic primitive with application-wide reuse.  
**Reuse consideration:** Search existing design-system/button wrappers first; extend them before creating another button.

## Case 02 — Fitness Record Form

**Input:** I need `FitnessRecordForm` only for Fitness Record.  
**Decision:** Feature component.  
**Path:** `src/features/fitness-record/components/FitnessRecordForm/FitnessRecordForm.tsx`  
**Reason:** Business semantics and validation belong to Fitness Record.  
**Reuse consideration:** Reuse shared form primitives, not the whole feature form.

## Case 03 — Generic Date Formatter

**Input:** I need `formatDate` used across several features.  
**Decision:** Shared utility.  
**Path:** `src/shared/utils/formatDate.ts`  
**Reason:** Pure and domain-agnostic.  
**Reuse consideration:** If formatting policy differs by domain, keep separate named formatters.

## Case 04 — Calculate Fitness Level

**Input:** I need `calculateFitnessLevel`.  
**Decision:** Fitness domain function.  
**Path:** `src/features/fitness-record/domain/calculateFitnessLevel.ts`  
**Reason:** Encodes business policy.  
**Reuse consideration:** Do not promote merely because Attendance may also calculate a “level”; compare semantic rules.

## Case 05 — High Knee Session Hook

**Input:** I need `useHighKneeSession`.  
**Decision:** Feature hook.  
**Path:** `src/features/high-knee/hooks/useHighKneeSession.ts`  
**Reason:** Owns High Knee session lifecycle.  
**Reuse consideration:** Extract only generic camera/app-lifecycle primitives if other features need them.

## Case 06 — Camera Permission Hook for High Knee Only

**Input:** High Knee needs camera permission handling.  
**Decision:** Start feature-local.  
**Path:** `src/features/high-knee/hooks/useCameraPermission.ts` or feature native module.  
**Reason:** One consumer and potentially feature-specific UX policy.  
**Reuse consideration:** Promote capability-level permission handling if another feature uses the same contract.

## Case 07 — Camera Permission Used by Three Features

**Input:** High Knee, Attendance, and Profile need the same camera permission mechanism.  
**Decision:** Shared native/infrastructure capability.  
**Path:** `src/native/camera/useCameraPermission.ts` or `src/infrastructure/permissions/cameraPermission.ts`  
**Reason:** Mechanism is cross-feature.  
**Reuse consideration:** Feature-specific denial/remediation policy stays local.

## Case 08 — Fitness List Endpoint

**Input:** Call `/fitness-record` list endpoint.  
**Decision:** Feature API.  
**Path:** `src/features/fitness-record/api/fitnessRecordApi.ts`  
**Reason:** Endpoint belongs to feature data boundary.  
**Reuse consideration:** Reuse the global HTTP client.

## Case 09 — Axios/Fetch Client

**Input:** Create an HTTP client with auth header and timeout.  
**Decision:** Global infrastructure.  
**Path:** `src/infrastructure/http/httpClient.ts`  
**Reason:** Cross-cutting transport mechanism.  
**Reuse consideration:** All feature APIs should reuse it.

## Case 10 — Auth Token Storage

**Input:** Securely persist auth token.  
**Decision:** Storage infrastructure, possibly exposed through Authentication service.  
**Path:** `src/infrastructure/storage/secureStorage.ts` plus auth-owned policy if needed.  
**Reason:** Storage mechanism is global; token lifecycle policy belongs to auth.  
**Reuse consideration:** Do not let every feature call SecureStore directly.

## Case 11 — `StudentSummary` Used by Fitness and Attendance

**Input:** Both features use the same `StudentSummary` semantic contract.  
**Decision:** Cross-feature domain contract.  
**Path:** `src/shared/domain/student/StudentSummary.ts` or equivalent shared-domain structure.  
**Reason:** Stable entity meaning spans features.  
**Reuse consideration:** Confirm fields/semantics are actually identical before extraction.

## Case 12 — API-specific Student DTO

**Input:** Fitness API returns `student_summary` transport payload.  
**Decision:** Fitness API DTO.  
**Path:** `src/features/fitness-record/api/fitnessRecord.dto.ts`  
**Reason:** Transport representation belongs at boundary.  
**Reuse consideration:** Map to shared `StudentSummary` if appropriate.

## Case 13 — High Knee Camera Panel

**Input:** Camera panel with counter overlay and High Knee line.  
**Decision:** Feature UI.  
**Path:** `src/features/high-knee/components/CameraPanel.tsx`  
**Reason:** Contains High Knee semantics.  
**Reuse consideration:** Compose generic preview primitive if one exists.

## Case 14 — Generic Camera Preview

**Input:** Multiple features need a raw camera preview with no business overlay.  
**Decision:** Cross-feature native/UI capability.  
**Path:** `src/native/camera/CameraPreview.tsx` or `src/shared/ui/CameraPreview.tsx` depending on whether it owns device behavior.  
**Reason:** Contract is capability-level.  
**Reuse consideration:** Keep device acquisition separate from pure display if responsibilities differ.

## Case 15 — Kotlin MediaPipe Wrapper for High Knee

**Input:** A Kotlin wrapper exposes MediaPipe pose inference only for High Knee.  
**Decision:** Native implementation + High Knee TS adapter.  
**Path:** Android native source under `android/.../highknee/`; TS contract under `src/features/high-knee/native/`.  
**Reason:** Platform implementation is native; business ownership remains High Knee.  
**Reuse consideration:** Do not put it in global native until another feature shares the same runtime contract.

## Case 16 — Swift MediaPipe Wrapper

**Input:** iOS equivalent of Case 15.  
**Decision:** Native implementation + same TS feature boundary.  
**Path:** `ios/.../HighKnee/HighKneePoseModule.swift` and `src/features/high-knee/native/`.  
**Reason:** Same architecture across platforms.  
**Reuse consideration:** Exports must satisfy the same TypeScript contract.

## Case 17 — iOS/Android Camera Adapter Differs

**Input:** Camera initialization behavior differs substantially by platform.  
**Decision:** Platform files.  
**Path:** `cameraAdapter.ios.ts`, `cameraAdapter.android.ts` under the owning native capability.  
**Reason:** Prevent scattered platform conditions.  
**Reuse consideration:** Keep identical exports.

## Case 18 — Tiny Platform Style Difference

**Input:** Only shadow/elevation differs.  
**Decision:** Keep one component and use `Platform.select`.  
**Path:** Existing component styles.  
**Reason:** Separate files would add unnecessary indirection.  
**Reuse consideration:** No abstraction required.

## Case 19 — Profile Screen

**Input:** New Profile route.  
**Decision:** Feature screen.  
**Path:** `src/features/profile/screens/ProfileScreen.tsx`  
**Reason:** Route-level UI owned by Profile.  
**Reuse consideration:** Compose shared UI.

## Case 20 — Expo Router Profile Route

**Input:** Expo Router needs `app/(app)/profile.tsx`.  
**Decision:** Thin route adapter.  
**Path:** root `app/(app)/profile.tsx` importing feature screen.  
**Reason:** Filesystem route is router concern.  
**Reuse consideration:** Do not duplicate the screen implementation in route file.

## Case 21 — React Navigation Params

**Input:** Define root navigator params.  
**Decision:** Navigation contract.  
**Path:** `src/navigation/navigation.types.ts`  
**Reason:** Global route contract.  
**Reuse consideration:** Feature-specific nested params can be colocated if navigation setup supports it.

## Case 22 — High Knee Count Threshold

**Input:** `HIGH_KNEE_MIN_CONFIDENCE`.  
**Decision:** Feature/domain constant.  
**Path:** `src/features/high-knee/domain/highKnee.constants.ts`  
**Reason:** Business/algorithm semantics.  
**Reuse consideration:** Do not move to global constants.

## Case 23 — API Timeout

**Input:** `API_TIMEOUT`.  
**Decision:** HTTP/config infrastructure.  
**Path:** `src/infrastructure/http/` or typed `src/config/` depending on whether runtime-configurable.  
**Reason:** Transport setting.  
**Reuse consideration:** One global policy unless endpoint exception is justified.

## Case 24 — Default Page Size for Fitness UI

**Input:** Fitness History uses `DEFAULT_PAGE_SIZE = 20`.  
**Decision:** Feature constant if this is feature UX policy.  
**Path:** `src/features/fitness-record/.../fitnessRecord.constants.ts`  
**Reason:** Feature ownership.  
**Reuse consideration:** Promote only if pagination policy truly becomes shared.

## Case 25 — Global Pagination Response Contract

**Input:** All APIs return the exact same pagination envelope.  
**Decision:** HTTP/shared data contract.  
**Path:** `src/infrastructure/http/pagination.types.ts` if transport-specific.  
**Reason:** Common backend transport contract.  
**Reuse consideration:** Keep domain pagination model separate if UI/domain semantics diverge.

## Case 26 — Fitness Validation Schema

**Input:** Create/update form validation.  
**Decision:** Feature schema.  
**Path:** `src/features/fitness-record/schemas/fitnessRecord.schema.ts`  
**Reason:** Business input contract.  
**Reuse consideration:** Compose shared primitives such as generic date validators if already present.

## Case 27 — Email Validator Used Globally

**Input:** Generic email syntax validation used in Auth and Profile.  
**Decision:** Shared validation utility/schema only if same policy.  
**Path:** e.g. `src/shared/domain/validation/email.schema.ts`  
**Reason:** Cross-feature semantic contract.  
**Reuse consideration:** Corporate-email policy may remain feature/domain-specific.

## Case 28 — Feature Analytics Event

**Input:** Track `high_knee_session_finished`.  
**Decision:** Event definition feature-local; transport global.  
**Path:** feature analytics module + `infrastructure/analytics/analyticsClient.ts`  
**Reason:** Event semantics belong to feature.  
**Reuse consideration:** Reuse global client and common metadata.

## Case 29 — Global Crash Logger

**Input:** Integrate crash reporting.  
**Decision:** Logging infrastructure.  
**Path:** `src/infrastructure/logging/`  
**Reason:** Application-wide technical capability.  
**Reuse consideration:** Feature code calls stable logger abstraction.

## Case 30 — High Knee Pose Normalization

**Input:** Normalize MediaPipe landmarks into feature coordinate model.  
**Decision:** High Knee native/domain boundary.  
**Path:** `src/features/high-knee/native/normalizePoseLandmarks.ts` if adapting native output; domain if purely business coordinate semantics.  
**Reason:** Owner determined by boundary responsibility.  
**Reuse consideration:** Promote only if another feature consumes same normalized pose contract.

## Case 31 — `useDebounce`

**Input:** Search fields in several features need debounce.  
**Decision:** Shared hook.  
**Path:** `src/shared/hooks/useDebounce.ts`  
**Reason:** Domain-agnostic React behavior.  
**Reuse consideration:** Search for existing hook/library before writing.

## Case 32 — Fitness Search Hook

**Input:** Debounced fitness search with query key and API call.  
**Decision:** Feature hook.  
**Path:** `src/features/fitness-record/hooks/useFitnessRecords.ts`  
**Reason:** Generic debounce is shared; business query remains local.  
**Reuse consideration:** Compose `useDebounce`.

## Case 33 — Notification Device Token Registration

**Input:** Register push token.  
**Decision:** Notification infrastructure.  
**Path:** `src/infrastructure/notifications/registerPushToken.ts`  
**Reason:** Device/platform mechanism.  
**Reuse consideration:** Feature notification preferences remain feature/domain policy.

## Case 34 — Attendance Notification Content

**Input:** Generate attendance-specific notification body.  
**Decision:** Attendance feature.  
**Path:** `src/features/attendance/...`  
**Reason:** Business wording/rules belong to Attendance.  
**Reuse consideration:** Reuse global notification sender.

## Case 35 — Local High Knee Instruction Image

**Input:** Image explaining knee position used nowhere else.  
**Decision:** Feature asset.  
**Path:** `src/features/high-knee/assets/high-knee-guide.png`  
**Reason:** Feature ownership.  
**Reuse consideration:** No global asset promotion needed.

## Case 36 — App Logo

**Input:** Global logo used in splash/header/login.  
**Decision:** Global asset.  
**Path:** `assets/images/app-logo.png`  
**Reason:** Application-wide identity.  
**Reuse consideration:** Centralize to avoid duplicates.

## Case 37 — Modal Primitive

**Input:** Many features need modal shell.  
**Decision:** Shared UI.  
**Path:** `src/shared/ui/Modal/`  
**Reason:** Generic interaction primitive.  
**Reuse consideration:** Business confirmation copy/actions remain feature components.

## Case 38 — Delete Fitness Confirmation Modal

**Input:** Fitness-specific delete confirmation.  
**Decision:** Feature component composing shared Modal.  
**Path:** `src/features/fitness-record/components/DeleteFitnessRecordDialog.tsx`  
**Reason:** Business semantics.  
**Reuse consideration:** Reuse shared modal/confirm primitive if available.

## Case 39 — Offline Fitness Repository

**Input:** Fitness records support API + SQLite sync.  
**Decision:** Introduce feature repository/data-source boundary.  
**Path:** `features/fitness-record/data/` or equivalent documented feature data structure.  
**Reason:** Multiple data sources now justify abstraction.  
**Reuse consideration:** Do not create repository globally.

## Case 40 — New Unknown File: `frameScheduler.ts`

**Input:** Schedule camera-frame processing only for High Knee.  
**Decision:** Feature technical/application module.  
**Path:** closest High Knee owner, likely `native/` or service based on responsibility.  
**Reason:** Narrowest valid scope.  
**Reuse consideration:** Do not promote until another frame-processing consumer exists.

---

# 41. Common Architecture Mistakes

## 41.1 Giant `components/`
Problem: mixes unrelated business UI.  
Fix: move feature UI to feature ownership; keep only generic primitives shared.

## 41.2 Giant `utils/`
Problem: semantic dumping ground.  
Fix: classify each function as domain rule, formatter, parser, adapter, config, or service.

## 41.3 Giant `types/`
Problem: destroys ownership and causes accidental coupling.  
Fix: colocate DTO/domain/view/form/navigation types with owners.

## 41.4 Giant `services/`
Problem: “service” loses meaning.  
Fix: feature APIs, application services, and infrastructure adapters get distinct owners.

## 41.5 Business logic inside Screen
Problem: hard to test, reuse, and reason about.  
Fix: extract pure domain rules and lifecycle orchestration appropriately.

## 41.6 API calls directly everywhere
Problem: inconsistent error handling/cache/auth.  
Fix: feature API modules reuse global HTTP client.

## 41.7 Duplicated hooks
Problem: diverging behavior and bugs.  
Fix: reuse generic primitives or unify identical feature responsibilities.

## 41.8 Duplicated UI
Problem: inconsistent design/behavior.  
Fix: reuse design primitives; do not over-generalize business components.

## 41.9 Duplicated validators
Problem: contracts drift.  
Fix: share validation only when semantic policy is truly shared.

## 41.10 Duplicated DTO
Problem: transport models drift.  
Fix: centralize only if backend contract is genuinely common; endpoint-specific DTOs may correctly differ.

## 41.11 Premature shared component
Problem: business props leak into shared API.  
Fix: keep local until abstraction is stable.

## 41.12 Cross-feature private imports
Problem: bounded ownership disappears.  
Fix: use public contract, shared domain concept, route contract, or app orchestration.

## 41.13 Circular dependency
Problem: brittle initialization and hidden coupling.  
Fix: correct ownership/direction instead of hiding cycle.

## 41.14 Scattered `Platform.OS`
Problem: platform behavior becomes impossible to audit.  
Fix: adapters/platform files for substantial differences.

## 41.15 One file per tiny function
Problem: excessive navigation/indirection.  
Fix: split by responsibility and reuse, not ideology.

## 41.16 God hook
Problem: one hook owns camera, ML, API, storage, analytics, and UI transitions.  
Fix: hook orchestrates stable modules rather than implementing all of them.

## 41.17 God component
Problem: UI and side effects are intertwined.  
Fix: split by cohesive responsibilities.

## 41.18 Overuse Context
Problem: unrelated state becomes app-global and rerenders broadly.  
Fix: keep state local/feature-scoped; choose state tool based on lifecycle.

## 41.19 Barrel-file abuse
Problem: cycles and opaque import graph.  
Fix: use barrels only as intentional public boundaries.

## 41.20 Abstraction with one speculative consumer
Problem: unnecessary concepts and rigid APIs.  
Fix: local implementation first.

## 41.21 Business code in `shared`
Problem: shared layer becomes a disguised feature.  
Fix: demote to owner.

## 41.22 Empty folders for “architecture completeness”
Problem: noise and false expectations.  
Fix: create folders only when code needs them.

## 41.23 Mirroring backend layers mechanically
Problem: frontend/mobile architecture becomes over-engineered.  
Fix: use repository/service/domain layers only when their responsibilities exist.

## 41.24 Native SDK called directly from many screens
Problem: lifecycle/errors/platform differences are duplicated.  
Fix: adapter boundary.

## 41.25 DTO used as domain model everywhere
Problem: backend changes leak across UI/domain.  
Fix: map at boundary when semantics/invariants differ.

---

# 42. New File Checklist

Before creating a new source file:

- [ ] Can I describe its responsibility in one sentence?
- [ ] Which feature/domain/infrastructure capability owns it?
- [ ] Have I searched the repository for exact and similar implementations?
- [ ] Can I reuse an existing implementation?
- [ ] Can I extend an existing abstraction?
- [ ] Can I compose existing building blocks instead?
- [ ] Is the target scope the narrowest valid scope?
- [ ] Does it truly belong in `shared`?
- [ ] Does the destination folder match responsibility?
- [ ] Does the filename communicate responsibility?
- [ ] Am I duplicating a type or schema?
- [ ] Am I duplicating a business rule?
- [ ] Am I duplicating a UI pattern?
- [ ] Am I duplicating API transport logic?
- [ ] Does it introduce feature-to-feature private imports?
- [ ] Could it create a circular dependency?
- [ ] Should business logic be separated from React/UI?
- [ ] Does it require `.ios/.android` isolation?
- [ ] Does it require actual native Kotlin/Swift implementation?
- [ ] Does resource lifecycle/cleanup need explicit handling?
- [ ] Does the file need its own test?
- [ ] Would colocation be clearer than a new folder?
- [ ] If it is a public API, are exports intentionally minimal?
- [ ] If I am moving functionality into shared, are there ≥2 real consumers or a global responsibility?
- [ ] If the file is long, is its cohesion still high?
- [ ] If the file is short, does it nevertheless contain multiple ownerships?

---

# 43. New Folder Checklist

AI agents and developers must not create architecture concepts casually.

Before creating a folder:

- [ ] Does this folder represent a clear responsibility?
- [ ] Is that responsibility materially different from existing folders?
- [ ] Does an existing owner already fit these files?
- [ ] Is there more than one meaningful file likely to live here?
- [ ] If there is only one file, would colocation be clearer?
- [ ] Is this a feature sub-capability or an entirely new top-level layer?
- [ ] Would creating this folder make dependency direction clearer?
- [ ] Does the name use established terminology?
- [ ] Does it avoid vague names such as `misc`, `common2`, `helpers`, `core-new`?
- [ ] If it is a new top-level concept, has this rulebook been updated?
- [ ] Is the folder required by tooling rather than architecture? If so, document that distinction.
- [ ] Is the folder going to remain empty? If yes, do not create it.

---

# 44. Refactor / Move File Rules

When a file is found in the wrong place:

1. Identify the actual responsibility.
2. Identify the correct owner.
3. Search all imports.
4. Search all runtime/dynamic consumers.
5. Search tests.
6. Check whether move reveals a reuse/refactor opportunity.
7. Define destination using this rulebook.
8. Move the file.
9. Update imports.
10. Update public barrel exports if relevant.
11. Update path aliases only if architecture requires it.
12. Update tests/fixtures.
13. Check platform-specific sibling files.
14. Check native registration references if applicable.
15. Check for circular dependencies.
16. Run TypeScript typecheck.
17. Run lint.
18. Run relevant tests.
19. Run platform builds if native resolution changed.
20. Remove the old duplicate.
21. Update architecture docs if the move changes a convention.

## Never

- leave a compatibility duplicate indefinitely without an explicit migration reason;
- move files only to make folders visually balanced;
- introduce a new shared abstraction solely because moving caused an import error;
- change public feature API accidentally.

---

# 45. Reuse Audit Before Creating New Code

Before creating a:

```text
component
hook
service
API module
schema
type
native adapter
utility
store
```

search at least:

```text
exact name
similar responsibility
same business noun
same API endpoint
same UI pattern
same validation rule
same native capability
same type shape
same lifecycle behavior
```

## Reuse decision matrix

| Existing implementation | Action |
|---|---|
| Same responsibility + same contract | Reuse directly |
| Same core + minor configurable difference | Extend via explicit prop/option if semantic |
| Same building blocks, different business wrapper | Compose |
| Duplicated stable common core across features | Extract common abstraction |
| Looks similar but business meanings differ | Keep separate |
| Existing implementation is wrong owner | Refactor/move, then reuse |
| Existing abstraction is bloated | Consider demotion/splitting before adding more branches |

## Mandatory rule

Do not knowingly create a second implementation when the first can be reused safely without corrupting ownership or semantics.

---

# 46. Instructions for AI Coding Agents

The following instructions are normative.

> **AI-001 — Search before create.**  
> Before creating a new file, search the repository for equivalent or related implementations.

> **AI-002 — Reuse before recreate.**  
> Prefer reuse, extension, or composition over a duplicate implementation.

> **AI-003 — Identify owner.**  
> Every new non-trivial file must have a business or infrastructure owner.

> **AI-004 — Prefer narrow scope.**  
> When placement is ambiguous, colocate with the owning feature rather than promoting to shared.

> **AI-005 — Shared is earned.**  
> Do not place code in shared merely because it might be reused in the future.

> **AI-006 — Do not invent folders.**  
> Do not create a new top-level folder when an existing architectural layer already expresses the responsibility.

> **AI-007 — Do not create empty architecture.**  
> Never create empty feature subfolders to make a template look complete.

> **AI-008 — Respect dependency direction.**  
> Shared/infrastructure modules must not depend on feature implementations.

> **AI-009 — Respect feature boundaries.**  
> Do not import another feature's private internals.

> **AI-010 — Separate domain from UI.**  
> Keep testable business logic out of Screens/components when practical.

> **AI-011 — Separate transport from domain.**  
> Do not treat API DTOs as universal domain models without evaluating semantics.

> **AI-012 — Separate capability from policy.**  
> Shared native/permission/storage mechanisms must not absorb feature-specific business policy.

> **AI-013 — Isolate platform differences.**  
> Prefer `.ios/.android` adapters for substantial differences instead of repeated `Platform.OS`.

> **AI-014 — Do not over-layer.**  
> Do not add repository + service + datasource layers for a simple single-backend CRUD feature without a real requirement.

> **AI-015 — Do not split mechanically.**  
> Split by responsibility, ownership, lifecycle, side effect, or reuse—not merely line count.

> **AI-016 — Promote only proven reuse.**  
> When a local implementation gains multiple real consumers with the same contract, evaluate promotion.

> **AI-017 — Demote polluted shared code.**  
> If shared code becomes feature-specific, move it back to the owner.

> **AI-018 — Do not abstract unrelated business rules.**  
> Similar-looking code is not enough to justify common abstraction.

> **AI-019 — Keep public APIs narrow.**  
> Do not export feature internals by default.

> **AI-020 — Update architecture docs when conventions change.**  
> Do not silently establish a new source architecture pattern.

## Required AI output before significant source creation

For non-trivial work, the agent should internally or in implementation notes record:

```text
Existing implementation searched:
Owner:
Responsibility:
Reuse scope:
Layer:
Platform scope:
Lifecycle:
Chosen path:
Why not shared:
Why reuse/extension was or was not possible:
Tests:
```

---

# 47. AI Placement Rules — Compact Reference

These rules are machine-oriented classification rules.

```text
RULE-001:
IF file is used by exactly one feature
THEN colocate inside that feature.

RULE-002:
IF file is used by multiple files in exactly one feature
THEN keep it inside that feature.

RULE-003:
IF UI component is domain-agnostic AND reusable across features
THEN place in shared/ui.

RULE-004:
IF UI component contains feature-specific business nouns or policy
THEN keep it in the owning feature.

RULE-005:
IF logic communicates with a feature backend endpoint
THEN place it in the owning feature API/data layer.

RULE-006:
IF logic configures generic HTTP transport
THEN place it in infrastructure/http.

RULE-007:
IF logic is pure business policy for one feature
THEN place it in that feature's domain layer.

RULE-008:
IF a type represents an API transport shape
THEN keep it at the feature/API transport boundary.

RULE-009:
IF a type is a stable domain concept genuinely shared by multiple features
THEN consider shared/domain.

RULE-010:
IF a type is used only by one component or function
THEN colocate it unless extraction improves clarity.

RULE-011:
IF code contains JSX
THEN use .tsx.

RULE-012:
IF code contains no JSX
THEN use .ts.

RULE-013:
IF iOS and Android implementations differ substantially
THEN prefer .ios.ts/.android.ts or .ios.tsx/.android.tsx.

RULE-014:
IF platform difference is tiny and cohesive
THEN a small Platform.select/Platform.OS branch is acceptable.

RULE-015:
IF a native capability is used by only one feature
THEN keep the TS-facing integration under features/<feature>/native.

RULE-016:
IF the same native capability contract is used by multiple features
THEN consider promotion to src/native/<capability>.

RULE-017:
IF actual implementation requires Kotlin/Java
THEN place platform code under android/ and expose it through the owning TS native adapter.

RULE-018:
IF actual implementation requires Swift/Objective-C
THEN place platform code under ios/ and expose it through the owning TS native adapter.

RULE-019:
IF an equivalent implementation already exists
THEN reuse or extend it before creating new code.

RULE-020:
IF two implementations share responsibility AND semantic contract
THEN consider extracting a reusable abstraction.

RULE-021:
IF two implementations only look similar but represent different business rules
THEN keep them separate.

RULE-022:
IF a shared module has one remaining business-specific consumer
THEN consider demoting it to that feature.

RULE-023:
IF a shared abstraction imports feature code
THEN architecture is invalid; move or redesign the boundary.

RULE-024:
IF feature A imports feature B private internals
THEN replace with public contract, shared domain concept, navigation contract, or app orchestration.

RULE-025:
IF placement is ambiguous
THEN choose the narrowest valid scope with correct ownership.

RULE-026:
IF a new top-level folder represents no documented architecture concept
THEN do not create it.

RULE-027:
IF a feature subfolder would be empty
THEN do not create it.

RULE-028:
IF a file has multiple unrelated responsibilities
THEN split by responsibility even if the file is short.

RULE-029:
IF a file is long but highly cohesive with one responsibility
THEN line count alone does not require a split.

RULE-030:
IF a service only forwards API calls one-to-one
THEN remove the redundant service layer unless another responsibility exists.

RULE-031:
IF a repository has only one datasource and no meaningful abstraction requirement
THEN repository may be over-engineering.

RULE-032:
IF remote + local/offline datasources exist
THEN a repository/data-source boundary becomes reasonable.

RULE-033:
IF state is server-authoritative
THEN prefer server-state/query ownership over duplicating it into generic global client state.

RULE-034:
IF state is screen-only
THEN keep it screen-local unless lifecycle/reuse requires promotion.

RULE-035:
IF state spans a feature lifecycle
THEN place store/orchestration inside that feature.

RULE-036:
IF state/config is application-wide lifecycle composition
THEN app/provider or appropriate infrastructure owner may own it.

RULE-037:
IF a value changes by environment/build channel
THEN treat it as config, not a semantic constant.

RULE-038:
IF a stable semantic value is feature-specific
THEN keep it with that feature.

RULE-039:
IF an asset is used only by one feature
THEN colocate it with that feature when toolchain permits.

RULE-040:
IF an asset is app-wide identity/design infrastructure
THEN place it in global assets.

RULE-041:
IF a unit/component test tests one source module
THEN colocate it with source.

RULE-042:
IF a test spans multiple feature modules
THEN place it in feature __tests__.

RULE-043:
IF a test covers end-to-end app behavior
THEN place it under repository-level e2e.

RULE-044:
IF a barrel is not an intentional public boundary
THEN do not add index.ts merely for shorter imports.

RULE-045:
IF internal feature code imports its own public barrel
THEN prefer direct internal imports to reduce circular dependency risk.

RULE-046:
IF native/device resources require explicit cleanup
THEN lifecycle cleanup must be owned and tested.

RULE-047:
IF business behavior differs from device capability
THEN keep capability generic and policy feature-local.

RULE-048:
IF error is transport-level
THEN normalize at HTTP/infrastructure boundary.

RULE-049:
IF error expresses business rule failure
THEN define/map it in the owning feature domain/application layer.

RULE-050:
IF a new convention contradicts this rulebook
THEN update the rulebook through an architecture decision before normalizing the new pattern.
```

---

# 48. Placement Score

When two or more paths are plausible, score each candidate.

## Criteria

Score 0–5:

| Criterion | Meaning |
|---|---|
| Ownership fit | How clearly the folder owns the business/technical responsibility |
| Responsibility fit | How well folder semantics match what file does |
| Reuse-scope fit | Whether scope is neither too broad nor too narrow |
| Dependency direction | Whether imports remain valid and acyclic |
| Discoverability | Whether a new developer/AI would look there first |
| Platform fit | Whether platform-specific behavior is isolated correctly |
| Testability | Whether placement supports clean tests |
| Coupling | Higher score = less unnecessary coupling |
| Cohesion | Whether neighboring files change for related reasons |

## Weighted heuristic

```text
PlacementScore =
  OwnershipFit        × 3
+ ResponsibilityFit   × 3
+ DependencyDirection × 3
+ ReuseScopeFit       × 2
+ Cohesion            × 2
+ Discoverability     × 1
+ PlatformFit         × 1
+ Testability         × 1
+ LowCoupling         × 2
```

Maximum with 0–5 scoring: 90.

## Hard gates

A high numeric score cannot override:

- forbidden dependency;
- shared importing feature;
- wrong business owner;
- platform implementation impossible at that path;
- toolchain-required location.

## Example — `useHighKneeSession.ts`

Candidates:

```text
A. src/shared/hooks/useHighKneeSession.ts
B. src/features/high-knee/hooks/useHighKneeSession.ts
```

B wins because:

- ownership = High Knee;
- semantics are feature-specific;
- only High Knee consumes it;
- promoting to shared would broaden scope without reuse.

## Decision principle

> Choose the location with the highest ownership/responsibility fit and valid dependency direction, while using the narrowest scope necessary.

---

# 49. Architecture Decision Formula

Use:

```text
Placement =
Ownership
+ Responsibility
+ Reuse Scope
+ Layer
+ Platform Scope
+ Lifecycle
+ Dependency Direction
```

## Example — High Knee camera session

```text
Ownership       = High Knee
Responsibility  = application/device session orchestration
Reuse Scope     = feature-local
Layer           = application hook
Platform        = shared RN layer calling adapters
Lifecycle       = screen/feature session
Dependency      = feature → native/domain/shared

→ src/features/high-knee/hooks/useHighKneeSession.ts
```

## Example — `formatDate`

```text
Ownership       = none / domain-agnostic
Responsibility  = formatting
Reuse Scope     = cross-feature
Layer           = shared utility
Platform        = both
Lifecycle       = pure/stateless
Dependency      = no feature dependency

→ src/shared/utils/formatDate.ts
```

## Example — MediaPipe Kotlin bridge

```text
Ownership       = High Knee
Responsibility  = Android native pose inference bridge
Reuse Scope     = feature-local
Layer           = native adapter implementation
Platform        = Android
Lifecycle       = native model/session
Dependency      = native implementation behind TS feature adapter

→ android/.../highknee/HighKneePoseModule.kt
↔ src/features/high-knee/native/mediaPipePose.ts
```

---

# 50. Recommended Final Project Tree

This final tree is intentionally identical in architectural meaning to the rules above. Optional folders are annotated.

```text
project-root/
├── android/                                  # Bare/prebuild only when present
│   └── app/src/main/...                      # Android shell/native integrations
├── ios/                                      # Bare/prebuild only when present
│   └── ...                                   # iOS shell/native integrations
├── app/                                      # Expo Router only
│   ├── _layout.tsx
│   ├── (auth)/
│   └── (app)/
├── assets/
│   ├── fonts/
│   ├── images/
│   ├── icons/
│   └── models/                               # Only globally owned models
├── e2e/
│   ├── flows/
│   ├── fixtures/
│   └── helpers/
├── src/
│   ├── app/
│   │   ├── bootstrap/                        # if bootstrap sequencing exists
│   │   ├── providers/                        # app-wide providers only
│   │   ├── error-boundary/                   # global render boundary
│   │   └── App.tsx
│   │
│   ├── navigation/                           # React Navigation variant
│   │   ├── navigators/
│   │   ├── linking/
│   │   └── navigation.types.ts
│   │
│   ├── routes/                               # optional route adapters if useful
│   │
│   ├── features/
│   │   ├── authentication/
│   │   │   └── ...                           # only needed subfolders
│   │   ├── fitness-record/
│   │   │   ├── api/
│   │   │   │   ├── fitnessRecordApi.ts
│   │   │   │   ├── fitnessRecord.dto.ts
│   │   │   │   └── fitnessRecord.mapper.ts
│   │   │   ├── components/
│   │   │   │   ├── FitnessRecordCard.tsx
│   │   │   │   ├── FitnessRecordFilter.tsx
│   │   │   │   └── FitnessRecordForm/
│   │   │   ├── domain/
│   │   │   │   ├── fitnessRecord.types.ts
│   │   │   │   └── calculateFitnessLevel.ts
│   │   │   ├── hooks/
│   │   │   ├── schemas/
│   │   │   ├── screens/
│   │   │   └── index.ts                      # only if public feature API is needed
│   │   ├── high-knee/
│   │   │   ├── assets/
│   │   │   │   └── models/
│   │   │   ├── components/
│   │   │   ├── domain/
│   │   │   ├── hooks/
│   │   │   ├── native/
│   │   │   ├── screens/
│   │   │   ├── services/                     # only if orchestration warrants it
│   │   │   └── index.ts                      # only if public API is needed
│   │   ├── attendance/
│   │   └── profile/
│   │
│   ├── shared/
│   │   ├── ui/
│   │   ├── hooks/
│   │   ├── domain/
│   │   └── utils/
│   │
│   ├── infrastructure/
│   │   ├── http/
│   │   ├── storage/
│   │   ├── permissions/
│   │   ├── analytics/
│   │   ├── logging/
│   │   ├── notifications/
│   │   └── errors/
│   │
│   ├── native/
│   │   ├── camera/                            # only if cross-feature
│   │   ├── bluetooth/                         # only if cross-feature
│   │   └── sensors/                           # only if cross-feature
│   │
│   ├── config/
│   ├── theme/
│   ├── i18n/
│   └── test/
│       ├── fixtures/
│       ├── mocks/
│       └── render/
│
├── app.config.ts                              # Expo when applicable
├── eas.json                                   # Expo/EAS when applicable
├── tsconfig.json
└── package.json
```

## Final-tree interpretation

This tree does **not** require:

- every feature to contain every subfolder;
- `navigation/` in Expo Router-only projects;
- `app/` root routes in React Navigation-only projects;
- `src/native/camera` when only one feature uses camera;
- `services` or `repository` without real orchestration/data-source complexity.

Optional folders should disappear when unused.

---

# 51. Quick Reference Table

| I want to create... | Put it where | Reuse rule | Notes |
|---|---|---|---|
| Screen | `features/<feature>/screens/` | Feature-local | Route-level UI |
| Expo route file | root `app/` | Thin adapter | Do not duplicate feature screen |
| Feature component | `features/<feature>/components/` | Stay local | Promote only proven generic reuse |
| Screen-only component | beside screen | Narrow scope | Avoid feature components clutter |
| Shared component | `shared/ui/` | Generic + real reuse/design-system primitive | No feature deps |
| Feature API | `features/<feature>/api/` | Reuse global HTTP client | Transport edge |
| HTTP client | `infrastructure/http/` | Global | Auth/timeout/errors |
| Query hook | `features/<feature>/hooks/` | Feature-local | Server-state lifecycle |
| Mutation hook | `features/<feature>/hooks/` | Feature-local | Cache invalidation |
| Business logic | `features/<feature>/domain/` | Share only same semantic contract | Prefer pure |
| Application orchestration | `features/<feature>/services/` | Add only when needed | Side effects/workflow |
| Repository | feature data layer | Only real datasource abstraction | Avoid pass-through |
| API DTO | feature `api/` | Transport-local | Map when needed |
| Domain model | feature `domain/` | Promote if truly cross-feature | Business meaning |
| Shared type | `shared/domain/` or owning infrastructure | Only stable cross-feature semantic contract | Avoid giant types |
| Validation | feature `schemas/` or colocated | Share only same policy | Runtime parsing |
| Feature store | feature `store/` | Feature lifecycle | Avoid global by default |
| Secure storage adapter | `infrastructure/storage/` | Global mechanism | Feature policy separate |
| Native integration, feature-only | `features/<feature>/native/` | Stay local | Example MediaPipe High Knee |
| Native integration, cross-feature | `src/native/<capability>/` | Proven common contract | Example generic camera |
| iOS implementation | `.ios.ts(x)` or `ios/` native | Same TS contract | Depends on implementation level |
| Android implementation | `.android.ts(x)` or `android/` native | Same TS contract | Depends on implementation level |
| Generic hook | `shared/hooks/` | Real reuse/domain-agnostic | `useDebounce` |
| Generic formatter | `shared/utils/` | Real reuse/domain-agnostic | Pure |
| Feature constant | feature owner | Local | Business semantics |
| Runtime env config | `config/` | Global config | Validate at bootstrap |
| Theme token | `theme/` | Global design system | Not feature layout |
| Feature asset | feature `assets/` | Local | If toolchain permits |
| Global asset | root `assets/` | Global | Logo/fonts |
| Unit test | beside source | Local | Preferred |
| Feature integration test | feature `__tests__/` | Feature | Multi-module |
| E2E test | root `e2e/` | App-level | User flow |
| Public feature API | feature `index.ts` | Only intentional exports | Avoid barrel abuse |

---

# 52. Quality Requirements

A compliant architecture/document must satisfy all of the following:

- clear table of contents;
- consistent heading hierarchy;
- directory trees match defined responsibilities;
- examples and anti-examples exist;
- decision tree exists;
- new-file and new-folder checklists exist;
- machine-readable rule IDs exist;
- terminology is not ambiguous;
- `api`, `service`, `repository`, `domain`, `shared`, and `native` have distinct meanings;
- reusability is prioritized without premature abstraction;
- project can begin small without empty enterprise layers;
- architecture can scale without changing ownership philosophy;
- iOS and Android are first-class targets;
- Expo and Bare differences are explicitly isolated;
- Expo Router is not assumed;
- React Navigation is not assumed;
- feature ownership is default;
- local/shared promotion criteria are explicit;
- demotion from shared is supported;
- file splitting is responsibility-driven, not line-count-driven;
- cross-feature dependency rules are explicit;
- native capability and feature policy are separated;
- platform-specific code has a strategy;
- global infrastructure has clear owners;
- DTO/domain/view/form types are distinguished;
- tests have a clear colocation/hybrid strategy;
- public APIs are narrow;
- circular dependency mitigation is documented;
- environment and secret rules are documented;
- AI agents have deterministic placement instructions.

## Architecture review gates

Before accepting a structural change, review:

### Integrity
Does it preserve ownership and dependency direction?

### Maintainability
Can a developer find code by business responsibility?

### Scalability
Can another feature be added without turning shared into a dumping ground?

### Testability
Can domain behavior be tested without rendering/device APIs where practical?

### Reuse
Does the structure encourage reuse of stable contracts without forcing unrelated business rules together?

### Platform isolation
Can Android/iOS differences be understood without scanning unrelated code?

### Complexity
Does every abstraction pay for itself through a real boundary, reuse case, lifecycle, or data-source need?

---

# 53. Core Architecture Principle

The architecture must continue to obey:

```text
Feature-first
+
Colocation
+
Explicit ownership
+
Reuse before recreate
+
Minimal shared surface
+
Clear dependency direction
+
High cohesion
+
Low coupling
+
Platform isolation
+
No premature abstraction
```

The essential question is not:

> “Which folders does a React Native project have?”

It is:

> “When a new file appears, can a developer or AI agent determine its owner, responsibility, reuse scope, layer, platform scope, lifecycle, dependency direction, and therefore its correct location?”

## Final invariant

```text
Correct ownership
> visual symmetry

Proven reuse
> speculative abstraction

Clear responsibility
> generic folder names

Dependency integrity
> convenient imports

Cohesion
> arbitrary file-size limits
```

---

# 54. Final Self-Review

The final architecture has been reviewed against the required classification scenarios.

| # | Question | Resolution |
|---|---|---|
| 1 | Where does `useHighKneeSession.ts` go? | `features/high-knee/hooks/` |
| 2 | Where does generic `Button.tsx` go? | `shared/ui/` |
| 3 | Where does `fitnessRecordApi.ts` go? | `features/fitness-record/api/` |
| 4 | Is `calculateFitnessLevel` domain logic or util? | Feature domain logic |
| 5 | Where does Kotlin MediaPipe wrapper go? | Android native source + High Knee TS native adapter |
| 6 | How are iOS/Android differences handled? | `.ios/.android` for RN modules or actual `ios/android` native source |
| 7 | Can local component be promoted? | Yes, via proven-reuse criteria |
| 8 | Can shared code be demoted? | Yes, when it becomes single-feature/business-specific |
| 9 | Is large file split by line count? | No; responsibility/cohesion dominate |
| 10 | Can AI create arbitrary top-level folder? | No; new architecture concept must be justified/documented |
| 11 | Can Feature A import Feature B internals? | No |
| 12 | Where does shared domain type go? | `shared/domain` only with genuine cross-feature semantics |
| 13 | Does Expo Router change feature architecture? | No; route adapter changes, business architecture remains |
| 14 | Must AI search before creating implementation? | Yes |
| 15 | Are similar-looking different business rules forced together? | No |
| 16 | Can one-consumer utility be put in shared? | Default no |
| 17 | Can proven common abstraction be promoted? | Yes |
| 18 | Are multi-responsibility files split? | Yes, by responsibility/ownership |
| 19 | Can a short file still need splitting? | Yes, if it mixes ownership/responsibilities |
| 20 | Can a long cohesive file remain intact? | Yes, with clear responsibility |

## Final AI execution checklist

When asked to add anything to this project, execute:

```text
SEARCH
  ↓
CLASSIFY RESPONSIBILITY
  ↓
IDENTIFY OWNER
  ↓
IDENTIFY REUSE SCOPE
  ↓
IDENTIFY LAYER
  ↓
IDENTIFY PLATFORM + LIFECYCLE
  ↓
REUSE / EXTEND / COMPOSE?
  ├─ YES → use existing architecture
  └─ NO
      ↓
CHOOSE NARROWEST VALID PATH
      ↓
CHECK SPLIT
      ↓
CHECK DEPENDENCY DIRECTION
      ↓
CHECK TESTS
      ↓
IMPLEMENT
      ↓
TYPECHECK + TEST + PLATFORM VALIDATION
```

## Final rule

> **Reuse before recreate, but do not generalize before necessary. Choose the narrowest valid scope with correct ownership.**

---

## Change Governance

This document is an architecture contract. If the project introduces a new repeated concept that does not fit these rules:

1. do not silently invent a folder;
2. record the new responsibility and use cases;
3. evaluate whether an existing layer can own it;
4. evaluate dependency direction;
5. review coupling and reuse scope;
6. update this rulebook;
7. then normalize the new convention across the repository.

Architecture should evolve deliberately, not accidentally.


---

# Appendix A — Detailed Feature Subfolder Contracts

This appendix is normative and expands Section 6/7 so AI agents can classify feature files without guessing.

## `src/features/<feature>/api/`

### Purpose
Own remote-transport operations and API-boundary representations for exactly one feature.

### Put here
- endpoint functions;
- request/response DTOs;
- API parameter serializers;
- transport-to-domain mappers;
- feature query-key helpers when they are transport-specific.

### Do NOT put here
- React hooks;
- UI state;
- business policy calculations;
- global HTTP client configuration;
- generic authentication interceptors.

### Naming convention
```text
<feature>Api.ts
<feature>.dto.ts
<feature>.mapper.ts
```

### Internal structure
For a small feature, keep files directly under `api/`. Create endpoint subfolders only when the API surface becomes genuinely large.

### Allowed dependencies
`infrastructure/http`, feature domain contracts, config where unavoidable.

### Forbidden dependencies
Feature screens/components, app composition, another feature's private API.

### Reuse rules
Reuse the global HTTP client. Do not share feature endpoints merely because paths look similar. Promote transport contracts only when backend semantics are truly common.

### When to create a new file
Split DTOs/mappers from API functions when transport models become large, mapping is non-trivial, or tests benefit.

### When NOT to create a new file
A tiny endpoint with one local request type may remain in one `Api.ts` file.

### Keywords
`endpoint`, `GET`, `POST`, `request`, `response`, `DTO`, `serialize`, `deserialize`, `remote`.

### Examples
`fitnessRecordApi.ts`, `fitnessRecord.dto.ts`.

### Wrong placement examples
`useFitnessRecords.ts` here — it is a React lifecycle hook.

---

## `src/features/<feature>/components/`

### Purpose
Own feature-specific reusable/sub-view UI.

### Put here
- feature cards;
- filters;
- forms;
- business-specific dialogs;
- feature visualizations.

### Do NOT put here
- route-level screens;
- generic design-system primitives;
- HTTP calls;
- pure domain calculations.

### Naming convention
`PascalCase.tsx`. Use a component folder when component has meaningful companion styles/tests/subcomponents.

### Internal structure
```text
components/
├── FitnessRecordCard.tsx
└── FitnessRecordForm/
    ├── FitnessRecordForm.tsx
    ├── styles.ts
    └── FitnessRecordForm.test.tsx
```

### Allowed dependencies
Feature hooks/domain/types/schemas, shared UI, theme, i18n.

### Forbidden dependencies
Another feature's private components; raw global platform internals when an adapter exists.

### Reuse rules
Reuse shared primitives aggressively. Keep feature composition local. Promote only when business semantics disappear and contract is genuinely generic.

### When to create a new file
When a visual unit has clear responsibility, independent testability, or feature-wide reuse.

### When NOT to create a new file
Do not extract every JSX fragment. Screen-local subviews may stay beside the screen.

### Keywords
`card`, `form`, `filter`, `panel`, `dialog`, `counter`, `list item`.

### Examples
`FitnessRecordForm.tsx`, `HighKneeCounter.tsx`.

### Wrong placement examples
`Button.tsx` duplicated here when a global design-system Button already exists.

---

## `src/features/<feature>/screens/`

### Purpose
Own route-level feature UI.

### Put here
- navigable screens;
- screen-only subviews;
- route-param adaptation when not handled by router adapter;
- screen-local styles.

### Do NOT put here
- reusable generic UI;
- raw transport client;
- native SDK implementation;
- domain algorithms.

### Naming convention
`<Capability><Purpose>Screen.tsx`.

### Internal structure
Simple screen:
```text
screens/
└── ProfileScreen.tsx
```

Complex screen:
```text
screens/
└── HighKneeScreen/
    ├── HighKneeScreen.tsx
    ├── CameraPanel.tsx
    └── styles.ts
```

### Allowed dependencies
Feature public/internal modules, shared UI/hooks, navigation contract, theme/i18n.

### Forbidden dependencies
Another feature's private internals; direct Android/iOS implementation details.

### Reuse rules
Screens themselves are usually not shared. Extract reusable subviews/logic at the correct narrower abstraction boundary.

### When to create a new file
A route or large screen-local subview with independent responsibility.

### When NOT to create a new file
Do not split a cohesive screen into dozens of trivial one-use components.

### Keywords
`screen`, `route`, `page`, `view`, `route params`.

### Examples
`FitnessRecordHistoryScreen.tsx`.

### Wrong placement examples
`calculateFitnessLevel.ts` under screens.

---

## `src/features/<feature>/hooks/`

### Purpose
Integrate feature behavior with React lifecycle/subscriptions.

### Put here
- server-state query/mutation hooks;
- feature session hooks;
- feature device lifecycle hooks;
- feature-level UI/application state hooks.

### Do NOT put here
- pure functions that do not use React;
- raw HTTP client;
- giant orchestration that can be decomposed into domain/service/native modules.

### Naming convention
`use<Responsibility>.ts`.

### Internal structure
Keep flat until several hook categories make a real grouping necessary.

### Allowed dependencies
Feature API/domain/services/store/native; shared hooks; infrastructure abstractions.

### Forbidden dependencies
App bootstrap; other feature private hooks.

### Reuse rules
A generic extracted lifecycle primitive may move to `shared/hooks` or capability owner. Feature semantics remain local.

### When to create a new file
When React lifecycle integration is a distinct public/feature concern.

### When NOT to create a new file
A three-line local state helper used by one component may remain inside it.

### Keywords
`use`, `query`, `mutation`, `session`, `subscription`, `effect`, `lifecycle`.

### Examples
`useFitnessRecords.ts`, `useHighKneeSession.ts`.

### Wrong placement examples
A pure `calculateScore()` function here.

---

## `src/features/<feature>/domain/`

### Purpose
Own business meaning, invariants, pure policies, state transitions, and feature domain models.

### Put here
- domain model;
- calculations;
- qualification rules;
- state machines;
- value-object-like validation;
- domain errors.

### Do NOT put here
- React;
- navigation;
- HTTP client;
- platform SDK calls;
- analytics transport.

### Naming convention
Name by business concept/responsibility, not `helpers`.

### Internal structure
Prefer cohesive files. Add subfolders only for genuinely large domain modules.

### Allowed dependencies
Pure TypeScript, stable shared domain contracts.

### Forbidden dependencies
Screens/components/hooks, app, transport/native implementation.

### Reuse rules
Do not promote domain rules across features until ubiquitous language and contract genuinely match.

### When to create a new file
When policy/state machine/model forms a coherent independently testable concept.

### When NOT to create a new file
Tiny types/functions may remain with their owning domain module.

### Keywords
`calculate`, `qualify`, `policy`, `rule`, `state machine`, `invariant`, `model`.

### Examples
`calculateFitnessLevel.ts`, `highKneeSessionMachine.ts`.

### Wrong placement examples
`formatDate` with no domain semantics; place generic formatting elsewhere.

---

## `src/features/<feature>/services/`

### Purpose
Own feature application orchestration with side effects across several modules/capabilities.

### Put here
- multi-step use-case orchestration;
- synchronization workflows;
- coordination among API, storage, analytics, native capabilities;
- application command handlers where appropriate.

### Do NOT put here
- 1:1 wrappers around API functions;
- generic platform infrastructure;
- pure business calculations.

### Naming convention
`<UseCase>Service.ts` or descriptive operation module. Avoid vague `Manager`.

### Internal structure
Create only when real orchestration exists.

### Allowed dependencies
Feature API/domain/native, infrastructure abstractions.

### Forbidden dependencies
Feature UI, app bootstrap.

### Reuse rules
Services are feature-owned by default. Extract a shared infrastructure primitive rather than sharing a whole business service.

### When to create a new file
When orchestration has independent lifecycle/error/transaction semantics and is more complex than a hook calling an API.

### When NOT to create a new file
When implementation is `return featureApi.getX()`.

### Keywords
`orchestrate`, `workflow`, `sync`, `use case`, `coordinate`.

### Examples
`highKneeSessionService.ts` only if session orchestration cannot remain cleanly in hook/domain/native modules.

### Wrong placement examples
`httpClient.ts` as a feature service.

---

## `src/features/<feature>/store/`

### Purpose
Own feature-scoped client state that must be shared beyond one component tree or outlive a screen appropriately.

### Put here
- feature Zustand/Redux/Jotai modules;
- selectors;
- feature client-state actions;
- persisted feature-state adapter if feature-specific.

### Do NOT put here
- server cache copied unnecessarily;
- screen-only booleans;
- global app providers;
- API transport.

### Naming convention
`<feature>.store.ts`, selectors by responsibility.

### Internal structure
Library-specific grouping is allowed, but ownership remains feature-local.

### Allowed dependencies
Feature domain types; infrastructure persistence abstraction if required.

### Forbidden dependencies
Screens/components in store core; another feature's private store.

### Reuse rules
Do not promote a store globally because two screens in the same feature use it.

### When to create a new file
When state has feature-level lifecycle/coordination or needs non-local subscription.

### When NOT to create a new file
Use local React state for screen/component-local interaction.

### Keywords
`store`, `client state`, `selector`, `draft`, `session state`.

### Examples
`highKnee.store.ts` if session state truly needs store semantics.

### Wrong placement examples
Putting backend `fitnessRecords[]` into global store when server-state query cache is authoritative.

---

## `src/features/<feature>/schemas/`

### Purpose
Own runtime parsing and validation contracts for feature inputs/data boundaries.

### Put here
- form schemas;
- command/input validation;
- feature parser schemas.

### Do NOT put here
- pure UI;
- API request functions;
- unrelated global validators.

### Naming convention
`<concept>.schema.ts`.

### Internal structure
One file is enough until multiple independent schemas justify more.

### Allowed dependencies
Feature/shared domain types and schema library.

### Forbidden dependencies
React rendering, navigation.

### Reuse rules
Compose generic schema primitives where useful; do not share business validation that merely looks similar.

### When to create a new file
When validation is reused, complex, or a runtime boundary deserves explicit contract.

### When NOT to create a new file
Simple one-off local input checks may stay colocated.

### Keywords
`schema`, `parse`, `validate`, `safeParse`, `form validation`.

### Examples
`fitnessRecord.schema.ts`.

### Wrong placement examples
`env.schema.ts` here; that belongs to global `config`.

---

## `src/features/<feature>/types/`

### Purpose
Optional home for multiple cohesive feature type modules when colocating all types elsewhere becomes noisy.

### Put here
Feature-level application/view types not better owned by `api`, `domain`, navigation, or component.

### Do NOT put here
Every type indiscriminately.

### Naming convention
`<concept>.types.ts`.

### Internal structure
Keep flat; if domain/API meaning is clear, use those folders instead.

### Allowed dependencies
Feature/shared type contracts.

### Forbidden dependencies
Runtime side-effect modules merely to obtain values.

### Reuse rules
Types shared across features require semantic review before promotion.

### When to create a new file
When a meaningful group of types is shared across several feature modules.

### When NOT to create a new file
A prop type used in one component stays with that component.

### Keywords
`type`, `interface`, `union`, `view model`, `form model`.

### Examples
`highKnee.types.ts` if not better placed in domain/native.

### Wrong placement examples
Root-level feature DTOs that actually belong in `api/`.

---

## `src/features/<feature>/utils/`

### Purpose
Optional feature-local home for pure support functions that are neither domain policy nor generic shared utilities.

### Put here
Pure transformations with multiple feature-local consumers.

### Do NOT put here
Business rules, API calls, storage, vague miscellaneous code.

### Naming convention
Prefer responsibility filenames over `utils.ts`.

### Internal structure
Keep small.

### Allowed dependencies
Feature/shared pure contracts.

### Forbidden dependencies
UI and side effects unless the function's real responsibility is misclassified.

### Reuse rules
Promote only if domain-agnostic and reused across features.

### When to create a new file
When a pure feature-local transform has a meaningful reusable responsibility.

### When NOT to create a new file
If one consumer exists, colocate first.

### Keywords
`normalize`, `format`, `map`, `sort`, where semantics are feature-support rather than policy.

### Examples
`formatFitnessMetric.ts`.

### Wrong placement examples
`calculateFitnessLevel.ts` here when it is a domain rule.

---

## `src/features/<feature>/constants/`

### Purpose
Optional grouping for feature-owned semantic constants.

### Put here
Stable feature values shared across multiple feature files.

### Do NOT put here
environment/build values, theme tokens, unrelated enums.

### Naming convention
`<feature>.constants.ts` or narrower concept file.

### Internal structure
Usually a file is preferable to a folder until multiple concepts exist.

### Allowed dependencies
Ideally none/pure types.

### Forbidden dependencies
Runtime service state.

### Reuse rules
A constant becoming cross-feature must be reviewed for shared semantics; do not simply move it because two files reference it.

### When to create a new file
Several meaningful feature constants exist or one constant is used broadly.

### When NOT to create a new file
A single local constant can stay near its consumer.

### Keywords
`default`, `limit`, `threshold`, `confidence`.

### Examples
`highKnee.constants.ts`.

### Wrong placement examples
`API_BASE_URL` here.

---

## `src/features/<feature>/native/`

### Purpose
Own feature-specific JS/TS adapters around native/device capabilities and native-result normalization.

### Put here
- MediaPipe adapter for High Knee;
- feature-specific frame processor;
- native-event bridge;
- feature-owned platform variants.

### Do NOT put here
Cross-feature generic camera/BLE capability once common contract is proven; domain calculation that does not need native data source details.

### Naming convention
Descriptive adapter/capability names with optional platform suffix.

### Internal structure
```text
native/
├── poseLandmarker.types.ts
├── poseLandmarkerAdapter.ios.ts
├── poseLandmarkerAdapter.android.ts
└── highKneeFramePipeline.ts
```

### Allowed dependencies
RN/native modules, feature domain contracts, infrastructure logging/errors.

### Forbidden dependencies
Feature Screen internals; another feature.

### Reuse rules
Promote only the common capability/runtime contract, not business pipeline.

### When to create a new file
Platform implementation, lifecycle boundary, or native-output adapter has independent responsibility.

### When NOT to create a new file
Do not create `.ios/.android` pairs when code is identical.

### Keywords
`camera`, `frame`, `native module`, `bridge`, `MediaPipe`, `sensor`, `adapter`.

### Examples
`poseLandmarkerAdapter.android.ts`.

### Wrong placement examples
`HighKneeCounter.ts` if it is pure business logic.

---

## `src/features/<feature>/assets/`

### Purpose
Own feature-specific static resources.

### Put here
instruction images, feature animations, feature-only ML models when bundling permits.

### Do NOT put here
app logo, global fonts, generic icons.

### Naming convention
Descriptive `kebab-case` resource names.

### Internal structure
Group by type only when there are enough files to benefit (`images/`, `models/`).

### Allowed dependencies
N/A; assets are consumed by feature source.

### Forbidden dependencies
N/A.

### Reuse rules
Promote asset only when ownership becomes app-wide or genuinely cross-feature.

### When to create a new file
When the feature needs a bundled resource.

### When NOT to create a new file
Do not duplicate an existing global asset.

### Keywords
`image`, `animation`, `audio`, `model`, `guide`.

### Examples
`high-knee-guide-front.png`.

### Wrong placement examples
global app logo under a feature.

---

## `src/features/<feature>/__tests__/`

### Purpose
Own integration tests spanning multiple modules of one feature.

### Put here
feature flow tests, integration tests, feature-level fixtures used only there.

### Do NOT put here
all unit tests; E2E app flows.

### Naming convention
`<flow>.test.ts(x)`.

### Internal structure
Keep shallow unless fixtures/helpers become meaningful.

### Allowed dependencies
Feature public/internal test targets and test infrastructure.

### Forbidden dependencies
Production modules importing this test folder.

### Reuse rules
Shared test helpers should move to `src/test` when reuse is real.

### When to create a new file
When a behavior requires testing interaction among multiple feature modules.

### When NOT to create a new file
Unit test should stay beside source.

### Keywords
`integration`, `flow`, `feature test`.

### Examples
`createFitnessRecordFlow.test.ts`.

### Wrong placement examples
Detox/Maestro full E2E flow here.

---

# Appendix B — Detailed Global Folder Contracts

## `src/navigation/`

### Purpose
Own React Navigation composition, route contracts, and linking.

### Put here
navigators, linking config, navigation types.

### Do NOT put here
business logic, feature screens' implementation, API calls.

### Naming convention
`RootNavigator.tsx`, `MainNavigator.tsx`, `navigation.types.ts`.

### Internal structure
Create only subfolders that match active navigation setup.

### Allowed dependencies
Feature screens/public APIs, app theme/auth contracts.

### Forbidden dependencies
Domain modules depending back on navigation.

### Reuse rules
Navigation is app composition, not a reusable business module.

### When to create a new file
Distinct navigator/linking contract has independent responsibility.

### When NOT to create a new file
Do not create a navigator per feature without a real navigation boundary.

### Keywords
`stack`, `tab`, `route`, `linking`, `deep link`.

### Examples
`RootNavigator.tsx`.

### Wrong placement examples
`fitnessRecordApi.ts`.

---

## `src/config/`

### Purpose
Own typed application configuration and environment validation.

### Put here
env schema, runtime config object, build-channel selection, feature flags.

### Do NOT put here
feature constants, secrets hardcoded in source.

### Naming convention
`env.ts`, `env.schema.ts`, `featureFlags.ts`, `appConfig.ts`.

### Internal structure
Keep small and explicit.

### Allowed dependencies
Environment/runtime config library, logging during validation.

### Forbidden dependencies
Feature modules.

### Reuse rules
Global by responsibility.

### When to create a new file
A configuration concern has distinct validation/ownership.

### When NOT to create a new file
Do not split each config property into a file.

### Keywords
`environment`, `config`, `base URL`, `flag`, `build`.

### Examples
`env.schema.ts`.

### Wrong placement examples
`HIGH_KNEE_MIN_CONFIDENCE`.

---

## `src/theme/`

### Purpose
Own design-system tokens and global theme contracts.

### Put here
colors, spacing, typography, radii, semantic theme mapping.

### Do NOT put here
feature-specific screen styles or business values.

### Naming convention
lower camel-case `.ts` modules; exported token names descriptive.

### Internal structure
One module per token family if useful.

### Allowed dependencies
Pure TypeScript/design-system libraries.

### Forbidden dependencies
Features.

### Reuse rules
Global by design-system responsibility.

### When to create a new file
Token family/theme mode has coherent scope.

### When NOT to create a new file
One local margin value is not a token file.

### Keywords
`color`, `spacing`, `typography`, `radius`, `theme`.

### Examples
`spacing.ts`.

### Wrong placement examples
High Knee calibration line position.

---

## `src/i18n/`

### Purpose
Own locale detection, translation engine setup, and shared language infrastructure.

### Put here
i18n instance, locale resolver, shared translations, registration.

### Do NOT put here
business logic.

### Naming convention
Use locale standards such as `vi.json`, `en.json` if JSON resources are used.

### Internal structure
Depends on i18n library; keep feature translations feature-local when supported and register them here.

### Allowed dependencies
config/storage for locale preference, translation library.

### Forbidden dependencies
Feature implementation cycles.

### Reuse rules
Infrastructure is global; feature vocabulary may stay feature-owned.

### When to create a new file
New locale or shared translation namespace exists.

### When NOT to create a new file
Do not duplicate same translation namespace by feature without ownership reason.

### Keywords
`locale`, `translation`, `language`, `i18n`.

### Examples
`i18n.ts`, `localeResolver.ts`.

### Wrong placement examples
feature calculation rules.

---

## `src/test/`

### Purpose
Own cross-feature reusable test infrastructure.

### Put here
custom render, app test providers, mock server setup, widely reused builders.

### Do NOT put here
all tests indiscriminately.

### Naming convention
By test responsibility: `renderWithProviders.tsx`, `mockServer.ts`.

### Internal structure
`fixtures/`, `mocks/`, `render/` only when used.

### Allowed dependencies
test libraries, app/shared contracts needed for test composition.

### Forbidden dependencies
Production code importing test utilities.

### Reuse rules
Promote test helper only with real reuse.

### When to create a new file
Reusable test behavior exists.

### When NOT to create a new file
Single-test helper stays local.

### Keywords
`mock`, `fixture`, `builder`, `test render`.

### Examples
`renderWithProviders.tsx`.

### Wrong placement examples
a production `formatDate` helper.

---

# Appendix C — Offline / Local Data Evolution Rule

The simple feature architecture should evolve only when data requirements evolve.

## Stage 1 — Remote-only

```text
Screen
→ query hook
→ feature API
→ HTTP client
```

Use this by default for ordinary CRUD.

## Stage 2 — Remote + persisted query cache

```text
Screen
→ query hook
→ feature API
→ HTTP client

Query cache persistence
→ app provider
→ infrastructure/storage
```

This still does not automatically require a Repository.

## Stage 3 — True multi-source/offline domain

```text
Screen
→ feature hook
→ application service
→ repository contract
   ├─ remote data source
   └─ local database data source
→ sync/conflict policy
```

At this stage, creating:

```text
features/<feature>/data/
├── <feature>Repository.ts
├── remote/
└── local/
```

is justified.

### Rule

> Add a layer when a new responsibility exists, not when a diagram looks more professional.

---

# Appendix D — Architecture Review Checklist

Use this checklist for structural pull requests or AI-generated architecture changes.

## Ownership
- [ ] Does every new file have one clear owner?
- [ ] Has feature code accidentally been promoted to shared?
- [ ] Has global infrastructure accidentally been duplicated inside features?

## Dependency
- [ ] Does shared import any feature?
- [ ] Does one feature import another feature's internal path?
- [ ] Has a barrel introduced a cycle?
- [ ] Does domain import React/navigation/native SDK?

## Reuse
- [ ] Was repository search performed first?
- [ ] Could existing implementation be reused?
- [ ] Is new shared abstraction backed by real consumers?
- [ ] Are two merely similar business rules being incorrectly unified?

## Complexity
- [ ] Does every service/repository/adapter represent a real boundary?
- [ ] Were folders created only because they contain real responsibilities?
- [ ] Could the design be simpler without losing testability/ownership?

## Native
- [ ] Is capability separated from business policy?
- [ ] Are iOS/Android differences isolated?
- [ ] Is resource cleanup defined?
- [ ] Does the TS adapter clearly map to Kotlin/Swift implementation?

## Documentation
- [ ] If a new architecture concept was introduced, was this rulebook updated?
- [ ] Are examples/public APIs/naming conventions still consistent?

---

# Appendix E — Glossary

| Term | Meaning in this rulebook |
|---|---|
| Owner | Feature/domain/infrastructure capability responsible for a file's meaning and change reasons |
| Feature | Business capability/bounded responsibility, not merely a screen |
| Shared | Proven cross-feature or domain-agnostic reusable code |
| Infrastructure | Global technical mechanism such as HTTP, storage, logging |
| Native capability | Device/OS functionality exposed through a stable TypeScript boundary |
| Domain | Business rules, models, invariants, state transitions |
| Application service | Orchestration of use-case side effects |
| API module | Feature remote transport boundary |
| Repository | Abstraction over multiple/changeable data sources when justified |
| DTO | Transport representation, not automatically a domain model |
| Colocation | Keeping code close to its owning/consuming scope |
| Promotion | Moving local code to broader shared scope after reuse is proven |
| Demotion | Moving shared code back to a narrower owner when generic contract no longer holds |
| Public API | Explicit supported exports of a feature/module |
| Platform variant | `.ios`, `.android`, `.native` implementation selected by platform |
| Narrowest valid scope | Smallest scope that preserves correct ownership and dependency direction |
