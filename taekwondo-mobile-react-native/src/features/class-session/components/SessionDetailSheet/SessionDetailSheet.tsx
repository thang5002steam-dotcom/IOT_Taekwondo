import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Bullhorn } from "reicon-react-native";

import { BottomSheetWindow } from "@/shared/ui/BottomSheetWindow";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, radii } from "@/theme";
import type { ClassSessionCalendarResponse } from "../../api/class-session.dto";
import { SessionStatusLabel } from "../../constants/class-session.constants";

export interface SessionDetailSheetProps {
  session: ClassSessionCalendarResponse | null;
  visible: boolean;
  onClose: () => void;
  onViewDetail?: (session: ClassSessionCalendarResponse) => void;
  onNotify?: (session: ClassSessionCalendarResponse) => void;
}

function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

function formatTimeDisplay(timeStr?: string): string {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeStr;
}

export function SessionDetailSheet({
  session,
  visible,
  onClose,
  onViewDetail,
  onNotify,
}: SessionDetailSheetProps) {
  if (!session) return null;

  const dateFormatted = formatDateDisplay(session.sessionDate);
  const startFull = `${formatTimeDisplay(session.startTime)} ${dateFormatted}`;
  const endFull = `${formatTimeDisplay(session.endTime)} ${dateFormatted}`;
  const coachName = session.primaryCoach?.fullName
    ? `HLV ${session.primaryCoach.fullName}`
    : "Chưa phân công";

  const classCode = session.courseId || session.classSessionId;

  return (
    <BottomSheetWindow
      visible={visible}
      title="Chi tiết lịch"
      heightRatio={0.6}
      accessibilityLabel="Cửa sổ chi tiết lịch"
      contentPaddingHorizontal={false}
      onClose={onClose}
      footer={
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() => {
              onClose();
              onViewDetail?.(session);
            }}
          >
            <ThemedText style={styles.primaryButtonText}>
              Xem chi tiết
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notifyButton}
            activeOpacity={0.8}
            onPress={() => onNotify?.(session)}
          >
            <Bullhorn color="#FFFFFF" size={20} />
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.content}>
        {/* Row: Loại sự kiện */}
        <View style={styles.row}>
          <ThemedText style={styles.label}>Loại sự kiện</ThemedText>
          <View style={styles.eventTypeContainer}>
            <View style={styles.eventDot} />
            <ThemedText style={styles.eventTypeText}>
              {SessionStatusLabel[session.status] || "Lịch học"}
            </ThemedText>
          </View>
        </View>

        {/* Row: Lớp tín chỉ / Mã lớp */}
        <View style={styles.row}>
          <ThemedText style={styles.label}>Mã học phần</ThemedText>
          <View style={styles.valueWrapper}>
            <ThemedText style={styles.value} numberOfLines={1}>
              {classCode}
            </ThemedText>
          </View>
        </View>

        {/* Row: Tên học phần */}
        <View style={styles.row}>
          <ThemedText style={styles.label}>Tên học phần</ThemedText>
          <View style={styles.valueWrapper}>
            <ThemedText style={styles.value}>{session.courseName}</ThemedText>
          </View>
        </View>

        {/* Row: Thời gian bắt đầu */}
        <View style={styles.row}>
          <ThemedText style={styles.label}>Thời gian bắt đầu</ThemedText>
          <View style={styles.valueWrapper}>
            <ThemedText style={styles.value}>{startFull}</ThemedText>
          </View>
        </View>

        {/* Row: Thời gian kết thúc */}
        <View style={styles.row}>
          <ThemedText style={styles.label}>Thời gian kết thúc</ThemedText>
          <View style={styles.valueWrapper}>
            <ThemedText style={styles.value}>{endFull}</ThemedText>
          </View>
        </View>

        {/* Row: Phòng học / Địa điểm */}
        <View style={styles.row}>
          <ThemedText style={styles.label}>Phòng học</ThemedText>
          <View style={styles.valueWrapper}>
            <ThemedText style={styles.value}>
              Sân tập Taekwondo Văn Quán
            </ThemedText>
          </View>
        </View>

        {/* Row: Giảng viên / HLV */}
        <View style={[styles.row, styles.lastRow]}>
          <ThemedText style={styles.label}>Giảng viên</ThemedText>
          <View style={styles.valueWrapper}>
            <ThemedText style={styles.value}>{coachName}</ThemedText>
          </View>
        </View>
      </View>
    </BottomSheetWindow>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.divider,
    gap: 16,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 14.5,
    lineHeight: 22,
    color: Colors.light.textSecondary,
    fontWeight: "400",
    width: 130,
  },
  valueWrapper: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  value: {
    fontSize: 14.5,
    lineHeight: 22,
    color: Colors.light.text,
    fontWeight: "600",
    textAlign: "right",
  },
  eventTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 2,
  },
  eventDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#0891B2",
  },
  eventTypeText: {
    fontSize: 14.5,
    lineHeight: 20,
    color: "#0891B2",
    fontWeight: "600",
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.light.primary,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  notifyButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.light.primary,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
