import { javaApi } from '@/infrastructure/http/httpClient';

import type {
  PositionCreateRequest,
  PositionListResponse,
  PositionResponse,
  PositionSearchParams,
  PositionUpdateRequest,
} from './position.dto';

export const positionApi = {
  async list(params?: PositionSearchParams): Promise<PositionListResponse> {
    const response = await javaApi.get<PositionListResponse>('/positions', { params });
    return response.data;
  },
  async get(positionId: string): Promise<PositionResponse> {
    const response = await javaApi.get<PositionResponse>(`/positions/${positionId}`);
    return response.data;
  },
  async create(request: PositionCreateRequest): Promise<PositionResponse> {
    const response = await javaApi.post<PositionResponse>('/positions', request);
    return response.data;
  },
  async update(positionId: string, request: PositionUpdateRequest): Promise<PositionResponse> {
    const response = await javaApi.put<PositionResponse>(`/positions/${positionId}`, request);
    return response.data;
  },
  async remove(positionId: string, signal?: AbortSignal): Promise<void> {
    await javaApi.delete(`/positions/${positionId}`, { signal });
  },
};
