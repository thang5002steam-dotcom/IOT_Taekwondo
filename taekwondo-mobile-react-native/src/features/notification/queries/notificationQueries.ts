import {
  infiniteQueryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";

import type { PageResponse } from "@/infrastructure/http/pagination.types";

import type {
  NotificationRecipientMine,
  UnreadCountResponse,
} from "../api/notification.dto";
import { notificationRecipientApi } from "../api/notificationRecipientApi";
import type { NotificationType } from "../constants/notification.constants";
import { useNotificationStore } from "../store/notification.store";

export const DEFAULT_NOTIFICATION_PAGE_SIZE = 30;

export interface NotificationFilters {
  read?: boolean;
  search?: string;
  type?: NotificationType;
  size?: number;
}

export const notificationTypes = [
  "SYSTEM",
  "ATTENDANCE",
  "TUITION",
  "CLASS_SCHEDULE",
  "COACH_TIMESHEET",
  "ANNOUNCEMENT",
  "CLASS_SESSION_REPORT",
] as const satisfies readonly NotificationType[];

const notificationTypeSet = new Set<string>(notificationTypes);
const pendingMarkReadIds = new Set<string>();

export type NotificationListFilters = Required<Pick<NotificationFilters, "size">> &
  Pick<NotificationFilters, "read" | "search" | "type">;

export type NotificationInfiniteData = InfiniteData<
  PageResponse<NotificationRecipientMine>,
  number
>;

type MarkReadMutationContext = {
  detailSnapshot?: NotificationRecipientMine;
  listSnapshots: [QueryKey, NotificationInfiniteData | undefined][];
};

type MarkAllMutationContext = {
  detailSnapshots: [QueryKey, NotificationRecipientMine | undefined][];
  listSnapshots: [QueryKey, NotificationInfiniteData | undefined][];
};

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (filters: NotificationFilters) =>
    [...notificationKeys.lists(), normalizeNotificationFilters(filters)] as const,
  details: () => [...notificationKeys.all, "detail"] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
};

export function isNotificationType(
  value?: string | null,
): value is NotificationType {
  return Boolean(value && notificationTypeSet.has(value));
}

export function normalizeNotificationFilters(
  filters: NotificationFilters = {},
): NotificationListFilters {
  const normalizedSearch = filters.search?.trim();
  return {
    read: filters.read,
    search: normalizedSearch || undefined,
    type: isNotificationType(filters.type) ? filters.type : undefined,
    size: filters.size ?? DEFAULT_NOTIFICATION_PAGE_SIZE,
  };
}

export function notificationListQueryOptions(filters: NotificationFilters = {}) {
  const normalizedFilters = normalizeNotificationFilters(filters);

  return infiniteQueryOptions({
    queryKey: notificationKeys.list(normalizedFilters),
    queryFn: ({ pageParam }) =>
      notificationRecipientApi.getMine({
        ...normalizedFilters,
        page: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.pageNumber + 1,
    staleTime: 45_000,
  });
}

export function prefetchNotifications(
  queryClient: QueryClient,
  filters: NotificationFilters = {},
) {
  void queryClient.prefetchInfiniteQuery(notificationListQueryOptions(filters));
}

export function isNotificationMarkReadPending(id: string) {
  return pendingMarkReadIds.has(id);
}

function updateDetailAsRead(
  old: NotificationRecipientMine | undefined,
): NotificationRecipientMine | undefined {
  if (!old) return old;
  return { ...old, read: true };
}

function updateInfiniteDataAfterMarkRead(
  old: NotificationInfiniteData | undefined,
  id: string,
): NotificationInfiniteData | undefined {
  if (!old) return old;

  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      content: page.content.map((item) =>
        item.notificationRecipientId === id ? { ...item, read: true } : item,
      ),
    })),
  };
}

function updateInfiniteDataAfterMarkAll(
  old: NotificationInfiniteData | undefined,
): NotificationInfiniteData | undefined {
  if (!old) return old;

  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      content: page.content.map((item) =>
        item.read ? item : { ...item, read: true },
      ),
    })),
  };
}

export function useNotifications(filters: NotificationFilters) {
  return useInfiniteQuery(notificationListQueryOptions(filters));
}

export function useNotificationDetail(notificationRecipientId?: string) {
  return useQuery({
    queryKey: notificationKeys.detail(notificationRecipientId ?? ""),
    queryFn: () =>
      notificationRecipientApi.getMineDetail(notificationRecipientId as string),
    enabled: Boolean(notificationRecipientId),
    staleTime: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation<UnreadCountResponse, Error, string, MarkReadMutationContext>({
    mutationFn: notificationRecipientApi.markRead,
    retry: 1,
    onMutate: async (id) => {
      pendingMarkReadIds.add(id);
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const detailKey = notificationKeys.detail(id);
      const detailSnapshot =
        queryClient.getQueryData<NotificationRecipientMine>(detailKey);
      const listSnapshots = queryClient.getQueriesData<NotificationInfiniteData>(
        { queryKey: notificationKeys.lists() },
      );

      queryClient.setQueryData<NotificationRecipientMine>(
        detailKey,
        updateDetailAsRead,
      );
      queryClient.setQueriesData<NotificationInfiniteData>(
        { queryKey: notificationKeys.lists() },
        (old) => updateInfiniteDataAfterMarkRead(old, id),
      );

      return {
        detailSnapshot,
        listSnapshots,
      };
    },
    onSuccess: (response) => {
      useNotificationStore.getState().setUnreadCount(response.unreadCount);
    },
    onError: (_error, id, context) => {
      queryClient.setQueryData(
        notificationKeys.detail(id),
        context?.detailSnapshot,
      );

      for (const [queryKey, data] of context?.listSnapshots ?? []) {
        queryClient.setQueryData(queryKey, data);
      }
    },
    onSettled: (_data, _error, id) => {
      pendingMarkReadIds.delete(id);
      void queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.detail(id),
      });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation<UnreadCountResponse, Error, void, MarkAllMutationContext>({
    mutationFn: () => notificationRecipientApi.markAllRead(),
    retry: 1,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const detailSnapshots =
        queryClient.getQueriesData<NotificationRecipientMine>({
          queryKey: notificationKeys.details(),
        });
      const listSnapshots = queryClient.getQueriesData<NotificationInfiniteData>(
        { queryKey: notificationKeys.lists() },
      );

      queryClient.setQueriesData<NotificationRecipientMine>(
        { queryKey: notificationKeys.details() },
        updateDetailAsRead,
      );
      queryClient.setQueriesData<NotificationInfiniteData>(
        { queryKey: notificationKeys.lists() },
        updateInfiniteDataAfterMarkAll,
      );

      return { detailSnapshots, listSnapshots };
    },
    onSuccess: (response) => {
      useNotificationStore.getState().setUnreadCount(response.unreadCount);
    },
    onError: (_error, _variables, context) => {
      for (const [queryKey, data] of context?.detailSnapshots ?? []) {
        queryClient.setQueryData(queryKey, data);
      }
      for (const [queryKey, data] of context?.listSnapshots ?? []) {
        queryClient.setQueryData(queryKey, data);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.details(),
      });
    },
  });
}
