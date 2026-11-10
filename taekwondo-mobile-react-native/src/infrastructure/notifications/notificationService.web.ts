import type { NotificationService } from './notification.types';

export const notificationService: NotificationService = {
  platform: 'WEB',
  async getToken(): Promise<string | null> {
    return null;
  },
  subscribeToTokenRefresh(): () => void {
    return () => undefined;
  },
  subscribeToForegroundMessages(): () => void {
    return () => undefined;
  },
  async cleanup(): Promise<void> {
    return undefined;
  },
};
