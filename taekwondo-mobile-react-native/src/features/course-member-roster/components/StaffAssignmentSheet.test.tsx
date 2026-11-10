/* eslint-disable @typescript-eslint/no-require-imports */
import React from "react";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react-native";

import type { CourseScheduleResponse } from "@/features/course/api/course.dto";

import { StaffAssignmentSheet } from "./StaffAssignmentSheet";

const mockRefetch = jest.fn();
const mockMutateAsync = jest.fn();
const mockToastShow = jest.fn();
const mockUseStaffCandidates = jest.fn();

jest.mock("@/shared/ui/BottomSheetWindow", () => ({
  BottomSheetWindow: ({
    visible,
    title,
    children,
    footer,
    overlay,
  }: {
    visible: boolean;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    overlay?: React.ReactNode;
  }) => {
    const { Text, View } = require("react-native");
    return visible ? (
      <View>
        <Text>{title}</Text>
        {children}
        {footer}
        {overlay}
      </View>
    ) : null;
  },
}));

jest.mock("@/shared/ui/CancellableLoadingOverlay", () => ({
  CancellableLoadingOverlay: ({
    visible,
    message,
    cancelLabel = "Hủy",
    onCancel,
  }: {
    visible: boolean;
    message?: string;
    cancelLabel?: string;
    onCancel?: () => void;
  }) => {
    const { Pressable, Text, View } = require("react-native");
    if (!visible) return null;
    return (
      <View accessibilityLabel={message}>
        <Text>{message}</Text>
        {onCancel ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
            onPress={onCancel}
          >
            <Text>{cancelLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    );
  },
}));

jest.mock("@/shared/ui/commerce/CommercePrimitives", () => ({
  FormField: ({ label, ...props }: { label: string }) => {
    const { TextInput } = require("react-native");
    return <TextInput accessibilityLabel={label} {...props} />;
  },
  PrimaryActionButton: ({ title, disabled, onPress }: { title: string; disabled?: boolean; onPress: () => void }) => {
    const { Pressable, Text } = require("react-native");
    return <Pressable accessibilityRole="button" accessibilityLabel={title} disabled={disabled} onPress={onPress}><Text>{title}</Text></Pressable>;
  },
  SegmentedTabs: ({ tabs, value, onChange }: { tabs: { value: string; label: string }[]; value: string; onChange: (value: string) => void }) => {
    const { Pressable, Text, View } = require("react-native");
    return <View accessibilityRole="tablist">{tabs.map((tab) => (
      <Pressable
        key={tab.value}
        accessibilityRole="tab"
        accessibilityLabel={tab.label}
        accessibilityState={{ selected: tab.value === value }}
        onPress={() => onChange(tab.value)}
      >
        <Text>{tab.label}</Text>
      </Pressable>
    ))}</View>;
  },
}));

jest.mock("@/shared/ui/Toast", () => ({
  useToast: () => ({ show: mockToastShow }),
}));

jest.mock("../queries/courseMemberRosterQueries", () => ({
  getLocalDate: () => "2026-10-16",
  useCreateCourseStaffAssignment: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  useStaffCandidates: (...args: unknown[]) => mockUseStaffCandidates(...args),
}));

const schedule = {
  courseScheduleId: "schedule-1",
  classSchedule: {
    weekday: "MONDAY",
    startTime: "18:00:00",
    endTime: "19:30:00",
    branch: { name: "Văn Quán" },
  },
  startDate: "2026-10-01",
  endDate: null,
  status: "ACTIVE",
  staffAssignments: [],
  createdAt: "2026-10-01T00:00:00Z",
  updatedAt: "2026-10-01T00:00:00Z",
} as unknown as CourseScheduleResponse;

async function renderSheet(memberKind: "coaches" | "teaching-assistants" = "coaches") {
  return render(
    <StaffAssignmentSheet
      visible
      courseId="course-1"
      memberKind={memberKind}
      schedules={[schedule]}
      onClose={jest.fn()}
    />,
  );
}

describe("StaffAssignmentSheet", () => {
  beforeEach(() => {
    mockRefetch.mockReset();
    mockMutateAsync.mockReset();
    mockToastShow.mockReset();
    mockUseStaffCandidates.mockReset();
    mockUseStaffCandidates.mockReturnValue({
      data: {
        content: [{ personId: "person-1", fullName: "Nguyễn Văn An", personCode: "HLV-01" }],
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });
  });

  afterEach(async () => {
    await cleanup();
  });

  it("shows the staff picker and available staff", async () => {
    const view = await renderSheet();
    expect(view.getByText("Chọn nhân sự")).toBeTruthy();
    expect(view.getByLabelText("1. Nhân sự").props.accessibilityState.selected).toBe(true);
    expect(view.getByLabelText("2. Phân công").props.accessibilityState.selected).toBe(false);
    expect(view.getByLabelText("Chọn Nguyễn Văn An")).toBeTruthy();
  });

  it("keeps the assignment tab locked until a staff member is selected", async () => {
    const view = await renderSheet();

    await act(async () => fireEvent.press(view.getByLabelText("2. Phân công")));

    expect(view.getByText("Chọn nhân sự")).toBeTruthy();
    expect(mockToastShow).toHaveBeenCalledWith({
      message: "Hãy chọn nhân sự trước.",
      variant: "error",
    });
  });

  it("shows a loading state while staff are loading", async () => {
    mockUseStaffCandidates.mockReturnValue({ data: { content: [] }, isLoading: true, isError: false, refetch: mockRefetch });
    const view = await renderSheet();
    expect(view.getByLabelText("Đang tải nhân sự")).toBeTruthy();
  });

  it("shows a retry action when staff loading fails", async () => {
    mockUseStaffCandidates.mockReturnValue({ data: { content: [] }, isLoading: false, isError: true, refetch: mockRefetch });
    const view = await renderSheet();
    expect(view.getByText("Không thể tải danh sách nhân sự.")).toBeTruthy();
    fireEvent.press(view.getByLabelText("Thử lại"));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("shows an empty state when there are no active staff", async () => {
    mockUseStaffCandidates.mockReturnValue({ data: { content: [] }, isLoading: false, isError: false, refetch: mockRefetch });
    const view = await renderSheet();
    expect(view.getByText("Không tìm thấy nhân sự ACTIVE.")).toBeTruthy();
  });

  it("lets a coach select a primary role and sends it with the assignment", async () => {
    mockMutateAsync.mockResolvedValue(undefined);
    const view = await renderSheet();

    await act(async () => fireEvent.press(view.getByLabelText("Chọn Nguyễn Văn An")));
    await waitFor(() => expect(view.getByText("Thông tin phân công")).toBeTruthy());
    expect(view.getByLabelText("2. Phân công").props.accessibilityState.selected).toBe(true);
    await act(async () => fireEvent.press(view.getByText("HLV chính")));
    await act(async () => fireEvent.press(view.getByText("Thứ Hai, 18:00–19:30 · Văn Quán")));
    await act(async () => fireEvent.press(view.getByLabelText("Thêm")));

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      request: expect.objectContaining({
        assignmentType: "PRIMARY_COACH",
        courseScheduleId: "schedule-1",
        staffPersonId: "person-1",
      }),
      signal: expect.any(Object),
    })));
  });

  it("lets the user return to staff, change the selection, and submit the new person", async () => {
    mockMutateAsync.mockResolvedValue(undefined);
    mockUseStaffCandidates.mockReturnValue({
      data: {
        content: [
          { personId: "person-1", fullName: "Nguyễn Văn An", personCode: "HLV-01" },
          { personId: "person-2", fullName: "Trần Minh Bình", personCode: "HLV-02" },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });
    const view = await renderSheet();

    await act(async () => fireEvent.press(view.getByLabelText("Chọn Nguyễn Văn An")));
    await waitFor(() => expect(view.getByText("Thông tin phân công")).toBeTruthy());
    await act(async () => fireEvent.press(view.getByLabelText("1. Nhân sự")));
    await waitFor(() => expect(view.getByLabelText("Chọn Trần Minh Bình")).toBeTruthy());
    await act(async () => fireEvent.press(view.getByLabelText("Chọn Trần Minh Bình")));
    await waitFor(() => expect(view.getByText("Thông tin phân công")).toBeTruthy());
    await act(async () => fireEvent.press(view.getByText("Thứ Hai, 18:00–19:30 · Văn Quán")));
    await act(async () => fireEvent.press(view.getByLabelText("Thêm")));

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      request: expect.objectContaining({
        staffPersonId: "person-2",
      }),
      signal: expect.any(Object),
    })));
  });

  it("keeps teaching assistants on the fixed teaching-assistant assignment type", async () => {
    mockMutateAsync.mockResolvedValue(undefined);
    const view = await renderSheet("teaching-assistants");

    await act(async () => fireEvent.press(view.getByLabelText("Chọn Nguyễn Văn An")));
    await waitFor(() => expect(view.getByText("Thông tin phân công")).toBeTruthy());
    expect(view.queryByText("Vai trò")).toBeNull();
    await act(async () => fireEvent.press(view.getByText("Thứ Hai, 18:00–19:30 · Văn Quán")));
    await act(async () => fireEvent.press(view.getByLabelText("Thêm")));

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      request: expect.objectContaining({
        assignmentType: "TEACHING_ASSISTANT",
      }),
      signal: expect.any(Object),
    })));
  });

  it("keeps the form open and reports an error when assignment creation fails", async () => {
    mockMutateAsync.mockRejectedValue(new Error("failed"));
    const view = await renderSheet();

    await act(async () => fireEvent.press(view.getByLabelText("Chọn Nguyễn Văn An")));
    await waitFor(() => expect(view.getByText("Thông tin phân công")).toBeTruthy());
    await act(async () => fireEvent.press(view.getByText("Thứ Hai, 18:00–19:30 · Văn Quán")));
    await act(async () => fireEvent.press(view.getByLabelText("Thêm")));

    await waitFor(() => expect(mockToastShow).toHaveBeenCalledWith(expect.objectContaining({ variant: "error" })));
    expect(view.getByText("Thông tin phân công")).toBeTruthy();
  });

  it("allows cancelling in-flight assignment creation with overlay Hủy button and shows no error toast", async () => {
    let capturedSignal: AbortSignal | undefined;
    mockMutateAsync.mockImplementation(
      ({ signal }: { signal?: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          capturedSignal = signal;
          if (signal) {
            signal.addEventListener("abort", () => {
              const abortError = new Error("Aborted");
              abortError.name = "AbortError";
              reject(abortError);
            });
          }
        }),
    );
    const view = await renderSheet();

    await act(async () => fireEvent.press(view.getByLabelText("Chọn Nguyễn Văn An")));
    await waitFor(() => expect(view.getByText("Thông tin phân công")).toBeTruthy());
    await act(async () => fireEvent.press(view.getByText("Thứ Hai, 18:00–19:30 · Văn Quán")));
    await act(async () => fireEvent.press(view.getByLabelText("Thêm")));

    // CancellableLoadingOverlay is visible
    expect(view.getByText("Đang thêm phân công...")).toBeTruthy();
    const cancelOverlayBtn = view.getByLabelText("Hủy");
    expect(cancelOverlayBtn).toBeTruthy();

    await act(async () => fireEvent.press(cancelOverlayBtn));

    expect(capturedSignal?.aborted).toBe(true);
    expect(mockToastShow).not.toHaveBeenCalled();
    expect(view.queryByText("Đang thêm phân công...")).toBeNull();
    expect(view.getByText("Thông tin phân công")).toBeTruthy();
  });
});
