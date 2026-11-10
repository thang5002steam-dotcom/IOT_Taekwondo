import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { usePermissions } from '@/features/authorization';
import { coachTimesheetApi } from '@/features/coach-timesheet/api/coachTimesheetApi';
import { sessionAttendanceApi } from '@/features/session-attendance/api/sessionAttendanceApi';

import { getMockHistoryRecords } from '../data/history.mock';
import type { AttendanceHistoryMode } from '../domain/historyAccess';

import {
  determineFilterStrategy,
  type FilterStrategy,
} from '../domain/historyFilterStrategy';

import {
  mapCoachTimesheetToHistoryRecord,
  mapStudentAttendanceToHistoryRecord,
  type HistoryRecordViewModel,
} from '../domain/historyMappers';

import {
  filterHistoryRecords,
  getHistoryFilterDateRange,
} from '../screens/AttendanceHistoryScreen/historyFilter.logic';

import type { HistoryFilterState } from '../screens/AttendanceHistoryScreen/historyFilter.types';
import type { HistoryDateRange } from '../domain/historyDateRange';

export type UseAttendanceHistoryQueryParams = {
  mode: AttendanceHistoryMode;
  filters: HistoryFilterState;
  courseId?: string;
  dateRangeOverride?: HistoryDateRange;
  enabled?: boolean;
};

export type UseAttendanceHistoryQueryResult = {
  records: HistoryRecordViewModel[];
  isLoading: boolean;
  isError: boolean;
  strategy: FilterStrategy;
  refetch: () => void;
};

export function useAttendanceHistoryQuery({
  mode,
  filters,
  courseId,
  dateRangeOverride,
  enabled = true,
}: UseAttendanceHistoryQueryParams): UseAttendanceHistoryQueryResult {
  const permissions = usePermissions();

  const permissionStrategy = useMemo(
    () => determineFilterStrategy({ mode, permissions }),
    [mode, permissions],
  );
  const strategy = courseId ? 'server-filter' : permissionStrategy;

  const dateRange = useMemo(
    () => dateRangeOverride ?? getHistoryFilterDateRange(filters),
    [dateRangeOverride, filters],
  );

  // Fallback / initial mock base records if API returns empty during dev
  const baseMockRecords = useMemo(() => getMockHistoryRecords(mode), [mode]);

  const queryKey = useMemo(() => {
    if (courseId) {
      return ['session-attendances', 'course', courseId, dateRange, filters];
    }
    if (strategy === 'client-filter') {
      return [
        mode === 'student' ? 'session-attendances' : 'coach-timesheets',
        'client-all',
        dateRange,
      ];
    }
    return [
      mode === 'student' ? 'session-attendances' : 'coach-timesheets',
      'server-filter',
      filters,
    ];
  }, [courseId, dateRange, mode, strategy, filters]);

  const queryFn = async (): Promise<HistoryRecordViewModel[]> => {
    if (mode === 'student') {
      if (courseId) {
        const res = await sessionAttendanceApi.list({
          from: dateRange?.from,
          to: dateRange?.to,
          courseId,
          page: 0,
          size: 50,
        });

        return (res?.content ?? []).map((item) =>
          mapStudentAttendanceToHistoryRecord(item, {
            branchLabel: 'Cơ sở 2',
            shiftLabel: 'Ca 1',
          }),
        );
      }

      if (strategy === 'client-filter') {
        const res = await sessionAttendanceApi.list({
          from: dateRange?.from,
          to: dateRange?.to,
          page: 0,
          size: 50,
        });
        if (res?.content && res.content.length > 0) {
          return res.content.map((item) =>
            mapStudentAttendanceToHistoryRecord(item, {
              branchLabel: 'Cơ sở 2',
              shiftLabel: 'Ca 1',
            }),
          );
        }
        return baseMockRecords;
      }

      // Server filter mode
      const res = await sessionAttendanceApi.list({
        from: dateRange?.from,
        to: dateRange?.to,
        branchId:
          filters.branchIds.length === 1 ? filters.branchIds[0] : undefined,
        weekday:
          filters.weekdays.length === 1 ? filters.weekdays[0] : undefined,
        scheduleLevel:
          filters.scheduleLevels.length === 1
            ? filters.scheduleLevels[0]
            : undefined,
        location:
          filters.locations.length === 1 ? filters.locations[0] : undefined,
        page: 0,
        size: 50,
      });

      if (res?.content && res.content.length > 0) {
        return res.content.map((item) =>
          mapStudentAttendanceToHistoryRecord(item, {
            branchLabel: 'Cơ sở 2',
            shiftLabel: 'Ca 1',
          }),
        );
      }
      return baseMockRecords;
    }

    // Coach mode
    if (strategy === 'client-filter') {
      const res = await coachTimesheetApi.list({ from: '', to: '' });
      if (res?.content && res.content.length > 0) {
        return res.content.map((item) =>
          mapCoachTimesheetToHistoryRecord(item, {
            branchLabel: 'Cơ sở 2',
            shiftLabel: 'Ca 1',
          }),
        );
      }
      return baseMockRecords;
    }

    // Coach server-filter mode
    const res = await coachTimesheetApi.list({
      from: dateRange?.from ?? '',
      to: dateRange?.to ?? '',
      page: 0,
      size: 50,
    });

    if (res?.content && res.content.length > 0) {
      return res.content.map((item) =>
        mapCoachTimesheetToHistoryRecord(item, {
          branchLabel: 'Cơ sở 2',
          shiftLabel: 'Ca 1',
        }),
      );
    }
    return baseMockRecords;
  };

  const query = useQuery({
    queryKey,
    queryFn,
    enabled,
    staleTime: 30_000,
  });

  const rawRecords = query.data ?? [];

  const visibleRecords = useMemo(() => {
    if (!enabled) return [];
    // Apply filterHistoryRecords to filter by client UI parameters (year, quarter, branch, shift)
    return filterHistoryRecords(rawRecords, filters);
  }, [rawRecords, filters, enabled]);

  return {
    records: visibleRecords,
    isLoading: query.isLoading,
    isError: query.isError,
    strategy,
    refetch: query.refetch,
  };
}
