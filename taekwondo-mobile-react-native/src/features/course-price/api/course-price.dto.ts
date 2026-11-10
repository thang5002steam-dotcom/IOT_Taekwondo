import type { CourseResponse, CourseSimpleResponse } from '@/features/course/api/course.dto';
import type { CoursePriceStatus } from '../constants/course-price.constants';

export interface CoursePriceCreateRequest {
  courseId: string;
  durationMonths: number;
  sessionCount: number;
  basePrice: number;
  finalPrice: number;
  status: CoursePriceStatus;
}

export type CoursePriceUpdateRequest = CoursePriceCreateRequest;

export interface CoursePriceResponse {
  coursePriceId: string;
  course?: CourseResponse;
  durationMonths: number;
  sessionCount: number;
  basePrice: number;
  finalPrice: number;
  status: CoursePriceStatus;
}

export interface CoursePriceSimpleResponse {
  coursePriceId: string;
  course?: CourseSimpleResponse;
  durationMonths: number;
  sessionCount: number;
  basePrice?: number;
  finalPrice: number;
  status: CoursePriceStatus;
}

export interface CoursePriceListParams {
  courseId?: string;
  status?: CoursePriceStatus;
  page?: number;
  size?: number;
  sort?: string | string[];
}
