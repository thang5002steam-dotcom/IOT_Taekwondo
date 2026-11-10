import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { resolveDetailTitle } from "@/routes/navigation/utils/screenTitle";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors } from "@/theme";

import {
  InfoRow,
  StatusBadge,
  SurfaceCard,
} from "@/features/student-commerce/components/StudentCommercePrimitives";
import type { EnrollmentRouteProps } from "@/features/student-commerce/types";
import { asHref, formatVnd, getEnrollment } from "@/features/student-commerce/utils/studentCommerceUtils";

export function CourseDetailScreen({
  enrollmentId,
  context = "admin-student",
}: EnrollmentRouteProps) {
  const router = useRouter();
  const enrollment = getEnrollment(enrollmentId);
  const historyPath =
    context === "account"
      ? "/account/wallet/transactions"
      : "/students/VQ_00123/wallet/transactions";

  return (
    <StackScreenLayout
      title={resolveDetailTitle(enrollment, { fallback: "Khóa học" })}
      contentContainerStyle={styles.content}
    >
      <SurfaceCard>
        <ThemedText type="title" style={styles.blackText}>
          {enrollment.courseName}
        </ThemedText>
        <ThemedText type="bodySmall" style={styles.blackText}>
          {enrollment.branchName}
        </ThemedText>
        <StatusBadge label={enrollment.statusLabel} />
      </SurfaceCard>
      <SurfaceCard>
        <ThemedText type="bodySmall" style={styles.blackText}>
          Số buổi còn lại
        </ThemedText>
        <ThemedText type="bodySmall" style={styles.blackText}>
          {Math.max(enrollment.totalSessions - enrollment.usedSessions, 0)} /{" "}
          {enrollment.totalSessions}
        </ThemedText>
        <ThemedText type="bodySmall" style={styles.blackText}>
          Đã sử dụng {enrollment.usedSessions} buổi
        </ThemedText>
      </SurfaceCard>
      <SurfaceCard>
        <InfoRow label="Gói học" value={enrollment.packageLabel} />
        <InfoRow label="Thời hạn" value={enrollment.dateRangeLabel} />
        <InfoRow label="Lịch học" value={enrollment.scheduleLabel} />
        <InfoRow label="HLV chính" value={enrollment.coachName} />
        <InfoRow label="Trạng thái" value="ACTIVE" />
      </SurfaceCard>
      <SurfaceCard>
        <ThemedText type="action" style={styles.blackText}>
          Thanh toán
        </ThemedText>
        <InfoRow label="Học phí" value={formatVnd(enrollment.tuitionFee)} />
        <Pressable onPress={() => router.push(asHref(historyPath))}>
          <ThemedText type="action" style={styles.primaryText}>
            Xem giao dịch mua khóa học ›
          </ThemedText>
        </Pressable>
      </SurfaceCard>
    </StackScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  blackText: {
    color: Colors.light.text,
  },
  primaryText: {
    color: Colors.light.primary,
  },
});
