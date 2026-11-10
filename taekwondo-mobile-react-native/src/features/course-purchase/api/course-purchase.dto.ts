import type { CoursePriceResponse, CoursePriceSimpleResponse } from '@/features/course-price/api/course-price.dto';
import type { PersonResponse, PersonSimpleResponse } from '@/features/person/api/person.dto';

export interface CoursePurchaseCreateRequest {
  studentPersonId: string;
  coursePriceId: string;
  debitTransactionId: string;
}

export type CoursePurchaseUpdateRequest = CoursePurchaseCreateRequest;

export interface CoursePurchaseResponse {
  coursePurchaseId: string;
  studentPerson: PersonResponse;
  coursePrice: CoursePriceResponse;
  debitTransactionId: string;
}

export interface CoursePurchaseSimpleResponse {
  coursePurchaseId: string;
  studentPerson: PersonSimpleResponse;
  coursePrice: CoursePriceSimpleResponse;
  debitTransactionId: string;
}

export interface CoursePurchaseListParams {
  page?: number;
  size?: number;
  sort?: string | string[];
}
