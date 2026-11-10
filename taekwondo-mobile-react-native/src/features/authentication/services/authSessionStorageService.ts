import { keyValueStorage } from '@/infrastructure/storage/keyValueStorage';
import { secureStorage } from '@/infrastructure/storage/secureStorage';

import type { AuthSnapshot, AuthTokens } from '../domain/auth.types';

const authStorageKeys = {
  tokens: 'auth.tokens.v1',
  snapshot: 'auth.snapshot.v1',
  migration: 'auth.storage-migration.v1',
} as const;

const legacyAuthKeys = [
  'refreshToken',
  'refresh_token',
  'token',
  'access_token',
  'user',
  'role',
  'idRole',
  'idUser',
  'idAccount',
  'userCode',
  'currentUser',
  'authData',
  'auth-storage',
] as const;

type TokenEnvelope = AuthTokens & { version: 1 };
type SnapshotEnvelope = { version: 1; snapshot: AuthSnapshot };

function isTokenEnvelope(value: unknown): value is TokenEnvelope {
  if (!value || typeof value !== 'object') return false;
  const envelope = value as Partial<TokenEnvelope>;
  return (
    envelope.version === 1 &&
    typeof envelope.accessToken === 'string' &&
    envelope.accessToken.length > 0 &&
    typeof envelope.refreshToken === 'string' &&
    envelope.refreshToken.length > 0
  );
}

function isSnapshot(value: unknown): value is AuthSnapshot {
  if (!value || typeof value !== 'object') return false;
  const snapshot = value as Partial<AuthSnapshot>;
  return (
    Boolean(snapshot.user) &&
    Array.isArray(snapshot.availableContexts) &&
    typeof snapshot.requiresContextSelection === 'boolean'
  );
}

export const authSessionStorageService = {
  tokens: {
    async read(): Promise<AuthTokens | null> {
      const raw = await secureStorage.get(authStorageKeys.tokens);
      if (!raw) return null;

      try {
        const envelope: unknown = JSON.parse(raw);
        if (!isTokenEnvelope(envelope)) {
          await this.clear();
          return null;
        }
        return {
          accessToken: envelope.accessToken,
          refreshToken: envelope.refreshToken,
        };
      } catch {
        await this.clear();
        return null;
      }
    },

    async write(tokens: AuthTokens): Promise<void> {
      if (!tokens.accessToken || !tokens.refreshToken) {
        throw new Error('Both access and refresh tokens are required.');
      }
      const envelope: TokenEnvelope = { version: 1, ...tokens };
      await secureStorage.set(authStorageKeys.tokens, JSON.stringify(envelope));
    },

    clear(): Promise<void> {
      return secureStorage.remove(authStorageKeys.tokens);
    },
  },

  snapshot: {
    async read(): Promise<AuthSnapshot | null> {
      const raw = await keyValueStorage.get(authStorageKeys.snapshot);
      if (!raw) return null;
      try {
        const envelope = JSON.parse(raw) as Partial<SnapshotEnvelope>;
        return envelope.version === 1 && isSnapshot(envelope.snapshot)
          ? envelope.snapshot
          : null;
      } catch {
        return null;
      }
    },

    write(snapshot: AuthSnapshot): Promise<void> {
      const envelope: SnapshotEnvelope = { version: 1, snapshot };
      return keyValueStorage.set(authStorageKeys.snapshot, JSON.stringify(envelope));
    },

    clear(): Promise<void> {
      return keyValueStorage.remove(authStorageKeys.snapshot);
    },
  },

  async migrateLegacyKeys(): Promise<void> {
    const migrated = await keyValueStorage.get(authStorageKeys.migration);
    if (migrated === '1') return;
    await keyValueStorage.removeMany(legacyAuthKeys);
    await keyValueStorage.set(authStorageKeys.migration, '1');
  },

  async clear(): Promise<void> {
    await Promise.allSettled([this.tokens.clear(), this.snapshot.clear()]);
  },
};
