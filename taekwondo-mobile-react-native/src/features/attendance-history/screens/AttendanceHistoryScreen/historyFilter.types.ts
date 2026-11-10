import type {
  ScheduleLevel,
  ScheduleLocation,
  Weekday,
} from '@/features/class-schedule/constants/class-schedule.constants';
import type { CalendarQuarter } from '../../domain/historyDateRange';

export type HistoryFilterState = {
  branchIds: number[];
  shifts: string[];
  weekdays: Weekday[];
  scheduleLevels: ScheduleLevel[];
  locations: ScheduleLocation[];
  year?: number;
  quarter?: CalendarQuarter;
};

export type HistoryFilterOption<T extends string | number = string | number> = {
  value: T;
  label: string;
};

export type HistoryMultiFilterGroupKey =
  | 'branchIds'
  | 'shifts'
  | 'weekdays'
  | 'scheduleLevels'
  | 'locations';

export type HistoryMultiFilterGroup = {
  key: HistoryMultiFilterGroupKey;
  title: string;
  options: readonly HistoryFilterOption[];
};

export type HistorySingleFilterGroup<T extends string | number = string | number> = {
  key: 'year' | 'quarter';
  title: string;
  options: readonly HistoryFilterOption<T>[];
};
