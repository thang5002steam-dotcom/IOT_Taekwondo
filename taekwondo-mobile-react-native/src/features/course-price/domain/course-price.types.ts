import type { CoursePriceStatus } from '../constants/course-price.constants';

export type { CoursePriceResponse as CoursePrice } from '../api/course-price.dto';

export interface CoursePriceItemView {
  id: string;
  courseId?: string;
  courseName?: string;
  durationMonths: number;
  durationLabel: string;
  sessionCount: number;
  sessionsLabel: string;
  basePrice?: number;
  finalPrice: number;
  monthlyPrice: number;
  status: CoursePriceStatus;
  statusLabel: string;
}
