import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { enrollmentScheduleChangeRequestApi } from '../api/enrollmentScheduleChangeRequestApi';
import type {
  EnrollmentScheduleChangeRequestCreateRequest,
  EnrollmentScheduleChangeRequestReviewRequest,
} from '../api/enrollmentScheduleChangeRequest.dto';

const invalidateEnrollmentSchedules = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: ['student-enrollment-schedules'] });

export function useEnrollmentScheduleChangeOptions(currentScheduleId?: string, effectiveFrom?: string) {
  return useQuery({
    queryKey: ['enrollment-schedule-change-options', currentScheduleId ?? '', effectiveFrom ?? ''],
    queryFn: () => enrollmentScheduleChangeRequestApi.options(currentScheduleId!, effectiveFrom!),
    enabled: Boolean(currentScheduleId && effectiveFrom),
    staleTime: 30_000,
  });
}

export function useCreateEnrollmentScheduleChangeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: EnrollmentScheduleChangeRequestCreateRequest) => enrollmentScheduleChangeRequestApi.create(request),
    onSuccess: () => invalidateEnrollmentSchedules(queryClient),
  });
}

export function useApproveEnrollmentScheduleChangeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, request }: { requestId: string; request?: EnrollmentScheduleChangeRequestReviewRequest }) =>
      enrollmentScheduleChangeRequestApi.approve(requestId, request),
    onSuccess: () => invalidateEnrollmentSchedules(queryClient),
  });
}

export function useRejectEnrollmentScheduleChangeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, request }: { requestId: string; request?: EnrollmentScheduleChangeRequestReviewRequest }) =>
      enrollmentScheduleChangeRequestApi.reject(requestId, request),
    onSuccess: () => invalidateEnrollmentSchedules(queryClient),
  });
}
