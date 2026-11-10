import AsyncStorage from '@react-native-async-storage/async-storage';

function logUnavailable(storageName: string): void {
  console.info(`[Storage] ${storageName} is unavailable on web.`);
}

export const storageLogger = {
  async logAsyncStorage(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const pairs = await AsyncStorage.multiGet([...keys]);
    console.info('[Storage] AsyncStorage', Object.fromEntries(pairs));
  },

  async logSecureStore(): Promise<void> {
    logUnavailable('SecureStore');
  },

  async logSQLite(): Promise<void> {
    logUnavailable('SQLite');
  },

  async logAll(): Promise<void> {
    await this.logAsyncStorage();
    await this.logSecureStore();
    await this.logSQLite();
  },
};
