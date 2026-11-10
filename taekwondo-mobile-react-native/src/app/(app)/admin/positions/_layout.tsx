import { Permission, useCan } from '@/features/authorization';
import { Redirect, Stack } from 'expo-router';

export default function PositionsLayout() {
  const allowed = useCan(Permission.POSITION_READ);
  return allowed ? <Stack screenOptions={{ headerShown: false }} /> : <Redirect href="/activities" />;
}
