import {
  create,
  isAxiosError,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import axiosRetry, { exponentialDelay, isNetworkError } from 'axios-retry';

import { env } from '@/config/env';

type RetriableRequest = InternalAxiosRequestConfig & {
  _authRetried?: boolean;
};

export type AuthHttpRuntime = {
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string>;
  invalidateSession: () => Promise<void>;
};

let authRuntime: AuthHttpRuntime | null = null;
let refreshPromise: Promise<string> | null = null;

export function configureAuthHttp(runtime: AuthHttpRuntime): () => void {
  authRuntime = runtime;
  return () => {
    if (authRuntime === runtime) authRuntime = null;
  };
}

function isAuthLifecycleRequest(url: string): boolean {
  return (
    url.includes('/auth/mobile/login') ||
    url.includes('/auth/mobile/refresh') ||
    url.includes('/auth/mobile/logout')
  );
}

function getRefreshPromise(runtime: AuthHttpRuntime): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = runtime
    .refreshAccessToken()
    .catch(async (error: unknown) => {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401 || status === 403) {
        await runtime.invalidateSession();
      }
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export const javaApi = create({
  baseURL: env.javaApiUrl,
  timeout: env.apiTimeoutMs,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  paramsSerializer: {
    indexes: null,
  },
});

axiosRetry(javaApi, {
  retries: 3,
  retryDelay: exponentialDelay,
  retryCondition: (error: AxiosError) => {
    const method = error.config?.method?.toLowerCase();
    if (method !== 'get' && method !== 'head') return false;
    const status = error.response?.status;
    return isNetworkError(error) || status === 429 || Boolean(status && status >= 500);
  },
});

javaApi.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type');
  }

  const url = config.url ?? '';
  const token = authRuntime?.getAccessToken();
  if (token && !isAuthLifecycleRequest(url)) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

javaApi.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error) || !error.config) throw error;

    const request = error.config as RetriableRequest;
    const url = request.url ?? '';
    const runtime = authRuntime;
    if (
      error.response?.status !== 401 ||
      request._authRetried ||
      isAuthLifecycleRequest(url) ||
      !runtime
    ) {
      throw error;
    }

    request._authRetried = true;
    const accessToken = await getRefreshPromise(runtime);
    request.headers.set('Authorization', `Bearer ${accessToken}`);
    return javaApi(request);
  },
);
