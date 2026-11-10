import type { CourseStaffAssignmentSimpleResponse } from "@/features/course-staff-assignment/api/course-staff-assignment.dto";
import type { StudentEnrollmentSimpleResponse } from "@/features/student-enrollment/api/student-enrollment.dto";

import { groupStaffAssignments, groupStudentEnrollments } from "./courseMemberRoster";

const person = (personId: string, fullName: string) => ({
  personId,
  fullName,
  gender: null,
  birthDate: "2000-01-01",
  personCode: personId,
  currentBelt: "C10" as const,
  status: "ACTIVE" as const,
  faceImagePath: null,
  position: null,
});

const schedule = (courseScheduleId: string) => ({
  courseScheduleId,
  classSchedule: {
    scheduleId: `class-${courseScheduleId}`,
    branch: {
      branchId: 1,
      name: "Văn Quán",
      address: "Hà Nội",
      hotline: "0900000000",
      status: "OPERATING" as const,
    },
    weekday: "MONDAY" as const,
    location: "INDOOR" as const,
    status: "ACTIVE" as const,
    startTime: "18:00:00",
    endTime: "19:30:00",
  },
  startDate: "2026-01-01",
  endDate: null,
  status: "ACTIVE" as const,
});

describe("course member roster grouping", () => {
  it("groups a coach across schedules and sorts primary coaches first", () => {
    const assignments = [
      {
        courseStaffAssignmentId: "a1",
        staffPerson: person("coach-2", "Bình"),
        courseSchedule: schedule("s1"),
        assignmentType: "ASSISTANT_COACH",
        startDate: "2026-01-01",
        endDate: null,
        assignmentStatus: "ACTIVE",
      },
      {
        courseStaffAssignmentId: "a2",
        staffPerson: person("coach-1", "An"),
        courseSchedule: schedule("s1"),
        assignmentType: "PRIMARY_COACH",
        startDate: "2026-01-01",
        endDate: null,
        assignmentStatus: "ACTIVE",
      },
      {
        courseStaffAssignmentId: "a3",
        staffPerson: person("coach-1", "An"),
        courseSchedule: schedule("s2"),
        assignmentType: "ASSISTANT_COACH",
        startDate: "2026-01-01",
        endDate: null,
        assignmentStatus: "ENDED",
      },
    ] satisfies CourseStaffAssignmentSimpleResponse[];

    const result = groupStaffAssignments(assignments);

    expect(result.map((item) => item.person.personId)).toEqual(["coach-1", "coach-2"]);
    expect(result[0].assignments).toHaveLength(2);
    expect(result[0].assignments.map((item) => item.role)).toEqual([
      "PRIMARY_COACH",
      "ASSISTANT_COACH",
    ]);
  });

  it("groups a student and keeps all enrolled schedules", () => {
    const enrollments = [{
      studentEnrollmentId: "e1",
      studentPerson: person("student-1", "Chi"),
      coursePurchaseId: "purchase-1",
      courseSchedules: [schedule("s1"), schedule("s2")],
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      status: "ACTIVE",
    }] satisfies StudentEnrollmentSimpleResponse[];

    expect(groupStudentEnrollments(enrollments)[0].assignments).toHaveLength(2);
  });
});
