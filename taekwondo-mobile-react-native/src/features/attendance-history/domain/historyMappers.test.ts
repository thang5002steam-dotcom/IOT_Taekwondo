import type { CoachTimesheetResponse } from "@/features/coach-timesheet/api/coach-timesheet.dto";
import type { StudentAttendanceResponse } from "@/features/session-attendance/api/session-attendance.dto";

import {
  mapCoachTimesheetToHistoryRecord,
  mapStudentAttendanceToHistoryRecord,
} from "./historyMappers";

describe("historyMappers", () => {
  it("maps student attendance API shape to a student history card model", () => {
    const attendance: StudentAttendanceResponse = {
      sessionAttendanceId: "attendance-1",
      studentAttendanceId: "attendance-1",
      classSessionId: "session-1",
      studentEnrollmentId: "enrollment-1",
      courseStaffAssignmentId: null,
      checkInTime: "2026-08-09T01:00:00.000Z",
      attendanceStatus: "PRESENT",
      evaluationStatus: "GOOD",
      note: "Đi học đúng giờ",
      allowedActions: { update: false, delete: false },
      createdAt: "2026-08-09T01:00:00.000Z",
      updatedAt: "2026-08-09T01:00:00.000Z",
    };

    expect(
      mapStudentAttendanceToHistoryRecord(attendance, {
        branchLabel: "Cơ sở 2",
        shiftLabel: "Ca 1",
      }),
    ).toMatchObject({
      id: "attendance-1",
      mode: "student",
      dateLabel: "09-08-2026",
      branchLabel: "Cơ sở 2",
      shiftLabel: "Ca 1",
      statusLabel: "Có mặt",
      badgeLabel: "Tốt",
      tone: "success",
    });
  });

  it("maps coach timesheet API shape to a coach history card model", () => {
    const timesheet: CoachTimesheetResponse = {
      coachTimesheetId: "timesheet-1",
      courseStaffAssignmentId: "assignment-1",
      classSessionId: "session-1",
      checkInTime: "2026-08-09T01:00:00.000Z",
      checkOutTime: "2026-08-09T02:30:00.000Z",
      note: "Đã hoàn thành ca dạy",
      allowedActions: { update: false, delete: false },
      createdAt: "2026-08-09T01:00:00.000Z",
      updatedAt: "2026-08-09T02:30:00.000Z",
    };

    expect(
      mapCoachTimesheetToHistoryRecord(timesheet, {
        branchLabel: "Cơ sở 2",
        shiftLabel: "Ca 1",
      }),
    ).toMatchObject({
      id: "timesheet-1",
      mode: "coach",
      dateLabel: "09-08-2026",
      statusLabel: "Đã chấm công",
      badgeLabel: "1 giờ 30 phút",
      tone: "success",
    });
  });
});
