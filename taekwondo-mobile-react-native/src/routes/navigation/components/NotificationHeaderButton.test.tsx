import { render } from '@testing-library/react-native';

import { NotificationHeaderButton } from './NotificationHeaderButton';

jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: jest.fn() }),
}));

jest.mock('@/features/authentication', () => ({
  useAuthSession: jest.fn(),
}));

jest.mock('@/features/notification/store/notification.store', () => ({
  useNotificationStore: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useAuthSession } = require('@/features/authentication') as {
  useAuthSession: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useNotificationStore } = require('@/features/notification/store/notification.store') as {
  useNotificationStore: jest.Mock;
};

function setupSession({
  isAuthenticated,
  unreadCount,
}: {
  isAuthenticated: boolean;
  unreadCount: number;
}) {
  useAuthSession.mockReturnValue({ isAuthenticated });
  useNotificationStore.mockImplementation((selector: (state: unknown) => unknown) =>
    selector({ unreadCount }),
  );
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('NotificationHeaderButton', () => {
  it('renders the inbox badge for an authenticated user without the management permission', async () => {
    setupSession({ isAuthenticated: true, unreadCount: 5 });

    const view = await render(<NotificationHeaderButton />);

    expect(view.getByTestId('notification-header-button')).toBeTruthy();
    expect(view.getByText('5')).toBeTruthy();
  });

  it('caps the badge at 99+', async () => {
    setupSession({ isAuthenticated: true, unreadCount: 128 });

    const view = await render(<NotificationHeaderButton />);

    expect(view.getByText('99+')).toBeTruthy();
  });

  it('hides the button when there is no authenticated session', async () => {
    setupSession({ isAuthenticated: false, unreadCount: 5 });

    const view = await render(<NotificationHeaderButton />);

    expect(view.queryByTestId('notification-header-button')).toBeNull();
  });
});
