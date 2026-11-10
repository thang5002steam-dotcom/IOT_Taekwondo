import { useAuthStore } from '../store/auth.store';

export function useAuthSession() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const activeContext = useAuthStore((state) => state.activeContext);
  const requiresContextSelection = useAuthStore(
    (state) => state.requiresContextSelection,
  );
  const availableContextCount = useAuthStore(
    (state) => state.availableContexts.length,
  );

  return {
    status,
    user,
    activeContext,
    availableContextCount,
    requiresContextSelection,
    isAuthenticated:
      status === 'authenticated' || status === 'selecting-context',
  } as const;
}
