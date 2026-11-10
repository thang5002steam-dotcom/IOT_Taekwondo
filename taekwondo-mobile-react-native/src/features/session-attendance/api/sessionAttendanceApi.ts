import { javaApi } from '@/infrastructure/http/httpClient';

import type {
  AttendanceFilterParams,
  ClassSessionEvaluationResponse,
  SessionAttendanceCreateRequest,
  SessionAttendanceListResponse,
  SessionAttendanceResponse,
  SessionAttendanceUpdateRequest,
  UpdateEvaluationRequest,
  UpdateStatusRequest,
} from './session-attendance.dto';

export const sessionAttendanceApi = {
  async list(params?: AttendanceFilterParams): Promise<SessionAttendanceListResponse> {
    const response = await javaApi.get<SessionAttendanceListResponse>('/session-attendances', { params });
    return response.data;
  },
  async get(sessionAttendanceId: string): Promise<SessionAttendanceResponse> {
    const response = await javaApi.get<SessionAttendanceResponse>(`/session-attendances/${sessionAttendanceId}`);
    return response.data;
  },
  async create(request: SessionAttendanceCreateRequest): Promise<SessionAttendanceResponse> {
    const response = await javaApi.post<SessionAttendanceResponse>('/session-attendances', request);
    return response.data;
  },
  async update(
    sessionAttendanceId: string,
    request: SessionAttendanceUpdateRequest,
  ): Promise<SessionAttendanceResponse> {
    const response = await javaApi.put<SessionAttendanceResponse>(
      `/session-attendances/${sessionAttendanceId}`,
      request,
    );
    return response.data;
  },
  async remove(sessionAttendanceId: string): Promise<void> {
    await javaApi.delete(`/session-attendances/${sessionAttendanceId}`);
  },
  async getEvaluation(classSessionId: string): Promise<ClassSessionEvaluationResponse> {
    const response = await javaApi.get<ClassSessionEvaluationResponse>(
      `/class-sessions/${classSessionId}/evaluation`,
    );
    return response.data;
  },
  async updateStatus(
    sessionAttendanceId: string,
    request: UpdateStatusRequest,
  ): Promise<void> {
    await javaApi.patch(
      `/session-attendances/${sessionAttendanceId}/status`,
      request,
    );
  },
  async updateEvaluation(
    sessionAttendanceId: string,
    request: UpdateEvaluationRequest,
  ): Promise<void> {
    await javaApi.patch(
      `/session-attendances/${sessionAttendanceId}/evaluation`,
      request,
    );
  },
};

export const studentAttendanceApi = sessionAttendanceApi;
