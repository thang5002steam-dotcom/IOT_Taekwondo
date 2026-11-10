import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppProviders } from '@/providers/AppProviders';
import {
  BootstrapScreen,
  SessionRecoveryScreen,
  useAuthStatus,
} from '@/features/authentication';

void SplashScreen.preventAutoHideAsync();

function AuthRouter() {
  const status = useAuthStatus();

  useEffect(() => {
    if (status !== 'bootstrapping') {
      void SplashScreen.hideAsync();
    }
  }, [status]);

  // Do not create a navigation tree until the persisted session has been
  // resolved. In SDK 58, a protected group redirects as soon as its guard is
  // false, so mounting all groups while bootstrapping can enqueue redirects
  // against a changing auth state.
  if (status === 'bootstrapping') return <BootstrapScreen />;
  if (status === 'recoverable-error') return <SessionRecoveryScreen />;

  const authenticatedHome =
    status === 'anonymous'
      ? '/(auth)/login'
      : status === 'selecting-context'
        ? '/(context)/select'
        : '/(app)/(tabs)';

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={status === 'anonymous'} redirectTo={authenticatedHome}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected
        guard={status === 'selecting-context' || status === 'authenticated'}
        redirectTo={authenticatedHome}>
        <Stack.Screen name="(context)" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'authenticated'} redirectTo={authenticatedHome}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="(knee-counter)" />
      </Stack.Protected>
      <Stack.Screen name="(sparring)" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppProviders>
          <AuthRouter />
        </AppProviders>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
