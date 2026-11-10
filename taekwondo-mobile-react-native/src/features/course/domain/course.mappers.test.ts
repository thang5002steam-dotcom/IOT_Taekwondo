import type { CourseResponse } from "../api/course.dto";
import { mapCourseApiToView } from "./course.mappers";

const branch = {
  branchId: 1,
  name: "Văn Quán",
  address: "Hà Nội",
  hotline: "0900000000",
  openedDate: "2020-01-01",
  status: "OPERATING" as const,
  createdAt: "2020-01-01T00:00:00Z",
  updatedAt: "2020-01-01T00:00:00Z",
};

function person(personId: string, fullName: string) {
  return {
    personId,
    fullName,
    personCode: null,
    currentBelt: null,
    status: null,
    faceImagePath: null,
  };
}

describe("mapCourseApiToView", () => {
  it("keeps schedule staff roles and counts unique coaches and teaching assistants", () => {
    const course: CourseResponse = {
      courseId: "course-1",
      name: "Taekwondo cơ bản",
      level: "BASIC",
      capacity: 30,
      currentStudentCount: 12,
      status: "ACTIVE",
      classSessionGeneratedUntil: null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      courseSchedules: [
        {
          courseScheduleId: "schedule-1",
          classSchedule: {
            scheduleId: "class-schedule-1",
            branch,
            weekday: "MONDAY",
            location: "INDOOR",
            status: "ACTIVE",
            startTime: "18:00:00",
            endTime: "19:30:00",
          },
          staffAssignments: [
            {
              courseStaffAssignmentId: "assignment-primary-1",
              staffPerson: person("coach-primary", "HLV Chính"),
              assignmentType: "PRIMARY_COACH",
            },
            {
              courseStaffAssignmentId: "assignment-assistant",
              staffPerson: person("coach-assistant", "HLV Phụ"),
              assignmentType: "ASSISTANT_COACH",
            },
            {
              courseStaffAssignmentId: "assignment-teaching",
              staffPerson: person("teaching-assistant", "Trợ Giảng"),
              assignmentType: "TEACHING_ASSISTANT",
            },
            {
              courseStaffAssignmentId: "assignment-manager",
              staffPerson: person("manager", "Quản Lý"),
              assignmentType: "MANAGER",
            },
          ],
          startDate: "2026-01-01",
          endDate: null,
          status: "ACTIVE",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
        {
          courseScheduleId: "schedule-2",
          classSchedule: {
            scheduleId: "class-schedule-2",
            branch,
            weekday: "WEDNESDAY",
            location: "INDOOR",
            status: "ACTIVE",
            startTime: "18:00:00",
            endTime: "19:30:00",
          },
          staffAssignments: [
            {
              courseStaffAssignmentId: "assignment-primary-2",
              staffPerson: person("coach-primary", "HLV Chính"),
              assignmentType: "PRIMARY_COACH",
            },
          ],
          startDate: "2026-01-01",
          endDate: null,
          status: "ACTIVE",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      ],
    };

    const result = mapCourseApiToView(course);

    expect(result.coachCount).toBe(2);
    expect(result.assistantCount).toBe(1);
    expect(result.schedules).toHaveLength(2);
    expect(result.schedules[0].staffAssignments.map((staff) => staff.roleLabel))
      .toEqual(["HLV chính", "HLV phụ", "Trợ giảng", "Quản lý"]);
    expect(result.schedules[0].staffAssignments[0].isPrimary).toBe(true);
  });
});
