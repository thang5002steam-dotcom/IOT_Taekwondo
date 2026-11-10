export type CourseStatus = "OPEN" | "ACTIVE" | "CLOSED" | "CANCELLED";

export const CourseStatusValues = [
  "OPEN",
  "ACTIVE",
  "CLOSED",
  "CANCELLED",
] as const satisfies readonly CourseStatus[];

export const CourseStatusLabel: Record<CourseStatus, string> = {
  OPEN: "Mở đăng ký",
  ACTIVE: "Đang diễn ra",
  CLOSED: "Đã đóng",
  CANCELLED: "Đã hủy",
};

export type CourseLevel = "BASIC" | "ADVANCED" | "EXPERT";

export const CourseLevelValues = [
  "BASIC",
  "ADVANCED",
  "EXPERT",
] as const satisfies readonly CourseLevel[];

export const CourseLevelLabel: Record<CourseLevel, string> = {
  BASIC: "Cơ bản",
  ADVANCED: "Nâng cao",
  EXPERT: "Chuyên sâu",
};
