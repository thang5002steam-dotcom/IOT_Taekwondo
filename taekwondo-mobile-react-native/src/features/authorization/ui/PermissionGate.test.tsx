import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Permission } from '../domain/permissions';
import { PermissionGate } from './PermissionGate';

jest.mock('@/features/authentication/store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

let currentPermissions: string[] = [];

function mockPermissions(permissions: string[]) {
  currentPermissions = permissions;
  // jest.mock factory is hoisted, so resolve the mocked module lazily here.
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

describe('PermissionGate', () => {
  it('renders children when the permission is granted', async () => {
    mockPermissions([Permission.NOTIFICATION_RECIPIENT_READ]);
    const view = await render(
      <PermissionGate permission={Permission.NOTIFICATION_RECIPIENT_READ}>
        <Text>Allowed</Text>
      </PermissionGate>,
    );
    expect(view.getByText('Allowed')).toBeTruthy();
  });

  it('renders fallback when the permission is missing', async () => {
    mockPermissions([]);
    const view = await render(
      <PermissionGate
        permission={Permission.NOTIFICATION_RECIPIENT_READ}
        fallback={<Text>Forbidden</Text>}
      >
        <Text>Allowed</Text>
      </PermissionGate>,
    );
    expect(view.getByText('Forbidden')).toBeTruthy();
    expect(view.queryByText('Allowed')).toBeNull();
  });
});
