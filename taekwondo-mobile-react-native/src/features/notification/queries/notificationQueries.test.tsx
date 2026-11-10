import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import type { PageResponse } from '@/infrastructure/http/pagination.types';

import type { NotificationRecipientMine } from '../api/notification.dto';
import { notificationRecipientApi } from '../api/notificationRecipientApi';
import { useNotificationStore } from '../store/notification.store';
import {
  notificationKeys,
  type NotificationInfiniteData,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from './notificationQueries';

const mockStorage = new Map<string, string>();

jest.mock('@/infrastructure/storage/zustandKeyValueStorage', () => ({
  zustandKeyValueStorage: {
    getItem: jest.fn((name: string) => Promise.resolve(mockStorage.get(name) ?? null)),
    setItem: jest.fn((name: string, value: string) => {
      mockStorage.set(name, value);
      return Promise.resolve();
    }),
    removeItem: jest.fn((name: string) => {
      mockStorage.delete(name);
      return Promise.resolve();
    }),
  },
}));

jest.mock('../api/notificationRecipientApi', () => ({
  notificationRecipientApi: {
    markRead: jest.fn(),
    markAllRead: jest.fn(),
  },
}));

const markReadMock = notificationRecipientApi.markRead as jest.Mock;
const markAllReadMock = notificationRecipientApi.markAllRead as jest.Mock;

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { gcTime: Infinity, retry: false },
      mutations: { gcTime: Infinity, retry: false },
    },
  });
}

function renderWithClient<T>(queryClient: QueryClient, hook: () => T) {
  return renderHook(hook, {
    wrapper: ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

function resetNotificationStore(unreadCount = 0) {
  useNotificationStore.setState({
    unreadCount,
    hasFetched: false,
    isFetching: false,
    lastActivePersonId: null,
  });
}

function listKey() {
  return notificationKeys.list({ size: 30 });
}

function page(
  content: NotificationRecipientMine[],
  overrides: Partial<PageResponse<NotificationRecipientMine>> = {},
): PageResponse<NotificationRecipientMine> {
  return {
    content,
    pageNumber: 0,
    pageSize: 30,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
    ...overrides,
  };
}

function infiniteData(
  content: NotificationRecipientMine[],
): NotificationInfiniteData {
  return { pages: [page(content)], pageParams: [0] };
}

function recipient(
  notificationRecipientId: string,
  read: boolean,
): NotificationRecipientMine {
  return {
    notificationRecipientId,
    notificationId: `notification-${notificationRecipientId}`,
    contextPersonId: null,
    title: 'Thông báo',
    body: 'Nội dung',
    notificationType: 'SYSTEM',
    referenceType: null,
    referenceId: null,
    payload: null,
    read,
    readAt: read ? '2026-09-09T00:00:00Z' : null,
    deliveredAt: null,
    notificationRecipientStatus: 'SENT',
    createdAt: '2026-09-09T00:00:00Z',
  };
}

describe('notification mark-read mutation', () => {
  beforeEach(() => {
    mockStorage.clear();
    jest.clearAllMocks();
    resetNotificationStore();
  });

  it('marks the item read optimistically and applies the authoritative unread count', async () => {
    const queryClient = createClient();
    const id = 'recipient-1';
    queryClient.setQueryData(notificationKeys.detail(id), recipient(id, false));
    queryClient.setQueryData(listKey(), infiniteData([recipient(id, false)]));
    resetNotificationStore(3);
    markReadMock.mockResolvedValue({ unreadCount: 2 });

    const hook = await renderWithClient(queryClient, useMarkNotificationRead);

    await act(async () => {
      await hook.result.current.mutateAsync(id);
    });

    expect(useNotificationStore.getState().unreadCount).toBe(2);
    expect(
      queryClient.getQueryData<NotificationRecipientMine>(
        notificationKeys.detail(id),
      )?.read,
    ).toBe(true);
    expect(
      queryClient.getQueryData<NotificationInfiniteData>(listKey())?.pages[0]
        .content[0].read,
    ).toBe(true);

    hook.unmount();
    queryClient.clear();
  });

  it('keeps the server count when the notification was already read', async () => {
    const queryClient = createClient();
    const id = 'recipient-1';
    queryClient.setQueryData(notificationKeys.detail(id), recipient(id, true));
    resetNotificationStore(3);
    markReadMock.mockResolvedValue({ unreadCount: 3 });

    const hook = await renderWithClient(queryClient, useMarkNotificationRead);

    await act(async () => {
      await hook.result.current.mutateAsync(id);
    });

    expect(useNotificationStore.getState().unreadCount).toBe(3);
    hook.unmount();
    queryClient.clear();
  });

  it('rolls the cache back and keeps the last authoritative count when the request fails', async () => {
    const queryClient = createClient();
    const id = 'recipient-1';
    queryClient.setQueryData(notificationKeys.detail(id), recipient(id, false));
    queryClient.setQueryData(listKey(), infiniteData([recipient(id, false)]));
    resetNotificationStore(3);
    markReadMock.mockRejectedValue(new Error('offline'));

    const hook = await renderWithClient(queryClient, useMarkNotificationRead);

    await act(async () => {
      await expect(hook.result.current.mutateAsync(id)).rejects.toThrow('offline');
    });

    expect(useNotificationStore.getState().unreadCount).toBe(3);
    expect(
      queryClient.getQueryData<NotificationRecipientMine>(
        notificationKeys.detail(id),
      )?.read,
    ).toBe(false);
    expect(
      queryClient.getQueryData<NotificationInfiniteData>(listKey())?.pages[0]
        .content[0].read,
    ).toBe(false);

    hook.unmount();
    queryClient.clear();
  });

  it('applies the server count for deep-link items that are not cached', async () => {
    const queryClient = createClient();
    resetNotificationStore(2);
    markReadMock.mockResolvedValue({ unreadCount: 1 });

    const hook = await renderWithClient(queryClient, useMarkNotificationRead);

    await act(async () => {
      await hook.result.current.mutateAsync('missing-recipient');
    });

    expect(useNotificationStore.getState().unreadCount).toBe(1);
    hook.unmount();
    queryClient.clear();
  });
});

describe('notification read-all mutation', () => {
  beforeEach(() => {
    mockStorage.clear();
    jest.clearAllMocks();
    resetNotificationStore();
  });

  it('marks every cached notification read and applies the authoritative unread count', async () => {
    const queryClient = createClient();
    const id = 'recipient-1';
    queryClient.setQueryData(notificationKeys.detail(id), recipient(id, false));
    queryClient.setQueryData(
      listKey(),
      infiniteData([recipient(id, false), recipient('recipient-2', true)]),
    );
    resetNotificationStore(3);
    markAllReadMock.mockResolvedValue({ unreadCount: 0 });

    const hook = await renderWithClient(queryClient, useMarkAllNotificationsRead);

    await act(async () => {
      await hook.result.current.mutateAsync();
    });

    expect(useNotificationStore.getState().unreadCount).toBe(0);
    expect(
      queryClient.getQueryData<NotificationRecipientMine>(
        notificationKeys.detail(id),
      )?.read,
    ).toBe(true);
    expect(
      queryClient
        .getQueryData<NotificationInfiniteData>(listKey())
        ?.pages[0].content.map((item) => item.read),
    ).toEqual([true, true]);
    expect(markAllReadMock).toHaveBeenCalledTimes(1);

    hook.unmount();
    queryClient.clear();
  });

  it('rolls back cached notifications when read-all fails', async () => {
    const queryClient = createClient();
    const id = 'recipient-1';
    queryClient.setQueryData(notificationKeys.detail(id), recipient(id, false));
    queryClient.setQueryData(listKey(), infiniteData([recipient(id, false)]));
    resetNotificationStore(3);
    markAllReadMock.mockRejectedValue(new Error('offline'));

    const hook = await renderWithClient(queryClient, useMarkAllNotificationsRead);

    await act(async () => {
      await expect(hook.result.current.mutateAsync()).rejects.toThrow('offline');
    });

    expect(useNotificationStore.getState().unreadCount).toBe(3);
    expect(
      queryClient.getQueryData<NotificationRecipientMine>(
        notificationKeys.detail(id),
      )?.read,
    ).toBe(false);
    expect(
      queryClient.getQueryData<NotificationInfiniteData>(listKey())?.pages[0]
        .content[0].read,
    ).toBe(false);

    hook.unmount();
    queryClient.clear();
  });
});
