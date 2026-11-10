import { Redirect } from 'expo-router';

import {
  BootstrapScreen,
  SessionRecoveryScreen,
  useAuthStatus,
} from '@/features/authentication';

/**
 * The always-available entry route for cold starts and denied deep links.
 * Keeping this route outside protected groups gives Expo Router a stable
 * anchor while authentication state is resolved.
 */
export default function RootIndex() {
  const status = useAuthStatus();

  switch (status) {
    case 'bootstrapping':
      return <BootstrapScreen />;
    case 'recoverable-error':
      return <SessionRecoveryScreen />;
    case 'anonymous':
      return <Redirect href="/(auth)/login" />;
    case 'selecting-context':
      return <Redirect href="/(context)/select" />;
    case 'authenticated':
      return <Redirect href="/(app)/(tabs)" />;
  }
}
