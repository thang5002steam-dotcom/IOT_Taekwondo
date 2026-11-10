import type { TrainingPlanScheduleOption } from "../api/trainingPlanRegistration.dto";
import {
  findScheduleTimeConflict,
  hasScheduleTimeConflicts,
  schedulesOverlap,
} from "./trainingPlanScheduleValidation";

const option = (
  courseScheduleId: string,
  dayOfWeek: TrainingPlanScheduleOption["dayOfWeek"],
  startTime: string,
  endTime: string,
): TrainingPlanScheduleOption => ({
  courseScheduleId,
  courseId: `course-${courseScheduleId}`,
  courseName: `Khóa ${courseScheduleId}`,
  branchName: "Cơ sở 2",
  dayOfWeek,
  startTime,
  endTime,
  sessionType: "STANDARD",
});

describe("training plan schedule validation", () => {
  it("detects overlapping schedules on the same weekday", () => {
    const first = option("one", "SATURDAY", "18:00:00", "19:30:00");
    const second = option("two", "SATURDAY", "18:30:00", "20:00:00");

    expect(schedulesOverlap(first, second)).toBe(true);
    expect(findScheduleTimeConflict(second, [first])).toBe(first);
    expect(hasScheduleTimeConflicts([first, second])).toBe(true);
    expect(findScheduleTimeConflict(first, [first])).toBe(first);
  });

  it("allows adjacent times and matching times on different weekdays", () => {
    const first = option("one", "SATURDAY", "18:00:00", "19:30:00");
    const adjacent = option("two", "SATURDAY", "19:30:00", "21:00:00");
    const otherDay = option("three", "WEDNESDAY", "18:00:00", "19:30:00");

    expect(schedulesOverlap(first, adjacent)).toBe(false);
    expect(schedulesOverlap(first, otherDay)).toBe(false);
    expect(hasScheduleTimeConflicts([first, adjacent, otherDay])).toBe(false);
  });
});
