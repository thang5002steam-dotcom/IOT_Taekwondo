import type {
  PermissionResponse,
  PermissionSimpleResponse,
} from "@/features/permissions/api/permission.dto";

export interface RoleCreateRequest {
  code: string;
  name: string;
  description: string;
  permissionVersion: number;
}

export interface RoleUpdateRequest {
  name: string;
  description: string;
  permissionVersion: number;
}

export interface RoleResponse {
  code: string;
  name: string;
  description: string;
  permissionVersion: number;
  permissions?: PermissionResponse[];
}

export interface RoleBriefResponse {
  code: string;
  name: string;
  permissionVersion?: number;
}

export interface RoleSimpleResponse {
  code: string;
  name: string;
  permissionVersion: number;
  permissions?: PermissionSimpleResponse[];
}

export interface RoleListParams {
  page?: number;
  size?: number;
  sort?: string | string[];
}
