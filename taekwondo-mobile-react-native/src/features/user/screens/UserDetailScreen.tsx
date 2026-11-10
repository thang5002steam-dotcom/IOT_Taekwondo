import { useRouter, type Href } from "expo-router";
import { useRef, useState } from "react";
import { View } from "react-native";
import { Trash6 } from "reicon-react-native";

import { Permission, useCan } from "@/features/authorization";
import type { PersonSimpleResponse } from "@/features/person";
import { useScreenRefresh } from "@/infrastructure/query/useScreenRefresh";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import {
  AdminCard,
  AdminChip,
  AdminEmptyState,
  AdminListRow,
  AdminLoadingState,
  AdminSectionHeader,
  adminStyles,
} from "@/shared/ui/admin/AdministrationPrimitives";
import { AppIcon } from "@/shared/ui/AppIcon";
import { CancellableLoadingOverlay } from "@/shared/ui/CancellableLoadingOverlay";
import { ConfirmationDialog } from "@/shared/ui/ConfirmationDialog";
import { FloatingActionBar } from "@/shared/ui/FloatingActionBar";
import { ThemedText } from "@/shared/ui/ThemedText";
import { useToast } from "@/shared/ui/Toast";
import { formatDateDMY, formatDateTime } from "@/shared/utils/dateTime";
import { Colors } from "@/theme";
import { LinkedPersonDetailSheet } from "../components/LinkedPersonDetailSheet";
import {
  Avatar,
  StatusChip,
  userAdminStyles,
} from "../components/UserAdministrationPrimitives";
import { useDeleteUser, useUser } from "../queries/userQueries";

import { navigate, useUserId } from "./userAdministrationShared";

export function UserDetailScreen() {
  const router = useRouter();
  const userId = useUserId();
  const user = useUser(userId);
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deleteController = useRef<AbortController | null>(null);
  const canDelete = useCan(Permission.USER_DELETE);

  const [selectedPerson, setSelectedPerson] =
    useState<PersonSimpleResponse | null>(null);

  const { refreshing, onRefresh } = useScreenRefresh([user]);

  const linkedPeople: PersonSimpleResponse[] = user.data?.persons ?? [];
  const assignedRoles = user.data?.roles ?? [];

  const remove = useDeleteUser();

  const handleDelete = async () => {
    if (!userId) return;

    setConfirming(false);
    setDeleting(true);
    const controller = new AbortController();
    deleteController.current = controller;

    try {
      await remove.mutateAsync({ userId, signal: controller.signal });
      toast.show({ message: "Đã xóa người dùng", variant: "success" });
      router.replace("/admin/users" as Href);
    } catch (error) {
      if ((error as { name?: string }).name !== "AbortError") {
        toast.show({ message: "Không thể xóa người dùng này", variant: "error" });
      }
    } finally {
      deleteController.current = null;
      setDeleting(false);
    }
  };

  return (
    <>
      <StackScreenLayout
        title="Chi tiết người dùng"
        contentContainerStyle={[adminStyles.screen, { paddingBottom: 128 }]}
        refreshing={refreshing}
        onRefresh={onRefresh}
        floatingContent={
          user.data ? (
            <FloatingActionBar
              actions={[
                {
                  label: "Chỉnh sửa",
                  accessibilityLabel: "Chỉnh sửa người dùng",
                  variant: "outline",
                  onPress: () => navigate(router, `/admin/users/${userId}/edit`),
                },
                {
                  label: "Gán vai trò",
                  accessibilityLabel: "Gán vai trò cho người dùng",
                  variant: "primary",
                  flex: 1.3,
                  onPress: () => navigate(router, `/admin/users/${userId}/roles`),
                },
                ...(canDelete
                  ? [
                      {
                        key: "delete",
                        label: "",
                        accessibilityLabel: "Xóa người dùng",
                        variant: "ghost" as const,
                        disabled: deleting,
                        flex: 0,
                        onPress: () => setConfirming(true),
                        style: {
                          width: 44,
                          minWidth: 44,
                          paddingHorizontal: 0,
                          backgroundColor: "transparent",
                          borderWidth: 0,
                        },
                        icon: (
                          <AppIcon
                            icon={<Trash6 />}
                            size={30}
                            color={
                              deleting
                                ? Colors.light.textSecondary
                                : Colors.light.error
                            }
                          />
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          ) : undefined
        }
      >
      {user.isPending ? (
        <AdminLoadingState />
      ) : !user.data ? (
        <AdminEmptyState message="Không tìm thấy người dùng" />
      ) : (
        <>
          <AdminCard style={adminStyles.gap}>
            <View style={userAdminStyles.titleRow}>
              <Avatar name={user.data.phoneNumber?.substring(8)} />
              <View style={adminStyles.grow}>
                <ThemedText type="heading">{user.data.phoneNumber}</ThemedText>
                <ThemedText type="bodySmall" style={adminStyles.muted}>
                  Được tạo: {formatDateDMY(user.data.createdAt)}
                </ThemedText>
              </View>
              <StatusChip status={user.data.status} />
            </View>
            <View style={adminStyles.labelValue}>
              <ThemedText type="featureLabel">Đăng nhập gần nhất</ThemedText>
              <ThemedText type="bodySmall" style={adminStyles.muted}>
                {formatDateTime(user.data.lastLoginAt)}
              </ThemedText>
            </View>
            <View style={adminStyles.labelValue}>
              <ThemedText type="featureLabel">Phiên bản phân quyền</ThemedText>
              <ThemedText type="bodySmall" style={adminStyles.muted}>
                v{user.data.authorizationVersion ?? 0}
              </ThemedText>
            </View>
          </AdminCard>
          <AdminSectionHeader
            title="Hồ sơ liên kết"
            actionLabel="Quản lý"
            onAction={() => navigate(router, `/admin/users/${userId}/profiles`)}
          />
          {linkedPeople.length === 0 ? (
            <AdminEmptyState message="Chưa liên kết hồ sơ" />
          ) : (
            <AdminCard style={userAdminStyles.zeroPadding}>
              {linkedPeople.map((person: PersonSimpleResponse) => (
                <AdminListRow
                  key={person.personId}
                  leading={
                    <Avatar
                      name={person.fullName}
                      imageUrl={person.faceImagePath}
                    />
                  }
                  title={person.fullName}
                  subtitle={person.position?.name}
                  onPress={() => setSelectedPerson(person)}
                  meta={
                    <AdminChip
                      label={
                        person.status === "ACTIVE"
                          ? "Hoạt động"
                          : "Ngừng hoạt động"
                      }
                      tone={person.status === "ACTIVE" ? "success" : "neutral"}
                    />
                  }
                />
              ))}
            </AdminCard>
          )}
          <AdminSectionHeader
            title="Vai trò được gán"
            actionLabel="Quản lý"
            onAction={() => navigate(router, `/admin/users/${userId}/roles`)}
          />
          {assignedRoles.length === 0 ? (
            <AdminEmptyState message="Chưa được gán vai trò" />
          ) : (
            <AdminCard style={userAdminStyles.zeroPadding}>
              {assignedRoles.map((role) => (
                <AdminListRow
                  key={role.code}
                  leading={<Avatar name={role.name} />}
                  title={role.name}
                  subtitle={role.code}
                  meta={
                    role.permissionVersion !== undefined ? (
                      <AdminChip
                        label={`v${role.permissionVersion}`}
                        tone="info"
                      />
                    ) : (
                      <AdminChip label="Vai trò" tone="info" />
                    )
                  }
                  onPress={() =>
                    navigate(router, `/admin/users/${userId}/roles`)
                  }
                />
              ))}
            </AdminCard>
          )}
        </>
      )}
      </StackScreenLayout>
      <ConfirmationDialog
        visible={confirming}
        title="Xóa người dùng"
        description="Tài khoản, vai trò và các liên kết hồ sơ của người dùng sẽ bị ảnh hưởng. Thao tác này không thể hoàn tác."
        confirmLabel="Xóa"
        confirmVariant="danger"
        onCancel={() => setConfirming(false)}
        onConfirm={handleDelete}
      />
      <CancellableLoadingOverlay
        visible={deleting}
        message="Đang xóa người dùng..."
        cancelLabel="Hủy"
        onCancel={() => deleteController.current?.abort()}
      />
      <LinkedPersonDetailSheet
        person={selectedPerson}
        userId={userId}
        onClose={() => setSelectedPerson(null)}
      />
    </>
  );
}
