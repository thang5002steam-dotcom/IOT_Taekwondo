import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, effects, hexToRgba, radii, typography } from "@/theme";

export type NotificationSummaryCardProps = {
  totalCount: number;
  unreadCount: number;
};

export function NotificationSummaryCard({
  totalCount,
  unreadCount,
}: NotificationSummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        <ThemedText type="featureLabel" style={styles.kicker}>
          Trung tâm thông báo
        </ThemedText>
        <ThemedText type="subtitle" style={styles.title}>
          Thông báo của bạn
        </ThemedText>
        <ThemedText type="bodySmall" style={styles.description}>
          {totalCount} thông báo đang được đồng bộ
        </ThemedText>
      </View>
      <View
        accessibilityLabel={`${unreadCount} thông báo chưa đọc`}
        style={styles.unreadBubble}
      >
        <ThemedText type="subtitle" style={styles.unreadNumber}>
          {unreadCount}
        </ThemedText>
        <ThemedText type="caption" style={styles.unreadLabel}>
          chưa đọc
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 120,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: radii.lg,
    backgroundColor: Colors.light.header,
    padding: 16,
    ...effects.card,
  },
  copy: {
    flex: 1,
    gap: 5,
  },
  kicker: {
    color: hexToRgba(Colors.light.surface, 0.78),
  },
  title: {
    color: Colors.light.surface,
    ...typography.subtitle,
  },
  description: {
    color: hexToRgba(Colors.light.surface, 0.78),
  },
  unreadBubble: {
    width: 74,
    minHeight: 74,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.lg,
    backgroundColor: hexToRgba(Colors.light.surface, 0.14),
    padding: 8,
  },
  unreadNumber: {
    color: Colors.light.surface,
    lineHeight: 26,
  },
  unreadLabel: {
    color: hexToRgba(Colors.light.surface, 0.78),
    textAlign: "center",
  },
});
