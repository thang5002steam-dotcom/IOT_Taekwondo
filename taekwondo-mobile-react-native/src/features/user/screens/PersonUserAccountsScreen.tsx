import { useRouter } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";

import { relationshipLabel } from "@/features/person/domain/personViewModel";
import { usePerson, useUserPersons } from "@/features/person/queries/personQueries";
import { useScreenRefresh } from "@/infrastructure/query/useScreenRefresh";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import {
  AdminEmptyState,
  AdminLoadingState,
  AdminSectionHeader,
  adminStyles,
} from "@/shared/ui/admin/AdministrationPrimitives";
import { groupPersonUserAccounts } from "../domain/personUserAccounts";
import { UserAccountRow, userAdminStyles } from "../components/UserAdministrationPrimitives";

export function PersonUserAccountsScreen({
  personId,
}: {
  personId?: string;
}) {
  const router = useRouter();
  const person = usePerson(personId);
  const links = useUserPersons({ personId: person.data?.personId });
  const accounts = useMemo(
    () => groupPersonUserAccounts(links.data?.content ?? []),
    [links.data?.content],
  );
  const { refreshing, onRefresh } = useScreenRefresh([person, links]);
  const title = person.data
    ? `Tài khoản của ${person.data.fullName}`
    : "Tài khoản người dùng";

  if (person.isPending) {
    return (
      <StackScreenLayout title={title} contentContainerStyle={adminStyles.screen}>
        <AdminLoadingState />
      </StackScreenLayout>
    );
  }

  if (!person.data) {
    return (
      <StackScreenLayout title={title} contentContainerStyle={adminStyles.screen}>
        <AdminEmptyState message="Không tìm thấy học viên." />
      </StackScreenLayout>
    );
  }

  return (
    <StackScreenLayout
      title={title}
      contentContainerStyle={adminStyles.screen}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <AdminSectionHeader title={`${accounts.length} tài khoản người dùng`} />
      {links.isPending ? (
        <AdminLoadingState />
      ) : links.isError ? (
        <AdminEmptyState message="Không thể tải tài khoản người dùng." />
      ) : accounts.length === 0 ? (
        <AdminEmptyState message="Học viên chưa có tài khoản người dùng liên kết." />
      ) : (
        <View style={userAdminStyles.list}>
          {accounts.map((account) => (
            <UserAccountRow
              key={account.user.userId}
              user={account.user}
              subtitle={`${account.relationshipTypes.map(relationshipLabel).join(" · ")} · ${account.hasActiveLink ? "Đang liên kết" : "Liên kết đã ngừng"}`}
              onPress={() => router.push(`/admin/users/${account.user.userId}`)}
            />
          ))}
        </View>
      )}
    </StackScreenLayout>
  );
}
