import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { RoleCreateRequest, RoleResponse, RoleUpdateRequest } from "../api/role.dto";
import { roleApi } from "../api/roleApi";
import { rolePermissionApi } from "../api/rolePermissionApi";

type MutationCallbacks<TData, TVariables> = {
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: Error, variables: TVariables) => void;
};

export const ROLE_ADMIN_PAGE_SIZE = 200;

export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: () => [...roleKeys.lists(), { size: ROLE_ADMIN_PAGE_SIZE }] as const,
  detail: (code: string) => [...roleKeys.all, "detail", code] as const,
  permissions: ["roles", "permissions"] as const,
};

export function useRoles() {
  return useQuery({
    queryKey: roleKeys.list(),
    queryFn: () =>
      roleApi.list({ size: ROLE_ADMIN_PAGE_SIZE, sort: "name,asc" }),
    staleTime: 30_000,
  });
}

export function useRole(code?: string) {
  return useQuery({
    queryKey: roleKeys.detail(code ?? ""),
    queryFn: () => roleApi.get(code as string),
    enabled: Boolean(code),
    staleTime: 30_000,
  });
}

export function useRolePermissions() {
  return useQuery({
    queryKey: roleKeys.permissions,
    queryFn: () => rolePermissionApi.list({ size: ROLE_ADMIN_PAGE_SIZE }),
    staleTime: 30_000,
  });
}

export function useCreateRole(
  callbacks: MutationCallbacks<RoleResponse, RoleCreateRequest> = {},
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: RoleCreateRequest) => roleApi.create(request),
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      await callbacks.onSuccess?.(data, variables);
    },
    onError: callbacks.onError,
  });
}

type UpdateRoleVariables = { code: string; request: RoleUpdateRequest };

export function useUpdateRole(
  callbacks: MutationCallbacks<RoleResponse, UpdateRoleVariables> = {},
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, request }: UpdateRoleVariables) =>
      roleApi.update(code, request),
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: roleKeys.all });
      await callbacks.onSuccess?.(data, variables);
    },
    onError: callbacks.onError,
  });
}

type DeleteRoleVariables = string | { roleCode: string; signal?: AbortSignal };

export function useDeleteRole(
  callbacks: MutationCallbacks<void, string> = {},
) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeleteRoleVariables>({
    mutationFn: (variables) =>
      roleApi.remove(
        typeof variables === "string" ? variables : variables.roleCode,
        typeof variables === "string" ? undefined : variables.signal,
      ),
    onSuccess: async (data, variables) => {
      const roleCode =
        typeof variables === "string" ? variables : variables.roleCode;
      await queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      await callbacks.onSuccess?.(data, roleCode);
    },
    onError: (error, variables) => {
      const roleCode =
        typeof variables === "string" ? variables : variables.roleCode;
      callbacks.onError?.(error, roleCode);
    },
  });
}

type ReplaceRolePermissionsVariables = {
  roleCode: string;
  permissionCodes: string[];
};

export function useReplaceRolePermissions(
  callbacks: MutationCallbacks<unknown, ReplaceRolePermissionsVariables> = {},
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleCode, permissionCodes }: ReplaceRolePermissionsVariables) =>
      rolePermissionApi.replaceForRole(roleCode, { permissionCodes }),
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: roleKeys.all });
      await callbacks.onSuccess?.(data, variables);
    },
    onError: callbacks.onError,
  });
}
