import type { ComponentType } from "react";

import type {
  CameraFacing,
  FaceCheckInSessionStatus,
} from "../types/camera.types";
import type {
  FaceQualityReason,
  ScannerState,
} from "../types/faceScanner.types";

export type VisionFallbackReason =
  | "expo-go"
  | "native-module-unavailable"
  | "vision-runtime-error"
  | "mlkit-error";

export type CheckInCameraMode = "vision-loading" | "vision-auto" | "manual";

export type VisionCheckInCameraProps = {
  facing: CameraFacing;
  torch: boolean;
  isActive: boolean;
  scannerEnabled: boolean;
  sessionStatus: FaceCheckInSessionStatus;
  resetToken: number;
  onReady: () => void;
  onFlashAvailabilityChange: (available: boolean) => void;
  onScannerPresentationChange: (
    state: ScannerState,
    message: string,
    qualityReason: FaceQualityReason,
  ) => void;
  onPhotoCaptured: (photoUri: string) => Promise<void> | void;
  onUnavailable: (reason: VisionFallbackReason, error?: unknown) => void;
};

export type VisionCameraModule = {
  VisionCheckInCamera: ComponentType<VisionCheckInCameraProps>;
};
