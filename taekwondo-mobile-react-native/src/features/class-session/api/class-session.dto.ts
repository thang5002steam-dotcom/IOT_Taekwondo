import type { CourseResponse, CourseSimpleResponse } from '@/features/course/api/course.dto';
import type { PersonSimpleResponse } from '@/features/person/domain/person.types';
import type { SessionStatus } from '../constants/class-session.constants';
import type { CourseLevel } from '@/features/course/constants/course.constants';

export interface SessionCreateRequest {
  courseId: string;
  sessionDate: string;
  status: SessionStatus;
  startTime: string;
  endTime: string;
  note: string;
}

export type SessionUpdateRequest = SessionCreateRequest;

export interface ReopenAttendanceRequest {
  attendanceReopenedUntil: string;
}

export interface SessionResponse {
  classSessionId: string;
  course: CourseResponse;
  scheduleLevel: CourseLevel;
  sessionDate: string;
  status: SessionStatus;
  attendanceClosed: boolean;
  attendanceReopenedUntil: string | null;
  startTime: string;
  endTime: string;
  note: string | null;
  learningProgress?: {
    completed: number;
    total: number;
    percent: number;
  } | null;
}

export interface SessionSimpleResponse {
  classSessionId: string;
  course: CourseSimpleResponse;
  scheduleLevel: CourseLevel;
  sessionDate: string;
  status: SessionStatus;
  attendanceClosed: boolean;
  attendanceReopenedUntil: string | null;
  startTime: string;
  endTime: string;
  primaryCoach?: PersonSimpleResponse | null;
}

export interface ClassSessionCalendarResponse {
  classSessionId: string;
  courseId: string;
  courseName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  attendanceClosed: boolean;
  primaryCoach?: PersonSimpleResponse | null;
}

export interface ClassSessionCalendarParams {
  fromDate: string;
  toDate: string;
}

export interface ClassSessionFilterParams {
  courseId?: string;
  page?: number;
  size?: number;
  sort?: string | string[];
}
