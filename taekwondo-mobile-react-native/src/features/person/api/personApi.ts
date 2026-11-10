import { javaApi } from '@/infrastructure/http/httpClient';
import type { MobileUploadFile } from '@/infrastructure/http/http.types';
import { createFileMultipartFormData } from '@/infrastructure/http/multipart';
import type { PageResponse } from '@/infrastructure/http/pagination.types';

import type {
  FaceEmbeddingUpdateResponse,
  FaceImageUrlResponse,
  PersonCreateRequest,
  PersonResponse,
  PersonSimpleResponse,
  PersonSearchItem,
  PersonSearchParams,
  PersonUpdateRequest,
} from './person.dto';

export const personApi = {
  async list(params?: PersonSearchParams): Promise<PageResponse<PersonSimpleResponse>> {
    const response = await javaApi.get<PageResponse<PersonSimpleResponse>>('/persons', { params });
    return response.data;
  },
  async search(params?: PersonSearchParams): Promise<PageResponse<PersonSearchItem>> {
    const response = await javaApi.get<PageResponse<PersonSearchItem>>('/persons', { params });
    return response.data;
  },
  async get(personId: string): Promise<PersonResponse> {
    const response = await javaApi.get<PersonResponse>(`/persons/${personId}`);
    return response.data;
  },
  async create(request: PersonCreateRequest): Promise<PersonResponse> {
    const response = await javaApi.post<PersonResponse>('/persons', request);
    return response.data;
  },
  async update(personId: string, request: PersonUpdateRequest): Promise<PersonResponse> {
    const response = await javaApi.put<PersonResponse>(`/persons/${personId}`, request);
    return response.data;
  },
  async delete(personId: string, signal?: AbortSignal): Promise<void> {
    await javaApi.delete(`/persons/${personId}`, { signal });
  },
  async remove(personId: string, signal?: AbortSignal): Promise<void> {
    return this.delete(personId, signal);
  },
  async identify(file?: MobileUploadFile, personCode?: string): Promise<PersonResponse> {
    const response = await javaApi.post<PersonResponse>(
      '/persons/identify',
      createFileMultipartFormData(file),
      { params: personCode ? { personCode } : undefined },
    );
    return response.data;
  },
  async updateFaceEmbedding(personId: string, file: MobileUploadFile): Promise<FaceEmbeddingUpdateResponse> {
    const response = await javaApi.patch<FaceEmbeddingUpdateResponse>(
      `/persons/${personId}/face-embedding`,
      createFileMultipartFormData(file),
    );
    return response.data;
  },
  async getFaceImageUrl(personId: string): Promise<FaceImageUrlResponse> {
    const response = await javaApi.get<FaceImageUrlResponse>(`/persons/${personId}/face-image-url`);
    return response.data;
  },
  async deleteFaceEmbedding(personId: string): Promise<void> {
    await javaApi.delete(`/persons/${personId}/face-embedding`);
  },
};
