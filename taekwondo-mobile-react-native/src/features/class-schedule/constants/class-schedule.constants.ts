export type ScheduleLevel =
  | 'BASIC'
  | 'ADVANCED'
  | 'EXPERT'
  | 'KID'
  | 'ADULT'
  | 'ASSISTANT'
  | 'PERFORMANCE'
  | 'DAN'
  | 'SKILL'
  | 'SPARRING_TEAM_TIER_1'
  | 'SPARRING_TEAM_TIER_2'
  | 'SPARRING_TEAM_TIER_3'
  | 'FORMS_TEAM_TIER_1'
  | 'FORMS_TEAM_TIER_2'
  | 'FORMS_TEAM_TIER_3';

export const ScheduleLevelValues = [
  'BASIC',
  'ADVANCED',
  'EXPERT',
] as const satisfies readonly ScheduleLevel[];

export const ScheduleLevelLabel: Record<ScheduleLevel, string> = {
  BASIC: 'Lớp Cơ Bản',
  ADVANCED: 'Lớp Nâng Cao',
  EXPERT: 'Chuyên sâu',
  KID: 'Lớp Kid',
  ADULT: 'Lớp Người Lớn',
  ASSISTANT: 'Lớp Trợ Giảng',
  PERFORMANCE: 'Lớp Biểu Diễn',
  DAN: 'Lớp Đẳng',
  SKILL: 'Lớp Kỹ Năng',
  SPARRING_TEAM_TIER_1: 'Đội Tuyển Đối Kháng Tuyến 1',
  SPARRING_TEAM_TIER_2: 'Đội Tuyển Đối Kháng Tuyến 2',
  SPARRING_TEAM_TIER_3: 'Đội Tuyển Đối Kháng Tuyến 3',
  FORMS_TEAM_TIER_1: 'Đội Tuyển Quyền Tuyến 1',
  FORMS_TEAM_TIER_2: 'Đội Tuyển Quyền Tuyến 2',
  FORMS_TEAM_TIER_3: 'Đội Tuyển Quyền Tuyến 3',
};

export type ScheduleLocation = 'INDOOR' | 'OUTDOOR' | 'ONLINE';

export const ScheduleLocationValues = [
  'INDOOR',
  'OUTDOOR',
  'ONLINE',
] as const satisfies readonly ScheduleLocation[];

export const ScheduleLocationLabel: Record<ScheduleLocation, string> = {
  INDOOR: 'Phòng tập',
  OUTDOOR: 'Ngoài trời',
  ONLINE: 'Trực tuyến',
};

export type ScheduleShift = 'CA_1' | 'CA_2';

export const ScheduleShiftLabel: Record<ScheduleShift, string> = {
  CA_1: 'Ca 1',
  CA_2: 'Ca 2',
};

export type ScheduleStatus = 'ACTIVE' | 'INACTIVE';

export const ScheduleStatusValues = ['ACTIVE', 'INACTIVE'] as const satisfies readonly ScheduleStatus[];

export type Weekday =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export const WeekdayCode: Record<Weekday, number> = {
  MONDAY: 2,
  TUESDAY: 3,
  WEDNESDAY: 4,
  THURSDAY: 5,
  FRIDAY: 6,
  SATURDAY: 7,
  SUNDAY: 1,
};

export const WeekdayLabel: Record<Weekday, string> = {
  MONDAY: 'Thứ Hai',
  TUESDAY: 'Thứ Ba',
  WEDNESDAY: 'Thứ Tư',
  THURSDAY: 'Thứ Năm',
  FRIDAY: 'Thứ Sáu',
  SATURDAY: 'Thứ Bảy',
  SUNDAY: 'Chủ Nhật',
};

export const WeekdayCodeToLabel: Record<number, string> = {
  1: 'Chủ Nhật',
  2: 'Thứ Hai',
  3: 'Thứ Ba',
  4: 'Thứ Tư',
  5: 'Thứ Năm',
  6: 'Thứ Sáu',
  7: 'Thứ Bảy',
};

export const WeekdayFromCode = Object.entries(WeekdayCode).reduce(
  (acc, [day, code]) => {
    acc[code] = day as Weekday;
    return acc;
  },
  {} as Record<number, Weekday>,
);
