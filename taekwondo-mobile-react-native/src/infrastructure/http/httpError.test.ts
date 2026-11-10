import { AxiosError, AxiosHeaders } from 'axios';

import { getApiErrorCode, getApiErrorMessage, getHttpErrorStatus } from './httpError';

function createAxiosError(status: number): AxiosError {
  return new AxiosError(
    'Request failed',
    'ERR_BAD_REQUEST',
    { headers: new AxiosHeaders() } as never,
    undefined,
    {
      data: null,
      status,
      statusText: String(status),
      headers: {},
      config: { headers: new AxiosHeaders() } as never,
    },
  );
}

describe('http error helpers', () => {
  it('extracts the response status', () => {
    expect(getHttpErrorStatus(createAxiosError(403))).toBe(403);
    expect(getHttpErrorStatus(new Error('boom'))).toBeNull();
  });

  it('extracts the backend error code when present', () => {
    const error = createAxiosError(502);
    error.response!.data = { code: 'SUPABASE_STORAGE_UPLOAD_FAILED' };

    expect(getApiErrorCode(error)).toBe('SUPABASE_STORAGE_UPLOAD_FAILED');
    expect(getApiErrorCode(new Error('boom'))).toBeNull();
  });

  it('maps 401/403/404 and network failures to user-facing messages', () => {
    expect(getApiErrorMessage(createAxiosError(401), 'fallback')).toContain(
      'đăng nhập lại',
    );
    expect(getApiErrorMessage(createAxiosError(403), 'fallback')).toContain(
      'không có quyền',
    );
    expect(getApiErrorMessage(createAxiosError(404), 'fallback')).toContain(
      'Không tìm thấy',
    );
    expect(getApiErrorMessage(createAxiosError(409), 'fallback')).toContain(
      'đã được xử lý',
    );
    expect(getApiErrorMessage(createAxiosError(422), 'fallback')).toContain(
      'Dữ liệu gửi lên không hợp lệ',
    );
    expect(
      getApiErrorMessage(new AxiosError('Network Error'), 'fallback'),
    ).toContain('kết nối máy chủ');
    expect(getApiErrorMessage(new Error('custom'), 'fallback')).toBe('custom');
  });
});
