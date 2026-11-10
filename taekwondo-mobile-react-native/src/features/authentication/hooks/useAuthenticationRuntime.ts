import { useEffect } from 'react';
import { Alert } from 'react-native';

import { useNotificationStore } from '@/features/notification/store/notification.store';
import { notificationService } from '@/infrastructure/notifications/notificationService';

import { authSessionService } from '../services/authSessionService';
import { useAuthStore } from '../store/auth.store';

export function useAuthenticationRuntime(): void {
  const status = useAuthStore((state) => state.status);
  const activePersonId = useAuthStore(
    (state) => state.activeContext?.personId ?? null,
  );

  useEffect(() => {
    const disposeHttp = authSessionService.configureHttp();
    void authSessionService.bootstrap();
    return disposeHttp;
  }, []);

  useEffect(() => {
    if (status !== 'authenticated' && status !== 'selecting-context') {
      return undefined;
    }

    if (status === 'authenticated') {
      void useNotificationStore
        .getState()
        .fetchUnreadCount({ personId: activePersonId });
    }

    const unsubscribeToken = notificationService.subscribeToTokenRefresh(() => {
      void authSessionService.syncFcm(false).catch(() => undefined);
    });
    const unsubscribeMessages =
      notificationService.subscribeToForegroundMessages((message) => {
        if (message.type === 'PASSWORD_RESET_CODE' && message.code) {
          Alert.alert('Mã đặt lại mật khẩu', `Mã OTP của bạn là ${message.code}. Mã có hiệu lực trong 5 phút.`);
          return;
        }
        useNotificationStore.getState().incrementUnread();
      });

    return () => {
      unsubscribeToken();
      unsubscribeMessages();
    };
  }, [activePersonId, status]);
}
