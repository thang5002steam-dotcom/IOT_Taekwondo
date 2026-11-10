import { StyleSheet, View } from "react-native";
import { Clock, Home, Star, Users2 } from "reicon-react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, effects, radii } from "@/theme";
import type { ClassSessionEvaluationResponse } from "../api/session-attendance.dto";
import type { AttendanceProgressStats } from "../domain/attendanceProgress";
import { CourseLevelLabel } from "@/features/course/constants/course.constants";

export function ClassSessionOverviewCard({
  classSession,
  stats,
}: {
  classSession: ClassSessionEvaluationResponse["classSession"];
  stats: AttendanceProgressStats;
}) {
  const branchName =
    classSession.course.classSchedule?.branch?.name ?? "Cơ sở 1";
  const roomName =
    classSession.course.classSchedule?.location === "OUTDOOR"
      ? "Sân tập ngoài trời"
      : "Phòng tập CLC";
  const courseLevel = `Khóa ${CourseLevelLabel[classSession.scheduleLevel]}`;

  const startTime = classSession.startTime?.slice(0, 5) ?? "15:00";
  const endTime = classSession.endTime?.slice(0, 5) ?? "17:00";
  const coachName = classSession.primaryCoach?.fullName
    ? `HLV. ${classSession.primaryCoach.fullName}`
    : "HLV. Nguyễn Văn A";
  const coachBelt =
    classSession.primaryCoach?.danRank ||
    classSession.primaryCoach?.currentBelt ||
    "Đai đen 4 đẳng";

  return (
    <View style={styles.card}>
      {/* Top Row: Branch info & Active Session Status badge */}
      <View style={styles.topRow}>
        <View style={styles.branchWrapper}>
          <View style={styles.branchAvatar}>
            <AppIcon icon={<Home />} size={20} color={Colors.light.primary} />
          </View>
          <View style={styles.branchInfo}>
            <ThemedText type="subtitle" style={styles.branchName}>
              {branchName}
            </ThemedText>
            <View style={styles.roomRow}>
              <ThemedText type="bodySmall" style={styles.roomName}>
                {roomName}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <ThemedText type="caption" style={styles.statusText}>
            Ca hiện tại
          </ThemedText>
        </View>
      </View>

      {/* Time and Level Tag */}
      <View style={styles.timeRow}>
        <View style={styles.timeInfo}>
          <AppIcon icon={<Clock />} size={18} color={Colors.light.text} />
          <ThemedText type="heading" style={styles.timeText}>
            {startTime} - {endTime}
          </ThemedText>
        </View>

        <View style={styles.levelTag}>
          <ThemedText type="caption" style={styles.levelText}>
            {courseLevel}
          </ThemedText>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Progress 1: Điểm danh */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <View style={styles.progressTitleLeft}>
            <AppIcon icon={<Users2 />} size={18} color={Colors.light.primary} />
            <ThemedText type="body" style={styles.progressTitle}>
              Điểm danh:{" "}
              <ThemedText
                type="subtitle"
                style={{ color: Colors.light.primary }}
              >
                {stats.presentCount}/{stats.totalStudents}
              </ThemedText>{" "}
              võ sinh
            </ThemedText>
          </View>
          <ThemedText
            type="subtitle"
            style={[styles.percentText, { color: Colors.light.primary }]}
          >
            {stats.attendancePercent}%
          </ThemedText>
        </View>

        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(stats.attendancePercent, 100)}%`,
                backgroundColor: Colors.light.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Progress 2: Đánh giá */}
      <View style={[styles.progressSection, { marginTop: 14 }]}>
        <View style={styles.progressHeader}>
          <View style={styles.progressTitleLeft}>
            <AppIcon icon={<Star />} size={18} color="#8B5E55" />
            <ThemedText type="body" style={styles.progressTitle}>
              Đánh giá:{" "}
              <ThemedText type="subtitle" style={{ color: "#8B5E55" }}>
                {stats.evaluatedCount}/{stats.needEvaluationCount}
              </ThemedText>{" "}
              võ sinh
            </ThemedText>
          </View>
          <ThemedText
            type="subtitle"
            style={[styles.percentText, { color: "#8B5E55" }]}
          >
            {stats.evaluationPercent}%
          </ThemedText>
        </View>

        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(stats.evaluationPercent, 100)}%`,
                backgroundColor: "#8B5E55",
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: radii.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.light.divider,
    ...effects.card,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  branchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  branchAvatar: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  branchInfo: {
    gap: 2,
  },
  branchName: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.light.text,
  },
  roomRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  roomName: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#ECFDF5",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  statusText: {
    color: "#065F46",
    fontWeight: "700",
    fontSize: 12,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeText: {
    fontSize: 19,
    fontWeight: "800",
    color: Colors.light.text,
  },
  levelTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#F9FAFB",
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  levelText: {
    color: "#4B5563",
    fontWeight: "600",
    fontSize: 12,
  },
  coachRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  coachAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  coachName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  coachBelt: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.divider,
    marginVertical: 14,
  },
  progressSection: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressTitleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressTitle: {
    fontSize: 14,
    color: Colors.light.text,
  },
  percentText: {
    fontSize: 15,
    fontWeight: "700",
  },
  progressBarTrack: {
    height: 7,
    borderRadius: radii.pill,
    backgroundColor: "#F3F4F6",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: radii.pill,
  },
  progressFootnote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  footnoteText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  footnoteHighlight: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.light.text,
  },
});
