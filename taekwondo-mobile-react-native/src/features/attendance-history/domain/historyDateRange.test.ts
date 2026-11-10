import {
  getCalendarQuarterDateRange,
  getCurrentCalendarQuarter,
  getCurrentCalendarYear,
  getDefaultHistoryYears,
} from './historyDateRange';

describe('historyDateRange', () => {
  it('maps calendar quarters to inclusive API date ranges', () => {
    expect(getCalendarQuarterDateRange(2026, 1)).toEqual({
      from: '2026-01-01',
      to: '2026-03-31',
    });
    expect(getCalendarQuarterDateRange(2026, 4)).toEqual({
      from: '2026-10-01',
      to: '2026-12-31',
    });
  });

  it('returns current year and previous four years', () => {
    expect(getDefaultHistoryYears(2026)).toEqual([
      2026, 2025, 2024, 2023, 2022,
    ]);
  });

  it('calculates current calendar year and quarter correctly', () => {
    const marchDate = new Date('2026-03-15T10:00:00Z');
    expect(getCurrentCalendarYear(marchDate)).toBe(2026);
    expect(getCurrentCalendarQuarter(marchDate)).toBe(1);

    const septemberDate = new Date('2026-09-17T10:00:00Z');
    expect(getCurrentCalendarYear(septemberDate)).toBe(2026);
    expect(getCurrentCalendarQuarter(septemberDate)).toBe(3);

    const novemberDate = new Date('2026-11-01T10:00:00Z');
    expect(getCurrentCalendarQuarter(novemberDate)).toBe(4);
  });
});

