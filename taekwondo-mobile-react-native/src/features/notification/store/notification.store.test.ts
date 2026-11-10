import { notificationRecipientApi } from '../api/notificationRecipientApi';
import { useNotificationStore } from './notification.store';

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
    getUnreadCount: jest.fn(),
  },
}));

const getUnreadCountMock = notificationRecipientApi.getUnreadCount as jest.Mock;

function resetNotificationStore() {
  useNotificationStore.setState({
    unreadCount: 0,
    hasFetched: false,
    isFetching: false,
    lastActivePersonId: null,
  });
}

describe('notification store', () => {
  beforeEach(() => {
    mockStorage.clear();
    jest.clearAllMocks();
    resetNotificationStore();
  });

  it('clamps unread count mutations to zero and whole numbers', () => {
    const store = useNotificationStore.getState();

    store.setUnreadCount(2.9);
    expect(useNotificationStore.getState().unreadCount).toBe(2);

    useNotificationStore.getState().setUnreadCount(-5);
    expect(useNotificationStore.getState().unreadCount).toBe(0);

    useNotificationStore.getState().incrementUnread(3);
    expect(useNotificationStore.getState().unreadCount).toBe(3);
  });

  it('persists only the count and active person projection', () => {
    useNotificationStore.setState({
      hasFetched: true,
      isFetching: true,
      lastActivePersonId: 'person-1',
    });

    useNotificationStore.getState().setUnreadCount(7);

    const stored = JSON.parse(mockStorage.get('notification-storage') ?? '{}');
    expect(stored.state).toEqual({
      unreadCount: 7,
      lastActivePersonId: 'person-1',
    });
    expect(stored.state.hasFetched).toBeUndefined();
    expect(stored.state.isFetching).toBeUndefined();
    expect(stored.version).toBe(2);
  });

  it('fetches once per person unless forced or the person changes', async () => {
    getUnreadCountMock.mockResolvedValue({ unreadCount: 6 });

    await useNotificationStore
      .getState()
      .fetchUnreadCount({ personId: 'person-1' });
    await useNotificationStore
      .getState()
      .fetchUnreadCount({ personId: 'person-1' });
    await useNotificationStore
      .getState()
      .fetchUnreadCount({ personId: 'person-2' });
    await useNotificationStore
      .getState()
      .fetchUnreadCount({ force: true, personId: 'person-2' });

    expect(getUnreadCountMock).toHaveBeenCalledTimes(3);
    expect(useNotificationStore.getState().unreadCount).toBe(6);
    expect(useNotificationStore.getState().lastActivePersonId).toBe('person-2');
  });

  it('zeroes the badge before refetching when the active person changes', async () => {
    getUnreadCountMock.mockResolvedValue({ unreadCount: 5 });
    await useNotificationStore
      .getState()
      .fetchUnreadCount({ personId: 'person-1' });
    expect(useNotificationStore.getState().unreadCount).toBe(5);

    let resolveNextFetch: (value: unknown) => void = () => undefined;
    getUnreadCountMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveNextFetch = resolve;
      }),
    );

    const pendingFetch = useNotificationStore
      .getState()
      .fetchUnreadCount({ personId: 'person-2' });

    expect(useNotificationStore.getState().unreadCount).toBe(0);
    expect(useNotificationStore.getState().lastActivePersonId).toBe('person-2');

    resolveNextFetch({ unreadCount: 2 });
    await pendingFetch;

    expect(useNotificationStore.getState().unreadCount).toBe(2);
    expect(useNotificationStore.getState().hasFetched).toBe(true);
  });

  it('guards concurrent fetches and releases the lock after failure', async () => {
    let resolveFetch: (value: unknown) => void = () => undefined;
    getUnreadCountMock
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
      )
      .mockRejectedValueOnce(new Error('offline'));

    const firstFetch = useNotificationStore
      .getState()
      .fetchUnreadCount({ personId: 'person-1' });
    const secondFetch = useNotificationStore
      .getState()
      .fetchUnreadCount({ personId: 'person-1' });

    expect(getUnreadCountMock).toHaveBeenCalledTimes(1);
    resolveFetch({ unreadCount: 4 });
    await Promise.all([firstFetch, secondFetch]);

    await useNotificationStore
      .getState()
      .fetchUnreadCount({ force: true, personId: 'person-1' });

    expect(getUnreadCountMock).toHaveBeenCalledTimes(2);
    expect(useNotificationStore.getState().isFetching).toBe(false);
    expect(useNotificationStore.getState().unreadCount).toBe(4);
  });

  it('keeps the badge empty and retryable when the very first fetch fails', async () => {
    getUnreadCountMock.mockRejectedValueOnce(new Error('offline'));

    await useNotificationStore
      .getState()
      .fetchUnreadCount({ personId: 'person-1' });

    expect(useNotificationStore.getState().unreadCount).toBe(0);
    expect(useNotificationStore.getState().hasFetched).toBe(false);
    expect(useNotificationStore.getState().isFetching).toBe(false);

    getUnreadCountMock.mockResolvedValueOnce({ unreadCount: 3 });
    await useNotificationStore
      .getState()
      .fetchUnreadCount({ personId: 'person-1' });

    expect(getUnreadCountMock).toHaveBeenCalledTimes(2);
    expect(useNotificationStore.getState().unreadCount).toBe(3);
  });

  it('resets count, fetch flags, and person', () => {
    useNotificationStore.setState({
      unreadCount: 9,
      hasFetched: true,
      isFetching: true,
      lastActivePersonId: 'person-1',
    });

    useNotificationStore.getState().reset();

    expect(useNotificationStore.getState()).toMatchObject({
      unreadCount: 0,
      hasFetched: false,
      isFetching: false,
      lastActivePersonId: null,
    });
  });
});

describe('notification store persistence migration', () => {
  beforeEach(() => {
    mockStorage.clear();
    jest.clearAllMocks();
  });

  it('migrates persisted v1 state by dropping the stale context key', async () => {
    mockStorage.set(
      'notification-storage',
      JSON.stringify({
        state: { unreadCount: 7, lastActiveContextId: 'ctx-1' },
        version: 1,
      }),
    );

    let isolatedStore: typeof useNotificationStore | undefined;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const module = require('./notification.store') as typeof import('./notification.store');
      isolatedStore = module.useNotificationStore;
    });

    await isolatedStore!.persist.rehydrate();

    expect(isolatedStore!.getState().unreadCount).toBe(7);
    expect(isolatedStore!.getState().lastActivePersonId).toBeNull();
  });
});
