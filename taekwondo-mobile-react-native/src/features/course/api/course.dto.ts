import type {
  ClassScheduleResponse,
  ClassScheduleSimpleResponse,
} from "@/features/class-schedule/api/class-schedule.dto";
import type { PersonBriefResponse } from "@/features/person/domain/person.types";
import type { AssignmentType } from "@/features/course-staff-assignment/constants/course-staff-assignment.constants";
import type { CourseLevel, CourseStatus } from "../constants/course.constants";

export interface CourseScheduleResponse {
  courseScheduleId: string;
  classSchedule: ClassScheduleResponse;
  staffAssignments: CourseScheduleStaffAssignmentResponse[];
  startDate: string;
  endDate: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface CourseScheduleStaffAssignmentResponse {
  courseStaffAssignmentId: string;
  staffPerson: PersonBriefResponse;
  assignmentType: AssignmentType;
}

export interface CourseScheduleSimpleResponse {
  courseScheduleId: string;
  classSchedule: ClassScheduleSimpleResponse;
  startDate: string;
  endDate: string | null;
  status: "ACTIVE" | "INACTIVE";
}

export interface CourseScheduleUpsertRequest {
  classScheduleId: string;
  startDate: string;
  endDate: string | null;
  status: "ACTIVE" | "INACTIVE";
}

export interface CourseCreateRequest {
  courseSchedules: CourseScheduleUpsertRequest[];
  name: string;
  level: CourseLevel;
  capacity: number;
  status: CourseStatus;
}

export interface CourseUpdateRequest {
  name: string;
  level: CourseLevel;
  capacity: number;
  status: CourseStatus;
}

export interface CourseResponse {
  courseId: string;
  courseSchedules: CourseScheduleResponse[];
  name: string;
  level: CourseLevel;
  capacity: number;
  currentStudentCount: number;
  status: CourseStatus;
  classSessionGeneratedUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CourseSimpleResponse {
  courseId: string;
  courseSchedules: CourseScheduleSimpleResponse[];
  name: string;
  level: CourseLevel;
  capacity: number;
  currentStudentCount: number;
  status: CourseStatus;
}

export interface CourseListParams {
  search?: string;
  status?: CourseStatus;
  page?: number;
  size?: number;
  sort?: string | string[];
}
