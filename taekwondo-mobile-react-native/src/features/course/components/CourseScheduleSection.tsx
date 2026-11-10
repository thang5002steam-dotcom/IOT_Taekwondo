import { Pressable, StyleSheet, View } from "react-native";
import { Calendar, CalendarMinus, ChevronRight } from "reicon-react-native";

import {
  WeekdayCode,
  WeekdayCodeToLabel,
  WeekdayLabel,
  type Weekday,
} from "@/features/class-schedule/constants/class-schedule.constants";
import type { CourseScheduleView } from "@/features/course/domain/course.types";
import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { activeEffect, Colors, hexToRgba, radii, Spacing } from "@/theme";

import { CourseDetailSectionLayout } from "./CourseDetailSectionLayout";

export function sortCourseSchedules(schedules: readonly CourseScheduleView[]) {
  return [...schedules].sort((a, b) => {
    if (a.status !== b.status) return a.status === "ACTIVE" ? -1 : 1;
    const weekdayA =
      typeof a.weekday === "number"
        ? a.weekday
        : (WeekdayCode[a.weekday as Weekday] ?? 0);
    const weekdayB =
      typeof b.weekday === "number"
        ? b.weekday
        : (WeekdayCode[b.weekday as Weekday] ?? 0);
    return weekdayA !== weekdayB
      ? weekdayA - weekdayB
      : (a.startTime ?? "").localeCompare(b.startTime ?? "");
  });
}

export function scheduleWeekdayLabel(schedule: CourseScheduleView) {
  if (typeof schedule.weekday === "number")
    return WeekdayCodeToLabel[schedule.weekday] ?? `Thứ ${schedule.weekday}`;
  return schedule.weekday
    ? (WeekdayLabel[schedule.weekday as Weekday] ?? String(schedule.weekday))
    : "Lịch học";
}

export function CourseScheduleSection({
  schedules,
  onOpenSchedule,
  onSeeMore,
}: {
  schedules: readonly CourseScheduleView[];
  onOpenSchedule: (schedule: CourseScheduleView) => void;
  onSeeMore?: () => void;
}) {
  const sorted = sortCourseSchedules(schedules);
  return (
    <CourseDetailSectionLayout
      title="Lịch học"
      subtitle={
        sorted.length
          ? `${sorted.length} ca học trong tuần`
          : "Lịch học linh hoạt"
      }
      rows={sorted.map((schedule) => (
        <ScheduleRow
          key={schedule.courseScheduleId}
          schedule={schedule}
          onPress={() => onOpenSchedule(schedule)}
        />
      ))}
      emptyState={
        <ThemedText type="bodySmall" style={styles.empty}>
          Lịch học linh hoạt
        </ThemedText>
      }
      onSeeMore={onSeeMore}
    />
  );
}

export function ScheduleRow({
  schedule,
  onPress,
}: {
  schedule: CourseScheduleView;
  onPress: () => void;
}) {
  const weekday = scheduleWeekdayLabel(schedule);
  const time =
    schedule.startTime && schedule.endTime
      ? `${schedule.startTime.slice(0, 5)} - ${schedule.endTime.slice(0, 5)}`
      : "Chưa cập nhật";
  const inactive = schedule.status === "INACTIVE";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Xem chi tiết lịch ${weekday}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, activeEffect(pressed, "pressed")]}
    >
      <View style={[styles.icon, inactive && styles.iconInactive]}>
        <AppIcon
          icon={inactive ? <CalendarMinus /> : <Calendar />}
          size={18}
          color={inactive ? Colors.light.textSecondary : Colors.light.primary}
        />
      </View>
      <View style={styles.main}>
        <View style={styles.metaColumn}>
          <ThemedText type="bodySmall" style={styles.title}>
            {weekday}
          </ThemedText>
          <ThemedText type="caption" style={styles.muted}>
            {schedule.branchName || "Chưa cập nhật cơ sở"}
          </ThemedText>
        </View>
        <View style={styles.timingColumn}>
          <View
            style={[styles.timeBadge, inactive && styles.timeBadgeInactive]}
          >
            <ThemedText
              type="caption"
              style={[styles.timeText, inactive && styles.timeTextInactive]}
            >
              {time}
            </ThemedText>
          </View>
          {schedule.staffAssignments.length ? (
            schedule.staffAssignments.map((staff) => (
              <View key={staff.assignmentId} style={styles.staffRow}>
                <ThemedText
                  type="caption"
                  style={styles.staffName}
                  numberOfLines={1}
                >
                  {staff.fullName}
                </ThemedText>
                <ThemedText type="caption" style={styles.staffRole}>
                  {staff.roleLabel}
                </ThemedText>
              </View>
            ))
          ) : (
            <ThemedText type="caption" style={styles.staffName}>
              Chưa phân công
            </ThemedText>
          )}
        </View>
      </View>
      <AppIcon
        icon={<ChevronRight />}
        size={18}
        color={inactive ? Colors.light.textSecondary : Colors.light.primary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: 12,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: hexToRgba(Colors.light.primary, 0.1),
  },
  iconInactive: { backgroundColor: Colors.light.backgroundElement },
  main: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  metaColumn: { flex: 1, minWidth: 0, gap: 2 },
  timingColumn: { alignItems: "flex-end", gap: 4, minWidth: 0 },
  title: { color: Colors.light.text, fontWeight: "700" },
  muted: { color: Colors.light.textSecondary },
  timeBadge: {
    borderRadius: radii.pill,
    backgroundColor: hexToRgba(Colors.light.primary, 0.1),
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  timeBadgeInactive: { backgroundColor: Colors.light.backgroundElement },
  timeText: { color: Colors.light.primary, fontWeight: "700" },
  timeTextInactive: { color: Colors.light.textSecondary },
  staffRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 5,
    maxWidth: 148,
  },
  staffName: {
    color: Colors.light.textSecondary,
    textAlign: "right",
    flexShrink: 1,
  },
  staffRole: { color: Colors.light.primary, fontWeight: "700", flexShrink: 0 },
  empty: { color: Colors.light.textSecondary },
});
