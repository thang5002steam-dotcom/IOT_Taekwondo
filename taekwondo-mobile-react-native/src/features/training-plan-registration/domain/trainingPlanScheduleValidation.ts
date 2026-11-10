import type { TrainingPlanScheduleOption } from "../api/trainingPlanRegistration.dto";

function timeToMinutes(value: string): number {
  const [hours = "0", minutes = "0"] = value.split(":");
  return Number(hours) * 60 + Number(minutes);
}

export function schedulesOverlap(
  first: TrainingPlanScheduleOption,
  second: TrainingPlanScheduleOption,
): boolean {
  if (first.dayOfWeek !== second.dayOfWeek) return false;

  return (
    timeToMinutes(first.startTime) < timeToMinutes(second.endTime) &&
    timeToMinutes(second.startTime) < timeToMinutes(first.endTime)
  );
}

export function findScheduleTimeConflict(
  candidate: TrainingPlanScheduleOption,
  selected: readonly TrainingPlanScheduleOption[],
): TrainingPlanScheduleOption | undefined {
  return selected.find((option) => schedulesOverlap(candidate, option));
}

export function hasScheduleTimeConflicts(
  selected: readonly TrainingPlanScheduleOption[],
): boolean {
  return selected.some((candidate, index) =>
    selected.slice(index + 1).some((option) => schedulesOverlap(candidate, option)),
  );
}
