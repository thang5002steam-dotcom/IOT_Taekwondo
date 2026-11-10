import { Calendar, Layers } from "reicon-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, hexToRgba, radii } from "@/theme";

import type { CourseEnrollmentView } from "../../types";

type WalletCoursePreviewCardProps = {
  enrollment: CourseEnrollmentView;
  onPress: () => void;
};

export function WalletCoursePreviewCard({
  enrollment,
  onPress,
}: WalletCoursePreviewCardProps) {
  const remaining = Math.max(enrollment.totalSessions - enrollment.usedSessions, 0);
  const progress = enrollment.totalSessions
    ? Math.min(remaining / enrollment.totalSessions, 1)
    : 0;
  const percent = Math.round(progress * 100);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <AppIcon icon={<Layers weight="Filled" />} size={26} color={Colors.light.text} />
        </View>
        <View style={styles.titleBlock}>
          <ThemedText type="subtitle" numberOfLines={1} style={styles.title}>
            {enrollment.courseName}
          </ThemedText>
          <ThemedText type="bodySmall" numberOfLines={1} style={styles.meta}>
            {enrollment.branchName} · {enrollment.scheduleLabel}
          </ThemedText>
        </View>
        <View style={styles.statusPill}>
          <ThemedText type="action" style={styles.statusText}>
            {enrollment.statusLabel}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="bodySmall" style={styles.remaining}>
        Còn {remaining}/{enrollment.totalSessions} buổi
      </ThemedText>
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressValue, { width: `${percent}%` }]} />
        </View>
        <ThemedText type="bodySmall" style={styles.percent}>
          {percent}%
        </ThemedText>
      </View>
      <View style={styles.dateRow}>
        <AppIcon icon={<Calendar />} size={20} color={Colors.light.icon} />
        <ThemedText type="bodySmall" style={styles.meta}>
          {enrollment.dateRangeLabel}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: hexToRgba(Colors.light.divider, 0.64),
    borderRadius: radii.lg,
    backgroundColor: Colors.light.surface,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.lg,
    backgroundColor: hexToRgba(Colors.light.primary, 0.08),
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: Colors.light.text,
  },
  meta: {
    color: Colors.light.textSecondary,
  },
  statusPill: {
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: hexToRgba(Colors.light.primary, 0.1),
  },
  statusText: {
    color: Colors.light.primary,
  },
  remaining: {
    color: Colors.light.textSecondary,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 7,
    overflow: "hidden",
    borderRadius: radii.pill,
    backgroundColor: hexToRgba(Colors.light.divider, 0.42),
  },
  progressValue: {
    height: "100%",
    borderRadius: radii.pill,
    backgroundColor: Colors.light.primary,
  },
  percent: {
    minWidth: 42,
    color: Colors.light.textSecondary,
    textAlign: "right",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pressed: {
    opacity: 0.75,
  },
});
