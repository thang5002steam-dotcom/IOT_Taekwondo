import { javaApi } from '@/infrastructure/http/httpClient';

import type { UserContext } from '../domain/auth.types';
import type {
  AuthResponse,
  AuthSession,
  DevicePlatform,
  LoginRequest,
  LogoutRequest,
  MobileAuthResponse,
  RefreshRequest,
  SwitchContextRequest,
  PasswordResetChannel,
  PasswordResetOptions,
  RecoveryEmail,
  OtpDelivery,
} from './auth.dto';

export const authApi = {
  async login(request: LoginRequest): Promise<MobileAuthResponse> {
    const response = await javaApi.post<MobileAuthResponse>(
      '/auth/mobile/login',
      request,
    );
    return response.data;
  },

  async logout(request: LogoutRequest): Promise<void> {
    await javaApi.post('/auth/mobile/logout', request);
  },

  async refresh(request: RefreshRequest): Promise<MobileAuthResponse> {
    const response = await javaApi.post<MobileAuthResponse>(
      '/auth/mobile/refresh',
      request,
    );
    return response.data;
  },

  async getAccount(): Promise<AuthResponse> {
    const response = await javaApi.get<AuthResponse>('/auth/account');
    return response.data;
  },

  async getContexts(): Promise<UserContext[]> {
    const response = await javaApi.get<UserContext[]>('/auth/contexts');
    return response.data;
  },

  async switchContext(request: SwitchContextRequest): Promise<AuthResponse> {
    const response = await javaApi.post<AuthResponse>(
      '/auth/switch-context',
      request,
    );
    return response.data;
  },

  async logoutAll(): Promise<void> {
    await javaApi.post('/auth/logout-all');
  },

  async updateFcm(fcmToken: string, platform: DevicePlatform): Promise<void> {
    await javaApi.post('/auth/update-fcm', { fcmToken, platform });
  },

  async getSessions(): Promise<AuthSession[]> {
    const response = await javaApi.get<AuthSession[]>('/auth/sessions');
    return response.data;
  },
  async passwordResetOptions(phoneNumber: string): Promise<PasswordResetOptions> {
    const response = await javaApi.post<PasswordResetOptions>('/auth/password-reset/options', { phoneNumber });
    return response.data;
  },
  async sendPasswordResetCode(requestId: string, channel: PasswordResetChannel, userPersonId?: string): Promise<OtpDelivery> {
    const response = await javaApi.post<OtpDelivery>('/auth/password-reset/send', { requestId, channel, userPersonId });
    return response.data;
  },
  async verifyPasswordResetCode(requestId: string, code: string): Promise<{ resetToken: string }> {
    const response = await javaApi.post<{ resetToken: string }>('/auth/password-reset/verify', { requestId, code });
    return response.data;
  },
  async completePasswordReset(resetToken: string, newPassword: string, confirmPassword: string): Promise<void> {
    await javaApi.post('/auth/password-reset/complete', { resetToken, newPassword, confirmPassword });
  },
  async changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    await javaApi.post('/auth/change-password', { oldPassword, newPassword, confirmPassword });
  },
  async recoveryEmails(): Promise<RecoveryEmail[]> {
    const response = await javaApi.get<RecoveryEmail[]>('/auth/recovery-emails');
    return response.data;
  },
  async sendRecoveryEmailVerification(userPersonId: string): Promise<OtpDelivery> {
    const response = await javaApi.post<OtpDelivery>(`/auth/recovery-emails/${userPersonId}/send`);
    return response.data;
  },
  async verifyRecoveryEmail(userPersonId: string, code: string): Promise<void> {
    await javaApi.post(`/auth/recovery-emails/${userPersonId}/verify`, { code });
  },
};
