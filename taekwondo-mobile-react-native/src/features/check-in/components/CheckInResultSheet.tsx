import { AppIcon } from "@/shared/ui/AppIcon";
import { BottomSheetWindow } from "@/shared/ui/BottomSheetWindow";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, radii } from "@/theme";
import { memo } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from "react-native";
import { CheckCircle, ChevronRight, Clock, X, XCircle } from "reicon-react-native";
import type { CheckInFailure, CheckInRecord } from "../types/faceScanner.types";

type CheckInResultSheetProps = {
  visible: boolean;
  isPending?: boolean;
  record: CheckInRecord | null;
  failure?: CheckInFailure | null;
  onNextScan: () => void;
  onClose: () => void;
  onCancel?: () => void;
};

function CheckInResultSheetComponent({
  visible,
  isPending = false,
  record,
  failure,
  onNextScan,
  onClose,
  onCancel,
}: CheckInResultSheetProps) {
  if (!record && !failure && !isPending) return null;

  // --- 1. Pending View (Async Polling) ---
  if (isPending) {
    const isStudent = record?.role === "STUDENT";
    const confidenceLabel =
      typeof record?.confidence === "number"
        ? `${Math.round(record.confidence * 100)}%`
        : null;

    return (
      <BottomSheetWindow
        visible={visible}
        title="Đang xử lý điểm danh..."
        heightRatio={record ? 0.58 : 0.45}
        onClose={onCancel || onClose}
      >
        <View style={styles.content}>
          {/* Status row with spinner */}
          <View style={styles.statusRow}>
            <View style={styles.pendingIconWrapper}>
              <ActivityIndicator size="small" color={Colors.light.primary} />
              <ThemedText type="heading" style={styles.pendingTitle}>
                Đang đối chiếu dữ liệu...
              </ThemedText>
            </View>
            <ThemedText type="caption" style={styles.timeAgo}>
              Vui lòng đợi
            </ThemedText>
          </View>

          {/* Profile Card if person identified */}
          {record ? (
            <View style={styles.profileCard}>
              <Image
                source={{ uri: record.avatarUrl }}
                style={styles.avatar}
                resizeMode="cover"
              />

              <View style={styles.infoCol}>
                <View style={styles.nameRow}>
                  <ThemedText
                    type="heading"
                    style={styles.fullName}
                    numberOfLines={1}
                  >
                    {record.fullName}
                  </ThemedText>
                  <View
                    style={[
                      styles.roleBadge,
                      isStudent ? styles.studentBadge : styles.coachBadge,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.roleText,
                        isStudent ? styles.studentText : styles.coachText,
                      ]}
                    >
                      {isStudent ? "Học viên" : "HLV"}
                    </ThemedText>
                  </View>
                </View>

                <ThemedText type="bodySmall" style={styles.codeText}>
                  {isStudent ? `Mã HV: ${record.code}` : `Mã NV: ${record.code}`}
                </ThemedText>

                {confidenceLabel ? (
                  <ThemedText type="caption" style={styles.confidenceText}>
                    Độ khớp khuôn mặt: {confidenceLabel}
                  </ThemedText>
                ) : null}

                {record.courseName ? (
                  <ThemedText
                    type="caption"
                    style={styles.courseText}
                    numberOfLines={1}
                  >
                    📚 {record.courseName}
                  </ThemedText>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={styles.pendingNoticeCard}>
              <ThemedText type="bodySmall" style={styles.pendingNoticeText}>
                Hệ thống đang ghi nhận và xử lý điểm danh trong nền...
              </ThemedText>
            </View>
          )}

          {/* Action: Cancel Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Hủy"
            onPress={onCancel || onClose}
            style={({ pressed }) => [
              styles.cancelPendingButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <AppIcon icon={<X />} size={18} color={Colors.light.textSecondary} />
            <ThemedText type="heading" style={styles.cancelPendingButtonText}>
              Hủy thao tác
            </ThemedText>
          </Pressable>
        </View>
      </BottomSheetWindow>
    );
  }

  // --- 2. Failure View ---
  if (failure) {
    const isStudent = record?.role === "STUDENT";
    const confidenceLabel =
      typeof record?.confidence === "number"
        ? `${Math.round(record.confidence * 100)}%`
        : null;

    return (
      <BottomSheetWindow
        visible={visible}
        title={failure.title}
        heightRatio={record ? 0.60 : 0.48}
        onClose={onClose}
      >
        <View style={styles.content}>
          <View style={styles.failureHeader}>
            <View style={styles.failureIconWrapper}>
              <AppIcon
                icon={<XCircle weight="Filled" />}
                size={28}
                color={Colors.light.error}
              />
            </View>
            <ThemedText type="heading" style={styles.failureTitle}>
              {failure.title}
            </ThemedText>
            <ThemedText type="bodySmall" style={styles.failureMessage}>
              {failure.message}
            </ThemedText>

            {record ? (
              <View style={styles.profileCard}>
                <Image
                  source={{ uri: record.avatarUrl }}
                  style={styles.avatar}
                  resizeMode="cover"
                />

                <View style={styles.infoCol}>
                  <View style={styles.nameRow}>
                    <ThemedText
                      type="heading"
                      style={styles.fullName}
                      numberOfLines={1}
                    >
                      {record.fullName}
                    </ThemedText>
                    <View
                      style={[
                        styles.roleBadge,
                        isStudent ? styles.studentBadge : styles.coachBadge,
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.roleText,
                          isStudent ? styles.studentText : styles.coachText,
                        ]}
                      >
                        {isStudent ? "Học viên" : "HLV"}
                      </ThemedText>
                    </View>
                  </View>

                  <ThemedText type="bodySmall" style={styles.codeText}>
                    {isStudent ? `Mã HV: ${record.code}` : `Mã NV: ${record.code}`}
                  </ThemedText>

                  {confidenceLabel ? (
                    <ThemedText type="caption" style={styles.confidenceText}>
                      Độ khớp khuôn mặt: {confidenceLabel}
                    </ThemedText>
                  ) : null}
                </View>
              </View>
            ) : null}

            {failure.detail && failure.detail !== failure.message ? (
              <ThemedText type="caption" style={styles.failureDetail}>
                {failure.detail}
              </ThemedText>
            ) : null}
            {failure.correlationId ? (
              <ThemedText type="caption" style={styles.correlationText}>
                Mã hỗ trợ: {failure.correlationId}
              </ThemedText>
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={failure.ctaLabel}
            onPress={onNextScan}
            style={({ pressed }) => [
              styles.nextButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <AppIcon
              icon={<ChevronRight />}
              size={18}
              color={Colors.light.surface}
            />
            <ThemedText type="heading" style={styles.nextButtonText}>
              {failure.ctaLabel}
            </ThemedText>
          </Pressable>
        </View>
      </BottomSheetWindow>
    );
  }

  // --- 3. Success View ---
  if (!record) return null;

  const isStudent = record.role === "STUDENT";
  const isAlreadyCheckedIn = record.status === "ALREADY_CHECKED_IN";
  const isAlreadyCheckedOut = record.status === "ALREADY_CHECKED_OUT";
  const confidenceLabel =
    typeof record.confidence === "number"
      ? `${Math.round(record.confidence * 100)}%`
      : null;

  const sheetTitle = isAlreadyCheckedIn
    ? "Đã điểm danh trước đó"
    : isAlreadyCheckedOut
      ? "Đã kết ca trước đó"
      : "Điểm danh thành công";

  return (
    <BottomSheetWindow
      visible={visible}
      title={sheetTitle}
      heightRatio={0.56}
      onClose={onClose}
    >
      <View style={styles.content}>
        {/* Status banner */}
        <View style={styles.statusRow}>
          <View style={styles.successIconWrapper}>
            <AppIcon
              icon={<CheckCircle weight="Filled" />}
              size={24}
              color={
                isAlreadyCheckedIn || isAlreadyCheckedOut
                  ? "#F59E0B"
                  : Colors.light.success
              }
            />
            <ThemedText
              type="heading"
              style={[
                styles.successTitle,
                (isAlreadyCheckedIn || isAlreadyCheckedOut) && styles.warningTitle,
              ]}
            >
              {sheetTitle}
            </ThemedText>
          </View>
          <ThemedText type="caption" style={styles.timeAgo}>
            Vừa xong
          </ThemedText>
        </View>

        {/* Person Card */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: record.avatarUrl }}
            style={styles.avatar}
            resizeMode="cover"
          />

          <View style={styles.infoCol}>
            <View style={styles.nameRow}>
              <ThemedText
                type="heading"
                style={styles.fullName}
                numberOfLines={1}
              >
                {record.fullName}
              </ThemedText>
              <View
                style={[
                  styles.roleBadge,
                  isStudent ? styles.studentBadge : styles.coachBadge,
                ]}
              >
                <ThemedText
                  style={[
                    styles.roleText,
                    isStudent ? styles.studentText : styles.coachText,
                  ]}
                >
                  {isStudent ? "Học viên" : "HLV"}
                </ThemedText>
              </View>
            </View>

            <ThemedText type="bodySmall" style={styles.codeText}>
              {isStudent ? `Mã HV: ${record.code}` : `Mã NV: ${record.code}`}
            </ThemedText>

            {confidenceLabel ? (
              <ThemedText type="caption" style={styles.confidenceText}>
                Độ khớp khuôn mặt: {confidenceLabel}
              </ThemedText>
            ) : null}

            {record.courseName ? (
              <ThemedText
                type="caption"
                style={styles.courseText}
                numberOfLines={1}
              >
                📚 {record.courseName}
                {record.sessionTime ? ` • ${record.sessionTime}` : ""}
              </ThemedText>
            ) : null}

            <View style={styles.metaRow}>
              <View style={styles.timeMeta}>
                <AppIcon
                  icon={<Clock />}
                  size={14}
                  color={Colors.light.textSecondary}
                />
                <ThemedText type="caption" style={styles.metaText}>
                  {record.checkInTime} • {record.dateLabel}
                </ThemedText>
              </View>

              <View
                style={[
                  styles.statusTag,
                  (isAlreadyCheckedIn || isAlreadyCheckedOut) &&
                    styles.statusTagWarning,
                ]}
              >
                <ThemedText
                  style={[
                    styles.statusTagText,
                    (isAlreadyCheckedIn || isAlreadyCheckedOut) &&
                      styles.statusTagWarningText,
                  ]}
                >
                  {record.statusLabel}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Main CTA: Quét người tiếp theo */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quét người tiếp theo"
          onPress={onNextScan}
          style={({ pressed }) => [
            styles.nextButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <AppIcon
            icon={<ChevronRight />}
            size={18}
            color={Colors.light.surface}
          />
          <ThemedText type="heading" style={styles.nextButtonText}>
            Quét người tiếp theo
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheetWindow>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 12,
    gap: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pendingIconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pendingTitle: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  pendingNoticeCard: {
    backgroundColor: Colors.light.background,
    borderRadius: radii.md,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingNoticeText: {
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  cancelPendingButton: {
    backgroundColor: "#F3F4F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: radii.md,
    gap: 8,
    marginTop: 4,
  },
  cancelPendingButtonText: {
    color: Colors.light.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },
  successIconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  successTitle: {
    color: Colors.light.success,
    fontSize: 16,
    fontWeight: "700",
  },
  warningTitle: {
    color: "#D97706",
  },
  timeAgo: {
    color: Colors.light.textSecondary,
    fontSize: 12,
  },
  profileCard: {
    alignSelf: "stretch",
    flexDirection: "row",
    backgroundColor: Colors.light.background,
    borderRadius: radii.md,
    padding: 12,
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radii.sm,
    backgroundColor: Colors.light.divider,
  },
  infoCol: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  fullName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
    flexShrink: 1,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  studentBadge: {
    backgroundColor: "#FEE2E2",
  },
  coachBadge: {
    backgroundColor: "#E0F2FE",
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
  },
  studentText: {
    color: Colors.light.primary,
  },
  coachText: {
    color: "#0284C7",
  },
  codeText: {
    color: Colors.light.textSecondary,
    fontSize: 13,
  },
  courseText: {
    color: Colors.light.primary,
    fontSize: 12,
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  timeMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: Colors.light.textSecondary,
    fontSize: 12,
  },
  statusTag: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  statusTagText: {
    color: "#15803D",
    fontSize: 11,
    fontWeight: "600",
  },
  statusTagWarning: {
    backgroundColor: "#FEF3C7",
  },
  statusTagWarningText: {
    color: "#B45309",
  },
  nextButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: radii.md,
    gap: 8,
    marginTop: 4,
  },
  nextButtonText: {
    color: Colors.light.surface,
    fontSize: 15,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  confidenceText: {
    color: Colors.light.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  failureHeader: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 6,
    paddingTop: 8,
  },
  failureIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
  },
  failureTitle: {
    color: Colors.light.text,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  failureMessage: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  failureDetail: {
    color: Colors.light.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  correlationText: {
    color: Colors.light.textSecondary,
    fontSize: 11,
  },
});

export const CheckInResultSheet = memo(CheckInResultSheetComponent);
