import * as Crypto from 'expo-crypto';

import type { WalletTopUpRequestResponse } from '../api/wallet-top-up-request.dto';
import { walletTopUpRequestApi } from '../api/walletTopUpRequestApi';
import { submitTopUpRequest, type SubmitTopUpInput } from './submitTopUpRequest';
import { topUpDraftStorage } from './topUpDraftStorage';

jest.mock('expo-crypto', () => ({ randomUUID: jest.fn() }));
jest.mock('../api/walletTopUpRequestApi', () => ({
  walletTopUpRequestApi: {
    create: jest.fn(),
    uploadProof: jest.fn(),
    submit: jest.fn(),
    getByClientRequest: jest.fn(),
  },
}));
jest.mock('./topUpDraftStorage', () => ({
  topUpDraftStorage: {
    read: jest.fn(),
    write: jest.fn(),
    clear: jest.fn(),
  },
}));

const input: SubmitTopUpInput = {
  userId: 'user-1',
  personId: 'person-1',
  mode: 'GUARDIAN_REQUEST',
  amount: 250_000,
  note: 'Chuyen khoan thang 10',
  proof: {
    uri: 'file:///proof.jpg',
    name: 'proof.jpg',
    type: 'image/jpeg',
  },
};

const pendingResponse: WalletTopUpRequestResponse = {
  topUpRequestId: 'request-1',
  clientRequestId: 'client-1',
  personId: 'person-1',
  personCode: 'VQ_00123',
  studentName: 'Nguyen Van A',
  mode: 'GUARDIAN_REQUEST',
  status: 'PENDING',
  amount: 250_000,
  note: 'Chuyen khoan thang 10',
  rejectionReason: null,
  proofAttached: true,
  walletTransactionId: null,
  balanceAfter: null,
  submittedAt: '2026-10-25T10:01:00+07:00',
  reviewedAt: null,
  createdAt: '2026-10-25T10:00:00+07:00',
  updatedAt: '2026-10-25T10:01:00+07:00',
};

describe('submitTopUpRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(topUpDraftStorage.write).mockResolvedValue();
    jest.mocked(topUpDraftStorage.clear).mockResolvedValue();
  });

  it('persists the UUID before sending and clears it after a pending response', async () => {
    jest.mocked(topUpDraftStorage.read).mockResolvedValue(null);
    jest.mocked(Crypto.randomUUID).mockReturnValue('client-1');
    jest.mocked(walletTopUpRequestApi.create).mockResolvedValue({
      ...pendingResponse,
      status: 'DRAFT',
      proofAttached: false,
    });
    jest.mocked(walletTopUpRequestApi.uploadProof).mockResolvedValue();
    jest.mocked(walletTopUpRequestApi.submit).mockResolvedValue(pendingResponse);

    await expect(submitTopUpRequest(input)).resolves.toEqual(pendingResponse);

    const firstPersistedDraft = jest.mocked(topUpDraftStorage.write).mock.calls[0]?.[0];
    expect(firstPersistedDraft).toEqual(expect.objectContaining({ clientRequestId: 'client-1' }));
    expect(firstPersistedDraft).not.toHaveProperty('serverRequestId');
    expect(jest.mocked(topUpDraftStorage.write).mock.invocationCallOrder[0]).toBeLessThan(
      jest.mocked(walletTopUpRequestApi.create).mock.invocationCallOrder[0]!,
    );
    expect(walletTopUpRequestApi.create).toHaveBeenCalledWith(
      expect.objectContaining({ clientRequestId: 'client-1', amount: 250_000 }),
      false,
    );
    expect(walletTopUpRequestApi.uploadProof).toHaveBeenCalledWith('request-1', input.proof);
    expect(topUpDraftStorage.clear).toHaveBeenCalledWith('user-1', 'person-1');
  });

  it('resolves an ambiguous network failure from the server without creating a new UUID', async () => {
    jest.mocked(topUpDraftStorage.read).mockResolvedValue({
      ...input,
      clientRequestId: 'client-1',
      createdAt: Date.now(),
    });
    jest.mocked(walletTopUpRequestApi.create).mockRejectedValue(new Error('Network Error'));
    jest.mocked(walletTopUpRequestApi.getByClientRequest).mockResolvedValue(pendingResponse);

    await expect(submitTopUpRequest(input)).resolves.toEqual(pendingResponse);

    expect(Crypto.randomUUID).not.toHaveBeenCalled();
    expect(walletTopUpRequestApi.getByClientRequest).toHaveBeenCalledWith('client-1');
    expect(topUpDraftStorage.clear).toHaveBeenCalledWith('user-1', 'person-1');
  });

  it('accepts a server-side rejection as the final result of an ambiguous retry', async () => {
    jest.mocked(topUpDraftStorage.read).mockResolvedValue({
      ...input,
      clientRequestId: 'client-1',
      createdAt: Date.now(),
    });
    jest.mocked(walletTopUpRequestApi.create).mockRejectedValue(new Error('Previous request changed state'));
    jest.mocked(walletTopUpRequestApi.getByClientRequest).mockResolvedValue({
      ...pendingResponse,
      status: 'REJECTED',
      rejectionReason: 'Không tìm thấy khoản tiền thực nhận',
    });

    await expect(submitTopUpRequest(input)).resolves.toEqual(
      expect.objectContaining({ status: 'REJECTED' }),
    );
    expect(topUpDraftStorage.clear).toHaveBeenCalledWith('user-1', 'person-1');
  });
});
