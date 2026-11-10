export type AssignmentType =
  | 'PRIMARY_COACH'
  | 'ASSISTANT_COACH'
  | 'TEACHING_ASSISTANT'
  | 'MANAGER';

export const AssignmentTypeValues = [
  'PRIMARY_COACH',
  'ASSISTANT_COACH',
  'TEACHING_ASSISTANT',
  'MANAGER',
] as const satisfies readonly AssignmentType[];

export const AssignmentTypeLabel: Record<AssignmentType, string> = {
  PRIMARY_COACH: 'HLV chính',
  ASSISTANT_COACH: 'HLV phụ',
  TEACHING_ASSISTANT: 'Trợ giảng',
  MANAGER: 'Quản lý',
};

export type CourseStaffAssignmentStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'ENDED'
  | 'CANCELLED';

export const CourseStaffAssignmentStatusValues = [
  'PENDING',
  'ACTIVE',
  'SUSPENDED',
  'ENDED',
  'CANCELLED',
] as const satisfies readonly CourseStaffAssignmentStatus[];

export const CourseStaffAssignmentStatusLabel: Record<CourseStaffAssignmentStatus, string> = {
  PENDING: 'Chờ phân công',
  ACTIVE: 'Đang được phân công',
  SUSPENDED: 'Tạm đình chỉ',
  ENDED: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
};
