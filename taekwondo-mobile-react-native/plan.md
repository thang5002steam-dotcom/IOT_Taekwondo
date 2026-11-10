# Plan sửa Auth / Context Selection / Navigation

## 1. Mục tiêu sản phẩm

Luồng chuẩn cần được giữ rõ ràng theo 2 trường hợp khác nhau:

1. **Fresh login**: `LoginScreen -> ContextSelectionScreen -> HomeScreen + AppTabs`.
2. **Khôi phục phiên hợp lệ khi mở lại app**: nếu backend/session đã có `activeContext` hợp lệ thì được vào thẳng app, không bắt chọn lại context.
3. **Đổi hồ sơ từ Home**: `HomeScreen -> ContextSelectionScreen -> HomeScreen`, có thể quay lại Home nếu người dùng chưa chọn context mới.
4. `ContextSelectionScreen` không hiển thị `AppTabs` là hành vi đúng.

Không được còn các lỗi:

- Login xong vào thẳng Home trước khi người dùng chọn context.
- Đang ở Home một lúc/chuyển tab thì tự bật ContextSelection sai thời điểm.
- Nút back xuất hiện nhưng `GO_BACK was not handled by any navigator`.
- Context hiện tại bị disable khiến fresh login không thể xác nhận lại đúng item backend đang đánh dấu active.

## 2. Phạm vi review

- Codebase: `D:\ai-receptionist-web\taekwondo-mobile-react-native`.
- Review theo `code-review`: Standards + Spec.
- Standards source: `docs/architecture/REACT_NATIVE_PROJECT_STRUCTURE.md`, `AGENTS.md`.
- Spec source: yêu cầu sản phẩm hiện tại + `docs/architecture/AUTH_WEB_TO_MOBILE_PARITY.md`.
- Diff tham chiếu để hiểu auth implementation: từ commit cha của `973d851` tới `HEAD`.
## 3. Root cause đã xác định

### P0 — Fresh login đi sai destination

**File:** `src/features/authentication/hooks/useAuthentication.ts`  
**Hàm:** `useLogin()`  
**Liên quan:** `src/features/authentication/utils/authRouting.ts::routeAfterAuthResponse()`

Hiện `useLogin()` dùng chung `routeAfterAuthResponse(response)`. Helper này trả `/(app)` khi backend trả `activeContext != null` và `requiresContextSelection == false`.

Đây là logic hợp lệ cho restore/switch-context, nhưng **không hợp lệ cho fresh login** theo yêu cầu sản phẩm mới. Backend có thể còn active context từ lần sử dụng trước; client vẫn phải yêu cầu người dùng chủ động chọn một context sau mỗi lần đăng nhập bằng credential.

### P0 — Nút back dựa vào sai điều kiện

**File:** `src/features/authentication/screens/ContextSelectionScreen.tsx`  
**Đoạn:** `activeContext ? <Pressable onPress={() => router.back()}>...`

`activeContext` chỉ cho biết backend/session đang có context; nó **không chứng minh navigation stack có history**.

Fresh login dùng `router.replace`, còn `Stack.Protected` có thể xóa history entry khi guard thay đổi. Vì vậy ContextSelection có thể là route đầu tiên nhưng vẫn có `activeContext`, dẫn đến nút back giả và warning `GO_BACK was not handled by any navigator`.
### P1 — `ContextSelectionScreen` không phân biệt 2 entry mode

Màn hình hiện được dùng cho cả:

- bắt buộc chọn context sau login;
- chủ động đổi hồ sơ từ Home.

Nhưng UI chỉ suy luận mode bằng `activeContext`. Hậu quả:

- fresh login có thể hiện back dù không được phép back;
- item trùng `activeContext` bị `selected` và disable, dù fresh login yêu cầu người dùng vẫn phải chủ động chọn item;
- manual switch và mandatory selection đang có navigation policy khác nhau nhưng dùng chung một heuristic.

### P1 — Có đường chuyển status làm app bị đẩy khỏi `(app)`

**Files:**

- `src/features/authentication/services/authSessionService.ts`
- `src/features/authentication/store/auth.store.ts`
- `src/features/authentication/domain/deriveAuthStatus.ts`
- `src/app/_layout.tsx`

`refreshAccessToken()`, `bootstrap()` và `applyAndPersist()` đều có thể apply `activeContext/requiresContextSelection` mới vào store. Nếu response authoritative trả `activeContext=null` hoặc `requiresContextSelection=true`, status đổi từ `authenticated` sang `selecting-context`.

Trong `RootLayout`, guard của `(app)` lập tức thành false; Expo Router sẽ loại protected history của app và chuyển sang route còn hợp lệ. Đây là cơ chế phù hợp với Expo Router, nhưng hiện UI ContextSelection lại giả định vẫn có thể `back()`.
## 4. Phương án sửa đề xuất

### Phase A — Tách quyết định fresh-login khỏi quyết định restore-session

**Mục tiêu:** không ép toàn bộ hệ thống dùng một hàm `routeAfterAuthResponse()` cho mọi auth event.

1. Tạo policy/hàm riêng cho fresh login, ví dụ `routeAfterLogin()` luôn trả `/(context)/select` sau khi login thành công.
2. Giữ policy dựa trên `activeContext + requiresContextSelection` cho bootstrap/refresh/restore và sau `switchContext`.
3. Không chỉnh `deriveAuthStatus()` theo hướng “mọi authenticated session phải selecting-context”, vì sẽ làm cold restore bị bắt chọn context lại không cần thiết.
4. Cập nhật `useLogin()` để điều hướng theo fresh-login policy; `useSwitchContext()` chỉ vào app sau response switch-context hợp lệ.

**Files dự kiến:**

- `src/features/authentication/hooks/useAuthentication.ts`
- `src/features/authentication/utils/authRouting.ts`
- `src/features/authentication/utils/authRouting.test.ts`

### Phase B — Làm rõ entry mode của Context Selection

Context selection cần biết nó đang ở mode nào:

- `mandatory`: fresh login / session hiện không có active context;
- `switch`: người dùng chủ động bấm “Chuyển hồ sơ” từ app.

Ưu tiên giải pháp ít coupling nhất với router state. Có thể suy ra từ auth state + route entry contract hoặc truyền một route param domain-neutral như `mode=switch` từ Home. Không đưa business state vào route params.

Hành vi:

- `mandatory`: không có nút back; item hiện tại không được disable chỉ vì backend còn `activeContext` cũ; người dùng chọn item để xác nhận context.
- `switch`: có nút back khi navigator thực sự có thể back; context hiện tại có thể đánh dấu selected và không cần switch lại.

**Files dự kiến:**

- `src/features/authentication/screens/ContextSelectionScreen.tsx`
- `src/routes/home/HomeScreen.tsx`
- route adapter `src/app/(context)/select.tsx` chỉ thay nếu cần parse/forward param.
### Phase C — Sửa back navigation an toàn

1. Không render nút back chỉ vì `activeContext !== null`.
2. Chỉ cho phép back ở mode `switch` và khi navigator có history hợp lệ (`router.canGoBack()` hoặc contract tương đương của Expo Router SDK 58).
3. Nếu mode `switch` nhưng history không tồn tại do deep-link/restore, fallback phải là `router.replace('/(app)')`, không gọi `router.back()` mù.
4. Với mode `mandatory`, tuyệt đối không cho quay về Login sau khi auth đã thành công; logout phải là action rõ ràng riêng nếu sản phẩm cần.

### Phase D — Làm ổn định auth state khi refresh/bootstrap

1. Giữ `activeContext` từ backend là source of truth cho session đã tồn tại.
2. Audit `persistRotatedSession()` và `applyAndPersist()` để bảo đảm response refresh có đủ fields trước khi ghi đè snapshot.
3. Nếu endpoint `/auth/mobile/refresh` không đảm bảo trả đầy đủ `activeContext/availableContexts/requiresContextSelection`, không được dùng nó như full account snapshot. Sau refresh token nên fetch `/auth/account` trước khi replace auth snapshot, hoặc merge theo contract backend đã xác nhận.
4. Không để partial response vô tình biến `activeContext` thành `null` rồi làm `Stack.Protected` eject `(app)`.
5. Network error không invalidate session; 401/403 refresh rejection mới chuyển anonymous theo policy hiện tại.

**Files dự kiến:**

- `src/features/authentication/services/authSessionService.ts`
- `src/features/authentication/api/auth.dto.ts` nếu cần tách `RefreshResponse` khỏi `AuthResponse`
- `src/features/authentication/store/auth.store.ts`
- tests cho service/store

### Phase E — Giữ Root AuthRouter làm guard, không nhét business flow vào navigator

`src/app/_layout.tsx` tiếp tục chỉ map auth status -> route groups:

- `anonymous` -> `(auth)`
- `selecting-context` -> `(context)`
- `authenticated` -> `(app)`

Sửa overlap guard hiện tại nếu cần để `(context)` không đồng thời là route hợp lệ khi `authenticated`, trừ trường hợp user chủ động mở context switch. Nếu Expo Router cần route `(context)` tồn tại để switch từ app, dùng explicit route policy thay vì guard chồng lấn khó đoán.

Mục tiêu cuối: navigator không tự quyết định fresh login; nó chỉ phản ánh state/policy đã được authentication feature xác định.
## 5. Test plan / tiêu chí nghiệm thu

### Unit / integration

1. `routeAfterLogin()` luôn trả `/(context)/select` với mọi login response hợp lệ.
2. `routeAfterAuthResponse()`/restore policy vẫn trả `/(app)` khi session có active context hợp lệ.
3. `deriveAuthStatus()` giữ đúng 3 trạng thái anonymous / selecting-context / authenticated.
4. Mandatory context selection không render nút back.
5. Switch-context mode chỉ back khi có history; không phát `GO_BACK not handled`.
6. Chọn context gọi đúng `/auth/switch-context`, cập nhật token + snapshot + store rồi vào app.
7. Refresh response partial không được xóa active context hợp lệ ngoài contract.

### E2E bắt buộc sửa

`e2e/flows/auth-flow.yaml` hiện đang làm context selection là optional bằng `runFlow when visible`; phải đổi thành assertion bắt buộc:

- Login thành công -> assert `Bạn muốn thao tác với hồ sơ nào?`.
- Assert bottom tabs/Home chưa hiện.
- Tap context -> assert `Xin chào` và AppTabs hiện.
- Cold relaunch với session + active context -> assert vào Home trực tiếp.
- Từ Home bấm `Chuyển hồ sơ` -> ContextSelection, bấm back -> trở lại Home, không warning.
- Từ Home đổi sang context khác -> Home cập nhật identity/context đúng.

### Regression manual

- Chờ app idle và chuyển qua lại các tab nhiều lần: không tự bật ContextSelection khi backend vẫn xác nhận active context.
- Token hết hạn trong lúc đang ở Home: refresh thành công phải giữ Home/context.
- Backend thu hồi context hoặc account trả `requiresContextSelection=true`: app được chuyển sang ContextSelection, không có AppTabs, không có back vô hiệu.
- Logout từ Home -> Login; back gesture không quay lại app protected.

## 6. Thứ tự implementation khuyến nghị

1. Viết/đổi tests để biểu diễn đúng product contract trước.
2. Tách fresh-login routing policy.
3. Sửa `useLogin()`.
4. Tách mandatory/switch mode của ContextSelection và sửa back.
5. Audit refresh response contract + snapshot overwrite.
6. Rà `Stack.Protected` guards để tránh overlap không cần thiết.
7. Chạy unit tests, typecheck, lint và E2E auth flow.
8. Chạy manual regression trên iOS/Android development build.

## 7. Code-review findings cần đóng

### Standards

- Navigation policy đang bị phân tán giữa `useAuthentication.ts`, `authRouting.ts`, `ContextSelectionScreen.tsx` và root guards: dấu hiệu **Shotgun Surgery / duplicated navigation decision**. Cần mỗi auth event có policy rõ và router chỉ thực thi destination.
- `activeContext` đang bị dùng như proxy cho navigation history trong UI: **Primitive/implicit state assumption**, cần explicit entry mode/history capability.

### Spec

- Fresh login hiện không bắt buộc context selection: **FAIL**.
- ContextSelection không có AppTabs: **PASS**, giữ nguyên.
- Back button có thể gọi `GO_BACK` khi không có navigator history: **FAIL**.
- Existing E2E cho phép bỏ qua context selection nên không bắt được regression: **FAIL**.
- Cold restore vào Home với active context hợp lệ: cần giữ **PASS** sau refactor.

## 8. Definition of Done

Plan được coi là hoàn thành khi toàn bộ điều kiện sau cùng đúng:

- Fresh login luôn dừng ở ContextSelection trước Home.
- Chỉ sau `/auth/switch-context` thành công mới vào Home/AppTabs.
- ContextSelection mandatory không có back; switch mode back an toàn.
- Không còn warning `The action 'GO_BACK' was not handled by any navigator`.
- Không còn hiện tượng idle/tab switch tự bật ContextSelection nếu session/context vẫn hợp lệ.
- Refresh/cold restore giữ context hợp lệ; invalid context chuyển đúng sang ContextSelection.
- Unit/integration/E2E tests phản ánh đúng các contract trên và đều pass.
- Không phá rule kiến trúc: feature auth sở hữu auth policy; route files chỉ là adapter; AppTabs chỉ tồn tại trong `(app)`.
