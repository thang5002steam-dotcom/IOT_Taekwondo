import { authSessionService } from './authSessionService';
import { useNotificationStore } from '@/features/notification/store/notification.store';

jest.mock('@/infrastructure/notifications/notificationService', () => ({
  notificationService: {
    platform: 'ANDROID',
    cleanup: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/infrastructure/query/queryClient', () => ({
  queryClient: { clear: jest.fn() },
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'when-unlocked-this-device-only',
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('session invalidation', () => {
  it('clears the notification store when a session is invalidated', async () => {
    useNotificationStore.setState({
      unreadCount: 12,
      hasFetched: true,
      lastActivePersonId: 'person-old',
    });

    await authSessionService.invalidateSession('logout');

    const state = useNotificationStore.getState();
    expect(state.unreadCount).toBe(0);
    expect(state.hasFetched).toBe(false);
    expect(state.lastActivePersonId).toBeNull();
  });
});
