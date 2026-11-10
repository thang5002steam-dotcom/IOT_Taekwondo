import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Colors, effects, radii } from "@/theme";

import { ThemedText } from "./ThemedText";

export type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
};

export type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: "surface" | "primary";
  accessibilityRole?: "button" | "tab";
  style?: StyleProp<ViewStyle>;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  variant = "surface",
  accessibilityRole = "tab",
  style,
}: SegmentedControlProps<T>) {
  const primary = variant === "primary";

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.root, primary ? styles.primaryRoot : null, style]}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole={accessibilityRole}
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.item,
              primary ? styles.primaryItem : null,
              selected
                ? primary
                  ? styles.primaryItemSelected
                  : styles.surfaceItemSelected
                : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <ThemedText
              type="featureLabel"
              style={[
                primary ? styles.primaryText : styles.surfaceText,
                selected
                  ? primary
                    ? styles.primaryTextSelected
                    : styles.surfaceTextSelected
                  : null,
              ]}
            >
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    minHeight: 52,
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: radii.pill,
    backgroundColor: Colors.light.backgroundElement,
    ...effects.soft,
  },
  primaryRoot: {
    gap: 8,
    padding: 0,
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  item: {
    flex: 1,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    paddingHorizontal: 12,
  },
  primaryItem: {
    minHeight: 44,
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: 14,
  },
  surfaceItemSelected: {
    backgroundColor: Colors.light.surface,
    ...effects.soft,
  },
  primaryItemSelected: {
    backgroundColor: Colors.light.primary,
  },
  surfaceText: {
    color: Colors.light.textSecondary,
  },
  surfaceTextSelected: {
    color: Colors.light.primary,
  },
  primaryText: {
    color: Colors.light.textSecondary,
  },
  primaryTextSelected: {
    color: Colors.light.surface,
  },
  pressed: {
    opacity: 0.75,
  },
});
