import type { DevicePlatform } from './auth.dto';

export interface UpdateFcmRequest {
  fcmToken: string;
  platform?: DevicePlatform;
}
