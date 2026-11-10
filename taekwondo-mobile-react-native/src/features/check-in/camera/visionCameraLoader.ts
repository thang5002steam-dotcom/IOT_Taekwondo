import { isRunningInExpoGo } from "expo";

import type {
  VisionCameraModule,
  VisionFallbackReason,
} from "./cameraAdapters.types";

export type VisionCameraLoadResult =
  | { available: true; module: VisionCameraModule }
  | { available: false; reason: VisionFallbackReason; error?: unknown };

type VisionCameraLoaderOptions = {
  isExpoGo?: boolean;
  loadModule?: () => VisionCameraModule;
};

function loadBundledVisionModule(): VisionCameraModule {
  // Keep this require behind the Expo Go check. Metro bundles the module, but
  // its native bindings are not evaluated until this function runs.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("../components/VisionCheckInCamera") as VisionCameraModule;
}

export function isExpoGoRuntime(): boolean {
  // Check the native host rather than manifest metadata. A development client
  // can receive an Expo Go-shaped manifest when Metro is switched to `--go`,
  // but it still contains the native Vision Camera bindings.
  return isRunningInExpoGo();
}

export function loadVisionCamera(
  options: VisionCameraLoaderOptions = {},
): VisionCameraLoadResult {
  const isExpoGo = options.isExpoGo ?? isExpoGoRuntime();
  if (isExpoGo) {
    return { available: false, reason: "expo-go" };
  }

  try {
    const module = (options.loadModule ?? loadBundledVisionModule)();
    if (typeof module.VisionCheckInCamera !== "function") {
      return {
        available: false,
        reason: "native-module-unavailable",
      };
    }
    return { available: true, module };
  } catch (error) {
    return {
      available: false,
      reason: "native-module-unavailable",
      error,
    };
  }
}
