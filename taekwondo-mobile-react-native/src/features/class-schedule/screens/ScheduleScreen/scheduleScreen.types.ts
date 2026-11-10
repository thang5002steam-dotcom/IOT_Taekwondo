import type { ImageSourcePropType } from 'react-native';

import type {
  ScheduleShift,
  Weekday,
} from '../../constants/class-schedule.constants';

export type ScheduleScreenItem = {
  scheduleId: string;
  branchId: number;
  branchName: string;
  weekday: Weekday;
  shift: ScheduleShift;
  shiftLabel: string;
  startTime: string;
  endTime: string;
  coachName: string;
  image: ImageSourcePropType;
};

export type ScheduleFilterState = {
  branchIds: number[];
  sessions: string[];
  shifts: string[];
};

export type ScheduleFilterGroupKey = keyof ScheduleFilterState;

export type ScheduleFilterOption = {
  value: string | number;
  label: string;
};

export type ScheduleFilterGroup = {
  key: ScheduleFilterGroupKey;
  title: string;
  options: readonly ScheduleFilterOption[];
};
