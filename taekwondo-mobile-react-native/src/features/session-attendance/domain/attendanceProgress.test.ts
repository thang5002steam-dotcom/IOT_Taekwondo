import type { EvaluationStudent } from "../api/session-attendance.dto";
import type {
  AttendanceStatus,
  EvaluationStatus,
} from "../constants/session-attendance.constants";
import { calculateAttendanceProgress } from "./attendanceProgress";

function student(
  id: string,
  attendanceStatus?: AttendanceStatus,
  evaluationStatus: EvaluationStatus = "PENDING",
): EvaluationStudent {
  return {
    studentEnrollment: {
      studentEnrollmentId: id,
      studentPerson: { personId: id, fullName: `Student ${id}` },
    },
    attendance: attendanceStatus
      ? {
          sessionAttendanceId: `attendance-${id}`,
          attendanceStatus,
          evaluationStatus,
        }
      : null,
    recorded: Boolean(attendanceStatus),
  };
}

describe("calculateAttendanceProgress", () => {
  it("groups attendance and evaluation progress using the current business rules", () => {
    const result = calculateAttendanceProgress([
      student("1", "PRESENT", "GOOD"),
      student("2", "LATE", "AVERAGE"),
      student("3", "EXCUSED"),
      student("4"),
    ]);

    expect(result).toEqual({
      totalStudents: 4,
      presentCount: 2,
      absentCount: 1,
      attendancePercent: 50,
      evaluatedCount: 2,
      needEvaluationCount: 2,
      evaluationPercent: 100,
    });
  });
});
