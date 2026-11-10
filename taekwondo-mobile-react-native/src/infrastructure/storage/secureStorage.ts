import * as SecureStore from 'expo-secure-store';

const secureStorageOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const secureStorage = {
  get(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },

  set(key: string, value: string): Promise<void> {
    return SecureStore.setItemAsync(key, value, secureStorageOptions);
  },

  remove(key: string): Promise<void> {
    return SecureStore.deleteItemAsync(key);
  },
};
