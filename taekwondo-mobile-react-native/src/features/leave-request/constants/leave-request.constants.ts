export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type RequesterType = 'STUDENT' | 'SYSTEM_EMPLOYEE';
export type ScheduleImpactType = 'LEAVE_SESSION' | 'MAKEUP_SESSION';

export const LeaveRequestStatusValues = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
] as const satisfies readonly LeaveRequestStatus[];

export const RequesterTypeValues = [
  'STUDENT',
  'SYSTEM_EMPLOYEE',
] as const satisfies readonly RequesterType[];

export const LeaveRequestStatusLabel: Record<LeaveRequestStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Bị từ chối',
  CANCELLED: 'Đã hủy',
};

export const RequesterTypeLabel: Record<RequesterType, string> = {
  STUDENT: 'Học viên',
  SYSTEM_EMPLOYEE: 'Nhân viên hệ thống',
};

export const ScheduleImpactTypeValues = [
  'LEAVE_SESSION',
  'MAKEUP_SESSION',
] as const satisfies readonly ScheduleImpactType[];

export const ScheduleImpactTypeLabel: Record<ScheduleImpactType, string> = {
  LEAVE_SESSION: 'Buổi nghỉ',
  MAKEUP_SESSION: 'Buổi học bù',
};
