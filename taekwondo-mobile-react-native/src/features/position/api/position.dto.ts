import type { PageResponse } from '@/infrastructure/http/pagination.types';

export interface PositionCreateRequest {
  code: string;
  name: string;
  description?: string | null;
  active?: boolean;
}

export interface PositionUpdateRequest {
  code: string;
  name: string;
  description?: string | null;
  active?: boolean;
}

export interface PositionResponse {
  positionId: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  personCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PositionSimpleResponse {
  positionId: string;
  code: string;
  name: string;
  active: boolean;
  personCount?: number;
}

export interface PositionSearchParams {
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  sort?: string | string[];
}

export type PositionListResponse = PageResponse<PositionSimpleResponse>;
