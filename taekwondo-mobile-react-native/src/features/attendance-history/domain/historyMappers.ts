import type {
  CoachTimesheetResponse,
  CoachTimesheetSimpleResponse,
} from "@/features/coach-timesheet/api/coach-timesheet.dto";
import type {
  CourseStaffAssignmentResponse,
  CourseStaffAssignmentSimpleResponse,
} from "@/features/course-staff-assignment/api/course-staff-assignment.dto";
import type {
  SessionAttendanceResponse,
  SessionAttendanceSimpleResponse,
  StudentAttendanceResponse,
  StudentAttendanceSimpleResponse,
} from "@/features/session-attendance/api/session-attendance.dto";
import {
  AttendanceStatusLabel,
  EvaluationStatusLabel,
  type EvaluationStatus,
} from "@/features/session-attendance/constants/session-attendance.constants";
import type {
  StudentEnrollmentResponse,
  StudentEnrollmentSimpleResponse,
} from "@/features/student-enrollment/api/student-enrollment.dto";

import type {
  ScheduleLevel,
  ScheduleLocation,
  Weekday,
} from "@/features/class-schedule/constants/class-schedule.constants";
import { formatDateDMY } from "@/shared/utils/dateTime";
import type { AttendanceHistoryMode } from "./historyAccess";

export type HistoryRecordTone = "success" | "warning" | "error" | "neutral";

export type HistoryRecordViewModel = {
  id: string;
  mode: AttendanceHistoryMode;
  name?: string;
  info?:
    | StudentEnrollmentResponse
    | StudentEnrollmentSimpleResponse
    | CourseStaffAssignmentResponse
    | CourseStaffAssignmentSimpleResponse
    | null;
  dateLabel: string;
  branchLabel: string;
  branchId?: number;
  shiftLabel: string;
  weekday?: Weekday;
  scheduleLevel?: ScheduleLevel;
  location?: ScheduleLocation;
  statusLabel: string;
  badgeLabel: string;
  noteTitle: string;
  note?: string;
  tone: HistoryRecordTone;
};

export type StudentAttendanceDisplayMeta = {
  branchLabel: string;
  branchId?: number;
  shiftLabel: string;
  weekday?: Weekday;
  scheduleLevel?: ScheduleLevel;
  location?: ScheduleLocation;
};

export type CoachTimesheetDisplayMeta = StudentAttendanceDisplayMeta & {
  statusLabel?: string;
};

export function mapStudentAttendanceToHistoryRecord(
  attendance:
    | SessionAttendanceResponse
    | SessionAttendanceSimpleResponse
    | StudentAttendanceResponse
    | StudentAttendanceSimpleResponse,
  meta: StudentAttendanceDisplayMeta,
): HistoryRecordViewModel {
  const evaluationStatus = attendance.evaluationStatus ?? "PENDING";
  const studentEnrollment = attendance.studentEnrollment;
  const name = studentEnrollment?.studentPerson?.fullName;
  const classSchedule = attendance.classSession?.course?.courseSchedules[0]?.classSchedule;

  return {
    id:
      attendance.sessionAttendanceId ??
      (attendance as { studentAttendanceId?: string }).studentAttendanceId ??
      "",
    mode: "student",
    name: name || undefined,
    info: studentEnrollment,
    dateLabel: formatDateDMY(attendance.createdAt),
    branchLabel: classSchedule?.branch?.name ?? meta.branchLabel,
    branchId: classSchedule?.branch?.branchId ?? meta.branchId,
    shiftLabel: meta.shiftLabel,
    weekday: classSchedule?.weekday ?? meta.weekday,
    scheduleLevel: attendance.classSession?.scheduleLevel ?? meta.scheduleLevel,
    location: classSchedule?.location ?? meta.location,
    statusLabel: AttendanceStatusLabel[attendance.attendanceStatus],
    badgeLabel: EvaluationStatusLabel[evaluationStatus],
    noteTitle: "Ghi chú",
    note: attendance.note?.trim() || undefined,
    tone: toneForEvaluation(evaluationStatus),
  };
}

export function mapCoachTimesheetToHistoryRecord(
  timesheet: CoachTimesheetResponse | CoachTimesheetSimpleResponse,
  meta: CoachTimesheetDisplayMeta,
): HistoryRecordViewModel {
  const staffAssignment = timesheet.courseStaffAssignment;
  const name = staffAssignment?.staffPerson?.fullName;

  return {
    id: timesheet.coachTimesheetId,
    mode: "coach",
    name: name || undefined,
    info: staffAssignment,
    dateLabel: formatDisplayDate(
      timesheet.checkInTime ??
        (timesheet as { createdAt?: string }).createdAt ??
        "",
    ),
    branchLabel: meta.branchLabel,
    shiftLabel: meta.shiftLabel,
    statusLabel: meta.statusLabel ?? formatTimesheetStatus(timesheet),
    badgeLabel: formatTimesheetDuration(timesheet),
    noteTitle: "Ghi chú",
    note: timesheet.note?.trim() || "Không có ghi chú",
    tone:
      timesheet.checkInTime && timesheet.checkOutTime ? "success" : "warning",
  };
}

export function formatDisplayDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${date.getFullYear()}`;
}

function toneForEvaluation(status: EvaluationStatus): HistoryRecordTone {
  if (status === "GOOD") return "success";
  if (status === "WEAK") return "error";
  if (status === "AVERAGE") return "warning";
  return "neutral";
}

function formatTimesheetStatus(
  timesheet: CoachTimesheetResponse | CoachTimesheetSimpleResponse,
): string {
  if (timesheet.checkInTime && timesheet.checkOutTime) return "Đã chấm công";
  if (timesheet.checkInTime) return "Thiếu giờ ra";
  return "Chưa chấm công";
}

function formatTimesheetDuration(
  timesheet: CoachTimesheetResponse | CoachTimesheetSimpleResponse,
): string {
  if (!timesheet.checkInTime || !timesheet.checkOutTime) return "Chưa đủ";

  const start = new Date(timesheet.checkInTime).getTime();
  const end = new Date(timesheet.checkOutTime).getTime();
  const minutes = Math.max(0, Math.round((end - start) / 60000));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours <= 0) return `${remainingMinutes} phút`;
  if (remainingMinutes <= 0) return `${hours} giờ`;
  return `${hours} giờ ${remainingMinutes} phút`;
}
