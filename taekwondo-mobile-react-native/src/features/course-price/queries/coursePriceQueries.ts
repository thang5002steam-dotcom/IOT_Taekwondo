import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { coursePriceApi } from '../api/coursePriceApi';
import type {
  CoursePriceCreateRequest,
  CoursePriceListParams,
  CoursePriceUpdateRequest,
} from '../api/course-price.dto';

export const coursePriceKeys = {
  all: ['course-prices'] as const,
  lists: () => [...coursePriceKeys.all, 'list'] as const,
  list: (params?: CoursePriceListParams) => [...coursePriceKeys.lists(), params] as const,
  courseList: (courseId?: string) => [...coursePriceKeys.all, 'course', courseId ?? ''] as const,
  detail: (coursePriceId: string) => [...coursePriceKeys.all, 'detail', coursePriceId] as const,
};

export function useCoursePrices(
  courseId?: string,
  params?: Omit<CoursePriceListParams, 'courseId'>,
) {
  return useQuery({
    queryKey: coursePriceKeys.list({ courseId, ...params }),
    queryFn: async () => {
      const response = await coursePriceApi.list({
        courseId: courseId || undefined,
        size: params?.size ?? 50,
        ...params,
      });
      return response;
    },
    enabled: courseId !== undefined,
  });
}

export function useCoursePriceDetail(coursePriceId?: string) {
  return useQuery({
    queryKey: coursePriceKeys.detail(coursePriceId ?? ''),
    queryFn: () => coursePriceApi.get(coursePriceId as string),
    enabled: Boolean(coursePriceId),
  });
}

export function useCreateCoursePrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CoursePriceCreateRequest) =>
      coursePriceApi.create(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: coursePriceKeys.all });
    },
  });
}

export function useUpdateCoursePrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      coursePriceId,
      request,
    }: {
      coursePriceId: string;
      request: CoursePriceUpdateRequest;
    }) => coursePriceApi.update(coursePriceId, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: coursePriceKeys.all });
    },
  });
}

export function useDeleteCoursePrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      coursePriceId,
      signal,
    }: {
      coursePriceId: string;
      signal?: AbortSignal;
    }) => coursePriceApi.remove(coursePriceId, { signal }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: coursePriceKeys.all });
    },
  });
}
