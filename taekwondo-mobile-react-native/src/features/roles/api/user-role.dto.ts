export interface AssignUserRoleRequest {
  userId: string;
  roleCode: string;
}

export type UserRoleCreateRequest = AssignUserRoleRequest;
export type UserRoleUpdateRequest = AssignUserRoleRequest;

export interface UserRoleReplaceRequest {
  roleCodes: string[];
}

export interface UserRoleResponse {
  userId: string;
  roleCodes: string[];
}

export interface UserRoleItemResponse {
  userId: string;
  roleCode: string;
}

export interface UserRoleSimpleResponse {
  userId: string;
  roleCode: string;
}

export interface UserRoleListParams {
  page?: number;
  size?: number;
  sort?: string | string[];
}
