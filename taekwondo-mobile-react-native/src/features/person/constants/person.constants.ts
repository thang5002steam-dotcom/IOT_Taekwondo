export type Belt =
  | 'C10'
  | 'C9'
  | 'C8'
  | 'C7'
  | 'C6'
  | 'C5'
  | 'C4'
  | 'C3'
  | 'C2'
  | 'C1'
  | 'D1'
  | 'D2'
  | 'D3'
  | 'D4'
  | 'D5'
  | 'D6'
  | 'D7'
  | 'D8'
  | 'D9'
  | 'D10';

export const BeltLabel: Record<Belt, string> = {
  C10: 'Trắng',
  C9: 'Vàng 1',
  C8: 'Vàng 2',
  C7: 'Xanh lá',
  C6: 'Xanh dương 1',
  C5: 'Xanh dương 2',
  C4: 'Đỏ 1',
  C3: 'Đỏ 2',
  C2: 'Đỏ 3',
  C1: 'Đỏ 4',
  D1: 'Đen 1 đẳng',
  D2: 'Đen 2 đẳng',
  D3: 'Đen 3 đẳng',
  D4: 'Đen 4 đẳng',
  D5: 'Đen 5 đẳng',
  D6: 'Đen 6 đẳng',
  D7: 'Đen 7 đẳng',
  D8: 'Đen 8 đẳng',
  D9: 'Đen 9 đẳng',
  D10: 'Đen 10 đẳng',
};

export type PersonStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type PersonKind = 'STUDENT' | 'SYSTEM_EMPLOYEE';

export const PersonStatusLabel: Record<PersonStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Không hoạt động',
  SUSPENDED: 'Tạm ngưng',
};

export const ALL_BELTS: readonly Belt[] = [
  'C10',
  'C9',
  'C8',
  'C7',
  'C6',
  'C5',
  'C4',
  'C3',
  'C2',
  'C1',
  'D1',
  'D2',
  'D3',
  'D4',
  'D5',
  'D6',
  'D7',
  'D8',
  'D9',
  'D10',
] as const;

export const PersonStatusValues = ['ACTIVE', 'INACTIVE', 'SUSPENDED'] as const satisfies readonly PersonStatus[];
export const PersonKindValues = ['STUDENT', 'SYSTEM_EMPLOYEE'] as const satisfies readonly PersonKind[];
