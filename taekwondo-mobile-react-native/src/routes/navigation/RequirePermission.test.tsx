import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Permission } from '@/features/authorization';

import { RequirePermission } from './RequirePermission';

jest.mock('@/features/authentication/store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

let currentPermissions: string[] = [];

function mockPermissions(permissions: string[]) {
  currentPermissions = permissions;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useAuthStore } = require('@/features/authentication/store/auth.store') as {
    useAuthStore: jest.Mock;
  };
  useAuthStore.mockImplementation((selector: (state: unknown) => unknown) =>
    selector({ user: { permissions: currentPermissions } }),
  );
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('RequirePermission', () => {
  it('renders children when the permission is granted', async () => {
    mockPermissions([Permission.NOTIFICATION_RECIPIENT_READ]);
    const view = await render(
      <RequirePermission permission={Permission.NOTIFICATION_RECIPIENT_READ}>
        <Text>Secret content</Text>
      </RequirePermission>,
    );
    expect(view.getByText('Secret content')).toBeTruthy();
  });

  it('renders the forbidden fallback instead of silently redirecting', async () => {
    mockPermissions([]);
    const view = await render(
      <RequirePermission permission={Permission.NOTIFICATION_RECIPIENT_READ}>
        <Text>Secret content</Text>
      </RequirePermission>,
    );
    expect(view.getByText('Không có quyền truy cập')).toBeTruthy();
    expect(view.queryByText('Secret content')).toBeNull();
  });
});
