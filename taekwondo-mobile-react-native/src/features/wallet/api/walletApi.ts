import { javaApi } from '@/infrastructure/http/httpClient';
import type { PageResponse } from '@/infrastructure/http/pagination.types';

import type {
  WalletCommandTransactionResponse,
  WalletCoursePurchaseRequest,
  WalletTrainingPlanPurchaseRequest,
  WalletRefundRequest,
} from './wallet-command.dto';
import type {
  WalletListParams,
  WalletResponse,
  WalletSimpleResponse,
} from './wallet.dto';

export const walletApi = {
  async list(params?: WalletListParams): Promise<PageResponse<WalletSimpleResponse>> {
    const response = await javaApi.get<PageResponse<WalletSimpleResponse>>('/wallets', { params });
    return response.data;
  },
  async get(walletId: string): Promise<WalletResponse> {
    const response = await javaApi.get<WalletResponse>(`/wallets/${walletId}`);
    return response.data;
  },
  async getByPerson(personId: string): Promise<WalletResponse> {
    const response = await javaApi.get<WalletResponse>(`/wallets/person/${personId}`);
    return response.data;
  },
  async purchaseCourse(request: WalletCoursePurchaseRequest): Promise<WalletCommandTransactionResponse> {
    const response = await javaApi.post<WalletCommandTransactionResponse>('/wallets/course-purchases', request);
    return response.data;
  },
  async purchaseTrainingPlan(
    request: WalletTrainingPlanPurchaseRequest,
    options?: { signal?: AbortSignal },
  ): Promise<WalletCommandTransactionResponse> {
    const response = await javaApi.post<WalletCommandTransactionResponse>(
      '/wallets/training-plan-purchases',
      request,
      { signal: options?.signal },
    );
    return response.data;
  },
  async refund(request: WalletRefundRequest): Promise<WalletCommandTransactionResponse> {
    const response = await javaApi.post<WalletCommandTransactionResponse>('/wallets/refunds', request);
    return response.data;
  },
};
