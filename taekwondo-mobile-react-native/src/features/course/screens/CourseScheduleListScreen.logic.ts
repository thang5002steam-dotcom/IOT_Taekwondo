import type { CourseScheduleView } from "@/features/course/domain/course.types";

export type CourseScheduleBranchGroup = {
  branchName: string;
  countLabel: string;
  schedules: CourseScheduleView[];
};

/** Groups already-sorted schedules by their display branch while preserving row order. */
export function groupCourseSchedulesByBranch(
  schedules: readonly CourseScheduleView[],
): CourseScheduleBranchGroup[] {
  const groups: CourseScheduleBranchGroup[] = [];
  const groupsByBranch = new Map<string, CourseScheduleBranchGroup>();

  for (const schedule of schedules) {
    const branchName = schedule.branchName?.trim() || "Chưa cập nhật cơ sở";
    const branchKey = branchName.toLocaleLowerCase("vi-VN");
    let group = groupsByBranch.get(branchKey);

    if (!group) {
      group = { branchName, countLabel: "", schedules: [] };
      groupsByBranch.set(branchKey, group);
      groups.push(group);
    }

    group.schedules.push(schedule);
  }

  for (const group of groups) {
    group.countLabel = `${group.schedules.length} ca học`;
  }

  const UNASSIGNED_BRANCH = "Chưa cập nhật cơ sở";
  return groups.sort((a, b) => {
    if (a.branchName === UNASSIGNED_BRANCH && b.branchName !== UNASSIGNED_BRANCH) return 1;
    if (b.branchName === UNASSIGNED_BRANCH && a.branchName !== UNASSIGNED_BRANCH) return -1;
    return a.branchName.localeCompare(b.branchName, "vi-VN", { sensitivity: "base", numeric: true });
  });
}
