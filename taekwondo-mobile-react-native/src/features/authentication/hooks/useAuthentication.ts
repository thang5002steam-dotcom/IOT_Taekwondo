import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import type { SwitchContextRequest } from '../api/auth.dto';
import { authApi } from '../api/authApi';
import { authSessionService } from '../services/authSessionService';
import { routeAfterAuthResponse } from '../utils/authRouting';

export function useGetAccount() {
  return useQuery({
    queryKey: ['authentication', 'account'],
    queryFn: authApi.getAccount,
    retry: false,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: authSessionService.login,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: authSessionService.logout,
  });
}

export function useLogoutAll() {
  return useMutation({
    mutationFn: authSessionService.logoutAll,
  });
}

export function useSwitchContext() {
  const router = useRouter();
  return useMutation({
    mutationFn: (request: SwitchContextRequest) =>
      authSessionService.switchContext(request),
    onSuccess: (response) => {
      router.replace(routeAfterAuthResponse(response));
    },
  });
}
