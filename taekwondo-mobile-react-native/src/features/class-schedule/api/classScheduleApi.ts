import { javaApi } from '@/infrastructure/http/httpClient';
import type { PageResponse } from '@/infrastructure/http/pagination.types';

import type {
  ClassScheduleCreateRequest,
  ClassScheduleDetail,
  ClassScheduleResponse,
  ClassScheduleSimpleResponse,
  ClassScheduleUpdateRequest,
  GetClassSchedulesParams,
} from './class-schedule.dto';

export const classScheduleApi = {
  async list(params?: GetClassSchedulesParams): Promise<PageResponse<ClassScheduleResponse>> {
    const response = await javaApi.get<PageResponse<ClassScheduleResponse>>('/class-schedules', { params });
    return response.data;
  },

  async getList(params?: GetClassSchedulesParams): Promise<PageResponse<ClassScheduleSimpleResponse>> {
    const response = await javaApi.get<PageResponse<ClassScheduleSimpleResponse>>('/class-schedules', { params });
    return response.data;
  },

  async getDetail(scheduleId: string): Promise<ClassScheduleDetail> {
    const response = await javaApi.get<ClassScheduleDetail>(`/class-schedules/${scheduleId}`);
    return response.data;
  },

  async create(request: ClassScheduleCreateRequest): Promise<ClassScheduleDetail> {
    const response = await javaApi.post<ClassScheduleDetail>('/class-schedules', request);
    return response.data;
  },

  async update(scheduleId: string, request: ClassScheduleUpdateRequest): Promise<ClassScheduleDetail> {
    const response = await javaApi.put<ClassScheduleDetail>(`/class-schedules/${scheduleId}`, request);
    return response.data;
  },

  async remove(scheduleId: string): Promise<void> {
    await javaApi.delete(`/class-schedules/${scheduleId}`);
  },
};
