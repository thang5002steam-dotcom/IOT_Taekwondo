import { useQuery } from '@tanstack/react-query';
import { classSessionApi } from '../api/classSessionApi';
import type { ClassSessionCalendarParams } from '../api/class-session.dto';

export const CLASS_SESSION_CALENDAR_QUERY_KEY = 'class-session-calendar';

export function useClassSessionCalendarQuery(params: ClassSessionCalendarParams, enabled: boolean = true) {
  return useQuery({
    queryKey: [CLASS_SESSION_CALENDAR_QUERY_KEY, params.fromDate, params.toDate],
    queryFn: () => classSessionApi.getCalendar(params),
    enabled: Boolean(params.fromDate && params.toDate && enabled),
    staleTime: 60 * 1000,
  });
}
