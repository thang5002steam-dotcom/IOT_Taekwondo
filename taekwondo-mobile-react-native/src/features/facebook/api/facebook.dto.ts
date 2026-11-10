export interface FacebookWebhookParams {
  'hub.mode'?: string;
  'hub.verify_token'?: string;
  'hub.challenge'?: string;
}

export interface FacebookVideoInsightsParams {
  videoId: string;
}

export interface FacebookPostInsightsParams {
  postId: string;
}

export interface FacebookInsightValue {
  value: number | string | Record<string, unknown>;
  endTime?: string;
}

export interface FacebookInsightItem {
  name: string;
  period: string;
  values: FacebookInsightValue[];
  title?: string;
  description?: string;
}

export interface FacebookInsightsResponse {
  data?: FacebookInsightItem[];
  paging?: unknown;
  [key: string]: unknown;
}

export type FacebookWebhookPayload = Record<string, unknown>;
