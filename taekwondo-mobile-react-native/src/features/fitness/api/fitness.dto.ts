import type { ScheduleLevel } from '@/features/class-schedule/constants/class-schedule.constants';

export interface FitnessThreshold {
  fitnessLevel: number;
  skillLevel: ScheduleLevel;
  scheduleLevel?: ScheduleLevel;
  duration: number;
  amount: number;
}

export interface FitnessCreateRequest {
  scheduleLevel: ScheduleLevel;
  amount: number;
  duration: number;
}

export type FitnessUpdateRequest = FitnessCreateRequest;

export interface FitnessResponse {
  fitnessId: number;
  scheduleLevel: ScheduleLevel;
  amount: number;
  duration: number;
}

export type FitnessSimpleResponse = FitnessResponse;

export interface FitnessListParams {
  page?: number;
  size?: number;
  sort?: string | string[];
}
