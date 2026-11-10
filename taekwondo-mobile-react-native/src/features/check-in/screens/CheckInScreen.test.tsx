/* eslint-disable @typescript-eslint/no-require-imports */
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { AppState, Pressable, View } from "react-native";

import CheckInScreen from "./CheckInScreen";

const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockHandlePermissionAction = jest.fn();
const mockRefreshPermission = jest.fn();
const mockUseCheckInCamera = jest.fn();
const mockUseFaceCheckInSession = jest.fn();
const mockLoadVisionCamera = jest.fn();

function MockVisionCamera(props: {
  onReady: () => void;
  onUnavailable: (reason: "vision-runtime-error", error: Error) => void;
}) {
  return (
    <View accessibilityLabel="Vision camera preview">
      <Pressable accessibilityLabel="Mark Vision ready" onPress={props.onReady} />
      <Pressable
        accessibilityLabel="Trigger Vision error"
        onPress={() =>
          props.onUnavailable("vision-runtime-error", new Error("vision failed"))
        }
      />
    </View>
  );
}

jest.mock("expo-router", () => {
  const React = require("react");
  return {
    router: {
      replace: (...args: unknown[]) => mockReplace(...args),
      back: (...args: unknown[]) => mockBack(...args),
      canGoBack: () => true,
    },
    useFocusEffect: (effect: () => void | (() => void)) => {
      React.useLayoutEffect(effect, [effect]);
    },
  };
});

jest.mock("../camera/visionCameraLoader", () => ({
  loadVisionCamera: () => mockLoadVisionCamera(),
}));
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 24, right: 0, bottom: 20, left: 0 }),
}));
jest.mock("../hooks/useCheckInCamera", () => ({
  useCheckInCamera: () => mockUseCheckInCamera(),
}));
jest.mock("../hooks/useFaceCheckInSession", () => ({
  useFaceCheckInSession: () => mockUseFaceCheckInSession(),
}));
jest.mock("../components/ManualExpoCheckInCamera", () => ({
  ManualExpoCheckInCamera: () => {
    const React = require("react");
    const { View: NativeView } = require("react-native");
    return React.createElement(NativeView, {
      accessibilityLabel: "Manual camera preview",
    });
  },
}));
jest.mock("../components/CheckInHeader", () => ({
  CheckInHeader: ({ onBack }: { onBack: () => void }) => {
    const React = require("react");
    const { Pressable: NativePressable } = require("react-native");
    return React.createElement(NativePressable, {
      accessibilityLabel: "Check-in back",
      accessibilityRole: "button",
      onPress: onBack,
    });
  },
}));
jest.mock("../components/CheckInViewfinder", () => ({
  CheckInViewfinder: () => {
    const React = require("react");
    const { View: NativeView } = require("react-native");
    return React.createElement(NativeView, {
      accessibilityLabel: "Check-in viewfinder",
    });
  },
}));
jest.mock("../components/CheckInSideControls", () => ({
  CheckInSideControls: () => {
    const React = require("react");
    const { View: NativeView } = require("react-native");
    return React.createElement(NativeView, {
      accessibilityLabel: "Check-in controls",
    });
  },
}));
jest.mock("../components/CheckInProcessingBanner", () => ({
  CheckInProcessingBanner: ({
    visible,
    onCancel,
  }: {
    visible: boolean;
    onCancel: () => void;
  }) => {
    if (!visible) return null;
    const React = require("react");
    const { Pressable: NativePressable } = require("react-native");
    return React.createElement(NativePressable, {
      accessibilityLabel: "Hủy điểm danh",
      onPress: onCancel,
    });
  },
}));
jest.mock("../components/CheckInResultSheet", () => ({
  CheckInResultSheet: () => null,
}));
jest.mock("../components/CheckInSessionHistorySheet", () => ({
  CheckInSessionHistorySheet: () => null,
}));

const sessionState = {
  status: "idle",
  currentResult: null,
  currentFailure: null,
  isPending: false,
  sessionHistory: [],
  isResultSheetVisible: false,
  isHistorySheetVisible: false,
  errorMessage: null,
  resetToken: 0,
  submitPhoto: jest.fn(),
  handleNextScan: jest.fn(),
  closeResultSheet: jest.fn(),
  cancelCheckIn: jest.fn(),
  openHistorySheet: jest.fn(),
  closeHistorySheet: jest.fn(),
};

function cameraState(overrides: Record<string, unknown> = {}) {
  return {
    handlePermissionAction: mockHandlePermissionAction,
    refreshPermission: mockRefreshPermission,
    isPermissionLoading: false,
    isPermissionGranted: true,
    isPermissionDenied: false,
    isPermissionUndetermined: false,
    canAskAgain: true,
    isPermissionActionPending: false,
    permissionError: null,
    facing: "front",
    torch: false,
    isTorchAvailable: false,
    toggleFacing: jest.fn(),
    toggleTorch: jest.fn(),
    ...overrides,
  };
}

describe("CheckInScreen camera fallback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRefreshPermission.mockResolvedValue({ granted: true });
    mockHandlePermissionAction.mockResolvedValue({ granted: true });
    mockUseCheckInCamera.mockReturnValue(cameraState());
    mockUseFaceCheckInSession.mockReturnValue(sessionState);
    mockLoadVisionCamera.mockReturnValue({
      available: true,
      module: { VisionCheckInCamera: MockVisionCamera },
    });
    jest.spyOn(AppState, "addEventListener").mockReturnValue({
      remove: jest.fn(),
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it("uses Vision Camera when the native adapter is available", async () => {
    const screen = await render(<CheckInScreen />);

    expect(await screen.findByLabelText("Vision camera preview")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Mark Vision ready"));
    expect(await screen.findByLabelText("Check-in viewfinder")).toBeTruthy();
    expect(screen.queryByText("Đang dùng chế độ chụp thủ công")).toBeNull();
  });

  it("starts directly in manual mode in Expo Go without a Vision retry", async () => {
    mockLoadVisionCamera.mockReturnValue({
      available: false,
      reason: "expo-go",
    });
    const screen = await render(<CheckInScreen />);

    expect(await screen.findByLabelText("Manual camera preview")).toBeTruthy();
    expect(screen.getByText("Đang dùng chế độ chụp thủ công")).toBeTruthy();
    expect(screen.queryByText("Thử camera tự động")).toBeNull();
  });

  it("falls back on a Vision runtime error and allows retry", async () => {
    const screen = await render(<CheckInScreen />);
    await screen.findByLabelText("Vision camera preview");

    fireEvent.press(screen.getByLabelText("Trigger Vision error"));
    expect(await screen.findByLabelText("Manual camera preview")).toBeTruthy();
    expect(screen.getByText("Thử camera tự động")).toBeTruthy();

    fireEvent.press(screen.getByText("Thử camera tự động"));
    await waitFor(() =>
      expect(screen.getByLabelText("Vision camera preview")).toBeTruthy(),
    );
    expect(mockLoadVisionCamera).toHaveBeenCalledTimes(2);
  });

  it("keeps camera permission denial flow unchanged", async () => {
    mockUseCheckInCamera.mockReturnValue(
      cameraState({
        isPermissionGranted: false,
        isPermissionDenied: true,
      }),
    );
    mockRefreshPermission.mockResolvedValue({ granted: false });
    const screen = await render(<CheckInScreen />);

    expect(await screen.findByText("Cho phép sử dụng Camera")).toBeTruthy();
    fireEvent.press(screen.getByText("Cho phép"));
    await waitFor(() => expect(mockHandlePermissionAction).toHaveBeenCalled());
  });

  it("uses the shared cancellation action while processing", async () => {
    const cancelCheckIn = jest.fn();
    mockUseFaceCheckInSession.mockReturnValue({
      ...sessionState,
      status: "processing",
      isPending: true,
      cancelCheckIn,
    });
    const screen = await render(<CheckInScreen />);

    fireEvent.press(await screen.findByLabelText("Hủy điểm danh"));
    expect(cancelCheckIn).toHaveBeenCalledTimes(1);
  });

  it("routes back through the existing screen policy", async () => {
    const screen = await render(<CheckInScreen />);
    fireEvent.press(await screen.findByLabelText("Check-in back"));
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
