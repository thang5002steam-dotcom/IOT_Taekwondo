import type { MobileUploadFile } from '@/infrastructure/http/http.types';
import { javaApi } from '@/infrastructure/http/httpClient';
import { createFileMultipartFormData } from '@/infrastructure/http/multipart';
import type { PageResponse } from '@/infrastructure/http/pagination.types';

import type {
  WalletTopUpCreateRequest,
  WalletTopUpProofUrlResponse,
  WalletTopUpRequestResponse,
  WalletTopUpRequestStatus,
} from './wallet-top-up-request.dto';

const ROOT = '/wallet-top-up-requests';

export const walletTopUpRequestApi = {
  async create(request: WalletTopUpCreateRequest, direct: boolean): Promise<WalletTopUpRequestResponse> {
    const response = await javaApi.post<WalletTopUpRequestResponse>(direct ? `${ROOT}/direct` : ROOT, request);
    return response.data;
  },

  async uploadProof(requestId: string, file: MobileUploadFile): Promise<void> {
    await javaApi.put(`${ROOT}/${requestId}/proof`, createFileMultipartFormData(file));
  },

  async submit(requestId: string, reconciliationConfirmed: boolean): Promise<WalletTopUpRequestResponse> {
    const response = await javaApi.post<WalletTopUpRequestResponse>(`${ROOT}/${requestId}/submit`, {
      reconciliationConfirmed,
    });
    return response.data;
  },

  async get(requestId: string): Promise<WalletTopUpRequestResponse> {
    const response = await javaApi.get<WalletTopUpRequestResponse>(`${ROOT}/${requestId}`);
    return response.data;
  },

  async getByClientRequest(clientRequestId: string): Promise<WalletTopUpRequestResponse> {
    const response = await javaApi.get<WalletTopUpRequestResponse>(
      `${ROOT}/by-client-request/${clientRequestId}`,
    );
    return response.data;
  },

  async listMine(params?: { page?: number; size?: number }): Promise<PageResponse<WalletTopUpRequestResponse>> {
    const response = await javaApi.get<PageResponse<WalletTopUpRequestResponse>>(`${ROOT}/mine`, { params });
    return response.data;
  },

  async listForReview(
    status: WalletTopUpRequestStatus = 'PENDING',
    params?: { page?: number; size?: number },
  ): Promise<PageResponse<WalletTopUpRequestResponse>> {
    const response = await javaApi.get<PageResponse<WalletTopUpRequestResponse>>(`${ROOT}/review`, {
      params: { status, ...params },
    });
    return response.data;
  },

  async approve(requestId: string): Promise<WalletTopUpRequestResponse> {
    const response = await javaApi.post<WalletTopUpRequestResponse>(`${ROOT}/${requestId}/approve`, {
      reconciliationConfirmed: true,
    });
    return response.data;
  },

  async reject(requestId: string, reason: string): Promise<WalletTopUpRequestResponse> {
    const response = await javaApi.post<WalletTopUpRequestResponse>(`${ROOT}/${requestId}/reject`, { reason });
    return response.data;
  },

  async getProofUrl(requestId: string): Promise<WalletTopUpProofUrlResponse> {
    const response = await javaApi.get<WalletTopUpProofUrlResponse>(`${ROOT}/${requestId}/proof-url`);
    return response.data;
  },
};

