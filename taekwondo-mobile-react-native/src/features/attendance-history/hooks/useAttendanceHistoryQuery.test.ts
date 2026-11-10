/* eslint-disable react/display-name */
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { useAttendanceHistoryQuery } from './useAttendanceHistoryQuery';
import { emptyHistoryFilters } from '../screens/AttendanceHistoryScreen/historyFilter.logic';
import { sessionAttendanceApi } from '@/features/session-attendance/api/sessionAttendanceApi';

// Mock authorization
jest.mock('@/features/authorization', () => ({
  usePermissions: jest.fn(() => ['SESSION_ATTENDANCE_READ', 'COACH_TIMESHEET_READ']),
  hasPermission: jest.fn((perms, p) => perms?.includes(p)),
  Permission: {
    SESSION_ATTENDANCE_READ: 'SESSION_ATTENDANCE_READ',
    SESSION_ATTENDANCE_UPDATE: 'SESSION_ATTENDANCE_UPDATE',
    SESSION_ATTENDANCE_DELETE: 'SESSION_ATTENDANCE_DELETE',
    COACH_TIMESHEET_READ: 'COACH_TIMESHEET_READ',
    COACH_TIMESHEET_UPDATE: 'COACH_TIMESHEET_UPDATE',
    COACH_TIMESHEET_DELETE: 'COACH_TIMESHEET_DELETE',
  },
}));

// Mock APIs
jest.mock('@/features/session-attendance/api/sessionAttendanceApi', () => ({
  sessionAttendanceApi: {
    list: jest.fn().mockResolvedValue({ content: [], totalElements: 0 }),
  },
}));

jest.mock('@/features/coach-timesheet/api/coachTimesheetApi', () => ({
  coachTimesheetApi: {
    list: jest.fn().mockResolvedValue({ content: [], totalElements: 0 }),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useAttendanceHistoryQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns client-filter strategy when user has only READ permission', async () => {
    const rendered = renderHook(
      () =>
        useAttendanceHistoryQuery({
          mode: 'student',
          filters: { ...emptyHistoryFilters, year: 2026, quarter: 1 },
          enabled: true,
        }),
      { wrapper: createWrapper() },
    );

    const { result } = await rendered;

    expect(result.current.strategy).toBe('client-filter');
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(sessionAttendanceApi.list).toHaveBeenCalledWith({
      from: '2026-01-01',
      to: '2026-03-31',
      page: 0,
      size: 50,
    });
    expect(result.current.records).toBeDefined();
  });

  it('filters student attendance by courseId when course history mode is used', async () => {
    const rendered = renderHook(
      () =>
        useAttendanceHistoryQuery({
          mode: 'student',
          courseId: 'course-1',
          dateRangeOverride: { from: '2026-04-01', to: '2026-06-30' },
          filters: emptyHistoryFilters,
          enabled: true,
        }),
      { wrapper: createWrapper() },
    );

    const { result } = await rendered;

    expect(result.current.strategy).toBe('server-filter');
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(sessionAttendanceApi.list).toHaveBeenCalledWith({
      from: '2026-04-01',
      to: '2026-06-30',
      courseId: 'course-1',
      page: 0,
      size: 50,
    });
    expect(result.current.records).toEqual([]);
  });
});
