import { javaApi } from '@/infrastructure/http/httpClient';

import type { UserProfileCreateRequest, UserProfileResponse } from './user-profile.dto';

export const userProfileApi = {
  async create(request: UserProfileCreateRequest): Promise<UserProfileResponse> {
    const response = await javaApi.post<UserProfileResponse>('/user-profiles', request);
    return response.data;
  },
};
