import type {
  SessionResponse,
  SessionSimpleResponse,
} from "@/features/class-session/api/class-session.dto";
import type {
  ScheduleLevel,
  ScheduleLocation,
  Weekday,
} from "@/features/class-schedule/constants/class-schedule.constants";
import type {
  CourseStaffAssignmentResponse,
  CourseStaffAssignmentSimpleResponse,
} from "@/features/course-staff-assignment/api/course-staff-assignment.dto";
import type {
  StudentEnrollmentResponse,
  StudentEnrollmentSimpleResponse,
} from "@/features/student-enrollment/api/student-enrollment.dto";
import type { PageResponse } from "@/infrastructure/http/pagination.types";
import type {
  AttendanceStatus,
  EvaluationStatus,
} from "../constants/session-attendance.constants";
import type { CourseLevel } from "@/features/course/constants/course.constants";

export interface AllowedActions {
  update: boolean;
  delete: boolean;
}

export interface SessionAttendanceResponse {
  sessionAttendanceId: string;
  studentAttendanceId?: string;
  classSession?: SessionResponse;
  classSessionId?: string;
  studentEnrollment?: StudentEnrollmentResponse | null;
  studentEnrollmentId?: string | null;
  courseStaffAssignment?: CourseStaffAssignmentResponse | null;
  courseStaffAssignmentId?: string | null;
  checkInTime: string | null;
  attendanceStatus: AttendanceStatus;
  evaluationStatus: EvaluationStatus | null;
  note: string | null;
  allowedActions: AllowedActions;
  createdAt: string;
  updatedAt: string;
}

export interface SessionAttendanceSimpleResponse {
  sessionAttendanceId: string;
  classSession: SessionSimpleResponse;
  studentEnrollment: StudentEnrollmentSimpleResponse;
  courseStaffAssignment?: CourseStaffAssignmentSimpleResponse | null;
  checkInTime: string | null;
  attendanceStatus: AttendanceStatus;
  evaluationStatus: EvaluationStatus | null;
  note: string | null;
  allowedActions: AllowedActions;
  createdAt: Date;
}

export type StudentAttendanceResponse = SessionAttendanceResponse;
export type StudentAttendanceSimpleResponse = SessionAttendanceSimpleResponse;

export interface SessionAttendanceCreateRequest {
  classSessionId: string;
  studentEnrollmentId?: string | null;
  courseStaffAssignmentId?: string | null;
  checkInTime?: string | null;
  attendanceStatus: AttendanceStatus;
  evaluationStatus?: EvaluationStatus | null;
  note?: string | null;
}

export type StudentAttendanceCreateRequest = SessionAttendanceCreateRequest;

export interface SessionAttendanceUpdateRequest {
  checkInTime?: string | null;
  attendanceStatus: AttendanceStatus;
  evaluationStatus?: EvaluationStatus | null;
  note?: string | null;
}

export type StudentAttendanceUpdateRequest = SessionAttendanceUpdateRequest;

export interface AttendanceFilterParams {
  from?: string;
  to?: string;
  courseId?: string;
  studentPersonId?: string;
  staffPersonId?: string;
  branchId?: number;
  weekday?: Weekday;
  scheduleLevel?: ScheduleLevel;
  location?: ScheduleLocation;
  page?: number;
  size?: number;
  sort?: string | string[];
}

export type SessionAttendanceFilterParams = AttendanceFilterParams;

export type SessionAttendanceListResponse =
  PageResponse<SessionAttendanceSimpleResponse>;
export type StudentAttendanceListResponse = SessionAttendanceListResponse;

export interface UpdateStatusRequest {
  attendanceStatus: AttendanceStatus;
  checkInTime?: string | null;
}

export interface UpdateEvaluationRequest {
  evaluationStatus: EvaluationStatus;
  note?: string | null;
}

export interface EvaluationStudentEnrollment {
  studentEnrollmentId: string;
  studentPerson: {
    personId: string;
    fullName: string;
    gender?: boolean | null;
    birthDate?: string | null;
    personCode?: string | null;
    currentBelt?: string | null;
    status?: string | null;
    faceImagePath?: string | null;
  };
  coursePurchaseId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
}

export interface EvaluationAttendance {
  sessionAttendanceId: string;
  checkInTime?: string | null;
  attendanceStatus: AttendanceStatus;
  evaluationStatus?: EvaluationStatus | null;
  note?: string | null;
}

export interface EvaluationStudent {
  studentEnrollment: EvaluationStudentEnrollment;
  attendance: EvaluationAttendance | null;
  recorded: boolean;
}

export interface ClassSessionEvaluationResponse {
  classSession: {
    classSessionId: string;
    course: {
      courseId: string;
      name: string;
      level: CourseLevel;
      classSchedule?: {
        branch?: {
          branchId: number;
          name: string;
        } | null;
        weekday?: number | string | null;
        location?: string | null;
        status?: string | null;
      } | null;
    };
    scheduleLevel: CourseLevel;
    sessionDate: string;
    status: string;
    attendanceClosed: boolean;
    startTime: string;
    endTime: string;
    primaryCoach?: {
      personId: string;
      fullName: string;
      currentBelt?: string | null;
      danRank?: string | null;
    } | null;
  };
  students: EvaluationStudent[];
}
