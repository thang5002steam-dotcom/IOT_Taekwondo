import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, radii } from "@/theme";
import { CameraView } from "expo-camera";
import { Image } from "expo-image";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Camera } from "reicon-react-native";

import type { CameraFacing } from "../types/faceScanner.types";
import { processFaceImageForCheckIn } from "../utils/faceImageProcessor";

type ManualExpoCheckInCameraProps = {
  facing: CameraFacing;
  torch: boolean;
  isActive: boolean;
  busy: boolean;
  bottomClearance: number;
  onReady: () => void;
  onReviewStateChange: (isReviewing: boolean) => void;
  onSubmitPhoto: (photoUri: string) => Promise<void> | void;
  onError: (message: string) => void;
};

export function ManualExpoCheckInCamera({
  facing,
  torch,
  isActive,
  busy,
  bottomClearance,
  onReady,
  onReviewStateChange,
  onSubmitPhoto,
  onError,
}: ManualExpoCheckInCameraProps) {
  const cameraRef = useRef<CameraView | null>(null);
  const captureInFlightRef = useRef(false);
  const submitInFlightRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmittingPhoto, setIsSubmittingPhoto] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const isBusy = busy || isSubmittingPhoto;

  const clearCapture = useCallback(() => {
    captureInFlightRef.current = false;
    submitInFlightRef.current = false;
    setIsCapturing(false);
    setIsSubmittingPhoto(false);
    setCapturedUri(null);
    setIsReady(false);
    onReviewStateChange(false);
  }, [onReviewStateChange]);

  const handleReady = useCallback(() => {
    setIsReady(true);
    onReady();
  }, [onReady]);

  const handleCapture = useCallback(async () => {
    if (
      captureInFlightRef.current ||
      !isReady ||
      isBusy ||
      !cameraRef.current
    ) {
      return;
    }

    captureInFlightRef.current = true;
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      if (!photo?.uri) throw new Error("Camera không trả về ảnh đã chụp.");

      let finalUri = photo.uri;
      try {
        const processed = await processFaceImageForCheckIn({
          photoUri: photo.uri,
          face: null,
          imageWidth: photo.width,
          imageHeight: photo.height,
          marginRatio: 0.25,
          maxDimension: 640,
          quality: 0.8,
        });
        finalUri = processed.uri;
      } catch (error) {
        console.warn(
          "[ManualCheckInCamera] Không thể tối ưu ảnh, dùng ảnh gốc:",
          error,
        );
      }

      setCapturedUri(finalUri);
      onReviewStateChange(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể chụp ảnh. Vui lòng thử lại.";
      onError(message);
    } finally {
      captureInFlightRef.current = false;
      setIsCapturing(false);
    }
  }, [isBusy, isReady, onError, onReviewStateChange]);

  const handleSubmit = useCallback(async () => {
    if (!capturedUri || isBusy || submitInFlightRef.current) return;
    submitInFlightRef.current = true;
    setIsSubmittingPhoto(true);
    try {
      await onSubmitPhoto(capturedUri);
    } finally {
      submitInFlightRef.current = false;
      setIsSubmittingPhoto(false);
    }
  }, [capturedUri, isBusy, onSubmitPhoto]);

  const controlsBottom = Math.max(bottomClearance - 88, 24);

  return (
    <>
      {capturedUri ? (
        <Image
          accessibilityLabel="Ảnh điểm danh đã chụp"
          source={{ uri: capturedUri }}
          contentFit="cover"
          style={StyleSheet.absoluteFill}
        />
      ) : isActive ? (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          enableTorch={facing === "back" && torch}
          mirror={facing === "front"}
          onCameraReady={handleReady}
          onMountError={(event) => onError(event.message)}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback]} />
      )}

      <View style={[styles.controls, { bottom: controlsBottom }]}>
        {capturedUri ? (
          <View style={styles.reviewActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Chụp lại ảnh điểm danh"
              accessibilityState={{ disabled: isBusy }}
              disabled={isBusy}
              onPress={clearCapture}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed ? styles.pressed : null,
                isBusy ? styles.disabled : null,
              ]}
            >
              <ThemedText type="action" style={styles.secondaryText}>
                Chụp lại
              </ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Gửi ảnh điểm danh"
              accessibilityState={{ disabled: isBusy }}
              disabled={isBusy}
              onPress={() => void handleSubmit()}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed ? styles.pressed : null,
                isBusy ? styles.disabled : null,
              ]}
            >
              {isBusy ? (
                <ActivityIndicator color={Colors.light.surface} />
              ) : (
                <ThemedText type="action" style={styles.primaryText}>
                  Gửi ảnh
                </ThemedText>
              )}
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Chụp ảnh điểm danh"
            accessibilityState={{
              disabled: !isReady || isCapturing || isBusy,
            }}
            disabled={!isReady || isCapturing || isBusy}
            onPress={() => void handleCapture()}
            style={({ pressed }) => [
              styles.captureOuter,
              pressed ? styles.capturePressed : null,
              !isReady || isCapturing || isBusy ? styles.disabled : null,
            ]}
          >
            <View style={styles.captureInner}>
              {isCapturing ? (
                <ActivityIndicator color={Colors.light.primary} />
              ) : (
                <AppIcon
                  icon={<Camera />}
                  size={28}
                  color={Colors.light.primary}
                />
              )}
            </View>
          </Pressable>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: "#111111",
  },
  controls: {
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 30,
    alignItems: "center",
  },
  captureOuter: {
    width: 72,
    height: 72,
    borderRadius: radii.pill,
    borderWidth: 3,
    borderColor: Colors.light.surface,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: Colors.light.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewActions: {
    width: "100%",
    maxWidth: 360,
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: radii.xl,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: radii.xl,
    backgroundColor: Colors.light.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.divider,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  primaryText: {
    color: Colors.light.surface,
  },
  secondaryText: {
    color: Colors.light.text,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  capturePressed: {
    transform: [{ scale: 0.96 }],
  },
  disabled: {
    opacity: 0.55,
  },
});
