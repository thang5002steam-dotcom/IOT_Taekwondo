import type { PropsWithChildren, ReactNode } from 'react';

import { useCan } from '@/features/authorization';
import type { PermissionValue } from '@/features/authorization';

import { ForbiddenScreen } from './ForbiddenScreen';

type RequirePermissionProps = PropsWithChildren<{
  permission: PermissionValue;
  fallback?: ReactNode;
}>;

export function RequirePermission({
  permission,
  fallback,
  children,
}: RequirePermissionProps) {
  const allowed = useCan(permission);

  if (allowed) return children;
  return fallback ?? <ForbiddenScreen />;
}
