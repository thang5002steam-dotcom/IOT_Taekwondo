import { javaApi } from '@/infrastructure/http/httpClient';
import type { PageResponse } from '@/infrastructure/http/pagination.types';

import type {
  LeaveRequestCreateRequest,
  LeaveRequestListParams,
  LeaveRequestResponse,
  LeaveRequestSimpleResponse,
  LeaveRequestReviewCommand,
  StudentLeaveRequestCreateRequest,
} from './leave-request.dto';

export const leaveRequestApi = {
  async list(params?: LeaveRequestListParams): Promise<PageResponse<LeaveRequestSimpleResponse>> {
    const response = await javaApi.get<PageResponse<LeaveRequestSimpleResponse>>('/leave-requests', { params });
    return response.data;
  },
  async get(leaveRequestId: string): Promise<LeaveRequestResponse> {
    const response = await javaApi.get<LeaveRequestResponse>(`/leave-requests/${leaveRequestId}`);
    return response.data;
  },
  async create(request: LeaveRequestCreateRequest): Promise<LeaveRequestResponse> {
    const response = await javaApi.post<LeaveRequestResponse>('/leave-requests', request);
    return response.data;
  },
  async createStudent(request: StudentLeaveRequestCreateRequest): Promise<LeaveRequestResponse> {
    const response = await javaApi.post<LeaveRequestResponse>('/leave-requests/student', request);
    return response.data;
  },
  async approve(leaveRequestId: string, command?: LeaveRequestReviewCommand): Promise<LeaveRequestResponse> {
    const response = await javaApi.post<LeaveRequestResponse>(
      `/leave-requests/${leaveRequestId}/approve`,
      command,
    );
    return response.data;
  },
  async reject(leaveRequestId: string, command?: LeaveRequestReviewCommand): Promise<LeaveRequestResponse> {
    const response = await javaApi.post<LeaveRequestResponse>(
      `/leave-requests/${leaveRequestId}/reject`,
      command,
    );
    return response.data;
  },
  async cancel(leaveRequestId: string): Promise<LeaveRequestResponse> {
    const response = await javaApi.post<LeaveRequestResponse>(`/leave-requests/${leaveRequestId}/cancel`);
    return response.data;
  },
};
