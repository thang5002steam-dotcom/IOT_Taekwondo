import { loadVisionCamera } from "./visionCameraLoader";

describe("loadVisionCamera", () => {
  it("does not evaluate the Vision module in Expo Go", () => {
    const loadModule = jest.fn();
    const result = loadVisionCamera({ isExpoGo: true, loadModule });

    expect(result).toEqual({ available: false, reason: "expo-go" });
    expect(loadModule).not.toHaveBeenCalled();
  });

  it("returns the native-module fallback when loading throws", () => {
    const error = new Error("native module missing");
    const result = loadVisionCamera({
      isExpoGo: false,
      loadModule: () => {
        throw error;
      },
    });

    expect(result).toEqual({
      available: false,
      reason: "native-module-unavailable",
      error,
    });
  });

  it("returns the Vision adapter in a compatible native build", () => {
    const VisionCheckInCamera = () => null;
    const result = loadVisionCamera({
      isExpoGo: false,
      loadModule: () => ({ VisionCheckInCamera }),
    });

    expect(result).toEqual({
      available: true,
      module: { VisionCheckInCamera },
    });
  });
});
