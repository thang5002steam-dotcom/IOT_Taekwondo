import React, { memo, useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { X } from 'reicon-react-native';

import { Colors, effects, radii } from '@/theme';
import { AppIcon } from './AppIcon';
import { ThemedText } from './ThemedText';

const STRONG_EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export type CancellableLoadingOverlayProps = {
  visible: boolean;
  message?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

function CancellableLoadingOverlayComponent({
  visible,
  message = 'Đang lưu thay đổi...',
  cancelLabel = 'Hủy',
  onCancel,
  style,
  accessibilityLabel = 'Đang xử lý',
}: CancellableLoadingOverlayProps) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(reducedMotion ? 1 : 0.95);

  useEffect(() => {
    if (visible) {
      opacity.set(
        withTiming(1, {
          duration: 200,
          easing: STRONG_EASE_OUT,
        }),
      );
      scale.set(
        withTiming(1, {
          duration: 200,
          easing: STRONG_EASE_OUT,
        }),
      );
    } else {
      opacity.set(
        withTiming(0, {
          duration: 150,
          easing: STRONG_EASE_OUT,
        }),
      );
      scale.set(
        withTiming(reducedMotion ? 1 : 0.95, {
          duration: 150,
          easing: STRONG_EASE_OUT,
        }),
      );
    }
  }, [visible, reducedMotion, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ scale: scale.get() }],
  }));

  const handlePressCancel = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onCancel?.();
  }, [onCancel]);

  if (!visible) return null;

  return (
    <View
      style={[styles.backdrop, style]}
      pointerEvents="auto"
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={[styles.card, animatedStyle]}>
        <ActivityIndicator size="small" color={Colors.light.primary} />
        <ThemedText type="bodySmall" style={styles.message}>
          {message}
        </ThemedText>

        {onCancel ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
            onPress={handlePressCancel}
            style={({ pressed }) => [
              styles.cancelButton,
              pressed ? styles.cancelButtonPressed : null,
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppIcon icon={<X />} size={14} color={Colors.light.textSecondary} />
            <ThemedText type="caption" style={styles.cancelText}>
              {cancelLabel}
            </ThemedText>
          </Pressable>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 999,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.light.surface,
    borderRadius: radii.lg,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 14,
    ...effects.floating,
  },
  message: {
    color: Colors.light.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.light.divider,
    minHeight: 44,
    minWidth: 90,
  },
  cancelButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  cancelText: {
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
});

export const CancellableLoadingOverlay = memo(CancellableLoadingOverlayComponent);
