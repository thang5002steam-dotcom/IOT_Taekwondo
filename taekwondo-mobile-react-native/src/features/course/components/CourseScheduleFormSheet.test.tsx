import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { CourseScheduleFormSheet } from "./CourseScheduleFormSheet";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("@/features/authorization/hooks/useAccess", () => ({
  useCan: () => true,
}));

jest.mock("@/features/course/queries/courseCatalogQueries", () => ({
  useCourseCreateOptions: () => ({ data: { content: [] } }),
}));

jest.mock("@/shared/ui/BottomSheetWindow", () => ({
  BottomSheetWindow: ({
    visible,
    children,
    footer,
  }: {
    visible: boolean;
    children: React.ReactNode;
    footer?: React.ReactNode;
  }) => {
    const { View } = require("react-native");
    return visible ? <View>{children}{footer}</View> : null;
  },
}));

jest.mock("@/shared/ui/FloatingActionBar", () => ({
  FloatingActionBar: ({ actions }: { actions: { accessibilityLabel?: string; label: string }[] }) => {
    const { Text, View } = require("react-native");
    return (
      <View testID="sheet-footer-actions">
        {actions.map((action) => (
          <Text key={action.accessibilityLabel ?? action.label}>
            {action.accessibilityLabel ?? action.label}
          </Text>
        ))}
      </View>
    );
  },
}));

jest.mock("@/shared/ui/admin/AdministrationPrimitives", () => ({
  AdminChip: ({ label, onPress }: { label: string; onPress?: () => void }) => {
    const { Pressable, Text } = require("react-native");
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}>
        <Text>{label}</Text>
      </Pressable>
    );
  },
  AdminEmptyState: () => null,
  AdminField: () => null,
  AdminLoadingState: () => null,
  AdminPickerField: () => null,
}));

jest.mock("@/shared/ui/PickerPopover", () => ({
  PickerPopover: () => null,
}));

jest.mock("@/shared/ui/ThemedText", () => ({
  ThemedText: ({ children }: { children: React.ReactNode }) => {
    const { Text } = require("react-native");
    return <Text>{children}</Text>;
  },
}));

jest.mock("@/features/course/components/CourseScheduleStaffAssignmentsSection", () => ({
  CourseScheduleStaffAssignmentsSection: ({
    onFooterActionsChange,
  }: {
    onFooterActionsChange: (actions: { accessibilityLabel?: string; label: string }[]) => void;
  }) => {
    const { Pressable, Text, View } = require("react-native");
    return (
      <View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mở form phân công"
          onPress={() => onFooterActionsChange([{ label: "Thêm phân công", accessibilityLabel: "Thêm phân công" }])}
        >
          <Text>Mở form phân công</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Đóng form phân công"
          onPress={() => onFooterActionsChange([])}
        >
          <Text>Đóng form phân công</Text>
        </Pressable>
      </View>
    );
  },
}));
/* eslint-enable @typescript-eslint/no-require-imports */

describe("CourseScheduleFormSheet", () => {
  it("shows staff footer actions only while editing an assignment", async () => {
    const screen = await render(
      <CourseScheduleFormSheet
        visible
        mode="edit"
        courseId="course-1"
        schedule={{
          courseScheduleId: "course-schedule-1",
          classScheduleId: "class-schedule-1",
          branchName: "Cơ sở chính",
          staffAssignments: [],
          startDate: "2026-01-01",
          endDate: null,
          status: "ACTIVE",
        }}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );

    await fireEvent.press(screen.getByLabelText("Nhân sự phụ trách"));
    expect(screen.queryByTestId("sheet-footer-actions")).toBeNull();

    await fireEvent.press(screen.getByLabelText("Mở form phân công"));
    expect(screen.getByTestId("sheet-footer-actions")).toBeTruthy();
    expect(screen.getByText("Thêm phân công")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("Đóng form phân công"));
    expect(screen.queryByTestId("sheet-footer-actions")).toBeNull();
  });
});
