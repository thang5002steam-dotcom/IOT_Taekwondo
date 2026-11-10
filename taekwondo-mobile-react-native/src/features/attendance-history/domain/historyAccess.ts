import type { PermissionValue } from '@/features/authorization';
import { hasPermission, Permission } from '@/features/authorization';

export type AttendanceHistoryMode = 'student' | 'coach';

export type AttendanceHistoryNavigationDecision =
  | { type: 'route'; mode: AttendanceHistoryMode }
  | { type: 'picker' }
  | { type: 'forbidden' };

export function getAttendanceHistoryNavigationDecision(
  permissions: readonly PermissionValue[] | undefined,
): AttendanceHistoryNavigationDecision {
  const canReadSessionAttendance = hasPermission(
    permissions,
    Permission.SESSION_ATTENDANCE_READ,
  );
  const canReadCoachTimesheet = hasPermission(
    permissions,
    Permission.COACH_TIMESHEET_READ,
  );

  if (canReadSessionAttendance && canReadCoachTimesheet) {
    return { type: 'picker' };
  }
  if (canReadSessionAttendance) {
    return { type: 'route', mode: 'student' };
  }
  if (canReadCoachTimesheet) {
    return { type: 'route', mode: 'coach' };
  }

  return { type: 'forbidden' };
}
