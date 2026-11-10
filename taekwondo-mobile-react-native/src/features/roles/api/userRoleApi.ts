import { javaApi } from '@/infrastructure/http/httpClient';
import type { PageResponse } from '@/infrastructure/http/pagination.types';

import type {
  AssignUserRoleRequest,
  UserRoleItemResponse,
  UserRoleSimpleResponse,
  UserRoleListParams,
  UserRoleReplaceRequest,
  UserRoleResponse,
} from './user-role.dto';

export const userRoleApi = {
  async list(params?: UserRoleListParams): Promise<PageResponse<UserRoleSimpleResponse>> {
    const response = await javaApi.get<PageResponse<UserRoleSimpleResponse>>('/user-roles', { params });
    return response.data;
  },
  async get(userId: string, roleCode: string): Promise<UserRoleItemResponse> {
    const response = await javaApi.get<UserRoleItemResponse>(`/user-roles/${userId}/${roleCode}`);
    return response.data;
  },
  async assign(request: AssignUserRoleRequest): Promise<UserRoleResponse> {
    const response = await javaApi.post<UserRoleResponse>('/user-roles', request);
    return response.data;
  },
  async replaceForUser(userId: string, request: UserRoleReplaceRequest): Promise<UserRoleResponse> {
    const response = await javaApi.put<UserRoleResponse>(`/user-roles/${userId}`, request);
    return response.data;
  },
  async remove(userId: string, roleCode: string): Promise<void> {
    await javaApi.delete(`/user-roles/${userId}/${roleCode}`);
  },
};
