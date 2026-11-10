export type WalletTopUpMode = 'GUARDIAN_REQUEST' | 'STAFF_DIRECT';
export type WalletTopUpRequestStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

export type WalletTopUpCreateRequest = {
  clientRequestId: string;
  personId: string;
  amount: number;
  note?: string | null;
};

export type WalletTopUpRequestResponse = {
  topUpRequestId: string;
  clientRequestId: string;
  personId: string;
  personCode: string | null;
  studentName: string;
  mode: WalletTopUpMode;
  status: WalletTopUpRequestStatus;
  amount: number;
  note: string | null;
  rejectionReason: string | null;
  proofAttached: boolean;
  walletTransactionId: string | null;
  balanceAfter: number | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WalletTopUpProofUrlResponse = {
  url: string;
  expiresInSeconds: number;
};

