import type { PropsWithChildren, ReactNode } from 'react';

import type { PermissionValue } from '../domain/permissions';
import { useCan } from '../hooks/useAccess';

type PermissionGateProps = PropsWithChildren<{
  permission: PermissionValue;
  fallback?: ReactNode;
}>;

export function PermissionGate({
  permission,
  fallback = null,
  children,
}: PermissionGateProps) {
  const allowed = useCan(permission);
  return allowed ? children : fallback;
}
