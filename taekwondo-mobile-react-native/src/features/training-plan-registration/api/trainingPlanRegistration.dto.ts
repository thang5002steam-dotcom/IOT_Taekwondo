import type { Weekday } from "@/features/class-schedule/constants/class-schedule.constants";
import type { SessionType } from "@/features/training-plan/constants/training-plan.constants";

export type { SessionType };

export interface TrainingPlanRequirement {
  requirementId: string;
  sessionType: SessionType;
  sessionsPerWeek: number;
}
export interface TrainingPlanCatalogItem {
  trainingPlanId: string;
  name: string;
  level: string;
  durationMonths: number;
  includedSessionCount: number;
  basePrice: number;
  finalPrice: number;
  requirements: TrainingPlanRequirement[];
}
export interface TrainingPlanScheduleOption {
  courseScheduleId: string;
  courseId: string;
  courseName: string;
  branchName: string;
  dayOfWeek: Weekday;
  startTime: string;
  endTime: string;
  sessionType: SessionType;
}
export interface TrainingPlanRecurringRequirement extends TrainingPlanRequirement {
  label: string;
  options: TrainingPlanScheduleOption[];
}
export interface TrainingPlanRegistrationOptions {
  trainingPlanId: string;
  startDate: string;
  endDate: string;
  recurringRequirements: TrainingPlanRecurringRequirement[];
}
