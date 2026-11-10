import { javaApi } from '@/infrastructure/http/httpClient';
import type { StudentEnrollmentScheduleResponse, StudentEnrollmentScheduleSimpleResponse } from './studentEnrollmentSchedule.dto';

export const studentEnrollmentScheduleApi = {
  async list(studentEnrollmentId: string): Promise<StudentEnrollmentScheduleSimpleResponse[]> {
    return (await javaApi.get<StudentEnrollmentScheduleSimpleResponse[]>('/student-enrollment-schedules', { params: { studentEnrollmentId } })).data;
  },
  async get(id: string): Promise<StudentEnrollmentScheduleResponse> {
    return (await javaApi.get<StudentEnrollmentScheduleResponse>(`/student-enrollment-schedules/${id}`)).data;
  },
};
