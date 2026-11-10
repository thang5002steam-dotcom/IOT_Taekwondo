import type { StateStorage } from 'zustand/middleware';

import { keyValueStorage } from './keyValueStorage';

export const zustandKeyValueStorage: StateStorage<Promise<void>> = {
  getItem(name) {
    return keyValueStorage.get(name);
  },
  setItem(name, value) {
    return keyValueStorage.set(name, value);
  },
  removeItem(name) {
    return keyValueStorage.remove(name);
  },
};
