import type { UserSimpleResponse } from '@/features/user/api/user.dto';
import type { WalletResponse, WalletSimpleResponse } from '@/features/wallet/api/wallet.dto';
import type {
  WalletTransactionDirection,
  WalletTransactionStatus,
  WalletTransactionType,
} from '@/features/wallet/constants/wallet.constants';

export interface WalletTransactionCreateRequest {
  walletId: string;
  createdByUserId: string;
  reviewedByUserId?: string | null;
  type: WalletTransactionType;
  direction: WalletTransactionDirection;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  externalReference: string;
  reviewedAt: string;
  note: string;
}

export interface WalletTransactionUpdateRequest extends WalletTransactionCreateRequest {
  status: WalletTransactionStatus;
}

export interface WalletTransactionResponse {
  walletTransactionId: string;
  wallet: WalletResponse;
  createdByUser: UserSimpleResponse | null;
  reviewedByUser: UserSimpleResponse | null;
  type: WalletTransactionType;
  direction: WalletTransactionDirection;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  externalReference: string;
  reviewedAt: string | null;
  note: string | null;
  status: WalletTransactionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransactionSimpleResponse {
  walletTransactionId: string;
  wallet: WalletSimpleResponse;
  createdByUser: UserSimpleResponse | null;
  reviewedByUser: UserSimpleResponse | null;
  type: WalletTransactionType;
  direction: WalletTransactionDirection;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  externalReference: string;
  reviewedAt: string | null;
  note: string | null;
  status: WalletTransactionStatus;
}

export interface WalletTransactionListParams {
  page?: number;
  size?: number;
  sort?: string | string[];
}
