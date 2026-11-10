import { javaApi } from "@/infrastructure/http/httpClient";
import type { PageResponse } from "@/infrastructure/http/pagination.types";

import type {
  CourseCreateRequest,
  CourseListParams,
  CourseResponse,
  CourseSimpleResponse,
  CourseScheduleResponse,
  CourseScheduleUpsertRequest,
  CourseUpdateRequest,
} from "./course.dto";

export const courseApi = {
  async list(params?: CourseListParams): Promise<PageResponse<CourseSimpleResponse>> {
    const response = await javaApi.get<PageResponse<CourseSimpleResponse>>(
      "/courses",
      { params },
    );
    return response.data;
  },
  async get(courseId: string): Promise<CourseResponse> {
    const response = await javaApi.get<CourseResponse>(`/courses/${courseId}`);
    return response.data;
  },
  async create(
    request: CourseCreateRequest,
    options?: { signal?: AbortSignal },
  ): Promise<CourseResponse> {
    const response = await javaApi.post<CourseResponse>("/courses", request, {
      signal: options?.signal,
    });
    return response.data;
  },
  async update(
    courseId: string,
    request: CourseUpdateRequest,
    options?: { signal?: AbortSignal },
  ): Promise<CourseResponse> {
    const response = await javaApi.put<CourseResponse>(
      `/courses/${courseId}`,
      request,
      { signal: options?.signal },
    );
    return response.data;
  },
  async addSchedule(
    courseId: string,
    request: CourseScheduleUpsertRequest,
  ): Promise<CourseScheduleResponse> {
    const response = await javaApi.post<CourseScheduleResponse>(
      "/course-schedules",
      { courseId, ...request },
    );
    return response.data;
  },
  async updateSchedule(
    courseScheduleId: string,
    request: CourseScheduleUpsertRequest,
    options?: { signal?: AbortSignal },
  ): Promise<CourseScheduleResponse> {
    const response = await javaApi.put<CourseScheduleResponse>(
      `/course-schedules/${courseScheduleId}`,
      request,
      { signal: options?.signal },
    );
    return response.data;
  },
  async removeSchedule(
    courseScheduleId: string,
    options?: { signal?: AbortSignal },
  ): Promise<void> {
    await javaApi.delete(`/course-schedules/${courseScheduleId}`, {
      signal: options?.signal,
    });
  },
  async remove(
    courseId: string,
    options?: { signal?: AbortSignal },
  ): Promise<void> {
    await javaApi.delete(`/courses/${courseId}`, { signal: options?.signal });
  },
};
