import type { CourseScheduleView } from "@/features/course/domain/course.types";

import { groupCourseSchedulesByBranch } from "./CourseScheduleListScreen.logic";

function schedule(courseScheduleId: string, branchName?: string): CourseScheduleView {
  return {
    courseScheduleId,
    branchName,
  } as CourseScheduleView;
}

describe("groupCourseSchedulesByBranch", () => {
  it("groups schedules by branch while preserving their sorted row order", () => {
    const grouped = groupCourseSchedulesByBranch([
      schedule("schedule-1", "Cơ sở 2"),
      schedule("schedule-2", "Cơ sở 1"),
      schedule("schedule-3", " cơ sở 2 "),
      schedule("schedule-4"),
    ]);

    expect(grouped).toEqual([
      {
        branchName: "Cơ sở 1",
        countLabel: "1 ca học",
        schedules: [schedule("schedule-2", "Cơ sở 1")],
      },
      {
        branchName: "Cơ sở 2",
        countLabel: "2 ca học",
        schedules: [schedule("schedule-1", "Cơ sở 2"), schedule("schedule-3", " cơ sở 2 ")],
      },
      {
        branchName: "Chưa cập nhật cơ sở",
        countLabel: "1 ca học",
        schedules: [schedule("schedule-4")],
      },
    ]);
  });
});
