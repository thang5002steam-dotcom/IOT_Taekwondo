import type { PermissionValue } from './permissions';

export function hasPermission(
  permissions: readonly PermissionValue[] | undefined,
  permission: PermissionValue,
): boolean {
  return Boolean(permissions?.includes(permission));
}

export function canAny(
  permissions: readonly PermissionValue[] | undefined,
  requiredPermissions: readonly PermissionValue[],
): boolean {
  return requiredPermissions.some((permission) =>
    hasPermission(permissions, permission),
  );
}

export function canAll(
  permissions: readonly PermissionValue[] | undefined,
  requiredPermissions: readonly PermissionValue[],
): boolean {
  return requiredPermissions.every((permission) =>
    hasPermission(permissions, permission),
  );
}
