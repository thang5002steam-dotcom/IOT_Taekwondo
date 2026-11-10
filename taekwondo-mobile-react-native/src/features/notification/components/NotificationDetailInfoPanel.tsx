import { ChevronLeft } from "reicon-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, effects, radii } from "@/theme";

import type { NotificationRecipientMine } from "../api/notification.dto";
import {
  NotificationRecipientStatusLabel,
  NotificationTypeLabel,
} from "../constants/notification.constants";
import { formatNotificationDate } from "../utils/formatNotificationDate";
import { NotificationPill } from "./NotificationPill";
import { NotificationTypeIcon } from "./NotificationTypeIcon";

export type NotificationDetailInfoPanelProps = {
  detail: NotificationRecipientMine;
  onBackToList: () => void;
};

const detailDateOptions: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
};

export function NotificationDetailInfoPanel({
  detail,
  onBackToList,
}: NotificationDetailInfoPanelProps) {
  return (
    <>
      <View style={styles.hero}>
        <View style={styles.titleRow}>
          <View style={styles.iconWrap}>
            <NotificationTypeIcon type={detail.notificationType} />
          </View>
          <View style={styles.titleCopy}>
            <ThemedText type="subtitle" style={styles.title}>
              {detail.title}
            </ThemedText>
            <View style={styles.meta}>
              <NotificationPill>
                {NotificationTypeLabel[detail.notificationType]}
              </NotificationPill>
              <NotificationPill tone={detail.read ? "neutral" : "primary"}>
                {detail.read ? "Đã đọc" : "Chưa đọc"}
              </NotificationPill>
              <NotificationPill>
                {NotificationRecipientStatusLabel[
                  detail.notificationRecipientStatus
                ] ?? detail.notificationRecipientStatus}
              </NotificationPill>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bodyCard}>
        <ThemedText type="body" style={styles.bodyText}>
          {detail.body}
        </ThemedText>
      </View>

      <View style={styles.referencePanel}>
        <ThemedText type="title" style={styles.referenceTitle}>
          Thông tin
        </ThemedText>
        <View style={styles.referenceGrid}>
          <ReferenceItem
            label="Đã tạo"
            value={formatNotificationDate(detail.createdAt, detailDateOptions)}
          />
          <ReferenceItem
            label="Đã gửi"
            value={formatNotificationDate(detail.deliveredAt, detailDateOptions)}
          />
          <ReferenceItem
            label="Đã đọc"
            value={formatNotificationDate(detail.readAt, detailDateOptions)}
          />
          {detail.referenceType ? (
            <ReferenceItem label="Loại liên kết" value={detail.referenceType} />
          ) : null}
          {detail.referenceId ? (
            <ReferenceItem label="Mã liên kết" value={detail.referenceId} />
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quay về danh sách"
          onPress={onBackToList}
          style={({ pressed }) => [
            styles.backButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <AppIcon icon={<ChevronLeft />} width={12} height={20} />
          <ThemedText type="action" style={styles.backText}>
            Quay về danh sách
          </ThemedText>
        </Pressable>
      </View>
    </>
  );
}

function ReferenceItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.referenceItem}>
      <ThemedText type="caption" style={styles.referenceLabel}>
        {label}
      </ThemedText>
      <ThemedText type="bodySmall" style={styles.referenceValue}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.divider,
    borderRadius: radii.lg,
    backgroundColor: Colors.light.surface,
    padding: 16,
    ...effects.soft,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: Colors.light.backgroundElement,
  },
  titleCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: Colors.light.text,
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  bodyCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.divider,
    borderRadius: radii.lg,
    backgroundColor: Colors.light.surface,
    padding: 16,
    ...effects.soft,
  },
  bodyText: {
    color: Colors.light.textSecondary,
  },
  referencePanel: {
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.divider,
    borderRadius: radii.lg,
    backgroundColor: Colors.light.surface,
    padding: 16,
    ...effects.soft,
  },
  referenceTitle: {
    color: Colors.light.text,
  },
  referenceGrid: {
    gap: 8,
  },
  referenceItem: {
    gap: 3,
    borderRadius: radii.md,
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  referenceLabel: {
    color: Colors.light.textSecondary,
  },
  referenceValue: {
    color: Colors.light.text,
  },
  backButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.divider,
    borderRadius: radii.pill,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 18,
  },
  backText: {
    color: Colors.light.text,
  },
  pressed: {
    opacity: 0.78,
  },
});
