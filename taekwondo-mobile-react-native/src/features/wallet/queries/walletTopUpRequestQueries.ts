import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { WalletTopUpRequestStatus } from '../api/wallet-top-up-request.dto';
import { walletTopUpRequestApi } from '../api/walletTopUpRequestApi';
import { submitTopUpRequest, type SubmitTopUpInput } from '../services/submitTopUpRequest';
import { walletKeys } from './walletQueries';

export const walletTopUpRequestKeys = {
  all: ['wallet-top-up-requests'] as const,
  mine: () => [...walletTopUpRequestKeys.all, 'mine'] as const,
  review: (status: WalletTopUpRequestStatus) => [...walletTopUpRequestKeys.all, 'review', status] as const,
  detail: (id?: string) => [...walletTopUpRequestKeys.all, 'detail', id ?? ''] as const,
  proof: (id?: string) => [...walletTopUpRequestKeys.all, 'proof', id ?? ''] as const,
};

export function useSubmitTopUpRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitTopUpInput) => submitTopUpRequest(input),
    onSuccess: async (result, input) => {
      queryClient.setQueryData(walletTopUpRequestKeys.detail(result.topUpRequestId), result);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: walletKeys.byPerson(input.personId) }),
        queryClient.invalidateQueries({ queryKey: walletTopUpRequestKeys.mine() }),
        queryClient.invalidateQueries({ queryKey: walletTopUpRequestKeys.review('PENDING') }),
      ]);
    },
  });
}

export function useMyTopUpRequests(enabled = true) {
  return useQuery({
    queryKey: walletTopUpRequestKeys.mine(),
    queryFn: () => walletTopUpRequestApi.listMine({ size: 10 }),
    enabled,
  });
}

export function useTopUpRequestsForReview(status: WalletTopUpRequestStatus = 'PENDING', enabled = true) {
  return useQuery({
    queryKey: walletTopUpRequestKeys.review(status),
    queryFn: () => walletTopUpRequestApi.listForReview(status, { size: 100 }),
    enabled,
  });
}

export function useTopUpRequest(id?: string, enabled = true) {
  return useQuery({
    queryKey: walletTopUpRequestKeys.detail(id),
    queryFn: () => walletTopUpRequestApi.get(id!),
    enabled: enabled && Boolean(id),
  });
}

export function useTopUpProofUrl(id?: string, enabled = true) {
  return useQuery({
    queryKey: walletTopUpRequestKeys.proof(id),
    queryFn: () => walletTopUpRequestApi.getProofUrl(id!),
    enabled: enabled && Boolean(id),
    staleTime: 5 * 60_000,
  });
}

export function useApproveTopUpRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => walletTopUpRequestApi.approve(requestId),
    onSuccess: async (result) => {
      queryClient.setQueryData(walletTopUpRequestKeys.detail(result.topUpRequestId), result);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: walletTopUpRequestKeys.review('PENDING') }),
        queryClient.invalidateQueries({ queryKey: walletKeys.byPerson(result.personId) }),
        queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] }),
      ]);
    },
  });
}

export function useRejectTopUpRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      walletTopUpRequestApi.reject(requestId, reason),
    onSuccess: async (result) => {
      queryClient.setQueryData(walletTopUpRequestKeys.detail(result.topUpRequestId), result);
      await queryClient.invalidateQueries({ queryKey: walletTopUpRequestKeys.review('PENDING') });
    },
  });
}
