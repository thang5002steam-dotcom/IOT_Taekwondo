import type { CourseResponse, CourseSimpleResponse } from "../api/course.dto";
import { CourseLevelLabel, CourseStatusLabel } from "../constants/course.constants";
import {
  WeekdayCodeToLabel,
  WeekdayLabel,
  type Weekday,
} from "@/features/class-schedule/constants/class-schedule.constants";
import { AssignmentTypeLabel } from "@/features/course-staff-assignment/constants/course-staff-assignment.constants";
import type {
  CourseCatalogTab,
  CourseScheduleView,
  CourseView,
} from "./course.types";

/**
 * Maps a CourseSimpleResponse or CourseResponse DTO from backend into a CourseView object for UI components.
 */
export function mapCourseApiToView(
  item: CourseSimpleResponse | CourseResponse,
  fallbackPackages: CourseView["packages"] = [],
): CourseView {
  const apiSchedules = item.courseSchedules ?? [];
  const schedule = apiSchedules[0]?.classSchedule;
  const branchName = schedule?.branch?.name ?? "Cơ sở Văn Quán";
  const weekdayText = schedule?.weekday
    ? typeof schedule.weekday === "number"
      ? (WeekdayCodeToLabel[schedule.weekday] ?? `Thứ ${schedule.weekday}`)
      : (WeekdayLabel[schedule.weekday as Weekday] ?? String(schedule.weekday))
    : "";
  const levelText = CourseLevelLabel[item.level] ?? item.level;
  const scheduleLabel =
    [weekdayText, levelText].filter(Boolean).join(" · ") || "Lịch học linh hoạt";

  const catalogStatus: CourseCatalogTab =
    item.status === "OPEN"
      ? "registration"
      : item.status === "ACTIVE"
      ? "active"
      : "ended";

  const schedules: CourseScheduleView[] = apiSchedules.map((courseSchedule) => {
    const staffAssignments = "staffAssignments" in courseSchedule
      ? courseSchedule.staffAssignments
      : [];
    return {
      courseScheduleId: courseSchedule.courseScheduleId,
      classScheduleId: courseSchedule.classSchedule.scheduleId,
      weekday: courseSchedule.classSchedule.weekday,
      startTime: courseSchedule.classSchedule.startTime,
      endTime: courseSchedule.classSchedule.endTime,
      branchName: courseSchedule.classSchedule.branch?.name ?? "",
      startDate: courseSchedule.startDate,
      endDate: courseSchedule.endDate,
      status: courseSchedule.status,
      staffAssignments: staffAssignments.map((assignment) => ({
        assignmentId: assignment.courseStaffAssignmentId,
        id: assignment.staffPerson.personId,
        fullName: assignment.staffPerson.fullName,
        assignmentType: assignment.assignmentType,
        roleLabel: AssignmentTypeLabel[assignment.assignmentType],
        isPrimary: assignment.assignmentType === "PRIMARY_COACH",
      })),
    };
  });

  const uniqueCoachIds = new Set<string>();
  const uniqueAssistantIds = new Set<string>();
  for (const courseSchedule of schedules) {
    for (const staff of courseSchedule.staffAssignments) {
      if (
        staff.assignmentType === "PRIMARY_COACH" ||
        staff.assignmentType === "ASSISTANT_COACH"
      ) {
        uniqueCoachIds.add(staff.id);
      } else if (staff.assignmentType === "TEACHING_ASSISTANT") {
        uniqueAssistantIds.add(staff.id);
      }
    }
  }

  return {
    courseId: item.courseId,
    courseName: item.name,
    subtitle: `Lớp ${levelText || "Taekwondo"} · Cơ sở ${branchName}`,
    description: `Khóa học ${item.name} tại cơ sở ${branchName}. Sức chứa ${item.capacity} học viên.`,
    benefits: "Rèn luyện thể chất, nâng cao kỹ thuật Taekwondo, kỷ luật võ đạo và tác phong tự giác.",
    curriculum: "Khởi động, tấn cơ bản, đòn đá căn bản & nâng cao, bài quyền và đối luyện kiểm soát.",
    branchName,
    levelLabel: levelText || "Cơ bản",
    scheduleLabel,
    statusLabel: CourseStatusLabel[item.status] ?? "Đang mở đăng ký",
    catalogStatus,
    capacity: item.capacity,
    enrolledStudentCount: item.currentStudentCount ?? 0,
    schedules,
    coachCount: uniqueCoachIds.size,
    assistantCount: uniqueAssistantIds.size,
    packages: fallbackPackages,
  };
}
