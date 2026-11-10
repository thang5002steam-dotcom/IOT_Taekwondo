import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import {
  AssignmentTypeLabel,
  type AssignmentType,
} from "@/features/course-staff-assignment/constants/course-staff-assignment.constants";
import type { CourseScheduleResponse } from "@/features/course/api/course.dto";
import type { PersonSimpleResponse } from "@/features/person";
import { BottomSheetWindow } from "@/shared/ui/BottomSheetWindow";
import { CancellableLoadingOverlay } from "@/shared/ui/CancellableLoadingOverlay";
import {
  FormField,
  PrimaryActionButton,
  SegmentedTabs,
} from "@/shared/ui/commerce/CommercePrimitives";
import { ThemedText } from "@/shared/ui/ThemedText";
import { useToast } from "@/shared/ui/Toast";
import { Colors, effects, radii, Spacing } from "@/theme";

import { WeekdayCode } from "@/features/class-schedule/constants/class-schedule.constants";
import {
  formatScheduleLabel,
  type CourseMemberKind,
} from "../domain/courseMemberRoster";
import {
  getLocalDate,
  useCreateCourseStaffAssignment,
  useStaffCandidates,
} from "../queries/courseMemberRosterQueries";

type StaffAssignmentSheetProps = {
  visible: boolean;
  courseId: string;
  memberKind: Exclude<CourseMemberKind, "students">;
  schedules: CourseScheduleResponse[];
  onClose: () => void;
};

const assignmentTabs = [
  { value: "staff", label: "1. Nhân sự" },
  { value: "assignment", label: "2. Phân công" },
] as const;

export function StaffAssignmentSheet({
  visible,
  courseId,
  memberKind,
  schedules,
  onClose,
}: StaffAssignmentSheetProps) {
  const toast = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState("");
  const [selectedPerson, setSelectedPerson] =
    useState<PersonSimpleResponse | null>(null);
  const [scheduleId, setScheduleId] = useState("");
  const [assignmentType, setAssignmentType] = useState<AssignmentType>(
    memberKind === "coaches" ? "ASSISTANT_COACH" : "TEACHING_ASSISTANT",
  );
  const [startDate, setStartDate] = useState(getLocalDate());
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitAbortControllerRef = useRef<AbortController | null>(null);
  const candidates = useStaffCandidates(search, visible && step === 1);
  const mutation = useCreateCourseStaffAssignment(courseId);

  const handleCancelSubmit = useCallback(() => {
    if (submitAbortControllerRef.current) {
      submitAbortControllerRef.current.abort();
      submitAbortControllerRef.current = null;
    }
    setIsSubmitting(false);
  }, []);

  const closeAndReset = () => {
    handleCancelSubmit();
    setStep(1);
    setSearch("");
    setSelectedPerson(null);
    setScheduleId("");
    setAssignmentType(
      memberKind === "coaches" ? "ASSISTANT_COACH" : "TEACHING_ASSISTANT",
    );
    setStartDate(getLocalDate());
    setEndDate("");
    setNote("");
    onClose();
  };

  const submit = async () => {
    if (!selectedPerson || !scheduleId) return;
    if (endDate && endDate < startDate) {
      toast.show({
        message: "Ngày kết thúc phải từ ngày bắt đầu trở đi.",
        variant: "error",
      });
      return;
    }

    setIsSubmitting(true);
    const abortController = new AbortController();
    submitAbortControllerRef.current = abortController;

    try {
      await mutation.mutateAsync({
        request: {
          staffPersonId: selectedPerson.personId,
          courseScheduleId: scheduleId,
          assignmentType,
          startDate,
          endDate: endDate || null,
          assignmentStatus: "ACTIVE",
          note: note || null,
        },
        signal: abortController.signal,
      });
      toast.show({ message: "Đã thêm phân công.", variant: "success" });
      closeAndReset();
    } catch (error) {
      if (
        (error as { name?: string })?.name === "AbortError" ||
        (error as { code?: string })?.code === "ERR_CANCELED"
      ) {
        return;
      }
      toast.show({
        message:
          "Không thể thêm phân công. Vui lòng kiểm tra thời gian và thử lại.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
      submitAbortControllerRef.current = null;
    }
  };

  const candidatePeople = candidates.data?.content ?? [];
  const hasCandidates = candidatePeople.length > 0;
  const activeTab = step === 1 ? "staff" : "assignment";

  const handleTabChange = (tab: (typeof assignmentTabs)[number]["value"]) => {
    if (tab === "staff") {
      setStep(1);
      return;
    }

    if (!selectedPerson) {
      toast.show({ message: "Hãy chọn nhân sự trước.", variant: "error" });
      return;
    }

    setStep(2);
  };

  return (
    <BottomSheetWindow
      visible={visible}
      title={step === 1 ? "Chọn nhân sự" : "Thông tin phân công"}
      accessibilityLabel={step === 1 ? "Chọn nhân sự" : "Thông tin phân công"}
      heightRatio={0.8}
      contentContainerStyle={styles.contentContainer}
      onClose={closeAndReset}
      overlay={
        <CancellableLoadingOverlay
          visible={isSubmitting}
          message="Đang thêm phân công..."
          cancelLabel="Hủy"
          onCancel={handleCancelSubmit}
        />
      }
      footer={
        step === 2 ? (
          <View style={styles.footerRow}>
            <View style={styles.footerAction}>
              <PrimaryActionButton
                title="Quay lại"
                variant="outline"
                onPress={() => setStep(1)}
              />
            </View>
            <View style={styles.footerAction}>
              <PrimaryActionButton
                title="Thêm"
                loading={isSubmitting}
                disabled={!scheduleId || !selectedPerson || isSubmitting}
                onPress={() => void submit()}
              />
            </View>
          </View>
        ) : undefined
      }
    >
      <View style={styles.content}>
        <SegmentedTabs
          tabs={[...assignmentTabs]}
          value={activeTab}
          onChange={handleTabChange}
        />
        {step === 1 ? (
          <>
            <FormField
              label="Tìm nhân sự"
              placeholder="Tên hoặc mã nhân sự"
              value={search}
              onChangeText={setSearch}
            />
            {candidates.isLoading ? (
              <View accessibilityLabel="Đang tải nhân sự" style={styles.state}>
                <ActivityIndicator color={Colors.light.primary} />
              </View>
            ) : null}
            {candidates.isError ? (
              <View style={styles.state}>
                <ThemedText type="bodySmall" style={styles.emptyText}>
                  Không thể tải danh sách nhân sự.
                </ThemedText>
                <PrimaryActionButton
                  title="Thử lại"
                  variant="outline"
                  onPress={() => void candidates.refetch()}
                />
              </View>
            ) : null}
            {hasCandidates ? (
              <View style={styles.choiceGroup}>
                {candidatePeople.map((person, index) => (
                  <Pressable
                    key={person.personId}
                    accessibilityRole="button"
                    accessibilityLabel={`Chọn ${person.fullName}`}
                    onPress={() => {
                      setSelectedPerson(person);
                      setStep(2);
                    }}
                    style={({ pressed }) => [
                      styles.choiceRow,
                      index < candidatePeople.length - 1
                        ? styles.choiceDivider
                        : null,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <View style={styles.choiceAvatar}>
                      <ThemedText type="bodySmall" style={styles.avatarText}>
                        {person.fullName.trim().charAt(0).toUpperCase()}
                      </ThemedText>
                    </View>
                    <View style={styles.flex}>
                      <ThemedText type="bodySmall" style={styles.strongText}>
                        {person.fullName}
                      </ThemedText>
                      <ThemedText type="caption" style={styles.secondaryText}>
                        {person.personCode ?? "Chưa có mã"}
                      </ThemedText>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : null}
            {!candidates.isLoading && !candidates.isError && !hasCandidates ? (
              <View style={styles.state}>
                <ThemedText type="bodySmall" style={styles.emptyText}>
                  Không tìm thấy nhân sự ACTIVE.
                </ThemedText>
              </View>
            ) : null}
          </>
        ) : (
          <>
            <View style={styles.selectedPersonSummary}>
              <ThemedText type="caption" style={styles.secondaryText}>
                Nhân sự đã chọn
              </ThemedText>
              <ThemedText type="bodySmall" style={styles.strongText}>
                {selectedPerson?.fullName}
              </ThemedText>
            </View>
            <ThemedText type="bodySmall" style={styles.fieldLabel}>
              Lịch học
            </ThemedText>
            <View style={styles.optionList}>
              {schedules
                .sort(
                  (a, b) =>
                    WeekdayCode[a.classSchedule.weekday] -
                    WeekdayCode[b.classSchedule.weekday],
                )
                .map((schedule) => (
                  <Pressable
                    key={schedule.courseScheduleId}
                    accessibilityRole="radio"
                    accessibilityState={{
                      selected: scheduleId === schedule.courseScheduleId,
                    }}
                    onPress={() => {
                      setScheduleId(schedule.courseScheduleId);
                      setStartDate((current) =>
                        current < schedule.startDate
                          ? schedule.startDate
                          : current,
                      );
                      if (schedule.endDate) setEndDate(schedule.endDate);
                    }}
                    style={[
                      styles.option,
                      scheduleId === schedule.courseScheduleId
                        ? styles.optionSelected
                        : null,
                    ]}
                  >
                    <ThemedText type="caption" style={styles.strongText}>
                      {formatScheduleLabel(schedule)}
                    </ThemedText>
                  </Pressable>
                ))}
            </View>
            {memberKind === "coaches" ? (
              <>
                <ThemedText type="bodySmall" style={styles.fieldLabel}>
                  Vai trò
                </ThemedText>
                <View style={styles.roleOptions}>
                  {(
                    ["PRIMARY_COACH", "ASSISTANT_COACH"] as AssignmentType[]
                  ).map((role) => (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected: assignmentType === role }}
                      key={role}
                      onPress={() => setAssignmentType(role)}
                      style={[
                        styles.option,
                        styles.flex,
                        assignmentType === role ? styles.optionSelected : null,
                      ]}
                    >
                      <ThemedText type="caption" style={styles.strongText}>
                        {AssignmentTypeLabel[role]}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}
            <FormField
              label="Ngày bắt đầu"
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChangeText={setStartDate}
              autoCapitalize="none"
            />
            <FormField
              label="Ngày kết thúc (không bắt buộc)"
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChangeText={setEndDate}
              autoCapitalize="none"
            />
            <FormField
              label="Ghi chú (không bắt buộc)"
              value={note}
              onChangeText={setNote}
              multiline
            />
          </>
        )}
      </View>
    </BottomSheetWindow>
  );
}

const styles = StyleSheet.create({
  contentContainer: { paddingTop: Spacing.three },
  content: { gap: 12 },
  state: {
    minHeight: 112,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  emptyText: { color: Colors.light.textSecondary, textAlign: "center" },
  choiceGroup: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.divider,
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
    borderCurve: "continuous",
  },
  choiceRow: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  choiceDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.divider,
  },
  choiceAvatar: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: Colors.light.primarySoft,
  },
  avatarText: { color: Colors.light.primary },
  flex: { flex: 1, minWidth: 0 },
  strongText: { color: Colors.light.text, fontWeight: "600" },
  secondaryText: { color: Colors.light.textSecondary },
  pressed: effects.pressed,
  selectedPersonSummary: {
    gap: Spacing.one,
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: Colors.light.backgroundElement,
    borderCurve: "continuous",
  },
  fieldLabel: { color: Colors.light.text, fontWeight: "600", marginTop: 4 },
  optionList: { gap: 8 },
  option: {
    minHeight: 48,
    justifyContent: "center",
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.divider,
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
    borderCurve: "continuous",
  },
  optionSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primarySoft,
  },
  roleOptions: { flexDirection: "row", gap: 8 },
  footerRow: { flexDirection: "row", gap: Spacing.two },
  footerAction: { flex: 1 },
});
