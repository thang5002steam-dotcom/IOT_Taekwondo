import { Permission } from '@/features/authorization';

import { getAttendanceHistoryNavigationDecision } from './historyAccess';

describe('getAttendanceHistoryNavigationDecision', () => {
  it('routes directly to student history for session attendance permission only', () => {
    expect(
      getAttendanceHistoryNavigationDecision([
        Permission.SESSION_ATTENDANCE_READ,
      ]),
    ).toEqual({ type: 'route', mode: 'student' });
  });

  it('opens picker when both session attendance and coach timesheet permissions exist', () => {
    expect(
      getAttendanceHistoryNavigationDecision([
        Permission.SESSION_ATTENDANCE_READ,
        Permission.COACH_TIMESHEET_READ,
      ]),
    ).toEqual({ type: 'picker' });
  });

  it('routes directly to coach history for coach timesheet permission only', () => {
    expect(
      getAttendanceHistoryNavigationDecision([Permission.COACH_TIMESHEET_READ]),
    ).toEqual({ type: 'route', mode: 'coach' });
  });
});
