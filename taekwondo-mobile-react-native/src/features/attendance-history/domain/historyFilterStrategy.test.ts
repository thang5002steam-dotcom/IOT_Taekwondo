import { Permission } from '@/features/authorization';
import { determineFilterStrategy } from './historyFilterStrategy';

describe('determineFilterStrategy', () => {
  describe('Student mode', () => {
    it('returns client-filter when user only has SESSION_ATTENDANCE_READ', () => {
      const strategy = determineFilterStrategy({
        mode: 'student',
        permissions: [Permission.SESSION_ATTENDANCE_READ],
      });
      expect(strategy).toBe('client-filter');
    });

    it('returns client-filter when user has SESSION_ATTENDANCE_CREATE but no UPDATE or DELETE', () => {
      const strategy = determineFilterStrategy({
        mode: 'student',
        permissions: [Permission.SESSION_ATTENDANCE_READ, Permission.SESSION_ATTENDANCE_CREATE],
      });
      expect(strategy).toBe('client-filter');
    });

    it('returns server-filter when user has SESSION_ATTENDANCE_UPDATE permission', () => {
      const strategy = determineFilterStrategy({
        mode: 'student',
        permissions: [Permission.SESSION_ATTENDANCE_READ, Permission.SESSION_ATTENDANCE_UPDATE],
      });
      expect(strategy).toBe('server-filter');
    });

    it('returns server-filter when user has SESSION_ATTENDANCE_DELETE permission', () => {
      const strategy = determineFilterStrategy({
        mode: 'student',
        permissions: [Permission.SESSION_ATTENDANCE_READ, Permission.SESSION_ATTENDANCE_DELETE],
      });
      expect(strategy).toBe('server-filter');
    });
  });

  describe('Coach mode', () => {
    it('returns client-filter when user only has COACH_TIMESHEET_READ', () => {
      const strategy = determineFilterStrategy({
        mode: 'coach',
        permissions: [Permission.COACH_TIMESHEET_READ],
      });
      expect(strategy).toBe('client-filter');
    });

    it('returns server-filter when user has COACH_TIMESHEET_UPDATE permission', () => {
      const strategy = determineFilterStrategy({
        mode: 'coach',
        permissions: [Permission.COACH_TIMESHEET_READ, Permission.COACH_TIMESHEET_UPDATE],
      });
      expect(strategy).toBe('server-filter');
    });

    it('returns server-filter when user has COACH_TIMESHEET_DELETE permission', () => {
      const strategy = determineFilterStrategy({
        mode: 'coach',
        permissions: [Permission.COACH_TIMESHEET_READ, Permission.COACH_TIMESHEET_DELETE],
      });
      expect(strategy).toBe('server-filter');
    });
  });
});
