export type EnrollmentScheduleStatus = "ACTIVE" | "ENDED";

export const EnrollmentScheduleStatusValues = ["ACTIVE", "ENDED"] as const satisfies readonly EnrollmentScheduleStatus[];

export const EnrollmentScheduleStatusLabel: Record<EnrollmentScheduleStatus, string> = {
  ACTIVE: "Đang hiệu lực",
  ENDED: "Đã kết thúc",
};
