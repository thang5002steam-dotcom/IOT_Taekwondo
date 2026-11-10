import { javaApi } from '@/infrastructure/http/httpClient';
import type { PageResponse } from '@/infrastructure/http/pagination.types';

import type {
  UserPersonCreateRequest,
  UserPersonListParams,
  UserPersonResponse,
  UserPersonSimpleResponse,
  UserPersonUpdateRequest,
} from './user-person.dto';

export const userPersonApi = {
  async list(params?: UserPersonListParams): Promise<PageResponse<UserPersonSimpleResponse>> {
    const response = await javaApi.get<PageResponse<UserPersonSimpleResponse>>('/user-persons', { params });
    return response.data;
  },
  async get(userPersonId: string): Promise<UserPersonResponse> {
    const response = await javaApi.get<UserPersonResponse>(`/user-persons/${userPersonId}`);
    return response.data;
  },
  async create(request: UserPersonCreateRequest): Promise<UserPersonResponse> {
    const response = await javaApi.post<UserPersonResponse>('/user-persons', request);
    return response.data;
  },
  async update(userPersonId: string, request: UserPersonUpdateRequest): Promise<UserPersonResponse> {
    const response = await javaApi.put<UserPersonResponse>(`/user-persons/${userPersonId}`, request);
    return response.data;
  },
  async remove(userPersonId: string): Promise<void> {
    await javaApi.delete(`/user-persons/${userPersonId}`);
  },
};
