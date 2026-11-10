export type UserStatus =
  | "PENDING"
  | "ACTIVE"
  | "LOCKED"
  | "DISABLED"
  | "BANNED"
  | "DEACTIVATED";

export const UserStatusValues = [
  "PENDING",
  "ACTIVE",
  "LOCKED",
  "DISABLED",
  "BANNED",
  "DEACTIVATED",
] as const satisfies readonly UserStatus[];

export const UserStatusLabel: Record<UserStatus, string> = {
  PENDING: "Chờ kích hoạt",
  ACTIVE: "Đang hoạt động",
  LOCKED: "Bị khóa",
  DISABLED: "Bị vô hiệu hóa",
  BANNED: "Bị cấm",
  DEACTIVATED: "Đã vô hiệu hóa",
};

export type RelationshipType = "OWNER" | "GUARDIAN" | "MANAGER";

export const RelationshipTypeValues = ["OWNER", "GUARDIAN", "MANAGER"] as const satisfies readonly RelationshipType[];

export const RelationshipTypeLabel: Record<RelationshipType, string> = {
  OWNER: "Chủ sở hữu hồ sơ",
  GUARDIAN: "Phụ huynh hoặc người giám hộ",
  MANAGER: "Người quản lý hồ sơ",
};

export type SystemRoleDefinition = "SUPER_ADMIN" | "SYSTEM_ADMIN" | "GUARDIAN";

export const SystemRoleDefinitionValues = [
  "SUPER_ADMIN",
  "SYSTEM_ADMIN",
  "GUARDIAN",
] as const satisfies readonly SystemRoleDefinition[];

export const SystemRoleDefinitionLabel: Record<SystemRoleDefinition, string> = {
  SUPER_ADMIN: "Siêu quản trị viên",
  SYSTEM_ADMIN: "Quản trị viên hệ thống",
  GUARDIAN: "Phụ huynh/người giám hộ",
};
