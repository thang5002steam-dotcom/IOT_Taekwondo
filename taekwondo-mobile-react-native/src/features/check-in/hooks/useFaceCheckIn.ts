import { useCallback, useEffect } from "react";

import type { CameraFacing, ScannerState } from "../types/faceScanner.types";
import { useFaceCheckInSession } from "./useFaceCheckInSession";
import { useFaceScanner } from "./useFaceScanner";

export type UseFaceCheckInProps = {
  facing: CameraFacing;
  isActive: boolean;
};

/**
 * Backwards-compatible Vision Camera composition.
 * New camera adapters share useFaceCheckInSession directly so the submission
 * flow never imports Vision Camera in Expo Go.
 */
export function useFaceCheckIn({ facing, isActive }: UseFaceCheckInProps) {
  const session = useFaceCheckInSession();
  const {
    status,
    currentResult,
    currentFailure,
    isPending,
    sessionHistory,
    isResultSheetVisible,
    isHistorySheetVisible,
    errorMessage,
    resetToken,
    submitPhoto,
    handleNextScan: resetForNextScan,
    closeResultSheet: closeSessionResult,
    cancelCheckIn: cancelSession,
    openHistorySheet: openSessionHistory,
    closeHistorySheet: closeSessionHistory,
  } = session;
  const scanner = useFaceScanner({
    facing,
    isActive:
      isActive &&
      !isResultSheetVisible &&
      !isHistorySheetVisible &&
      !isPending,
    onFaceCaptured: submitPhoto,
  });
  const {
    scannerState,
    feedbackMessage,
    qualityReason,
    device,
    photoOutput,
    faceDetectorOutput,
    resumeScanner,
    pauseScanner,
    setScannerState,
  } = scanner;

  useEffect(() => {
    const scannerStateBySessionStatus: Partial<
      Record<typeof status, ScannerState>
    > = {
      submitting: "submitting",
      processing: "processing",
      result: "result",
      error: "error",
    };
    const nextState = scannerStateBySessionStatus[status];
    if (nextState) setScannerState(nextState);
  }, [setScannerState, status]);

  useEffect(() => {
    if (resetToken > 0) resumeScanner();
  }, [resetToken, resumeScanner]);

  const handleNextScan = useCallback(() => {
    resetForNextScan();
    resumeScanner();
  }, [resetForNextScan, resumeScanner]);

  const closeResultSheet = useCallback(() => {
    closeSessionResult();
    resumeScanner();
  }, [closeSessionResult, resumeScanner]);

  const cancelCheckIn = useCallback(() => {
    cancelSession();
    resumeScanner();
  }, [cancelSession, resumeScanner]);

  const openHistorySheet = useCallback(() => {
    openSessionHistory();
    pauseScanner();
  }, [openSessionHistory, pauseScanner]);

  const closeHistorySheet = useCallback(() => {
    closeSessionHistory();
    resumeScanner();
  }, [closeSessionHistory, resumeScanner]);

  return {
    scannerState,
    feedbackMessage: errorMessage || feedbackMessage,
    qualityReason,
    device,
    photoOutput,
    faceDetectorOutput,
    currentResult,
    currentFailure,
    isPending,
    sessionHistory,
    isResultSheetVisible,
    isHistorySheetVisible,
    errorMessage,
    handleNextScan,
    closeResultSheet,
    cancelCheckIn,
    openHistorySheet,
    closeHistorySheet,
    resumeScanner,
    pauseScanner,
    setScannerState,
  };
}
