import { javaApi } from '@/infrastructure/http/httpClient';
import { faceCheckInApi } from './faceCheckInApi';

jest.mock('@/infrastructure/http/httpClient', () => ({
  javaApi: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe('faceCheckInApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('submits captured face photo multipart to /training/face-check-in and parses student response', async () => {
    (javaApi.post as jest.Mock).mockResolvedValueOnce({
      data: {
        status: 'SUCCESS',
        action: 'STUDENT_CHECK_IN',
        person: {
          personId: 'p-100',
          fullName: 'Trần Văn A',
          personCode: 'HV00099',
          faceImagePath: 'https://example.com/avatar.jpg',
        },
        session: {
          classSessionId: 'sess-1',
          courseName: 'Lớp Taekwondo Cơ Bản K1',
          sessionDate: '2026-09-26',
          startTime: '18:00:00',
          endTime: '19:30:00',
        },
        recordId: 'rec-100',
        checkInTime: '2026-09-26T18:30:00',
        confidence: 0.873,
        attendanceStatus: 'ON_TIME',
        message: 'Face check-in completed',
      },
    });

    const result = await faceCheckInApi.submitFaceCheckIn('/path/to/face.jpg');

    expect(javaApi.post).toHaveBeenCalledWith(
      '/training/face-check-in',
      expect.any(FormData),
      expect.objectContaining({
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
    expect(result.success).toBe(true);
    expect(result.isPending).toBe(false);
    expect(result.record?.code).toBe('HV00099');
    expect(result.record?.role).toBe('STUDENT');
    expect(result.record?.fullName).toBe('Trần Văn A');
    expect(result.record?.courseName).toBe('Lớp Taekwondo Cơ Bản K1');
    expect(result.record?.statusLabel).toBe('Đúng giờ');
    expect(result.record?.confidence).toBe(0.873);
  });

  it('handles async 202 PENDING response with requestId and person summary', async () => {
    (javaApi.post as jest.Mock).mockResolvedValueOnce({
      status: 202,
      data: {
        status: 'PENDING',
        requestId: 'cmd-req-999',
        person: {
          personId: 'p-200',
          fullName: 'Nguyễn Thị C',
          personCode: 'HV00200',
          faceImagePath: 'https://example.com/c.jpg',
        },
        confidence: 0.942,
        message: 'Job submitted for async processing',
      },
    });

    const result = await faceCheckInApi.submitFaceCheckIn('/path/to/face.jpg');

    expect(result.success).toBe(true);
    expect(result.isPending).toBe(true);
    expect(result.requestId).toBe('cmd-req-999');
    expect(result.record).toEqual(
      expect.objectContaining({
        personId: 'p-200',
        fullName: 'Nguyễn Thị C',
        code: 'HV00200',
        role: 'STUDENT',
        confidence: 0.942,
        requestId: 'cmd-req-999',
      }),
    );
  });

  it('submits captured face photo multipart and parses coach timesheet response', async () => {
    (javaApi.post as jest.Mock).mockResolvedValueOnce({
      data: {
        status: 'SUCCESS',
        action: 'COACH_CHECKED_IN',
        person: {
          personId: 'p-101',
          fullName: 'Nguyễn HLV',
          personCode: 'NV00055',
          faceImagePath: 'https://example.com/coach.jpg',
        },
        session: {
          classSessionId: 'sess-2',
          courseName: 'Lớp Đối Kháng Nâng Cao',
          sessionDate: '2026-09-26',
          startTime: '19:30:00',
          endTime: '21:00:00',
        },
        recordId: 'rec-101',
        checkInTime: '2026-09-26T19:25:00',
        attendanceStatus: null,
        message: 'Coach timesheet updated',
      },
    });

    const result = await faceCheckInApi.submitFaceCheckIn('file:///path/to/face.jpg');

    expect(result.success).toBe(true);
    expect(result.record?.code).toBe('NV00055');
    expect(result.record?.role).toBe('COACH');
    expect(result.record?.fullName).toBe('Nguyễn HLV');
    expect(result.record?.courseName).toBe('Lớp Đối Kháng Nâng Cao');
    expect(result.record?.statusLabel).toBe('Đúng giờ');
  });

  it('maps FACE_NOT_DETECTED problem detail to a failure result without mock fallback', async () => {
    (javaApi.post as jest.Mock).mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 422,
        data: {
          code: 'FACE_NOT_DETECTED',
          title: 'Face not detected',
          detail: 'No face was detected in the image',
          correlationId: 'corr-1',
        },
      },
    });

    const result = await faceCheckInApi.submitFaceCheckIn('/path/to/face.jpg');

    expect(result.success).toBe(false);
    expect(result.record).toBeUndefined();
    expect(result.failure).toEqual(
      expect.objectContaining({
        errorType: 'NO_FACE',
        title: 'Không nhận được khuôn mặt',
        message: 'Vui lòng đưa khuôn mặt vào khung, giữ máy ổn định rồi thử lại.',
        correlationId: 'corr-1',
      }),
    );
  });

  it('maps HTTP 200 FAILED response to failure result with identified person summary', async () => {
    (javaApi.post as jest.Mock).mockResolvedValueOnce({
      data: {
        status: 'REJECTED',
        action: null,
        person: {
          personId: 'p-102',
          fullName: 'Lê Văn B',
          personCode: 'VQ_102',
          faceImagePath: 'https://example.com/person.jpg',
        },
        session: null,
        recordId: null,
        checkInTime: null,
        checkOutTime: null,
        confidence: 0.812,
        attendanceStatus: null,
        message: 'No active attendance context was found for this person',
        error: {
          code: 'FACE_CHECK_IN_NO_ACTIVE_CONTEXT',
          title: 'No active face check-in context',
          detail: 'No active attendance context was found for this person',
        },
      },
    });

    const result = await faceCheckInApi.submitFaceCheckIn('/path/to/face.jpg');

    expect(result.success).toBe(false);
    expect(result.record).toEqual(
      expect.objectContaining({
        personId: 'p-102',
        fullName: 'Lê Văn B',
        code: 'VQ_102',
        role: 'STUDENT',
        confidence: 0.812,
      }),
    );
    expect(result.failure).toEqual(
      expect.objectContaining({
        errorType: 'NO_ACTIVE_SESSION',
        title: 'Không có lịch phù hợp',
      }),
    );
  });

  it('polls face check-in status with SUCCESS status and maps result', async () => {
    (javaApi.get as jest.Mock).mockResolvedValueOnce({
      data: {
        requestId: 'cmd-req-999',
        status: 'SUCCESS',
        action: 'STUDENT_CHECK_IN',
        person: {
          personId: 'p-200',
          fullName: 'Nguyễn Thị C',
          personCode: 'HV00200',
          faceImagePath: 'https://example.com/c.jpg',
        },
        session: {
          classSessionId: 'sess-1',
          courseName: 'Lớp Quyền Nâng Cao',
          sessionDate: '2026-09-28',
          startTime: '17:30:00',
          endTime: '19:00:00',
        },
        recordId: 'rec-async-200',
        checkInTime: '2026-09-28T17:32:00',
        confidence: 0.942,
        attendanceStatus: 'ON_TIME',
        message: 'Attendance saved',
      },
    });

    const result = await faceCheckInApi.getAttendanceCommand('cmd-req-999');

    expect(javaApi.get).toHaveBeenCalledWith('/training/face-check-ins/cmd-req-999');
    expect(result.success).toBe(true);
    expect(result.isPending).toBe(false);
    expect(result.status).toBe('SUCCEEDED');
    expect(result.record?.id).toBe('rec-async-200');
    expect(result.record?.fullName).toBe('Nguyễn Thị C');
    expect(result.record?.courseName).toBe('Lớp Quyền Nâng Cao');
    expect(result.record?.statusLabel).toBe('Đúng giờ');
  });

  it('polls face check-in status with REJECTED status and maps no active context error', async () => {
    (javaApi.get as jest.Mock).mockResolvedValueOnce({
      data: {
        requestId: 'cmd-req-999',
        status: 'REJECTED',
        action: null,
        person: {
          personId: 'p-102',
          fullName: 'Lê Văn B',
          personCode: 'VQ_102',
          faceImagePath: 'https://example.com/person.jpg',
        },
        session: null,
        recordId: null,
        checkInTime: null,
        checkOutTime: null,
        confidence: 0.812,
        attendanceStatus: null,
        message: 'No active attendance context was found for this person',
        error: {
          code: 'FACE_CHECK_IN_NO_ACTIVE_CONTEXT',
          title: 'No active face check-in context',
          detail: 'No active attendance context was found for this person',
        },
      },
    });

    const result = await faceCheckInApi.getAttendanceCommand('cmd-req-999');

    expect(result.success).toBe(false);
    expect(result.isPending).toBe(false);
    expect(result.status).toBe('REJECTED');
    expect(result.failure?.errorType).toBe('NO_ACTIVE_SESSION');
    expect(result.failure?.title).toBe('Không có lịch phù hợp');
    expect(result.record?.fullName).toBe('Lê Văn B');
  });

  it('polls face check-in status with PROCESSING status', async () => {
    (javaApi.get as jest.Mock).mockResolvedValueOnce({
      data: {
        requestId: 'cmd-req-999',
        status: 'PROCESSING',
        person: {
          personId: 'p-200',
          fullName: 'Nguyễn Thị C',
          personCode: 'HV00200',
        },
      },
    });

    const result = await faceCheckInApi.getAttendanceCommand('cmd-req-999');

    expect(result.success).toBe(true);
    expect(result.isPending).toBe(true);
    expect(result.status).toBe('PROCESSING');
  });

  it('throws polling network errors so the hook can retry until timeout', async () => {
    const networkError = {
      isAxiosError: true,
      request: {},
    };
    (javaApi.get as jest.Mock).mockRejectedValueOnce(networkError);

    await expect(faceCheckInApi.getAttendanceCommand('cmd-req-999')).rejects.toBe(
      networkError,
    );
  });

  it('maps FACE_NOT_MATCHED problem detail to a failure result', async () => {
    (javaApi.post as jest.Mock).mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 404,
        data: {
          code: 'FACE_NOT_MATCHED',
          detail: 'No registered person matched this face',
        },
      },
    });

    const result = await faceCheckInApi.submitFaceCheckIn('/path/to/face.jpg');

    expect(result.success).toBe(false);
    expect(result.failure).toEqual(
      expect.objectContaining({
        errorType: 'PERSON_NOT_FOUND',
        title: 'Không khớp hồ sơ',
      }),
    );
  });

  it('maps network errors to a failure result without mock fallback', async () => {
    (javaApi.post as jest.Mock).mockRejectedValueOnce({
      isAxiosError: true,
      request: {},
    });

    const result = await faceCheckInApi.submitFaceCheckIn('/path/to/face.jpg');

    expect(result.success).toBe(false);
    expect(result.record).toBeUndefined();
    expect(result.failure).toEqual(
      expect.objectContaining({
        errorType: 'NETWORK_ERROR',
        title: 'Không kết nối được máy chủ',
      }),
    );
  });
});
