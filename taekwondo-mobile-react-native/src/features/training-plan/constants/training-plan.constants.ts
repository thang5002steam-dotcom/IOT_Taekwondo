import type { ScheduleLevel } from "@/features/class-schedule/constants/class-schedule.constants";

export type { ScheduleLevel };

export type TrainingPlanStatus = "ACTIVE" | "INACTIVE";

export const TrainingPlanStatusValues = [
  "ACTIVE",
  "INACTIVE",
] as const satisfies readonly TrainingPlanStatus[];

export const TrainingPlanStatusLabel: Record<TrainingPlanStatus, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Không hoạt động",
};

export type AddonStatus = "ACTIVE" | "INACTIVE";

export const AddonStatusValues = ["ACTIVE", "INACTIVE"] as const satisfies readonly AddonStatus[];

export const AddonStatusLabel: Record<AddonStatus, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Không hoạt động",
};

export type SessionType = "REQUIRED" | "STANDARD";

export const SessionTypeValues = [
  "REQUIRED",
  "STANDARD",
] as const satisfies readonly SessionType[];

export const SessionTypeLabel: Record<SessionType, string> = {
  REQUIRED: "Buổi tập bắt buộc",
  STANDARD: "Buổi tập tiêu chuẩn",
};
