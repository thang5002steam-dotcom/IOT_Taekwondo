import { ActivityIndicator, StyleSheet, View } from 'react-native';
import StackScreenLayout from '@/routes/navigation/layouts/StackScreenLayout';
import { AdminCard, AdminEmptyState, AdminIntro, AdminListRow, AdminSectionHeader } from '@/shared/ui/admin/AdministrationPrimitives';
import { Colors, Spacing } from '@/theme';
import { useStudentEnrollmentSchedules } from '../queries/studentEnrollmentScheduleQueries';
export function StudentEnrollmentScheduleScreen({ enrollmentId }: { enrollmentId: string }) {
  const schedules = useStudentEnrollmentSchedules(enrollmentId);

  return (
    <StackScreenLayout
      title="Lịch học đăng ký"
      contentContainerStyle={styles.content}
      onRefresh={async () => { await schedules.refetch(); }}
      refreshing={schedules.isRefetching}
    >
      <AdminIntro>
        Lịch được chốt khi đăng ký. Thay đổi dài hạn phải đi qua yêu cầu đổi lịch và được duyệt; không sửa trực tiếp từng lịch.
      </AdminIntro>
      <AdminSectionHeader title="Lịch đã chốt" />
      {schedules.isPending ? (
        <View style={styles.state}><ActivityIndicator color={Colors.light.primary} /></View>
      ) : schedules.isError ? (
        <AdminEmptyState message="Không thể tải lịch học." />
      ) : schedules.data?.length ? (
        <AdminCard>
          {schedules.data.map((item) => (
            <AdminListRow
              key={item.studentEnrollmentScheduleId}
              title={item.courseSchedule.classSchedule?.name ?? `Lịch ${item.courseSchedule.courseScheduleId.slice(0, 8)}`}
              subtitle={`${item.courseSchedule.startDate} · ${item.courseSchedule.status}`}
            />
          ))}
        </AdminCard>
      ) : (
        <AdminEmptyState message="Chưa có lịch học." />
      )}
    </StackScreenLayout>
  );
}
const styles=StyleSheet.create({content:{gap:Spacing.three},state:{paddingVertical:48,alignItems:'center'}});
