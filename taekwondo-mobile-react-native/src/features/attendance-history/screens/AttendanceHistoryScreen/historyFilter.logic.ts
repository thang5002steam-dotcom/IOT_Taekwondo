import {
  ScheduleLevelLabel,
  ScheduleLocationLabel,
  type ScheduleLevel,
  type ScheduleLocation,
  type Weekday,
} from "@/features/class-schedule/constants/class-schedule.constants";
import {
  DEFAULT_HISTORY_YEAR,
  getCalendarQuarterDateRange,
  getDefaultHistoryYears,
  QUARTER_OPTIONS,
  type CalendarQuarter,
} from "../../domain/historyDateRange";
import type { HistoryRecordViewModel } from "../../domain/historyMappers";
import type {
  HistoryFilterOption,
  HistoryFilterState,
  HistoryMultiFilterGroup,
  HistorySingleFilterGroup,
} from "./historyFilter.types";

export const emptyHistoryFilters: HistoryFilterState = {
  branchIds: [],
  shifts: [],
  weekdays: [],
  scheduleLevels: [],
  locations: [],
};

const VIETNAMESE_DAYS = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
];

const DAY_INDEX_TO_WEEKDAY: Weekday[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export const WEEKDAY_FILTER_OPTIONS: readonly HistoryFilterOption<Weekday>[] = [
  { value: "MONDAY", label: "Thứ Hai" },
  { value: "TUESDAY", label: "Thứ Ba" },
  { value: "WEDNESDAY", label: "Thứ Tư" },
  { value: "THURSDAY", label: "Thứ Năm" },
  { value: "FRIDAY", label: "Thứ Sáu" },
  { value: "SATURDAY", label: "Thứ Bảy" },
  { value: "SUNDAY", label: "Chủ Nhật" },
];

export const SCHEDULE_LEVEL_FILTER_OPTIONS: readonly HistoryFilterOption<ScheduleLevel>[] =
  [
    { value: "BASIC", label: ScheduleLevelLabel.BASIC },
    { value: "ADVANCED", label: ScheduleLevelLabel.ADVANCED },
    { value: "EXPERT", label: ScheduleLevelLabel.EXPERT },
    { value: "KID", label: ScheduleLevelLabel.KID },
    { value: "ADULT", label: ScheduleLevelLabel.ADULT },
    { value: "DAN", label: ScheduleLevelLabel.DAN },
    { value: "SKILL", label: ScheduleLevelLabel.SKILL },
    { value: "ASSISTANT", label: ScheduleLevelLabel.ASSISTANT },
    { value: "PERFORMANCE", label: ScheduleLevelLabel.PERFORMANCE },
    {
      value: "SPARRING_TEAM_TIER_1",
      label: ScheduleLevelLabel.SPARRING_TEAM_TIER_1,
    },
    {
      value: "SPARRING_TEAM_TIER_2",
      label: ScheduleLevelLabel.SPARRING_TEAM_TIER_2,
    },
    {
      value: "SPARRING_TEAM_TIER_3",
      label: ScheduleLevelLabel.SPARRING_TEAM_TIER_3,
    },
    {
      value: "FORMS_TEAM_TIER_1",
      label: ScheduleLevelLabel.FORMS_TEAM_TIER_1,
    },
    {
      value: "FORMS_TEAM_TIER_2",
      label: ScheduleLevelLabel.FORMS_TEAM_TIER_2,
    },
    {
      value: "FORMS_TEAM_TIER_3",
      label: ScheduleLevelLabel.FORMS_TEAM_TIER_3,
    },
  ];

export const LOCATION_FILTER_OPTIONS: readonly HistoryFilterOption<ScheduleLocation>[] =
  [
    { value: "INDOOR", label: ScheduleLocationLabel.INDOOR },
    { value: "OUTDOOR", label: ScheduleLocationLabel.OUTDOOR },
    { value: "ONLINE", label: ScheduleLocationLabel.ONLINE },
  ];

export type HistoryDateGroup = {
  dateLabel: string;
  formattedDateHeader: string;
  countLabel: string;
  records: HistoryRecordViewModel[];
};

export function getWeekdayFromDateLabel(dateLabel: string): Weekday | null {
  const parts = dateLabel.split("-");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    if (!Number.isNaN(dateObj.getTime())) {
      return DAY_INDEX_TO_WEEKDAY[dateObj.getDay()] ?? null;
    }
  }
  return null;
}

export function formatGroupDateHeader(dateLabel: string): string {
  const parts = dateLabel.split("-");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    if (!Number.isNaN(dateObj.getTime())) {
      const dayOfWeek = VIETNAMESE_DAYS[dateObj.getDay()];
      return `${dayOfWeek}, ${day}/${month}/${year}`;
    }
    return `Ngày ${day}/${month}/${year}`;
  }
  return `Ngày ${dateLabel}`;
}

export function groupHistoryRecordsByDate(
  records: HistoryRecordViewModel[],
  mode: "student" | "coach" = "student",
): HistoryDateGroup[] {
  const groups: HistoryDateGroup[] = [];
  const map = new Map<string, HistoryDateGroup>();

  for (const record of records) {
    const dateKey = record.dateLabel || "Khác";
    let group = map.get(dateKey);
    if (!group) {
      group = {
        dateLabel: dateKey,
        formattedDateHeader: formatGroupDateHeader(dateKey),
        countLabel: "",
        records: [],
      };
      map.set(dateKey, group);
      groups.push(group);
    }
    group.records.push(record);
  }

  const unit = mode === "student" ? "buổi" : "ca";
  for (const group of groups) {
    group.countLabel = `${group.records.length} ${unit}`;
  }

  return groups;
}

export function countSelectedHistoryFilters(filters: HistoryFilterState) {
  return (
    filters.branchIds.length +
    filters.shifts.length +
    filters.weekdays.length +
    filters.scheduleLevels.length +
    filters.locations.length +
    (filters.year ? 1 : 0) +
    (filters.quarter ? 1 : 0)
  );
}

export function canApplyHistoryFilters(filters: HistoryFilterState) {
  return Boolean(filters.year && filters.quarter);
}

export function filterHistoryRecords(
  records: HistoryRecordViewModel[],
  filters: HistoryFilterState,
) {
  const dateRange =
    filters.year && filters.quarter
      ? getCalendarQuarterDateRange(filters.year, filters.quarter)
      : null;

  return records.filter((record) => {
    if (
      filters.branchIds.length &&
      !filters.branchIds.includes(
        record.branchId ?? getBranchId(record.branchLabel),
      )
    ) {
      return false;
    }

    if (filters.shifts.length && !filters.shifts.includes(record.shiftLabel)) {
      return false;
    }

    if (filters.weekdays.length) {
      const recordWeekday =
        record.weekday ?? getWeekdayFromDateLabel(record.dateLabel);
      if (recordWeekday && !filters.weekdays.includes(recordWeekday)) {
        return false;
      }
    }

    if (
      filters.scheduleLevels.length &&
      record.scheduleLevel &&
      !filters.scheduleLevels.includes(record.scheduleLevel)
    ) {
      return false;
    }

    if (
      filters.locations.length &&
      record.location &&
      !filters.locations.includes(record.location)
    ) {
      return false;
    }

    if (
      dateRange &&
      !isDisplayDateInRange(record.dateLabel, dateRange.from, dateRange.to)
    ) {
      return false;
    }

    return true;
  });
}

export function getHistoryFilterDateRange(filters: HistoryFilterState) {
  if (!filters.year || !filters.quarter) return null;
  return getCalendarQuarterDateRange(filters.year, filters.quarter);
}

export function getHistoryFilterGroups(records: HistoryRecordViewModel[]): {
  multi: HistoryMultiFilterGroup[];
  years: HistorySingleFilterGroup<number>;
  quarters: HistorySingleFilterGroup<CalendarQuarter>;
} {
  const branchOptions = uniqueOptions(
    records.map((record) => ({
      value: record.branchId ?? getBranchId(record.branchLabel),
      label: record.branchLabel,
    })),
  );

  const shiftOptions = uniqueOptions(
    records.map((record) => ({
      value: record.shiftLabel,
      label: record.shiftLabel,
    })),
  );

  return {
    multi: [
      {
        key: "branchIds",
        title: "Cơ sở",
        options: branchOptions,
      },
      {
        key: "weekdays",
        title: "Thứ trong tuần",
        options: WEEKDAY_FILTER_OPTIONS,
      },
      {
        key: "scheduleLevels",
        title: "Cấp độ lớp",
        options: SCHEDULE_LEVEL_FILTER_OPTIONS,
      },
      {
        key: "locations",
        title: "Địa điểm",
        options: LOCATION_FILTER_OPTIONS,
      },
      {
        key: "shifts",
        title: "Ca",
        options: shiftOptions,
      },
    ],
    years: {
      key: "year",
      title: "Năm học",
      options: getDefaultHistoryYears(DEFAULT_HISTORY_YEAR).map((year) => ({
        value: year,
        label: String(year),
      })),
    },
    quarters: {
      key: "quarter",
      title: "Quý",
      options: QUARTER_OPTIONS.map((quarter) => ({
        value: quarter,
        label: String(quarter),
      })),
    },
  };
}

function uniqueOptions<T extends string | number>(
  options: HistoryFilterOption<T>[],
): HistoryFilterOption<T>[] {
  const seen = new Set<T>();
  return options.filter((option) => {
    if (seen.has(option.value)) return false;
    seen.add(option.value);
    return true;
  });
}

function getBranchId(branchLabel: string) {
  const match = branchLabel.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function isDisplayDateInRange(displayDate: string, from: string, to: string) {
  const recordDate = parseDisplayDate(displayDate);
  if (!recordDate) return true;
  return recordDate >= from && recordDate <= to;
}

function parseDisplayDate(displayDate: string) {
  const [day, month, year] = displayDate.split("-");
  if (!day || !month || !year) return null;
  return `${year}-${month}-${day}`;
}
