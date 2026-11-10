import { useLocalSearchParams } from 'expo-router';

import { TopUpScreen } from '@/features/wallet';

export default function StudentTopUpRoute() {
  const { studentCode } = useLocalSearchParams<{ studentCode?: string }>();
  return <TopUpScreen studentCode={studentCode} mode="STAFF_DIRECT" />;
}
