import { javaApi } from '@/infrastructure/http/httpClient';
import type { PageResponse } from '@/infrastructure/http/pagination.types';

import type {
  WalletTransactionListParams,
  WalletTransactionResponse,
  WalletTransactionSimpleResponse,
} from './wallet-transaction.dto';

export const walletTransactionApi = {
  async list(params?: WalletTransactionListParams): Promise<PageResponse<WalletTransactionSimpleResponse>> {
    const response = await javaApi.get<PageResponse<WalletTransactionSimpleResponse>>('/wallet-transactions', { params });
    return response.data;
  },
  async get(walletTransactionId: string): Promise<WalletTransactionResponse> {
    const response = await javaApi.get<WalletTransactionResponse>(`/wallet-transactions/${walletTransactionId}`);
    return response.data;
  },
};
