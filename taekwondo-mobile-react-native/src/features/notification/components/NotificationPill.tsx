import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, hexToRgba, radii } from "@/theme";

export type NotificationPillProps = {
  children: ReactNode;
  tone?: "neutral" | "primary";
};

export function NotificationPill({
  children,
  tone = "neutral",
}: NotificationPillProps) {
  const isPrimary = tone === "primary";

  return (
    <View style={[styles.pill, isPrimary ? styles.primaryPill : null]}>
      <ThemedText
        type="caption"
        style={[styles.text, isPrimary ? styles.primaryText : null]}
      >
        {children}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: 24,
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: 9,
  },
  primaryPill: {
    backgroundColor: hexToRgba(Colors.light.primary, 0.08),
  },
  text: {
    color: Colors.light.textSecondary,
  },
  primaryText: {
    color: Colors.light.primary,
  },
});
