# Auth Web to Mobile Parity

## Source of truth

Thứ tự ưu tiên khi triển khai là backend contract hiện hành, hành vi của
`ai-receptionist-web-fe`, ràng buộc bảo mật/native, rồi mới đến điều chỉnh UX mobile. Web FE là
specification chỉ đọc và không bị sửa trong đợt này.

## Source-to-target checklist

| Web source | Mobile target | Preserved behavior | Platform change | Status |
|---|---|---|---|---|
| `features/auth/api/authApi.ts`, `types/Security/authTypes.ts` | `features/authentication/api`, `domain` | login, logout, refresh, account, contexts, switch-context, logout-all, update-fcm, sessions | mobile login/refresh/logout gửi refresh token trong body; DTO transport tách domain | Ported |
| `features/auth/api/useAuthentication.ts` | `hooks/useAuthentication.ts`, `services/authSessionService.ts` | mutation ordering, local cleanup in logout `finally`, context navigation result | React Query mutation; Expo Router derives destination from auth state | Ported |
| `store/authStore.ts` | `store/auth.store.ts` | user/context/role state and small selectors | no Zustand persistence; tokens remain in memory plus SecureStore | Ported |
| `features/auth/utils/authStorage.ts` | `services/authSessionStorageService.ts` over `infrastructure/storage/*` | migration and session cleanup | feature owns auth keys/envelopes; generic adapters isolate SecureStore and AsyncStorage | Ported |
| `features/auth/utils/authRouting.ts` | `utils/authRouting.ts` | anonymous/context/app destination decision | web URLs map to Expo route groups | Ported |
| `features/auth/utils/authEvents.ts` | injected `invalidateSession(reason)` | one invalid-session transition | typed callback replaces `window` event | Ported |
| `features/auth/utils/authErrors.ts` | `utils/normalizeAuthError.ts` | stable login/auth error messages | Axios errors narrowed from `unknown` | Ported |
| `LoginPage`, `LoginForm`, `AuthLayout`, `LeftPanel` | `screens/LoginScreen.tsx`, auth components | validation, support Zalo, brand, loading and inline errors | React Native primitives, accessible focus/announcement, no SCSS/DOM | Ported |
| `app/providers/AuthBootstrap.tsx` | `services/authSessionService.ts`, `hooks/useAuthenticationRuntime.ts`, `app/providers/AppProviders.tsx` | hydrate, account-first validation, refresh fallback, FCM sync | recoverable offline state and branded bootstrap screen | Ported |
| `lib/axiosInstance.ts` | `infrastructure/http/httpClient.ts` | Bearer injection, single refresh queue, one replay | typed runtime injection; invalid refresh clears session, network error does not | Ported |
| `integrations/firebase/fcm.ts` | `infrastructure/notifications/*` | token sync and refresh listener | RNFirebase adapter, native foreground/background handlers, development build | Ported |
| `RequireAuth`, `RequireContext`, `RequireRole`, `ProtectedRoute` | `src/app/_layout.tsx`, domain role helpers | auth/context/role policy | `Stack.Protected` replaces React Router guards | Ported |
| Sidebar/ProfileHeader logout actions | `components/LogoutButton.tsx`, auth actions | logout and query cleanup | reusable mobile command component | Ported |
| SidebarSettings profile switch | `switchContext` mutation | selected identity changes through backend | local-only `activeProfile` is intentionally removed | Replaced |
| Welcome/Utilities/Personal/nav consumers | feature public API and selectors | consumer-facing user/context/role access | business screens are outside this auth scope | Contract only |
| `userAPI.getUserInfo` legacy bridge | `/auth/account` bootstrap | authoritative account sync | duplicate bridge is intentionally removed | Replaced |

## Mobile-only decisions

- Installation ID uses `expo-crypto.randomUUID()` and is not a hardware identifier.
- Notification permission is best effort and never blocks login.
- Refresh token rotation is persisted before queued requests resume.
- Access/refresh tokens are never stored in AsyncStorage, React Query cache, Zustand persistence,
  logs or route params.
- Profile state (`profiles`, `activeProfile`, `LAST_ACTIVE_PROFILE_ID`) is not ported because
  backend `activeContext` is the single source of truth.

## Verification map

| Requirement | Automated coverage |
|---|---|
| role normalization and auth status derivation | colocated domain tests |
| route parity | `utils/authRouting.test.ts` |
| SecureStore/AsyncStorage boundaries and migration | `services/authSessionStorageService.test.ts` |
| concurrent 401, single refresh, one replay, rejected refresh | `infrastructure/http/httpClient.test.ts` |
| validation, native labels and login payload | `screens/LoginScreen.test.tsx` |
| cold launch/login/restore/context/logout device flow | `e2e/flows/auth-flow.yaml` |

Backend Java compile and tests remain a separate gate because the backend is a sibling repository.
Firebase service files are supplied through EAS file secrets and are intentionally gitignored.
