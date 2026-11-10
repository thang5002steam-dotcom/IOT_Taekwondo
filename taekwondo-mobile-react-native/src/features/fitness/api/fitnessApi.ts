import { javaApi } from '@/infrastructure/http/httpClient';
import type { PageResponse } from '@/infrastructure/http/pagination.types';

import type { ScheduleLevel } from '@/features/class-schedule/constants/class-schedule.constants';
import type {
  FitnessCreateRequest,
  FitnessListParams,
  FitnessResponse,
  FitnessSimpleResponse,
  FitnessThreshold,
  FitnessUpdateRequest,
} from './fitness.dto';

export const fitnessApi = {
  async list(params?: FitnessListParams): Promise<PageResponse<FitnessSimpleResponse>> {
    const response = await javaApi.get<PageResponse<FitnessSimpleResponse>>('/fitness', { params });
    return response.data;
  },
  async get(fitnessId: number): Promise<FitnessResponse> {
    const response = await javaApi.get<FitnessResponse>(`/fitness/${fitnessId}`);
    return response.data;
  },
  async create(request: FitnessCreateRequest): Promise<FitnessResponse> {
    const response = await javaApi.post<FitnessResponse>('/fitness', request);
    return response.data;
  },
  async update(fitnessId: number, request: FitnessUpdateRequest): Promise<FitnessResponse> {
    const response = await javaApi.put<FitnessResponse>(`/fitness/${fitnessId}`, request);
    return response.data;
  },
  async remove(fitnessId: number): Promise<void> {
    await javaApi.delete(`/fitness/${fitnessId}`);
  },
  async getBySkillLevel(skillLevel: ScheduleLevel): Promise<FitnessThreshold[]> {
    const response = await javaApi.get<FitnessThreshold[]>('/fitness', { params: { skillLevel } });
    return response.data;
  },
};
