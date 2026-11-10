import { useState } from "react";
import { StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";

import type { PermissionResponse } from "../api/permission.dto";
import { groupPermissions } from "../domain/permissionViewModel";
import {
  usePermission,
  usePermissionsCatalog,
  useUpdatePermission,
} from "../queries/permissionQueries";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import {
  AdminButton,
  AdminCard,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminField,
  AdminIntro,
  AdminListRow,
  AdminLoadingState,
  AdminSearchField,
  AdminSectionHeader,
  adminStyles,
} from "@/shared/ui/admin/AdministrationPrimitives";
import { ThemedText } from "@/shared/ui/ThemedText";
import { useToast } from "@/shared/ui/Toast";
import { containsSearch } from "@/shared/utils/string";
import { Colors, radii } from "@/theme";

function go(router: ReturnType<typeof useRouter>, path: string) {
  router.push(path as Href);
}

function usePermissionId() {
  const { permissionId } = useLocalSearchParams<{ permissionId: string }>();
  const value = Array.isArray(permissionId) ? permissionId[0] : permissionId;
  const id = Number(value);
  return Number.isFinite(id) ? id : undefined;
}

export function PermissionsTabContent() {
  const router = useRouter();
  const permissions = usePermissionsCatalog();
  const [search, setSearch] = useState("");
  const filtered = (permissions.data?.content ?? []).filter((item) =>
    containsSearch(search, item.code, item.model, item.action),
  );
  const groups = groupPermissions(filtered);

  return (
    <>
      <AdminSearchField
        value={search}
        onChangeText={setSearch}
        placeholder="Tìm theo mã, phân hệ hoặc hành động"
      />
      <AdminSectionHeader title={`${filtered.length} quyền`} />
      {permissions.isPending ? (
        <AdminLoadingState />
      ) : Object.entries(groups).length === 0 ? (
        <AdminEmptyState message="Không tìm thấy quyền phù hợp" />
      ) : (
        Object.entries(groups).map(([model, items]) => (
          <AdminCard key={model} style={styles.permissionGroup}>
            <ThemedText type="title" style={styles.groupTitle}>
              {model}
            </ThemedText>
            {items.map((item) => (
              <AdminListRow
                key={item.permissionId}
                title={item.code}
                subtitle={item.action}
                onPress={() =>
                  go(router, `/admin/permissions/${item.permissionId}/edit`)
                }
              />
            ))}
          </AdminCard>
        ))
      )}
    </>
  );
}

export function PermissionListScreen() {
  return (
    <StackScreenLayout
      title="Vai trò & quyền"
      contentContainerStyle={adminStyles.screen}
    >
      <AdminIntro>
        Danh mục quyền kỹ thuật được dùng để cấu hình các vai trò.
      </AdminIntro>
      <PermissionsTabContent />
    </StackScreenLayout>
  );
}

function PermissionEditForm({
  permission,
}: {
  permission: PermissionResponse;
}) {
  const router = useRouter();
  const toast = useToast();
  const [description, setDescription] = useState(permission.description ?? "");
  const [confirming, setConfirming] = useState(false);

  const save = useUpdatePermission({
    onSuccess: async () => {
      toast.show({
        message: "Đã cập nhật quyền",
        variant: "success",
      });
      setConfirming(false);
      router.replace("/admin/permissions" as Href);
    },
    onError: () =>
      toast.show({ message: "Không thể lưu quyền", variant: "error" }),
  });

  return (
    <>
      <AdminField
        label="Mã quyền"
        value={permission.code}
        editable={false}
        helper="Mã quyền kỹ thuật cố định của hệ thống."
      />
      <AdminField
        label="Phân hệ"
        value={permission.model}
        editable={false}
      />
      <AdminField
        label="Hành động"
        value={permission.action}
        editable={false}
      />
      <AdminField
        label="Mô tả"
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="Mô tả phạm vi quyền"
      />
      <AdminButton
        label="Lưu thay đổi"
        onPress={() => setConfirming(true)}
      />
      <AdminButton
        label="Hủy"
        variant="secondary"
        onPress={() => router.back()}
      />
      <AdminConfirmDialog
        confirming={confirming}
        title="Lưu thay đổi?"
        message="Thông tin mô tả quyền sẽ được cập nhật."
        confirmLabel="Lưu"
        loading={save.isPending}
        onCancel={() => setConfirming(false)}
        onConfirm={() =>
          save.mutate({
            id: permission.permissionId,
            request: {
              code: permission.code,
              model: permission.model,
              action: permission.action,
              description: description.trim(),
            },
          })
        }
      />
    </>
  );
}

export function PermissionEditScreen() {
  const permissionId = usePermissionId();
  const permission = usePermission(permissionId);

  return (
    <StackScreenLayout
      title="Sửa quyền"
      contentContainerStyle={adminStyles.screen}
    >
      {permission.isPending ? (
        <AdminLoadingState />
      ) : !permission.data ? (
        <AdminEmptyState message="Không tìm thấy quyền" />
      ) : (
        <PermissionEditForm
          key={permission.data.permissionId}
          permission={permission.data}
        />
      )}
    </StackScreenLayout>
  );
}

const styles = StyleSheet.create({
  permissionGroup: { padding: 0, overflow: "hidden" },
  groupTitle: {
    padding: 14,
    color: Colors.light.text,
    backgroundColor: Colors.light.backgroundElement,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
  },
});

