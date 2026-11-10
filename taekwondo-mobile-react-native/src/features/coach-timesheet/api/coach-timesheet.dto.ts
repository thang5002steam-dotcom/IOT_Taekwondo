import type {
  SessionResponse,
  SessionSimpleResponse,
} from "@/features/class-session/api/class-session.dto";
import type {
  CourseStaffAssignmentResponse,
  CourseStaffAssignmentSimpleResponse,
} from "@/features/course-staff-assignment/api/course-staff-assignment.dto";
import type { PageResponse } from "@/infrastructure/http/pagination.types";

export interface AllowedActions {
  update: boolean;
  delete: boolean;
}

export interface CoachTimesheetCreateRequest {
  classSessionId: string;
  checkInTime: string;
  checkOutTime: string;
  note: string;
}

export interface CoachTimesheetUpdateRequest {
  checkInTime: string;
  checkOutTime: string;
  note: string;
}

export interface CoachTimesheetResponse {
  coachTimesheetId: string;
  courseStaffAssignment?: CourseStaffAssignmentResponse;
  courseStaffAssignmentId?: string;
  classSession?: SessionResponse;
  classSessionId?: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  note: string | null;
  allowedActions: AllowedActions;
  createdAt: string;
  updatedAt: string;
}

export interface CoachTimesheetSimpleResponse {
  coachTimesheetId: string;
  courseStaffAssignment: CourseStaffAssignmentSimpleResponse;
  classSession?: SessionSimpleResponse;
  checkInTime: string | null;
  checkOutTime: string | null;
  note: string | null;
  allowedActions: AllowedActions;
}

export interface CoachTimesheetFilterRequest {
  from: string;
  to: string;
  courseId?: string;
  page?: number;
  size?: number;
  sort?: string | string[];
}

export type CoachTimesheetListResponse =
  PageResponse<CoachTimesheetSimpleResponse>;
