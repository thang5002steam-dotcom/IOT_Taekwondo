import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { courseApi } from "@/features/course/api/courseApi";
import { formatDateYMD } from "@/shared/utils/dateTime";

import { CourseCreateSheet } from "./CourseCreateSheet";

const mockToastShow = jest.fn();
const mockRefetchSchedules = jest.fn();
let mockClassSchedulesQuery: Record<string, unknown>;

jest.mock("@/features/course/queries/courseCatalogQueries", () => ({
  useCourseCreateOptions: () => mockClassSchedulesQuery,
  useCreateCourse: () => ({
    mutateAsync: ({ request, signal }: { request: unknown; signal?: AbortSignal }) => {
      const { courseApi } = require("@/features/course/api/courseApi");
      return courseApi.create(request, { signal });
    },
  }),
}));

jest.mock("@/shared/ui/Toast", () => ({
  useToast: () => ({ show: mockToastShow }),
}));

jest.mock("@/features/course/api/courseApi", () => ({
  courseApi: {
    create: jest.fn(),
  },
}));

jest.mock("@/shared/ui/AppIcon", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    AppIcon: () => React.createElement(View, null),
  };
});

jest.mock("@/shared/ui/BottomSheetWindow", () => {
  const React = require("react");
  const { Pressable, Text, View } = require("react-native");

  return {
    BottomSheetWindow: ({
      visible,
      title,
      accessibilityLabel,
      children,
      footer,
      overlay,
      onClose,
    }: {
      visible: boolean;
      title: string;
      accessibilityLabel?: string;
      children: React.ReactNode;
      footer?: React.ReactNode;
      overlay?: React.ReactNode;
      onClose: () => void;
    }) =>
      visible
        ? React.createElement(
            View,
            { accessibilityLabel: accessibilityLabel ?? title },
            React.createElement(Text, null, title),
            React.createElement(
              Pressable,
              {
                accessibilityRole: "button",
                accessibilityLabel: `Đóng ${title}`,
                onPress: onClose,
              },
              React.createElement(Text, null, "Đóng"),
            ),
            children,
            footer,
            overlay,
          )
        : null,
  };
});

jest.mock("@/shared/ui/CancellableLoadingOverlay", () => {
  const React = require("react");
  const { Pressable, Text, View } = require("react-native");

  return {
    CancellableLoadingOverlay: ({
      visible,
      message,
      cancelLabel,
      onCancel,
    }: {
      visible: boolean;
      message: string;
      cancelLabel: string;
      onCancel: () => void;
    }) =>
      visible
        ? React.createElement(
            View,
            { accessibilityLabel: "Đang xử lý" },
            React.createElement(Text, null, message),
            React.createElement(
              Pressable,
              {
                accessibilityRole: "button",
                accessibilityLabel: cancelLabel,
                onPress: onCancel,
              },
              React.createElement(Text, null, cancelLabel),
            ),
          )
        : null,
  };
});

const classSchedule = {
  scheduleId: "schedule-api-1",
  branch: {
    branchId: 1,
    name: "Cơ sở Trung tâm",
    address: "Hà Nội",
    hotline: "0123456789",
    status: "ACTIVE" as const,
  },
  weekday: "MONDAY" as const,
  location: "INDOOR" as const,
  status: "ACTIVE" as const,
  startTime: "18:00:00",
  endTime: "19:30:00",
};

const secondClassSchedule = {
  ...classSchedule,
  scheduleId: "schedule-api-2",
  branch: {
    ...classSchedule.branch,
    branchId: 2,
    name: "Cơ sở Tây Hồ",
  },
  weekday: "TUESDAY" as const,
};

const createdCourse = {
  courseId: "course-created-1",
  courseSchedules: [],
  name: "Khóa học mới",
  level: "BASIC" as const,
  capacity: 25,
  currentStudentCount: 0,
  status: "OPEN" as const,
  classSessionGeneratedUntil: null,
  createdAt: "2026-10-14T00:00:00",
  updatedAt: "2026-10-14T00:00:00",
};

async function renderSheet() {
  const onClose = jest.fn();
  const onSuccess = jest.fn();
  const screen = await render(
    <CourseCreateSheet
      visible={true}
      onClose={onClose}
      onSuccess={onSuccess}
    />,
  );
  return { screen, onClose, onSuccess };
}

async function fillValidForm(
  screen: Awaited<ReturnType<typeof render>>,
) {
  await fireEvent.changeText(
    screen.getByLabelText("Tên khóa học *"),
    "Khóa học mới",
  );
  await fireEvent.changeText(screen.getByLabelText("Sức chứa tối đa *"), "25");
  await fireEvent.press(screen.getByText("Cơ bản"));

  await fireEvent.press(screen.getByLabelText("Lịch lớp *: Chọn lịch lớp"));
  await fireEvent.press(
    screen.getByLabelText(
      "Cơ sở Trung tâm, Thứ Hai, 18:00 đến 19:30, Phòng tập",
    ),
  );
  await fireEvent.press(screen.getByLabelText("Chọn"));
}

describe("CourseCreateSheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClassSchedulesQuery = {
      data: {
        content: [classSchedule, secondClassSchedule],
        pageNumber: 0,
        pageSize: 200,
        totalElements: 2,
        totalPages: 1,
        first: true,
        last: true,
        empty: false,
      },
      isLoading: false,
      error: null,
      refetch: mockRefetchSchedules,
    };
  });

  it("uses the required defaults and restores them with Hoàn tác", async () => {
    const { screen } = await renderSheet();
    const today = formatDateYMD(Date.now());

    expect(screen.getByDisplayValue(today)).toBeTruthy();
    expect(screen.getByText("Mở đăng ký")).toBeTruthy();
    expect(screen.getByText("Hoạt động")).toBeTruthy();
    expect(screen.getByLabelText("Lưu").props.accessibilityState.disabled).toBe(true);

    await fireEvent.changeText(
      screen.getByLabelText("Tên khóa học *"),
      "Bị xóa",
    );
    await fireEvent.changeText(
      screen.getByLabelText("Sức chứa tối đa *"),
      "30",
    );
    await fireEvent.press(screen.getByLabelText("Thêm lịch học"));
    expect(screen.getByText("Lịch học 2")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("Hoàn tác"));

    expect(screen.getByLabelText("Tên khóa học *").props.value).toBe("");
    expect(screen.getByLabelText("Sức chứa tối đa *").props.value).toBe("");
    expect(screen.queryByText("Lịch học 2")).toBeNull();
    expect(screen.getByDisplayValue(today)).toBeTruthy();
  });

  it("creates the CourseCreateRequest and reports success", async () => {
    const mockCreate = courseApi.create as jest.MockedFunction<typeof courseApi.create>;
    mockCreate.mockResolvedValue(createdCourse);
    const { screen, onSuccess } = await renderSheet();

    await fillValidForm(screen);
    await fireEvent.press(screen.getByLabelText("Lưu"));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    expect(mockCreate.mock.calls[0][0]).toEqual({
      name: "Khóa học mới",
      level: "BASIC",
      capacity: 25,
      status: "OPEN",
      courseSchedules: [
        {
          classScheduleId: "schedule-api-1",
          startDate: formatDateYMD(Date.now()),
          endDate: null,
          status: "ACTIVE",
        },
      ],
    });
    expect(mockCreate.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith({
        message: "Tạo khóa học thành công",
        variant: "success",
      });
      expect(onSuccess).toHaveBeenCalledWith(createdCourse);
    });
  });

  it("validates capacity and date boundaries before enabling save", async () => {
    const { screen } = await renderSheet();

    await fireEvent.changeText(screen.getByLabelText("Tên khóa học *"), "Lớp tối");
    await fireEvent.changeText(screen.getByLabelText("Sức chứa tối đa *"), "0");
    await fireEvent.press(screen.getByLabelText("Lịch lớp *: Chọn lịch lớp"));
    await fireEvent.press(
      screen.getByLabelText(
        "Cơ sở Trung tâm, Thứ Hai, 18:00 đến 19:30, Phòng tập",
      ),
    );
    await fireEvent.press(screen.getByLabelText("Chọn"));

    expect(
      screen.getByText("Sức chứa phải là số nguyên lớn hơn 0."),
    ).toBeTruthy();
    expect(screen.getByLabelText("Lưu").props.accessibilityState.disabled).toBe(
      true,
    );

    await fireEvent.changeText(screen.getByLabelText("Sức chứa tối đa *"), "20");
    await fireEvent.changeText(screen.getByLabelText("Ngày bắt đầu *"), "2026-02-30");
    expect(
      screen.getByText("Ngày bắt đầu phải đúng định dạng YYYY-MM-DD."),
    ).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText("Ngày bắt đầu *"), "2026-10-14");
    await fireEvent.changeText(screen.getByLabelText("Ngày kết thúc"), "2026-10-13");
    expect(
      screen.getByText("Ngày kết thúc không được trước ngày bắt đầu."),
    ).toBeTruthy();
    expect(screen.getByLabelText("Lưu").props.accessibilityState.disabled).toBe(
      true,
    );
  });

  it("creates a payload with multiple class schedules", async () => {
    const mockCreate = courseApi.create as jest.MockedFunction<typeof courseApi.create>;
    mockCreate.mockResolvedValue(createdCourse);
    const { screen } = await renderSheet();

    await fillValidForm(screen);
    await fireEvent.press(screen.getByLabelText("Thêm lịch học"));
    await fireEvent.press(screen.getByLabelText("Lịch lớp *: Chọn lịch lớp"));
    await fireEvent.press(
      screen.getByLabelText(
        "Cơ sở Tây Hồ, Thứ Ba, 18:00 đến 19:30, Phòng tập",
      ),
    );
    await fireEvent.press(screen.getByLabelText("Chọn"));
    await fireEvent.press(screen.getByLabelText("Lưu"));

    await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
    expect(mockCreate.mock.calls[0][0].courseSchedules).toEqual([
      {
        classScheduleId: "schedule-api-1",
        startDate: formatDateYMD(Date.now()),
        endDate: null,
        status: "ACTIVE",
      },
      {
        classScheduleId: "schedule-api-2",
        startDate: formatDateYMD(Date.now()),
        endDate: null,
        status: "ACTIVE",
      },
    ]);
  });

  it("automatically creates additional schedules when multiple options are selected in PickerPopover without closing BottomSheetWindow", async () => {
    const mockCreate = courseApi.create as jest.MockedFunction<typeof courseApi.create>;
    mockCreate.mockResolvedValue(createdCourse);
    const { screen } = await renderSheet();

    await fireEvent.changeText(
      screen.getByLabelText("Tên khóa học *"),
      "Khóa nâng cao",
    );
    await fireEvent.changeText(screen.getByLabelText("Sức chứa tối đa *"), "30");
    await fireEvent.press(screen.getByText("Nâng cao"));

    // Open PickerPopover
    await fireEvent.press(screen.getByLabelText("Lịch lớp *: Chọn lịch lớp"));

    // BottomSheetWindow "Tạo khóa học" stays visible!
    expect(screen.getByLabelText("Biểu mẫu tạo khóa học")).toBeTruthy();
    expect(screen.getByLabelText("Danh sách lịch lớp")).toBeTruthy();

    // Select both schedules
    await fireEvent.press(
      screen.getByLabelText(
        "Cơ sở Trung tâm, Thứ Hai, 18:00 đến 19:30, Phòng tập",
      ),
    );
    await fireEvent.press(
      screen.getByLabelText(
        "Cơ sở Tây Hồ, Thứ Ba, 18:00 đến 19:30, Phòng tập",
      ),
    );

    // Confirm selection with "Chọn" button
    await fireEvent.press(screen.getByLabelText("Chọn"));

    // Both schedule cards should now be present in the sheet
    expect(screen.getByText("Lịch học 1")).toBeTruthy();
    expect(screen.getByText("Lịch học 2")).toBeTruthy();
    expect(screen.getByText("Cơ sở Trung tâm · Thứ Hai")).toBeTruthy();
    expect(screen.getByText("Cơ sở Tây Hồ · Thứ Ba")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("Lưu"));
    await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
    expect(mockCreate.mock.calls[0][0].courseSchedules).toHaveLength(2);
    expect(mockCreate.mock.calls[0][0].courseSchedules[0].classScheduleId).toBe(
      "schedule-api-1",
    );
    expect(mockCreate.mock.calls[0][0].courseSchedules[1].classScheduleId).toBe(
      "schedule-api-2",
    );
  });

  it("aborts an in-flight create silently and keeps the form", async () => {
    const mockCreate = courseApi.create as jest.MockedFunction<typeof courseApi.create>;
    let requestSignal: AbortSignal | undefined;
    mockCreate.mockImplementation((_request, options) => {
      requestSignal = options?.signal;
      return new Promise((_resolve, reject) => {
        requestSignal?.addEventListener("abort", () => {
          reject(Object.assign(new Error("cancelled"), { name: "AbortError" }));
        });
      });
    });

    const { screen, onSuccess } = await renderSheet();
    await fillValidForm(screen);
    await fireEvent.press(screen.getByLabelText("Lưu"));

    expect(await screen.findByText("Đang tạo khóa học...")).toBeTruthy();
    await fireEvent.press(screen.getByLabelText("Hủy"));

    await waitFor(() => {
      expect(requestSignal?.aborted).toBe(true);
      expect(screen.queryByText("Đang tạo khóa học...")).toBeNull();
    });
    expect(screen.getByLabelText("Tên khóa học *").props.value).toBe(
      "Khóa học mới",
    );
    expect(mockToastShow).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("keeps the form open and shows the backend error", async () => {
    const mockCreate = courseApi.create as jest.MockedFunction<typeof courseApi.create>;
    mockCreate.mockRejectedValue({
      response: { data: { message: "Tên khóa học đã tồn tại" } },
    });
    const { screen, onSuccess } = await renderSheet();

    await fillValidForm(screen);
    await fireEvent.press(screen.getByLabelText("Lưu"));

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith({
        message: "Tên khóa học đã tồn tại",
        variant: "error",
      });
    });
    expect(screen.getByLabelText("Biểu mẫu tạo khóa học")).toBeTruthy();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("shows loading, empty and error states for class schedules", async () => {
    mockClassSchedulesQuery = {
      data: undefined,
      isLoading: true,
      error: null,
      refetch: mockRefetchSchedules,
    };
    const loading = await renderSheet();
    await fireEvent.press(
      loading.screen.getByLabelText("Lịch lớp *: Chọn lịch lớp"),
    );
    expect(loading.screen.getByLabelText("Danh sách lịch lớp")).toBeTruthy();
    await loading.screen.unmount();

    mockClassSchedulesQuery = {
      data: { content: [] },
      isLoading: false,
      error: null,
      refetch: mockRefetchSchedules,
    };
    const empty = await renderSheet();
    await fireEvent.press(
      empty.screen.getByLabelText("Lịch lớp *: Chọn lịch lớp"),
    );
    expect(empty.screen.getByText("Chưa có lịch lớp để lựa chọn.")).toBeTruthy();
    await empty.screen.unmount();

    mockClassSchedulesQuery = {
      data: undefined,
      isLoading: false,
      error: new Error("network"),
      refetch: mockRefetchSchedules,
    };
    const failed = await renderSheet();
    await fireEvent.press(
      failed.screen.getByLabelText("Lịch lớp *: Chọn lịch lớp"),
    );
    expect(
      failed.screen.getByText("Không thể tải danh sách lịch lớp."),
    ).toBeTruthy();
    await fireEvent.press(failed.screen.getByLabelText("Thử lại"));
    expect(mockRefetchSchedules).toHaveBeenCalledTimes(1);
  });
});
