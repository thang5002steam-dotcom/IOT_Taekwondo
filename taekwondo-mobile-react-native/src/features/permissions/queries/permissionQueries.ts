import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PermissionResponse, PermissionUpdateRequest } from "../api/permission.dto";
import { permissionApi } from "../api/permissionApi";

export const PERMISSION_ADMIN_PAGE_SIZE = 200;

export const permissionKeys = {
  all: ["permissions"] as const,
  lists: () => [...permissionKeys.all, "list"] as const,
  list: () =>
    [...permissionKeys.lists(), { size: PERMISSION_ADMIN_PAGE_SIZE }] as const,
  detail: (id: number) => [...permissionKeys.all, "detail", id] as const,
};

export function usePermissionsCatalog() {
  return useQuery({
    queryKey: permissionKeys.list(),
    queryFn: () =>
      permissionApi.list({
        size: PERMISSION_ADMIN_PAGE_SIZE,
        sort: ["model,asc", "action,asc"],
      }),
    staleTime: 30_000,
  });
}

export function usePermission(id?: number) {
  return useQuery({
    queryKey: permissionKeys.detail(id ?? 0),
    queryFn: () => permissionApi.get(id as number),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useUpdatePermission(callbacks: {
  onSuccess?: (data: PermissionResponse) => void | Promise<void>;
  onError?: () => void;
} = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: PermissionUpdateRequest }) =>
      permissionApi.update(id, request),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
      await queryClient.invalidateQueries({
        queryKey: permissionKeys.detail(data.permissionId),
      });
      await callbacks.onSuccess?.(data);
    },
    onError: callbacks.onError,
  });
}
