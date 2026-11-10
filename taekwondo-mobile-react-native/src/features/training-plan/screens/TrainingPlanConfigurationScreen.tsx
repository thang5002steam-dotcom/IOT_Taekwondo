import { useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Plus } from "reicon-react-native";

import { Permission, useCan } from "@/features/authorization";
import { getApiErrorMessage } from "@/infrastructure/http/httpError";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { AppIcon } from "@/shared/ui/AppIcon";
import { BottomSheetWindow } from "@/shared/ui/BottomSheetWindow";
import { CancellableLoadingOverlay } from "@/shared/ui/CancellableLoadingOverlay";
import { ConfirmationDialog } from "@/shared/ui/ConfirmationDialog";
import { useToast } from "@/shared/ui/Toast";
import {
  AdminButton,
  AdminChip,
  AdminEmptyState,
  AdminField,
  AdminListRow,
} from "@/shared/ui/admin/AdministrationPrimitives";
import {
  FormField,
  SegmentedTabs,
} from "@/shared/ui/commerce/CommercePrimitives";
import { Colors, radii } from "@/theme";

import {
  SessionTypeLabel,
  SessionTypeValues,
} from "../constants/training-plan.constants";
import type { SessionType } from "../api/trainingPlan.dto";
import {
  TrainingPlanConfigurationDetailSheet,
  type ConfigurationSelection,
} from "../components/TrainingPlanConfigurationDetailSheet";
import {
  useCreateTrainingPlanAddon,
  useCreateTrainingPlanRequirement,
  useDeleteTrainingPlanAddon,
  useDeleteTrainingPlanRequirement,
  useTrainingPlan,
  useUpdateTrainingPlanAddon,
  useUpdateTrainingPlanRequirement,
} from "../queries/trainingPlanQueries";

type ConfigurationMode = "requirements" | "addons";
type CreateSheet = ConfigurationMode | null;

const configurationTabs = [
  { value: "requirements", label: "Yêu cầu" },
  { value: "addons", label: "Add-on" },
] as const;

export function TrainingPlanConfigurationScreen() {
  const { trainingPlanId } = useLocalSearchParams<{ trainingPlanId: string }>();
  const toast = useToast();
  const query = useTrainingPlan(trainingPlanId);
  const createRequirement = useCreateTrainingPlanRequirement();
  const createAddon = useCreateTrainingPlanAddon();
  const updateRequirement = useUpdateTrainingPlanRequirement();
  const updateAddon = useUpdateTrainingPlanAddon();
  const deleteRequirement = useDeleteTrainingPlanRequirement();
  const deleteAddon = useDeleteTrainingPlanAddon();
  const canCreateRequirement = useCan(
    Permission.TRAINING_PLAN_REQUIREMENT_CREATE,
  );
  const canCreateAddon = useCan(Permission.TRAINING_PLAN_ADDON_CREATE);
  const [mode, setMode] = useState<ConfigurationMode>("requirements");
  const [search, setSearch] = useState("");
  const [sheet, setSheet] = useState<CreateSheet>(null);
  const [sessionType, setSessionType] = useState<SessionType>("REQUIRED");
  const [sessions, setSessions] = useState("1");
  const [name, setName] = useState("");
  const [extra, setExtra] = useState("1");
  const [price, setPrice] = useState("");
  const [selection, setSelection] = useState<ConfigurationSelection>();
  const [editing, setEditing] = useState<ConfigurationSelection>();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deleteAbortRef = useRef<AbortController | undefined>(undefined);

  const plan = query.data;
  const normalizedSearch = search.trim().toLocaleLowerCase("vi-VN");
  const requirements = useMemo(
    () =>
      (plan?.requirements ?? []).filter((item) =>
        label(item.sessionType)
          .toLocaleLowerCase("vi-VN")
          .includes(normalizedSearch),
      ),
    [normalizedSearch, plan?.requirements],
  );
  const addons = useMemo(
    () =>
      (plan?.addons ?? []).filter((item) =>
        item.name.toLocaleLowerCase("vi-VN").includes(normalizedSearch),
      ),
    [normalizedSearch, plan?.addons],
  );

  const canCreate =
    mode === "requirements" ? canCreateRequirement : canCreateAddon;
  const createLabel = mode === "requirements" ? "Thêm yêu cầu" : "Thêm add-on";

  const saveRequirement = async () => {
    if (!trainingPlanId) return;
    try {
      await createRequirement.mutateAsync({
        trainingPlanId,
        sessionType,
        sessionsPerWeek: Number(sessions),
      });
      setSheet(null);
      toast.show({ message: "Đã thêm yêu cầu.", variant: "success" });
    } catch (error) {
      toast.show({
        message: getApiErrorMessage(error, "Không thể thêm yêu cầu."),
        variant: "error",
      });
    }
  };

  const saveAddon = async () => {
    if (!trainingPlanId) return;
    try {
      await createAddon.mutateAsync({
        trainingPlanId,
        name,
        extraSessionsPerWeek: Number(extra),
        price: Number(price),
        status: "ACTIVE",
      });
      setSheet(null);
      toast.show({ message: "Đã thêm add-on.", variant: "success" });
    } catch (error) {
      toast.show({
        message: getApiErrorMessage(error, "Không thể thêm add-on."),
        variant: "error",
      });
    }
  };

  const openEdit = () => {
    if (!selection) return;
    setEditing(selection);
    if (selection.kind === "requirement") {
      setSessionType(selection.item.sessionType);
      setSessions(String(selection.item.sessionsPerWeek));
    } else {
      setName(selection.item.name);
      setExtra(String(selection.item.extraSessionsPerWeek));
      setPrice(String(selection.item.price));
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      if (editing.kind === "requirement") {
        await updateRequirement.mutateAsync({
          id: editing.item.trainingPlanRequirementId,
          request: { sessionType, sessionsPerWeek: Number(sessions) },
        });
      } else {
        await updateAddon.mutateAsync({
          id: editing.item.trainingPlanAddonId,
          request: {
            name,
            extraSessionsPerWeek: Number(extra),
            price: Number(price),
            status: editing.item.status,
          },
        });
      }
      setEditing(undefined);
      setSelection(undefined);
      toast.show({ message: "Đã cập nhật cấu hình.", variant: "success" });
    } catch (error) {
      toast.show({
        message: getApiErrorMessage(error, "Không thể cập nhật cấu hình."),
        variant: "error",
      });
    }
  };

  const confirmDelete = async () => {
    if (!selection) return;
    setConfirmingDelete(false);
    setDeleting(true);
    const controller = new AbortController();
    deleteAbortRef.current = controller;
    try {
      if (selection.kind === "requirement")
        await deleteRequirement.mutateAsync({
          id: selection.item.trainingPlanRequirementId,
          signal: controller.signal,
        });
      else
        await deleteAddon.mutateAsync({
          id: selection.item.trainingPlanAddonId,
          signal: controller.signal,
        });
      setSelection(undefined);
      toast.show({ message: "Đã xóa cấu hình.", variant: "success" });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        toast.show({
          message: getApiErrorMessage(error, "Không thể xóa cấu hình."),
          variant: "error",
        });
      }
    } finally {
      deleteAbortRef.current = undefined;
      setDeleting(false);
    }
  };

  if (query.isPending) {
    return (
      <StackScreenLayout title="Yêu cầu & Add-on">
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      </StackScreenLayout>
    );
  }
  if (!plan) {
    return (
      <StackScreenLayout title="Yêu cầu & Add-on">
        <AdminEmptyState message="Không tìm thấy gói học" />
      </StackScreenLayout>
    );
  }

  return (
    <>
      <StackScreenLayout
        title="Yêu cầu & Add-on"
        contentContainerStyle={styles.content}
      >
        <SegmentedTabs
          value={mode}
          tabs={[...configurationTabs]}
          onChange={setMode}
        />
        <View style={styles.searchRow}>
          <View style={styles.grow}>
            <FormField
              value={search}
              onChangeText={setSearch}
              placeholder={
                mode === "requirements" ? "Tìm loại yêu cầu" : "Tìm tên add-on"
              }
              returnKeyType="search"
              accessibilityLabel={
                mode === "requirements" ? "Tìm kiếm yêu cầu" : "Tìm kiếm add-on"
              }
            />
          </View>
          {canCreate ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={createLabel}
              hitSlop={8}
              onPress={() => setSheet(mode)}
              style={({ pressed }) => [
                styles.addButton,
                pressed && styles.addPressed,
              ]}
            >
              <AppIcon icon={<Plus />} size={22} color={Colors.light.surface} />
            </Pressable>
          ) : null}
        </View>
        {mode === "requirements" ? (
          requirements.length === 0 ? (
            <AdminEmptyState message="Không tìm thấy yêu cầu phù hợp" />
          ) : (
            requirements.map((item) => (
              <AdminListRow
                key={item.trainingPlanRequirementId}
                title={label(item.sessionType)}
                subtitle={`${item.sessionsPerWeek} buổi/tuần`}
                onPress={() => setSelection({ kind: "requirement", item })}
              />
            ))
          )
        ) : addons.length === 0 ? (
          <AdminEmptyState message="Không tìm thấy add-on phù hợp" />
        ) : (
          addons.map((item) => (
            <AdminListRow
              key={item.trainingPlanAddonId}
              title={item.name}
              subtitle={`+${item.extraSessionsPerWeek} buổi/tuần · ${formatMoney(item.price)}`}
              meta={
                <AdminChip
                  label={item.status === "ACTIVE" ? "Đang bán" : "Tạm dừng"}
                  tone={item.status === "ACTIVE" ? "success" : "danger"}
                />
              }
              onPress={() => setSelection({ kind: "addon", item })}
            />
          ))
        )}
      </StackScreenLayout>
      <TrainingPlanConfigurationDetailSheet
        selection={selection}
        onClose={() => setSelection(undefined)}
        onEdit={openEdit}
        onDelete={() => setConfirmingDelete(true)}
        overlay={
          <>
            <ConfirmationDialog
              visible={confirmingDelete}
              presentation="inline"
              title="Xóa cấu hình"
              description="Thao tác này không thể hoàn tác."
              confirmLabel="Xóa"
              cancelLabel="Hủy"
              confirmVariant="danger"
              onCancel={() => setConfirmingDelete(false)}
              onConfirm={() => void confirmDelete()}
            />
            <CancellableLoadingOverlay
              visible={deleting}
              message="Đang xóa cấu hình..."
              cancelLabel="Hủy"
              onCancel={() => deleteAbortRef.current?.abort()}
            />
            <BottomSheetWindow
              visible={Boolean(editing)}
              presentation="inline"
              title={
                editing?.kind === "requirement"
                  ? "Chỉnh sửa yêu cầu"
                  : "Chỉnh sửa add-on"
              }
              heightRatio={editing?.kind === "requirement" ? 0.52 : 0.58}
              onClose={() => setEditing(undefined)}
              footer={
                <AdminButton
                  label="Lưu thay đổi"
                  loading={updateRequirement.isPending || updateAddon.isPending}
                  onPress={() => void saveEdit()}
                />
              }
            >
              {editing?.kind === "requirement" ? (
                <View style={styles.sheet}>
                  <View style={styles.chips}>
                    {SessionTypeValues.map((value) => (
                      <AdminChip
                        key={value}
                        label={label(value)}
                        selected={sessionType === value}
                        onPress={() => setSessionType(value)}
                      />
                    ))}
                  </View>
                  <AdminField
                    label="Số buổi/tuần"
                    value={sessions}
                    onChangeText={setSessions}
                    keyboardType="numeric"
                  />
                </View>
              ) : (
                <View style={styles.sheet}>
                  <AdminField
                    label="Tên add-on"
                    value={name}
                    onChangeText={setName}
                  />
                  <AdminField
                    label="Số buổi tăng thêm/tuần"
                    value={extra}
                    onChangeText={setExtra}
                    keyboardType="numeric"
                  />
                  <AdminField
                    label="Giá bán (đ)"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                  />
                </View>
              )}
            </BottomSheetWindow>
          </>
        }
      />
      <BottomSheetWindow
        visible={sheet === "requirements"}
        title="Thêm yêu cầu buổi tập"
        heightRatio={0.52}
        onClose={() => setSheet(null)}
        footer={
          <AdminButton
            label="Lưu yêu cầu"
            loading={createRequirement.isPending}
            onPress={saveRequirement}
          />
        }
      >
        <View style={styles.sheet}>
          <View style={styles.chips}>
            {SessionTypeValues.map((value) => (
              <AdminChip
                key={value}
                label={label(value)}
                selected={sessionType === value}
                onPress={() => setSessionType(value)}
              />
            ))}
          </View>
          <AdminField
            label="Số buổi/tuần"
            value={sessions}
            onChangeText={setSessions}
            keyboardType="numeric"
          />
        </View>
      </BottomSheetWindow>
      <BottomSheetWindow
        visible={sheet === "addons"}
        title="Thêm add-on"
        heightRatio={0.58}
        onClose={() => setSheet(null)}
        footer={
          <AdminButton
            label="Lưu add-on"
            loading={createAddon.isPending}
            onPress={saveAddon}
          />
        }
      >
        <View style={styles.sheet}>
          <AdminField
            label="Tên add-on"
            value={name}
            onChangeText={setName}
            placeholder="Ví dụ: PT kèm riêng"
          />
          <AdminField
            label="Số buổi tăng thêm/tuần"
            value={extra}
            onChangeText={setExtra}
            keyboardType="numeric"
          />
          <AdminField
            label="Giá bán (đ)"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
        </View>
      </BottomSheetWindow>
    </>
  );
}

function label(value: SessionType) {
  return SessionTypeLabel[value];
}

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

const styles = StyleSheet.create({
  content: { paddingBottom: 128 },
  loading: { alignItems: "center", paddingVertical: 48 },
  searchRow: { flexDirection: "row", alignItems: "flex-end", gap: 12 },
  grow: { flex: 1 },
  addButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: Colors.light.primary,
  },
  addPressed: { opacity: 0.82, transform: [{ scale: 0.97 }] },
  sheet: { gap: 16, paddingTop: 14, paddingBottom: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
