import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor, act } from '@testing-library/react-native';

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockToastShow = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock('@/features/authorization/hooks/useAccess', () => ({
  useCan: () => true,
}));

jest.mock('@/shared/ui/Toast', () => ({
  useToast: () => ({ show: mockToastShow }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: {
      View: (props: object) => React.createElement(View, props),
    },
    useSharedValue: (initialValue: unknown) => ({
      get: () => initialValue,
      set: jest.fn(),
    }),
    useAnimatedStyle: (fn: () => object) => fn(),
    useReducedMotion: () => false,
    withTiming: (toValue: unknown) => toValue,
    Easing: {
      bezier: () => () => 0,
    },
  };
});

jest.mock('@/shared/ui/AppIcon', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    AppIcon: () => React.createElement(View, null),
  };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
  },
}));

jest.mock('@/routes/navigation/layouts/StackScreenLayout', () => ({
  __esModule: true,
  default: ({
    children,
    floatingContent,
  }: {
    children: React.ReactNode;
    floatingContent?: React.ReactNode;
  }) => {
    const { View } = require('react-native');
    return (
      <View>
        {children}
        {floatingContent}
      </View>
    );
  },
}));

jest.mock('@/shared/ui/BottomSheetWindow', () => ({
  BottomSheetWindow: ({
    visible,
    children,
    footer,
    overlay,
  }: {
    visible: boolean;
    children: React.ReactNode;
    footer?: React.ReactNode;
    overlay?: React.ReactNode;
  }) => {
    const { View } = require('react-native');
    return visible ? (
      <View testID="bottom-sheet-window">
        {children}
        {footer}
        {overlay}
      </View>
    ) : null;
  },
}));

jest.mock('@/features/course/api/courseApi', () => ({
  courseApi: {
    get: jest.fn().mockImplementation((id: string) => {
      const { getCommerceState, getCourse } = require('@/features/student-commerce/utils/studentCommerceUtils');
      const state = getCommerceState();
      const course = getCourse(state.courses, id);
      if (course) {
        return Promise.resolve({
          courseId: course.courseId,
          courseSchedules: [
            {
              courseScheduleId: 'schedule-1',
              classSchedule: {
                scheduleId: 'class-schedule-1',
                branch: { branchId: 1, name: 'Văn Quán' },
                weekday: 'TUESDAY',
                location: 'INDOOR',
                status: 'ACTIVE',
                startTime: '18:00:00',
                endTime: '19:30:00',
              },
              staffAssignments: [
                {
                  courseStaffAssignmentId: 'assignment-primary',
                  staffPerson: { personId: 'coach-1', fullName: 'HLV Nguyễn Văn A' },
                  assignmentType: 'PRIMARY_COACH',
                },
                {
                  courseStaffAssignmentId: 'assignment-assistant',
                  staffPerson: { personId: 'assistant-1', fullName: 'Trợ giảng B' },
                  assignmentType: 'TEACHING_ASSISTANT',
                },
              ],
              startDate: '2026-01-01',
              endDate: null,
              status: 'ACTIVE',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          name: course.courseName ?? course.title ?? 'Taekwondo Cơ bản',
          level: 'BASIC',
          capacity: course.capacity ?? 20,
          currentStudentCount: course.enrolledStudentCount ?? course.enrolledCount ?? 15,
          status: course.catalogStatus === 'ended' ? 'CLOSED' : 'ACTIVE',
          classSessionGeneratedUntil: null,
          nextScheduleEffectiveFrom: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      return Promise.reject(new Error('Course not found'));
    }),
    update: jest.fn(),
    updateSchedule: jest.fn(),
    removeSchedule: jest.fn(),
    remove: jest.fn(),
  },
}));

import { courseApi } from '@/features/course/api/courseApi';
import { AdminCourseDetailScreen } from './AdminCourseDetailScreen';

let activeQueryClient: QueryClient | null = null;

async function renderWithQuery(ui: React.ReactElement) {
  activeQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  return await render(
    <QueryClientProvider client={activeQueryClient}>{ui}</QueryClientProvider>,
  );
}

describe('AdminCourseDetailScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockBack.mockClear();
    mockToastShow.mockClear();
    (courseApi.update as jest.Mock).mockReset();
    (courseApi.updateSchedule as jest.Mock).mockReset();
    (courseApi.removeSchedule as jest.Mock).mockReset();
    (courseApi.remove as jest.Mock).mockReset();
    (courseApi.update as jest.Mock).mockResolvedValue({
      courseId: 'basic',
      courseSchedules: [],
      name: 'Lớp Taekwondo Cơ Bản Cập Nhật',
      level: 'BASIC',
      capacity: 35,
      currentStudentCount: 15,
      status: 'ACTIVE',
      classSessionGeneratedUntil: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  afterEach(() => {
    activeQueryClient?.clear();
    activeQueryClient = null;
  });

  it('navigates to package list screen when package action button is pressed', async () => {
    const view = await renderWithQuery(<AdminCourseDetailScreen courseId="basic" />);

    const packageButton = await view.findByLabelText('Xem danh sách gói học');
    expect(packageButton).toBeTruthy();
    expect(packageButton.props.accessibilityState).toEqual({ disabled: false });

    await fireEvent.press(packageButton);
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/packages'));
  });

  it('shows schedule staff roles and derives roster counts from assignments', async () => {
    const view = await renderWithQuery(<AdminCourseDetailScreen courseId="basic" />);

    expect(await view.findByText('HLV Nguyễn Văn A')).toBeTruthy();
    expect(view.getByText('HLV chính')).toBeTruthy();
    expect(view.getByText('Trợ giảng B')).toBeTruthy();
    expect(view.getByText('Huấn luyện viên (1)')).toBeTruthy();
    expect(view.getByText('Trợ giảng (1)')).toBeTruthy();
  });

  it('keeps Schedule Detail open while confirming and cancelling schedule deletion', async () => {
    const view = await renderWithQuery(<AdminCourseDetailScreen courseId="basic" />);

    await fireEvent.press(await view.findByLabelText('Xem chi tiết lịch Thứ Ba'));
    expect(await view.findByLabelText('Xóa lịch học')).toBeTruthy();

    await fireEvent.press(view.getByLabelText('Xóa lịch học'));
    expect(view.getByTestId('bottom-sheet-window')).toBeTruthy();
    expect(view.getByTestId('confirmation-dialog')).toBeTruthy();
    expect(view.getByText('Xóa lịch học')).toBeTruthy();

    await fireEvent.press(view.getByText('Hủy'));
    expect(view.queryByTestId('confirmation-dialog')).toBeNull();
    expect(view.getByTestId('bottom-sheet-window')).toBeTruthy();
    expect(courseApi.removeSchedule).not.toHaveBeenCalled();
  });

  it('replaces schedule deletion confirmation with cancellable loading and closes only after success', async () => {
    let resolveDelete!: () => void;
    (courseApi.removeSchedule as jest.Mock).mockImplementation(() => new Promise<void>((resolve) => {
      resolveDelete = resolve;
    }));
    const view = await renderWithQuery(<AdminCourseDetailScreen courseId="basic" />);

    await fireEvent.press(await view.findByLabelText('Xem chi tiết lịch Thứ Ba'));
    await fireEvent.press(view.getByLabelText('Xóa lịch học'));
    await fireEvent.press(view.getByText('Xóa'));

    await waitFor(() => {
      expect(courseApi.removeSchedule).toHaveBeenCalledWith(
        'schedule-1',
        expect.objectContaining({ signal: expect.any(Object) }),
      );
      expect(view.queryByTestId('confirmation-dialog')).toBeNull();
      expect(view.getByText('Đang xóa lịch học...')).toBeTruthy();
    });

    // Keep the background refetch pending so this assertion verifies the
    // synchronous detail-cache update rather than a later network response.
    (courseApi.get as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));

    await act(async () => {
      resolveDelete();
    });

    await waitFor(() => {
      expect(view.queryByTestId('bottom-sheet-window')).toBeNull();
      expect(mockToastShow).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Xóa lịch học thành công', variant: 'success' }),
      );
      expect(view.queryByLabelText('Xem chi tiết lịch Thứ Ba')).toBeNull();
      expect((activeQueryClient?.getQueryData(['courses', 'basic']) as { courseSchedules: unknown[] })
        .courseSchedules).toHaveLength(0);
    });
  });

  it('keeps Schedule Detail open without an error toast when schedule deletion is cancelled', async () => {
    (courseApi.removeSchedule as jest.Mock).mockImplementation((_id, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => {
        const error = new Error('Canceled');
        error.name = 'AbortError';
        reject(error);
      });
    }));
    const view = await renderWithQuery(<AdminCourseDetailScreen courseId="basic" />);

    await fireEvent.press(await view.findByLabelText('Xem chi tiết lịch Thứ Ba'));
    await fireEvent.press(view.getByLabelText('Xóa lịch học'));
    await fireEvent.press(view.getByText('Xóa'));
    await waitFor(() => expect(view.getByText('Đang xóa lịch học...')).toBeTruthy());

    await fireEvent.press(view.getByLabelText('Hủy'));
    await waitFor(() => {
      expect(view.getByTestId('bottom-sheet-window')).toBeTruthy();
      expect(view.queryByText('Đang xóa lịch học...')).toBeNull();
      expect(mockToastShow).not.toHaveBeenCalledWith(expect.objectContaining({ variant: 'error' }));
    });
  });

  it('keeps Schedule Detail open and reports a 409 conflict from schedule deletion', async () => {
    const conflict = Object.assign(new Error('Lịch học đã có buổi học liên quan.'), {
      isAxiosError: true,
      response: { status: 409 },
    });
    (courseApi.removeSchedule as jest.Mock).mockRejectedValue(conflict);
    const view = await renderWithQuery(<AdminCourseDetailScreen courseId="basic" />);

    await fireEvent.press(await view.findByLabelText('Xem chi tiết lịch Thứ Ba'));
    await fireEvent.press(view.getByLabelText('Xóa lịch học'));
    await fireEvent.press(view.getByText('Xóa'));

    await waitFor(() => {
      expect(view.getByTestId('bottom-sheet-window')).toBeTruthy();
      expect(view.queryByText('Đang xóa lịch học...')).toBeNull();
      expect(mockToastShow).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Lịch học đã có buổi học liên quan.',
          variant: 'error',
        }),
      );
    });
  });

  it('opens course edit bottom sheet and pre-fills the course level', async () => {
    const view = await renderWithQuery(<AdminCourseDetailScreen courseId="basic" />);

    const editButton = await view.findByLabelText('Chỉnh sửa khóa học');
    await fireEvent.press(editButton);

    await waitFor(() => {
      expect(view.getByTestId('bottom-sheet-window')).toBeTruthy();
      expect(view.getByLabelText('Tên khóa học')).toBeTruthy();
      expect(view.getByLabelText('Sức chứa tối đa (học viên)')).toBeTruthy();
      expect(view.getAllByText('Cơ bản').length).toBeGreaterThan(0);
      expect(view.getAllByText('Đang diễn ra').length).toBeGreaterThan(0);
    });

    const saveButton = view.getByLabelText('Lưu thay đổi');
    expect(saveButton).toBeTruthy();
    expect(saveButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('enables Save button when changes exist, calls courseApi.update, shows cancellable loading, and updates on success', async () => {
    const updatedResponse = {
      courseId: 'basic',
      courseSchedules: [],
      name: 'Lớp Taekwondo Cơ Bản Cập Nhật',
      level: 'ADVANCED' as const,
      capacity: 35,
      currentStudentCount: 15,
      status: 'ACTIVE' as const,
      classSessionGeneratedUntil: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let resolvePromise: (val: unknown) => void;
    const updatePromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (courseApi.update as jest.Mock).mockImplementation(() => updatePromise);

    const view = await renderWithQuery(<AdminCourseDetailScreen courseId="basic" />);

    const editButton = await view.findByLabelText('Chỉnh sửa khóa học');
    await fireEvent.press(editButton);

    const nameInput = await view.findByLabelText('Tên khóa học');
    const capacityInput = await view.findByLabelText('Sức chứa tối đa (học viên)');

    // Change course name and capacity
    await fireEvent.changeText(nameInput, 'Lớp Taekwondo Cơ Bản Cập Nhật');
    await fireEvent.changeText(capacityInput, '35');
    await fireEvent.press(view.getByText('Nâng cao'));

    // Click Save
    await waitFor(() => {
      const btn = view.getByLabelText('Lưu thay đổi');
      expect(btn.props.accessibilityState?.disabled).toBe(false);
    });

    await fireEvent.press(view.getByLabelText('Lưu thay đổi'));

    // Verify API called with signal
    await waitFor(() => {
      expect(courseApi.update).toHaveBeenCalledWith(
        'basic',
        {
          name: 'Lớp Taekwondo Cơ Bản Cập Nhật',
          level: 'ADVANCED',
          capacity: 35,
          status: 'ACTIVE',
        },
        expect.objectContaining({ signal: expect.any(Object) }),
      );
    });

    // Loading overlay is visible with cancel button
    await waitFor(() => {
      expect(view.getByText('Đang lưu thay đổi khóa học...')).toBeTruthy();
      expect(view.getByLabelText('Hủy')).toBeTruthy();
    });

    // Resolve update
    await act(async () => {
      resolvePromise!(updatedResponse);
    });

    await waitFor(() => {
      // Bottom sheet should close
      expect(view.queryByTestId('bottom-sheet-window')).toBeNull();
      // Toast success should be shown
      expect(mockToastShow).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('thành công'),
          variant: 'success',
        }),
      );
    });
  });

  it('allows cancelling in-flight update with Hủy button and keeps bottom sheet open without error toast', async () => {
    (courseApi.update as jest.Mock).mockImplementation((_id, _req, options) => {
      return new Promise((_resolve, reject) => {
        options?.signal?.addEventListener('abort', () => {
          const abortErr = new Error('Canceled');
          abortErr.name = 'AbortError';
          reject(abortErr);
        });
      });
    });

    const view = await renderWithQuery(<AdminCourseDetailScreen courseId="basic" />);

    const editButton = await view.findByLabelText('Chỉnh sửa khóa học');
    await fireEvent.press(editButton);

    const nameInput = await view.findByLabelText('Tên khóa học');
    await fireEvent.changeText(nameInput, 'Tên Khác');

    await waitFor(() => {
      const btn = view.getByLabelText('Lưu thay đổi');
      expect(btn.props.accessibilityState?.disabled).toBe(false);
    });
    await fireEvent.press(view.getByLabelText('Lưu thay đổi'));

    // Loading appears
    await waitFor(() => expect(view.getByText('Đang lưu thay đổi khóa học...')).toBeTruthy());

    // Press Cancel in loading overlay
    const cancelButton = view.getByLabelText('Hủy');
    await fireEvent.press(cancelButton);

    // Sheet should remain open with the modified value
    await waitFor(() => {
      expect(view.getByTestId('bottom-sheet-window')).toBeTruthy();
      expect(view.getByDisplayValue('Tên Khác')).toBeTruthy();
      // No error toast for user abort
      expect(mockToastShow).not.toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'error' }),
      );
    });
  });

  it('keeps bottom sheet open and displays error toast when update fails', async () => {
    (courseApi.update as jest.Mock).mockRejectedValue(new Error('Tên khóa học không hợp lệ'));

    const view = await renderWithQuery(<AdminCourseDetailScreen courseId="basic" />);

    const editButton = await view.findByLabelText('Chỉnh sửa khóa học');
    await fireEvent.press(editButton);

    const nameInput = await view.findByLabelText('Tên khóa học');
    await fireEvent.changeText(nameInput, 'Tên Bị Lỗi');

    await waitFor(() => {
      const btn = view.getByLabelText('Lưu thay đổi');
      expect(btn.props.accessibilityState?.disabled).toBe(false);
    });
    await fireEvent.press(view.getByLabelText('Lưu thay đổi'));

    await waitFor(() => {
      // Sheet remains open
      expect(view.getByTestId('bottom-sheet-window')).toBeTruthy();
      // Error toast shown
      expect(mockToastShow).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Tên khóa học không hợp lệ'),
          variant: 'error',
        }),
      );
    });
  });

  it('opens confirmation dialog on delete button click and cancels when Hủy is pressed', async () => {
    const view = await renderWithQuery(<AdminCourseDetailScreen courseId="basic" />);

    const deleteButton = await view.findByLabelText('Xóa khóa học');
    await fireEvent.press(deleteButton);

    const dialog = await view.findByTestId('confirmation-dialog');
    expect(dialog).toBeTruthy();
    expect(view.getByText('Xóa khóa học')).toBeTruthy();
    expect(view.getByText(/Bạn có chắc chắn muốn xóa khóa học/)).toBeTruthy();

    const cancelButton = view.getByText('Hủy');
    await fireEvent.press(cancelButton);

    await waitFor(() => {
      expect(courseApi.remove).not.toHaveBeenCalled();
    });
  });

  it('calls courseApi.remove, shows cancellable loading overlay, and navigates back on confirmation', async () => {
    let resolveDelete: () => void;
    const deletePromise = new Promise<void>((resolve) => {
      resolveDelete = resolve;
    });
    (courseApi.remove as jest.Mock).mockImplementation(() => deletePromise);

    const view = await renderWithQuery(<AdminCourseDetailScreen courseId="basic" />);

    const deleteButton = await view.findByLabelText('Xóa khóa học');
    await fireEvent.press(deleteButton);

    const confirmButton = await view.findByText('Xóa');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(courseApi.remove).toHaveBeenCalledWith(
        'basic',
        expect.objectContaining({ signal: expect.any(Object) }),
      );
    });

    // Loading overlay is visible
    expect(view.getByText('Đang xóa khóa học...')).toBeTruthy();

    // Resolve delete
    await act(async () => {
      resolveDelete!();
    });

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('thành công'),
          variant: 'success',
        }),
      );
      expect(mockBack).toHaveBeenCalled();
    });
  });

  it('allows cancelling in-flight delete with overlay Hủy button and shows no error toast', async () => {
    (courseApi.remove as jest.Mock).mockImplementation((_id, options) => {
      return new Promise((_resolve, reject) => {
        options?.signal?.addEventListener('abort', () => {
          const abortErr = new Error('Canceled');
          abortErr.name = 'AbortError';
          reject(abortErr);
        });
      });
    });

    const view = await renderWithQuery(<AdminCourseDetailScreen courseId="basic" />);

    const deleteButton = await view.findByLabelText('Xóa khóa học');
    await fireEvent.press(deleteButton);

    const confirmButton = await view.findByText('Xóa');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(view.getByText('Đang xóa khóa học...')).toBeTruthy();
    });

    const cancelOverlayBtn = view.getByLabelText('Hủy');
    await fireEvent.press(cancelOverlayBtn);

    await waitFor(() => {
      expect(mockBack).not.toHaveBeenCalled();
      expect(mockToastShow).not.toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'error' }),
      );
    });
  });
});
