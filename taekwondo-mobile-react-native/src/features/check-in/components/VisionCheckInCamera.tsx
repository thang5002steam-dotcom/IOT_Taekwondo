import { useCallback, useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Camera } from "react-native-vision-camera";

import type { VisionCheckInCameraProps } from "../camera/cameraAdapters.types";
import type { ScannerState } from "../types/faceScanner.types";
import { useFaceScanner } from "../hooks/useFaceScanner";

export function VisionCheckInCamera({
  facing,
  torch,
  isActive,
  scannerEnabled,
  sessionStatus,
  resetToken,
  onReady,
  onFlashAvailabilityChange,
  onScannerPresentationChange,
  onPhotoCaptured,
  onUnavailable,
}: VisionCheckInCameraProps) {
  const handleScannerError = useCallback(
    (source: "vision" | "mlkit", error: unknown) => {
      onUnavailable(
        source === "mlkit" ? "mlkit-error" : "vision-runtime-error",
        error,
      );
    },
    [onUnavailable],
  );

  const {
    scannerState,
    feedbackMessage,
    qualityReason,
    device,
    photoOutput,
    faceDetectorOutput,
    resumeScanner,
    setScannerState,
  } = useFaceScanner({
    facing,
    isActive: scannerEnabled,
    onFaceCaptured: onPhotoCaptured,
    onScannerError: handleScannerError,
  });

  useEffect(() => {
    onFlashAvailabilityChange(Boolean(device?.hasFlash));
  }, [device?.hasFlash, onFlashAvailabilityChange]);

  useEffect(() => {
    onScannerPresentationChange(
      scannerState,
      feedbackMessage,
      qualityReason,
    );
  }, [
    onScannerPresentationChange,
    feedbackMessage,
    qualityReason,
    scannerState,
  ]);

  useEffect(() => {
    const stateByStatus: Partial<Record<typeof sessionStatus, ScannerState>> = {
      submitting: "submitting",
      processing: "processing",
      result: "result",
      error: "error",
    };
    const nextState = stateByStatus[sessionStatus];
    if (nextState) setScannerState(nextState);
  }, [sessionStatus, setScannerState]);

  useEffect(() => {
    if (resetToken > 0) resumeScanner();
  }, [resetToken, resumeScanner]);

  const outputs = useMemo(
    () => [photoOutput, faceDetectorOutput],
    [faceDetectorOutput, photoOutput],
  );

  if (!device) {
    return <View style={[StyleSheet.absoluteFill, styles.fallback]} />;
  }

  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={isActive}
      outputs={outputs}
      torchMode={device.hasFlash ? (torch ? "on" : "off") : undefined}
      onStarted={onReady}
      onError={(error) => onUnavailable("vision-runtime-error", error)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: "#111111",
  },
});
