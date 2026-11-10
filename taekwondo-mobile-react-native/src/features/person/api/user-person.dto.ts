import type { RelationshipType } from '@/features/authentication/domain/auth.types';
import type { PersonResponse, PersonSimpleResponse } from '@/features/person/api/person.dto';
import type { UserSimpleResponse } from '@/features/user/api/user.dto';

export interface UserPersonCreateRequest {
  userId: string;
  personId: string;
  relationshipType: RelationshipType;
  active: boolean;
}

export type UserPersonUpdateRequest = UserPersonCreateRequest;

export interface UserPersonResponse {
  userPersonId: string;
  user: UserSimpleResponse;
  person: PersonResponse;
  relationshipType: RelationshipType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPersonSimpleResponse {
  userPersonId: string;
  user: UserSimpleResponse;
  person: PersonSimpleResponse;
  relationshipType: RelationshipType;
  active: boolean;
}

export interface UserPersonListParams {
  personId?: string;
  page?: number;
  size?: number;
  sort?: string | string[];
}
