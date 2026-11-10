import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { CourseCatalogScreen } from "./CourseScreen";

const mockPush = jest.fn();
const mockSetQueryData = jest.fn();
const mockInvalidateQueries = jest.fn();
let mockCanCreateCourse = false;

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: { content: [] },
    isLoading: false,
  }),
  useQueryClient: () => ({
    setQueryData: mockSetQueryData,
    invalidateQueries: mockInvalidateQueries,
  }),
}));

jest.mock("@/features/authorization", () => ({
  Permission: { COURSE_CREATE: "COURSE_CREATE" },
  useCan: () => mockCanCreateCourse,
}));

jest.mock("@/infrastructure/query/useScreenRefresh", () => ({
  useScreenRefresh: () => ({ refreshing: false, onRefresh: jest.fn() }),
}));

jest.mock("@/features/student-commerce/utils/studentCommerceUtils", () => ({
  asHref: (value: string) => value,
  getCommerceState: () => ({ courses: [] }),
}));

jest.mock("@/shared/ui/commerce/CommercePrimitives", () => {
  const React = require("react");
  const { Text, TextInput, View } = require("react-native");
  return {
    FormField: ({ label, ...props }: { label: string }) =>
      React.createElement(
        View,
        null,
        React.createElement(Text, null, label),
        React.createElement(TextInput, {
          accessibilityLabel: label,
          ...props,
        }),
      ),
    SegmentedTabs: () =>
      React.createElement(View, { accessibilityLabel: "Course tabs" }),
  };
});

jest.mock("@/routes/navigation/layouts/StackScreenLayout", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, null, children),
  };
});

jest.mock("@/features/course/components/CourseCatalogList", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    CourseCatalogList: () =>
      React.createElement(View, { accessibilityLabel: "Course list" }),
  };
});

jest.mock("@/features/course/components/CourseCreateSheet", () => {
  const React = require("react");
  const { Pressable, Text, View } = require("react-native");
  return {
    CourseCreateSheet: ({
      visible,
      onSuccess,
    }: {
      visible: boolean;
      onSuccess: (course: {
        courseId: string;
        name: string;
      }) => void;
    }) =>
      visible
        ? React.createElement(
            View,
            { accessibilityLabel: "Course create sheet" },
            React.createElement(
              Pressable,
              {
                accessibilityRole: "button",
                accessibilityLabel: "Complete create",
                onPress: () =>
                  onSuccess({ courseId: "created-id", name: "Created" }),
              },
              React.createElement(Text, null, "Complete"),
            ),
          )
        : null,
  };
});

jest.mock("@/shared/ui/AppIcon", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    AppIcon: () => React.createElement(View, null),
  };
});

describe("CourseCatalogScreen create flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCanCreateCourse = false;
  });

  it("hides the create action without COURSE_CREATE", async () => {
    const screen = await render(<CourseCatalogScreen />);
    expect(screen.queryByLabelText("Tạo khóa học")).toBeNull();
  });

  it("opens create sheet and handles the created course", async () => {
    mockCanCreateCourse = true;
    const screen = await render(<CourseCatalogScreen />);

    await fireEvent.press(screen.getByLabelText("Tạo khóa học"));
    expect(screen.getByLabelText("Course create sheet")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("Complete create"));

    expect(mockSetQueryData).toHaveBeenCalledWith(
      ["courses", "created-id"],
      { courseId: "created-id", name: "Created" },
    );
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["courses"],
    });
    expect(mockPush).toHaveBeenCalledWith("/courses/created-id");
  });
});
