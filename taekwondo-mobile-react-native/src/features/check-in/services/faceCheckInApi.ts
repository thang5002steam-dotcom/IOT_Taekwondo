import { javaApi } from '@/infrastructure/http/httpClient';
import type { MobileUploadFile } from '@/infrastructure/http/http.types';
import { createFileMultipartFormData } from '@/infrastructure/http/multipart';
import { isAxiosError } from 'axios';
import type {
  AttendanceCommandApiResult,
  BackendFaceCheckInResponse,
  CheckInApiResult,
  CheckInFailure,
  CheckInPersonType,
  CheckInRecord,
  CheckInStatus,
} from '../types/faceScanner.types';

type BackendProblemDetail = {
  code?: string;
  title?: string;
  detail?: string;
  status?: number;
  correlationId?: string;
  message?: string;
  errorCode?: string;
};

function formatCheckInTime(checkInTime?: string | null, checkOutTime?: string | null): string {
  if (checkInTime) {
    if (checkInTime.includes('T')) {
      const timePart = checkInTime.split('T')[1];
      if (timePart) return timePart.slice(0, 5);
    }
    const d = new Date(checkInTime);
    if (!isNaN(d.getTime())) {
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
    return String(checkInTime).slice(0, 5);
  }
  if (checkOutTime) {
    return String(checkOutTime).slice(0, 5);
  }
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function formatDateLabel(sessionDate?: string | null): string {
  if (!sessionDate) return 'Hôm nay';
  const parts = sessionDate.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return sessionDate;
}

function mapStatusAndLabel(
  status: BackendFaceCheckInResponse['status'],
  action?: BackendFaceCheckInResponse['action'] | null,
  attendanceStatus?: string | null,
): { status: CheckInStatus; statusLabel: string } {
  if (status === 'PENDING') {
    return { status: 'ON_TIME', statusLabel: 'Đang xử lý' };
  }
  if (status === 'PROCESSING') {
    return { status: 'ON_TIME', statusLabel: 'Đang xử lý' };
  }
  if (status === 'REJECTED' || status === 'FAILED' || status === 'EXPIRED') {
    return { status: 'FAILED', statusLabel: 'Không thể điểm danh' };
  }
  if (action === 'STAFF_TIMESHEET_CHECKED_OUT' || action === 'COACH_CHECKED_OUT') {
    return { status: 'SUCCESS', statusLabel: 'Kết ca' };
  }
  if (attendanceStatus === 'LATE') {
    return { status: 'LATE', statusLabel: 'Đi muộn' };
  }
  if (attendanceStatus === 'EXCUSED') {
    return { status: 'EXCUSED', statusLabel: 'Có phép' };
  }
  return { status: 'ON_TIME', statusLabel: 'Đúng giờ' };
}

function inferRole(
  action: BackendFaceCheckInResponse['action'] | undefined | null,
  personCode?: string | null,
): CheckInPersonType {
  const isCoachAction =
    action === 'COACH_CHECKED_IN' ||
    action === 'COACH_CHECKED_OUT' ||
    action === 'STAFF_TIMESHEET_CHECKED_IN' ||
    action === 'STAFF_TIMESHEET_CHECKED_OUT';
  if (isCoachAction) return 'COACH';

  const normalizedCode = personCode?.trim().toUpperCase() ?? '';
  return normalizedCode.startsWith('VQT_') || normalizedCode.startsWith('NV')
    ? 'COACH'
    : 'STUDENT';
}

function normalizeBackendError(data: unknown): BackendProblemDetail {
  if (!data || typeof data !== 'object') {
    return {};
  }
  return data as BackendProblemDetail;
}

function errorCopy(
  code: string | undefined,
  status: number | undefined,
  backend: BackendProblemDetail,
): Pick<CheckInFailure, 'errorType' | 'title' | 'message' | 'ctaLabel'> {
  const detail = backend.detail || backend.message;

  switch (code) {
    case 'FACE_NOT_DETECTED':
      return {
        errorType: 'NO_FACE',
        title: 'Không nhận được khuôn mặt',
        message: 'Vui lòng đưa khuôn mặt vào khung, giữ máy ổn định rồi thử lại.',
        ctaLabel: 'Quét lại',
      };
    case 'MULTIPLE_FACES_DETECTED':
      return {
        errorType: 'MULTIPLE_FACES',
        title: 'Có nhiều khuôn mặt',
        message: 'Chỉ để một người trong khung hình khi điểm danh.',
        ctaLabel: 'Quét lại',
      };
    case 'IMAGE_DECODE_FAILED':
    case 'INVALID_IMAGE_FILE':
    case 'EMPTY_IMAGE_FILE':
    case 'UNSUPPORTED_IMAGE_TYPE':
    case 'FILE_TOO_LARGE':
      return {
        errorType: 'INVALID_IMAGE',
        title: 'Ảnh không hợp lệ',
        message: detail || 'Ảnh chụp chưa hợp lệ. Vui lòng chụp lại.',
        ctaLabel: 'Chụp lại',
      };
    case 'FACE_NOT_MATCHED':
      return {
        errorType: 'PERSON_NOT_FOUND',
        title: 'Không khớp hồ sơ',
        message: 'Khuôn mặt chưa khớp với hồ sơ đã đăng ký. Vui lòng thử lại hoặc cập nhật ảnh khuôn mặt.',
        ctaLabel: 'Quét lại',
      };
    case 'PERSON_NOT_FOUND':
      return {
        errorType: 'PERSON_NOT_FOUND',
        title: 'Không tìm thấy hồ sơ',
        message: 'Không tìm thấy thông tin người dùng tương ứng.',
        ctaLabel: 'Quét lại',
      };
    case 'FACE_CHECK_IN_NO_ACTIVE_CONTEXT':
      return {
        errorType: 'NO_ACTIVE_SESSION',
        title: 'Không có lịch phù hợp',
        message: detail || 'Không có lịch điểm danh hoặc chấm công phù hợp tại thời điểm này.',
        ctaLabel: 'Quét người khác',
      };
    case 'FACE_CHECK_IN_AMBIGUOUS_CONTEXT':
      return {
        errorType: 'AMBIGUOUS_CONTEXT',
        title: 'Có nhiều buổi phù hợp',
        message: 'Hệ thống tìm thấy nhiều buổi có thể điểm danh. Vui lòng kiểm tra lịch học/ca làm.',
        ctaLabel: 'Quét người khác',
      };
    case 'FACE_CHECK_IN_UNSUPPORTED_CONTEXT':
    case 'FACE_CHECK_IN_PERSON_TYPE_INVALID':
      return {
        errorType: 'UNSUPPORTED_CONTEXT',
        title: 'Không thể điểm danh',
        message: detail || 'Ngữ cảnh điểm danh hiện tại không được hỗ trợ.',
        ctaLabel: 'Quét người khác',
      };
    case 'ATTENDANCE_CLOSED':
    case 'ATTENDANCE_ALREADY_CLOSED':
      return {
        errorType: 'ATTENDANCE_CLOSED',
        title: 'Điểm danh đã đóng',
        message: 'Buổi học đã đóng điểm danh.',
        ctaLabel: 'Quét người khác',
      };
    case 'FACE_CHECK_IN_ALREADY_CHECKED_IN':
      return {
        errorType: 'ALREADY_CHECKED_IN',
        title: 'Đã điểm danh trước đó',
        message: detail || 'Người này đã điểm danh trong buổi học hôm nay.',
        ctaLabel: 'Quét người khác',
      };
    case 'FACE_CHECK_IN_ALREADY_CHECKED_OUT':
      return {
        errorType: 'ALREADY_CHECKED_OUT',
        title: 'Đã kết ca trước đó',
        message: detail || 'HLV này đã kết ca trong buổi học hôm nay.',
        ctaLabel: 'Quét người khác',
      };
    case 'FACE_CHECK_IN_EXPIRED':
      return {
        errorType: 'UNKNOWN',
        title: 'Yêu cầu đã hết hạn',
        message: detail || 'Yêu cầu điểm danh đã hết thời gian xử lý. Vui lòng quét lại.',
        ctaLabel: 'Quét lại',
      };
    case 'ACCESS_DENIED':
    case 'UNAUTHORIZED':
      return {
        errorType: 'ACCESS_DENIED',
        title: 'Không có quyền điểm danh',
        message: 'Tài khoản hiện tại không có quyền thực hiện thao tác này.',
        ctaLabel: 'Đóng',
      };
    case 'MODEL_NOT_INITIALIZED':
    case 'PYTHON_BACKEND_UNAVAILABLE':
    case 'PYTHON_BACKEND_ERROR':
      return {
        errorType: 'SERVICE_UNAVAILABLE',
        title: 'Dịch vụ nhận diện tạm thời lỗi',
        message: 'Vui lòng thử lại sau ít phút.',
        ctaLabel: 'Thử lại',
      };
    default:
      if (status === 401 || status === 403) {
        return {
          errorType: 'ACCESS_DENIED',
          title: 'Không có quyền điểm danh',
          message: 'Tài khoản hiện tại không có quyền thực hiện thao tác này.',
          ctaLabel: 'Đóng',
        };
      }
      return {
        errorType: 'UNKNOWN',
        title: backend.title || 'Điểm danh thất bại',
        message: detail || 'Không thể hoàn tất điểm danh. Vui lòng thử lại.',
        ctaLabel: 'Thử lại',
      };
  }
}

function failureFromBackend(status: number | undefined, data: unknown): CheckInFailure {
  const backend = normalizeBackendError(data);
  const code = backend.code || backend.errorCode;
  const copy = errorCopy(code, status, backend);
  return {
    ...copy,
    correlationId: backend.correlationId,
  };
}

function failureFromFaceCheckInResponse(raw: BackendFaceCheckInResponse): CheckInFailure {
  const backend: BackendProblemDetail = {
    code: raw.error?.code ?? undefined,
    title: raw.error?.title ?? undefined,
    detail: raw.error?.detail ?? raw.message ?? undefined,
  };
  const copy = errorCopy(backend.code, undefined, backend);
  return {
    ...copy,
  };
}

function networkFailure(): CheckInFailure {
  return {
    errorType: 'NETWORK_ERROR',
    title: 'Không kết nối được máy chủ',
    message: 'Kiểm tra mạng hoặc máy chủ backend rồi thử lại.',
    ctaLabel: 'Thử lại',
  };
}

export function mapBackendResponseToRecord(raw: BackendFaceCheckInResponse): CheckInRecord {
  const role = inferRole(raw.action, raw.person?.personCode);
  const { status, statusLabel } = mapStatusAndLabel(
    raw.status,
    raw.action,
    raw.attendanceStatus,
  );

  return {
    id: raw.recordId || `rec-${Date.now()}`,
    personId: raw.person?.personId || `p-${Date.now()}`,
    code: raw.person?.personCode || (role === 'STUDENT' ? 'HV00001' : 'NV00001'),
    fullName: raw.person?.fullName || 'Người dùng',
    avatarUrl: raw.person?.faceImagePath || undefined,
    role,
    status,
    statusLabel,
    checkInTime: formatCheckInTime(raw.checkInTime, raw.checkOutTime),
    dateLabel: formatDateLabel(raw.session?.sessionDate),
    courseName: raw.session?.courseName,
    sessionTime: raw.session
      ? `${raw.session.startTime?.slice(0, 5)} - ${raw.session.endTime?.slice(0, 5)}`
      : undefined,
    timestamp: Date.now(),
    confidence: typeof raw.confidence === 'number' ? raw.confidence : undefined,
    message: raw.message || undefined,
    requestId: raw.requestId || undefined,
  };
}

export const faceCheckInApi = {
  /**
   * Upload captured face photo to Backend FaceCheckInController: POST /training/face-check-in
   */
  async submitFaceCheckIn(photoFilePath: string): Promise<CheckInApiResult> {
    const file: MobileUploadFile = {
      uri: photoFilePath.startsWith('file://') ? photoFilePath : `file://${photoFilePath}`,
      name: 'face.jpg',
      type: 'image/jpeg',
    };

    const formData = createFileMultipartFormData(file, 'file');

    console.log('[FaceCheckInApi] 📡 Đang gửi ảnh lên Backend API: POST /training/face-check-in', { uri: file.uri });

    try {
      const response = await javaApi.post<BackendFaceCheckInResponse>(
        '/training/face-check-in',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('[FaceCheckInApi] 📥 Nhận phản hồi HTTP', response.status, response.data);

      const raw = response.data;
      const record = mapBackendResponseToRecord(raw);

      // Async flow: status is PENDING with requestId
      if (raw.status === 'PENDING') {
        return {
          success: true,
          isPending: true,
          requestId: raw.requestId || undefined,
          record,
        };
      }

      if (raw.status === 'REJECTED' || raw.status === 'FAILED' || raw.status === 'EXPIRED') {
        const failure = failureFromFaceCheckInResponse(raw);
        return {
          success: false,
          record,
          failure,
          errorType: failure.errorType,
          errorMessage: failure.message,
        };
      }

      return {
        success: true,
        isPending: false,
        record,
      };
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const responseData = error.response?.data;

        console.warn('[FaceCheckInApi] ⚠️ Backend trả về mã lỗi HTTP', status, responseData);

        const failure = error.response
          ? failureFromBackend(status, responseData)
          : networkFailure();
        return {
          success: false,
          failure,
          errorType: failure.errorType,
          errorMessage: failure.message,
        };
      }

      console.warn('[FaceCheckInApi] ⚠️ Lỗi không xác định khi gọi API điểm danh', error);
      const failure = networkFailure();
      return {
        success: false,
        failure,
        errorType: failure.errorType,
        errorMessage: failure.message,
      };
    }
  },

  /**
   * Poll face check-in request status: GET /training/face-check-ins/{requestId}
   */
  async getAttendanceCommand(requestId: string): Promise<AttendanceCommandApiResult> {
    try {
      const response = await javaApi.get<BackendFaceCheckInResponse>(
        `/training/face-check-ins/${requestId}`,
      );

      const raw = response.data;
      console.log('[FaceCheckInApi] 📥 Poll face check-in', requestId, raw.status);

      if (raw.status === 'SUCCESS') {
        const record = mapBackendResponseToRecord(raw);
        return {
          success: true,
          isPending: false,
          status: 'SUCCEEDED',
          requestId,
          record,
        };
      }

      if (raw.status === 'REJECTED' || raw.status === 'FAILED' || raw.status === 'EXPIRED') {
        const record = mapBackendResponseToRecord(raw);
        const failure = failureFromFaceCheckInResponse(raw);
        return {
          success: false,
          isPending: false,
          status: raw.status,
          requestId,
          record,
          failure,
          errorType: failure.errorType,
          errorMessage: failure.message,
        };
      }

      // PENDING or PROCESSING
      return {
        success: true,
        isPending: true,
        status: raw.status,
        requestId,
      };
    } catch (error) {
      if (isAxiosError(error)) {
        if (!error.response) {
          throw error;
        }

        const status = error.response?.status;
        const responseData = error.response?.data;
        const failure = failureFromBackend(status, responseData);

        return {
          success: false,
          isPending: false,
          status: 'FAILED',
          requestId,
          failure,
          errorType: failure.errorType,
          errorMessage: failure.message,
        };
      }

      const failure = networkFailure();
      return {
        success: false,
        isPending: false,
        status: 'FAILED',
        requestId,
        failure,
        errorType: failure.errorType,
        errorMessage: failure.message,
      };
    }
  },
};
