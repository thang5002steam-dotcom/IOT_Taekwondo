export type { CourseStaffAssignmentResponse as CourseStaffAssignment } from './api/course-staff-assignment.dto';
export type {
  CourseStaffAssignmentCreateRequest,
  CourseStaffAssignmentListParams,
  CourseStaffAssignmentResponse,
  CourseStaffAssignmentUpdateRequest,
} from './api/course-staff-assignment.dto';
export {
  useCourseScheduleStaffAssignments,
  useCourseStaffAssignmentDetail,
  useCreateCourseScheduleStaffAssignment,
  useDeleteCourseScheduleStaffAssignment,
  useEndCourseScheduleStaffAssignment,
  useStaffAssignmentCandidates,
  useUpdateCourseScheduleStaffAssignment,
} from './queries/courseStaffAssignmentQueries';
