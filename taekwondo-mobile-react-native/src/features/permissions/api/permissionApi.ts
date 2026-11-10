import { javaApi } from '@/infrastructure/http/httpClient';
import type { PageResponse } from '@/infrastructure/http/pagination.types';

import type {
  PermissionCreateRequest,
  PermissionListParams,
  PermissionResponse,
  PermissionSimpleResponse,
  PermissionUpdateRequest,
} from './permission.dto';

export const permissionApi = {
  async list(params?: PermissionListParams): Promise<PageResponse<PermissionSimpleResponse>> {
    const response = await javaApi.get<PageResponse<PermissionSimpleResponse>>('/permissions', { params });
    return response.data;
  },
  async get(permissionId: number): Promise<PermissionResponse> {
    const response = await javaApi.get<PermissionResponse>(`/permissions/${permissionId}`);
    return response.data;
  },
  async create(request: PermissionCreateRequest): Promise<PermissionResponse> {
    const response = await javaApi.post<PermissionResponse>('/permissions', request);
    return response.data;
  },
  async update(permissionId: number, request: PermissionUpdateRequest): Promise<PermissionResponse> {
    const response = await javaApi.put<PermissionResponse>(`/permissions/${permissionId}`, request);
    return response.data;
  },
  async remove(permissionId: number): Promise<void> {
    await javaApi.delete(`/permissions/${permissionId}`);
  },
};
