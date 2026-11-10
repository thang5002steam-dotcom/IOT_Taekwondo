import type { PersonResponse, PersonSimpleResponse } from '@/features/person/api/person.dto';
import type { Belt } from '@/features/person/constants/person.constants';
import type { UserSimpleResponse } from '@/features/user/api/user.dto';
import type { BeltExamResult, BeltExamType } from '../constants/belt-exam.constants';

export interface BeltExamCreateRequest {
  personId: string;
  fromBelt: Belt;
  targetBelt: Belt;
  year: number;
  quarter: number;
  examDate?: string | null;
  result?: BeltExamResult | null;
  note?: string | null;
  createdByUserId: string;
  type: BeltExamType;
}

export interface BeltExamUpdateRequest extends BeltExamCreateRequest {
  result: BeltExamResult;
}

export interface BeltExamResponse {
  beltExamId: string;
  person: PersonResponse;
  fromBelt: Belt;
  targetBelt: Belt;
  year: number;
  quarter: number;
  examDate: string | null;
  result: BeltExamResult | null;
  note: string | null;
  createdByUser: UserSimpleResponse | null;
  createdAt: string;
  updatedAt: string;
  type: BeltExamType;
}

export interface BeltExamSimpleResponse {
  beltExamId: string;
  person: PersonSimpleResponse;
  fromBelt: Belt;
  targetBelt: Belt;
  year: number;
  quarter: number;
  examDate: string | null;
  result: BeltExamResult | null;
  type: BeltExamType;
}

export interface BeltExamListParams {
  page?: number;
  size?: number;
  sort?: string | string[];
}
