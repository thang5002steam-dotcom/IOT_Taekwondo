export const NotificationTypeValues = [
  "SYSTEM",
  "ATTENDANCE",
  "TUITION",
  "CLASS_SCHEDULE",
  "COACH_TIMESHEET",
  "ANNOUNCEMENT",
  "CLASS_SESSION_REPORT",
] as const satisfies readonly NotificationType[];

export const NotificationTypeLabel: Record<NotificationType, string> = {
  SYSTEM: "Hệ thống",
  ATTENDANCE: "Điểm danh",
  TUITION: "Học phí",
  CLASS_SCHEDULE: "Lịch học",
  COACH_TIMESHEET: "Chấm công",
  ANNOUNCEMENT: "Thông báo chung",
  CLASS_SESSION_REPORT: "Báo cáo buổi học",
};

export const NotificationRecipientStatusValues = [
  "PENDING",
  "SENT",
  "FAILED",
  "ARCHIVED",
] as const satisfies readonly NotificationRecipientStatus[];

export const NotificationRecipientStatusLabel: Record<
  NotificationRecipientStatus,
  string
> = {
  PENDING: "Chờ xử lý",
  SENT: "Đã gửi",
  FAILED: "Thất bại",
  ARCHIVED: "Đã lưu trữ",
};

export type NotificationRecipientStatus =
  | "PENDING"
  | "SENT"
  | "FAILED"
  | "ARCHIVED";

export type NotificationType =
  | "SYSTEM"
  | "ATTENDANCE"
  | "TUITION"
  | "CLASS_SCHEDULE"
  | "COACH_TIMESHEET"
  | "ANNOUNCEMENT"
  | "CLASS_SESSION_REPORT";

