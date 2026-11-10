import type { PersonResponse, PersonSimpleResponse } from '@/features/person/api/person.dto';
import type { WalletStatus } from '../constants/wallet.constants';

export interface WalletCreateRequest {
  personId: string;
  balance: number;
  status: WalletStatus;
}

export type WalletUpdateRequest = WalletCreateRequest;

export interface WalletResponse {
  walletId: string;
  person: PersonResponse;
  balance: number;
  status: WalletStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WalletSimpleResponse {
  walletId: string;
  person: PersonSimpleResponse;
  balance: number;
  status: WalletStatus;
}

export interface WalletListParams {
  page?: number;
  size?: number;
  sort?: string | string[];
}
