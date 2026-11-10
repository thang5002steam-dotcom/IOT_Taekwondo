import type { FitnessResponse, FitnessSimpleResponse } from './fitness.dto';
import type { PersonResponse, PersonSimpleResponse } from '@/features/person/api/person.dto';

export interface FitnessMetrics {
  duration: number;
  amount: number;
}

export interface FitnessListMetrics {
  fitnessId: number;
  duration: number;
  amount: number;
}

export interface FitnessRecordResponse {
  fitnessRecordId: number;
  student: PersonResponse;
  fitness: FitnessResponse;
  recordedByCoach: PersonResponse;
  recordDate: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export interface FitnessRecordListResponse {
  fitnessRecordId: number;
  student: PersonSimpleResponse;
  fitness: FitnessSimpleResponse;
  recordedByCoach: PersonSimpleResponse;
  recordDate: string;
  duration: number;
}

export interface FitnessRecordCreateRequest {
  studentId: string;
  fitnessId: number;
  recordedByCoachId: string;
  recordDate: string;
  duration: number;
}

export interface FitnessRecordUpdateRequest {
  studentId: string;
  fitnessId: number;
  recordedByCoachId: string;
  recordDate: string;
  duration: number;
}

export interface FitnessRecordListParams {
  page?: number;
  size?: number;
  sort?: string | string[];
}
