export type PermissionAction = "CREATE" | "UPDATE" | "READ" | "DELETE" | "APPROVE";

export const PermissionActionValues = [
  "CREATE",
  "UPDATE",
  "READ",
  "DELETE",
  "APPROVE",
] as const satisfies readonly PermissionAction[];

export const PermissionActionLabel: Record<PermissionAction, string> = {
  CREATE: "Tạo mới",
  UPDATE: "Cập nhật",
  READ: "Xem",
  DELETE: "Xóa",
  APPROVE: "Phê duyệt",
};
