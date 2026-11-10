import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandKeyValueStorage } from '@/infrastructure/storage/zustandKeyValueStorage';

import { notificationRecipientApi } from '../api/notificationRecipientApi';

type FetchUnreadCountOptions = {
  force?: boolean;
  personId?: string | null;
};

export interface NotificationState {
  unreadCount: number;
  hasFetched: boolean;
  isFetching: boolean;
  lastActivePersonId: string | null;
  setUnreadCount: (count: number) => void;
  incrementUnread: (by?: number) => void;
  fetchUnreadCount: (options?: FetchUnreadCountOptions) => Promise<void>;
  reset: () => void;
}

type PersistedNotificationState = Pick<
  NotificationState,
  'unreadCount' | 'lastActivePersonId'
>;

const STORAGE_KEY = 'notification-storage';

function clampUnreadCount(count: number): number {
  if (!Number.isFinite(count)) return 0;
  return Math.max(0, Math.floor(count));
}

export const useNotificationStore = create<NotificationState>()(
  persist<NotificationState, [], [], PersistedNotificationState>(
    (set, get) => ({
      unreadCount: 0,
      hasFetched: false,
      isFetching: false,
      lastActivePersonId: null,

      setUnreadCount: (count) => {
        set({ unreadCount: clampUnreadCount(count) });
      },

      incrementUnread: (by = 1) => {
        set((state) => ({
          unreadCount: clampUnreadCount(state.unreadCount + by),
        }));
      },

      fetchUnreadCount: async (options = {}) => {
        const nextPersonId = options.personId ?? null;
        const state = get();
        const isSamePerson = state.lastActivePersonId === nextPersonId;

        if (state.isFetching) return;
        if (!options.force && state.hasFetched && isSamePerson) return;

        // Switching person must not keep showing the previous person's badge.
        set(
          isSamePerson
            ? { isFetching: true }
            : { unreadCount: 0, hasFetched: false, isFetching: true, lastActivePersonId: nextPersonId },
        );

        try {
          const response = await notificationRecipientApi.getUnreadCount();
          set({
            unreadCount: clampUnreadCount(response.unreadCount),
            hasFetched: true,
            isFetching: false,
          });
        } catch {
          set({ isFetching: false });
        }
      },

      reset: () => {
        set({
          unreadCount: 0,
          hasFetched: false,
          isFetching: false,
          lastActivePersonId: null,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => zustandKeyValueStorage),
      partialize: (state) => ({
        unreadCount: state.unreadCount,
        lastActivePersonId: state.lastActivePersonId,
      }),
      version: 2,
      migrate: (persistedState) => {
        const previous = persistedState as
          | (Partial<PersistedNotificationState> & { lastActiveContextId?: string | null })
          | undefined;

        return {
          unreadCount: clampUnreadCount(previous?.unreadCount ?? 0),
          lastActivePersonId: null,
        };
      },
    },
  ),
);
