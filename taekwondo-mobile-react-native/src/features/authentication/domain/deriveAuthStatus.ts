import type { AuthStatus, AuthUser, UserContext } from './auth.types';

export function deriveAuthStatus(
  accessToken: string | null,
  user: AuthUser | null,
  activeContext: UserContext | null,
  requiresContextSelection: boolean,
): Exclude<AuthStatus, 'bootstrapping' | 'recoverable-error'> {
  if (!accessToken || !user) return 'anonymous';
  if (requiresContextSelection || !activeContext) return 'selecting-context';
  return 'authenticated';
}
