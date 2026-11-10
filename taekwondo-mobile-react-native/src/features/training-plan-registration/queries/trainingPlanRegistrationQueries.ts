import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '@/features/wallet/api/walletApi';
import type { WalletTrainingPlanPurchaseRequest } from '@/features/wallet/api/wallet-command.dto';
import { trainingPlanRegistrationApi } from '../api/trainingPlanRegistrationApi';

export const trainingPlanRegistrationKeys = {
  all: ['training-plan-registration'] as const,
  catalog: (studentPersonId?: string) => [...trainingPlanRegistrationKeys.all, 'catalog', studentPersonId ?? ''] as const,
  options: (planId?: string, startDate?: string) =>
    [...trainingPlanRegistrationKeys.all, 'options', planId ?? '', startDate ?? ''] as const,
};

export function useTrainingPlanCatalog(studentPersonId?: string) {
  return useQuery({
    queryKey: trainingPlanRegistrationKeys.catalog(studentPersonId),
    queryFn: () => trainingPlanRegistrationApi.catalog(studentPersonId),
    enabled: Boolean(studentPersonId),
    staleTime: 30_000,
  });
}

export function useTrainingPlanOptions(planId?: string, startDate?: string) {
  return useQuery({
    queryKey: trainingPlanRegistrationKeys.options(planId, startDate),
    queryFn: () => trainingPlanRegistrationApi.options(planId!, startDate!),
    enabled: Boolean(planId && startDate),
  });
}

export function usePurchaseTrainingPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      request,
      signal,
    }: {
      request: WalletTrainingPlanPurchaseRequest;
      signal?: AbortSignal;
    }) => walletApi.purchaseTrainingPlan(request, { signal }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['wallet'] }),
        queryClient.invalidateQueries({ queryKey: ['student-enrollments'] }),
        queryClient.invalidateQueries({ queryKey: trainingPlanRegistrationKeys.all }),
      ]);
    },
  });
}
