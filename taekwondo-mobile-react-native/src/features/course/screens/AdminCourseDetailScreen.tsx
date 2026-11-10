import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import type { CourseResponse } from "@/features/course/api/course.dto";
import type { CourseStatus } from "@/features/course/constants/course.constants";
import { mapCourseApiToView } from "@/features/course/domain/course.mappers";
import type { CourseScheduleView, CourseView } from "@/features/course/domain/course.types";
import { CourseActionButtons } from "@/features/course/components/CourseActionButtons";
import { CourseEditSheet } from "@/features/course/components/CourseEditSheet";
import { CourseScheduleFormSheet } from "@/features/course/components/CourseScheduleFormSheet";
import { Permission } from "@/features/authorization/domain/permissions";
import { useCan } from "@/features/authorization/hooks/useAccess";
import type { CourseRouteProps } from "@/features/student-commerce/types";
import { asHref } from "@/features/student-commerce/utils/studentCommerceUtils";
import { useScreenRefresh } from "@/infrastructure/query/useScreenRefresh";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { resolveDetailTitle } from "@/routes/navigation/utils/screenTitle";
import { CancellableLoadingOverlay } from "@/shared/ui/CancellableLoadingOverlay";
import { ConfirmationDialog } from "@/shared/ui/ConfirmationDialog";
import { useToast } from "@/shared/ui/Toast";
import { Colors } from "@/theme";
import { getApiErrorMessage } from "@/infrastructure/http/httpError";
import { formatDateYMD } from "@/shared/utils/dateTime";

import { CourseDetailContent } from "./CourseDetailContent";
import {
  useCourseCacheActions,
  useCourseDetail,
  useDeleteCourseSchedule,
  useDeleteCourse,
  useUpdateCourseSchedule,
} from "../queries/courseCatalogQueries";

export function AdminCourseDetailScreen({ courseId }: CourseRouteProps) {
  const router = useRouter();
  const toast = useToast();
  const [isEditSheetVisible, setIsEditSheetVisible] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<CourseScheduleView>();
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteAbortControllerRef = useRef<AbortController | null>(null);
  const scheduleDeleteAbortControllerRef = useRef<AbortController | null>(null);

  const courseQuery = useCourseDetail(courseId);
  const { registerCourse } = useCourseCacheActions();
  const deleteCourse = useDeleteCourse();
  const updateSchedule = useUpdateCourseSchedule();
  const deleteSchedule = useDeleteCourseSchedule();
  const canUpdateCourse = useCan(Permission.COURSE_UPDATE);
  const canReadAssignments = useCan(Permission.COURSE_STAFF_ASSIGNMENT_READ);
  const canCreateAssignments = useCan(Permission.COURSE_STAFF_ASSIGNMENT_CREATE);
  const canUpdateAssignments = useCan(Permission.COURSE_STAFF_ASSIGNMENT_UPDATE);
  const canEndAssignments = useCan(Permission.COURSE_STAFF_ASSIGNMENT_DELETE);
  const canOpenScheduleEditor = canUpdateCourse || canReadAssignments || canCreateAssignments || canUpdateAssignments || canEndAssignments;

  const { data: apiCourse, isLoading } = courseQuery;
  const { refreshing, onRefresh } = useScreenRefresh([courseQuery]);

  const course: CourseView | undefined = useMemo(() => {
    if (apiCourse) {
      return mapCourseApiToView(apiCourse);
    }
    return undefined;
  }, [apiCourse]);

  const editInitialData = useMemo(() => {
    let defaultStatus: CourseStatus = "OPEN";
    if (apiCourse?.status) {
      defaultStatus = apiCourse.status;
    } else if (course?.catalogStatus === "active") {
      defaultStatus = "ACTIVE";
    }

    return {
      name: apiCourse?.name ?? course?.courseName ?? "",
      level: apiCourse?.level ?? "BASIC",
      capacity: apiCourse?.capacity ?? course?.capacity ?? 20,
      status: defaultStatus,
    };
  }, [apiCourse, course]);

  const handleEditSuccess = (updatedCourse: CourseResponse) => {
    const activeId = course?.courseId ?? courseId;
    if (activeId) {
      void registerCourse(updatedCourse);
    }
  };

  const handleCancelDelete = useCallback(() => {
    if (deleteAbortControllerRef.current) {
      deleteAbortControllerRef.current.abort();
      deleteAbortControllerRef.current = null;
    }
    setIsDeleting(false);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    const targetCourseId = course?.courseId ?? courseId;
    if (!targetCourseId) return;

    setIsDeleteDialogOpen(false);
    setIsDeleting(true);

    const abortController = new AbortController();
    deleteAbortControllerRef.current = abortController;

    try {
      await deleteCourse.mutateAsync({
        courseId: targetCourseId,
        signal: abortController.signal,
      });

      toast.show({
        message: "Xóa khóa học thành công",
        variant: "success",
      });

      router.back();
    } catch (error) {
      if ((error as { name?: string })?.name === "AbortError") {
        return;
      }
      const message =
        error instanceof Error ? error.message : "Đã có lỗi xảy ra khi xóa khóa học";
      toast.show({
        message,
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
      deleteAbortControllerRef.current = null;
    }
  }, [course?.courseId, courseId, deleteCourse, router, toast]);

  const handleScheduleUpdate = useCallback(async (
    target: CourseScheduleView,
    request: { classScheduleId: string; startDate: string; endDate: string | null; status: "ACTIVE" | "INACTIVE" },
    successMessage: string,
  ) => {
    const targetCourseId = course?.courseId ?? courseId;
    if (!targetCourseId) return;
    try {
      await updateSchedule.mutateAsync({
        courseId: targetCourseId,
        courseScheduleId: target.courseScheduleId,
        request,
      });
      setScheduleToEdit(undefined);
      toast.show({ message: successMessage, variant: "success" });
    } catch (error) {
      toast.show({ message: getApiErrorMessage(error, "Không thể cập nhật lịch học. Vui lòng thử lại."), variant: "error" });
    }
  }, [course?.courseId, courseId, toast, updateSchedule]);

  const handleToggleScheduleStatus = useCallback((target: CourseScheduleView) => {
    const nextStatus = target.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const today = formatDateYMD(Date.now());
    void handleScheduleUpdate(
      target,
      {
        classScheduleId: target.classScheduleId,
        startDate: target.startDate,
        endDate: nextStatus === "INACTIVE"
          ? target.endDate ?? (target.startDate > today ? target.startDate : today)
          : null,
        status: nextStatus,
      },
      target.status === "ACTIVE" ? "Đã tạm dừng lịch học" : "Đã kích hoạt lịch học",
    );
  }, [handleScheduleUpdate]);

  const handleCancelScheduleDelete = useCallback(() => {
    scheduleDeleteAbortControllerRef.current?.abort();
    scheduleDeleteAbortControllerRef.current = null;
  }, []);

  const handleScheduleDelete = useCallback(async (target: CourseScheduleView) => {
    const targetCourseId = course?.courseId ?? courseId;
    if (!targetCourseId) return false;

    const abortController = new AbortController();
    scheduleDeleteAbortControllerRef.current = abortController;
    try {
      await deleteSchedule.mutateAsync({
        courseId: targetCourseId,
        courseScheduleId: target.courseScheduleId,
        signal: abortController.signal,
      });
      toast.show({ message: "Xóa lịch học thành công", variant: "success" });
      return true;
    } catch (error) {
      if ((error as { name?: string })?.name === "AbortError") return false;
      toast.show({ message: getApiErrorMessage(error, "Không thể xóa lịch học. Vui lòng thử lại."), variant: "error" });
      return false;
    } finally {
      scheduleDeleteAbortControllerRef.current = null;
    }
  }, [course?.courseId, courseId, deleteSchedule, toast]);

  return (
    <>
      <StackScreenLayout
        title={resolveDetailTitle(course, { fallback: "Khóa học" })}
        contentContainerStyle={styles.content}
        refreshing={refreshing}
        onRefresh={onRefresh}
        floatingContent={
          <CourseActionButtons
            editTitle="Chỉnh sửa"
            editAccessibilityLabel="Chỉnh sửa khóa học"
            onEditPress={() => setIsEditSheetVisible(true)}
            packageTitle="Gói học"
            packageAccessibilityLabel="Xem danh sách gói học"
            packageDisabled={!course}
            onPackagePress={() => {
              const targetId = course?.courseId ?? courseId;
              if (targetId) {
                router.push(asHref(`/courses/${targetId}/packages`));
              }
            }}
            onDeletePress={() => setIsDeleteDialogOpen(true)}
            deleteDisabled={isDeleting}
          />
        }
      >
        {course ? (
          <CourseDetailContent
            course={course}
            topContent={
              isLoading && !apiCourse ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={Colors.light.primary} />
                </View>
              ) : undefined
            }
            onOpenCoaches={() =>
              router.push(asHref(`/courses/${course.courseId}/members/coaches`))
            }
            onOpenAssistants={() =>
              router.push(asHref(`/courses/${course.courseId}/members/teaching-assistants`))
            }
            onOpenStudents={() =>
              router.push(asHref(`/courses/${course.courseId}/members/students`))
            }
            onOpenPackage={(packageId) =>
              router.push(asHref(`/courses/${course.courseId}/packages/${packageId}`))
            }
            onOpenSchedules={() =>
              router.push(asHref(`/courses/${course.courseId}/schedules`))
            }
            onEditSchedule={canOpenScheduleEditor ? setScheduleToEdit : undefined}
            onToggleScheduleStatus={canUpdateCourse ? handleToggleScheduleStatus : undefined}
            onDeleteSchedule={canUpdateCourse ? handleScheduleDelete : undefined}
            onCancelScheduleDelete={canUpdateCourse ? handleCancelScheduleDelete : undefined}
            scheduleDeletePending={deleteSchedule.isPending}
            scheduleActionPending={updateSchedule.isPending}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        )}
      </StackScreenLayout>

      <CourseEditSheet
        visible={isEditSheetVisible}
        courseId={course?.courseId ?? courseId ?? ""}
        initialData={editInitialData}
        onClose={() => setIsEditSheetVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <CourseScheduleFormSheet
        visible={Boolean(scheduleToEdit)}
        mode="edit"
        courseId={course?.courseId ?? courseId}
        schedule={scheduleToEdit}
        submitting={updateSchedule.isPending}
        onClose={() => setScheduleToEdit(undefined)}
        onSubmit={(request) => {
          if (!scheduleToEdit) return;
          void handleScheduleUpdate(scheduleToEdit, request, "Cập nhật lịch học thành công");
        }}
      />

      <ConfirmationDialog
        visible={isDeleteDialogOpen}
        title="Xóa khóa học"
        description={`Bạn có chắc chắn muốn xóa khóa học "${course?.courseName ?? 'này'}" không? Thao tác này không thể hoàn tác.`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        confirmVariant="danger"
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <CancellableLoadingOverlay
        visible={isDeleting}
        message="Đang xóa khóa học..."
        cancelLabel="Hủy"
        onCancel={handleCancelDelete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 140,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
});
