import type {
  ScheduleFilterState,
  ScheduleScreenItem,
} from './scheduleScreen.types';
import type { Weekday } from '../../constants/class-schedule.constants';

export const emptyScheduleFilters: ScheduleFilterState = {
  branchIds: [],
  sessions: [],
  shifts: [],
};

export function countSelectedScheduleFilters(filters: ScheduleFilterState) {
  return (
    filters.branchIds.length +
    filters.sessions.length +
    filters.shifts.length
  );
}

export function toggleScheduleFilterValue<T>(values: T[], value: T) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function filterScheduleItems(
  items: ScheduleScreenItem[],
  selectedDay: Weekday,
  filters: ScheduleFilterState,
) {
  return items.filter((item) => {
    if (item.weekday !== selectedDay) return false;
    if (filters.branchIds.length && !filters.branchIds.includes(item.branchId)) return false;
    if (filters.sessions.length && !filters.sessions.includes(item.shiftLabel)) return false;
    if (filters.shifts.length && !filters.shifts.includes(item.shift)) return false;
    return true;
  });
}
