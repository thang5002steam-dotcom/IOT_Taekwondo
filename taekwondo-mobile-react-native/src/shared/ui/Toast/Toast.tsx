import { XCircle } from "reicon-react-native";
import { useCallback, useEffect, useRef } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { effects, radii } from "@/theme";

import type { ToastVariant } from "./ToastProvider";

// ---------------------------------------------------------------------------
// Variant colours — static hex values safe for Reanimated (no PlatformColor).
// ---------------------------------------------------------------------------

const variantConfig: Record<
  ToastVariant,
  { bg: string; border: string; text: string; iconColor: string }
> = {
  success: {
    bg: "#ECFDF5",
    border: "#A7F3D0",
    text: "#065F46",
    iconColor: "#059669",
  },
  error: {
    bg: "#FEF2F2",
    border: "#FECACA",
    text: "#991B1B",
    iconColor: "#DC2626",
  },
  warning: {
    bg: "#FFFBEB",
    border: "#FDE68A",
    text: "#92400E",
    iconColor: "#D97706",
  },
  info: {
    bg: "#EFF6FF",
    border: "#BFDBFE",
    text: "#1E40AF",
    iconColor: "#2563EB",
  },
};

// ---------------------------------------------------------------------------
// Animation constants
// ---------------------------------------------------------------------------

const SLIDE_SPRING = { damping: 28, stiffness: 450 } as const;
const FADE_DURATION = 450; // ms for the fade‑out opacity ramp
const DISMISS_SLIDE = 200; // ms for the slide‑up on manual dismiss

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type ToastProps = {
  message: string;
  variant: ToastVariant;
  duration: number;
  onDismiss: () => void;
};

export function Toast({ message, variant, duration, onDismiss }: ToastProps) {
  const config = variantConfig[variant];
  const insets = useSafeAreaInsets();
  const topOffset = Math.max(
    insets.top + 8,
    Platform.select({ ios: 54, android: 44 }) ?? 44,
  );

  // Shared values driving Reanimated animations on the UI thread.
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);

  // Timer ref so we can cancel / restart the auto‑dismiss countdown.
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- helpers ---------------------------------------------------------------

  const clearFadeTimer = useCallback(() => {
    if (fadeTimerRef.current !== null) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  }, []);

  /** Begin the opacity ramp‑down, then call `onDismiss` when done. */
  const startFadeOut = useCallback(() => {
    clearFadeTimer();
    opacity.set(
      withTiming(0, { duration: FADE_DURATION }, (finished) => {
        if (finished) {
          runOnJS(onDismiss)();
        }
      }),
    );
  }, [clearFadeTimer, onDismiss, opacity]);

  /** Schedule the fade‑out after `delay` ms. */
  const scheduleFadeOut = useCallback(
    (delay: number) => {
      clearFadeTimer();
      fadeTimerRef.current = setTimeout(startFadeOut, delay);
    },
    [clearFadeTimer, startFadeOut],
  );

  // --- lifecycle -------------------------------------------------------------

  useEffect(() => {
    // Enter: slide down + fade in.
    translateY.set(withSpring(0, SLIDE_SPRING));
    opacity.set(withTiming(1, { duration: 250 }));

    // Haptic feedback (iOS only).
    if (Platform.OS === "ios") {
      void (async () => {
        try {
          const Haptics = await import("expo-haptics");
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
        } catch {
          // Haptics unavailable — no‑op.
        }
      })();
    }

    // Auto‑dismiss schedule.
    scheduleFadeOut(duration);

    return () => {
      clearFadeTimer();
    };
    // Only run on mount — deps are stable refs / shared‑values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- gesture handlers (press‑hold to pause) --------------------------------

  const handlePressIn = useCallback(() => {
    // Cancel any pending fade and restore full opacity instantly.
    clearFadeTimer();
    opacity.set(withTiming(1, { duration: 120 }));
  }, [clearFadeTimer, opacity]);

  const handlePressOut = useCallback(() => {
    // After releasing, give the user 2 s before fading again.
    scheduleFadeOut(2000);
  }, [scheduleFadeOut]);

  // --- manual dismiss --------------------------------------------------------

  const handleDismiss = useCallback(() => {
    clearFadeTimer();
    translateY.set(withTiming(-80, { duration: DISMISS_SLIDE }));
    opacity.set(
      withTiming(0, { duration: DISMISS_SLIDE }, (finished) => {
        if (finished) {
          runOnJS(onDismiss)();
        }
      }),
    );
  }, [clearFadeTimer, onDismiss, opacity, translateY]);

  // --- animated style --------------------------------------------------------

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.get() }],
    opacity: opacity.get(),
  }));

  // --- render ----------------------------------------------------------------

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: topOffset,
          backgroundColor: config.bg,
          borderColor: config.border,
        },
        animatedStyle,
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Pressable
        style={styles.body}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityHint="Nhấn giữ để tạm dừng tự ẩn"
      >
        <View style={styles.content}>
          <ThemedText
            type="bodySmall"
            style={[styles.message, { color: config.text }]}
            numberOfLines={3}
          >
            {message}
          </ThemedText>
        </View>

        <Pressable
          onPress={handleDismiss}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Đóng thông báo"
          style={({ pressed }) => [
            styles.dismiss,
            pressed && styles.dismissPressed,
          ]}
        >
          <AppIcon icon={<XCircle weight="Filled" />} size={22} color={config.iconColor} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: radii.md,
    borderWidth: 1,
    borderCurve: "continuous",
    ...effects.card,
    zIndex: 9999,
    elevation: 9999,
  },
  body: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 8,
    gap: 10,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  message: {
    flexShrink: 1,
  },
  dismiss: {
    padding: 4,
    borderRadius: radii.pill,
  },
  dismissPressed: {
    opacity: 0.5,
  },
});
