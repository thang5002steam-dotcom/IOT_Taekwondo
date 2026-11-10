import type { RolePermissionSimpleResponse } from "../api/role-permission.dto";

export function permissionCodesForRole(
  roleCode: string,
  assignments: readonly RolePermissionSimpleResponse[],
) {
  return assignments
    .filter((item) => item.roleCode === roleCode)
    .map((item) => item.permissionCode);
}
