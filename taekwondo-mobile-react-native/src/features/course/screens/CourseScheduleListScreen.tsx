import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Plus } from "reicon-react-native";

import { Permission } from "@/features/authorization/domain/permissions";
import { useCan } from "@/features/authorization/hooks/useAccess";
import type { CourseScheduleUpsertRequest } from "@/features/course/api/course.dto";
import { CourseScheduleDetailWindow } from "@/features/course/components/CourseScheduleDetailWindow";
import { CourseScheduleFormSheet } from "@/features/course/components/CourseScheduleFormSheet";
import { ScheduleRow, scheduleWeekdayLabel, sortCourseSchedules } from "@/features/course/components/CourseScheduleSection";
import { mapCourseApiToView } from "@/features/course/domain/course.mappers";
import type { CourseScheduleView } from "@/features/course/domain/course.types";
import { useAddCourseSchedule, useCourseDetail, useDeleteCourseSchedule, useUpdateCourseSchedule } from "@/features/course/queries/courseCatalogQueries";
import { getApiErrorMessage } from "@/infrastructure/http/httpError";
import { useScreenRefresh } from "@/infrastructure/query/useScreenRefresh";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { AdminSearchField } from "@/shared/ui/admin/AdministrationPrimitives";
import { AppIcon } from "@/shared/ui/AppIcon";
import { formatDateYMD } from "@/shared/utils/dateTime";
import { ThemedText } from "@/shared/ui/ThemedText";
import { useToast } from "@/shared/ui/Toast";
import { Colors, Spacing, effects, radii } from "@/theme";

import { groupCourseSchedulesByBranch } from "./CourseScheduleListScreen.logic";

export function CourseScheduleListScreen({ courseId }: { courseId: string }) {
  const toast = useToast();
  const canUpdate = useCan(Permission.COURSE_UPDATE);
  const canReadAssignments = useCan(Permission.COURSE_STAFF_ASSIGNMENT_READ);
  const canCreateAssignments = useCan(Permission.COURSE_STAFF_ASSIGNMENT_CREATE);
  const canUpdateAssignments = useCan(Permission.COURSE_STAFF_ASSIGNMENT_UPDATE);
  const canEndAssignments = useCan(Permission.COURSE_STAFF_ASSIGNMENT_DELETE);
  const canOpenEditor = canUpdate || canReadAssignments || canCreateAssignments || canUpdateAssignments || canEndAssignments;
  const query = useCourseDetail(courseId);
  const update = useUpdateCourseSchedule();
  const addSchedule = useAddCourseSchedule();
  const remove = useDeleteCourseSchedule();
  const { refreshing, onRefresh } = useScreenRefresh([query]);
  const deleteAbortRef = useRef<AbortController | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CourseScheduleView>();
  const [editing, setEditing] = useState<CourseScheduleView>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const course = useMemo(() => query.data ? mapCourseApiToView(query.data) : undefined, [query.data]);

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput.trim().toLocaleLowerCase("vi-VN")), 250);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const schedules = useMemo(() => sortCourseSchedules(course?.schedules ?? []).filter((schedule) => matchesSearch(schedule, search)), [course?.schedules, search]);
  const scheduleGroups = useMemo(() => groupCourseSchedulesByBranch(schedules), [schedules]);

  const updateSchedule = async (target: CourseScheduleView, request: CourseScheduleUpsertRequest, message: string) => {
    try {
      await update.mutateAsync({ courseId, courseScheduleId: target.courseScheduleId, request });
      setEditing(undefined);
      toast.show({ message, variant: "success" });
    } catch (error) {
      toast.show({ message: getApiErrorMessage(error, "Không thể cập nhật lịch học. Vui lòng thử lại."), variant: "error" });
    }
  };
  const createSchedule = async (request: CourseScheduleUpsertRequest) => {
    try {
      await addSchedule.mutateAsync({ courseId, request });
      setIsCreateOpen(false);
      toast.show({ message: "Tạo lịch học thành công", variant: "success" });
    } catch (error) {
      toast.show({ message: getApiErrorMessage(error, "Không thể tạo lịch học. Vui lòng thử lại."), variant: "error" });
    }
  };
  const toggle = (target: CourseScheduleView) => {
    const nextStatus = target.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const today = formatDateYMD(Date.now());
    void updateSchedule(target, {
      classScheduleId: target.classScheduleId,
      startDate: target.startDate,
      endDate: nextStatus === "INACTIVE" ? target.endDate ?? (target.startDate > today ? target.startDate : today) : null,
      status: nextStatus,
    }, nextStatus === "INACTIVE" ? "Đã tạm dừng lịch học" : "Đã kích hoạt lịch học");
  };
  const removeSchedule = async (target: CourseScheduleView) => {
    const controller = new AbortController();
    deleteAbortRef.current = controller;
    try {
      await remove.mutateAsync({ courseId, courseScheduleId: target.courseScheduleId, signal: controller.signal });
      toast.show({ message: "Xóa lịch học thành công", variant: "success" });
      return true;
    } catch (error) {
      if ((error as { name?: string })?.name === "AbortError") return false;
      toast.show({ message: getApiErrorMessage(error, "Không thể xóa lịch học. Vui lòng thử lại."), variant: "error" });
      return false;
    } finally { deleteAbortRef.current = null; }
  };

  return <>
    <StackScreenLayout
      title="Danh sách lịch học"
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
              placeholder="Tìm thứ, giờ, cơ sở, HLV..."
            />
          </View>
          {canUpdate ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Thêm lịch học"
              onPress={() => setIsCreateOpen(true)}
              style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
            >
              <AppIcon icon={<Plus />} size={24} color={Colors.light.surface} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {schedules.length > 0 ? (
        <View style={styles.groups}>
          {scheduleGroups.map((group) => (
            <View key={group.branchName} style={styles.group}>
              <View style={styles.groupHeader}>
                <ThemedText type="subtitle" style={styles.groupTitle}>
                  {group.branchName}
                </ThemedText>
                <View style={styles.countBadge}>
                  <ThemedText type="bodySmall" style={styles.countBadgeText}>
                    {group.countLabel}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.list}>
                {group.schedules.map((schedule, index) => (
                  <View key={schedule.courseScheduleId}>
                    <ScheduleRow
                      schedule={schedule}
                      onPress={() => setSelected(schedule)}
                    />
                    {index < group.schedules.length - 1 ? (
                      <View style={styles.separator} />
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.state}>
          {query.isLoading ? (
            <ActivityIndicator
              accessibilityLabel="Đang tải danh sách lịch"
              color={Colors.light.primary}
            />
          ) : query.isError ? (
            <ThemedText type="bodySmall" style={styles.emptyText}>
              Không thể tải danh sách lịch học.
            </ThemedText>
          ) : (
            <ThemedText type="bodySmall" style={styles.emptyText}>
              {search ? "Không tìm thấy lịch học phù hợp." : "Chưa có lịch học."}
            </ThemedText>
          )}
        </View>
      )}
    </StackScreenLayout>
    <CourseScheduleDetailWindow schedule={selected} onClose={() => setSelected(undefined)} onEdit={canOpenEditor ? setEditing : undefined} onToggleStatus={canUpdate ? toggle : undefined} onDelete={canUpdate ? removeSchedule : undefined} onCancelDelete={() => deleteAbortRef.current?.abort()} deleting={remove.isPending} actionPending={update.isPending} />
    <CourseScheduleFormSheet mode="edit" courseId={courseId} visible={Boolean(editing)} schedule={editing} submitting={update.isPending} onClose={() => setEditing(undefined)} onSubmit={(request) => { if (editing) void updateSchedule(editing, request, "Cập nhật lịch học thành công"); }} />
    <CourseScheduleFormSheet mode="create" visible={isCreateOpen} submitting={addSchedule.isPending} onClose={() => { if (!addSchedule.isPending) setIsCreateOpen(false); }} onSubmit={(request) => void createSchedule(request)} />
  </>;
}

function matchesSearch(schedule: CourseScheduleView, search: string) {
  if (!search) return true;
  const terms = [scheduleWeekdayLabel(schedule), schedule.startTime, schedule.endTime, schedule.branchName, schedule.status === "ACTIVE" ? "đang hoạt động active" : "đã tạm dừng inactive", schedule.startDate, schedule.endDate, ...schedule.staffAssignments.map((item) => item.fullName)];
  return terms.filter(Boolean).join(" ").toLocaleLowerCase("vi-VN").includes(search);
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.two, paddingBottom: Spacing.four },
  header: { paddingBottom: Spacing.two },
  searchRow: { flexDirection: "row", alignItems: "center", gap: Spacing.three },
  searchField: { flex: 1, minWidth: 0 },
  addButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: radii.md, backgroundColor: Colors.light.primary, borderCurve: "continuous" },
  pressed: effects.pressed,
  groups: { gap: Spacing.four },
  group: { gap: Spacing.two },
  groupHeader: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: Spacing.two },
  groupTitle: { flex: 1, minWidth: 0, color: Colors.light.text },
  countBadge: { borderRadius: radii.pill, paddingHorizontal: Spacing.two, paddingVertical: 6, backgroundColor: Colors.light.primarySoft },
  countBadgeText: { color: Colors.light.primary, fontWeight: "700" },
  list: { overflow: "hidden" },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.light.divider },
  state: { paddingVertical: 48, alignItems: "center" },
  emptyText: { color: Colors.light.textSecondary, textAlign: "center" },
});
