import { ChevronRight } from "reicon-react-native";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, effects, hexToRgba, radii, typography } from "@/theme";

import type { NotificationRecipientMine } from "../api/notification.dto";
import { NotificationTypeLabel } from "../constants/notification.constants";
import { formatNotificationDate } from "../utils/formatNotificationDate";
import { NotificationPill } from "./NotificationPill";
import { NotificationTypeIcon } from "./NotificationTypeIcon";

export type NotificationCardProps = {
  notification: NotificationRecipientMine;
  onPress: (notification: NotificationRecipientMine) => void;
};

function NotificationCardComponent({
  notification,
  onPress,
}: NotificationCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={notification.title ?? undefined}
      onPress={() => onPress(notification)}
      style={({ pressed }) => [
        styles.card,
        !notification.read ? styles.unreadCard : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.iconWrap}>
        <NotificationTypeIcon type={notification.notificationType} />
      </View>

      <View style={styles.content}>
        <ThemedText type="title" numberOfLines={2} style={styles.title}>
          {notification.title ?? undefined}
        </ThemedText>
        <ThemedText type="bodySmall" numberOfLines={2} style={styles.body}>
          {notification.body ?? undefined}
        </ThemedText>

        <View style={styles.meta}>
          <NotificationPill>
            {NotificationTypeLabel[notification.notificationType]}
          </NotificationPill>
          <NotificationPill>
            {formatNotificationDate(notification.createdAt)}
          </NotificationPill>
          {!notification.read ? (
            <NotificationPill tone="primary">ChÆ°a Ä‘á»c</NotificationPill>
          ) : null}
        </View>
      </View>

      <View style={styles.trailing}>
        {!notification.read ? <View style={styles.unreadDot} /> : null}
        <AppIcon icon={<ChevronRight />}
          width={9}
          height={15}
          color={Colors.light.textSecondary}
        />
      </View>
    </Pressable>
  );
}

export const NotificationCard = memo(NotificationCardComponent);

const styles = StyleSheet.create({
  card: {
    minHeight: 116,
    flexDirection: "row",
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.divider,
    borderRadius: radii.lg,
    backgroundColor: Colors.light.surface,
    padding: 14,
    ...effects.soft,
  },
  unreadCard: {
    borderColor: hexToRgba(Colors.light.primary, 0.28),
    backgroundColor: hexToRgba(Colors.light.primary, 0.04),
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: hexToRgba(Colors.light.primary, 0.08),
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: Colors.light.text,
    ...typography.title,
  },
  body: {
    marginTop: 4,
    color: Colors.light.textSecondary,
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 11,
  },
  trailing: {
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
  },
  pressed: {
    opacity: 0.82,
  },
});
