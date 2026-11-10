import type { PermissionAction } from '../constants/permissions.constants';

export interface PermissionCreateRequest {
  code: string;
  model: string;
  action: PermissionAction;
  description: string;
}

export type PermissionUpdateRequest = PermissionCreateRequest;

export interface PermissionResponse {
  permissionId: number;
  code: string;
  model: string;
  action: PermissionAction;
  description: string;
}

export interface PermissionSimpleResponse {
  permissionId: number;
  code: string;
  model: string;
  action: PermissionAction;
}

export interface PermissionListParams {
  page?: number;
  size?: number;
  sort?: string | string[];
}
