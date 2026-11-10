import type { AssignmentType } from "@/features/course-staff-assignment/constants/course-staff-assignment.constants";

export type { CourseResponse as Course } from "../api/course.dto";

export type CourseCatalogTab = "registration" | "active" | "ended";

export type CoursePackageView = {
  id: string;
  label: string;
  durationLabel: string;
  sessions: number;
  amount: number;
  originalAmount?: number;
  footerText?: string;
  badge?: { label: string; tone: "popular" | "saving" };
};

export type CourseStaffMemberView = {
  id: string;
  fullName: string;
  roleLabel: string;
};

export type CourseScheduleStaffView = CourseStaffMemberView & {
  assignmentId: string;
  assignmentType: AssignmentType;
  isPrimary: boolean;
};

export type CourseScheduleView = {
  courseScheduleId: string;
  classScheduleId: string;
  weekday?: string | number;
  startTime?: string;
  endTime?: string;
  branchName: string;
  startDate: string;
  endDate: string | null;
  status: "ACTIVE" | "INACTIVE";
  staffAssignments: CourseScheduleStaffView[];
};

export type CourseView = {
  courseId: string;
  courseName: string;
  subtitle?: string;
  description?: string;
  benefits?: string;
  curriculum?: string;
  branchName: string;
  levelLabel: string;
  scheduleLabel: string;
  statusLabel: string;
  catalogStatus: CourseCatalogTab;
  capacity?: number;
  enrolledStudentCount?: number;
  endedAtLabel?: string;
  schedules: CourseScheduleView[];
  coachCount: number;
  assistantCount: number;
  packages: CoursePackageView[];
};
