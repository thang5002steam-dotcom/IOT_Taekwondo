export type CoachStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "RETIRED";

export const CoachStatusLabel: Record<CoachStatus, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Không hoạt động",
  SUSPENDED: "Bị đình chỉ",
  RETIRED: "Đã nghỉ hưu",
};

export type CoachRoleCode =
  | "ASSISTANT_1"
  | "ASSISTANT_2"
  | "ASSISTANT_3"
  | "COACH_TRAINEE"
  | "COACH_JUNIOR"
  | "COACH_SENIOR"
  | "MANAGER_TRAINEE"
  | "MANAGER_MIDDLE"
  | "MANAGER_SENIOR"
  | "HEAD_COACH";

/**
 * Mapping từ roleCode sang tên hiển thị (Vietnamese labels)
 */
export const COACH_ROLE_CODE_LABELS: Record<CoachRoleCode, string> = {
  ASSISTANT_1: "Trợ giảng Cấp 1",
  ASSISTANT_2: "Trợ giảng Cấp 2",
  ASSISTANT_3: "Trợ giảng Cấp 3",
  COACH_TRAINEE: "Huấn luyện viên Thực tập",
  COACH_JUNIOR: "Huấn luyện viên Cấp trung",
  COACH_SENIOR: "Huấn luyện viên Cấp cao",
  MANAGER_TRAINEE: "Quản lý Thực tập",
  MANAGER_MIDDLE: "Quản lý Cấp trung",
  MANAGER_SENIOR: "Quản lý Cấp cao",
  HEAD_COACH: "Huấn luyện viên Trưởng",
};

export const ROLE_CODE_LABELS: Record<string, string> = {
  ...COACH_ROLE_CODE_LABELS,
  DEVELOPER: "Nhà phát triển",
};

/**
 * Thứ tự hiển thị của các roleCode
 */
export const COACH_ROLE_CODE_ORDER: CoachRoleCode[] = [
  "HEAD_COACH",
  "MANAGER_SENIOR",
  "MANAGER_MIDDLE",
  "MANAGER_TRAINEE",
  "COACH_SENIOR",
  "COACH_JUNIOR",
  "COACH_TRAINEE",
  "ASSISTANT_3",
  "ASSISTANT_2",
  "ASSISTANT_1",
];
