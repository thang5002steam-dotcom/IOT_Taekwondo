import { javaApi } from '@/infrastructure/http/httpClient';
import type { PageResponse } from '@/infrastructure/http/pagination.types';

import type {
  BeltExamCreateRequest,
  BeltExamListParams,
  BeltExamResponse,
  BeltExamSimpleResponse,
  BeltExamUpdateRequest,
} from './belt-exam.dto';

export const beltExamApi = {
  async list(params?: BeltExamListParams): Promise<PageResponse<BeltExamSimpleResponse>> {
    const response = await javaApi.get<PageResponse<BeltExamSimpleResponse>>('/belt-exams', { params });
    return response.data;
  },
  async get(beltExamId: string): Promise<BeltExamResponse> {
    const response = await javaApi.get<BeltExamResponse>(`/belt-exams/${beltExamId}`);
    return response.data;
  },
  async create(request: BeltExamCreateRequest): Promise<BeltExamResponse> {
    const response = await javaApi.post<BeltExamResponse>('/belt-exams', request);
    return response.data;
  },
  async update(beltExamId: string, request: BeltExamUpdateRequest): Promise<BeltExamResponse> {
    const response = await javaApi.put<BeltExamResponse>(`/belt-exams/${beltExamId}`, request);
    return response.data;
  },
  async remove(beltExamId: string): Promise<void> {
    await javaApi.delete(`/belt-exams/${beltExamId}`);
  },
};
