export type StudentEnrollmentStatus =
  | 'PENDING_START'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'RESERVED'
  | 'TRANSFERRED'
  | 'DROPPED';

export const StudentEnrollmentStatusValues = [
  'PENDING_START',
  'ACTIVE',
  'COMPLETED',
  'EXPIRED',
  'CANCELLED',
] as const satisfies readonly StudentEnrollmentStatus[];

export const StudentEnrollmentStatusLabel: Record<StudentEnrollmentStatus, string> = {
  PENDING_START: 'Chờ bắt đầu',
  ACTIVE: 'Đang học',
  COMPLETED: 'Đã hoàn thành',
  EXPIRED: 'Đã hết hạn',
  CANCELLED: 'Đã hủy',
  RESERVED: 'Bảo lưu',
  TRANSFERRED: 'Chuyển lớp',
  DROPPED: 'Nghỉ học',
};
