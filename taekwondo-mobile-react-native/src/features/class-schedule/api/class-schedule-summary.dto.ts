import type {
  ScheduleLocation,
  ScheduleShift,
  Weekday,
} from '../constants/class-schedule.constants';

export interface ClassScheduleSummary {
  scheduleId: string;
  branchName: string;
  scheduleLocation: ScheduleLocation;
  scheduleShift: ScheduleShift;
  monthlyFee: number;
  quarterlyFee: number | null;
  startTime: string;
  endTime: string;
  weekday: Weekday;
}
