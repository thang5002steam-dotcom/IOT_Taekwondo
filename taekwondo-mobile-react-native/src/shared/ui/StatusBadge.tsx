import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { Colors, hexToRgba, radii } from "@/theme";

import { ThemedText } from "./ThemedText";

export type StatusBadgeTone = "primary" | "neutral";

export type StatusBadgeProps = {
  label: string;
  tone?: StatusBadgeTone;
  style?: StyleProp<ViewStyle>;
};

export function StatusBadge({
  label,
  tone = "primary",
  style,
}: StatusBadgeProps) {
  const primary = tone === "primary";

  return (
    <View
      style={[
        styles.root,
        primary ? styles.primaryRoot : styles.neutralRoot,
        style,
      ]}
    >
      <ThemedText
        type="featureLabel"
        style={[styles.text, primary ? styles.primaryText : styles.neutralText]}
        numberOfLines={1}
      >
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  primaryRoot: {
    borderColor: hexToRgba(Colors.light.primary, 0.2),
    backgroundColor: hexToRgba(Colors.light.primary, 0.08),
  },
  neutralRoot: {
    borderColor: Colors.light.divider,
    backgroundColor: hexToRgba(Colors.light.divider, 0.24),
  },
  text: {
    textAlign: "center",
  },
  primaryText: {
    color: Colors.light.primary,
  },
  neutralText: {
    color: Colors.light.textSecondary,
  },
});
