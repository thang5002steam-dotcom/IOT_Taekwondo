import { useLocalSearchParams } from 'expo-router';

import type { TransactionFilter } from '@/features/student-commerce';
import { WalletTransactionsScreen } from '@/features/wallet-transaction';

export default function AccountWalletTransactionsRoute() {
  const { transactionFilter } = useLocalSearchParams<{ transactionFilter?: TransactionFilter }>();
  return (
    <WalletTransactionsScreen
      context="account"
      studentCode="VQ_00123"
      initialFilter={transactionFilter ?? 'all'}
    />
  );
}
