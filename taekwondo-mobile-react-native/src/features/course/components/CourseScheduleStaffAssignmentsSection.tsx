import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Plus, Trash6 } from "reicon-react-native";

import type {
  CourseStaffAssignmentCreateRequest,
  CourseStaffAssignmentSimpleResponse,
} from "@/features/course-staff-assignment/api/course-staff-assignment.dto";
import {
  useCourseScheduleStaffAssignments,
  useCourseStaffAssignmentDetail,
  useCreateCourseScheduleStaffAssignment,
  useDeleteCourseScheduleStaffAssignment,
  useStaffAssignmentCandidates,
  useUpdateCourseScheduleStaffAssignment,
} from "@/features/course-staff-assignment";
import {
  AssignmentTypeLabel,
  CourseStaffAssignmentStatusLabel,
  type AssignmentType,
  type CourseStaffAssignmentStatus,
} from "@/features/course-staff-assignment/constants/course-staff-assignment.constants";
import { getApiErrorMessage } from "@/infrastructure/http/httpError";
import { AppIcon } from "@/shared/ui/AppIcon";
import { ConfirmationDialog } from "@/shared/ui/ConfirmationDialog";
import type { FloatingActionItem } from "@/shared/ui/FloatingActionBar";
import {
  AdminButton,
  AdminChip,
  AdminField,
  AdminLoadingState,
} from "@/shared/ui/admin/AdministrationPrimitives";
import { ThemedText } from "@/shared/ui/ThemedText";
import { useToast } from "@/shared/ui/Toast";
import { Colors, effects, radii, Spacing } from "@/theme";

type PersonChoice = {
  personId: string;
  fullName: string;
  personCode?: string | null;
};

type Props = {
  visible: boolean;
  courseId: string;
  courseScheduleId: string;
  scheduleStartDate: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canEnd: boolean;
  onFooterActionsChange?: (actions: FloatingActionItem[]) => void;
};

const assignmentTypes: AssignmentType[] = [
  "PRIMARY_COACH",
  "ASSISTANT_COACH",
  "TEACHING_ASSISTANT",
  "MANAGER",
];

const assignmentStatuses: CourseStaffAssignmentStatus[] = [
  "ACTIVE",
  "PENDING",
  "SUSPENDED",
  "ENDED",
  "CANCELLED",
];

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function assignmentError(error: unknown) {
  const code = (error as { response?: { data?: { code?: string } } })?.response?.data?.code;
  if (code === "PRIMARY_COACH_ASSIGNMENT_CONFLICT") {
    return "Đã có HLV chính trong khoảng thời gian này. Hãy kết thúc hoặc chỉnh sửa phân công cũ trước.";
  }
  return getApiErrorMessage(error, "Không thể lưu phân công. Vui lòng thử lại.");
}

export function CourseScheduleStaffAssignmentsSection({
  visible,
  courseId,
  courseScheduleId,
  scheduleStartDate,
  canRead,
  canCreate,
  canUpdate,
  canEnd,
  onFooterActionsChange,
}: Props) {
  const toast = useToast();
  const assignmentsQuery = useCourseScheduleStaffAssignments(courseScheduleId, visible && canRead);
  const createAssignment = useCreateCourseScheduleStaffAssignment(courseId);
  const updateAssignment = useUpdateCourseScheduleStaffAssignment(courseId);
  const deleteAssignmentMutation = useDeleteCourseScheduleStaffAssignment(courseId, courseScheduleId);
  const [editingId, setEditingId] = useState<string>();
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<PersonChoice>();
  const [isPersonPickerVisible, setIsPersonPickerVisible] = useState(true);
  const [assignmentType, setAssignmentType] = useState<AssignmentType>("ASSISTANT_COACH");
  const [startDate, setStartDate] = useState(scheduleStartDate);
  const [endDate, setEndDate] = useState("");
  const [assignmentStatus, setAssignmentStatus] = useState<CourseStaffAssignmentStatus>("ACTIVE");
  const [note, setNote] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const saveAssignmentRef = useRef<() => void>(() => {});
  const detailQuery = useCourseStaffAssignmentDetail(editingId, Boolean(editingId));
  const candidatesQuery = useStaffAssignmentCandidates(search, (isCreating || Boolean(editingId)) && (canRead || canCreate));
  const isEditing = Boolean(editingId);
  const busy = createAssignment.isPending || updateAssignment.isPending || deleteAssignmentMutation.isPending;

  const closeEditor = useCallback(() => {
    setEditingId(undefined);
    setIsCreating(false);
    setSearch("");
    setSelectedPerson(undefined);
    setIsPersonPickerVisible(true);
    setAssignmentType("ASSISTANT_COACH");
    setStartDate(scheduleStartDate);
    setEndDate("");
    setAssignmentStatus("ACTIVE");
    setNote("");
    setAttempted(false);
    setDeleteConfirmationVisible(false);
  }, [scheduleStartDate]);

  useEffect(() => {
    const detail = detailQuery.data;
    if (!editingId || !detail) return;
    // The selected assignment is fetched before editing so its note and full request are preserved.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedPerson({
      personId: detail.staffPerson.personId,
      fullName: detail.staffPerson.fullName,
      personCode: detail.staffPerson.personCode,
    });
    setIsPersonPickerVisible(false);
    setAssignmentType(detail.assignmentType);
    setStartDate(detail.startDate);
    setEndDate(detail.endDate ?? "");
    setAssignmentStatus(detail.assignmentStatus);
    setNote(detail.note ?? "");
    setAttempted(false);
  }, [detailQuery.data, editingId]);

  const validation = useMemo(() => ({
    person: selectedPerson ? undefined : "Vui lòng chọn nhân sự.",
    startDate: isValidDate(startDate) ? undefined : "Ngày bắt đầu phải đúng định dạng YYYY-MM-DD.",
    endDate: endDate && !isValidDate(endDate)
      ? "Ngày kết thúc phải đúng định dạng YYYY-MM-DD."
      : endDate && isValidDate(startDate) && endDate < startDate
        ? "Ngày kết thúc không được trước ngày bắt đầu."
        : undefined,
  }), [endDate, selectedPerson, startDate]);
  const isValid = !validation.person && !validation.startDate && !validation.endDate;
  const assignments = useMemo(
    () => [...(assignmentsQuery.data?.content ?? [])].sort(
      (left, right) => assignmentTypes.indexOf(left.assignmentType) - assignmentTypes.indexOf(right.assignmentType)
        || right.startDate.localeCompare(left.startDate),
    ),
    [assignmentsQuery.data?.content],
  );
  const candidates = candidatesQuery.data?.content ?? [];

  const openCreate = useCallback(() => {
    closeEditor();
    setIsCreating(true);
  }, [closeEditor]);

  const openEdit = useCallback((assignment: CourseStaffAssignmentSimpleResponse) => {
    closeEditor();
    setEditingId(assignment.courseStaffAssignmentId);
  }, [closeEditor]);

  const buildRequest = useCallback((): CourseStaffAssignmentCreateRequest | undefined => {
    if (!selectedPerson || !isValid) return undefined;
    return {
      staffPersonId: selectedPerson.personId,
      courseScheduleId,
      assignmentType,
      startDate,
      endDate: endDate || null,
      assignmentStatus,
      note: note.trim() || null,
    };
  }, [assignmentStatus, assignmentType, courseScheduleId, endDate, isValid, note, selectedPerson, startDate]);

  const save = useCallback(async () => {
    setAttempted(true);
    const request = buildRequest();
    if (!request) return;
    try {
      if (editingId) {
        await updateAssignment.mutateAsync({ assignmentId: editingId, request });
        toast.show({ message: "Đã cập nhật phân công.", variant: "success" });
      } else {
        await createAssignment.mutateAsync(request);
        toast.show({ message: "Đã thêm phân công.", variant: "success" });
      }
      closeEditor();
    } catch (error) {
      toast.show({ message: assignmentError(error), variant: "error" });
    }
  }, [buildRequest, closeEditor, createAssignment, editingId, toast, updateAssignment]);

  useEffect(() => {
    saveAssignmentRef.current = () => void save();
  }, [save]);

  const deleteAssignment = useCallback(async () => {
    if (!editingId) return;
    try {
      await deleteAssignmentMutation.mutateAsync(editingId);
      toast.show({ message: "Đã xóa phân công.", variant: "success" });
      closeEditor();
    } catch (error) {
      toast.show({ message: assignmentError(error), variant: "error" });
    }
  }, [closeEditor, deleteAssignmentMutation, editingId, toast]);

  const footerActions = useMemo<FloatingActionItem[]>(() => {
    if (!isCreating && !isEditing) return [];

    const canSave = isCreating ? canCreate : canUpdate;
    return [
      {
        key: "save-assignment",
        label: isEditing ? "Lưu phân công" : "Thêm phân công",
        accessibilityLabel: isEditing ? "Lưu phân công" : "Thêm phân công",
        variant: "primary",
        disabled: !canSave,
        loading: busy,
        onPress: () => saveAssignmentRef.current(),
      },
      ...(isEditing && canEnd
        ? [
            {
              key: "delete-assignment",
              label: "",
              accessibilityLabel: "Xóa phân công",
              variant: "ghost" as const,
              disabled: busy || detailQuery.isLoading,
              flex: 0,
              style: styles.deleteButton,
              icon: <AppIcon icon={<Trash6 />} size={24} color={Colors.light.error} />,
              onPress: () => setDeleteConfirmationVisible(true),
            },
          ]
        : []),
    ];
  }, [busy, canCreate, canEnd, canUpdate, detailQuery.isLoading, isCreating, isEditing]);

  useEffect(() => {
    onFooterActionsChange?.(footerActions);
  }, [footerActions, onFooterActionsChange]);

  useEffect(
    () => () => onFooterActionsChange?.([]),
    [onFooterActionsChange],
  );

  if (!canRead && !canCreate && !canUpdate && !canEnd) {
    return <ThemedText type="bodySmall" style={styles.message}>Bạn không có quyền xem phân công nhân sự.</ThemedText>;
  }

  if (!isCreating && !isEditing) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText type="bodySmall" style={styles.heading}>Nhân sự phụ trách</ThemedText>
          {canCreate ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Thêm phân công" onPress={openCreate} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
              <AppIcon icon={<Plus />} size={20} color={Colors.light.surface} />
            </Pressable>
          ) : null}
        </View>
        {canRead && assignmentsQuery.isLoading ? <AdminLoadingState /> : null}
        {canRead && assignmentsQuery.isError ? <ThemedText type="bodySmall" style={styles.message}>Không thể tải phân công nhân sự.</ThemedText> : null}
        {canRead && !assignmentsQuery.isLoading && !assignmentsQuery.isError && assignments.length === 0 ? <ThemedText type="bodySmall" style={styles.message}>Chưa có nhân sự được phân công.</ThemedText> : null}
        {assignments.map((assignment) => (
          <Pressable key={assignment.courseStaffAssignmentId} accessibilityRole="button" accessibilityLabel={`Phân công ${assignment.staffPerson.fullName}`} disabled={!canUpdate && !canEnd} onPress={() => openEdit(assignment)} style={({ pressed }) => [styles.assignmentRow, !canUpdate && !canEnd && styles.assignmentReadOnly, pressed && (canUpdate || canEnd) && styles.pressed]}>
            <View style={styles.avatar}><ThemedText type="bodySmall" style={styles.avatarText}>{assignment.staffPerson.fullName.trim().charAt(0).toUpperCase()}</ThemedText></View>
            <View style={styles.assignmentMain}>
              <ThemedText type="bodySmall" style={styles.assignmentName}>{assignment.staffPerson.fullName}</ThemedText>
              <ThemedText type="caption" style={styles.secondary}>{AssignmentTypeLabel[assignment.assignmentType]} · {CourseStaffAssignmentStatusLabel[assignment.assignmentStatus]}</ThemedText>
              <ThemedText type="caption" style={styles.secondary}>{assignment.startDate} – {assignment.endDate ?? "Không giới hạn"}</ThemedText>
            </View>
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText type="bodySmall" style={styles.heading}>{isEditing ? "Chỉnh sửa phân công" : "Thêm phân công"}</ThemedText>
        <AdminButton label="Quay lại" variant="secondary" disabled={busy} onPress={closeEditor} />
      </View>
      {isEditing && detailQuery.isLoading ? <ActivityIndicator color={Colors.light.primary} /> : null}
      <View style={styles.fieldGroup}>
        {selectedPerson && !isPersonPickerVisible ? (
          <View style={styles.selectedPersonRow}>
            <View style={styles.selectedPersonInfo}>
              <ThemedText type="featureLabel">Nhân sự được chọn</ThemedText>
              <ThemedText type="bodySmall" style={styles.assignmentName}>{selectedPerson.fullName}</ThemedText>
              <ThemedText type="caption" style={styles.secondary}>{selectedPerson.personCode ?? "Chưa có mã"}</ThemedText>
            </View>
            <AdminButton label="Đổi" variant="secondary" disabled={busy} onPress={() => setIsPersonPickerVisible(true)} />
          </View>
        ) : (
          <>
            <AdminField label="Tìm nhân sự" value={search} placeholder="Tên hoặc mã nhân sự" editable={!busy} onChangeText={setSearch} />
            {candidatesQuery.isLoading ? <AdminLoadingState /> : null}
            <View style={styles.candidateList}>
              {candidates.map((person) => (
                <Pressable key={person.personId} accessibilityRole="button" accessibilityState={{ selected: selectedPerson?.personId === person.personId }} onPress={() => {
                  setSelectedPerson({ personId: person.personId, fullName: person.fullName, personCode: person.personCode });
                  setIsPersonPickerVisible(false);
                }} style={({ pressed }) => [styles.candidateRow, selectedPerson?.personId === person.personId && styles.candidateSelected, pressed && styles.pressed]}>
                  <ThemedText type="bodySmall" style={styles.assignmentName}>{person.fullName}</ThemedText>
                  <ThemedText type="caption" style={styles.secondary}>{person.personCode ?? "Chưa có mã"}</ThemedText>
                </Pressable>
              ))}
            </View>
          </>
        )}
        {attempted && validation.person ? <FieldError message={validation.person} /> : null}
      </View>
      <View style={styles.fieldGroup}>
        <ThemedText type="featureLabel">Vai trò *</ThemedText>
        <View style={styles.chips}>{assignmentTypes.map((type) => <AdminChip key={type} label={AssignmentTypeLabel[type]} selected={assignmentType === type} onPress={busy ? undefined : () => setAssignmentType(type)} />)}</View>
      </View>
      <View style={styles.fieldGroup}>
        <AdminField label="Ngày bắt đầu *" value={startDate} placeholder="YYYY-MM-DD" editable={!busy} keyboardType="numbers-and-punctuation" onChangeText={setStartDate} />
        {attempted && validation.startDate ? <FieldError message={validation.startDate} /> : null}
      </View>
      <View style={styles.fieldGroup}>
        <AdminField label="Ngày kết thúc" value={endDate} placeholder="YYYY-MM-DD (không bắt buộc)" editable={!busy} keyboardType="numbers-and-punctuation" onChangeText={setEndDate} />
        {attempted && validation.endDate ? <FieldError message={validation.endDate} /> : null}
      </View>
      <View style={styles.fieldGroup}>
        <ThemedText type="featureLabel">Trạng thái *</ThemedText>
        <View style={styles.chips}>{assignmentStatuses.map((status) => <AdminChip key={status} label={CourseStaffAssignmentStatusLabel[status]} selected={assignmentStatus === status} onPress={busy ? undefined : () => setAssignmentStatus(status)} />)}</View>
      </View>
      <AdminField label="Ghi chú" value={note} placeholder="Không bắt buộc" editable={!busy} multiline onChangeText={setNote} />
      <ConfirmationDialog visible={deleteConfirmationVisible} title="Xóa phân công" description="Bạn có chắc chắn muốn xóa vĩnh viễn phân công này không? Thao tác không thể hoàn tác." confirmLabel="Xóa" cancelLabel="Hủy" confirmVariant="danger" pending={deleteAssignmentMutation.isPending} onCancel={() => setDeleteConfirmationVisible(false)} onConfirm={() => void deleteAssignment()} />
    </View>
  );
}

function FieldError({ message }: { message: string }) {
  return <ThemedText accessibilityRole="alert" type="bodySmall" style={styles.error}>{message}</ThemedText>;
}

const styles = StyleSheet.create({
  container: { gap: Spacing.three },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: Spacing.two },
  heading: { color: Colors.light.text, fontWeight: "700" },
  addButton: { width: 44, height: 44, borderRadius: radii.md, alignItems: "center", justifyContent: "center", backgroundColor: Colors.light.primary, borderCurve: "continuous" },
  assignmentRow: { minHeight: 68, flexDirection: "row", alignItems: "center", gap: Spacing.two, padding: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.light.divider, borderRadius: radii.md, backgroundColor: Colors.light.surface, borderCurve: "continuous" },
  assignmentReadOnly: { opacity: 0.72 },
  avatar: { width: 40, height: 40, borderRadius: radii.pill, alignItems: "center", justifyContent: "center", backgroundColor: Colors.light.primarySoft },
  avatarText: { color: Colors.light.primary, fontWeight: "700" },
  assignmentMain: { flex: 1, minWidth: 0, gap: 2 },
  assignmentName: { color: Colors.light.text, fontWeight: "600" },
  secondary: { color: Colors.light.textSecondary },
  message: { color: Colors.light.textSecondary, textAlign: "center", paddingVertical: Spacing.three },
  fieldGroup: { gap: Spacing.one },
  candidateList: { gap: 6, maxHeight: 180, overflow: "hidden" },
  candidateRow: { padding: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.light.divider, borderRadius: radii.md, backgroundColor: Colors.light.surface, borderCurve: "continuous" },
  candidateSelected: { borderColor: Colors.light.primary, backgroundColor: Colors.light.primarySoft },
  selectedPersonRow: { minHeight: 68, flexDirection: "row", alignItems: "center", gap: Spacing.two, padding: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.light.primary, borderRadius: radii.md, backgroundColor: Colors.light.primarySoft, borderCurve: "continuous" },
  selectedPersonInfo: { flex: 1, minWidth: 0, gap: 2 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  deleteButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: radii.md, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.light.divider, backgroundColor: Colors.light.surface, borderCurve: "continuous" },
  deleteButtonDisabled: { opacity: 0.5 },
  error: { color: Colors.light.error },
  pressed: effects.pressed,
});
