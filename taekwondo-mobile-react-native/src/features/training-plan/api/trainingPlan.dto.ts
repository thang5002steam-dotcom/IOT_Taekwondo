import type {
  AddonStatus,
  ScheduleLevel,
  SessionType,
  TrainingPlanStatus,
} from "../constants/training-plan.constants";

export type {
  AddonStatus,
  ScheduleLevel,
  SessionType,
  TrainingPlanStatus,
};
export interface TrainingPlanBriefResponse { trainingPlanId: string; name: string; level: ScheduleLevel; status: TrainingPlanStatus }
export interface TrainingPlanSimpleResponse extends TrainingPlanBriefResponse { durationMonths: number; includedSessionCount: number; basePrice: number; finalPrice: number }
export interface TrainingPlanRequirementSimpleResponse { trainingPlanRequirementId: string; trainingPlanId: string; sessionType: SessionType; sessionsPerWeek: number }
export interface TrainingPlanAccessRuleSimpleResponse { trainingPlanAccessRuleId: string; trainingPlanId: string; targetCourseId: string; targetCourseName: string; sessionType: SessionType }
export interface TrainingPlanAddonSimpleResponse { trainingPlanAddonId: string; trainingPlanId: string; name: string; extraSessionsPerWeek: number; price: number; status: AddonStatus }
export interface TrainingPlanResponse extends TrainingPlanSimpleResponse { createdAt: string; updatedAt: string; requirements: TrainingPlanRequirementSimpleResponse[]; accessRules: TrainingPlanAccessRuleSimpleResponse[]; addons: TrainingPlanAddonSimpleResponse[] }
export interface TrainingPlanCreateRequest { name: string; level: ScheduleLevel; durationMonths: number; includedSessionCount: number; basePrice: number; finalPrice: number; status: TrainingPlanStatus }
export type TrainingPlanUpdateRequest = TrainingPlanCreateRequest;
export interface TrainingPlanRequirementResponse extends Omit<TrainingPlanRequirementSimpleResponse, 'trainingPlanId'> { trainingPlan: TrainingPlanBriefResponse }
export interface TrainingPlanRequirementCreateRequest { trainingPlanId: string; sessionType: SessionType; sessionsPerWeek: number }
export type TrainingPlanRequirementUpdateRequest = Omit<TrainingPlanRequirementCreateRequest, 'trainingPlanId'>;
export interface TrainingPlanAccessRuleResponse extends Omit<TrainingPlanAccessRuleSimpleResponse, 'trainingPlanId' | 'targetCourseId' | 'targetCourseName'> { trainingPlan: TrainingPlanBriefResponse; targetCourse: { courseId: string; name: string } }
export interface TrainingPlanAccessRuleCreateRequest { trainingPlanId: string; targetCourseId: string; sessionType: SessionType }
export type TrainingPlanAccessRuleUpdateRequest = Omit<TrainingPlanAccessRuleCreateRequest, 'trainingPlanId'>;
export interface TrainingPlanAddonResponse extends Omit<TrainingPlanAddonSimpleResponse, 'trainingPlanId'> { trainingPlan: TrainingPlanBriefResponse }
export interface TrainingPlanAddonCreateRequest { trainingPlanId: string; name: string; extraSessionsPerWeek: number; price: number; status: AddonStatus }
export type TrainingPlanAddonUpdateRequest = Omit<TrainingPlanAddonCreateRequest, 'trainingPlanId'>;
export interface TrainingPlanListParams { page?: number; size?: number; sort?: string | string[]; status?: TrainingPlanStatus; level?: ScheduleLevel }
export interface TrainingPlanChildListParams { page?: number; size?: number; sort?: string | string[]; trainingPlanId?: string }
export interface TrainingPlanAddonListParams extends TrainingPlanChildListParams { status?: AddonStatus }
