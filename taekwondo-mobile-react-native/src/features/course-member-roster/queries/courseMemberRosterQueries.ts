import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { courseStaffAssignmentApi } from "@/features/course-staff-assignment/api/courseStaffAssignmentApi";
import type {
  CourseStaffAssignmentCreateRequest,
  CourseStaffAssignmentSimpleResponse,
} from "@/features/course-staff-assignment/api/course-staff-assignment.dto";
import { courseCatalogKeys } from "@/features/course/queries/courseCatalogQueries";
import { personApi } from "@/features/person/api/personApi";
import { studentEnrollmentApi } from "@/features/student-enrollment/api/studentEnrollmentApi";
import type { StudentEnrollmentSimpleResponse } from "@/features/student-enrollment/api/student-enrollment.dto";
import type { PageResponse } from "@/infrastructure/http/pagination.types";

import {
  courseMemberConfig,
  groupStaffAssignments,
  groupStudentEnrollments,
  type CourseMemberKind,
} from "../domain/courseMemberRoster";

const PAGE_SIZE = 20;
type RosterApiItem = CourseStaffAssignmentSimpleResponse | StudentEnrollmentSimpleResponse;
type RosterApiPage = PageResponse<RosterApiItem>;

export const courseMemberRosterKeys = {
  all: ["course-member-roster"] as const,
  list: (courseId: string, memberKind: CourseMemberKind, search: string) =>
    [...courseMemberRosterKeys.all, courseId, memberKind, search] as const,
};

export function getLocalDate() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date()).map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function useCourseMemberRoster(
  courseId: string,
  memberKind: CourseMemberKind,
  search: string,
) {
  const effectiveOn = getLocalDate();
  const query = useInfiniteQuery<RosterApiPage>({
    queryKey: courseMemberRosterKeys.list(courseId, memberKind, search),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      (memberKind === "students"
        ? studentEnrollmentApi.list({
            courseId,
            from: effectiveOn,
            to: effectiveOn,
            status: "ACTIVE",
            search: search || undefined,
            page: pageParam as number,
            size: PAGE_SIZE,
            sort: "studentPerson.fullName,asc",
          })
        : courseStaffAssignmentApi.list({
            courseId,
            assignmentTypes: courseMemberConfig[memberKind].assignmentTypes,
            effectiveOn,
            search: search || undefined,
            page: pageParam as number,
            size: PAGE_SIZE,
            sort: "staffPerson.fullName,asc",
          })) as Promise<RosterApiPage>,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.pageNumber + 1,
  });

  const rawItems = query.data?.pages.flatMap((page) => page.content) ?? [];
  const members = memberKind === "students"
    ? groupStudentEnrollments(rawItems as StudentEnrollmentSimpleResponse[])
    : groupStaffAssignments(rawItems as CourseStaffAssignmentSimpleResponse[]);

  return { ...query, members };
}

export function useStaffCandidates(search: string, enabled: boolean) {
  return useQuery({
    queryKey: ["course-member-roster", "staff-candidates", search],
    queryFn: () => personApi.list({
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

export function useCreateCourseStaffAssignment(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      request,
      signal,
    }: {
      request: CourseStaffAssignmentCreateRequest;
      signal?: AbortSignal;
    }) => courseStaffAssignmentApi.create(request, { signal }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: courseMemberRosterKeys.all }),
        queryClient.invalidateQueries({ queryKey: courseCatalogKeys.detail(courseId) }),
      ]);
    },
  });
}
