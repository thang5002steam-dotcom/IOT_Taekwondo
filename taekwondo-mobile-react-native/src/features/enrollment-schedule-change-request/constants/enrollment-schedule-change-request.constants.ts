export type EnrollmentScheduleChangeRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export const EnrollmentScheduleChangeRequestStatusValues = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
] as const satisfies readonly EnrollmentScheduleChangeRequestStatus[];

export const EnrollmentScheduleChangeRequestStatusLabel: Record<EnrollmentScheduleChangeRequestStatus, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
  CANCELLED: "Đã hủy",
};
