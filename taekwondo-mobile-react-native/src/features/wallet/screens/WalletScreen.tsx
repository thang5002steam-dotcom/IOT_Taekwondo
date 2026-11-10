import { useMemo } from "react";
import { Layers, NoteText } from "reicon-react-native";
import { type Href, useRouter } from "expo-router";
import { ActivityIndicator, StyleSheet } from "react-native";

import { BeltLabel, PersonStatusLabel } from "@/features/person/constants/person.constants";
import { usePerson } from "@/features/person/queries/personQueries";
import { useWalletByPerson } from "@/features/wallet/queries/walletQueries";
import type { StudentSummaryView } from "@/features/student-commerce/types";
import { useScreenRefresh } from "@/infrastructure/query/useScreenRefresh";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors } from "@/theme";

import { WalletBalanceCard } from "@/features/student-commerce/components/wallet";
import { studentCommerceMock } from "@/features/student-commerce/fixtures/studentCommerce.fixtures";
import { NavigationMenu, NavigationMenuItem } from "@/shared/ui/NavigationMenu";

type StudentRouteProps = {
  studentCode?: string;
};

function useCommerceState() {
  return studentCommerceMock;
}

function asHref(path: string) {
  return path as Href;
}

type WalletOverviewProps = StudentRouteProps & {
  context: "admin-student" | "account";
};

function WalletOverview({ studentCode, context }: WalletOverviewProps) {
  const router = useRouter();
  const state = useCommerceState();
  const isAccount = context === "account";
  const personQuery = usePerson(isAccount ? undefined : studentCode);
  const walletQuery = useWalletByPerson(
    isAccount ? undefined : personQuery.data?.personId,
  );
  const { refreshing, onRefresh } = useScreenRefresh([personQuery, walletQuery]);
  const student = useMemo<StudentSummaryView | null>(() => {
    if (isAccount) return state.selectedStudent;
    const person = personQuery.data;
    if (!person) return null;
    return {
      personId: person.personId,
      personCode: person.personCode || person.personId.substring(0, 8).toUpperCase(),
      fullName: person.fullName,
      birthDate: person.birthDate,
      beltLabel: BeltLabel[person.currentBelt] || person.currentBelt || "Chưa có đai",
      statusLabel: PersonStatusLabel[person.status] || person.status || "Đang hoạt động",
    };
  }, [isAccount, personQuery.data, state.selectedStudent]);
  const routeStudentCode = studentCode ?? state.selectedStudent.personCode;
  const activeEnrollments = state.enrollments
    .filter((item) => !item.history)
    .slice(0, 2);
  const recentTransactions = state.transactions.slice(0, 2);

  const courseListPath = isAccount
    ? "/account/courses"
    : `/students/${routeStudentCode}/courses`;
  const transactionListPath = isAccount
    ? "/account/wallet/transactions"
    : `/students/${routeStudentCode}/wallet/transactions`;
  const topUpPath = isAccount
    ? "/account/top-up"
    : `/students/${routeStudentCode}/top-up`;

  if (!isAccount && (personQuery.isLoading || walletQuery.isLoading)) {
    return (
      <StackScreenLayout
        title="Ví điện tử"
        contentContainerStyle={styles.center}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </StackScreenLayout>
    );
  }

  if (!isAccount && (!student || !walletQuery.data)) {
    return (
      <StackScreenLayout
        title="Ví điện tử"
        contentContainerStyle={styles.center}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <ThemedText type="bodySmall" style={styles.errorText}>
          Không thể tải thông tin ví học viên.
        </ThemedText>
      </StackScreenLayout>
    );
  }

  return (
    <StackScreenLayout
      title="Ví điện tử"
      contentContainerStyle={styles.content}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <WalletBalanceCard
        student={student ?? state.selectedStudent}
        balance={isAccount ? state.wallet.balance : walletQuery.data!.balance}
        actionLabel="Nạp tiền"
        onActionPress={() => router.push(asHref(topUpPath))}
      />

      <NavigationMenu>
        <NavigationMenuItem
          icon={<NoteText />}
          // iconBox
          title="Giao dịch gần đây"
          subtitle="Xem lịch sử thu chi của ví"
          count={recentTransactions.length}
          onPress={() => router.push(asHref(transactionListPath))}
        />
        <NavigationMenuItem
          icon={<Layers weight="Filled" />}
          // iconBox
          title="Khóa học tham gia"
          subtitle="Xem danh sách khóa học hiện tại"
          count={activeEnrollments.length}
          onPress={() => router.push(asHref(courseListPath))}
        />
      </NavigationMenu>
    </StackScreenLayout>
  );
}

export function WalletScreen({
  studentCode,
  context = "admin-student",
}: StudentRouteProps & { context?: "admin-student" | "account" }) {
  return <WalletOverview studentCode={studentCode} context={context} />;
}

export function AccountWalletScreen() {
  return <WalletOverview studentCode="VQ_00123" context="account" />;
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  errorText: {
    color: Colors.light.text,
  },
});
