import type { ClassScheduleResponse, ClassScheduleSimpleResponse } from '@/features/class-schedule/api/class-schedule.dto';
import type { ClassScheduleSummary } from '@/features/class-schedule/api/class-schedule-summary.dto';
import type { PersonResponse, PersonSimpleResponse } from '@/features/person/api/person.dto';
import type { StudentSummary } from '@/features/student/api/student-summary.dto';
import type { StudentEnrollmentStatus } from '../constants/student-enrollment.constants';

export interface StudentEnrollmentCreateRequest {
  studentPersonId: string;
  coursePurchaseId: string;
  courseScheduleIds: string[];
  startDate: string;
  endDate: string;
  status: StudentEnrollmentStatus;
}

export type StudentEnrollmentUpdateRequest = StudentEnrollmentCreateRequest;

export interface StudentEnrollmentResponse {
  studentEnrollmentId: string;
  studentPerson: PersonResponse;
  coursePurchaseId: string;
  courseSchedules: import('@/features/course/api/course.dto').CourseScheduleResponse[];
  startDate: string;
  endDate: string;
  status: StudentEnrollmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StudentEnrollmentSimpleResponse {
  studentEnrollmentId: string;
  studentPerson: PersonSimpleResponse;
  coursePurchaseId: string;
  courseSchedules: import('@/features/course/api/course.dto').CourseScheduleSimpleResponse[];
  startDate: string;
  endDate: string;
  status: StudentEnrollmentStatus;
}

export interface StudentEnrollmentListParams {
  from: string;
  to: string;
  courseId?: string;
  studentPersonId?: string;
  status?: StudentEnrollmentStatus;
  search?: string;
  page?: number;
  size?: number;
  sort?: string | string[];
}

export interface EnrolledStudentItem {
  enrollmentId: string;
  studentSummary: StudentSummary;
  joinDate: string;
  status: StudentEnrollmentStatus;
}

export interface EnrollmentsByScheduleResponse {
  classScheduleSummary: ClassScheduleSummary;
  enrollments: EnrolledStudentItem[];
}

export interface EnrollmentHistoryItem {
  scheduleId: string;
  joinDate: string;
  leaveDate: string | null;
}
