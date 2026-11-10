import { Stack } from 'expo-router';
import { Colors } from '@/theme';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="forgot-password" options={{ headerShown: true, headerBackVisible: false, title: 'Quên mật khẩu', headerTintColor: Colors.light.text, headerShadowVisible: false }} />
  </Stack>;
}
