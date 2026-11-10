import { fireEvent, render } from "@testing-library/react-native";
import { CheckInProcessingBanner } from "./CheckInProcessingBanner";

jest.mock("react-native-reanimated", () => {
  const React = require("react");
  const { View } = require("react-native");

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
    withRepeat: (anim: unknown) => anim,
    withSequence: (...anims: unknown[]) => anims[0],
    Easing: {
      bezier: () => () => 0,
    },
  };
});

jest.mock("@/shared/ui/AppIcon", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    AppIcon: () => React.createElement(View, null),
  };
});

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: "Light",
  },
}));

describe("CheckInProcessingBanner", () => {
  it("renders when visible is true and triggers onCancel on button press", async () => {
    const onCancel = jest.fn();
    const screen = await render(
      <CheckInProcessingBanner visible onCancel={onCancel} />,
    );

    expect(screen.getByText("Đang xử lý điểm danh...")).toBeTruthy();
    expect(screen.getByText("Hủy")).toBeTruthy();

    const cancelBtn = screen.getByLabelText("Hủy điểm danh");
    fireEvent.press(cancelBtn);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("does not render when visible is false", async () => {
    const screen = await render(
      <CheckInProcessingBanner visible={false} onCancel={jest.fn()} />,
    );

    expect(screen.queryByText("Đang xử lý điểm danh...")).toBeNull();
  });
});
