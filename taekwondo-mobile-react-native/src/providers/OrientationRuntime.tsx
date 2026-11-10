import { useEffect, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';

// Expo Go builds that do not contain this native module should still be able
// to boot the app. A development/release build with the config plugin keeps
// the orientation lock enabled.
let ScreenOrientation: typeof import('expo-screen-orientation') | null = null;
try {
  ScreenOrientation = require('expo-screen-orientation');
} catch {
  // Native module unavailable in the current client (usually Expo Go).
}

export function OrientationRuntime({ children }: PropsWithChildren) {
  useEffect(() => {
    if (Platform.OS !== 'web' && ScreenOrientation) {
      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
  }, []);
  return children;
}
