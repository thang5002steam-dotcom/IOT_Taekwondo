import type { PermissionValue } from '@/features/authorization/domain/permissions';

export type AuthUserStatus =
  | 'ACTIVE'
  | 'LOCKED'
  | 'DISABLED'
  | 'BANNED'
  | 'PENDING'
  | 'DEACTIVATED'
  | (string & {});

export type SystemRole =
  | 'SUPER_ADMIN'
  | 'SYSTEM_ADMIN'
  | 'ROLE_STUDENT'
  | 'ROLE_PARENT'
  | 'ROLE_ASSISTANT'
  | 'ROLE_COACH'
  | 'ROLE_MANAGER_SENIOR'
  | 'ROLE_HEAD_COACH'
  | 'ROLE_DEVELOPER'
  | (string & {});

export type AuthContextType =
  | 'STUDENT'
  | 'COACH'
  | 'GUARDIAN'
  | 'MANAGER'
  | (string & {});

export type RelationshipType =
  | 'OWNER'
  | 'GUARDIAN'
  | 'MANAGER'
  | (string & {});

export type AuthUser = {
  userId: string;
  phoneNumber: string;
  status: AuthUserStatus;
  roles: SystemRole[];
  permissions: PermissionValue[];
};

export type UserContext = {
  userPersonId: string;
  personId: string;
  relationshipType: RelationshipType | null;
  personCode: string | null;
  displayName: string;
};

export type AuthStatus =
  | 'bootstrapping'
  | 'anonymous'
  | 'selecting-context'
  | 'authenticated'
  | 'recoverable-error';

export type AuthSnapshot = {
  user: AuthUser;
  activeContext: UserContext | null;
  availableContexts: UserContext[];
  requiresContextSelection: boolean;
};

export type AuthSession = {
  authSessionId: string;
  deviceInfo: string | null;
  platform: 'ANDROID' | 'IOS' | 'WEB';
  revoked: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  activeUserPersonId: string | null;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type SessionInvalidReason =
  | 'missing-refresh-token'
  | 'refresh-rejected'
  | 'logout'
  | 'logout-all';
