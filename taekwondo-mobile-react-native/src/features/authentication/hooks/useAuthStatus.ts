import { useAuthStore } from '../store/auth.store';

export function useAuthStatus() {
  return useAuthStore((state) => state.status);
}
