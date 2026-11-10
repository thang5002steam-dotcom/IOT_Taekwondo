import type { CourseScheduleSimpleResponse } from "@/features/course/api/course.dto";
import type { CourseStaffAssignmentSimpleResponse } from "@/features/course-staff-assignment/api/course-staff-assignment.dto";
import type { AssignmentType } from "@/features/course-staff-assignment/constants/course-staff-assignment.constants";
import { AssignmentTypeLabel } from "@/features/course-staff-assignment/constants/course-staff-assignment.constants";
import type { PersonSimpleResponse } from "@/features/person";
import type { StudentEnrollmentSimpleResponse } from "@/features/student-enrollment/api/student-enrollment.dto";
import { WeekdayLabel } from "@/features/class-schedule/constants/class-schedule.constants";

export const courseMemberKinds = [
  "coaches",
  "teaching-assistants",
  "students",
] as const;

export type CourseMemberKind = (typeof courseMemberKinds)[number];

export function isCourseMemberKind(value: string): value is CourseMemberKind {
  return courseMemberKinds.includes(value as CourseMemberKind);
}

export const courseMemberConfig = {
  coaches: {
    title: "Huấn luyện viên",
    emptyText: "Chưa có huấn luyện viên đang tham gia khóa học.",
    assignmentTypes: ["PRIMARY_COACH", "ASSISTANT_COACH"] as AssignmentType[],
  },
  "teaching-assistants": {
    title: "Trợ giảng",
    emptyText: "Chưa có trợ giảng đang tham gia khóa học.",
    assignmentTypes: ["TEACHING_ASSISTANT"] as AssignmentType[],
  },
  students: {
    title: "Học viên",
    emptyText: "Chưa có học viên đang theo học khóa học.",
    assignmentTypes: [] as AssignmentType[],
  },
} satisfies Record<CourseMemberKind, {
  title: string;
  emptyText: string;
  assignmentTypes: AssignmentType[];
}>;

export type RosterAssignment = {
  id: string;
  scheduleId: string;
  scheduleLabel: string;
  role?: AssignmentType;
  roleLabel?: string;
  startDate: string;
  endDate: string | null;
};

export type RosterMember = {
  person: PersonSimpleResponse;
  assignments: RosterAssignment[];
  primary: boolean;
};

export function formatScheduleLabel(schedule: CourseScheduleSimpleResponse) {
  const classSchedule = schedule.classSchedule;
  const weekday = WeekdayLabel[classSchedule.weekday] ?? classSchedule.weekday;
  return `${weekday}, ${classSchedule.startTime.slice(0, 5)}–${classSchedule.endTime.slice(0, 5)} · ${classSchedule.branch.name}`;
}

export function groupStaffAssignments(
  assignments: CourseStaffAssignmentSimpleResponse[],
): RosterMember[] {
  const grouped = new Map<string, RosterMember>();

  assignments.forEach((assignment) => {
    const person = assignment.staffPerson;
    const current = grouped.get(person.personId) ?? {
      person,
      assignments: [],
      primary: false,
    };
    current.primary ||= assignment.assignmentType === "PRIMARY_COACH";
    current.assignments.push({
      id: assignment.courseStaffAssignmentId,
      scheduleId: assignment.courseSchedule.courseScheduleId,
      scheduleLabel: formatScheduleLabel(assignment.courseSchedule),
      role: assignment.assignmentType,
      roleLabel: AssignmentTypeLabel[assignment.assignmentType],
      startDate: assignment.startDate,
      endDate: assignment.endDate,
    });
    grouped.set(person.personId, current);
  });

  return [...grouped.values()].sort((left, right) =>
    Number(right.primary) - Number(left.primary) ||
    left.person.fullName.localeCompare(right.person.fullName, "vi"),
  );
}

export function groupStudentEnrollments(
  enrollments: StudentEnrollmentSimpleResponse[],
): RosterMember[] {
  const grouped = new Map<string, RosterMember>();

  enrollments.forEach((enrollment) => {
    const person = enrollment.studentPerson;
    const current = grouped.get(person.personId) ?? {
      person,
      assignments: [],
      primary: false,
    };
    enrollment.courseSchedules.forEach((schedule) => {
      current.assignments.push({
        id: `${enrollment.studentEnrollmentId}-${schedule.courseScheduleId}`,
        scheduleId: schedule.courseScheduleId,
        scheduleLabel: formatScheduleLabel(schedule),
        startDate: enrollment.startDate,
        endDate: enrollment.endDate,
      });
    });
    grouped.set(person.personId, current);
  });

  return [...grouped.values()].sort((left, right) =>
    left.person.fullName.localeCompare(right.person.fullName, "vi"),
  );
}
