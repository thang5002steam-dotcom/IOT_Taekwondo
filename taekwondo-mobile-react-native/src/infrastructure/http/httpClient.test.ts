import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';

import { configureAuthHttp, javaApi } from './httpClient';

function unauthorized(config: InternalAxiosRequestConfig): AxiosError {
  return new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, {
    data: null,
    status: 401,
    statusText: 'Unauthorized',
    headers: {},
    config,
  });
}

describe('auth HTTP interceptor', () => {
  const originalAdapter = javaApi.defaults.adapter;
  let disposeRuntime: (() => void) | undefined;

  afterEach(() => {
    disposeRuntime?.();
    disposeRuntime = undefined;
    javaApi.defaults.adapter = originalAdapter;
  });

  it('single-flights concurrent refreshes and replays each request once', async () => {
    let refreshCount = 0;
    let accessToken = 'expired-token';
    const invalidateSession = jest.fn().mockResolvedValue(undefined);

    disposeRuntime = configureAuthHttp({
      getAccessToken: () => accessToken,
      refreshAccessToken: async () => {
        refreshCount += 1;
        await Promise.resolve();
        accessToken = 'rotated-token';
        return accessToken;
      },
      invalidateSession,
    });

    javaApi.defaults.adapter = async (config) => {
      const authorization = AxiosHeaders.from(config.headers).get('Authorization');
      if (authorization !== 'Bearer rotated-token') throw unauthorized(config);
      return { data: config.url, status: 200, statusText: 'OK', headers: {}, config };
    };

    const responses = await Promise.all([
      javaApi.get('/protected/a'),
      javaApi.get('/protected/b'),
      javaApi.get('/protected/c'),
    ]);

    expect(refreshCount).toBe(1);
    expect(responses.map((response) => response.data)).toEqual([
      '/protected/a',
      '/protected/b',
      '/protected/c',
    ]);
    expect(invalidateSession).not.toHaveBeenCalled();
  });

  it('invalidates once when refresh is rejected and never refreshes lifecycle calls', async () => {
    const refreshError = unauthorized({
      headers: new AxiosHeaders(),
      method: 'post',
      url: '/auth/mobile/refresh',
    } as InternalAxiosRequestConfig);
    const invalidateSession = jest.fn().mockResolvedValue(undefined);
    const refreshAccessToken = jest.fn().mockRejectedValue(refreshError);

    disposeRuntime = configureAuthHttp({
      getAccessToken: () => 'expired-token',
      refreshAccessToken,
      invalidateSession,
    });
    javaApi.defaults.adapter = async (config) => {
      throw unauthorized(config);
    };

    await expect(javaApi.get('/protected')).rejects.toBe(refreshError);
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(invalidateSession).toHaveBeenCalledTimes(1);
    expect(invalidateSession).toHaveBeenCalledWith();

    refreshAccessToken.mockClear();
    await expect(javaApi.post('/auth/mobile/login')).rejects.toBeInstanceOf(AxiosError);
    expect(refreshAccessToken).not.toHaveBeenCalled();
  });

  it('serializes array params as repeated keys for Spring list request params', () => {
    const uri = javaApi.getUri({
      url: '/student-attendances',
      params: { scheduleIds: ['A', 'B'] },
    });

    expect(uri).toContain('scheduleIds=A');
    expect(uri).toContain('scheduleIds=B');
    expect(uri).not.toContain('scheduleIds%5B%5D');
  });

  it('does not keep the JSON content type for FormData bodies', async () => {
    javaApi.defaults.adapter = async (config) => {
      const contentType = AxiosHeaders.from(config.headers).get('Content-Type');
      expect(String(contentType ?? '')).not.toContain('application/json');
      return { data: null, status: 200, statusText: 'OK', headers: {}, config };
    };

    await javaApi.post('/multipart-test', new FormData());
  });
});
