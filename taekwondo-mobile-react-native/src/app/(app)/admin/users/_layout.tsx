import { Permission, useCan } from '@/features/authorization';
import { Redirect, Stack } from 'expo-router';

export default function UsersLayout() {
  const allowed = useCan(Permission.USER_READ);
  return allowed ? <Stack screenOptions={{ headerShown: false }} /> : <Redirect href="/activities" />;
}
