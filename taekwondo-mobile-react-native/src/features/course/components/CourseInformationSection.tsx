import { StyleSheet, View } from "react-native";

import { StatusBadge } from "@/shared/ui/StatusBadge";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, hexToRgba, radii } from "@/theme";

import { CourseDetailSectionLayout } from "./CourseDetailSectionLayout";

export function CourseInformationSection({
  levelLabel,
  capacity,
  enrolled,
  statusLabel,
}: {
  levelLabel: string;
  capacity: number;
  enrolled: number;
  statusLabel?: string;
}) {
  const enrolledPercent = capacity
    ? Math.min(Math.round((enrolled / capacity) * 100), 100)
    : 0;
  const isEnded =
    statusLabel === "Đã đóng" ||
    statusLabel === "Đã kết thúc" ||
    statusLabel === "Đã hủy";

  const rows = [
    statusLabel ? (
      <View key="status" style={styles.row}>
        <ThemedText type="bodySmall" style={styles.label}>
          Trạng thái
        </ThemedText>
        <StatusBadge
          label={statusLabel}
          tone={isEnded ? "neutral" : "primary"}
        />
      </View>
    ) : null,
    <InfoRow
      key="level"
      label="Cấp độ"
      value={levelLabel || "Nhập môn & Cơ bản"}
    />,
    <InfoRow key="capacity" label="Sức chứa" value={`${capacity} học viên`} />,
    <View key="enrolled" style={styles.row}>
      <ThemedText type="bodySmall" style={styles.label}>
        Đang học
      </ThemedText>
      <View style={styles.valueGroup}>
        <ThemedText type="bodySmall" style={styles.value}>
          {enrolled} học viên
        </ThemedText>
        <View style={styles.badge}>
          <ThemedText type="caption" style={styles.badgeText}>
            {enrolledPercent}%
          </ThemedText>
        </View>
      </View>
    </View>,
  ].filter(Boolean);

  return (
    <CourseDetailSectionLayout
      title="Thông tin"
      subtitle="Chi tiết lịch & sĩ số"
      rows={rows}
    />
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <ThemedText type="bodySmall" style={styles.label}>
        {label}
      </ThemedText>
      <ThemedText type="bodySmall" style={styles.value}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
  },
  label: { color: Colors.light.textSecondary },
  value: {
    color: Colors.light.text,
    fontWeight: "700",
    textAlign: "right",
    flexShrink: 1,
  },
  valueGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    flexShrink: 1,
  },
  badge: {
    borderRadius: radii.pill,
    backgroundColor: hexToRgba(Colors.light.success, 0.12),
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { color: Colors.light.success, fontWeight: "700" },
});
