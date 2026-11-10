import { create } from 'zustand';

import type { AuthResponse } from '../api/auth.dto';
import { deriveAuthStatus } from '../domain/deriveAuthStatus';
import type {
  AuthSnapshot,
  AuthStatus,
  AuthUser,
  UserContext,
} from '../domain/auth.types';

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  activeContext: UserContext | null;
  availableContexts: UserContext[];
  requiresContextSelection: boolean;
  status: AuthStatus;
  recoveryMessage: string | null;
  applyResponse: (response: AuthResponse, accessToken?: string) => void;
  hydrate: (accessToken: string, snapshot: AuthSnapshot) => void;
  setAnonymous: () => void;
  setRecoverableError: (message: string) => void;
  setBootstrapping: () => void;
};

const EMPTY_AUTH = {
  accessToken: null,
  user: null,
  activeContext: null,
  availableContexts: [] as UserContext[],
  requiresContextSelection: false,
  recoveryMessage: null,
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  ...EMPTY_AUTH,
  status: 'bootstrapping',

  applyResponse: (response, nextAccessToken) => {
    const accessToken = nextAccessToken ?? response.accessToken ?? get().accessToken;
    const status = deriveAuthStatus(
      accessToken,
      response.user,
      response.activeContext,
      response.requiresContextSelection,
    );
    set({
      accessToken,
      user: response.user,
      activeContext: response.activeContext,
      availableContexts: response.availableContexts ?? [],
      requiresContextSelection: response.requiresContextSelection,
      status,
      recoveryMessage: null,
    });
  },

  hydrate: (accessToken, snapshot) => {
    set({
      accessToken,
      user: snapshot.user,
      activeContext: snapshot.activeContext,
      availableContexts: snapshot.availableContexts,
      requiresContextSelection: snapshot.requiresContextSelection,
      status: deriveAuthStatus(
        accessToken,
        snapshot.user,
        snapshot.activeContext,
        snapshot.requiresContextSelection,
      ),
      recoveryMessage: null,
    });
  },

  setAnonymous: () => set({ ...EMPTY_AUTH, status: 'anonymous' }),
  setRecoverableError: (recoveryMessage) =>
    set({ status: 'recoverable-error', recoveryMessage }),
  setBootstrapping: () => set({ status: 'bootstrapping', recoveryMessage: null }),
}));

export const authStore = {
  getAccessToken: () => useAuthStore.getState().accessToken,
  getState: () => useAuthStore.getState(),
};

export const selectIsAuthenticated = (state: AuthState) =>
  state.status === 'authenticated' || state.status === 'selecting-context';
export const selectCurrentUserId = (state: AuthState) => state.user?.userId ?? null;
export const selectCurrentPersonId = (state: AuthState) =>
  state.activeContext?.personId ?? null;
export const selectCurrentContextType = (state: AuthState) =>
  state.activeContext?.relationshipType ?? null;
export const selectCurrentUserCode = (state: AuthState) =>
  state.activeContext?.personCode ?? undefined;
