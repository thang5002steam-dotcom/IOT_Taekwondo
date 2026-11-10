export type CoursePriceStatus = 'ACTIVE' | 'INACTIVE';

export const CoursePriceStatusValues = [
  'ACTIVE',
  'INACTIVE',
] as const satisfies readonly CoursePriceStatus[];

export const CoursePriceStatusLabel: Record<CoursePriceStatus, string> = {
  ACTIVE: 'Đang áp dụng',
  INACTIVE: 'Ngừng áp dụng',
};
