import { isAxiosError } from 'axios';

export function passwordRecoveryError(error: unknown): string {
  if (!isAxiosError(error) || !error.response) {
    return 'Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.';
  }
  const body = error.response.data as { code?: unknown } | undefined;
  const code = typeof body?.code === 'string' ? body.code : '';
  const messages: Record<string, string> = {
    RATE_LIMIT_EXCEEDED: 'Bạn vừa gửi mã. Vui lòng chờ đến khi có thể gửi lại.',
    PASSWORD_RESET_INVALID: 'Mã xác minh không đúng. Vui lòng kiểm tra lại.',
    PASSWORD_RESET_EXPIRED: 'Mã hoặc yêu cầu đã hết hạn. Vui lòng gửi mã mới.',
    PASSWORD_RESET_CHANNEL_UNAVAILABLE: 'Kênh nhận mã hiện không khả dụng. Hãy chọn kênh khác.',
    OLD_PASSWORD_INCORRECT: 'Mật khẩu hiện tại không chính xác.',
    PASSWORD_CONFIRMATION_MISMATCH: 'Xác nhận mật khẩu chưa khớp.',
    PASSWORD_REUSE_NOT_ALLOWED: 'Mật khẩu mới phải khác mật khẩu hiện tại.',
  };
  return messages[code] ?? 'Không thể hoàn tất yêu cầu. Vui lòng thử lại.';
}
