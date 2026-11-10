import type { RelationshipType } from '@/features/authentication/domain/auth.types';

export interface UserProfileCreateRequest {
  userId: string;
  personId: string;
  relationshipType?: RelationshipType;
}

export interface UserProfileResponse {
  userProfileId: string;
  userId: string;
  personId: string;
  relationshipType: RelationshipType;
  active: boolean;
}
