import { AttendanceHistoryScreen } from '@/features/attendance-history';
import { Permission } from '@/features/authorization';
import { RequirePermission } from '@/routes/navigation/RequirePermission';

export default function CoachHistoryRoute() {
  return (
    <RequirePermission permission={Permission.COACH_TIMESHEET_READ}>
      <AttendanceHistoryScreen mode="coach" />
    </RequirePermission>
  );
}
