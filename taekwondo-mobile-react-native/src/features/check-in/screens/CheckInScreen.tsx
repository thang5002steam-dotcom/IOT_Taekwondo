import { ConfirmationDialog } from "@/shared/ui/ConfirmationDialog";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, radii } from "@/theme";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  type ComponentType,
  useCallback,
  useEffect,
  useState,
} from "react";
import { ActivityIndicator, AppState, StyleSheet, View } from "react-native";

import type {
  CheckInCameraMode,
  VisionCameraModule,
  VisionCheckInCameraProps,
  VisionFallbackReason,
} from "../camera/cameraAdapters.types";
import { loadVisionCamera } from "../camera/visionCameraLoader";
import { CheckInHeader } from "../components/CheckInHeader";
import { CheckInProcessingBanner } from "../components/CheckInProcessingBanner";
import { CheckInResultSheet } from "../components/CheckInResultSheet";
import { CheckInSessionHistorySheet } from "../components/CheckInSessionHistorySheet";
import { CheckInSideControls } from "../components/CheckInSideControls";
import { CheckInViewfinder } from "../components/CheckInViewfinder";
import { ManualCameraBanner } from "../components/ManualCameraBanner";
import { ManualExpoCheckInCamera } from "../components/ManualExpoCheckInCamera";
import { VisionCameraErrorBoundary } from "../components/VisionCameraErrorBoundary";
import { useCheckInCamera } from "../hooks/useCheckInCamera";
import { useCheckInCameraLayout } from "../hooks/useCheckInCameraLayout";
import { useFaceCheckInSession } from "../hooks/useFaceCheckInSession";
import type {
  FaceQualityReason,
  ScannerState,
} from "../types/faceScanner.types";

const CAMERA_PERMISSION_DESCRIPTION =
  "Camera được dùng để nhận diện khuôn mặt và điểm danh học viên/HLV.";
const CAMERA_PERMISSION_DENIED_DESCRIPTION =
  "Bạn đã từ chối quyền Camera. Vui lòng cho phép để tiếp tục điểm danh.";
const CAMERA_PERMISSION_LOCKED_DESCRIPTION =
  "Thiết bị không cho hỏi lại quyền Camera. Vui lòng bật quyền trong phần Cài đặt của hệ thống.";

type ScannerPresentation = {
  state: ScannerState;
  message: string;
  qualityReason: FaceQualityReason;
};

const DEFAULT_SCANNER_PRESENTATION: ScannerPresentation = {
  state: "initializing",
  message: "Đang khởi động camera...",
  qualityReason: "NO_FACE",
};

export default function CheckInScreen() {
  const layout = useCheckInCameraLayout();
  const session = useFaceCheckInSession();
  const [initialVisionLoad] = useState(loadVisionCamera);
  const [isFocused, setIsFocused] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [manualCameraError, setManualCameraError] = useState<string | null>(null);
  const [cameraMode, setCameraMode] =
    useState<CheckInCameraMode>(
      initialVisionLoad.available ? "vision-auto" : "manual",
    );
  const [fallbackReason, setFallbackReason] =
    useState<VisionFallbackReason | null>(
      initialVisionLoad.available ? null : initialVisionLoad.reason,
    );
  const [VisionCameraAdapter, setVisionCameraAdapter] =
    useState<ComponentType<VisionCheckInCameraProps> | null>(() =>
      initialVisionLoad.available
        ? initialVisionLoad.module.VisionCheckInCamera
        : null,
    );
  const [visionAttemptKey, setVisionAttemptKey] = useState(0);
  const [visionFlashAvailable, setVisionFlashAvailable] = useState(false);
  const [manualReviewVisible, setManualReviewVisible] = useState(false);
  const [scannerPresentation, setScannerPresentation] =
    useState<ScannerPresentation>(DEFAULT_SCANNER_PRESENTATION);

  const {
    handlePermissionAction,
    refreshPermission,
    isPermissionLoading,
    isPermissionGranted,
    isPermissionDenied,
    isPermissionUndetermined,
    canAskAgain,
    isPermissionActionPending,
    permissionError,
    facing,
    torch,
    isTorchAvailable,
    toggleFacing,
    toggleTorch,
  } = useCheckInCamera();

  const activateVisionModule = useCallback((module: VisionCameraModule) => {
    setVisionCameraAdapter(() => module.VisionCheckInCamera);
    setFallbackReason(null);
    setManualReviewVisible(false);
    setManualCameraError(null);
    setIsCameraReady(false);
    setCameraMode("vision-auto");
  }, []);

  const activateManualMode = useCallback(
    (reason: VisionFallbackReason, error?: unknown) => {
      if (error) console.warn("[CheckInCamera] Chuyển sang camera thủ công:", error);
      setFallbackReason(reason);
      setCameraMode("manual");
      setVisionFlashAvailable(false);
      setManualReviewVisible(false);
      setIsCameraReady(false);
    },
    [],
  );

  const tryLoadVisionCamera = useCallback(() => {
    setCameraMode("vision-loading");
    setIsCameraReady(false);
    setScannerPresentation(DEFAULT_SCANNER_PRESENTATION);
    const result = loadVisionCamera();
    if (result.available) {
      activateVisionModule(result.module);
    } else {
      activateManualMode(result.reason, result.error);
    }
  }, [activateManualMode, activateVisionModule]);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      void refreshPermission().then((result) => {
        if (!result?.granted) setIsCameraReady(false);
      });

      return () => {
        setIsFocused(false);
        setIsCameraReady(false);
      };
    }, [refreshPermission]),
  );

  useEffect(() => {
    if (!isFocused) return;
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void refreshPermission().then((result) => {
          if (!result?.granted) setIsCameraReady(false);
        });
      }
    });
    return () => subscription.remove();
  }, [isFocused, refreshPermission]);

  const leaveCheckInScreen = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }, []);
  const goHome = useCallback(() => router.replace("/"), []);

  const handleCameraReady = useCallback(() => {
    setManualCameraError(null);
    setIsCameraReady(true);
  }, []);

  const handleAllowPermission = useCallback(async () => {
    setManualCameraError(null);
    setIsCameraReady(false);
    await handlePermissionAction();
  }, [handlePermissionAction]);

  const handleToggleFacing = useCallback(() => {
    setManualCameraError(null);
    setIsCameraReady(false);
    setManualReviewVisible(false);
    toggleFacing();
  }, [toggleFacing]);

  const handleRetryVision = useCallback(() => {
    setVisionAttemptKey((value) => value + 1);
    tryLoadVisionCamera();
  }, [tryLoadVisionCamera]);

  const handleScannerPresentationChange = useCallback(
    (
      state: ScannerState,
      message: string,
      qualityReason: FaceQualityReason,
    ) => setScannerPresentation({ state, message, qualityReason }),
    [],
  );

  const isCameraActive =
    isFocused && isPermissionGranted && !manualCameraError;
  const isSubmittingOrProcessing =
    session.status === "submitting" ||
    session.status === "processing" ||
    session.isPending;
  const isCameraSuspended =
    session.isResultSheetVisible ||
    session.isHistorySheetVisible ||
    isSubmittingOrProcessing;
  const scannerEnabled =
    isCameraActive && isCameraReady && !isCameraSuspended;
  const shouldShowPermissionDialog =
    isFocused && !isPermissionLoading && !isPermissionGranted;
  const permissionDialogDescription =
    permissionError ||
    (!canAskAgain
      ? CAMERA_PERMISSION_LOCKED_DESCRIPTION
      : isPermissionDenied && !isPermissionUndetermined
        ? CAMERA_PERMISSION_DENIED_DESCRIPTION
        : CAMERA_PERMISSION_DESCRIPTION);
  const effectiveTorchAvailable =
    facing === "back" &&
    (cameraMode === "manual"
      ? isTorchAvailable
      : cameraMode === "vision-auto" && visionFlashAvailable);
  const canRetryVision =
    fallbackReason === "vision-runtime-error" || fallbackReason === "mlkit-error";

  const manualScannerState: ScannerState =
    session.status === "submitting"
      ? "submitting"
      : session.status === "processing"
        ? "processing"
        : session.status === "result"
          ? "result"
          : session.status === "error"
            ? "error"
            : "scanning";

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {cameraMode === "vision-auto" && VisionCameraAdapter ? (
        <VisionCameraErrorBoundary
          resetKey={visionAttemptKey}
          onError={(error) =>
            activateManualMode("vision-runtime-error", error)
          }
        >
          <VisionCameraAdapter
            key={`vision-${facing}-${visionAttemptKey}`}
            facing={facing}
            torch={torch}
            isActive={isCameraActive && !isCameraSuspended}
            scannerEnabled={scannerEnabled}
            sessionStatus={session.status}
            resetToken={session.resetToken}
            onReady={handleCameraReady}
            onFlashAvailabilityChange={setVisionFlashAvailable}
            onScannerPresentationChange={handleScannerPresentationChange}
            onPhotoCaptured={session.submitPhoto}
            onUnavailable={activateManualMode}
          />
        </VisionCameraErrorBoundary>
      ) : cameraMode === "manual" ? (
        <ManualExpoCheckInCamera
          key={`manual-${facing}-${session.resetToken}`}
          facing={facing}
          torch={torch}
          isActive={isCameraActive && !isCameraSuspended}
          busy={isSubmittingOrProcessing}
          bottomClearance={layout.bottomClearance}
          onReady={handleCameraReady}
          onReviewStateChange={setManualReviewVisible}
          onSubmitPhoto={session.submitPhoto}
          onError={setManualCameraError}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallbackBackground]} />
      )}

      <View style={[StyleSheet.absoluteFill, styles.darkOverlay]} pointerEvents="none" />

      <View style={styles.overlayContainer} pointerEvents="box-none">
        <CheckInHeader
          torch={torch}
          onToggleTorch={toggleTorch}
          isTorchAvailable={effectiveTorchAvailable}
          topInset={layout.topInset}
          onBack={leaveCheckInScreen}
        />

        <CheckInProcessingBanner
          visible={isSubmittingOrProcessing}
          onCancel={session.cancelCheckIn}
        />

        {cameraMode === "manual" && fallbackReason ? (
          <ManualCameraBanner
            reason={fallbackReason}
            top={layout.headerHeight + 8}
            onRetryVision={canRetryVision ? handleRetryVision : undefined}
          />
        ) : null}

        <View
          style={[
            styles.scanArea,
            { top: layout.headerHeight, bottom: layout.bottomClearance },
          ]}
          pointerEvents="box-none"
        >
          {isCameraActive && !isCameraReady ? (
            <View
              style={[
                styles.cameraLoadingBadge,
                cameraMode === "manual" && fallbackReason != null
                  ? styles.cameraLoadingBadgeBelowBanner
                  : null,
              ]}
            >
              <ActivityIndicator color={Colors.light.surface} />
              <ThemedText type="bodySmall" style={styles.cameraLoadingText}>
                Đang mở camera...
              </ThemedText>
            </View>
          ) : null}

          {isCameraActive && isCameraReady && !manualReviewVisible ? (
            <CheckInViewfinder
              scanState={
                cameraMode === "manual"
                  ? manualScannerState
                  : scannerPresentation.state
              }
              scanAreaHeight={layout.scanAreaHeight}
              feedbackMessage={
                cameraMode === "manual"
                  ? session.errorMessage ||
                    "Căn khuôn mặt vào khung rồi nhấn nút chụp"
                  : session.errorMessage || scannerPresentation.message
              }
              qualityReason={
                cameraMode === "manual"
                  ? "NO_FACE"
                  : scannerPresentation.qualityReason
              }
            />
          ) : null}
        </View>

        {isCameraActive && !manualReviewVisible ? (
          <CheckInSideControls
            onToggleFacing={handleToggleFacing}
            onOpenHistory={session.openHistorySheet}
            historyCount={session.sessionHistory.length}
            top={layout.controlsTop}
          />
        ) : null}
      </View>

      <CheckInResultSheet
        visible={session.isResultSheetVisible}
        isPending={session.isPending}
        record={session.currentResult}
        failure={session.currentFailure}
        onNextScan={session.handleNextScan}
        onClose={session.closeResultSheet}
        onCancel={session.cancelCheckIn}
      />
      <CheckInSessionHistorySheet
        visible={session.isHistorySheetVisible}
        history={session.sessionHistory}
        onClose={session.closeHistorySheet}
      />

      <ConfirmationDialog
        visible={shouldShowPermissionDialog}
        title="Cho phép sử dụng Camera"
        description={permissionDialogDescription}
        cancelLabel="Để sau"
        confirmLabel={canAskAgain ? "Cho phép" : "Chuyển hướng"}
        pending={isPermissionActionPending}
        actionOrder="confirm-cancel"
        onCancel={goHome}
        onConfirm={() => void handleAllowPermission()}
      />
      <ConfirmationDialog
        visible={Boolean(manualCameraError)}
        title="Không mở được Camera"
        description={manualCameraError || "Camera chưa khởi động được."}
        cancelLabel="Quay lại"
        confirmLabel="Thử lại"
        onCancel={leaveCheckInScreen}
        onConfirm={() => {
          setManualCameraError(null);
          setIsCameraReady(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  fallbackBackground: {
    backgroundColor: "#18191B",
  },
  darkOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.15)",
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  scanArea: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraLoadingBadge: {
    position: "absolute",
    top: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    zIndex: 2,
  },
  cameraLoadingText: {
    color: Colors.light.surface,
  },
  cameraLoadingBadgeBelowBanner: {
    top: 76,
  },
});
