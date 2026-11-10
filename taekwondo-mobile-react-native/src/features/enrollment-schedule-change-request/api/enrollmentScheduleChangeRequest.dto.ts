export type EnrollmentScheduleChangeRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface EnrollmentScheduleChangeRequestCreateRequest {
  currentScheduleId: string;
  targetCourseScheduleId: string;
  effectiveFrom: string;
  note?: string | null;
}

export interface EnrollmentScheduleChangeRequestReviewRequest {
  note?: string | null;
}

export interface EnrollmentScheduleChangeRequestResponse {
  requestId: string;
  enrollmentId: string;
  currentScheduleId: string;
  targetCourseScheduleId: string;
  effectiveFrom: string;
  note: string | null;
  status: EnrollmentScheduleChangeRequestStatus;
  requestedByUserId: string;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
}

export interface EnrollmentScheduleChangeScheduleOption {
  courseScheduleId: string;
  courseId: string;
  courseName: string;
  branchName: string;
  weekday: string;
  startTime: string;
  endTime: string;
  sessionType: 'REQUIRED' | 'STANDARD';
  remainingCapacity: number;
}
