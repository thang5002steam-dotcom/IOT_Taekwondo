import type {
  CoursePriceResponse,
  CoursePriceSimpleResponse,
} from '../api/course-price.dto';
import { CoursePriceStatusLabel } from '../constants/course-price.constants';
import type { CoursePriceItemView } from './course-price.types';

export function mapCoursePriceToView(
  item: CoursePriceSimpleResponse | CoursePriceResponse,
): CoursePriceItemView {
  const durationMonths = Math.max(item.durationMonths, 1);
  const monthlyPrice = Math.round(item.finalPrice / durationMonths);

  return {
    id: item.coursePriceId,
    courseId: item.course?.courseId,
    courseName: item.course?.name,
    durationMonths: item.durationMonths,
    durationLabel: `${item.durationMonths} tháng`,
    sessionCount: item.sessionCount,
    sessionsLabel: `${item.sessionCount} buổi`,
    basePrice: item.basePrice,
    finalPrice: item.finalPrice,
    monthlyPrice,
    status: item.status,
    statusLabel: CoursePriceStatusLabel[item.status] ?? item.status,
  };
}
