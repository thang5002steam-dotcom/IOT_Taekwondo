import { javaApi } from '@/infrastructure/http/httpClient';
import type { PageResponse } from '@/infrastructure/http/pagination.types';

import type {
  RolePermissionCreateRequest,
  RolePermissionItemResponse,
  RolePermissionSimpleResponse,
  RolePermissionListParams,
  RolePermissionReplaceRequest,
  RolePermissionResponse,
} from './role-permission.dto';

export const rolePermissionApi = {
  async list(params?: RolePermissionListParams): Promise<PageResponse<RolePermissionSimpleResponse>> {
    const response = await javaApi.get<PageResponse<RolePermissionSimpleResponse>>('/role-permissions', { params });
    return response.data;
  },
  async get(roleCode: string, permissionId: number): Promise<RolePermissionItemResponse> {
    const response = await javaApi.get<RolePermissionItemResponse>(
      `/role-permissions/${roleCode}/${permissionId}`,
    );
    return response.data;
  },
  async create(request: RolePermissionCreateRequest): Promise<RolePermissionItemResponse> {
    const response = await javaApi.post<RolePermissionItemResponse>('/role-permissions', request);
    return response.data;
  },
  async remove(roleCode: string, permissionId: number): Promise<void> {
    await javaApi.delete(`/role-permissions/${roleCode}/${permissionId}`);
  },
  async replaceForRole(roleCode: string, request: RolePermissionReplaceRequest): Promise<RolePermissionResponse> {
    const response = await javaApi.put<RolePermissionResponse>(`/roles/${roleCode}/permissions`, request);
    return response.data;
  },
};
