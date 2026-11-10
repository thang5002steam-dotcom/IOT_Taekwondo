import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { ThemedText } from "@/shared/ui/ThemedText";
import { useToast } from "@/shared/ui/Toast/ToastProvider";
import { Colors, radii } from "@/theme";

import { ClassSessionOverviewCard } from "../components/ClassSessionOverviewCard";
import { StudentAttendanceCard } from "../components/StudentAttendanceCard";
import { useSessionAttendance } from "../hooks/useSessionAttendance";

export function SessionAttendanceScreen({ classSessionId }: { classSessionId?: string }) {
  const toast = useToast();
  const handleUpdateError = useCallback(() => {
    toast.show({
      message: "Không thể cập nhật điểm danh hoặc đánh giá. Vui lòng thử lại.",
      variant: "error",
    });
  }, [toast]);
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    students,
    stats,
    updateAttendanceStatus,
    updateEvaluationStatus,
  } = useSessionAttendance({ classSessionId, onUpdateError: handleUpdateError });

  return (
    <StackScreenLayout
      title="Điểm danh & Đánh giá"
      scrollEnabled={false}
      contentContainerStyle={styles.container}
    >
      {!classSessionId ? (
        <View style={styles.centerBox}>
          <ThemedText type="body" style={styles.emptyTitle}>Thiếu mã buổi tập</ThemedText>
        </View>
      ) : isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <ThemedText type="bodySmall" style={styles.loadingText}>
            Đang tải dữ liệu buổi tập...
          </ThemedText>
        </View>
      ) : isError || !data ? (
        <View style={styles.centerBox}>
          <ThemedText type="body" style={styles.emptyTitle}>
            Không thể tải thông tin buổi tập
          </ThemedText>
          <ThemedText type="bodySmall" style={styles.emptyDescription}>
            Đã xảy ra lỗi kết nối. Vui lòng thử lại.
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Thử lại"
            onPress={() => refetch()}
            style={styles.retryButton}
          >
            <ThemedText type="bodySmall" style={styles.retryText}>Thử lại</ThemedText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.studentEnrollment.studentEnrollmentId}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              colors={[Colors.light.primary]}
              tintColor={Colors.light.primary}
            />
          }
          ListHeaderComponent={
            <View style={styles.headerWrap}>
              <ClassSessionOverviewCard classSession={data.classSession} stats={stats} />
              <View style={styles.sectionHeader}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Danh sách võ sinh ({students.length})
                </ThemedText>
                <ThemedText type="caption" style={styles.sectionHint}>
                  Chạm để đổi trạng thái
                </ThemedText>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <StudentAttendanceCard
              item={item}
              onUpdateAttendanceStatus={(newStatus) =>
                updateAttendanceStatus(item.studentEnrollment.studentEnrollmentId, newStatus)
              }
              onUpdateEvaluationStatus={(newStatus) =>
                updateEvaluationStatus(item.studentEnrollment.studentEnrollmentId, newStatus)
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyListBox}>
              <ThemedText type="body" style={styles.emptyTitle}>
                Chưa có học viên nào trong lớp
              </ThemedText>
              <ThemedText type="bodySmall" style={styles.emptyDescription}>
                Lớp học này hiện chưa có học viên nào đăng ký hoạt động.
              </ThemedText>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </StackScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 0 },
  listContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  headerWrap: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: Colors.light.text },
  sectionHint: { color: Colors.light.textSecondary, fontSize: 12 },
  centerBox: {
    paddingTop: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  loadingText: { color: Colors.light.textSecondary, textAlign: "center" },
  emptyTitle: { color: Colors.light.text, fontWeight: "700", textAlign: "center" },
  emptyDescription: { color: Colors.light.textSecondary, textAlign: "center" },
  retryButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.primary,
    borderRadius: radii.md,
  },
  retryText: { color: "#FFFFFF", fontWeight: "600" },
  emptyListBox: { alignItems: "center", justifyContent: "center", paddingVertical: 36, gap: 8 },
});
