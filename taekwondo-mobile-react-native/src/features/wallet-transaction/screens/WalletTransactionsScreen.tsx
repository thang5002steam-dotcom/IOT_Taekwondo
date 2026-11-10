import { useMemo, useState } from "react";
import { StyleSheet } from "react-native";

import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { Colors } from "@/theme";

import {
  SegmentedTabs,
  TransactionCard,
} from "@/features/student-commerce/components/StudentCommercePrimitives";
import type {
  TransactionFilter,
  WalletTransactionsProps,
} from "@/features/student-commerce/types";
import {
  filterTransactions,
  getCommerceState,
} from "@/features/student-commerce/utils/studentCommerceUtils";

export function WalletTransactionsScreen({
  context = "admin-student",
  initialFilter = "all",
}: WalletTransactionsProps) {
  const state = getCommerceState();
  const [filter, setFilter] = useState<TransactionFilter>(initialFilter);
  const transactions = useMemo(
    () => filterTransactions(state.transactions, filter),
    [filter, state.transactions],
  );

  return (
    <StackScreenLayout
      title="Lịch sử giao dịch"
      contentContainerStyle={styles.content}
    >
      <SegmentedTabs
        value={filter}
        tabs={[
          { value: "all", label: "Tất cả" },
          { value: "credit", label: "Tiền vào" },
          { value: "debit", label: "Tiền ra" },
        ]}
        onChange={setFilter}
      />
      {transactions.map((transaction) => (
        <TransactionCard key={transaction.id} transaction={transaction} />
      ))}
    </StackScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  blackText: {
    color: Colors.light.text,
  },
});
