import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { Permission } from "@/features/authorization/domain/permissions";
import { useCan } from "@/features/authorization/hooks/useAccess";
import type { CourseScheduleUpsertRequest } from "@/features/course/api/course.dto";
import type { CourseScheduleView } from "@/features/course/domain/course.types";
import { useCourseCreateOptions } from "@/features/course/queries/courseCatalogQueries";
import { WeekdayLabel } from "@/features/class-schedule/constants/class-schedule.constants";
import { CourseScheduleStaffAssignmentsSection } from "@/features/course/components/CourseScheduleStaffAssignmentsSection";
import {
  AdminChip,
  AdminEmptyState,
  AdminField,
  AdminLoadingState,
  AdminPickerField,
} from "@/shared/ui/admin/AdministrationPrimitives";
import { BottomSheetWindow } from "@/shared/ui/BottomSheetWindow";
import {
  FloatingActionBar,
  type FloatingActionItem,
} from "@/shared/ui/FloatingActionBar";
import { PickerPopover } from "@/shared/ui/PickerPopover";
import { ThemedText } from "@/shared/ui/ThemedText";
import { formatDateYMD } from "@/shared/utils/dateTime";
import { Colors } from "@/theme";

export type CourseScheduleFormSheetProps = {
  visible: boolean;
  mode: "create" | "edit";
  courseId?: string;
  schedule?: CourseScheduleView;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (request: CourseScheduleUpsertRequest) => void;
};

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function defaultInactiveEndDate(startDate: string) {
  const today = formatDateYMD(Date.now());
  return startDate && startDate > today ? startDate : today;
}

export function CourseScheduleFormSheet({
  visible,
  mode,
  courseId,
  schedule,
  submitting = false,
  onClose,
  onSubmit,
}: CourseScheduleFormSheetProps) {
  const [classScheduleId, setClassScheduleId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<CourseScheduleUpsertRequest["status"]>("ACTIVE");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [section, setSection] = useState<"schedule" | "staff">("schedule");
  const [staffFooterActions, setStaffFooterActions] = useState<
    FloatingActionItem[]
  >([]);
  const optionsQuery = useCourseCreateOptions(visible);
  const canUpdateSchedule = useCan(Permission.COURSE_UPDATE);
  const canReadAssignments = useCan(Permission.COURSE_STAFF_ASSIGNMENT_READ);
  const canCreateAssignment = useCan(Permission.COURSE_STAFF_ASSIGNMENT_CREATE);
  const canUpdateAssignment = useCan(Permission.COURSE_STAFF_ASSIGNMENT_UPDATE);
  const canEndAssignment = useCan(Permission.COURSE_STAFF_ASSIGNMENT_DELETE);

  useEffect(() => {
    if (!visible) return;
    if (mode === "edit" && schedule) {
      // The sheet is a controlled editor: reset its draft when a new schedule/open state arrives.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setClassScheduleId(schedule.classScheduleId);
      setStartDate(schedule.startDate);
      setEndDate(schedule.endDate ?? "");
      setStatus(schedule.status);
    } else {
      setClassScheduleId("");
      setStartDate(formatDateYMD(Date.now()));
      setEndDate("");
      setStatus("ACTIVE");
    }
    setAttempted(false);
    setPickerVisible(false);
    setSection(mode === "edit" && !canUpdateSchedule && canReadAssignments ? "staff" : "schedule");
  }, [canReadAssignments, canUpdateSchedule, mode, schedule, visible]);

  const schedules = optionsQuery.data?.content ?? [];
  const selected = schedules.find((item) => item.scheduleId === classScheduleId);
  const errors = useMemo(() => ({
    classScheduleId: classScheduleId ? undefined : "Vui lòng chọn lịch lớp.",
    startDate: isValidDate(startDate) ? undefined : "Ngày bắt đầu phải đúng định dạng YYYY-MM-DD.",
    endDate: endDate && !isValidDate(endDate)
      ? "Ngày kết thúc phải đúng định dạng YYYY-MM-DD."
      : endDate && isValidDate(startDate) && endDate < startDate
        ? "Ngày kết thúc không được trước ngày bắt đầu."
        : undefined,
  }), [classScheduleId, endDate, startDate]);
  const valid = !errors.classScheduleId && !errors.startDate && !errors.endDate;
  const isEdit = mode === "edit";
  const canManageAssignments = canReadAssignments || canCreateAssignment || canUpdateAssignment || canEndAssignment;
  const canShowStaffSection = isEdit && Boolean(courseId && schedule) && canManageAssignments;
  const canSubmitSchedule = mode === "create" || canUpdateSchedule;
  const title = isEdit ? "Chỉnh sửa lịch" : "Tạo lịch học";
  const submitLabel = isEdit ? "Lưu" : "Tạo lịch";
  const scheduleLabel = selected
    ? `${selected.branch.name} · ${WeekdayLabel[selected.weekday]} · ${selected.startTime.slice(0, 5)} – ${selected.endTime.slice(0, 5)}`
    : undefined;
  const handleStaffFooterActionsChange = useCallback(
    (actions: FloatingActionItem[]) => {
      setStaffFooterActions(actions);
    },
    [],
  );
  const footerActions: FloatingActionItem[] =
    section === "staff"
      ? staffFooterActions
      : canSubmitSchedule
        ? [
            {
              key: "cancel",
              label: "Hủy",
              variant: "outline",
              disabled: submitting,
              onPress: onClose,
            },
            {
              key: "submit",
              label: submitLabel,
              variant: "primary",
              loading: submitting,
              onPress: () => {
                setAttempted(true);
                if (!valid) return;
                onSubmit({
                  classScheduleId,
                  startDate,
                  endDate: status === "INACTIVE" ? (endDate || defaultInactiveEndDate(startDate)) : endDate || null,
                  status,
                });
              },
            },
          ]
        : [];

  return (
    <BottomSheetWindow
      visible={visible}
      title={title}
      heightRatio={0.9}
      accessibilityLabel={`Biểu mẫu ${isEdit ? "chỉnh sửa" : "tạo"} lịch học`}
      onClose={onClose}
      overlay={
        <PickerPopover
          visible={pickerVisible}
          useModal={false}
          title="Chọn lịch lớp"
          subtitle="Lịch học khả dụng"
          selectedValue={classScheduleId}
          onSelect={setClassScheduleId}
          onClose={() => setPickerVisible(false)}
          options={schedules.filter((item) => item.status === "ACTIVE").map((item) => ({
            value: item.scheduleId,
            label: `${item.branch.name} · ${WeekdayLabel[item.weekday]}`,
            subtitle: `${item.startTime.slice(0, 5)} – ${item.endTime.slice(0, 5)}`,
          }))}
        />
      }
      footer={footerActions.length ? (
        <FloatingActionBar
          placement="sheet"
          actions={footerActions}
        />
      ) : undefined}
    >
      <View style={styles.form}>
        {isEdit && (canUpdateSchedule || canShowStaffSection) ? (
          <View style={styles.sectionTabs}>
            {canUpdateSchedule ? <AdminChip label="Thông tin lịch" selected={section === "schedule"} onPress={() => setSection("schedule")} /> : null}
            {canShowStaffSection ? <AdminChip label="Nhân sự phụ trách" selected={section === "staff"} onPress={() => setSection("staff")} /> : null}
          </View>
        ) : null}
        {section === "staff" && canShowStaffSection && courseId && schedule ? (
          <CourseScheduleStaffAssignmentsSection
            key={`${courseId}-${schedule.courseScheduleId}-${visible}`}
            visible={visible}
            courseId={courseId}
            courseScheduleId={schedule.courseScheduleId}
            scheduleStartDate={schedule.startDate}
            canRead={canReadAssignments}
            canCreate={canCreateAssignment}
            canUpdate={canUpdateAssignment}
            canEnd={canEndAssignment}
            onFooterActionsChange={handleStaffFooterActionsChange}
          />
        ) : <>
        <View style={styles.fieldGroup}>
          <AdminPickerField label="Lịch lớp *" valueLabel={scheduleLabel} placeholder="Chọn lịch lớp" onPress={() => { if (canSubmitSchedule && !submitting) setPickerVisible(true); }} />
          {attempted && errors.classScheduleId ? <FieldError message={errors.classScheduleId} /> : null}
          {optionsQuery.isLoading ? <AdminLoadingState /> : null}
          {optionsQuery.error ? <AdminEmptyState message="Không thể tải danh sách lịch lớp." /> : null}
        </View>
        <View style={styles.fieldGroup}>
          <AdminField label="Ngày bắt đầu *" value={startDate} placeholder="YYYY-MM-DD" editable={canSubmitSchedule && !submitting} keyboardType="numbers-and-punctuation" onChangeText={setStartDate} />
          {attempted && errors.startDate ? <FieldError message={errors.startDate} /> : null}
        </View>
        <View style={styles.fieldGroup}>
          <AdminField label="Ngày kết thúc" value={endDate} placeholder="YYYY-MM-DD (không bắt buộc)" editable={canSubmitSchedule && !submitting} keyboardType="numbers-and-punctuation" onChangeText={setEndDate} />
          {attempted && errors.endDate ? <FieldError message={errors.endDate} /> : null}
        </View>
        <View style={styles.fieldGroup}>
          <ThemedText type="featureLabel">Trạng thái lịch *</ThemedText>
          <View style={styles.chips}>
            <AdminChip label="Hoạt động" tone="success" selected={status === "ACTIVE"} onPress={!canSubmitSchedule || submitting ? undefined : () => {
              if (status === "INACTIVE") setEndDate("");
              setStatus("ACTIVE");
            }} />
            <AdminChip label="Ngừng hoạt động" selected={status === "INACTIVE"} onPress={!canSubmitSchedule || submitting ? undefined : () => {
              if (!endDate) setEndDate(defaultInactiveEndDate(startDate));
              setStatus("INACTIVE");
            }} />
          </View>
        </View>
        </>}
      </View>
    </BottomSheetWindow>
  );
}

function FieldError({ message }: { message: string }) {
  return <ThemedText accessibilityRole="alert" type="bodySmall" style={styles.error}>{message}</ThemedText>;
}

const styles = StyleSheet.create({
  form: { flexGrow: 1, paddingTop: 16, paddingBottom: 24, gap: 18 },
  sectionTabs: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  fieldGroup: { gap: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  error: { color: Colors.light.error },
});
