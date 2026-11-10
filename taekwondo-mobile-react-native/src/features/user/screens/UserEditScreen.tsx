import { useRouter, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import type { UserStatus } from "../constants/user.constants";
import { userStatusLabel } from "../domain/userViewModel";
import { useDeleteUser, useUpdateUser, useUser } from "../queries/userQueries";
import { useScreenRefresh } from "@/infrastructure/query/useScreenRefresh";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import {
  AdminButton,
  AdminCard,
  AdminChip,
  AdminConfirmDialog,
  AdminField,
  AdminInfoBanner,
  AdminSectionHeader,
  adminStyles,
} from "@/shared/ui/admin/AdministrationPrimitives";
import { ThemedText } from "@/shared/ui/ThemedText";
import { useToast } from "@/shared/ui/Toast";
import { formatDateTime } from "@/shared/utils/dateTime";

import { useUserId, userStatuses } from "./userAdministrationShared";

export function UserEditScreen() {
  const router = useRouter();
  const userId = useUserId();
  const user = useUser(userId);
  const toast = useToast();
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<UserStatus>("ACTIVE");
  const [confirming, setConfirming] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { refreshing, onRefresh } = useScreenRefresh([user]);

  useEffect(() => {
    if (!user.data) return;
    // Async server state seeds an editable draft when the record arrives.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhone(user.data.phoneNumber ?? "");
    setStatus(user.data.status ?? "PENDING");
  }, [user.data]);

  const save = useUpdateUser({
    onSuccess: async () => {
      toast.show({ message: "Đã cập nhật người dùng", variant: "success" });
      setConfirming(false);
      router.replace(`/admin/users/${userId}` as Href);
    },
    onError: () =>
      toast.show({ message: "Không thể cập nhật người dùng", variant: "error" }),
  });
  const remove = useDeleteUser({
    onSuccess: async () => {
      router.replace("/admin/users" as Href);
    },
    onError: () =>
      toast.show({ message: "Không thể xóa người dùng", variant: "error" }),
  });

  const isFormValid = phone.trim().length >= 9 && (!newPassword || newPassword.length >= 6);

  return (
    <StackScreenLayout
      title="Sửa người dùng"
      contentContainerStyle={adminStyles.screen}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <AdminField
        label="Số điện thoại"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <AdminField
        label="Mật khẩu mới"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        placeholder="Nhập mật khẩu mới (nếu muốn đổi)"
      />
      <AdminSectionHeader title="Trạng thái" />
      <View style={adminStyles.chips}>
        {userStatuses.map((value) => (
          <AdminChip
            key={value}
            label={userStatusLabel(value)}
            selected={status === value}
            onPress={() => setStatus(value)}
          />
        ))}
      </View>
      <AdminCard style={adminStyles.gap}>
        <View style={adminStyles.labelValue}>
          <ThemedText type="featureLabel">Đăng nhập gần nhất</ThemedText>
          <ThemedText type="bodySmall" style={adminStyles.muted}>
            {formatDateTime(user.data?.lastLoginAt)}
          </ThemedText>
        </View>
        <View style={adminStyles.labelValue}>
          <ThemedText type="featureLabel">Phiên bản phân quyền</ThemedText>
          <ThemedText type="bodySmall" style={adminStyles.muted}>
            v{user.data?.authorizationVersion ?? 0}
          </ThemedText>
        </View>
      </AdminCard>
      <AdminInfoBanner>
        Khóa hoặc vô hiệu hóa tài khoản có thể khiến các phiên đăng nhập hiện tại mất quyền truy cập.
      </AdminInfoBanner>
      <AdminButton
        label="Lưu thay đổi"
        disabled={!isFormValid || save.isPending}
        onPress={() => setConfirming(true)}
      />
      <AdminButton label="Xóa người dùng" variant="text" onPress={() => setConfirmDelete(true)} />
      <AdminConfirmDialog
        confirming={confirming}
        title="Lưu thay đổi?"
        message="Số điện thoại và trạng thái tài khoản sẽ được cập nhật ngay."
        confirmLabel="Lưu"
        loading={save.isPending}
        onCancel={() => setConfirming(false)}
        onConfirm={() =>
          save.mutate({
            userId: userId as string,
            request: {
              phoneNumber: phone.trim(),
              passwordHash: newPassword.trim(),
              status,
              lastLoginAt: user.data?.lastLoginAt ?? "1970-01-01T00:00:00",
              authorizationVersion: user.data?.authorizationVersion ?? 0,
            },
          })
        }
      />
      <AdminConfirmDialog
        confirming={confirmDelete}
        title="Xóa người dùng?"
        message="Tài khoản và các liên kết liên quan sẽ bị ảnh hưởng. Thao tác này không thể hoàn tác."
        confirmLabel="Xóa"
        destructive
        loading={remove.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => remove.mutate(userId as string)}
      />
    </StackScreenLayout>
  );
}
