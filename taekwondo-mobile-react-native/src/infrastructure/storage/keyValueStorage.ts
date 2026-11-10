import AsyncStorage from '@react-native-async-storage/async-storage';

export const keyValueStorage = {
  get(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  },

  set(key: string, value: string): Promise<void> {
    return AsyncStorage.setItem(key, value);
  },

  remove(key: string): Promise<void> {
    return AsyncStorage.removeItem(key);
  },

  removeMany(keys: readonly string[]): Promise<void> {
    return AsyncStorage.multiRemove([...keys]);
  },
};
