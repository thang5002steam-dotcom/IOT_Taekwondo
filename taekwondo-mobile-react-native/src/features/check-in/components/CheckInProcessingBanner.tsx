import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, radii } from "@/theme";
import * as Haptics from "expo-haptics";
import { memo, useCallback, useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { X } from "reicon-react-native";

const STRONG_EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export type CheckInProcessingBannerProps = {
  visible: boolean;
  onCancel: () => void;
};

function CheckInProcessingBannerComponent({
  visible,
  onCancel,
}: CheckInProcessingBannerProps) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(reducedMotion ? 0 : -12);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      opacity.set(
        withTiming(1, {
          duration: 250,
          easing: STRONG_EASE_OUT,
        }),
      );
      translateY.set(
        withTiming(0, {
          duration: 250,
          easing: STRONG_EASE_OUT,
        }),
      );

      if (!reducedMotion) {
        pulseScale.set(
          withRepeat(
            withSequence(
              withTiming(1.06, { duration: 600, easing: STRONG_EASE_OUT }),
              withTiming(0.96, { duration: 600, easing: STRONG_EASE_OUT }),
            ),
            -1,
            true,
          ),
        );
      }
    } else {
      opacity.set(
        withTiming(0, {
          duration: 200,
          easing: STRONG_EASE_OUT,
        }),
      );
      translateY.set(
        withTiming(reducedMotion ? 0 : -12, {
          duration: 200,
          easing: STRONG_EASE_OUT,
        }),
      );
      pulseScale.set(1);
    }
  }, [visible, reducedMotion, opacity, translateY, pulseScale]);

  const animatedBannerStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateY: translateY.get() }],
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.get() }],
  }));

  const handlePressCancel = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onCancel();
  }, [onCancel]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.processingBanner, animatedBannerStyle]}>
      <Animated.View style={[styles.processingPulseBadge, animatedPulseStyle]}>
        <ActivityIndicator size="small" color={Colors.light.surface} />
      </Animated.View>

      <ThemedText type="bodySmall" style={styles.processingText}>
        Đang xử lý điểm danh...
      </ThemedText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Hủy điểm danh"
        onPress={handlePressCancel}
        style={({ pressed }) => [
          styles.cancelButton,
          pressed ? styles.cancelButtonPressed : null,
        ]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <AppIcon icon={<X />} size={14} color={Colors.light.surface} />
        <ThemedText type="caption" style={styles.cancelButtonText}>
          Hủy
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  processingBanner: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(24, 25, 27, 0.88)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.pill,
    gap: 10,
    zIndex: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  processingPulseBadge: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  processingText: {
    color: Colors.light.surface,
    fontWeight: "600",
    fontSize: 13,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    gap: 4,
  },
  cancelButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  cancelButtonText: {
    color: Colors.light.surface,
    fontWeight: "600",
    fontSize: 12,
  },
});

export const CheckInProcessingBanner = memo(CheckInProcessingBannerComponent);
