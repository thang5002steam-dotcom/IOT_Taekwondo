import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import type { ClassSessionEvaluationResponse } from '../api/session-attendance.dto';
import { sessionAttendanceApi } from '../api/sessionAttendanceApi';
import type {
  AttendanceStatus,
  EvaluationStatus,
} from '../constants/session-attendance.constants';
import { calculateAttendanceProgress } from '../domain/attendanceProgress';

export const sessionAttendanceKeys = {
  evaluation: (classSessionId?: string) =>
    ['session-evaluation', classSessionId ?? ''] as const,
};

type UseSessionAttendanceOptions = {
  classSessionId?: string;
  onUpdateError: () => void;
};

export function useSessionAttendance({
  classSessionId,
  onUpdateError,
}: UseSessionAttendanceOptions) {
  const queryClient = useQueryClient();
  const queryKey = sessionAttendanceKeys.evaluation(classSessionId);
  const query = useQuery<ClassSessionEvaluationResponse>({
    queryKey,
    queryFn: () => sessionAttendanceApi.getEvaluation(classSessionId as string),
    enabled: Boolean(classSessionId),
  });
  const students = useMemo(() => query.data?.students ?? [], [query.data?.students]);
  const stats = useMemo(() => calculateAttendanceProgress(students), [students]);

  const updateAttendanceStatus = useCallback(
    async (studentEnrollmentId: string, newStatus: AttendanceStatus) => {
      if (!classSessionId) return;
      const previousData =
        queryClient.getQueryData<ClassSessionEvaluationResponse>(queryKey);
      const targetStudent = previousData?.students.find(
        ({ studentEnrollment }) =>
          studentEnrollment.studentEnrollmentId === studentEnrollmentId,
      );
      if (!previousData || !targetStudent) return;

      const previousAttendance = targetStudent.attendance;
      const checkInTime = new Date().toISOString();
      queryClient.setQueryData<ClassSessionEvaluationResponse>(queryKey, (current) =>
        current
          ? {
              ...current,
              students: current.students.map((item) =>
                item.studentEnrollment.studentEnrollmentId === studentEnrollmentId
                  ? {
                      ...item,
                      attendance: {
                        sessionAttendanceId:
                          previousAttendance?.sessionAttendanceId ?? '',
                        checkInTime: previousAttendance?.checkInTime ?? checkInTime,
                        attendanceStatus: newStatus,
                        evaluationStatus:
                          previousAttendance?.evaluationStatus ?? 'PENDING',
                        note: previousAttendance?.note ?? '',
                      },
                      recorded: true,
                    }
                  : item,
              ),
            }
          : current,
      );

      try {
        if (previousAttendance?.sessionAttendanceId) {
          await sessionAttendanceApi.updateStatus(
            previousAttendance.sessionAttendanceId,
            { attendanceStatus: newStatus, checkInTime },
          );
          return;
        }

        const created = await sessionAttendanceApi.create({
          classSessionId,
          studentEnrollmentId,
          attendanceStatus: newStatus,
          evaluationStatus: 'PENDING',
          checkInTime,
          note: '',
        });
        queryClient.setQueryData<ClassSessionEvaluationResponse>(queryKey, (current) =>
          current
            ? {
                ...current,
                students: current.students.map((item) =>
                  item.studentEnrollment.studentEnrollmentId === studentEnrollmentId
                    ? {
                        ...item,
                        attendance: {
                          sessionAttendanceId: created.sessionAttendanceId,
                          checkInTime: created.checkInTime,
                          attendanceStatus: created.attendanceStatus,
                          evaluationStatus: created.evaluationStatus,
                          note: created.note,
                        },
                        recorded: true,
                      }
                    : item,
                ),
              }
            : current,
        );
      } catch {
        queryClient.setQueryData(queryKey, previousData);
        onUpdateError();
      }
    },
    [classSessionId, onUpdateError, queryClient, queryKey],
  );

  const updateEvaluationStatus = useCallback(
    async (studentEnrollmentId: string, newStatus: EvaluationStatus) => {
      if (!classSessionId) return;
      const previousData =
        queryClient.getQueryData<ClassSessionEvaluationResponse>(queryKey);
      const targetStudent = previousData?.students.find(
        ({ studentEnrollment }) =>
          studentEnrollment.studentEnrollmentId === studentEnrollmentId,
      );
      if (!previousData || !targetStudent) return;

      const previousAttendance = targetStudent.attendance;
      const checkInTime = new Date().toISOString();
      queryClient.setQueryData<ClassSessionEvaluationResponse>(queryKey, (current) =>
        current
          ? {
              ...current,
              students: current.students.map((item) =>
                item.studentEnrollment.studentEnrollmentId === studentEnrollmentId
                  ? {
                      ...item,
                      attendance: {
                        sessionAttendanceId:
                          previousAttendance?.sessionAttendanceId ?? '',
                        checkInTime: previousAttendance?.checkInTime ?? checkInTime,
                        attendanceStatus:
                          previousAttendance?.attendanceStatus ?? 'PRESENT',
                        evaluationStatus: newStatus,
                        note: previousAttendance?.note ?? '',
                      },
                      recorded: true,
                    }
                  : item,
              ),
            }
          : current,
      );

      try {
        if (previousAttendance?.sessionAttendanceId) {
          await sessionAttendanceApi.updateEvaluation(
            previousAttendance.sessionAttendanceId,
            { evaluationStatus: newStatus },
          );
          return;
        }

        const created = await sessionAttendanceApi.create({
          classSessionId,
          studentEnrollmentId,
          attendanceStatus: 'PRESENT',
          evaluationStatus: newStatus,
          checkInTime,
          note: '',
        });
        queryClient.setQueryData<ClassSessionEvaluationResponse>(queryKey, (current) =>
          current
            ? {
                ...current,
                students: current.students.map((item) =>
                  item.studentEnrollment.studentEnrollmentId === studentEnrollmentId
                    ? {
                        ...item,
                        attendance: {
                          sessionAttendanceId: created.sessionAttendanceId,
                          checkInTime: created.checkInTime,
                          attendanceStatus: created.attendanceStatus,
                          evaluationStatus: created.evaluationStatus,
                          note: created.note,
                        },
                        recorded: true,
                      }
                    : item,
                ),
              }
            : current,
        );
      } catch {
        queryClient.setQueryData(queryKey, previousData);
        onUpdateError();
      }
    },
    [classSessionId, onUpdateError, queryClient, queryKey],
  );

  return {
    ...query,
    students,
    stats,
    updateAttendanceStatus,
    updateEvaluationStatus,
  };
}
