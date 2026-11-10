import { javaApi } from '@/infrastructure/http/httpClient';
import type { PageResponse } from '@/infrastructure/http/pagination.types';

import type {
  ClassSessionCalendarParams,
  ClassSessionCalendarResponse,
  ClassSessionFilterParams,
  ReopenAttendanceRequest,
  SessionCreateRequest,
  SessionResponse,
  SessionSimpleResponse,
  SessionUpdateRequest,
} from './class-session.dto';

export const classSessionApi = {
  async list(params?: ClassSessionFilterParams): Promise<PageResponse<SessionSimpleResponse>> {
    return classSessionApi.getList(params);
  },
  async get(sessionId: string): Promise<SessionResponse> {
    return classSessionApi.getDetail(sessionId);
  },
  async getList(params?: ClassSessionFilterParams): Promise<PageResponse<SessionSimpleResponse>> {
    const response = await javaApi.get<PageResponse<SessionSimpleResponse>>('/class-sessions', { params });
    return response.data;
  },
  async getCalendar(params: ClassSessionCalendarParams): Promise<ClassSessionCalendarResponse[]> {
    const response = await javaApi.get<ClassSessionCalendarResponse[]>('/class-sessions/calendar', {
      params,
    });
    return response.data;
  },
  async getDetail(sessionId: string): Promise<SessionResponse> {
    const response = await javaApi.get<SessionResponse>(`/class-sessions/${sessionId}`);
    return response.data;
  },
  async create(request: SessionCreateRequest): Promise<SessionResponse> {
    const response = await javaApi.post<SessionResponse>('/class-sessions', request);
    return response.data;
  },
  async update(sessionId: string, request: SessionUpdateRequest): Promise<SessionResponse> {
    const response = await javaApi.put<SessionResponse>(`/class-sessions/${sessionId}`, request);
    return response.data;
  },
  async reopenAttendance(sessionId: string, request: ReopenAttendanceRequest): Promise<SessionResponse> {
    const response = await javaApi.post<SessionResponse>(
      `/class-sessions/${sessionId}/attendance-reopen`,
      request,
    );
    return response.data;
  },
  async remove(sessionId: string): Promise<void> {
    await javaApi.delete(`/class-sessions/${sessionId}`);
  },
};
