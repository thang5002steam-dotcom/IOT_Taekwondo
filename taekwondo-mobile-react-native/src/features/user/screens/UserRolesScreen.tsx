import { useRouter, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { useRoles } from "@/features/roles/queries/roleQueries";
import { roleCodesForUser } from "../domain/userViewModel";
import { useReplaceUserRoles, useUser, useUserRoles } from "../queries/userQueries";
import { useScreenRefresh } from "@/infrastructure/query/useScreenRefresh";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import {
  AdminButton,
  AdminCard,
  AdminListRow,
  AdminLoadingState,
  adminStyles,
} from "@/shared/ui/admin/AdministrationPrimitives";
import { ThemedText } from "@/shared/ui/ThemedText";
import { useToast } from "@/shared/ui/Toast";

import { useUserId, userAdminStyles } from "./userAdministrationShared";

export function UserRolesScreen() {
  const router = useRouter();
  const userId = useUserId();
  const user = useUser(userId);
  const roles = useRoles();
  const assignments = useUserRoles();
  const toast = useToast();
  const [selected, setSelected] = useState<string[]>([]);
  const { refreshing, onRefresh } = useScreenRefresh([user, roles, assignments]);

  useEffect(() => {
    // The selection draft is initialized from the separately loaded assignment resource.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(roleCodesForUser(userId ?? "", assignments.data?.content ?? []));
  }, [assignments.data, userId]);

  const save = useReplaceUserRoles({
    onSuccess: async () => {
      toast.show({ message: "Đã cập nhật vai trò", variant: "success" });
      router.replace(`/admin/users/${userId}` as Href);
    },
    onError: () =>
      toast.show({ message: "Không thể cập nhật vai trò", variant: "error" }),
  });
  const toggle = (code: string) =>
    setSelected((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    );

  return (
    <StackScreenLayout
      title="Gán vai trò"
      contentContainerStyle={adminStyles.screen}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <AdminCard>
        <ThemedText type="title">{user.data?.phoneNumber ?? "Người dùng"}</ThemedText>
        <ThemedText type="bodySmall" style={adminStyles.muted}>
          {selected.length} vai trò được chọn
        </ThemedText>
      </AdminCard>
      {roles.isPending || assignments.isPending ? (
        <AdminLoadingState />
      ) : (
        <View style={userAdminStyles.list}>
          {(roles.data?.content ?? []).map((role) => (
            <AdminListRow
              key={role.code}
              title={role.name}
              subtitle={role.code}
              selected={selected.includes(role.code)}
              onPress={() => toggle(role.code)}
            />
          ))}
        </View>
      )}
      <View style={adminStyles.actions}>
        <AdminButton
          label="Đặt lại"
          variant="secondary"
          onPress={() =>
            setSelected(roleCodesForUser(userId ?? "", assignments.data?.content ?? []))
          }
          style={adminStyles.grow}
        />
        <AdminButton
          label="Lưu vai trò"
          loading={save.isPending}
          onPress={() =>
            save.mutate({ userId: userId as string, roleCodes: selected })
          }
          style={adminStyles.grow}
        />
      </View>
    </StackScreenLayout>
  );
}
