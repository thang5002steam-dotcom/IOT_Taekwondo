import { javaApi } from '@/infrastructure/http/httpClient';

import type {
  CoachTimesheetCreateRequest,
  CoachTimesheetFilterRequest,
  CoachTimesheetListResponse,
  CoachTimesheetResponse,
  CoachTimesheetUpdateRequest,
} from './coach-timesheet.dto';

export const coachTimesheetApi = {
  async list(params: CoachTimesheetFilterRequest): Promise<CoachTimesheetListResponse> {
    const response = await javaApi.get<CoachTimesheetListResponse>('/coach-timesheets', { params });
    return response.data;
  },
  async get(timesheetId: string): Promise<CoachTimesheetResponse> {
    const response = await javaApi.get<CoachTimesheetResponse>(`/coach-timesheets/${timesheetId}`);
    return response.data;
  },
  async create(request: CoachTimesheetCreateRequest): Promise<CoachTimesheetResponse> {
    const response = await javaApi.post<CoachTimesheetResponse>('/coach-timesheets', request);
    return response.data;
  },
  async update(timesheetId: string, request: CoachTimesheetUpdateRequest): Promise<CoachTimesheetResponse> {
    const response = await javaApi.put<CoachTimesheetResponse>(`/coach-timesheets/${timesheetId}`, request);
    return response.data;
  },
  async remove(timesheetId: string): Promise<void> {
    await javaApi.delete(`/coach-timesheets/${timesheetId}`);
  },
};
