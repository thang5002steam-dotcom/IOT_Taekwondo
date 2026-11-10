import type {
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Generic GET query hook.
 *
 * @example
 * ```ts
 * // Simple usage
 * const { data, isLoading } = useGetQuery<User[]>(
 *   ["users"],
 *   () => userAPI.getAll(),
 * );
 *
 * // With profile-aware key (auto refetch on switchProfile)
 * const { data } = useGetQuery<StudentAttendanceListResponse>(
 *   ["attendance", profileId],
 *   () => attendanceAPI.filter(profileId),
 *   { enabled: !!profileId },
 * );
 *
 * // With all UseQueryOptions forwarded
 * const { data } = useGetQuery<Schedules>(
 *   ["schedules", params],
 *   () => scheduleAPI.getAll(params),
 *   { enabled: open, staleTime: 60_000 },
 * );
 * ```
 */
export function useGetQuery<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T, Error, T, QueryKey>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
  });
}

/**
 * Generic mutation hook that auto-invalidates specified query keys on success.
 *
 * @example
 * ```ts
 * // Simple: invalidate "students" key on success
 * const createStudent = useGenericMutation<StudentDetail, StudentCreateRequest>(
 *   (data) => studentAPI.create(data),
 *   [["students"]],
 * );
 *
 * // Multiple keys
 * const updateStudent = useGenericMutation<StudentDetail, UpdateVars>(
 *   (vars) => studentAPI.update(vars.id, vars.data),
 *   [["students"], ["students", vars.staffCode]],
 * );
 *
 * // With custom onSuccess callback (runs AFTER invalidation)
 * const deleteCoach = useGenericMutation<void, number>(
 *   (id) => coachAPI.delete(id),
 *   [["coaches"]],
 *   {
 *     onSuccess: () => toast.success("Đã xóa HLV"),
 *   },
 * );
 * ```
 */
export function useGenericMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidateKeys: QueryKey[],
  options?: {
    onSuccess?: (data: TData, variables: TVariables, context: unknown) => void;
    onError?: (error: Error, variables: TVariables, context: unknown) => void;
  },
) {
  const queryClient = useQueryClient();

  return useMutation<
    TData,
    Error,
    TVariables,
    unknown
  >({
    mutationFn,
    onSuccess: (data, variables, context) => {
      for (const key of invalidateKeys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
      options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError as
      | UseMutationOptions<TData, Error, TVariables, unknown>["onError"]
      | undefined,
  });
}

/**
 * Plain mutation hook WITHOUT auto-invalidation.
 * Use when you need full control over onSuccess logic (e.g. targeted invalidation
 * based on mutation variables, or no invalidation at all).
 *
 * @example
 * ```ts
 * const updateStatus = usePlainMutation(
 *   ({ id, status }: { id: string; status: ScheduleStatus }) =>
 *     scheduleAPI.changeStatus(id, status),
 *   {
 *     onSuccess: () => toast.success("Cập nhật thành công"),
 *   },
 * );
 * ```
 */
export function usePlainMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<
    UseMutationOptions<TData, Error, TVariables, unknown>,
    "mutationFn"
  >,
) {
  return useMutation<TData, Error, TVariables, unknown>({
    mutationFn,
    ...options,
  });
}
