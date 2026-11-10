import type { UserPersonSimpleResponse } from '@/features/person/api/user-person.dto';
import type { UserSimpleResponse } from '@/features/user/api/user.dto';

export interface AuthSessionCreateRequest {
  userId: string;
  activeUserPersonId: string;
  refreshTokenHash: string;
  deviceInfo: string;
  platform: string;
  fcmToken: string;
  expiresAt: string;
  revoked: boolean;
  revokedAt: string;
  version: number;
}

export type AuthSessionUpdateRequest = AuthSessionCreateRequest;

export interface AuthSessionResponse {
  authSessionId: string;
  user: UserSimpleResponse;
  activeUserPerson: UserPersonSimpleResponse | null;
  refreshTokenHash: string;
  deviceInfo: string;
  platform: string;
  fcmToken: string;
  expiresAt: string;
  revoked: boolean;
  revokedAt: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSessionSimpleResponse {
  authSessionId: string;
  user: UserSimpleResponse;
  activeUserPerson: UserPersonSimpleResponse | null;
  deviceInfo: string;
  platform: string;
  expiresAt: string;
  revoked: boolean;
  revokedAt: string | null;
  version: number;
  createdAt: string;
}

export interface AuthSessionListParams {
  page?: number;
  size?: number;
  sort?: string | string[];
}
