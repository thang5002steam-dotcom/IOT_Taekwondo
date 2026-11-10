/* eslint-disable @typescript-eslint/no-require-imports */
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { CourseMemberRosterScreen } from "./CourseMemberRosterScreen";

const mockPush = jest.fn();
const mockRefetch = jest.fn();
const mockFetchNextPage = jest.fn();
const mockUseRoster = jest.fn();
let mockCanAdd = true;

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/features/authorization", () => ({
  Permission: {
    COURSE_PURCHASE_CREATE: "COURSE_PURCHASE_CREATE",
    COURSE_STAFF_ASSIGNMENT_CREATE: "COURSE_STAFF_ASSIGNMENT_CREATE",
  },
  useCan: () => mockCanAdd,
}));

jest.mock("@/features/course/queries/courseCatalogQueries", () => ({
  useCourseDetail: () => ({ data: { courseSchedules: [] } }),
}));

jest.mock("../queries/courseMemberRosterQueries", () => ({
  getLocalDate: () => "2026-10-16",
  useCourseMemberRoster: (...args: unknown[]) => mockUseRoster(...args),
  useCreateCourseStaffAssignment: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useStaffCandidates: () => ({ data: { content: [] }, isLoading: false, isError: false }),
}));

jest.mock("@/routes/navigation/layouts/StackScreenLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => {
    const { View } = require("react-native");
    return <View>{children}</View>;
  },
}));

jest.mock("@/shared/ui/AppIcon", () => ({
  AppIcon: () => {
    const { View } = require("react-native");
    return <View />;
  },
}));

jest.mock("@/shared/ui/BottomSheetWindow", () => ({
  BottomSheetWindow: ({ visible, children }: { visible: boolean; children: React.ReactNode }) => {
    const { View } = require("react-native");
    return visible ? <View>{children}</View> : null;
  },
}));

jest.mock("@/shared/ui/CancellableLoadingOverlay", () => ({
  CancellableLoadingOverlay: () => null,
}));

jest.mock("@/shared/ui/Toast", () => ({
  useToast: () => ({ show: jest.fn() }),
}));

jest.mock("@/shared/ui/commerce/CommercePrimitives", () => ({
  SurfaceCard: ({ children }: { children: React.ReactNode }) => {
    const { View } = require("react-native");
    return <View>{children}</View>;
  },
  FormField: () => null,
  PrimaryActionButton: ({ title, onPress }: { title: string; onPress: () => void }) => {
    const { Pressable, Text } = require("react-native");
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
    );
  },
}));

function rosterResult(overrides: Record<string, unknown> = {}) {
  return {
    members: [
      {
        person: { personId: "person-1", fullName: "Nguyễn Văn An", personCode: "HLV-01" },
        primary: true,
        assignments: [
          {
            id: "assignment-1",
            scheduleId: "schedule-1",
            scheduleLabel: "Thứ Hai, 18:00–19:30 · Văn Quán",
            role: "PRIMARY_COACH",
            roleLabel: "HLV chính",
            startDate: "2026-10-01",
            endDate: null,
          },
        ],
      },
    ],
    isLoading: false,
    isPending: false,
    isError: false,
    isRefetching: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    refetch: mockRefetch,
    fetchNextPage: mockFetchNextPage,
    ...overrides,
  };
}

describe("CourseMemberRosterScreen", () => {
  beforeEach(() => {
    mockCanAdd = true;
    mockPush.mockReset();
    mockRefetch.mockReset();
    mockFetchNextPage.mockReset();
    mockUseRoster.mockReset();
    mockUseRoster.mockReturnValue(rosterResult());
  });

  it("renders the shared list hierarchy while retaining schedule assignments", async () => {
    const view = await render(<CourseMemberRosterScreen courseId="course-1" memberKind="coaches" />);

    expect(view.getByText("Danh sách huấn luyện viên")).toBeTruthy();
    expect(view.getByText("Nguyễn Văn An")).toBeTruthy();
    expect(view.getByText("HLV chính")).toBeTruthy();
  });

  it("keeps the student add action routed to course registration", async () => {
    const view = await render(<CourseMemberRosterScreen courseId="course-1" memberKind="students" />);

    fireEvent.press(view.getByLabelText("Thêm học viên"));

    expect(mockPush).toHaveBeenCalledWith("/courses/course-1/register");
  });

  it("hides the add action when the active user lacks permission", async () => {
    mockCanAdd = false;
    const view = await render(<CourseMemberRosterScreen courseId="course-1" memberKind="coaches" />);

    expect(view.queryByLabelText("Thêm huấn luyện viên")).toBeNull();
  });

  it("keeps the header visible and offers retry when loading fails", async () => {
    mockUseRoster.mockReturnValue(rosterResult({ members: [], isError: true }));
    const view = await render(<CourseMemberRosterScreen courseId="course-1" memberKind="teaching-assistants" />);

    expect(view.getByText("Danh sách trợ giảng")).toBeTruthy();
    fireEvent.press(view.getByLabelText("Thử lại"));

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("renders initial and next-page loading states", async () => {
    mockUseRoster.mockReturnValue(rosterResult({ isLoading: true, isPending: true, members: [] }));
    const view = await render(<CourseMemberRosterScreen courseId="course-1" memberKind="coaches" />);

    expect(view.getByLabelText("Đang tải danh sách")).toBeTruthy();

    mockUseRoster.mockReturnValue(rosterResult({ isFetchingNextPage: true }));
    const paginatedView = await render(<CourseMemberRosterScreen courseId="course-1" memberKind="coaches" />);

    expect(paginatedView.getByLabelText("Đang tải thêm danh sách")).toBeTruthy();
  });
});
