import { javaApi } from '@/infrastructure/http/httpClient';
import type { PageResponse } from '@/infrastructure/http/pagination.types';

import type {
  AuthSessionCreateRequest,
  AuthSessionListParams,
  AuthSessionResponse,
  AuthSessionSimpleResponse,
  AuthSessionUpdateRequest,
} from './auth-session.dto';

export const authSessionApi = {
  async list(params?: AuthSessionListParams): Promise<PageResponse<AuthSessionSimpleResponse>> {
    const response = await javaApi.get<PageResponse<AuthSessionSimpleResponse>>('/auth-sessions', { params });
    return response.data;
  },
  async get(authSessionId: string): Promise<AuthSessionResponse> {
    const response = await javaApi.get<AuthSessionResponse>(`/auth-sessions/${authSessionId}`);
    return response.data;
  },
  async create(request: AuthSessionCreateRequest): Promise<AuthSessionResponse> {
    const response = await javaApi.post<AuthSessionResponse>('/auth-sessions', request);
    return response.data;
  },
  async update(authSessionId: string, request: AuthSessionUpdateRequest): Promise<AuthSessionResponse> {
    const response = await javaApi.put<AuthSessionResponse>(`/auth-sessions/${authSessionId}`, request);
    return response.data;
  },
  async remove(authSessionId: string): Promise<void> {
    await javaApi.delete(`/auth-sessions/${authSessionId}`);
  },
};
