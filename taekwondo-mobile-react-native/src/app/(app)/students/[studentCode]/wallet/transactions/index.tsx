import { useLocalSearchParams } from 'expo-router';

import type { TransactionFilter } from '@/features/student-commerce';
import { WalletTransactionsScreen } from '@/features/wallet-transaction';

export default function StudentWalletTransactionsRoute() {
  const { studentCode, transactionFilter } = useLocalSearchParams<{
    studentCode?: string;
    transactionFilter?: TransactionFilter;
  }>();
  return (
    <WalletTransactionsScreen
      context="admin-student"
      studentCode={studentCode ?? 'VQ_00123'}
      initialFilter={transactionFilter ?? 'all'}
    />
  );
}
