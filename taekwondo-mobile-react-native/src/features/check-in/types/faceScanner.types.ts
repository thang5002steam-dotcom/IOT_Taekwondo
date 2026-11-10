import type { Face } from 'react-native-vision-camera-face-detector';

export type ScannerState =
  | 'initializing'
  | 'scanning'
  | 'face-ready'
  | 'capturing'
  | 'submitting'
  | 'processing'
  | 'result'
  | 'error';

export type ScanState = ScannerState | 'SCANNING' | 'ANALYZING' | 'SUCCESS' | 'ERROR';

export type CheckInPersonType = 'STUDENT' | 'COACH';

export type CheckInStatus =
  | 'ON_TIME'
  | 'LATE'
  | 'EXCUSED'
  | 'SUCCESS'
  | 'FAILED'
  | 'ALREADY_CHECKED_IN'
  | 'ALREADY_CHECKED_OUT';

export type FaceQualityReason =
  | 'NO_FACE'
  | 'MULTIPLE_FACES'
  | 'FACE_TOO_SMALL'
  | 'FACE_TOO_LARGE'
  | 'FACE_OUT_OF_BOUNDS'
  | 'FACE_ANGLE_BAD'
  | 'FACE_NOT_STABLE'
  | 'VALID';

export type FaceQualityResult = {
  isValid: boolean;
  reason: FaceQualityReason;
  feedbackText: string;
  face?: Face;
};

export type FaceDetectionRecord = {
  timestamp: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  trackingId?: number;
};

// --- Backend Training DTO: FaceCheckInResponse ---
export type BackendFaceCheckInStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'REJECTED'
  | 'FAILED'
  | 'EXPIRED';

export type BackendFaceCheckInAction =
  | 'STUDENT_CHECK_IN'
  | 'STAFF_TIMESHEET_CHECKED_IN'
  | 'STAFF_TIMESHEET_CHECKED_OUT'
  | 'COACH_CHECKED_IN'
  | 'COACH_CHECKED_OUT';

export interface BackendFaceCheckInPersonSummary {
  personId: string;
  fullName: string;
  personCode: string;
  faceImagePath?: string | null;
}

export interface BackendFaceCheckInSessionSummary {
  classSessionId: string;
  courseName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
}

export interface BackendFaceCheckInResponse {
  status: BackendFaceCheckInStatus;
  requestId?: string | null;
  action?: BackendFaceCheckInAction | null;
  person: BackendFaceCheckInPersonSummary;
  session?: BackendFaceCheckInSessionSummary | null;
  recordId?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  confidence?: number | null;
  attendanceStatus?: string | null;
  message?: string | null;
  error?: {
    code?: string | null;
    title?: string | null;
    detail?: string | null;
  } | null;
}

// --- Attendance Command Async Poll Types ---
export type AttendanceCommandStatus =
  | 'PENDING'
  | 'QUEUED'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'SUCCESS'
  | 'REJECTED'
  | 'FAILED'
  | 'EXPIRED';

export interface AttendanceCommandResponse {
  requestId: string;
  status: AttendanceCommandStatus;
  result?: BackendFaceCheckInResponse | null;
  error?: {
    code?: string | null;
    title?: string | null;
    detail?: string | null;
  } | null;
}

// --- Frontend View Model ---
export type CheckInRecord = {
  id: string;
  personId: string;
  code: string;
  fullName: string;
  avatarUrl?: string;
  role: CheckInPersonType;
  checkInTime: string;
  dateLabel: string;
  status: CheckInStatus;
  statusLabel: string;
  courseName?: string;
  sessionTime?: string;
  timestamp: number;
  confidence?: number;
  message?: string;
  requestId?: string;
};

export type CheckInErrorType =
  | 'NO_FACE'
  | 'MULTIPLE_FACES'
  | 'INVALID_IMAGE'
  | 'PERSON_NOT_FOUND'
  | 'ALREADY_CHECKED_IN'
  | 'ALREADY_CHECKED_OUT'
  | 'NO_ACTIVE_SESSION'
  | 'AMBIGUOUS_CONTEXT'
  | 'UNSUPPORTED_CONTEXT'
  | 'ATTENDANCE_CLOSED'
  | 'ACCESS_DENIED'
  | 'SERVICE_UNAVAILABLE'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export type CheckInFailure = {
  errorType: CheckInErrorType;
  title: string;
  message: string;
  detail?: string;
  correlationId?: string;
  ctaLabel: string;
};

export type CheckInApiResult = {
  success: boolean;
  isPending?: boolean;
  requestId?: string;
  record?: CheckInRecord;
  failure?: CheckInFailure;
  errorType?: CheckInErrorType;
  errorMessage?: string;
};

export type AttendanceCommandApiResult = {
  success: boolean;
  isPending: boolean;
  status: AttendanceCommandStatus;
  requestId: string;
  record?: CheckInRecord;
  failure?: CheckInFailure;
  errorType?: CheckInErrorType;
  errorMessage?: string;
};

export type CameraFacing = 'front' | 'back';
