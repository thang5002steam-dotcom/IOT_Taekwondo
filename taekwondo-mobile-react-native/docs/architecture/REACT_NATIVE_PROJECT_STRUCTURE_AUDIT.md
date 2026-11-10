# Báo cáo rà soát cấu trúc mã nguồn

Ngày rà soát: 2026-10-15  
Phạm vi: toàn bộ `src/`, route entries, platform adapters, cấu hình Expo và test liên quan.

## Phương pháp

- Dùng CodeGraph trên index 571 file để theo symbol, caller và blast radius.
- Kiểm tra toàn bộ file trong `src/routes`, `src/app`, `src/features`, `src/shared` và `src/infrastructure`.
- Tìm API/query mutation trong screen/component, runtime export trong type file, import chéo feature và native-only import lọt vào Web bootstrap.
- Không dùng độ dài file làm lý do tách.

## Kết quả tổng quan

| Nhóm | Trước rà soát | Quyết định |
|---|---|---|
| Route ownership | Home, Activities, Explore, Account nằm trong `src/routes` | Chuyển về feature sở hữu |
| App composition | `AppProviders` nằm trong `src/routes` | Chuyển về `src/app/providers` |
| Screen data logic | Nhiều screen gọi API/cache trực tiếp | Chuyển sang query/mutation hook |
| Attendance | Screen chứa tính toán và optimistic mutation | Tách pure domain rule và orchestration hook |
| Course types | View model do `student-commerce` sở hữu nhầm | Chuyển owner sang `course/domain` |
| Shared UI | Primitive commerce được nhiều feature import chéo | Chuyển implementation sang `shared/ui/commerce` |
| Web bootstrap | SQLite và SecureStore native lọt vào Web | Thêm adapter `.web` |
| Web routing | Static output không phù hợp route đăng nhập động | Chọn `single` và rewrite về `index.html` |
| Unsupported Web route | Có thể nạp màn hình Native chưa được kiểm chứng | Thêm `_layout.web.tsx` với trạng thái rõ ràng |

## Các trường hợp đã sửa

| Nguồn cũ | Trách nhiệm cũ | Owner đích | Quyết định |
|---|---|---|---|
| `src/routes/home/HomeScreen.tsx` | Màn hình nghiệp vụ Home | `features/home/screens` | Di chuyển |
| `src/routes/activities/ActivitiesScreen.tsx` | Danh mục hoạt động và quick actions | `features/activities/screens` | Di chuyển |
| `src/routes/explore/*` | Màn hình/component Explore | `features/explore` | Di chuyển |
| `src/routes/account/*` | Account và hồ sơ cá nhân | `features/user-profile` | Di chuyển |
| `src/routes/providers/AppProviders.tsx` | Composition root | `src/providers` | Di chuyển |
| Template Home/Splash không còn caller | Mã mẫu không thuộc sản phẩm | Không có | Xóa |
| `SessionAttendanceScreen.tsx` | Query, thống kê, optimistic update, API | Hook và pure domain rule | Tách |
| `CourseScreen.tsx` | Query, mapper, cache registration | `queries/courseCatalogQueries.ts` | Tách |
| `AdminCourseDetailScreen.tsx` | Query, delete API, cache mutation | Course query hooks | Tách |
| `CourseCreateSheet.tsx` | Query option và create API | Course query hooks | Tách transport/cache; giữ form state |
| `CourseEditSheet.tsx` | Update API | Course mutation hook | Tách transport; giữ draft/cancel UX |
| `ClassSessionDetailScreen.tsx` | Query API | `queries/classSessionQueries.ts` | Tách |
| Role administration | CRUD và replace permissions | `queries/roleQueries.ts` | Tách |
| Permission administration | Update permission | `queries/permissionQueries.ts` | Tách |
| Position administration | CRUD position | `queries/positionQueries.ts` | Tách |
| User create/detail/edit/profiles/roles | API, mutation và invalidation | `queries/userQueries.ts` | Tách |
| `LinkedPersonDetailSheet.tsx` | Invalidate user cache trực tiếp | `useInvalidateUser` | Tách cache policy |
| `student-commerce/types.ts` | Course view models | `course/domain/course.types.ts` | Chuyển owner |
| `CommerceLayoutPrimitives.tsx` | UI dùng bởi nhiều feature | `shared/ui/commerce/CommercePrimitives.tsx` | Di chuyển implementation |
| Database/SecureStorage logger | Native package trong Web graph | Adapter `.web.ts` | Tách platform |

## Các trường hợp giữ nguyên

| Khu vực | Quyết định | Lý do |
|---|---|---|
| `src/routes/navigation/**` | Giữ | Navigation shell, guard, header và layout dùng chung; đúng owner |
| `src/app/**/*.tsx` route entries | Giữ | Route adapter mỏng, params/guard/re-export |
| DTO liên kết nhiều backend resource | Giữ cạnh endpoint API | Chúng mô tả wire contract |
| `student-commerce` registration orchestration | Giữ feature orchestration | Use case kết hợp student, course, price và wallet; query hooks đã che transport |
| Domain cards của commerce | Giữ feature-local | Component vẫn mang semantics commerce cụ thể |
| Feature constants có enum/label map | Giữ trong `constants/` | Runtime value đúng vai trò |
| State cho sheet, picker, confirm dialog và toast | Giữ trong UI | Chỉ phục vụ interaction/presentation |
| MQTT client | Giữ trong infrastructure | Contract dùng WebSocket và không chứa policy UI |
| File dài nhưng một use case | Giữ | Không tách chỉ theo line count |

## Boundary Web sau rà soát

| Capability | Native | Web |
|---|---|---|
| Database | Expo SQLite | Adapter unavailable/no-op, không import SQLite |
| Secure storage | Expo SecureStore | `sessionStorage`, fallback memory khi SSR |
| Storage diagnostics | AsyncStorage/SecureStore/SQLite | AsyncStorage; báo rõ capability không khả dụng |
| MQTT | Shared MQTT client | Shared client qua `ws://` hoặc `wss://` |
| Authenticated app routes | Stack hiện tại | Unsupported state cho tới khi route được chỉ định |
| Build output | Native bundles | SPA `single` + hosting rewrite |

## Kiểm tra ownership tự động

Truy vấn sau phải tiếp tục trả về rỗng cho production screen:

```powershell
rg -n 'useMutation|useQueryClient|\b[a-zA-Z]+Api\.' src/features src/routes `
  -g '*Screen.tsx' -g '*Screens.tsx'
```

Khi thêm code:

- Nếu screen cần server state, tạo hoặc mở rộng `queries/`.
- Nếu nhiều feature import một visual primitive từ feature khác, đánh giá promote sang `shared/ui`.
- Nếu type có owner tự nhiên, chuyển về owner thay vì đưa vào shared.
- Nếu Web build thấy native package, sửa seam đầu tiên trong import chain.

## Kết quả kiểm chứng

- Typecheck baseline trước thay đổi: pass.
- Web baseline trước thay đổi: fail do `expo-sqlite` yêu cầu `wa-sqlite.wasm`.
- Web export sau adapter: pass, tạo `dist/index.html` và bundle SPA.
- Targeted attendance component tests: pass.
- Course test đã được cập nhật theo query hook mới.
- Lint, full test và typecheck cuối được chạy sau thay đổi cuối; kết quả nằm trong báo cáo thực thi.

## Nợ kỹ thuật được theo dõi

- `student-commerce/types.ts` re-export course view types để giữ public contract trong lần di chuyển này. Caller thuộc course đã chuyển sang owner mới; consumer commerce sẽ đổi khi tách domain commerce thành enrollment, wallet và course package.
- Các domain card trong `StudentCommercePrimitives.tsx` còn là barrel lịch sử. Implementation generic đã chuyển sang shared; domain card cần chuyển theo owner cùng lúc với fixture commerce để tránh tạo bản sao.
- Web chưa có route nghiệp vụ được chỉ định. Khi có, thêm route vào Web layout, test adapter/subscription và browser smoke test trước khi bật.
