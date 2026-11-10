import type { PermissionValue } from '@/features/authorization';
import { hasPermission, Permission } from '@/features/authorization';

import type { AttendanceHistoryMode } from './historyAccess';

export type FilterStrategy = 'client-filter' | 'server-filter';

export type DetermineStrategyParams = {
  mode: AttendanceHistoryMode;
  permissions: readonly PermissionValue[] | undefined;
};

/**
 * Determines whether to apply client-side filtering or server-side filtering.
 *
 * Rules:
 * - If user only has READ permission (e.g., SESSION_ATTENDANCE_READ / COACH_TIMESHEET_READ)
 *   without management powers (UPDATE/DELETE), return 'client-filter'.
 * - If user has management permissions (UPDATE / DELETE), return 'server-filter'.
 */
export function determineFilterStrategy({
  mode,
  permissions,
}: DetermineStrategyParams): FilterStrategy {
  if (mode === 'student') {
    const hasManagementAccess =
      hasPermission(permissions, Permission.SESSION_ATTENDANCE_UPDATE) ||
      hasPermission(permissions, Permission.SESSION_ATTENDANCE_DELETE);

    if (hasManagementAccess) {
      return 'server-filter';
    }
    return 'client-filter';
  }

  // Coach mode
  const hasManagementAccess =
    hasPermission(permissions, Permission.COACH_TIMESHEET_UPDATE) ||
    hasPermission(permissions, Permission.COACH_TIMESHEET_DELETE);

  if (hasManagementAccess) {
    return 'server-filter';
  }
  return 'client-filter';
}
