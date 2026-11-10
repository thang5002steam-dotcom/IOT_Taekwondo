const memoryStorage = new Map<string, string>();

function getSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage;
}

/**
 * Browser session adapter for secrets.
 *
 * Browsers have no equivalent of the iOS Keychain or Android Keystore, so
 * authentication tokens intentionally live for one browser tab session.
 */
export const secureStorage = {
  async get(key: string): Promise<string | null> {
    return getSessionStorage()?.getItem(key) ?? memoryStorage.get(key) ?? null;
  },

  async set(key: string, value: string): Promise<void> {
    const storage = getSessionStorage();
    if (storage) storage.setItem(key, value);
    else memoryStorage.set(key, value);
  },

  async remove(key: string): Promise<void> {
    getSessionStorage()?.removeItem(key);
    memoryStorage.delete(key);
  },
};
