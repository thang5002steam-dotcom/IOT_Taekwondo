import * as Crypto from 'expo-crypto';

import { keyValueStorage } from './keyValueStorage';

const INSTALLATION_ID_KEY = 'device.installation-id.v1';

let pendingInstallationId: Promise<string> | null = null;

export function getInstallationId(): Promise<string> {
  if (pendingInstallationId) return pendingInstallationId;

  pendingInstallationId = (async () => {
    const existing = await keyValueStorage.get(INSTALLATION_ID_KEY);
    if (existing) return existing;

    const created = Crypto.randomUUID();
    await keyValueStorage.set(INSTALLATION_ID_KEY, created);
    return created;
  })().finally(() => {
    pendingInstallationId = null;
  });

  return pendingInstallationId;
}
