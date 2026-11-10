import { isAxiosError } from 'axios';

import { useNotificationStore } from '@/features/notification/store/notification.store';
import { configureAuthHttp } from '@/infrastructure/http/httpClient';
import { notificationService } from '@/infrastructure/notifications/notificationService';
import { queryClient } from '@/infrastructure/query/queryClient';
import { getInstallationId } from '@/infrastructure/storage/installationId';

import { authApi } from '../api/authApi';
import type {
  AuthResponse,
  LoginRequest,
  SwitchContextRequest,
} from '../api/auth.dto';
import { isAccessTokenUsable } from '../domain/isAccessTokenUsable';
import type {
  AuthSnapshot,
  AuthTokens,
  SessionInvalidReason,
} from '../domain/auth.types';
import { authStore, useAuthStore } from '../store/auth.store';
import { authSessionStorageService } from './authSessionStorageService';

function toSnapshot(response: AuthResponse): AuthSnapshot {
  return {
    user: response.user,
    activeContext: response.activeContext,
    availableContexts: response.availableContexts ?? [],
    requiresContextSelection: response.requiresContextSelection,
  };
}

async function applyAndPersist(
  response: AuthResponse,
  accessToken: string,
): Promise<void> {
  const snapshot = toSnapshot(response);
  await authSessionStorageService.snapshot.write(snapshot);
  useAuthStore.getState().applyResponse(response, accessToken);
}

async function persistRotatedSession(
  response: AuthResponse & AuthTokens,
): Promise<AuthResponse & AuthTokens> {
  await authSessionStorageService.tokens.write({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  });
  await applyAndPersist(response, response.accessToken);
  return response;
}

let notificationSyncPromise: Promise<void> | null = null;

async function syncFcm(requestPermission: boolean): Promise<void> {
  if (notificationSyncPromise) return notificationSyncPromise;
  notificationSyncPromise = (async () => {
    if (!authStore.getAccessToken()) return;
    const token = await notificationService.getToken({ requestPermission });
    if (token) await authApi.updateFcm(token, notificationService.platform);
  })().finally(() => {
    notificationSyncPromise = null;
  });
  return notificationSyncPromise;
}

async function invalidateSession(reason: SessionInvalidReason): Promise<void> {
  await Promise.allSettled([
    authSessionStorageService.clear(),
    useNotificationStore.getState().reset(),
    reason === 'logout' || reason === 'logout-all'
      ? notificationService.cleanup()
      : Promise.resolve(),
  ]);
  queryClient.clear();
  useAuthStore.getState().setAnonymous();
}

async function refreshSession(): Promise<string> {
  const tokens = await authSessionStorageService.tokens.read();
  if (!tokens?.refreshToken) {
    await invalidateSession('missing-refresh-token');
    throw new Error('Missing refresh token.');
  }

  const refreshed = await authApi.refresh({ refreshToken: tokens.refreshToken });
  const session = await persistRotatedSession(refreshed);
  return session.accessToken;
}

async function refreshAccessToken(): Promise<string> {
  return refreshSession();
}

export const authSessionService = {
  configureHttp(): () => void {
    return configureAuthHttp({
      getAccessToken: authStore.getAccessToken,
      refreshAccessToken,
      invalidateSession: () => invalidateSession('refresh-rejected'),
    });
  },

  async bootstrap(): Promise<void> {
    useAuthStore.getState().setBootstrapping();
    try {
      await authSessionStorageService.migrateLegacyKeys();
      const [tokens, snapshot] = await Promise.all([
        authSessionStorageService.tokens.read(),
        authSessionStorageService.snapshot.read(),
      ]);

      if (!tokens) {
        await authSessionStorageService.snapshot.clear();
        useAuthStore.getState().setAnonymous();
        return;
      }

      if (isAccessTokenUsable(tokens.accessToken) && snapshot) {
        useAuthStore.getState().hydrate(tokens.accessToken, snapshot);
      }

      if (!isAccessTokenUsable(tokens.accessToken)) {
        await refreshSession();
      } else {
        const account = await authApi.getAccount();
        await applyAndPersist(account, tokens.accessToken);
      }

      void syncFcm(false).catch(() => undefined);
    } catch (error: unknown) {
      if (!isAxiosError(error) || !error.response) {
        useAuthStore
          .getState()
          .setRecoverableError(
            'Không thể xác minh phiên đăng nhập. Vui lòng kiểm tra kết nối mạng.',
          );
        return;
      }

      if (useAuthStore.getState().status !== 'anonymous') {
        await invalidateSession('refresh-rejected');
      }
    }
  },

  async login(input: Pick<LoginRequest, 'phoneNumber' | 'password'>): Promise<AuthResponse> {
    const [idDevice, fcmToken] = await Promise.all([
      getInstallationId(),
      notificationService
        .getToken({ requestPermission: false })
        .catch(() => null),
    ]);
    const response = await authApi.login({
      ...input,
      idDevice,
      fcmToken,
      platform: notificationService.platform,
    });
    const session = await persistRotatedSession(response);
    if (!fcmToken) {
      void syncFcm(true).catch(() => undefined);
    }
    return session;
  },

  async switchContext(request: SwitchContextRequest): Promise<AuthResponse> {
    const response = await authApi.switchContext(request);
    const tokens = await authSessionStorageService.tokens.read();
    const accessToken = response.accessToken;
    if (!tokens || !accessToken) {
      await invalidateSession('missing-refresh-token');
      throw new Error('The context response did not contain an access token.');
    }

    await authSessionStorageService.tokens.write({
      accessToken,
      refreshToken: tokens.refreshToken,
    });
    await applyAndPersist(response, accessToken);
    queryClient.clear();
    return response;
  },

  async logout(): Promise<void> {
    const tokens = await authSessionStorageService.tokens.read();
    try {
      if (tokens?.refreshToken) {
        await authApi.logout({ refreshToken: tokens.refreshToken });
      }
    } finally {
      await invalidateSession('logout');
    }
  },

  async logoutAll(): Promise<void> {
    try {
      await authApi.logoutAll();
    } finally {
      await invalidateSession('logout-all');
    }
  },

  syncFcm,
  invalidateSession,
};
