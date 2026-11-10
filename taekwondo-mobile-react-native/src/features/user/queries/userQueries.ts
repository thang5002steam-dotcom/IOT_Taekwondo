import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { userRoleApi } from "@/features/roles";
import type { UserRoleResponse } from "@/features/roles/api/user-role.dto";
import { userPersonApi } from "@/features/person";
import type { UserPersonCreateRequest, UserPersonResponse } from "@/features/person/api/user-person.dto";
import type { UserCreateRequest, UserDetail, UserListParams, UserUpdateRequest } from "../api/user.dto";
import { userApi } from "../api/userApi";

export const USER_ADMIN_PAGE_SIZE = 200;

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params?: UserListParams) =>
    [...userKeys.lists(), { size: USER_ADMIN_PAGE_SIZE, ...params }] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
  roles: ["users", "roles"] as const,
};

export function useUsers(params?: UserListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () =>
      userApi.list({
        size: USER_ADMIN_PAGE_SIZE,
        sort: "createdAt,desc",
        ...params,
      }),
    staleTime: 30_000,
  });
}

export function useUser(id?: string) {
  return useQuery({
    queryKey: userKeys.detail(id ?? ""),
    queryFn: () => userApi.get(id as string),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useUserRoles() {
  return useQuery({
    queryKey: userKeys.roles,
    queryFn: () => userRoleApi.list({ size: USER_ADMIN_PAGE_SIZE }),
    staleTime: 30_000,
  });
}

type ReplaceUserRolesVariables = { userId: string; roleCodes: string[] };

export function useReplaceUserRoles(callbacks: {
  onSuccess?: (data: UserRoleResponse) => void | Promise<void>;
  onError?: () => void;
} = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleCodes }: ReplaceUserRolesVariables) =>
      userRoleApi.replaceForUser(userId, { roleCodes }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: userKeys.roles });
      await callbacks.onSuccess?.(data);
    },
    onError: callbacks.onError,
  });
}

type UserMutationCallbacks<TData, TVariables> = {
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: () => void;
};

type CreateUserVariables = { request: UserCreateRequest; roleCodes: string[] };

export function useCreateUser(
  callbacks: UserMutationCallbacks<UserDetail, CreateUserVariables> = {},
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ request, roleCodes }: CreateUserVariables) => {
      const created = await userApi.create(request);
      if (roleCodes.length) {
        await userRoleApi.replaceForUser(created.userId, { roleCodes });
      }
      return created;
    },
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
      await callbacks.onSuccess?.(data, variables);
    },
    onError: callbacks.onError,
  });
}

type UpdateUserVariables = { userId: string; request: UserUpdateRequest };

export function useUpdateUser(
  callbacks: UserMutationCallbacks<UserDetail, UpdateUserVariables> = {},
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, request }: UpdateUserVariables) =>
      userApi.update(userId, request),
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
      await callbacks.onSuccess?.(data, variables);
    },
    onError: callbacks.onError,
  });
}

export function useDeleteUser(callbacks: {
  onSuccess?: () => void | Promise<void>;
  onError?: () => void;
} = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: string | { userId: string; signal?: AbortSignal }) =>
      userApi.remove(typeof variables === "string" ? variables : variables.userId, typeof variables === "string" ? undefined : variables.signal),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      await callbacks.onSuccess?.();
    },
    onError: callbacks.onError,
  });
}

export function useLinkUserProfile(
  callbacks: UserMutationCallbacks<UserPersonResponse, UserPersonCreateRequest> = {},
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UserPersonCreateRequest) => userPersonApi.create(request),
    onSuccess: async (data, request) => {
      await queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: userKeys.detail(request.userId) });
      await callbacks.onSuccess?.(data, request);
    },
    onError: callbacks.onError,
  });
}

export function useInvalidateUser() {
  const queryClient = useQueryClient();
  return useCallback(
    async (userId?: string) => {
      await queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      if (userId) {
        await queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      }
    },
    [queryClient],
  );
}
