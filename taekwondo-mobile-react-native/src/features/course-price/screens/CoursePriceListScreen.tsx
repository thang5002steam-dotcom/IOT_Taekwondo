import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Plus } from "reicon-react-native";

import { Permission } from "@/features/authorization/domain/permissions";
import { useCan } from "@/features/authorization/hooks/useAccess";
import { useCourseDetail } from "@/features/course/queries/courseCatalogQueries";
import { getApiErrorMessage } from "@/infrastructure/http/httpError";
import { useScreenRefresh } from "@/infrastructure/query/useScreenRefresh";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { AdminSearchField } from "@/shared/ui/admin/AdministrationPrimitives";
import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { useToast } from "@/shared/ui/Toast";
import { Colors, effects, radii, Spacing } from "@/theme";

import type { CoursePriceCreateRequest } from "../api/course-price.dto";
import { CoursePriceCard } from "../components/CoursePriceCard";
import { CoursePriceDetailWindow } from "../components/CoursePriceDetailWindow";
import { CoursePriceFormSheet } from "../components/CoursePriceFormSheet";
import { mapCoursePriceToView } from "../domain/course-price.mappers";
import type { CoursePriceItemView } from "../domain/course-price.types";
import {
  useCoursePrices,
  useCreateCoursePrice,
  useDeleteCoursePrice,
  useUpdateCoursePrice,
} from "../queries/coursePriceQueries";

export function CoursePriceListScreen({ courseId }: { courseId: string }) {
  const toast = useToast();
  const canCreate = useCan(Permission.COURSE_PRICE_CREATE);
  const canUpdate = useCan(Permission.COURSE_PRICE_UPDATE);
  const canDelete = useCan(Permission.COURSE_PRICE_DELETE);

  const courseQuery = useCourseDetail(courseId);
  const pricesQuery = useCoursePrices(courseId);
  const createMutation = useCreateCoursePrice();
  const updateMutation = useUpdateCoursePrice();
  const deleteMutation = useDeleteCoursePrice();

  const { refreshing, onRefresh } = useScreenRefresh([pricesQuery, courseQuery]);
  const deleteAbortRef = useRef<AbortController | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CoursePriceItemView | null>(null);
  const [editing, setEditing] = useState<CoursePriceItemView | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(
      () => setSearch(searchInput.trim().toLocaleLowerCase("vi-VN")),
      250,
    );
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const priceViews = useMemo(() => {
    const rawPrices = pricesQuery.data?.content ?? [];
    return rawPrices
      .map(mapCoursePriceToView)
      .sort((a, b) => a.durationMonths - b.durationMonths || a.finalPrice - b.finalPrice);
  }, [pricesQuery.data?.content]);

  const filteredPrices = useMemo(() => {
    if (!search) return priceViews;
    return priceViews.filter((item) => matchesSearch(item, search));
  }, [priceViews, search]);

  const handleCreate = async (request: CoursePriceCreateRequest) => {
    try {
      await createMutation.mutateAsync(request);
      setIsCreateOpen(false);
      toast.show({ message: "Tạo gói học thành công", variant: "success" });
    } catch (error) {
      toast.show({
        message: getApiErrorMessage(error, "Không thể tạo gói học. Vui lòng thử lại."),
        variant: "error",
      });
    }
  };

  const handleUpdate = async (
    target: CoursePriceItemView,
    request: CoursePriceCreateRequest,
  ) => {
    try {
      await updateMutation.mutateAsync({
        coursePriceId: target.id,
        request,
      });
      setEditing(null);
      toast.show({ message: "Cập nhật gói học thành công", variant: "success" });
    } catch (error) {
      toast.show({
        message: getApiErrorMessage(error, "Không thể cập nhật gói học. Vui lòng thử lại."),
        variant: "error",
      });
    }
  };

  const handleToggleStatus = async (target: CoursePriceItemView) => {
    const nextStatus = target.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateMutation.mutateAsync({
        coursePriceId: target.id,
        request: {
          courseId,
          durationMonths: target.durationMonths,
          sessionCount: target.sessionCount,
          basePrice: target.basePrice ?? target.finalPrice,
          finalPrice: target.finalPrice,
          status: nextStatus,
        },
      });
      setSelected((prev) =>
        prev?.id === target.id
          ? {
              ...prev,
              status: nextStatus,
              statusLabel: nextStatus === "ACTIVE" ? "Đang áp dụng" : "Ngừng áp dụng",
            }
          : prev,
      );
      toast.show({
        message:
          nextStatus === "ACTIVE" ? "Đã kích hoạt gói học" : "Đã tạm dừng gói học",
        variant: "success",
      });
    } catch (error) {
      toast.show({
        message: getApiErrorMessage(
          error,
          "Không thể thay đổi trạng thái gói học. Vui lòng thử lại.",
        ),
        variant: "error",
      });
    }
  };

  const handleDelete = async (target: CoursePriceItemView) => {
    const controller = new AbortController();
    deleteAbortRef.current = controller;
    try {
      await deleteMutation.mutateAsync({
        coursePriceId: target.id,
        signal: controller.signal,
      });
      toast.show({ message: "Xóa gói học thành công", variant: "success" });
      return true;
    } catch (error) {
      if ((error as { name?: string })?.name === "AbortError") return false;
      toast.show({
        message: getApiErrorMessage(error, "Không thể xóa gói học. Vui lòng thử lại."),
        variant: "error",
      });
      return false;
    } finally {
      deleteAbortRef.current = null;
    }
  };

  return (
    <>
      <StackScreenLayout
        title="Danh sách gói học"
        contentContainerStyle={styles.content}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <View style={styles.header}>
          <View style={styles.searchRow}>
            <View style={styles.searchField}>
              <AdminSearchField
                value={searchInput}
                onChangeText={setSearchInput}
                placeholder="Tìm số tháng, số buổi, giá..."
              />
            </View>
            {canCreate ? (
              <Pressable
                testID="add-price-button"
                accessibilityRole="button"
                accessibilityLabel="Thêm gói học"
                onPress={() => setIsCreateOpen(true)}
                style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
              >
                <AppIcon icon={<Plus />} size={24} color={Colors.light.surface} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {filteredPrices.length > 0 ? (
          <View style={styles.list}>
            {filteredPrices.map((item) => (
              <CoursePriceCard
                key={item.id}
                item={item}
                onPress={() => setSelected(item)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.state}>
            {pricesQuery.isLoading ? (
              <ActivityIndicator
                accessibilityLabel="Đang tải danh sách gói học"
                color={Colors.light.primary}
              />
            ) : pricesQuery.isError ? (
              <ThemedText type="bodySmall" style={styles.emptyText}>
                Không thể tải danh sách gói học.
              </ThemedText>
            ) : (
              <ThemedText type="bodySmall" style={styles.emptyText}>
                {search ? "Không tìm thấy gói học phù hợp." : "Chưa có gói học nào cho khóa học này."}
              </ThemedText>
            )}
          </View>
        )}
      </StackScreenLayout>

      <CoursePriceDetailWindow
        coursePrice={selected}
        onClose={() => setSelected(null)}
        onEdit={canUpdate ? (item) => setEditing(item) : undefined}
        onToggleStatus={canUpdate ? handleToggleStatus : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        onCancelDelete={() => deleteAbortRef.current?.abort()}
        deleting={deleteMutation.isPending}
        actionPending={updateMutation.isPending}
      />

      <CoursePriceFormSheet
        visible={Boolean(editing)}
        mode="edit"
        courseId={courseId}
        coursePrice={editing}
        submitting={updateMutation.isPending}
        onClose={() => setEditing(null)}
        onSubmit={(request) => {
          if (editing) void handleUpdate(editing, request);
        }}
      />

      <CoursePriceFormSheet
        visible={isCreateOpen}
        mode="create"
        courseId={courseId}
        submitting={createMutation.isPending}
        onClose={() => {
          if (!createMutation.isPending) setIsCreateOpen(false);
        }}
        onSubmit={(request) => void handleCreate(request)}
      />
    </>
  );
}

function matchesSearch(item: CoursePriceItemView, search: string) {
  if (!search) return true;
  const terms = [
    item.durationLabel,
    item.sessionsLabel,
    String(item.durationMonths),
    String(item.sessionCount),
    String(item.finalPrice),
    item.basePrice ? String(item.basePrice) : "",
    item.statusLabel,
    item.status === "ACTIVE" ? "hoạt động active áp dụng" : "ngừng tạm dừng inactive",
  ];
  return terms.filter(Boolean).join(" ").toLocaleLowerCase("vi-VN").includes(search);
}

const styles = StyleSheet.create({
  content: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  header: {
    paddingBottom: Spacing.two,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  searchField: {
    flex: 1,
    minWidth: 0,
  },
  addButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: Colors.light.primary,
    borderCurve: "continuous",
  },
  pressed: effects.pressed,
  list: {
    gap: Spacing.two,
  },
  state: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyText: {
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
});
