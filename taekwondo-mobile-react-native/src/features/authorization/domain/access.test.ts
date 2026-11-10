import { canAll, canAny, hasPermission } from './access';
import { Permission } from './permissions';

describe('access helpers', () => {
  it('hasPermission checks a single permission', () => {
    expect(
      hasPermission([Permission.COURSE_READ], Permission.COURSE_READ),
    ).toBe(true);
    expect(hasPermission(undefined, Permission.COURSE_READ)).toBe(false);
    expect(hasPermission([], Permission.COURSE_READ)).toBe(false);
  });

  it('canAny passes when at least one permission is present', () => {
    expect(
      canAny(
        [Permission.COURSE_READ],
        [Permission.COURSE_UPDATE, Permission.COURSE_READ],
      ),
    ).toBe(true);
    expect(canAny(undefined, [Permission.COURSE_READ])).toBe(false);
  });

  it('canAll requires every permission', () => {
    expect(
      canAll(
        [Permission.COURSE_READ, Permission.COURSE_UPDATE],
        [Permission.COURSE_READ, Permission.COURSE_UPDATE],
      ),
    ).toBe(true);
    expect(
      canAll(
        [Permission.COURSE_READ],
        [Permission.COURSE_READ, Permission.COURSE_UPDATE],
      ),
    ).toBe(false);
    expect(canAll([], [])).toBe(true);
  });
});
