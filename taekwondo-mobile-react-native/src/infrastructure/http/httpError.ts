import { isAxiosError } from 'axios';

export type HttpErrorStatus = 401 | 403 | 404 | 408 | 409 | 429 | 500;

export function getHttpErrorStatus(error: unknown): number | null {
  return isAxiosError(error) ? error.response?.status ?? null : null;
}

export function getApiErrorCode(error: unknown): string | null {
  if (!isAxiosError(error)) return null;

  const data = error.response?.data;
  if (typeof data !== 'object' || data === null || !('code' in data)) return null;

  const code = data.code;
  return typeof code === 'string' ? code : null;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return 'Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.';
    }

    const status = error.response.status;
    if (status === 401) {
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }
    if (status === 403) {
      return 'Bạn không có quyền thực hiện thao tác này.';
    }
    if (status === 404) {
      return 'Không tìm thấy nội dung yêu cầu.';
    }
    if (status === 409) {
      return 'Dữ liệu đã được thay đổi hoặc yêu cầu đã được xử lý. Vui lòng tải lại trạng thái.';
    }
    if (status === 422) {
      return 'Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra và thử lại.';
    }
    if (status === 429) {
      return 'Bạn đang thực hiện quá nhiều thao tác. Vui lòng thử lại sau.';
    }
    if (status >= 500) {
      return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
    }
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
