import { javaApi } from '@/infrastructure/http/httpClient';
import type { PageResponse } from '@/infrastructure/http/pagination.types';

import type {
  BranchCreateRequest,
  BranchListParams,
  BranchResponse,
  BranchSimpleResponse,
  BranchUpdateRequest,
} from './branch.dto';

export const branchApi = {
  async list(params?: BranchListParams): Promise<PageResponse<BranchSimpleResponse>> {
    const response = await javaApi.get<PageResponse<BranchSimpleResponse>>('/branches', { params });
    return response.data;
  },
  async get(branchId: number): Promise<BranchResponse> {
    const response = await javaApi.get<BranchResponse>(`/branches/${branchId}`);
    return response.data;
  },
  async create(request: BranchCreateRequest): Promise<BranchResponse> {
    const response = await javaApi.post<BranchResponse>('/branches', request);
    return response.data;
  },
  async update(branchId: number, request: BranchUpdateRequest): Promise<BranchResponse> {
    const response = await javaApi.put<BranchResponse>(`/branches/${branchId}`, request);
    return response.data;
  },
  async remove(branchId: number): Promise<void> {
    await javaApi.delete(`/branches/${branchId}`);
  },
};
