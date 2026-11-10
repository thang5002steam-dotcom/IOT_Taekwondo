import Constants, { AppOwnership } from 'expo-constants';
import { PermissionsAndroid, Platform } from 'react-native';

import type { NotificationService } from './notification.types';

type FirebaseMessaging = typeof import('@react-native-firebase/messaging');

/** Expo Go does not embed React Native Firebase native modules. */
function getFirebaseMessaging(): FirebaseMessaging | null {
  if (Constants.appOwnership === AppOwnership.Expo) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- defer a native-only module until a compatible runtime is confirmed.
    return require('@react-native-firebase/messaging') as FirebaseMessaging;
  } catch {
    // A native development or release build should provide this module. Expo Go
    // does not, so notification features remain unavailable instead of crashing.
    return null;
  }
}

async function hasNotificationPermission(): Promise<boolean> {
  const messaging = getFirebaseMessaging();
  if (!messaging) return false;

  if (Platform.OS === 'android') {
    if (Platform.Version < 33) return true;
    return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }
  const status = await messaging.hasPermission(messaging.getMessaging());
  return status === messaging.AuthorizationStatus.AUTHORIZED || status === messaging.AuthorizationStatus.PROVISIONAL;
}

async function requestNotificationPermission(): Promise<boolean> {
  const messaging = getFirebaseMessaging();
  if (!messaging) return false;

  if (Platform.OS === 'android') {
    if (Platform.Version < 33) return true;
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }
  const status = await messaging.requestPermission(messaging.getMessaging());
  return status === messaging.AuthorizationStatus.AUTHORIZED || status === messaging.AuthorizationStatus.PROVISIONAL;
}

export const notificationService: NotificationService = {
  platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',

  async getToken(options: { requestPermission: boolean }): Promise<string | null> {
    const messaging = getFirebaseMessaging();
    if (!messaging) return null;

    const allowed = options.requestPermission
      ? await requestNotificationPermission()
      : await hasNotificationPermission();
    return allowed ? messaging.getToken(messaging.getMessaging()) : null;
  },

  subscribeToTokenRefresh(listener: (token: string) => void): () => void {
    const messaging = getFirebaseMessaging();
    return messaging ? messaging.onTokenRefresh(messaging.getMessaging(), listener) : () => undefined;
  },

  subscribeToForegroundMessages(listener): () => void {
    const messaging = getFirebaseMessaging();
    if (!messaging) return () => undefined;

    return messaging.onMessage(messaging.getMessaging(), (message) => listener({
      type: typeof message.data?.type === 'string' ? message.data.type : undefined,
      code: typeof message.data?.code === 'string' ? message.data.code : undefined,
    }));
  },

  async cleanup(): Promise<void> {
    const messaging = getFirebaseMessaging();
    if (messaging) await messaging.deleteToken(messaging.getMessaging());
  },
};
