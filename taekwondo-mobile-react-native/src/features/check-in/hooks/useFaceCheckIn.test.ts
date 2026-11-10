import { act, renderHook } from '@testing-library/react-native';
import { faceCheckInApi } from '../services/faceCheckInApi';
import { useFaceCheckIn } from './useFaceCheckIn';

jest.mock('../services/faceCheckInApi', () => ({
  faceCheckInApi: {
    submitFaceCheckIn: jest.fn(),
    getAttendanceCommand: jest.fn(),
  },
}));

let mockCapturedCallback: ((photo: string) => Promise<void>) | null = null;
const mockResumeScanner = jest.fn();
const mockPauseScanner = jest.fn();
const mockSetScannerState = jest.fn();

jest.mock('./useFaceScanner', () => ({
  useFaceScanner: (props: {
    onFaceCaptured: (photo: string) => Promise<void>;
    isActive: boolean;
  }) => {
    if (props?.onFaceCaptured) {
      mockCapturedCallback = props.onFaceCaptured;
    }
    return {
      scannerState: 'scanning',
      feedbackMessage: 'Đang nhận diện...',
      qualityReason: 'NO_FACE',
      device: { id: 'front-camera' },
      photoOutput: {},
      faceDetectorOutput: {},
      resumeScanner: mockResumeScanner,
      pauseScanner: mockPauseScanner,
      setScannerState: mockSetScannerState,
      isActive: props.isActive,
    };
  },
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  impactAsync: jest.fn().mockResolvedValue(undefined),
  NotificationFeedbackType: {
    Success: 'Success',
    Warning: 'Warning',
    Error: 'Error',
  },
  ImpactFeedbackStyle: {
    Light: 'Light',
  },
}));

describe('useFaceCheckIn (Async Face Check-In)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts polling when faceCheckInApi returns PENDING status', async () => {
    (faceCheckInApi.submitFaceCheckIn as jest.Mock).mockResolvedValueOnce({
      success: true,
      isPending: true,
      requestId: 'req-123',
      record: {
        id: 'rec-pending',
        personId: 'p-1',
        code: 'HV001',
        fullName: 'Nguyễn Văn Test',
        role: 'STUDENT',
        status: 'ON_TIME',
        statusLabel: 'Đang xử lý',
        checkInTime: '18:00',
        dateLabel: 'Hôm nay',
        timestamp: Date.now(),
        confidence: 0.95,
      },
    });

    (faceCheckInApi.getAttendanceCommand as jest.Mock)
      .mockResolvedValueOnce({
        success: true,
        isPending: true,
        status: 'PROCESSING',
        requestId: 'req-123',
      })
      .mockResolvedValueOnce({
        success: true,
        isPending: false,
        status: 'SUCCEEDED',
        requestId: 'req-123',
        record: {
          id: 'rec-succeeded-123',
          personId: 'p-1',
          code: 'HV001',
          fullName: 'Nguyễn Văn Test',
          role: 'STUDENT',
          status: 'ON_TIME',
          statusLabel: 'Đúng giờ',
          checkInTime: '18:01',
          dateLabel: 'Hôm nay',
          timestamp: Date.now(),
          confidence: 0.95,
        },
      });

    const { result } = await renderHook(() =>
      useFaceCheckIn({ facing: 'front', isActive: true }),
    );

    // Trigger face captured
    await act(async () => {
      await mockCapturedCallback!('/path/to/face.jpg');
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.isResultSheetVisible).toBe(true);
    expect(result.current.currentResult?.fullName).toBe('Nguyễn Văn Test');
    expect(mockSetScannerState).toHaveBeenCalledWith('processing');

    // Advance timer for 1st poll (PROCESSING)
    await act(async () => {
      jest.advanceTimersByTime(750);
    });

    expect(faceCheckInApi.getAttendanceCommand).toHaveBeenCalledWith('req-123');
    expect(result.current.isPending).toBe(true);

    // Advance timer for 2nd poll (SUCCEEDED)
    await act(async () => {
      jest.advanceTimersByTime(750);
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.currentResult?.id).toBe('rec-succeeded-123');
    expect(result.current.sessionHistory).toHaveLength(1);
    expect(mockSetScannerState).toHaveBeenCalledWith('result');
  });

  it('retries transient polling errors and keeps waiting for the final result', async () => {
    (faceCheckInApi.submitFaceCheckIn as jest.Mock).mockResolvedValueOnce({
      success: true,
      isPending: true,
      requestId: 'req-retry-123',
      record: {
        id: 'rec-pending',
        personId: 'p-1',
        code: 'HV001',
        fullName: 'Nguyễn Văn Test',
        role: 'STUDENT',
        status: 'ON_TIME',
        statusLabel: 'Đang xử lý',
        checkInTime: '18:00',
        dateLabel: 'Hôm nay',
        timestamp: Date.now(),
        confidence: 0.95,
      },
    });

    (faceCheckInApi.getAttendanceCommand as jest.Mock)
      .mockRejectedValueOnce(new Error('Temporary network error'))
      .mockResolvedValueOnce({
        success: true,
        isPending: false,
        status: 'SUCCEEDED',
        requestId: 'req-retry-123',
        record: {
          id: 'rec-succeeded-retry',
          personId: 'p-1',
          code: 'HV001',
          fullName: 'Nguyễn Văn Test',
          role: 'STUDENT',
          status: 'ON_TIME',
          statusLabel: 'Đúng giờ',
          checkInTime: '18:01',
          dateLabel: 'Hôm nay',
          timestamp: Date.now(),
          confidence: 0.95,
        },
      });

    const { result } = await renderHook(() =>
      useFaceCheckIn({ facing: 'front', isActive: true }),
    );

    await act(async () => {
      await mockCapturedCallback!('/path/to/face.jpg');
    });

    await act(async () => {
      jest.advanceTimersByTime(750);
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.currentFailure).toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(750);
    });

    expect(faceCheckInApi.getAttendanceCommand).toHaveBeenCalledTimes(2);
    expect(result.current.isPending).toBe(false);
    expect(result.current.currentResult?.id).toBe('rec-succeeded-retry');
    expect(mockSetScannerState).toHaveBeenCalledWith('result');
  });

  it('handles async command rejection and maps error', async () => {
    (faceCheckInApi.submitFaceCheckIn as jest.Mock).mockResolvedValueOnce({
      success: true,
      isPending: true,
      requestId: 'req-failed-456',
      record: {
        id: 'rec-pending',
        personId: 'p-2',
        code: 'HV002',
        fullName: 'Trần Văn Lỗi',
        role: 'STUDENT',
        status: 'ON_TIME',
        statusLabel: 'Đang xử lý',
        checkInTime: '18:00',
        dateLabel: 'Hôm nay',
        timestamp: Date.now(),
        confidence: 0.92,
      },
    });

    (faceCheckInApi.getAttendanceCommand as jest.Mock).mockResolvedValueOnce({
      success: false,
      isPending: false,
      status: 'REJECTED',
      requestId: 'req-failed-456',
      failure: {
        errorType: 'ALREADY_CHECKED_IN',
        title: 'Đã điểm danh trước đó',
        message: 'Học viên đã điểm danh trong buổi học hôm nay',
        ctaLabel: 'Quét người khác',
      },
    });

    const { result } = await renderHook(() =>
      useFaceCheckIn({ facing: 'front', isActive: true }),
    );

    await act(async () => {
      await mockCapturedCallback!('/path/to/face.jpg');
    });

    expect(result.current.isPending).toBe(true);

    // Advance timer for 1st poll (REJECTED)
    await act(async () => {
      jest.advanceTimersByTime(750);
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.currentFailure?.errorType).toBe('ALREADY_CHECKED_IN');
    expect(result.current.currentFailure?.title).toBe('Đã điểm danh trước đó');
    expect(mockSetScannerState).toHaveBeenCalledWith('error');
  });

  it('stops polling and resets when cancelCheckIn is called', async () => {
    (faceCheckInApi.submitFaceCheckIn as jest.Mock).mockResolvedValueOnce({
      success: true,
      isPending: true,
      requestId: 'req-cancel-789',
      record: {
        id: 'rec-pending',
        personId: 'p-3',
        code: 'HV003',
        fullName: 'Lê Văn Cancel',
        role: 'STUDENT',
        status: 'ON_TIME',
        statusLabel: 'Đang xử lý',
        checkInTime: '18:00',
        dateLabel: 'Hôm nay',
        timestamp: Date.now(),
      },
    });

    const { result } = await renderHook(() =>
      useFaceCheckIn({ facing: 'front', isActive: true }),
    );

    await act(async () => {
      await mockCapturedCallback!('/path/to/face.jpg');
    });

    expect(result.current.isPending).toBe(true);

    // User cancels
    await act(async () => {
      result.current.cancelCheckIn();
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isResultSheetVisible).toBe(false);
    expect(result.current.currentResult).toBeNull();
    expect(mockResumeScanner).toHaveBeenCalled();

    // Advancing timers should not make any API calls
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(faceCheckInApi.getAttendanceCommand).not.toHaveBeenCalled();
  });

  it('times out after 8s if worker does not complete', async () => {
    (faceCheckInApi.submitFaceCheckIn as jest.Mock).mockResolvedValueOnce({
      success: true,
      isPending: true,
      requestId: 'req-timeout-999',
      record: {
        id: 'rec-pending',
        personId: 'p-4',
        code: 'HV004',
        fullName: 'Phạm Văn Chậm',
        role: 'STUDENT',
        status: 'ON_TIME',
        statusLabel: 'Đang xử lý',
        checkInTime: '18:00',
        dateLabel: 'Hôm nay',
        timestamp: Date.now(),
      },
    });

    (faceCheckInApi.getAttendanceCommand as jest.Mock).mockResolvedValue({
      success: true,
      isPending: true,
      status: 'PROCESSING',
      requestId: 'req-timeout-999',
    });

    const { result } = await renderHook(() =>
      useFaceCheckIn({ facing: 'front', isActive: true }),
    );

    await act(async () => {
      await mockCapturedCallback!('/path/to/face.jpg');
    });

    expect(result.current.isPending).toBe(true);

    // Advance time past 8s
    await act(async () => {
      jest.advanceTimersByTime(9000);
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.currentFailure?.title).toBe('Xử lý quá thời gian');
    expect(mockSetScannerState).toHaveBeenCalledWith('error');
  });
});
