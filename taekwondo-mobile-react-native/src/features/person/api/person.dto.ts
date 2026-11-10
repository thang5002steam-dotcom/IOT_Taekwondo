import type { Belt, PersonStatus } from "../constants/person.constants";
import type {
  PersonBriefResponse,
  PersonResponse,
  PersonSearchItem,
  PersonSimpleResponse,
} from "../domain/person.types";

export interface PersonCreateRequest {
  fullName: string;
  gender: boolean;
  birthDate: string;
  email?: string | null;
  nationalCode?: string | null;
  faceImagePath?: string | null;
  positionId?: string | null;
  currentBelt: Belt;
  status: PersonStatus;
  startDate: string;
}

export interface PersonUpdateRequest extends PersonCreateRequest {
  personCode?: string | null;
  positionId?: string | null;
}

export interface FaceEmbeddingUpdateResponse {
  personId: string;
  dimension: number;
  model: string;
  faceImagePath: string;
  avatarUrl: string;
  updatedAt: string;
}

export interface FaceImageUrlResponse {
  url: string;
  avatarUrl?: string;
}

export type {
  PersonBriefResponse,
  PersonResponse,
  PersonSearchItem,
  PersonSimpleResponse,
};

export interface PersonSearchParams {
  search?: string;
  positionId?: string;
  status?: PersonStatus;
  currentBelt?: Belt;
  gender?: boolean;
  isStudent?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  sort?: string | string[];
}
