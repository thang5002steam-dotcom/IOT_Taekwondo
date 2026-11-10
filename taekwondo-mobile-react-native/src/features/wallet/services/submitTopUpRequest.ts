import * as Crypto from 'expo-crypto';
import { isAxiosError } from 'axios';

import type { MobileUploadFile } from '@/infrastructure/http/http.types';

import type { WalletTopUpMode, WalletTopUpRequestResponse } from '../api/wallet-top-up-request.dto';
import { walletTopUpRequestApi } from '../api/walletTopUpRequestApi';
import { topUpDraftStorage, type StoredTopUpDraft } from './topUpDraftStorage';

export type SubmitTopUpInput = {
  userId: string;
  personId: string;
  mode: WalletTopUpMode;
  amount: number;
  note: string;
  proof: MobileUploadFile;
};

function sameDraft(draft: StoredTopUpDraft, input: SubmitTopUpInput): boolean {
  return draft.mode === input.mode
    && draft.amount === input.amount
    && draft.note === input.note
    && draft.proof.uri === input.proof.uri
    && draft.proof.name === input.proof.name
    && draft.proof.type === input.proof.type;
}

async function getOrCreateLocalDraft(input: SubmitTopUpInput): Promise<StoredTopUpDraft> {
  const existing = await topUpDraftStorage.read(input.userId, input.personId);
  if (existing && sameDraft(existing, input)) return existing;
  const created: StoredTopUpDraft = {
    ...input,
    clientRequestId: Crypto.randomUUID(),
    createdAt: Date.now(),
  };
  await topUpDraftStorage.write(created);
  return created;
}

export async function submitTopUpRequest(input: SubmitTopUpInput): Promise<WalletTopUpRequestResponse> {
  const draft = await getOrCreateLocalDraft(input);
  try {
    const created = await walletTopUpRequestApi.create({
      clientRequestId: draft.clientRequestId,
      personId: draft.personId,
      amount: draft.amount,
      note: draft.note || null,
    }, draft.mode === 'STAFF_DIRECT');
    const serverDraft: StoredTopUpDraft = {
      ...draft,
      serverRequestId: created.topUpRequestId,
    };
    await topUpDraftStorage.write(serverDraft);

    if (!created.proofAttached) {
      await walletTopUpRequestApi.uploadProof(created.topUpRequestId, serverDraft.proof);
    }
    const result = await walletTopUpRequestApi.submit(
      created.topUpRequestId,
      draft.mode === 'STAFF_DIRECT',
    );
    if (result.status === 'PENDING' || result.status === 'APPROVED') {
      await topUpDraftStorage.clear(input.userId, input.personId);
    }
    return result;
  } catch (error) {
    try {
      const resolved = await walletTopUpRequestApi.getByClientRequest(draft.clientRequestId);
      if (resolved.status === 'PENDING' || resolved.status === 'APPROVED' || resolved.status === 'REJECTED') {
        await topUpDraftStorage.clear(input.userId, input.personId);
        return resolved;
      }
    } catch (statusError) {
      if (!isAxiosError(statusError) || statusError.response?.status !== 404) {
        // Preserve the original mutation error; the same UUID remains stored for a later retry.
      }
    }
    throw error;
  }
}

