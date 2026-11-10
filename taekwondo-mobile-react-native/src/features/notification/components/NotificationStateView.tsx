import { Clock } from "reicon-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, hexToRgba, radii } from "@/theme";
import type { AppIconElement } from "@/theme/icons";

export type NotificationStateViewProps = {
  icon: AppIconElement;
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function NotificationStateView({
  icon,
  title,
  description,
  actionLabel,
  onActionPress,
}: NotificationStateViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <AppIcon icon={icon} size={30} color={Colors.light.primary} />
      </View>
      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText type="bodySmall" style={styles.description}>
        {description}
      </ThemedText>
      {actionLabel && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onActionPress}
          style={({ pressed }) => [
            styles.actionButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <AppIcon icon={<Clock />} size={17} color={Colors.light.surface} />
          <ThemedText type="action" style={styles.actionText}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function NotificationSkeletonList() {
  return (
    <View style={styles.skeletonList} accessibilityState={{ busy: true }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <View key={index} style={styles.skeletonCard} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: "dashed",
    borderColor: hexToRgba(Colors.light.primary, 0.26),
    borderRadius: radii.lg,
    backgroundColor: hexToRgba(Colors.light.surface, 0.82),
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  iconWrap: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.lg,
    backgroundColor: hexToRgba(Colors.light.primary, 0.08),
  },
  title: {
    color: Colors.light.text,
    textAlign: "center",
  },
  description: {
    maxWidth: 280,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  actionButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: radii.pill,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  actionText: {
    color: Colors.light.surface,
  },
  skeletonList: {
    gap: 12,
  },
  skeletonCard: {
    minHeight: 112,
    borderRadius: radii.lg,
    backgroundColor: Colors.light.backgroundSelected,
  },
  pressed: {
    opacity: 0.78,
  },
});
