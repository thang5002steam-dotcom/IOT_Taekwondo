import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, radii } from "@/theme";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import type { VisionFallbackReason } from "../camera/cameraAdapters.types";

type ManualCameraBannerProps = {
  reason: VisionFallbackReason;
  top: number;
  onRetryVision?: () => void;
};

function ManualCameraBannerComponent({
  reason,
  top,
  onRetryVision,
}: ManualCameraBannerProps) {
  const detail =
    reason === "expo-go"
      ? "Expo Go không hỗ trợ nhận diện tự động."
      : reason === "native-module-unavailable"
        ? "Nhận diện tự động chưa có trong bản ứng dụng này."
        : "Nhận diện tự động tạm thời gặp lỗi.";

  return (
    <View
      accessibilityRole="summary"
      style={[styles.container, { top }]}
    >
      <View style={styles.copy}>
        <ThemedText type="bodySmall" style={styles.title}>
          Đang dùng chế độ chụp thủ công
        </ThemedText>
        <ThemedText type="caption" style={styles.detail}>
          {detail}
        </ThemedText>
      </View>
      {onRetryVision ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Thử lại camera tự động"
          onPress={onRetryVision}
          style={({ pressed }) => [
            styles.retryButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <ThemedText type="caption" style={styles.retryText}>
            Thử camera tự động
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 25,
    minHeight: 56,
    borderRadius: radii.md,
    backgroundColor: "rgba(0, 0, 0, 0.68)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.24)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: Colors.light.surface,
  },
  detail: {
    color: "rgba(255, 255, 255, 0.78)",
  },
  retryButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  retryText: {
    color: Colors.light.surface,
    textDecorationLine: "underline",
  },
  pressed: {
    opacity: 0.75,
  },
});

export const ManualCameraBanner = memo(ManualCameraBannerComponent);
