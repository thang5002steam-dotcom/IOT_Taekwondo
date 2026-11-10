export type NotificationPlatform = 'ANDROID' | 'IOS' | 'WEB';
export type ForegroundNotification = { type?: string; code?: string };

export type NotificationService = {
  platform: NotificationPlatform;
  getToken: (options: { requestPermission: boolean }) => Promise<string | null>;
  subscribeToTokenRefresh: (listener: (token: string) => void) => () => void;
  subscribeToForegroundMessages: (listener: (message: ForegroundNotification) => void) => () => void;
  cleanup: () => Promise<void>;
};
