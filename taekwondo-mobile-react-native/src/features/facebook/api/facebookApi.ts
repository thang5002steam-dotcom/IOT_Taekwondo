import { javaApi } from '@/infrastructure/http/httpClient';

import type {
  FacebookInsightsResponse,
  FacebookPostInsightsParams,
  FacebookVideoInsightsParams,
  FacebookWebhookParams,
  FacebookWebhookPayload,
} from './facebook.dto';

export const facebookApi = {
  async verifyWebhook(params?: FacebookWebhookParams): Promise<string> {
    const response = await javaApi.get<string>('/facebook/webhook', { params });
    return response.data;
  },
  async getVideoInsights(params: FacebookVideoInsightsParams): Promise<FacebookInsightsResponse> {
    const response = await javaApi.get<FacebookInsightsResponse>('/facebook/video-insights', { params });
    return response.data;
  },
  async getPostInsights(params: FacebookPostInsightsParams): Promise<FacebookInsightsResponse> {
    const response = await javaApi.get<FacebookInsightsResponse>('/facebook/post-insights', { params });
    return response.data;
  },
  async receiveWebhook(payload: FacebookWebhookPayload): Promise<void> {
    await javaApi.post('/facebook/webhook', payload);
  },
};
