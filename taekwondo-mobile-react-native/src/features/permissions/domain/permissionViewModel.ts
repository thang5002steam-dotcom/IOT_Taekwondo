import type { PermissionSimpleResponse } from "../api/permission.dto";

export function groupPermissions(
  permissions: readonly PermissionSimpleResponse[],
) {
  return permissions.reduce<Record<string, PermissionSimpleResponse[]>>(
    (groups, permission) => {
      (groups[permission.model] ??= []).push(permission);
      return groups;
    },
    {},
  );
}
