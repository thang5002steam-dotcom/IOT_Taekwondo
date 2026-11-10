export type CalendarQuarter = 1 | 2 | 3 | 4;

export type HistoryDateRange = {
  from: string;
  to: string;
};

export const DEFAULT_HISTORY_YEAR = 2026;

export const QUARTER_OPTIONS = [1, 2, 3, 4] as const satisfies readonly CalendarQuarter[];

export function getDefaultHistoryYears(
  currentYear = DEFAULT_HISTORY_YEAR,
): number[] {
  return Array.from({ length: 5 }, (_, index) => currentYear - index);
}

export function getCalendarQuarterDateRange(
  year: number,
  quarter: CalendarQuarter,
): HistoryDateRange {
  const startMonth = (quarter - 1) * 3;
  const endMonth = startMonth + 2;
  const from = formatDate(year, startMonth, 1);
  const to = formatDate(year, endMonth, new Date(year, endMonth + 1, 0).getDate());

  return { from, to };
}

export function getCurrentCalendarYear(now = new Date()): number {
  return now.getFullYear();
}

export function getCurrentCalendarQuarter(now = new Date()): CalendarQuarter {
  const month = now.getMonth();
  return (Math.floor(month / 3) + 1) as CalendarQuarter;
}

function formatDate(year: number, zeroBasedMonth: number, day: number) {
  const month = String(zeroBasedMonth + 1).padStart(2, '0');
  const dayOfMonth = String(day).padStart(2, '0');
  return `${year}-${month}-${dayOfMonth}`;
}

