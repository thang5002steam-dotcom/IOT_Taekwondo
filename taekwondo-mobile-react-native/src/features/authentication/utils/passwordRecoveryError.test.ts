import { passwordRecoveryError } from './passwordRecoveryError';

function apiError(code: string) {
  return { isAxiosError: true, response: { status: 400, data: { code } } };
}

describe('passwordRecoveryError', () => {
  it.each([
    ['RATE_LIMIT_EXCEEDED', 'Bạn vừa gửi mã. Vui lòng chờ đến khi có thể gửi lại.'],
    ['PASSWORD_RESET_INVALID', 'Mã xác minh không đúng. Vui lòng kiểm tra lại.'],
    ['PASSWORD_RESET_EXPIRED', 'Mã hoặc yêu cầu đã hết hạn. Vui lòng gửi mã mới.'],
    ['PASSWORD_REUSE_NOT_ALLOWED', 'Mật khẩu mới phải khác mật khẩu hiện tại.'],
  ])('maps %s to a useful Vietnamese message', (code, expected) => {
    expect(passwordRecoveryError(apiError(code))).toBe(expected);
  });

  it('explains a missing network response', () => {
    expect(passwordRecoveryError(new Error('offline'))).toBe('Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.');
  });
});
