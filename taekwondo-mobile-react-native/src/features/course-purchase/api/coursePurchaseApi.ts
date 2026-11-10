import { javaApi } from '@/infrastructure/http/httpClient';
import type { PageResponse } from '@/infrastructure/http/pagination.types';

import type {
  CoursePurchaseCreateRequest,
  CoursePurchaseListParams,
  CoursePurchaseResponse,
  CoursePurchaseSimpleResponse,
  CoursePurchaseUpdateRequest,
} from './course-purchase.dto';

export const coursePurchaseApi = {
  async list(params?: CoursePurchaseListParams): Promise<PageResponse<CoursePurchaseSimpleResponse>> {
    const response = await javaApi.get<PageResponse<CoursePurchaseSimpleResponse>>('/course-purchases', { params });
    return response.data;
  },
  async get(coursePurchaseId: string): Promise<CoursePurchaseResponse> {
    const response = await javaApi.get<CoursePurchaseResponse>(`/course-purchases/${coursePurchaseId}`);
    return response.data;
  },
  async create(request: CoursePurchaseCreateRequest): Promise<CoursePurchaseResponse> {
    const response = await javaApi.post<CoursePurchaseResponse>('/course-purchases', request);
    return response.data;
  },
  async update(coursePurchaseId: string, request: CoursePurchaseUpdateRequest): Promise<CoursePurchaseResponse> {
    const response = await javaApi.put<CoursePurchaseResponse>(`/course-purchases/${coursePurchaseId}`, request);
    return response.data;
  },
  async remove(coursePurchaseId: string): Promise<void> {
    await javaApi.delete(`/course-purchases/${coursePurchaseId}`);
  },
};
