import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Check, Plus, Trash } from "reicon-react-native";

import type { ClassScheduleSimpleResponse } from "@/features/class-schedule/api/class-schedule.dto";
import {
  ScheduleLocationLabel,
  WeekdayCode,
  WeekdayLabel,
} from "@/features/class-schedule/constants/class-schedule.constants";
import type {
  CourseCreateRequest,
  CourseResponse,
  CourseScheduleUpsertRequest,
} from "@/features/course/api/course.dto";
import {
  type CourseLevel,
  CourseLevelLabel,
  CourseLevelValues,
  type CourseStatus,
  CourseStatusLabel,
  CourseStatusValues,
} from "@/features/course/constants/course.constants";
import {
  useCourseCreateOptions,
  useCreateCourse,
} from "@/features/course/queries/courseCatalogQueries";
import { getApiErrorMessage } from "@/infrastructure/http/httpError";
import {
  AdminButton,
  AdminChip,
  AdminEmptyState,
  AdminField,
  AdminLoadingState,
  AdminPickerField,
} from "@/shared/ui/admin/AdministrationPrimitives";
import { AppIcon } from "@/shared/ui/AppIcon";
import { BottomSheetWindow } from "@/shared/ui/BottomSheetWindow";
import { CancellableLoadingOverlay } from "@/shared/ui/CancellableLoadingOverlay";
import { PickerPopover } from "@/shared/ui/PickerPopover";
import { ThemedText } from "@/shared/ui/ThemedText";
import { useToast } from "@/shared/ui/Toast";
import { formatDateYMD } from "@/shared/utils/dateTime";
import { Colors, effects, radii } from "@/theme";

type CourseScheduleStatus = CourseScheduleUpsertRequest["status"];

type ScheduleDraft = CourseScheduleUpsertRequest & {
  draftId: string;
};

type ScheduleValidation = {
  classScheduleId?: string;
  startDate?: string;
  endDate?: string;
};

type FormValidation = {
  name?: string;
  capacity?: string;
  level?: string;
  schedules: Record<string, ScheduleValidation>;
  valid: boolean;
};

export type CourseCreateSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: (createdCourse: CourseResponse) => void;
};

const SCHEDULE_STATUS_LABEL: Record<CourseScheduleStatus, string> = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Ngừng hoạt động",
};

function createScheduleDraft(draftId: string): ScheduleDraft {
  return {
    draftId,
    classScheduleId: "",
    startDate: formatDateYMD(Date.now()),
    endDate: null,
    status: "ACTIVE",
  };
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function validateForm(
  name: string,
  capacity: string,
  level: CourseLevel | null,
  schedules: ScheduleDraft[],
): FormValidation {
  const parsedCapacity = Number(capacity);
  const validation: FormValidation = {
    schedules: {},
    valid: true,
  };

  if (!name.trim()) {
    validation.name = "Tên khóa học là bắt buộc.";
    validation.valid = false;
  }

  if (!capacity.trim()) {
    validation.capacity = "Sức chứa là bắt buộc.";
    validation.valid = false;
  } else if (!Number.isInteger(parsedCapacity) || parsedCapacity <= 0) {
    validation.capacity = "Sức chứa phải là số nguyên lớn hơn 0.";
    validation.valid = false;
  }

  if (!level) {
    validation.level = "Vui lòng chọn level khóa học.";
    validation.valid = false;
  }

  if (schedules.length === 0) {
    validation.valid = false;
  }

  for (const schedule of schedules) {
    const errors: ScheduleValidation = {};

    if (!schedule.classScheduleId) {
      errors.classScheduleId = "Vui lòng chọn lịch lớp.";
      validation.valid = false;
    }

    if (!isValidDate(schedule.startDate)) {
      errors.startDate = "Ngày bắt đầu phải đúng định dạng YYYY-MM-DD.";
      validation.valid = false;
    }

    const endDate = schedule.endDate?.trim() ?? "";
    if (endDate) {
      if (!isValidDate(endDate)) {
        errors.endDate = "Ngày kết thúc phải đúng định dạng YYYY-MM-DD.";
        validation.valid = false;
      } else if (
        isValidDate(schedule.startDate) &&
        endDate < schedule.startDate
      ) {
        errors.endDate = "Ngày kết thúc không được trước ngày bắt đầu.";
        validation.valid = false;
      }
    }

    validation.schedules[schedule.draftId] = errors;
  }

  return validation;
}

function getScheduleTitle(schedule: ClassScheduleSimpleResponse): string {
  return `${schedule.branch.name} · ${WeekdayLabel[schedule.weekday]}`;
}

function formatScheduleTime(time: string): string {
  return time.slice(0, 5);
}

function SchedulePickerOption({
  schedule,
  selected,
  onPress,
}: {
  schedule: ClassScheduleSimpleResponse;
  selected: boolean;
  onPress: () => void;
}) {
  const isActive = schedule.status === "ACTIVE";
  const locationLabel = ScheduleLocationLabel[schedule.location];

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={`${schedule.branch.name}, ${WeekdayLabel[schedule.weekday]}, ${formatScheduleTime(schedule.startTime)} đến ${formatScheduleTime(schedule.endTime)}, ${locationLabel}`}
      accessibilityHint={
        isActive ? "Chọn lịch lớp này" : "Lịch lớp hiện không hoạt động"
      }
      accessibilityState={{
        disabled: !isActive,
        checked: isActive && selected,
        selected: isActive && selected,
      }}
      disabled={!isActive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.schedulePickerOption,
        selected ? styles.schedulePickerOptionSelected : null,
        !isActive ? styles.schedulePickerOptionInactive : null,
        pressed && isActive ? styles.pressed : null,
      ]}
    >
      <View style={styles.schedulePickerCopy}>
        <ThemedText type="featureLabel">{schedule.branch.name}</ThemedText>
        <ThemedText type="bodySmall" style={styles.secondaryText}>
          {WeekdayLabel[schedule.weekday]} ·{" "}
          {formatScheduleTime(schedule.startTime)} –{" "}
          {formatScheduleTime(schedule.endTime)}
        </ThemedText>
        <ThemedText type="bodySmall" style={styles.secondaryText}>
          {locationLabel}
        </ThemedText>
      </View>
      <View style={styles.scheduleOptionRight}>
        <View
          style={[
            styles.scheduleStatus,
            isActive
              ? styles.scheduleStatusActive
              : styles.scheduleStatusInactive,
          ]}
        >
          <ThemedText
            type="bodySmall"
            style={
              isActive
                ? styles.scheduleStatusActiveText
                : styles.scheduleStatusInactiveText
            }
          >
            {SCHEDULE_STATUS_LABEL[schedule.status]}
          </ThemedText>
        </View>
        <View
          style={[
            styles.checkboxBase,
            selected ? styles.checkboxSelected : null,
          ]}
        >
          {selected ? (
            <AppIcon icon={<Check />} size={14} color={Colors.light.surface} />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function getApiMessage(error: unknown): string {
  const apiMessage = (
    error as {
      response?: { data?: { message?: string } };
    }
  )?.response?.data?.message;

  return (
    apiMessage ||
    getApiErrorMessage(error, "Không thể tạo khóa học. Vui lòng thử lại.")
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <ThemedText
      accessibilityRole="alert"
      type="bodySmall"
      style={styles.errorText}
    >
      {message}
    </ThemedText>
  );
}

function StatusField({
  label,
  values,
  selectedValue,
  getLabel,
  getTone,
  disabled,
  onChange,
}: {
  label: string;
  values: readonly string[];
  selectedValue: string | null;
  getLabel: (value: string) => string;
  getTone: (value: string) => "neutral" | "success" | "info" | "danger";
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.fieldGroup}>
      <ThemedText type="featureLabel">{label}</ThemedText>
      <View style={styles.chipRow}>
        {values.map((value) => (
          <AdminChip
            key={value}
            label={getLabel(value)}
            tone={getTone(value)}
            selected={selectedValue === value}
            onPress={disabled ? undefined : () => onChange(value)}
          />
        ))}
      </View>
    </View>
  );
}

function CourseCreateSheetComponent({
  visible,
  onClose,
  onSuccess,
}: CourseCreateSheetProps) {
  const toast = useToast();
  const { mutateAsync: createCourse } = useCreateCourse();
  const nextDraftIdRef = useRef(2);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [level, setLevel] = useState<CourseLevel | null>(null);
  const [status, setStatus] = useState<CourseStatus>("OPEN");
  const [schedules, setSchedules] = useState<ScheduleDraft[]>(() => [
    createScheduleDraft("schedule-1"),
  ]);
  const [pickerTargetId, setPickerTargetId] = useState<string | null>(null);
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const classSchedulesQuery = useCourseCreateOptions(visible);

  const classSchedules = useMemo(
    () => classSchedulesQuery.data?.content ?? [],
    [classSchedulesQuery.data?.content],
  );
  const sortedClassSchedules = useMemo(
    () =>
      [...classSchedules].sort(
        (a, b) =>
          a.branch.name.localeCompare(b.branch.name) ||
          WeekdayCode[a.weekday] - WeekdayCode[b.weekday] ||
          a.startTime.localeCompare(b.startTime),
      ),
    [classSchedules],
  );
  const classScheduleById = useMemo(
    () =>
      new Map(
        classSchedules.map((schedule) => [schedule.scheduleId, schedule]),
      ),
    [classSchedules],
  );

  const validation = useMemo(
    () => validateForm(name, capacity, level, schedules),
    [capacity, level, name, schedules],
  );

  const resetForm = useCallback(() => {
    nextDraftIdRef.current = 2;
    setName("");
    setCapacity("");
    setLevel(null);
    setStatus("OPEN");
    setSchedules([createScheduleDraft("schedule-1")]);
    setPickerTargetId(null);
    setSelectedScheduleIds([]);
  }, []);

  useEffect(
    () => () => {
      abortControllerRef.current?.abort();
    },
    [],
  );

  const updateSchedule = useCallback(
    (draftId: string, patch: Partial<ScheduleDraft>) => {
      setSchedules((current) =>
        current.map((schedule) =>
          schedule.draftId === draftId
            ? { ...schedule, ...patch, draftId: schedule.draftId }
            : schedule,
        ),
      );
    },
    [],
  );

  const addSchedule = useCallback(() => {
    const draftId = `schedule-${nextDraftIdRef.current}`;
    nextDraftIdRef.current += 1;
    setSchedules((current) => [...current, createScheduleDraft(draftId)]);
  }, []);

  const handleOpenPicker = useCallback(
    (draftId: string) => {
      const target = schedules.find((s) => s.draftId === draftId);
      setPickerTargetId(draftId);
      setSelectedScheduleIds(
        target?.classScheduleId ? [target.classScheduleId] : [],
      );
    },
    [schedules],
  );

  const handleClosePicker = useCallback(() => {
    setPickerTargetId(null);
    setSelectedScheduleIds([]);
  }, []);

  const toggleScheduleSelection = useCallback((scheduleId: string) => {
    setSelectedScheduleIds((current) =>
      current.includes(scheduleId)
        ? current.filter((id) => id !== scheduleId)
        : [...current, scheduleId],
    );
  }, []);

  const handleConfirmSchedules = useCallback(() => {
    if (!pickerTargetId || selectedScheduleIds.length === 0) {
      handleClosePicker();
      return;
    }

    const [firstId, ...remainingIds] = selectedScheduleIds;
    const targetDraft = schedules.find((s) => s.draftId === pickerTargetId);

    setSchedules((current) => {
      let updated = current.map((item) =>
        item.draftId === pickerTargetId
          ? { ...item, classScheduleId: firstId }
          : item,
      );

      const existingScheduleIds = new Set(
        updated.map((item) => item.classScheduleId).filter(Boolean),
      );

      for (const extraId of remainingIds) {
        if (!existingScheduleIds.has(extraId)) {
          const newDraftId = `schedule-${nextDraftIdRef.current}`;
          nextDraftIdRef.current += 1;
          updated = [
            ...updated,
            {
              draftId: newDraftId,
              classScheduleId: extraId,
              startDate: targetDraft?.startDate ?? formatDateYMD(Date.now()),
              endDate: targetDraft?.endDate ?? null,
              status: targetDraft?.status ?? "ACTIVE",
            },
          ];
          existingScheduleIds.add(extraId);
        }
      }

      return updated;
    });

    handleClosePicker();
  }, [handleClosePicker, pickerTargetId, schedules, selectedScheduleIds]);

  const removeSchedule = useCallback((draftId: string) => {
    setSchedules((current) =>
      current.length > 1
        ? current.filter((schedule) => schedule.draftId !== draftId)
        : current,
    );
  }, []);

  const handleCancelSubmit = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    if (isSubmitting) {
      handleCancelSubmit();
      return;
    }
    resetForm();
    onClose();
  }, [handleCancelSubmit, isSubmitting, onClose, resetForm]);

  const handleSave = useCallback(async () => {
    if (!validation.valid || !level || isSubmitting) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsSubmitting(true);

    const request: CourseCreateRequest = {
      name: name.trim(),
      level,
      capacity: Number(capacity),
      status,
      courseSchedules: schedules.map(({ draftId: _draftId, ...schedule }) => ({
        ...schedule,
        endDate: schedule.endDate?.trim() || null,
      })),
    };

    try {
      const createdCourse = await createCourse({
        request,
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      toast.show({
        message: "Tạo khóa học thành công",
        variant: "success",
      });
      resetForm();
      onSuccess(createdCourse);
    } catch (error: unknown) {
      if (controller.signal.aborted) return;

      toast.show({
        message: getApiMessage(error),
        variant: "error",
      });
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsSubmitting(false);
    }
  }, [
    capacity,
    createCourse,
    isSubmitting,
    level,
    name,
    onSuccess,
    resetForm,
    schedules,
    status,
    toast,
    validation.valid,
  ]);

  const pickerTarget = pickerTargetId
    ? schedules.find((schedule) => schedule.draftId === pickerTargetId)
    : undefined;

  return (
    <>
      <BottomSheetWindow
        visible={visible}
        title="Tạo khóa học"
        heightRatio={0.8}
        accessibilityLabel="Biểu mẫu tạo khóa học"
        onClose={handleClose}
        overlay={
          <>
            <CancellableLoadingOverlay
              visible={isSubmitting}
              message="Đang tạo khóa học..."
              cancelLabel="Hủy"
              onCancel={handleCancelSubmit}
            />
            <PickerPopover
              visible={Boolean(pickerTargetId)}
              useModal={false}
              title="Chọn lịch lớp"
              subtitle={
                selectedScheduleIds.length > 0
                  ? `Đã chọn ${selectedScheduleIds.length} lịch học`
                  : "Lịch học khả dụng"
              }
              accessibilityLabel="Danh sách lịch lớp"
              cardStyle={styles.schedulePickerCard}
              onClose={handleClosePicker}
              footer={
                <AdminButton
                  label="Chọn"
                  variant="primary"
                  disabled={selectedScheduleIds.length === 0}
                  onPress={handleConfirmSchedules}
                  style={styles.pickerConfirmButton}
                />
              }
            >
              <View style={styles.pickerContent}>
                {classSchedulesQuery.isLoading ? (
                  <AdminLoadingState />
                ) : classSchedulesQuery.error ? (
                  <View style={styles.pickerState}>
                    <AdminEmptyState message="Không thể tải danh sách lịch lớp." />
                    <AdminButton
                      label="Thử lại"
                      variant="secondary"
                      onPress={() => {
                        void classSchedulesQuery.refetch();
                      }}
                    />
                  </View>
                ) : classSchedules.length === 0 ? (
                  <AdminEmptyState message="Chưa có lịch lớp để lựa chọn." />
                ) : (
                  sortedClassSchedules.map((schedule) => (
                    <SchedulePickerOption
                      key={schedule.scheduleId}
                      schedule={schedule}
                      selected={selectedScheduleIds.includes(
                        schedule.scheduleId,
                      )}
                      onPress={() => toggleScheduleSelection(schedule.scheduleId)}
                    />
                  ))
                )}
              </View>
            </PickerPopover>
          </>
        }
        footer={
          <View style={styles.footerActions}>
            <AdminButton
              label="Hoàn tác"
              variant="secondary"
              disabled={isSubmitting}
              onPress={resetForm}
              style={styles.footerButton}
            />
            <AdminButton
              label="Lưu"
              disabled={!validation.valid || isSubmitting}
              onPress={() => {
                void handleSave();
              }}
              style={styles.footerButton}
            />
          </View>
        }
      >
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <AdminField
              label="Tên khóa học *"
              placeholder="Nhập tên khóa học"
              value={name}
              onChangeText={setName}
              editable={!isSubmitting}
            />
            <FieldError message={validation.name} />
          </View>

          <View style={styles.fieldGroup}>
            <AdminField
              label="Sức chứa tối đa *"
              placeholder="Nhập số lượng học viên"
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="number-pad"
              editable={!isSubmitting}
            />
            <FieldError message={validation.capacity} />
          </View>

          <View style={styles.fieldGroup}>
            <StatusField
              label="Level khóa học *"
              values={CourseLevelValues}
              selectedValue={level}
              getLabel={(value) => CourseLevelLabel[value as CourseLevel]}
              getTone={(value) =>
                value === "EXPERT"
                  ? "danger"
                  : value === "ADVANCED"
                    ? "info"
                    : "neutral"
              }
              disabled={isSubmitting}
              onChange={(value) => setLevel(value as CourseLevel)}
            />
            <FieldError message={validation.level} />
          </View>

          <StatusField
            label="Trạng thái khóa học *"
            values={CourseStatusValues}
            selectedValue={status}
            getLabel={(value) => CourseStatusLabel[value as CourseStatus]}
            getTone={(value) => {
              if (value === "CANCELLED") return "danger";
              if (value === "ACTIVE") return "success";
              if (value === "OPEN") return "info";
              return "neutral";
            }}
            disabled={isSubmitting}
            onChange={(value) => setStatus(value as CourseStatus)}
          />

          <View style={styles.scheduleHeader}>
            <View style={styles.scheduleHeaderCopy}>
              <ThemedText type="title">Lịch học *</ThemedText>
              <ThemedText type="bodySmall" style={styles.secondaryText}>
                Khóa học cần ít nhất một lịch lớp.
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Thêm lịch học"
              disabled={isSubmitting}
              hitSlop={8}
              onPress={addSchedule}
              style={({ pressed }) => [
                styles.addScheduleButton,
                pressed ? styles.pressed : null,
                isSubmitting ? styles.disabled : null,
              ]}
            >
              <AppIcon icon={<Plus />} size={18} color={Colors.light.primary} />
              <ThemedText type="featureLabel" style={styles.addScheduleText}>
                Thêm lịch
              </ThemedText>
            </Pressable>
          </View>

          {schedules.map((schedule, index) => {
            const errors = validation.schedules[schedule.draftId];
            const selectedSchedule = classScheduleById.get(
              schedule.classScheduleId,
            );

            return (
              <View key={schedule.draftId} style={styles.scheduleCard}>
                <View style={styles.scheduleCardHeader}>
                  <ThemedText type="featureLabel">
                    Lịch học {index + 1}
                  </ThemedText>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Xóa lịch học ${index + 1}`}
                    accessibilityState={{ disabled: schedules.length === 1 }}
                    disabled={schedules.length === 1 || isSubmitting}
                    hitSlop={8}
                    onPress={() => removeSchedule(schedule.draftId)}
                    style={({ pressed }) => [
                      styles.removeButton,
                      pressed ? styles.pressed : null,
                      schedules.length === 1 || isSubmitting
                        ? styles.disabled
                        : null,
                    ]}
                  >
                    <AppIcon
                      icon={<Trash />}
                      size={18}
                      color={Colors.light.error}
                    />
                  </Pressable>
                </View>

                <View style={styles.fieldGroup}>
                  <AdminPickerField
                    label="Lịch lớp *"
                    valueLabel={
                      selectedSchedule
                        ? getScheduleTitle(selectedSchedule)
                        : undefined
                    }
                    placeholder="Chọn lịch lớp"
                    onPress={() => handleOpenPicker(schedule.draftId)}
                  />
                  <FieldError message={errors?.classScheduleId} />
                </View>

                <View style={styles.fieldGroup}>
                  <AdminField
                    label="Ngày bắt đầu *"
                    placeholder="YYYY-MM-DD"
                    value={schedule.startDate}
                    onChangeText={(value) =>
                      updateSchedule(schedule.draftId, { startDate: value })
                    }
                    editable={!isSubmitting}
                    keyboardType="numbers-and-punctuation"
                  />
                  <FieldError message={errors?.startDate} />
                </View>

                <View style={styles.fieldGroup}>
                  <AdminField
                    label="Ngày kết thúc"
                    placeholder="YYYY-MM-DD (không bắt buộc)"
                    value={schedule.endDate ?? ""}
                    onChangeText={(value) =>
                      updateSchedule(schedule.draftId, {
                        endDate: value || null,
                      })
                    }
                    editable={!isSubmitting}
                    keyboardType="numbers-and-punctuation"
                  />
                  <FieldError message={errors?.endDate} />
                </View>

                <StatusField
                  label="Trạng thái lịch *"
                  values={["ACTIVE", "INACTIVE"]}
                  selectedValue={schedule.status}
                  getLabel={(value) =>
                    SCHEDULE_STATUS_LABEL[value as CourseScheduleStatus]
                  }
                  getTone={(value) =>
                    value === "ACTIVE" ? "success" : "neutral"
                  }
                  disabled={isSubmitting}
                  onChange={(value) =>
                    updateSchedule(schedule.draftId, {
                      status: value as CourseScheduleStatus,
                    })
                  }
                />
              </View>
            );
          })}
        </View>
      </BottomSheetWindow>
    </>
  );
}

const styles = StyleSheet.create({
  form: {
    paddingTop: 16,
    paddingBottom: 24,
    gap: 18,
  },
  fieldGroup: {
    gap: 6,
  },
  errorText: {
    color: Colors.light.error,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  scheduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  scheduleHeaderCopy: {
    flex: 1,
    gap: 2,
  },
  secondaryText: {
    color: Colors.light.textSecondary,
  },
  addScheduleButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
  },
  addScheduleText: {
    color: Colors.light.primary,
  },
  scheduleCard: {
    gap: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.divider,
    borderRadius: radii.lg,
    borderCurve: "continuous",
    backgroundColor: Colors.light.surface,
    ...effects.soft,
  },
  scheduleCardHeader: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  removeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: Colors.light.errorSoft,
  },
  footerActions: {
    flexDirection: "row",
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
  pickerContent: {
    gap: 10,
  },
  schedulePickerCard: {
    maxWidth: 380,
    width: "100%",
  },
  schedulePickerOption: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.divider,
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
  },
  schedulePickerOptionSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primarySoft,
  },
  schedulePickerOptionInactive: {
    backgroundColor: Colors.light.backgroundElement,
  },
  schedulePickerCopy: {
    flex: 1,
    gap: 2,
  },
  scheduleOptionRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  checkboxBase: {
    width: 20,
    height: 20,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: Colors.light.divider,
    backgroundColor: Colors.light.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  scheduleStatus: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  scheduleStatusActive: {
    backgroundColor: Colors.light.successSoft,
  },
  scheduleStatusInactive: {
    backgroundColor: Colors.light.divider,
  },
  scheduleStatusActiveText: {
    color: Colors.light.green,
  },
  scheduleStatusInactiveText: {
    color: Colors.light.textSecondary,
  },
  pickerConfirmButton: {
    width: "100%",
  },
  pickerState: {
    gap: 12,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.5,
  },
});

export const CourseCreateSheet = memo(CourseCreateSheetComponent);
