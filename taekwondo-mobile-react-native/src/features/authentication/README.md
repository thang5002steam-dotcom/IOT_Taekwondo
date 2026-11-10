# Authentication

Feature này sở hữu luồng xác thực, phiên đăng nhập, chọn ngữ cảnh và các quy tắc phân quyền.
Nó được port trực tiếp từ auth của `ai-receptionist-web-fe`; bảng truy vết đầy đủ nằm tại
`docs/architecture/AUTH_WEB_TO_MOBILE_PARITY.md`.

## Public API

Consumer bên ngoài feature chỉ import từ `@/features/authentication`:

- Auth route screens và `useAuthenticationRuntime` dùng tại composition root.
- `useAuthSession`, selector auth nhỏ và domain types.

Quyết định UI theo permission nằm ở `@/features/authorization` (`useCan`,
`PermissionGate`, `Permission` catalog) — không đặt logic access trong feature này.

Không export API client, store mutation, service orchestration hoặc storage adapter. Token chỉ được
giữ trong memory store và SecureStore; snapshot không nhạy cảm nằm trong AsyncStorage.

## Dependency direction

`screens/hooks -> services -> api/domain -> infrastructure contracts`. Infrastructure nhận callback
qua injection và không import feature implementation. Expo Router trong `src/app` chỉ dùng public API
của feature và điều phối protected route groups.
