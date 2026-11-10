import type { ScheduleFilterGroup, ScheduleScreenItem } from './scheduleScreen.types';
import type { Weekday } from '../../constants/class-schedule.constants';

export const scheduleWeekTabs: readonly {
  key: Weekday;
  label: string;
  count?: number;
}[] = [
  { key: 'MONDAY', label: 'Hôm nay', count: 5 },
  { key: 'TUESDAY', label: 'T3' },
  { key: 'WEDNESDAY', label: 'T4' },
  { key: 'THURSDAY', label: 'T5', count: 1 },
  { key: 'FRIDAY', label: 'T6' },
  { key: 'SATURDAY', label: 'T7', count: 1 },
  { key: 'SUNDAY', label: 'CN' },
] as const;

export const scheduleItems: ScheduleScreenItem[] = [
  {
    scheduleId: 'class-schedule-1',
    branchId: 1,
    branchName: 'Cơ sở 1',
    weekday: 'MONDAY',
    shift: 'CA_1',
    shiftLabel: 'Sáng',
    startTime: '18:00',
    endTime: '19:30',
    coachName: 'HLV Nguyễn Trung Đạt',
    image: require('../../assets/images/class-basic.png'),
  },
  {
    scheduleId: 'class-schedule-2',
    branchId: 2,
    branchName: 'Cơ sở 2',
    weekday: 'MONDAY',
    shift: 'CA_2',
    shiftLabel: 'Tối',
    startTime: '19:30',
    endTime: '21:00',
    coachName: 'HLV Nguyễn Trung Đạt',
    image: require('../../assets/images/class-advanced.jpg'),
  },
  {
    scheduleId: 'class-schedule-3',
    branchId: 3,
    branchName: 'Cơ sở 3',
    weekday: 'MONDAY',
    shift: 'CA_1',
    shiftLabel: 'Sáng',
    startTime: '18:00',
    endTime: '19:30',
    coachName: 'HLV Nguyễn Trung Đạt',
    image: require('../../assets/images/class-basic.png'),
  },
  {
    scheduleId: 'class-schedule-4',
    branchId: 4,
    branchName: 'Cơ sở 4',
    weekday: 'MONDAY',
    shift: 'CA_2',
    shiftLabel: 'Tối',
    startTime: '19:30',
    endTime: '21:00',
    coachName: 'HLV Nguyễn Trung Đạt',
    image: require('../../assets/images/class-advanced.jpg'),
  },
  {
    scheduleId: 'class-schedule-5',
    branchId: 5,
    branchName: 'Cơ sở 5',
    weekday: 'MONDAY',
    shift: 'CA_1',
    shiftLabel: 'Sáng',
    startTime: '18:00',
    endTime: '19:30',
    coachName: 'HLV Nguyễn Trung Đạt',
    image: require('../../assets/images/class-basic.png'),
  },
  {
    scheduleId: 'class-schedule-6',
    branchId: 1,
    branchName: 'Cơ sở 1',
    weekday: 'THURSDAY',
    shift: 'CA_1',
    shiftLabel: 'Sáng',
    startTime: '18:00',
    endTime: '19:30',
    coachName: 'HLV Nguyễn Trung Đạt',
    image: require('../../assets/images/class-basic.png'),
  },
  {
    scheduleId: 'class-schedule-7',
    branchId: 4,
    branchName: 'Cơ sở 4',
    weekday: 'SATURDAY',
    shift: 'CA_2',
    shiftLabel: 'Tối',
    startTime: '19:30',
    endTime: '21:00',
    coachName: 'HLV Nguyễn Trung Đạt',
    image: require('../../assets/images/class-advanced.jpg'),
  },
];

export const scheduleFilterGroups: readonly ScheduleFilterGroup[] = [
  {
    key: 'branchIds',
    title: 'Cơ sở',
    options: [1, 2, 3, 4, 5, 6].map((id) => ({
      value: id,
      label: `Cơ sở ${id}`,
    })),
  },
  {
    key: 'sessions',
    title: 'Buổi học',
    options: [
      { value: 'Sáng', label: 'Sáng' },
      { value: 'Tối', label: 'Tối' },
    ],
  },
  {
    key: 'shifts',
    title: 'Ca tập',
    options: [
      { value: 'CA_1', label: 'Ca 1' },
      { value: 'CA_2', label: 'Ca 2' },
      { value: 'CA_3', label: 'Ca 3' },
      { value: 'CA_4', label: 'Ca 4' },
      { value: 'CA_5', label: 'Ca 5' },
    ],
  },
];
