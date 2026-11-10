import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, activeEffect, effects, radii } from "@/theme";

import type {
  AttendanceStatus,
  EvaluationStatus,
} from "../constants/session-attendance.constants";
import type { EvaluationStudent } from "../api/session-attendance.dto";
import {
  ATTENDANCE_CONFIG,
  EVALUATION_CONFIG,
  StatusPickerPopover,
} from "./StatusPickerPopover";

function formatBeltName(beltCode?: string | null) {
  if (!beltCode) return "Đai trắng";
  if (beltCode === "C10") return "Cấp 10 (Trắng)";
  if (beltCode === "C9") return "Cấp 9 (Vàng)";
  if (beltCode === "C8") return "Cấp 8 (Cam)";
  if (beltCode === "C7") return "Cấp 7 (Xanh lá)";
  if (beltCode === "C6") return "Cấp 6 (Xanh dương)";
  if (beltCode === "C5") return "Cấp 5 (Đỏ)";
  if (beltCode === "C4") return "Cấp 4 (Nâu)";
  if (beltCode === "C3" || beltCode === "C2" || beltCode === "C1")
    return "Đai đen";
  return beltCode;
}

export function StudentAttendanceCard({
  item,
  onUpdateAttendanceStatus,
  onUpdateEvaluationStatus,
}: {
  item: EvaluationStudent;
  onUpdateAttendanceStatus: (newStatus: AttendanceStatus) => void;
  onUpdateEvaluationStatus: (newStatus: EvaluationStatus) => void;
}) {
  const [pickerType, setPickerType] = useState<
    "attendance" | "evaluation" | null
  >(null);

  const student = item.studentEnrollment.studentPerson;
  const currentAttendance = item.attendance?.attendanceStatus ?? "PRESENT";
  const currentEvaluation = item.attendance?.evaluationStatus ?? "PENDING";

  const attConfig = ATTENDANCE_CONFIG[currentAttendance] ?? ATTENDANCE_CONFIG.PRESENT;
  const evalConfig = EVALUATION_CONFIG[currentEvaluation] ?? EVALUATION_CONFIG.PENDING;

  const initials = student.fullName
    ? student.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(-2)
        .join("")
        .toUpperCase()
    : "HV";

  return (
    <>
      <View style={styles.card}>
        <View style={styles.studentInfoRow}>
          <View style={styles.avatar}>
            <ThemedText type="caption" style={styles.avatarText}>
              {initials}
            </ThemedText>
          </View>

          <View style={styles.nameWrap}>
            <ThemedText
              type="subtitle"
              numberOfLines={1}
              style={styles.studentName}
            >
              {student.fullName}
            </ThemedText>
            <ThemedText type="caption" style={styles.studentMeta}>
              {student.personCode || "STU"} • {formatBeltName(student.currentBelt)}
            </ThemedText>
          </View>
        </View>

        {/* Action Buttons: Attendance and Evaluation */}
        <View style={styles.actionsRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Điểm danh: ${attConfig.label}`}
            onPress={() => setPickerType("attendance")}
            onLongPress={() => setPickerType("attendance")}
            style={({ pressed }) => [
              styles.statusButton,
              { backgroundColor: attConfig.bg, borderColor: attConfig.border },
              activeEffect(pressed, "pressedScale"),
            ]}
          >
            <AppIcon icon={attConfig.icon} size={14} color={attConfig.text} />
            <ThemedText
              type="caption"
              numberOfLines={1}
              style={[styles.statusButtonText, { color: attConfig.text }]}
            >
              {attConfig.shortLabel}
            </ThemedText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Đánh giá: ${evalConfig.label}`}
            onPress={() => setPickerType("evaluation")}
            onLongPress={() => setPickerType("evaluation")}
            style={({ pressed }) => [
              styles.statusButton,
              { backgroundColor: evalConfig.bg, borderColor: evalConfig.border },
              activeEffect(pressed, "pressedScale"),
            ]}
          >
            <AppIcon icon={evalConfig.icon} size={14} color={evalConfig.text} />
            <ThemedText
              type="caption"
              numberOfLines={1}
              style={[styles.statusButtonText, { color: evalConfig.text }]}
            >
              {evalConfig.shortLabel}
            </ThemedText>
          </Pressable>
        </View>
      </View>

      {/* Popovers */}
      <StatusPickerPopover
        type="attendance"
        visible={pickerType === "attendance"}
        studentName={student.fullName}
        currentValue={currentAttendance}
        onSelect={onUpdateAttendanceStatus}
        onClose={() => setPickerType(null)}
      />

      <StatusPickerPopover
        type="evaluation"
        visible={pickerType === "evaluation"}
        studentName={student.fullName}
        currentValue={currentEvaluation}
        onSelect={onUpdateEvaluationStatus}
        onClose={() => setPickerType(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.light.divider,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    ...effects.soft,
  },
  studentInfoRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginRight: 8,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  avatarText: {
    color: Colors.light.primary,
    fontWeight: "800",
    fontSize: 13,
  },
  nameWrap: {
    flex: 1,
    gap: 2,
  },
  studentName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.light.text,
  },
  studentMeta: {
    color: Colors.light.textSecondary,
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: radii.md,
    borderWidth: 1,
    minWidth: 74,
    justifyContent: "center",
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
