import type { NotificationPlatform } from '@/infrastructure/notifications/notification.types';
import type { AuthSession, AuthUser, UserContext } from '../domain/auth.types';

export type DevicePlatform = NotificationPlatform;

export type LoginRequest = {
  phoneNumber: string;
  password: string;
  idDevice: string;
  fcmToken?: string | null;
  platform: DevicePlatform;
};

export type RefreshRequest = {
  refreshToken: string;
};

export type LogoutRequest = {
  refreshToken: string;
};

export type SwitchContextRequest = {
  userPersonId: string;
};

export type PasswordResetChannel = 'APP' | 'EMAIL';
export type PasswordResetEmail = { userPersonId: string; maskedEmail: string };
export type PasswordResetOptions = { requestId: string; appAvailable: boolean; emails: PasswordResetEmail[] };
export type RecoveryEmail = { userPersonId: string; maskedEmail: string; verified: boolean };
export type OtpDelivery = { resendAvailableAt: string; expiresAt: string };

export type AuthResponse = {
  accessToken?: string;
  refreshToken?: string;
  user: AuthUser;
  activeContext: UserContext | null;
  availableContexts: UserContext[];
  requiresContextSelection: boolean;
};

export type MobileAuthResponse = AuthResponse & {
  accessToken: string;
  refreshToken: string;
};

export type { AuthSession };
