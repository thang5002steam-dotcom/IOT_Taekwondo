import { javaApi } from '@/infrastructure/http/httpClient';
import type { PageResponse } from '@/infrastructure/http/pagination.types';

import type {
  ChangePasswordRequest,
  UserCreateRequest,
  UserDetail,
  UserSimpleResponse,
  UserListParams,
  UserResponse,
  UserUpdateRequest,
} from './user.dto';

export const userApi = {
  async list(params?: UserListParams): Promise<PageResponse<UserSimpleResponse>> {
    const response = await javaApi.get<PageResponse<UserSimpleResponse>>('/users', { params });
    return response.data;
  },
  async get(userId: string): Promise<UserDetail> {
    const response = await javaApi.get<UserDetail>(`/users/${userId}`);
    return response.data;
  },
  async create(request: UserCreateRequest): Promise<UserDetail> {
    const response = await javaApi.post<UserDetail>('/users', request);
    return response.data;
  },
  async update(userId: string, request: UserUpdateRequest): Promise<UserDetail> {
    const response = await javaApi.put<UserDetail>(`/users/${userId}`, request);
    return response.data;
  },
  async remove(userId: string, signal?: AbortSignal): Promise<void> {
    await javaApi.delete(`/users/${userId}`, { signal });
  },
  async changePassword(request: ChangePasswordRequest): Promise<string> {
    const response = await javaApi.post<string>('/users/me/change-password', request);
    return response.data;
  },
  async getMe(): Promise<UserResponse[]> {
    const response = await javaApi.get<UserResponse[]>('/users/me');
    return response.data;
  },
};
