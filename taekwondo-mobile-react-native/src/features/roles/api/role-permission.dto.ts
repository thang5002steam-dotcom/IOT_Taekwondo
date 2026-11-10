export interface RolePermissionCreateRequest {
  roleCode: string;
  permissionId: number;
}

export type RolePermissionUpdateRequest = RolePermissionCreateRequest;

export interface RolePermissionReplaceRequest {
  permissionCodes: string[];
}

export interface RolePermissionResponse {
  roleCode: string;
  permissionVersion: number;
  permissionCodes: string[];
}

export interface RolePermissionItemResponse {
  roleCode: string;
  permissionId: number;
  permissionCode: string;
}

export interface RolePermissionSimpleResponse {
  roleCode: string;
  permissionId: number;
  permissionCode: string;
}

export interface RolePermissionListParams {
  page?: number;
  size?: number;
  sort?: string | string[];
}
