import { useLocalSearchParams } from 'expo-router';

import { WalletScreen } from '@/features/wallet';

export default function StudentWalletRoute() {
  const { studentCode } = useLocalSearchParams<{ studentCode?: string }>();
  return <WalletScreen context="admin-student" studentCode={studentCode ?? 'VQ_00123'} />;
}
