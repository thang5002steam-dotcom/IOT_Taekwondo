import { javaApi } from '@/infrastructure/http/httpClient';
import type {
  EnrollmentScheduleChangeRequestCreateRequest,
  EnrollmentScheduleChangeRequestResponse,
  EnrollmentScheduleChangeRequestReviewRequest,
  EnrollmentScheduleChangeScheduleOption,
} from './enrollmentScheduleChangeRequest.dto';

const basePath = '/enrollment-schedule-change-requests';

export const enrollmentScheduleChangeRequestApi = {
  async options(currentScheduleId: string, effectiveFrom: string): Promise<EnrollmentScheduleChangeScheduleOption[]> {
    return (await javaApi.get<EnrollmentScheduleChangeScheduleOption[]>(`${basePath}/options`, {
      params: { currentScheduleId, effectiveFrom },
    })).data;
  },
  async create(request: EnrollmentScheduleChangeRequestCreateRequest): Promise<EnrollmentScheduleChangeRequestResponse> {
    return (await javaApi.post<EnrollmentScheduleChangeRequestResponse>(basePath, request)).data;
  },
  async approve(requestId: string, request?: EnrollmentScheduleChangeRequestReviewRequest): Promise<EnrollmentScheduleChangeRequestResponse> {
    return (await javaApi.post<EnrollmentScheduleChangeRequestResponse>(`${basePath}/${requestId}/approve`, request ?? {})).data;
  },
  async reject(requestId: string, request?: EnrollmentScheduleChangeRequestReviewRequest): Promise<EnrollmentScheduleChangeRequestResponse> {
    return (await javaApi.post<EnrollmentScheduleChangeRequestResponse>(`${basePath}/${requestId}/reject`, request ?? {})).data;
  },
};
