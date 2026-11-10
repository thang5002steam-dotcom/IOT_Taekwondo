import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { authSessionStorageService } from './authSessionStorageService';

jest.mock('@react-native-async-storage/async-storage', () =>
  // Jest requires the factory import after module mocking is initialized.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'when-unlocked-this-device-only',
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const secureStoreMock = SecureStore as jest.Mocked<typeof SecureStore>;
const TOKEN_KEY = 'auth.tokens.v1';
const SNAPSHOT_KEY = 'auth.snapshot.v1';
const MIGRATION_KEY = 'auth.storage-migration.v1';

describe('auth session storage boundaries', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('writes the access and refresh token as one SecureStore envelope', async () => {
    await authSessionStorageService.tokens.write({
      accessToken: 'access',
      refreshToken: 'refresh',
    });

    expect(secureStoreMock.setItemAsync).toHaveBeenCalledTimes(1);
    expect(secureStoreMock.setItemAsync).toHaveBeenCalledWith(
      TOKEN_KEY,
      JSON.stringify({ version: 1, accessToken: 'access', refreshToken: 'refresh' }),
      expect.any(Object),
    );
    expect(await AsyncStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('stores only a non-sensitive session snapshot in AsyncStorage', async () => {
    await authSessionStorageService.snapshot.write({
      user: {
        userId: 'user-1',
        phoneNumber: '0369222068',
        status: 'ACTIVE',
        roles: ['ROLE_STUDENT'],
        permissions: [],
      },
      activeContext: null,
      availableContexts: [],
      requiresContextSelection: true,
    });

    const stored = await AsyncStorage.getItem(SNAPSHOT_KEY);
    expect(stored).toContain('user-1');
    expect(stored).not.toContain('accessToken');
    expect(stored).not.toContain('refreshToken');
  });

  it('rejects incomplete token pairs before touching SecureStore', async () => {
    await expect(
      authSessionStorageService.tokens.write({ accessToken: 'access', refreshToken: '' }),
    ).rejects.toThrow('Both access and refresh tokens are required.');
    expect(secureStoreMock.setItemAsync).not.toHaveBeenCalled();
  });

  it('removes legacy browser-style keys once and records the migration', async () => {
    await AsyncStorage.multiSet([
      ['token', 'legacy-access'],
      ['refreshToken', 'legacy-refresh'],
      ['user', '{"id":"legacy"}'],
    ]);

    await authSessionStorageService.migrateLegacyKeys();

    expect(await AsyncStorage.getItem('token')).toBeNull();
    expect(await AsyncStorage.getItem('refreshToken')).toBeNull();
    expect(await AsyncStorage.getItem('user')).toBeNull();
    expect(await AsyncStorage.getItem(MIGRATION_KEY)).toBe('1');
  });
});
