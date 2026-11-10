import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Trash6 } from "reicon-react-native";

import { Permission, useCan } from "@/features/authorization";
import { PermissionsTabContent } from "@/features/permissions";
import type {
  PermissionSimpleResponse,
} from "@/features/permissions/api/permission.dto";
import { groupPermissions } from "@/features/permissions/domain/permissionViewModel";
import { usePermissionsCatalog } from "@/features/permissions/queries/permissionQueries";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { AppIcon } from "@/shared/ui/AppIcon";
import { CancellableLoadingOverlay } from "@/shared/ui/CancellableLoadingOverlay";
import { ConfirmationDialog } from "@/shared/ui/ConfirmationDialog";
import { FloatingActionBar } from "@/shared/ui/FloatingActionBar";
import {
  AdminButton,
  AdminCard,
  AdminChip,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminField,
  AdminInfoBanner,
  AdminIntro,
  AdminListRow,
  AdminLoadingState,
  AdminSearchField,
  AdminSectionHeader,
  AdminTabs,
  adminStyles,
} from "@/shared/ui/admin/AdministrationPrimitives";
import { ThemedText } from "@/shared/ui/ThemedText";
import { useToast } from "@/shared/ui/Toast";
import { containsSearch } from "@/shared/utils/string";
import { Colors, radii } from "@/theme";
import type { RoleResponse } from "../api/role.dto";
import {
  useCreateRole,
  useDeleteRole,
  useReplaceRolePermissions,
  useRole,
  useRoles,
  useUpdateRole,
} from "../queries/roleQueries";

const tabs = [
  { value: "roles", label: "Vai trò" },
  { value: "permissions", label: "Quyền" },
] as const;

function go(router: ReturnType<typeof useRouter>, path: string) {
  router.push(path as Href);
}

function useRoleCode() {
  const { roleCode } = useLocalSearchParams<{ roleCode: string }>();
  return Array.isArray(roleCode) ? roleCode[0] : roleCode;
}

function RolesTabContent() {
  const router = useRouter();
  const roles = useRoles();
  const [search, setSearch] = useState("");
  const visibleRoles = (roles.data?.content ?? []).filter((role) =>
    containsSearch(search, role.name, role.code),
  );

  return (
    <>
      <AdminSearchField
        value={search}
        onChangeText={setSearch}
        placeholder="Tìm theo tên hoặc mã vai trò"
      />
      <AdminSectionHeader
        title={`${visibleRoles.length} vai trò`}
        actionLabel="Tạo vai trò"
        onAction={() => go(router, "/admin/roles/create")}
      />
      {roles.isPending ? (
        <AdminLoadingState />
      ) : visibleRoles.length === 0 ? (
        <AdminEmptyState message="Không tìm thấy vai trò phù hợp" />
      ) : (
        <View style={styles.list}>
          {visibleRoles.map((role) => {
            const count = role.permissions?.length ?? 0;
            return (
              <AdminListRow
                key={role.code}
                title={role.name}
                subtitle={`${role.code} · ${count} quyền`}
                onPress={() => go(router, `/admin/roles/${role.code}`)}
              />
            );
          })}
        </View>
      )}
    </>
  );
}

export function RoleListScreen({
  initialTab,
}: { initialTab?: "roles" | "permissions" } = {}) {
  const { tab } = useLocalSearchParams<{ tab?: "roles" | "permissions" }>();
  const [activeTab, setActiveTab] = useState<"roles" | "permissions">(() => {
    if (initialTab) return initialTab;
    if (tab === "permissions" || tab === "roles") return tab;
    return "roles";
  });

  return (
    <StackScreenLayout
      title="Vai trò & quyền"
      contentContainerStyle={adminStyles.listScreen}
    >
      <AdminTabs
        items={tabs}
        value={activeTab}
        onChange={(value) => setActiveTab(value as "roles" | "permissions")}
      />
      <AdminIntro>
        {activeTab === "roles"
          ? "Quản lý vai trò và tập quyền truy cập trong hệ thống."
          : "Danh mục quyền kỹ thuật được dùng để cấu hình các vai trò."}
      </AdminIntro>
      {activeTab === "roles" ? <RolesTabContent /> : <PermissionsTabContent />}
    </StackScreenLayout>
  );
}

export function RoleDetailScreen() {
  const router = useRouter();
  const roleCode = useRoleCode();
  const role = useRole(roleCode);
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deleteController = useRef<AbortController | null>(null);
  const canDelete = useCan(Permission.ROLE_DELETE);
  const remove = useDeleteRole();

  const handleDelete = async () => {
    if (!roleCode) return;

    setConfirming(false);
    setDeleting(true);
    const controller = new AbortController();
    deleteController.current = controller;

    try {
      await remove.mutateAsync({ roleCode, signal: controller.signal });
      toast.show({ message: "Đã xóa vai trò", variant: "success" });
      router.replace("/admin/roles" as Href);
    } catch (error) {
      if ((error as { name?: string }).name !== "AbortError") {
        toast.show({
          message: "Không thể xóa vai trò đang được sử dụng",
          variant: "error",
        });
      }
    } finally {
      deleteController.current = null;
      setDeleting(false);
    }
  };

  const assigned = role.data?.permissions ?? [];
  const grouped = groupPermissions(assigned);

  return (
    <>
      <StackScreenLayout
        title="Chi tiết vai trò"
        contentContainerStyle={[adminStyles.screen, { paddingBottom: 128 }]}
        floatingContent={
          role.data ? (
            <FloatingActionBar
              actions={[
                {
                  label: "Chỉnh sửa",
                  accessibilityLabel: "Chỉnh sửa vai trò",
                  variant: "outline",
                  onPress: () => go(router, `/admin/roles/${roleCode}/edit`),
                },
                {
                  label: "Phân quyền",
                  accessibilityLabel: "Phân quyền cho vai trò",
                  variant: "primary",
                  flex: 1.3,
                  onPress: () =>
                    go(router, `/admin/roles/${roleCode}/permissions`),
                },
                ...(canDelete
                  ? [
                      {
                        key: "delete",
                        label: "",
                        accessibilityLabel: "Xóa vai trò",
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
      {role.isPending ? (
        <AdminLoadingState />
      ) : !role.data ? (
        <AdminEmptyState message="Không tìm thấy vai trò" />
      ) : (
        <>
          <AdminCard style={adminStyles.gap}>
            <ThemedText type="heading">{role.data.name}</ThemedText>
            <ThemedText type="code" style={styles.code}>
              {role.data.code}
            </ThemedText>
            <ThemedText type="bodySmall" style={adminStyles.muted}>
              {role.data.description || "Chưa có mô tả"}
            </ThemedText>
            <View style={styles.stats}>
              <View>
                <ThemedText type="heading">{assigned.length}</ThemedText>
                <ThemedText type="bodySmall" style={adminStyles.muted}>
                  Quyền
                </ThemedText>
              </View>
              <View>
                <ThemedText type="heading">
                  v{role.data.permissionVersion}
                </ThemedText>
                <ThemedText type="bodySmall" style={adminStyles.muted}>
                  Phiên bản
                </ThemedText>
              </View>
            </View>
          </AdminCard>
          <AdminSectionHeader title="Quyền đã gán" />
          {Object.entries(grouped).length === 0 ? (
            <AdminEmptyState message="Vai trò chưa được gán quyền" />
          ) : (
            Object.entries(grouped).map(([model, items]) => (
              <AdminCard key={model} style={adminStyles.gap}>
                <ThemedText type="title">{model}</ThemedText>
                <View style={adminStyles.chips}>
                  {items.map((permission) => (
                    <AdminChip
                      key={permission.code}
                      label={permission.action}
                      tone="info"
                    />
                  ))}
                </View>
              </AdminCard>
            ))
          )}
        </>
      )}
      </StackScreenLayout>
      <ConfirmationDialog
        visible={confirming}
        title="Xóa vai trò"
        description={`Vai trò “${role.data?.name ?? roleCode}” sẽ bị xóa vĩnh viễn. Thao tác này không thể hoàn tác.`}
        confirmLabel="Xóa"
        confirmVariant="danger"
        onCancel={() => setConfirming(false)}
        onConfirm={handleDelete}
      />
      <CancellableLoadingOverlay
        visible={deleting}
        message="Đang xóa vai trò..."
        cancelLabel="Hủy"
        onCancel={() => deleteController.current?.abort()}
      />
    </>
  );
}

function RoleCreateForm() {
  const router = useRouter();
  const toast = useToast();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("0");
  const [confirming, setConfirming] = useState(false);

  const save = useCreateRole({
    onSuccess: async (saved) => {
      toast.show({
        message: "Đã tạo vai trò",
        variant: "success",
      });
      setConfirming(false);
      router.replace(`/admin/roles/${saved.code}/permissions` as Href);
    },
    onError: () =>
      toast.show({
        message: "Không thể lưu vai trò. Vui lòng kiểm tra dữ liệu.",
        variant: "error",
      }),
  });

  const valid = code.trim().length > 1 && name.trim().length > 1;

  return (
    <>
      <AdminField
        label="Mã vai trò"
        value={code}
        onChangeText={setCode}
        placeholder="Ví dụ: ROLE_MANAGER"
        helper="Dùng chữ in hoa và dấu gạch dưới."
      />
      <AdminField
        label="Tên vai trò"
        value={name}
        onChangeText={setName}
        placeholder="Nhập tên hiển thị"
      />
      <AdminField
        label="Mô tả"
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="Mô tả phạm vi trách nhiệm"
      />
      <AdminField
        label="Phiên bản quyền"
        value={version}
        onChangeText={setVersion}
        keyboardType="number-pad"
        helper="Tăng phiên bản để buộc phiên đăng nhập làm mới quyền."
      />
      <AdminButton
        label="Tạo vai trò"
        disabled={!valid}
        onPress={() => setConfirming(true)}
      />
      <AdminButton
        label="Hủy"
        variant="secondary"
        onPress={() => router.back()}
      />
      <AdminConfirmDialog
        confirming={confirming}
        title="Tạo vai trò mới?"
        message={`Vai trò “${name}” sẽ được tạo và chuyển sang bước phân quyền.`}
        confirmLabel="Tạo mới"
        loading={save.isPending}
        onCancel={() => setConfirming(false)}
        onConfirm={() =>
          save.mutate({
            code: code.trim().toUpperCase(),
            name: name.trim(),
            description: description.trim(),
            permissionVersion: Number(version) || 0,
          })
        }
      />
    </>
  );
}

function RoleEditForm({ role }: { role: RoleResponse }) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description);
  const [version, setVersion] = useState(String(role.permissionVersion));
  const [confirming, setConfirming] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = useUpdateRole({
    onSuccess: async (saved) => {
      toast.show({
        message: "Đã cập nhật vai trò",
        variant: "success",
      });
      setConfirming(false);
      router.replace(`/admin/roles/${saved.code}` as Href);
    },
    onError: () =>
      toast.show({
        message: "Không thể lưu vai trò. Vui lòng kiểm tra dữ liệu.",
        variant: "error",
      }),
  });

  const remove = useDeleteRole({
    onSuccess: async () => {
      router.replace("/admin/roles" as Href);
    },
    onError: () =>
      toast.show({ message: "Không thể xóa vai trò", variant: "error" }),
  });

  const valid = name.trim().length > 1;

  return (
    <>
      <AdminField
        label="Mã vai trò"
        value={role.code}
        editable={false}
        helper="Mã vai trò không thể thay đổi."
      />
      <AdminField
        label="Tên vai trò"
        value={name}
        onChangeText={setName}
        placeholder="Nhập tên hiển thị"
      />
      <AdminField
        label="Mô tả"
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="Mô tả phạm vi trách nhiệm"
      />
      <AdminField
        label="Phiên bản quyền"
        value={version}
        onChangeText={setVersion}
        keyboardType="number-pad"
        helper="Tăng phiên bản để buộc phiên đăng nhập làm mới quyền."
      />
      <AdminInfoBanner>
        Mọi thay đổi quyền cần được kiểm tra với các tài khoản đang mang vai trò
        này.
      </AdminInfoBanner>
      <AdminButton
        label="Lưu thay đổi"
        disabled={!valid}
        onPress={() => setConfirming(true)}
      />
      <AdminButton
        label="Xóa vai trò"
        variant="text"
        onPress={() => setConfirmDelete(true)}
      />
      <AdminConfirmDialog
        confirming={confirming}
        title="Lưu thay đổi?"
        message="Thông tin vai trò sẽ được cập nhật ngay."
        confirmLabel="Lưu"
        loading={save.isPending}
        onCancel={() => setConfirming(false)}
        onConfirm={() =>
          save.mutate({
            code: role.code,
            request: {
              name: name.trim(),
              description: description.trim(),
              permissionVersion: Number(version) || 0,
            },
          })
        }
      />
      <AdminConfirmDialog
        confirming={confirmDelete}
        title="Xóa vai trò?"
        message="Vai trò sẽ bị xóa vĩnh viễn và không thể hoàn tác."
        confirmLabel="Xóa"
        destructive
        loading={remove.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => remove.mutate(role.code)}
      />
    </>
  );
}

export function RoleCreateScreen() {
  return (
    <StackScreenLayout
      title="Tạo vai trò"
      contentContainerStyle={adminStyles.screen}
    >
      <RoleCreateForm />
    </StackScreenLayout>
  );
}

export function RoleEditScreen() {
  const roleCode = useRoleCode();
  const role = useRole(roleCode);

  return (
    <StackScreenLayout
      title="Sửa vai trò"
      contentContainerStyle={adminStyles.screen}
    >
      {role.isPending ? (
        <AdminLoadingState />
      ) : !role.data ? (
        <AdminEmptyState message="Không tìm thấy vai trò" />
      ) : (
        <RoleEditForm key={role.data.code} role={role.data} />
      )}
    </StackScreenLayout>
  );
}

function RolePermissionsForm({
  role,
  catalog
}: {
  role: RoleResponse;
  catalog: PermissionSimpleResponse[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const initialCodes = useMemo(
    () => role.permissions?.map((p) => p.code) ?? [],
    [role.permissions],
  );
  const [selected, setSelected] = useState<string[]>(initialCodes);

  const filtered = useMemo(
    () =>
      catalog.filter((item) =>
        containsSearch(search, item.code, item.model, item.action),
      ),
    [catalog, search],
  );
  const groups = useMemo(() => groupPermissions(filtered), [filtered]);

  const save = useReplaceRolePermissions({
    onSuccess: async () => {
      toast.show({
        message: "Đã cập nhật quyền của vai trò",
        variant: "success",
      });
      router.replace(`/admin/roles/${role.code}` as Href);
    },
    onError: () =>
      toast.show({
        message: "Không thể cập nhật phân quyền",
        variant: "error",
      }),
  });

  const toggle = (code: string) =>
    setSelected((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    );

  return (
    <>
      <AdminCard>
        <ThemedText type="title">{role.name}</ThemedText>
        <ThemedText type="bodySmall" style={adminStyles.muted}>
          {selected.length} quyền được chọn
        </ThemedText>
      </AdminCard>
      <AdminSearchField
        value={search}
        onChangeText={setSearch}
        placeholder="Tìm quyền hoặc phân hệ"
      />
      {Object.entries(groups).map(([model, items]) => (
        <AdminCard key={model} style={adminStyles.gap}>
          <ThemedText type="title">{model}</ThemedText>
          <View style={adminStyles.chips}>
            {items.map((permission) => (
              <AdminChip
                key={permission.code}
                label={permission.action}
                selected={selected.includes(permission.code)}
                onPress={() => toggle(permission.code)}
              />
            ))}
          </View>
        </AdminCard>
      ))}
      <View style={adminStyles.actions}>
        <AdminButton
          label="Đặt lại"
          variant="secondary"
          onPress={() => setSelected(initialCodes)}
          style={adminStyles.grow}
        />
        <AdminButton
          label="Lưu phân quyền"
          loading={save.isPending}
          onPress={() =>
            save.mutate({ roleCode: role.code, permissionCodes: selected })
          }
          style={adminStyles.grow}
        />
      </View>
    </>
  );
}

export function RolePermissionsScreen() {
  const roleCode = useRoleCode();
  const role = useRole(roleCode);
  const permissions = usePermissionsCatalog();

  return (
    <StackScreenLayout
      title="Phân quyền"
      contentContainerStyle={adminStyles.screen}
    >
      {role.isPending || permissions.isPending ? (
        <AdminLoadingState />
      ) : !role.data ? (
        <AdminEmptyState message="Không tìm thấy vai trò" />
      ) : (
        <RolePermissionsForm
          key={role.data.code}
          role={role.data}
          catalog={permissions.data?.content ?? []}
        />
      )}
    </StackScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: { overflow: "hidden", borderRadius: radii.md },
  code: {
    alignSelf: "flex-start",
    color: Colors.light.primary,
    backgroundColor: Colors.light.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 8,
  },
});
