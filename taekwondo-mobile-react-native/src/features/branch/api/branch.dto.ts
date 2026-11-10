import type { BranchStatus } from '../constants/branch.constants';

export interface BranchCreateRequest {
  name: string;
  address: string;
  hotline: string;
  openedDate: string;
  status: BranchStatus;
}

export type BranchUpdateRequest = BranchCreateRequest;

export interface BranchResponse {
  branchId: number;
  name: string;
  address: string;
  hotline: string;
  openedDate: string;
  status: BranchStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BranchSimpleResponse {
  branchId: number;
  name: string;
  address: string;
  hotline: string;
  status: BranchStatus;
}

export interface BranchListParams {
  page?: number;
  size?: number;
  sort?: string | string[];
}
