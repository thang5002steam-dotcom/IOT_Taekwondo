import { getApiErrorMessage } from "@/infrastructure/http/httpError";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { AppIcon } from "@/shared/ui/AppIcon";
import { CancellableLoadingOverlay } from "@/shared/ui/CancellableLoadingOverlay";
import { ConfirmationDialog } from "@/shared/ui/ConfirmationDialog";
import { FloatingActionBar } from "@/shared/ui/FloatingActionBar";
import { NavigationMenu, NavigationMenuItem } from "@/shared/ui/NavigationMenu";
import { ThemedText } from "@/shared/ui/ThemedText";
import { useToast } from "@/shared/ui/Toast";
import {
  AdminCard,
  AdminSectionHeader,
} from "@/shared/ui/admin/AdministrationPrimitives";
import { Colors, Spacing } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Trash6 } from "reicon-react-native";
import { TrainingPlanFormSheet } from "../components/TrainingPlanFormSheet";
import {
  useDeleteTrainingPlan,
  useTrainingPlan,
  useUpdateTrainingPlan,
} from "../queries/trainingPlanQueries";
import { PlanCard, levelLabel } from "./TrainingPlanManagementScreen";

export function TrainingPlanDetailScreen() {
  const { trainingPlanId } = useLocalSearchParams<{ trainingPlanId: string }>();
  const router = useRouter();
  const toast = useToast();
  const query = useTrainingPlan(trainingPlanId);
  const update = useUpdateTrainingPlan();
  const remove = useDeleteTrainingPlan();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deleteController = useRef<AbortController | null>(null);
  const plan = query.data;
  if (query.isPending)
    return (
      <StackScreenLayout title="Chi tiết gói học">
        <ActivityIndicator color={Colors.light.primary} />
      </StackScreenLayout>
    );
  if (!plan)
    return (
      <StackScreenLayout title="Chi tiết gói học">
        <ThemedText type="bodySmall">Không tìm thấy gói học.</ThemedText>
      </StackScreenLayout>
    );
  const handleDelete = async () => {
    setConfirmDelete(false);
    setDeleting(true);
    const controller = new AbortController();
    deleteController.current = controller;
    try {
      await remove.mutateAsync({
        id: plan.trainingPlanId,
        signal: controller.signal,
      });
      toast.show({ message: "Đã xóa gói học.", variant: "success" });
      router.replace("/admin/training-plans" as never);
    } catch (error) {
      if ((error as { name?: string }).name !== "AbortError") {
        toast.show({
          message: getApiErrorMessage(error, "Không thể xóa gói học."),
          variant: "error",
        });
      }
    } finally {
      deleteController.current = null;
      setDeleting(false);
    }
  };
  return (
    <>
      <StackScreenLayout
        title="Chi tiết gói học"
        contentContainerStyle={styles.content}
        onRefresh={async () => {
          await query.refetch();
        }}
        refreshing={query.isRefetching}
        floatingContent={
          <FloatingActionBar
            actions={[
              {
                label: "Chỉnh sửa",
                accessibilityLabel: "Chỉnh sửa gói học",
                variant: "outline",
                onPress: () => setEditing(true),
              },
              {
                label: "Đăng ký",
                accessibilityLabel: "Đăng ký gói học",
                variant: "primary",
                onPress: () =>
                  toast.show({
                    message: "Mở luồng đăng ký học viên từ hồ sơ học viên.",
                    variant: "info",
                  }),
              },
              {
                key: "delete",
                label: "",
                accessibilityLabel: "Xóa gói học",
                variant: "outline",
                onPress: () => setConfirmDelete(true),
                disabled: deleting,
                icon: (
                  <AppIcon
                    icon={<Trash6 />}
                    size={30}
                    color={
                      deleting ? Colors.light.textSecondary : Colors.light.error
                    }
                  />
                ),
                style: {
                  flex: 0,
                  minWidth: 48,
                  paddingHorizontal: 6,
                  borderWidth: 0,
                  backgroundColor: "transparent",
                },
              },
            ]}
          />
        }
      >
        <PlanCard plan={plan} />
        <AdminCard>
          <AdminSectionHeader title="Thông tin cơ bản" />
          {[
            ["Tên gói học", plan.name],
            ["Cấp độ", levelLabel(plan.level)],
            ["Thời lượng", `${plan.durationMonths} tháng`],
            ["Số buổi gồm trong gói", `${plan.includedSessionCount} buổi`],
            [
              "Giá gốc",
              new Intl.NumberFormat("vi-VN").format(plan.basePrice) + "đ",
            ],
            [
              "Giá bán",
              new Intl.NumberFormat("vi-VN").format(plan.finalPrice) + "đ",
            ],
          ].map(([key, value]) => (
            <View key={key} style={styles.info}>
              <ThemedText type="bodySmall" style={styles.muted}>
                {key}
              </ThemedText>
              <ThemedText type="bodySmall">{value}</ThemedText>
            </View>
          ))}
        </AdminCard>
        <NavigationMenu>
          <NavigationMenuItem
            title="Yêu cầu & Bổ sung"
            count={plan.requirements.length + plan.addons.length}
            onPress={() =>
              router.push(
                `/admin/training-plans/${plan.trainingPlanId}/requirements-addons` as never,
              )
            }
          />
          <NavigationMenuItem
            title="Khóa học áp dụng"
            count={plan.accessRules.length}
            onPress={() =>
              router.push(
                `/admin/training-plans/${plan.trainingPlanId}/courses` as never,
              )
            }
          />
        </NavigationMenu>
      </StackScreenLayout>
      <TrainingPlanFormSheet
        visible={editing}
        plan={plan}
        submitting={update.isPending}
        onClose={() => setEditing(false)}
        onSubmit={async (request) => {
          try {
            await update.mutateAsync({ id: plan.trainingPlanId, request });
            setEditing(false);
            toast.show({ message: "Đã lưu thay đổi.", variant: "success" });
          } catch (error) {
            toast.show({
              message: getApiErrorMessage(error, "Không thể lưu gói học."),
              variant: "error",
            });
          }
        }}
      />
      <ConfirmationDialog
        visible={confirmDelete}
        title="Xóa gói học"
        description={`Bạn có chắc muốn xóa gói học "${plan.name}" không? Thao tác này không thể hoàn tác.`}
        confirmLabel="Xóa"
        confirmVariant="danger"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
      <CancellableLoadingOverlay
        visible={deleting}
        message="Đang xóa gói học..."
        cancelLabel="Hủy"
        onCancel={() => deleteController.current?.abort()}
      />
    </>
  );
}
const styles = StyleSheet.create({
  content: { paddingTop: Spacing.two, paddingBottom: 110, gap: Spacing.two },
  info: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.divider,
    gap: 16,
  },
  muted: { color: Colors.light.textSecondary },
});
