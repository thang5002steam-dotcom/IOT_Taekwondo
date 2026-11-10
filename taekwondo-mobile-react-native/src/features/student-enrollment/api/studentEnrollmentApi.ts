import { javaApi } from '@/infrastructure/http/httpClient';
import type { PageResponse } from '@/infrastructure/http/pagination.types';

import type {
  EnrollmentsByScheduleResponse,
  StudentEnrollmentCreateRequest,
  StudentEnrollmentListParams,
  StudentEnrollmentResponse,
  StudentEnrollmentSimpleResponse,
  StudentEnrollmentUpdateRequest,
} from './student-enrollment.dto';

export const studentEnrollmentApi = {
  async list(params?: StudentEnrollmentListParams): Promise<PageResponse<StudentEnrollmentSimpleResponse>> {
    const response = await javaApi.get<PageResponse<StudentEnrollmentSimpleResponse>>('/student-enrollments', { params });
    return response.data;
  },
  async get(enrollmentId: string): Promise<StudentEnrollmentResponse> {
    const response = await javaApi.get<StudentEnrollmentResponse>(`/student-enrollments/${enrollmentId}`);
    return response.data;
  },
  async create(request: StudentEnrollmentCreateRequest): Promise<unknown[]> {
    const response = await javaApi.post<unknown[]>('/student-enrollments', request);
    return response.data;
  },
  async update(enrollmentId: string, request: StudentEnrollmentUpdateRequest): Promise<string> {
    const response = await javaApi.put<string>(`/student-enrollments/${enrollmentId}`, request);
    return response.data;
  },
  async remove(enrollmentId: string): Promise<void> {
    await javaApi.delete(`/student-enrollments/${enrollmentId}`);
  },
  async getByStudent(studentCode: string): Promise<StudentEnrollmentSimpleResponse[]> {
    const response = await javaApi.get<StudentEnrollmentSimpleResponse[]>(`/student-enrollments/student/${studentCode}`);
    return response.data;
  },
  async getDetailedByStudent(studentCode: string): Promise<StudentEnrollmentResponse[]> {
    const response = await javaApi.get<StudentEnrollmentResponse[]>(`/student-enrollments/student/${studentCode}/detailed`);
    return response.data;
  },
  async getByClassSchedule(classScheduleId: string): Promise<EnrollmentsByScheduleResponse> {
    const response = await javaApi.get<EnrollmentsByScheduleResponse>(`/student-enrollments/class-schedule/${classScheduleId}`);
    return response.data;
  },
};
