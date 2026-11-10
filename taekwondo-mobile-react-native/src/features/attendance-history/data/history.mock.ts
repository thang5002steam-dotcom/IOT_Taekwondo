import type { CoachTimesheetResponse } from "@/features/coach-timesheet/api/coach-timesheet.dto";
import type { StudentAttendanceResponse } from "@/features/session-attendance/api/session-attendance.dto";

import {
  mapCoachTimesheetToHistoryRecord,
  mapStudentAttendanceToHistoryRecord,
  type HistoryRecordViewModel,
} from "../domain/historyMappers";

type StudentMockRecord = {
  attendance: StudentAttendanceResponse;
  name: string;
  branchLabel: string;
  shiftLabel: string;
};

type CoachMockRecord = {
  timesheet: CoachTimesheetResponse;
  branchLabel: string;
  shiftLabel: string;
};

const allowedActions = { update: false, delete: false };

export const studentAttendanceMockRecords: StudentMockRecord[] = [
  {
    name: "Học viên mẫu",
    attendance: {
      sessionAttendanceId: "student-attendance-2026-08-09",
      studentAttendanceId: "student-attendance-2026-08-09",
      classSessionId: "class-session-2026-08-09",
      studentEnrollmentId: "student-enrollment-1",
      courseStaffAssignmentId: "course-staff-assignment-1",
      checkInTime: "2026-08-09T01:00:00.000Z",
      attendanceStatus: "PRESENT",
      evaluationStatus: "GOOD",
      note: "Đi học đúng giờ",
      allowedActions,
      createdAt: "2026-08-09T01:00:00.000Z",
      updatedAt: "2026-08-09T01:00:00.000Z",
    },
    branchLabel: "Cơ sở 2",
    shiftLabel: "Ca 1",
  },
  {
    name: "Học viên mẫu",
    attendance: {
      sessionAttendanceId: "student-attendance-2026-08-06",
      studentAttendanceId: "student-attendance-2026-08-06",
      classSessionId: "class-session-2026-08-06",
      studentEnrollmentId: "student-enrollment-1",
      courseStaffAssignmentId: "course-staff-assignment-1",
      checkInTime: "2026-08-06T01:30:00.000Z",
      attendanceStatus: "LATE",
      evaluationStatus: "WEAK",
      note: "Đi học muộn, không thuộc bài",
      allowedActions,
      createdAt: "2026-08-06T01:30:00.000Z",
      updatedAt: "2026-08-06T01:30:00.000Z",
    },
    branchLabel: "Cơ sở 2",
    shiftLabel: "Ca 2",
  },
  {
    name: "Học viên mẫu",
    attendance: {
      sessionAttendanceId: "student-attendance-2026-08-01",
      studentAttendanceId: "student-attendance-2026-08-01",
      classSessionId: "class-session-2026-08-01",
      studentEnrollmentId: "student-enrollment-1",
      courseStaffAssignmentId: "course-staff-assignment-1",
      checkInTime: "2026-08-01T01:00:00.000Z",
      attendanceStatus: "PRESENT",
      evaluationStatus: "AVERAGE",
      note: "Không thuộc bài",
      allowedActions,
      createdAt: "2026-08-01T01:00:00.000Z",
      updatedAt: "2026-08-01T01:00:00.000Z",
    },
    branchLabel: "Cơ sở 2",
    shiftLabel: "Ca 1",
  },
  {
    name: "Học viên mẫu",
    attendance: {
      sessionAttendanceId: "student-attendance-2026-07-21",
      studentAttendanceId: "student-attendance-2026-07-21",
      classSessionId: "class-session-2026-07-21",
      studentEnrollmentId: "student-enrollment-1",
      courseStaffAssignmentId: null,
      checkInTime: "2026-07-21T01:00:00.000Z",
      attendanceStatus: "ABSENT",
      evaluationStatus: "AVERAGE",
      note: "",
      allowedActions,
      createdAt: "2026-07-21T01:00:00.000Z",
      updatedAt: "2026-07-21T01:00:00.000Z",
    },
    branchLabel: "Cơ sở 3",
    shiftLabel: "Ca 1",
  },
];

export const coachTimesheetMockRecords: CoachMockRecord[] = [
  {
    timesheet: {
      coachTimesheetId: "coach-timesheet-2026-08-09",
      courseStaffAssignmentId: "course-staff-assignment-1",
      classSessionId: "class-session-2026-08-09",
      checkInTime: "2026-08-09T01:00:00.000Z",
      checkOutTime: "2026-08-09T02:30:00.000Z",
      note: "Đã hoàn thành ca dạy",
      allowedActions,
      createdAt: "2026-08-09T01:00:00.000Z",
      updatedAt: "2026-08-09T02:30:00.000Z",
    },
    branchLabel: "Cơ sở 2",
    shiftLabel: "Ca 1",
  },
  {
    timesheet: {
      coachTimesheetId: "coach-timesheet-2026-08-06",
      courseStaffAssignmentId: "course-staff-assignment-1",
      classSessionId: "class-session-2026-08-06",
      checkInTime: "2026-08-06T03:00:00.000Z",
      checkOutTime: null,
      note: "Thiếu chấm công giờ ra",
      allowedActions,
      createdAt: "2026-08-06T03:00:00.000Z",
      updatedAt: "2026-08-06T03:00:00.000Z",
    },
    branchLabel: "Cơ sở 2",
    shiftLabel: "Ca 2",
  },
  {
    timesheet: {
      coachTimesheetId: "coach-timesheet-2026-08-01",
      courseStaffAssignmentId: "course-staff-assignment-2",
      classSessionId: "class-session-2026-08-01",
      checkInTime: "2026-08-01T01:00:00.000Z",
      checkOutTime: "2026-08-01T02:15:00.000Z",
      note: "Dạy bù cho lớp thiếu HLV",
      allowedActions,
      createdAt: "2026-08-01T01:00:00.000Z",
      updatedAt: "2026-08-01T02:15:00.000Z",
    },
    branchLabel: "Cơ sở 3",
    shiftLabel: "Ca 1",
  },
];

export function getMockHistoryRecords(
  mode: "student" | "coach",
): HistoryRecordViewModel[] {
  if (mode === "student") {
    return studentAttendanceMockRecords.map((item) => ({
      ...mapStudentAttendanceToHistoryRecord(item.attendance, item),
      name: item.name,
    }));
  }

  return coachTimesheetMockRecords.map((item) =>
    mapCoachTimesheetToHistoryRecord(item.timesheet, item),
  );
}

export const trainingScoreMock = {
  statusLabel: "Chưa đạt",
  quarterLabel: "Quý 1",
  sections: [
    {
      title: "Điểm chuyên cần",
      icon: "clockOutline" as const,
      total: "-0.5",
      rows: [
        { label: "Khởi điểm (5 - 1đ vi phạm)", value: "4.0" },
        { label: "Đi học muộn (1)", value: "-0.5" },
        { label: "Nghỉ có phép (0)", value: "0" },
        { label: "Nghỉ không phép (3)", value: "-3.0" },
        { label: "Tập bù (0)", value: "0" },
      ],
    },
    {
      title: "Điểm chuyên môn",
      icon: "noteText" as const,
      total: "0",
      rows: [
        { label: "Tốt (0)", value: "0" },
        { label: "Trung bình (0)", value: "0" },
        { label: "Yếu (0)", value: "0" },
      ],
    },
    {
      title: "Điểm thưởng",
      icon: "cup" as const,
      total: "",
      rows: [
        {
          label: "Rất tiếc, tính năng này chưa được triển khai",
          value: "",
        },
      ],
    },
  ],
  totalLabel: "Tổng điểm",
  totalValue: "0",
};
