import {
  formatToDateString,
  getDaysOfMonth,
  getDaysOfWeek,
  parseDateString,
} from './calendarDate';

describe('calendarDate domain logic', () => {
  it('formats date to YYYY-MM-DD string correctly', () => {
    const d = new Date(2026, 8, 23); // Sept 23, 2026
    expect(formatToDateString(d)).toBe('2026-09-23');
  });

  it('parses YYYY-MM-DD string correctly', () => {
    const parsed = parseDateString('2026-09-23');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(8); // 0-indexed: 8 is September
    expect(parsed.getDate()).toBe(23);
  });

  it('generates 7 days for a week starting on Monday', () => {
    const centerDate = parseDateString('2026-09-23'); // Wednesday
    const week = getDaysOfWeek(centerDate);

    expect(week).toHaveLength(7);
    expect(week[0].dateString).toBe('2026-09-21'); // Monday
    expect(week[0].dayOfWeek).toBe(1);
    expect(week[6].dateString).toBe('2026-09-27'); // Sunday
    expect(week[6].dayOfWeek).toBe(7);
  });

  it('generates month days grid with Monday as first column', () => {
    // September 2026: 1st is Tuesday
    const monthDays = getDaysOfMonth(2026, 8);
    expect(monthDays.length % 7).toBe(0);
    expect(monthDays[0].dateString).toBe('2026-08-31'); // Monday before 1st of Sept
    expect(monthDays[1].dateString).toBe('2026-09-01'); // 1st of Sept (Tuesday)
  });
});
