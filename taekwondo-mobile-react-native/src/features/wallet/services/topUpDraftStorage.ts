import type { MobileUploadFile } from '@/infrastructure/http/http.types';
import { keyValueStorage } from '@/infrastructure/storage/keyValueStorage';

import type { WalletTopUpMode } from '../api/wallet-top-up-request.dto';

const PREFIX = 'wallet.top-up-draft.v1';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type StoredTopUpDraft = {
  userId: string;
  personId: string;
  mode: WalletTopUpMode;
  clientRequestId: string;
  serverRequestId?: string;
  amount: number;
  note: string;
  proof: MobileUploadFile;
  createdAt: number;
};

function key(userId: string, personId: string): string {
  return `${PREFIX}:${userId}:${personId}`;
}

export const topUpDraftStorage = {
  async read(userId: string, personId: string): Promise<StoredTopUpDraft | null> {
    const raw = await keyValueStorage.get(key(userId, personId));
    if (!raw) return null;
    try {
      const draft = JSON.parse(raw) as StoredTopUpDraft;
      if (draft.userId !== userId || draft.personId !== personId || Date.now() - draft.createdAt > MAX_AGE_MS) {
        await keyValueStorage.remove(key(userId, personId));
        return null;
      }
      return draft;
    } catch {
      await keyValueStorage.remove(key(userId, personId));
      return null;
    }
  },

  write(draft: StoredTopUpDraft): Promise<void> {
    return keyValueStorage.set(key(draft.userId, draft.personId), JSON.stringify(draft));
  },

  clear(userId: string, personId: string): Promise<void> {
    return keyValueStorage.remove(key(userId, personId));
  },
};

