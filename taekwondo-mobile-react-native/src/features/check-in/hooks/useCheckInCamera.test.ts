import { act, renderHook } from "@testing-library/react-native";
import { Linking } from "react-native";

import { useCheckInCamera } from "./useCheckInCamera";

const mockRequestPermission = jest.fn();
const mockGetPermission = jest.fn();
let mockPermission: {
  granted: boolean;
  canAskAgain: boolean;
  status: "denied" | "granted" | "undetermined";
} | null = null;

jest.mock("expo-camera", () => ({
  useCameraPermissions: () => [
    mockPermission,
    mockRequestPermission,
    mockGetPermission,
  ],
}));

describe("useCheckInCamera", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPermission = null;
  });

  it("keeps refreshPermission stable when the permission response changes", async () => {
    mockGetPermission.mockResolvedValue({
      granted: false,
      canAskAgain: true,
      status: "denied",
    });
    const hook = await renderHook(() => useCheckInCamera());
    const firstRefresh = hook.result.current.refreshPermission;

    mockPermission = {
      granted: false,
      canAskAgain: true,
      status: "denied",
    };
    await hook.rerender(undefined);

    expect(hook.result.current.refreshPermission).toBe(firstRefresh);

    await act(async () => {
      await hook.result.current.refreshPermission();
    });
    expect(mockGetPermission).toHaveBeenCalledTimes(1);
  });

  it("does not request camera permission twice while a request is pending", async () => {
    mockPermission = {
      granted: false,
      canAskAgain: true,
      status: "denied",
    };
    let resolveRequest: (value: typeof mockPermission) => void = () => {};
    mockRequestPermission.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );
    const hook = await renderHook(() => useCheckInCamera());

    await act(async () => {
      const first = hook.result.current.requestPermission();
      const second = hook.result.current.requestPermission();
      resolveRequest(mockPermission);
      await Promise.all([first, second]);
    });

    expect(mockRequestPermission).toHaveBeenCalledTimes(1);
  });

  it("opens app settings when the OS cannot ask again", async () => {
    const openSettings = jest
      .spyOn(Linking, "openSettings")
      .mockResolvedValue(undefined);
    mockPermission = {
      granted: false,
      canAskAgain: false,
      status: "denied",
    };
    const hook = await renderHook(() => useCheckInCamera());

    await act(async () => {
      await hook.result.current.handlePermissionAction();
    });

    expect(openSettings).toHaveBeenCalledTimes(1);
    expect(mockRequestPermission).not.toHaveBeenCalled();
  });

  it("exposes settings errors through the permission error message", async () => {
    jest.spyOn(Linking, "openSettings").mockRejectedValue(new Error("blocked"));
    mockPermission = {
      granted: false,
      canAskAgain: false,
      status: "denied",
    };
    const hook = await renderHook(() => useCheckInCamera());

    await act(async () => {
      await hook.result.current.handlePermissionAction();
    });

    expect(hook.result.current.permissionError).toBe(
      "Không thể mở Cài đặt. Vui lòng bật quyền Camera trong phần Cài đặt của hệ thống.",
    );
  });

  it("exposes reusable denied and undetermined permission states", async () => {
    mockPermission = {
      granted: false,
      canAskAgain: true,
      status: "undetermined",
    };
    const hook = await renderHook(() => useCheckInCamera());

    expect(hook.result.current.isPermissionDenied).toBe(true);
    expect(hook.result.current.isPermissionUndetermined).toBe(true);
  });
});
