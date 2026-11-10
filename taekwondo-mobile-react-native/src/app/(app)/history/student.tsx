import { useLocalSearchParams } from 'expo-router';

import { AttendanceHistoryScreen } from '@/features/attendance-history';
import { Permission } from '@/features/authorization';
import { RequirePermission } from '@/routes/navigation/RequirePermission';

export default function StudentHistoryRoute() {
  const { courseId, courseName, from, to } = useLocalSearchParams<{
    courseId?: string;
    courseName?: string;
    from?: string;
    to?: string;
  }>();

  return (
    <RequirePermission permission={Permission.SESSION_ATTENDANCE_READ}>
      <AttendanceHistoryScreen
        mode="student"
        initialCourseId={courseId}
        initialCourseName={courseName}
        initialFrom={from}
        initialTo={to}
      />
    </RequirePermission>
  );
}
