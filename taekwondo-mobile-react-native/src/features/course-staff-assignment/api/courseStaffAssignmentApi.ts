import { javaApi } from '@/infrastructure/http/httpClient';

import type {
  CourseStaffAssignmentCreateRequest,
  CourseStaffAssignmentListParams,
  CourseStaffAssignmentListResponse,
  CourseStaffAssignmentResponse,
  CourseStaffAssignmentUpdateRequest,
} from './course-staff-assignment.dto';

export const courseStaffAssignmentApi = {
  async list(params?: CourseStaffAssignmentListParams): Promise<CourseStaffAssignmentListResponse> {
    const response = await javaApi.get<CourseStaffAssignmentListResponse>(
      '/course-staff-assignments',
      { params },
    );
    return response.data;
  },
  async get(courseStaffAssignmentId: string): Promise<CourseStaffAssignmentResponse> {
    const response = await javaApi.get<CourseStaffAssignmentResponse>(
      `/course-staff-assignments/${courseStaffAssignmentId}`,
    );
    return response.data;
  },
  async create(
    request: CourseStaffAssignmentCreateRequest,
    options?: { signal?: AbortSignal },
  ): Promise<CourseStaffAssignmentResponse> {
    const response = await javaApi.post<CourseStaffAssignmentResponse>(
      '/course-staff-assignments',
      request,
      { signal: options?.signal },
    );
    return response.data;
  },
  async update(
    courseStaffAssignmentId: string,
    request: CourseStaffAssignmentUpdateRequest,
  ): Promise<CourseStaffAssignmentResponse> {
    const response = await javaApi.put<CourseStaffAssignmentResponse>(
      `/course-staff-assignments/${courseStaffAssignmentId}`,
      request,
    );
    return response.data;
  },
  async end(courseStaffAssignmentId: string): Promise<CourseStaffAssignmentResponse> {
    const response = await javaApi.put<CourseStaffAssignmentResponse>(
      `/course-staff-assignments/${courseStaffAssignmentId}/end`,
    );
    return response.data;
  },
  async remove(courseStaffAssignmentId: string): Promise<void> {
    await javaApi.delete(`/course-staff-assignments/${courseStaffAssignmentId}`);
  },
};
