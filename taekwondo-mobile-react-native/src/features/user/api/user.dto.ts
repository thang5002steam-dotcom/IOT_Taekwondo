import type { RelationshipType } from "@/features/authentication/domain/auth.types";
import type {
  PersonBriefResponse,
  PersonSimpleResponse,
} from "@/features/person";
import type { Belt } from "@/features/person/constants/person.constants";
import type { RoleBriefResponse } from "@/features/roles";
import type { UserStatus } from "../constants/user.constants";

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserCreateRequest {
  phoneNumber: string;
  passwordHash: string;
  personId?: string | null;
  person?: unknown;
  relationshipType: RelationshipType;
}

export interface UserUpdateRequest {
  phoneNumber: string;
  passwordHash: string;
  status: UserStatus;
  lastLoginAt: string;
  authorizationVersion: number;
}

export interface UserInfo {
  idUser: string;
  userCode: string;
  idRole: string;
}

export interface UserProfileSummary {
  birthDate: string;
  isActive: boolean;
  name: string;
  phone: string;
  belt: Belt;
}

export interface UserResponse {
  userId: string;
  phoneNumber: string;
  status: UserStatus;
  authorizationVersion: number;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  persons: PersonBriefResponse[];
  roles: RoleBriefResponse[];
}

export interface UserDetail {
  userId: string;
  phoneNumber: string | null;
  status: UserStatus | null;
  authorizationVersion?: number;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  persons: PersonSimpleResponse[];
  roles: RoleBriefResponse[];
}

export interface UserSimpleResponse {
  userId: string;
  phoneNumber: string;
  status: UserStatus | null;
  lastLoginAt: string | null;
  persons: PersonBriefResponse[];
}

export interface UserListParams {
  page?: number;
  size?: number;
  sort?: string | string[];
  search?: string;
}
