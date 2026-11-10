import React from "react";
import {
  ActivityIndicator,
  Pressable,
  type StyleProp,
  StyleSheet,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, activeEffect, hexToRgba, radii } from "@/theme";

export type FloatingActionVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "ghost";

export type FloatingActionPlacement = "screen" | "sheet";

export interface FloatingActionItem {
  key?: string;
  label: string;
  onPress?: () => void;
  variant?: FloatingActionVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  flex?: number;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export interface FloatingActionBarProps {
  actions?: FloatingActionItem[];
  children?: React.ReactNode;
  /** Select the host layout preset. Sheet footers are compact and do not add screen insets. */
  placement?: FloatingActionPlacement;
  direction?: "row" | "column";
  /** Use the compact 48px action treatment even when fewer than three actions are shown. */
  compact?: boolean;
  gap?: number;
  minBottomInset?: number;
  includeBottomSafeArea?: boolean;
  paddingHorizontal?: number;
  paddingTop?: number;
  backgroundColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function FloatingActionBar({
  actions = [],
  children,
  placement = "screen",
  direction = "row",
  compact = false,
  gap,
  minBottomInset,
  includeBottomSafeArea,
  paddingHorizontal,
  paddingTop,
  backgroundColor,
  containerStyle,
  contentStyle,
}: FloatingActionBarProps) {
  const insets = useSafeAreaInsets();
  const isSheet = placement === "sheet";
  const resolvedMinBottomInset = minBottomInset ?? (isSheet ? 0 : 16);
  const resolvedIncludeBottomSafeArea = includeBottomSafeArea ?? !isSheet;
  const resolvedPaddingHorizontal = paddingHorizontal ?? (isSheet ? 0 : 20);
  const resolvedPaddingTop = paddingTop ?? (isSheet ? 0 : 12);
  const resolvedBackgroundColor =
    backgroundColor ??
    (isSheet ? "transparent" : hexToRgba(Colors.light.background, 0.94));
  const isCompact = isSheet || compact || actions.length >= 3;
  const defaultGap = gap ?? (isCompact ? 8 : 12);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.floatingActionWrap,
        isSheet ? styles.sheetActionWrap : styles.screenActionWrap,
        {
          paddingHorizontal: resolvedPaddingHorizontal,
          paddingTop: resolvedPaddingTop,
          paddingBottom: resolvedIncludeBottomSafeArea
            ? Math.max(insets.bottom, resolvedMinBottomInset)
            : resolvedMinBottomInset,
          backgroundColor: resolvedBackgroundColor,
        },
        containerStyle,
      ]}
    >
      {children ? (
        children
      ) : (
        <View
          style={[
            styles.actionsContainer,
            direction === "column" ? styles.columnLayout : styles.rowLayout,
            { gap: defaultGap },
            contentStyle,
          ]}
        >
          {actions.map((action, index) => {
            const {
              key,
              label,
              onPress,
              variant = index === actions.length - 1 ? "primary" : "outline",
              disabled = false,
              loading = false,
              icon,
              accessibilityLabel,
              flex = 1,
              testID,
              style: customStyle,
              textStyle: customTextStyle,
            } = action;

            const isInteractive = !disabled && !loading;

            const buttonStyle = getButtonVariantStyle(variant, disabled);
            const textStyle = getTextVariantStyle(variant, disabled);

            return (
              <Pressable
                key={key ?? `${label}-${index}`}
                testID={testID}
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel ?? label}
                accessibilityState={{ disabled }}
                disabled={!isInteractive}
                onPress={onPress}
                style={({ pressed }) => [
                  styles.buttonBase,
                  { flex },
                  isCompact ? styles.compactButton : null,
                  buttonStyle,
                  isInteractive ? activeEffect(pressed, "pressedScale") : null,
                  customStyle,
                  isSheet ? styles.sheetButton : null,
                ]}
              >
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      variant === "outline" || variant === "ghost"
                        ? Colors.light.primary
                        : Colors.light.surface
                    }
                  />
                ) : (
                  <>
                    {icon ? (
                      <View
                        style={[
                          styles.iconContainer,
                          !label ? styles.iconContainerNoLabel : null,
                        ]}
                      >
                        {icon}
                      </View>
                    ) : null}
                    {label ? (
                      <ThemedText
                        type={isCompact ? "subtitle" : "heading"}
                        numberOfLines={1}
                        style={[
                          styles.buttonTextBase,
                          isCompact ? styles.compactButtonText : null,
                          textStyle,
                          customTextStyle,
                        ]}
                      >
                        {label}
                      </ThemedText>
                    ) : null}
                  </>
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function getButtonVariantStyle(
  variant: FloatingActionVariant,
  disabled: boolean,
): StyleProp<ViewStyle> {
  if (disabled) {
    if (variant === "outline" || variant === "secondary") {
      return styles.outlineDisabled;
    }
    if (variant === "ghost") {
      return styles.ghostDisabled;
    }
    return styles.solidDisabled;
  }

  switch (variant) {
    case "outline":
    case "secondary":
      return styles.outlineButton;
    case "danger":
      return styles.dangerButton;
    case "ghost":
      return styles.ghostButton;
    case "primary":
    default:
      return styles.primaryButton;
  }
}

function getTextVariantStyle(
  variant: FloatingActionVariant,
  disabled: boolean,
): StyleProp<TextStyle> {
  if (disabled) {
    return styles.textDisabled;
  }

  switch (variant) {
    case "outline":
    case "secondary":
      return styles.outlineText;
    case "ghost":
      return styles.ghostText;
    case "danger":
    case "primary":
    default:
      return styles.solidText;
  }
}

const styles = StyleSheet.create({
  floatingActionWrap: {},
  screenActionWrap: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
  },
  sheetActionWrap: {
    position: "relative",
    width: "100%",
    height: 48,
  },
  actionsContainer: {
    width: "100%",
  },
  rowLayout: {
    flexDirection: "row",
    alignItems: "center",
  },
  columnLayout: {
    flexDirection: "column",
  },
  buttonBase: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.xl,
    paddingHorizontal: 12,
  },
  compactButton: {
    minHeight: 48,
    paddingHorizontal: 8,
  },
  sheetButton: {
    height: 48,
    minHeight: 48,
    maxHeight: 48,
  },
  iconContainer: {
    marginRight: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerNoLabel: {
    marginRight: 0,
  },
  buttonTextBase: {
    textAlign: "center",
  },
  compactButtonText: {
    fontSize: 14,
    lineHeight: 18,
  },

  // Button Variants
  primaryButton: {
    backgroundColor: Colors.light.primary,
  },
  outlineButton: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  dangerButton: {
    backgroundColor: Colors.light.error,
  },
  ghostButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.light.divider,
  },

  // Disabled Variants
  solidDisabled: {
    backgroundColor: Colors.light.divider,
  },
  outlineDisabled: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1.5,
    borderColor: Colors.light.divider,
  },
  ghostDisabled: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.light.divider,
  },

  // Text Variants
  solidText: {
    color: Colors.light.surface,
  },
  outlineText: {
    color: Colors.light.primary,
    fontWeight: "700",
  },
  ghostText: {
    color: Colors.light.text,
  },
  textDisabled: {
    color: Colors.light.textSecondary,
  },
});
