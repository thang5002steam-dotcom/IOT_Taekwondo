import type { CameraFacing } from '../types/faceScanner.types';
import { useFaceCheckIn } from './useFaceCheckIn';

export function useContinuousFaceScan(
  isEnabled: boolean = true,
  facing: CameraFacing = 'front',
) {
  const checkIn = useFaceCheckIn({
    facing,
    isActive: isEnabled,
  });

  return {
    scanState: checkIn.scannerState,
    feedbackMessage: checkIn.feedbackMessage,
    qualityReason: checkIn.qualityReason,
    currentResult: checkIn.currentResult,
    sessionHistory: checkIn.sessionHistory,
    isResultSheetVisible: checkIn.isResultSheetVisible,
    isHistorySheetVisible: checkIn.isHistorySheetVisible,
    errorMessage: checkIn.errorMessage,
    device: checkIn.device,
    photoOutput: checkIn.photoOutput,
    faceDetectorOutput: checkIn.faceDetectorOutput,
    handleNextScan: checkIn.handleNextScan,
    closeResultSheet: checkIn.closeResultSheet,
    openHistorySheet: checkIn.openHistorySheet,
    closeHistorySheet: checkIn.closeHistorySheet,
    resumeScanner: checkIn.resumeScanner,
    pauseScanner: checkIn.pauseScanner,
  };
}
