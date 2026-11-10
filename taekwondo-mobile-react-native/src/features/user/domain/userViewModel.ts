import type { UserRoleSimpleResponse } from "@/features/roles";
import type { UserStatus } from "../constants/user.constants";

export function roleCodesForUser(
  userId: string,
  assignments: readonly UserRoleSimpleResponse[],
) {
  return assignments
    .filter((item) => item.userId === userId)
    .map((item) => item.roleCode);
}

export function userStatusLabel(status?: UserStatus | null) {
  switch (status) {
    case "ACTIVE":
      return "Hoạt động";
    case "PENDING":
      return "Chờ kích hoạt";
    case "BANNED":
      return "Đã khóa";
    case "DEACTIVATED":
      return "Vô hiệu hóa";
    default:
      return "Chưa xác định";
  }
}
