import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { courseCatalogKeys } from "@/features/course/queries/courseCatalogQueries";
import { personApi } from "@/features/person/api/personApi";

import { courseStaffAssignmentApi } from "../api/courseStaffAssignmentApi";
import type {
  CourseStaffAssignmentCreateRequest,
  CourseStaffAssignmentListResponse,
  CourseStaffAssignmentUpdateRequest,
} from "../api/course-staff-assignment.dto";

export const courseStaffAssignmentKeys = {
  all: ["course-staff-assignments"] as const,
  schedule: (courseScheduleId: string) =>
    [...courseStaffAssignmentKeys.all, "schedule", courseScheduleId] as const,
  detail: (assignmentId: string) =>
    [...courseStaffAssignmentKeys.all, "detail", assignmentId] as const,
  candidates: (search: string) =>
    [...courseStaffAssignmentKeys.all, "candidates", search] as const,
};

function useInvalidateAssignmentCaches(courseId: string) {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: courseStaffAssignmentKeys.all }),
      queryClient.invalidateQueries({ queryKey: courseCatalogKeys.detail(courseId) }),
      queryClient.invalidateQueries({ queryKey: ["course-member-roster"] }),
    ]);
  };
}

export function useCourseScheduleStaffAssignments(
  courseScheduleId: string | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: courseStaffAssignmentKeys.schedule(courseScheduleId ?? ""),
    queryFn: () =>
      courseStaffAssignmentApi.list({
        courseScheduleId: courseScheduleId as string,
        page: 0,
        size: 100,
        sort: "startDate,desc",
      }),
    enabled: enabled && Boolean(courseScheduleId),
  });
}

export function useCourseStaffAssignmentDetail(
  assignmentId: string | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: courseStaffAssignmentKeys.detail(assignmentId ?? ""),
    queryFn: () => courseStaffAssignmentApi.get(assignmentId as string),
    enabled: enabled && Boolean(assignmentId),
  });
}

export function useStaffAssignmentCandidates(search: string, enabled: boolean) {
  return useQuery({
    queryKey: courseStaffAssignmentKeys.candidates(search),
    queryFn: () =>
      personApi.list({
        search: search || undefined,
        status: "ACTIVE",
        isStudent: false,
        page: 0,
        size: 100,
        sort: "fullName,asc",
      }),
    enabled,
  });
}

export function useCreateCourseScheduleStaffAssignment(courseId: string) {
  const invalidate = useInvalidateAssignmentCaches(courseId);
  return useMutation({
    mutationFn: (request: CourseStaffAssignmentCreateRequest) =>
      courseStaffAssignmentApi.create(request),
    onSuccess: invalidate,
  });
}

export function useUpdateCourseScheduleStaffAssignment(courseId: string) {
  const invalidate = useInvalidateAssignmentCaches(courseId);
  return useMutation({
    mutationFn: ({ assignmentId, request }: {
      assignmentId: string;
      request: CourseStaffAssignmentUpdateRequest;
    }) => courseStaffAssignmentApi.update(assignmentId, request),
    onSuccess: invalidate,
  });
}

export function useEndCourseScheduleStaffAssignment(courseId: string) {
  const invalidate = useInvalidateAssignmentCaches(courseId);
  return useMutation({
    mutationFn: (assignmentId: string) => courseStaffAssignmentApi.end(assignmentId),
    onSuccess: invalidate,
  });
}

export function useDeleteCourseScheduleStaffAssignment(
  courseId: string,
  courseScheduleId: string,
) {
  const invalidate = useInvalidateAssignmentCaches(courseId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: string) => courseStaffAssignmentApi.remove(assignmentId),
    onSuccess: async (_data, assignmentId) => {
      queryClient.setQueryData<CourseStaffAssignmentListResponse>(
        courseStaffAssignmentKeys.schedule(courseScheduleId),
        (page) => {
          if (!page) return page;
          const content = page.content.filter(
            (assignment) => assignment.courseStaffAssignmentId !== assignmentId,
          );
          return {
            ...page,
            content,
            totalElements: Math.max(0, page.totalElements - (page.content.length - content.length)),
            empty: content.length === 0,
          };
        },
      );
      await invalidate();
    },
  });
}
