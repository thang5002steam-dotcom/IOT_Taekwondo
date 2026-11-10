import { useContext, useEffect, useMemo } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Plus } from "reicon-react-native";

import { Colors, effects, radii } from "@/theme";
import { AppIcon } from "./AppIcon";
import { ThemedText } from "./ThemedText";
import { Toast } from "./Toast/Toast";
import { ToastContext } from "./Toast/ToastProvider";

export type BottomSheetWindowProps = {
  visible: boolean;
  title: string;
  /** Fixed height as a viewport ratio. Omit to size to content between 30% and 80% of the viewport. */
  heightRatio?: number;
  accessibilityLabel?: string;
  backdropAccessibilityLabel?: string;
  closeAccessibilityLabel?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  overlay?: React.ReactNode;
  /** Render within a parent BottomSheetWindow overlay instead of opening another native modal. */
  presentation?: "modal" | "inline";
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  contentPaddingHorizontal?: boolean;
  onClose: () => void;
};

function project(velocity: number, decelerationRate = 0.998) {
  "worklet";
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

const AUTO_HEIGHT_MIN_RATIO = 0.3;
const AUTO_HEIGHT_MAX_RATIO = 0.8;

function clampHeightRatio(heightRatio: number) {
  return Math.min(Math.max(heightRatio, 0.25), AUTO_HEIGHT_MAX_RATIO);
}

const ModalRootView = GestureHandlerRootView;

export function BottomSheetWindow({
  visible,
  title,
  heightRatio,
  accessibilityLabel,
  backdropAccessibilityLabel = "Đóng cửa sổ",
  closeAccessibilityLabel = "Đóng",
  children,
  footer,
  overlay,
  presentation = "modal",
  scrollable = true,
  contentContainerStyle,
  contentPaddingHorizontal = true,
  onClose,
}: BottomSheetWindowProps) {
  const toastContext = useContext(ToastContext);
  const reducedMotion = useReducedMotion();
  const { height } = useWindowDimensions();
  const sheetHeight = useSharedValue(Math.round(height * 0.5));
  const translateY = useSharedValue(Math.round(height * 0.5));
  const context = useSharedValue(0);
  const sheetSizingStyle = useMemo(() => {
    if (!heightRatio) {
      return {
        minHeight: Math.round(height * AUTO_HEIGHT_MIN_RATIO),
        maxHeight: Math.round(height * AUTO_HEIGHT_MAX_RATIO),
      };
    }

    const heightValue = Math.round(height * clampHeightRatio(heightRatio));

    return {
      height: heightValue,
      maxHeight: heightValue,
      minHeight: heightValue,
    };
  }, [height, heightRatio]);

  useEffect(() => {
    if (visible) {
      if (reducedMotion) {
        translateY.set(0);
      } else {
        translateY.set(
          withSpring(0, {
            duration: 300,
            dampingRatio: 0.85,
            reduceMotion: ReduceMotion.System,
          }),
        );
      }
    } else {
      translateY.set(sheetHeight.get());
    }
  }, [reducedMotion, sheetHeight, translateY, visible]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-5, 10])
        .onStart(() => {
          context.set(translateY.get());
        })
        .onUpdate((event) => {
          const next = context.get() + event.translationY;
          // Clamp translateY >= 0: only allow dragging down to dismiss, never lift upwards
          translateY.set(Math.max(0, next));
        })
        .onEnd((event) => {
          const heightValue = sheetHeight.get();
          const projected = translateY.get() + project(event.velocityY);

          if (projected > heightValue * 0.4 || event.velocityY > 500) {
            translateY.set(
              withSpring(
                heightValue,
                {
                  duration: 300,
                  dampingRatio: 1,
                  velocity: event.velocityY,
                  overshootClamping: true,
                  reduceMotion: ReduceMotion.System,
                },
                (finished) => {
                  if (finished) scheduleOnRN(onClose);
                },
              ),
            );
          } else {
            translateY.set(
              withSpring(0, {
                duration: 300,
                dampingRatio: 0.8,
                velocity: event.velocityY,
                reduceMotion: ReduceMotion.System,
              }),
            );
          }
        }),
    [context, onClose, sheetHeight, translateY],
  );

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, Math.max(sheetHeight.value, 1)],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const headerContent = (
    <View style={styles.header}>
      <View style={styles.handle} />
      <ThemedText type="body" style={styles.title}>
        {title}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={closeAccessibilityLabel}
        hitSlop={10}
        onPress={onClose}
        style={({ pressed }) => [
          styles.closeButton,
          pressed ? styles.pressed : null,
        ]}
      >
        <AppIcon icon={<Plus />} size={18} color={Colors.light.textSecondary} />
      </Pressable>
    </View>
  );

  const sheetContent = (
    <Animated.View
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityViewIsModal
      style={[styles.sheet, sheetSizingStyle, sheetStyle]}
      onLayout={(event) => {
        sheetHeight.set(event.nativeEvent.layout.height);
      }}
    >
      {scrollable ? (
        <GestureDetector gesture={pan}>{headerContent}</GestureDetector>
      ) : (
        headerContent
      )}
      {scrollable ? (
        <ScrollView
          style={styles.body}
          contentContainerStyle={[
            styles.scrollContent,
            contentPaddingHorizontal ? styles.contentPaddingHorizontal : null,
            footer ? styles.scrollContentWithFooter : null,
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.body,
            contentPaddingHorizontal ? styles.contentPaddingHorizontal : null,
            footer ? styles.scrollContentWithFooter : null,
            contentContainerStyle,
          ]}
        >
          {children}
        </View>
      )}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </Animated.View>
  );

  const content = (
    <ModalRootView style={styles.root}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={backdropAccessibilityLabel}
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
      </Animated.View>
      {scrollable ? (
        sheetContent
      ) : (
        <GestureDetector gesture={pan}>{sheetContent}</GestureDetector>
      )}
      {overlay ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {overlay}
        </View>
      ) : null}
      {toastContext?.toast ? (
        <Toast
          key={toastContext.toast.key}
          message={toastContext.toast.message}
          variant={toastContext.toast.variant}
          duration={toastContext.toast.duration}
          onDismiss={toastContext.dismiss ?? (() => {})}
        />
      ) : null}
    </ModalRootView>
  );

  if (presentation === "inline") {
    return visible ? content : null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {content}
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  sheet: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: "hidden",
    paddingBottom: 24,
    ...effects.glass,
  },
  defaultSheetSizing: {
    maxHeight: "88%",
    minHeight: "78%",
  },
  header: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.divider,
  },
  handle: {
    position: "absolute",
    top: 7,
    width: 61,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: Colors.light.text,
  },
  title: {
    color: Colors.light.text,
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: 18,
    top: 13,
    width: 29,
    height: 29,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.divider,
    transform: [{ rotate: "45deg" }],
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 20,
  },
  contentPaddingHorizontal: {
    paddingHorizontal: 20,
  },
  scrollContentWithFooter: {
    paddingBottom: 90,
  },
  footer: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 28,
  },
  pressed: {
    opacity: 0.75,
  },
});
