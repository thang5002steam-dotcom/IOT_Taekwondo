import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Layers,
  User,
} from "reicon-react-native";

import { useAuthStore } from "@/features/authentication/store/auth.store";
import {
  WeekdayCode,
  WeekdayLabel,
} from "@/features/class-schedule/constants/class-schedule.constants";
import { usePerson } from "@/features/person/queries/personQueries";
import { useRegistrationStudentSearch } from "@/features/student-commerce/queries/courseRegistrationQueries";
import type { CourseRegistrationStudentView } from "@/features/student-commerce/types";
import type {
  TrainingPlanCatalogItem,
  TrainingPlanScheduleOption,
} from "@/features/training-plan-registration";
import {
  findScheduleTimeConflict,
  getTrainingPlanPurchaseErrorMessage,
  hasScheduleTimeConflicts,
  usePurchaseTrainingPlan,
  useTrainingPlanCatalog,
  useTrainingPlanOptions,
} from "@/features/training-plan-registration";
import {
  SessionTypeLabel,
  type SessionType,
} from "@/features/training-plan/constants/training-plan.constants";
import { levelLabel } from "@/features/training-plan/domain/trainingPlanLabels";
import { useWalletByPerson } from "@/features/wallet/queries/walletQueries";
import {
  getApiErrorCode,
  getApiErrorMessage,
} from "@/infrastructure/http/httpError";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { AppIcon } from "@/shared/ui/AppIcon";
import { BottomSheetWindow } from "@/shared/ui/BottomSheetWindow";
import { CancellableLoadingOverlay } from "@/shared/ui/CancellableLoadingOverlay";
import { ConfirmationDialog } from "@/shared/ui/ConfirmationDialog";
import { FloatingActionBar } from "@/shared/ui/FloatingActionBar";
import { PickerPopover } from "@/shared/ui/PickerPopover";
import { ThemedText } from "@/shared/ui/ThemedText";
import { useToast } from "@/shared/ui/Toast";
import { AdminListRow } from "@/shared/ui/admin/AdministrationPrimitives";
import { SurfaceCard } from "@/shared/ui/commerce/CommercePrimitives";
import { formatTimeStringHM } from "@/shared/utils/dateTime";
import { Colors, effects, radii, Spacing } from "@/theme";

type Props = {
  initialCourseId?: string;
  initialPackageId?: string;
  studentCode?: string;
};
type Student = Pick<
  CourseRegistrationStudentView,
  "personId" | "fullName" | "personCode"
>;
type PlanGroup = {
  key: string;
  name: string;
  level: string;
  variants: TrainingPlanCatalogItem[];
};

const today = () => new Date().toISOString().slice(0, 10);
const money = (value?: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
const createReference = () => `TP-MOBILE-${Date.now()}`;
function groupPlans(plans: TrainingPlanCatalogItem[]): PlanGroup[] {
  const groups = new Map<string, PlanGroup>();
  for (const plan of plans) {
    const key = `${plan.name}-${plan.level}`;
    const group = groups.get(key) ?? {
      key,
      name: plan.name,
      level: plan.level,
      variants: [],
    };
    group.variants.push(plan);
    groups.set(key, group);
  }
  return [...groups.values()];
}
const startDateOptions = Array.from({ length: 30 }, (_, offset) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  const value = date.toISOString().slice(0, 10);
  return {
    value,
    label: offset === 0 ? `Hôm nay · ${dateLabel(value)}` : dateLabel(value),
  };
});

export function TrainingPlanRegistrationScreen({ studentCode }: Props) {
  const toast = useToast();
  const context = useAuthStore((state) => state.activeContext);
  const user = useAuthStore((state) => state.user);
  const routedStudentQuery = usePerson(studentCode);
  const canChooseStudent = Boolean(
    user?.roles.some(
      (role) =>
        role === "SUPER_ADMIN" ||
        role === "SYSTEM_ADMIN" ||
        role === "ROLE_MANAGER_SENIOR",
    ),
  );
  const contextStudent = useMemo<Student | undefined>(
    () =>
      context?.personId
        ? {
            personId: context.personId,
            personCode: context.personCode ?? context.personId,
            fullName: context.displayName,
          }
        : undefined,
    [context],
  );
  const routedStudent = useMemo<Student | undefined>(
    () =>
      routedStudentQuery.data
        ? {
            personId: routedStudentQuery.data.personId,
            personCode:
              routedStudentQuery.data.personCode ??
              routedStudentQuery.data.personId,
            fullName: routedStudentQuery.data.fullName,
          }
        : undefined,
    [routedStudentQuery.data],
  );
  // User's manual pick — external sources (routed/context) are merged via derivation below
  const [internalStudent, setInternalStudent] = useState<Student | undefined>(
    undefined,
  );
  // Derived: routedStudent wins (URL param), then manual pick, then context when !canChooseStudent
  const selectedStudent =
    routedStudent ??
    internalStudent ??
    (!canChooseStudent ? contextStudent : undefined);
  const [studentSheet, setStudentSheet] = useState(false);
  const [planSheet, setPlanSheet] = useState(false);
  const [scheduleSheetFor, setScheduleSheetFor] = useState<string>();
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlanCatalogItem>();
  const [collapsedPlanGroups, setCollapsedPlanGroups] = useState<Set<string>>(
    () => new Set(),
  );
  const [startDate, setStartDate] = useState(today());
  const [schedulesByRequirement, setSchedulesByRequirement] = useState<
    Record<string, string[]>
  >({});
  const reference = useRef(createReference());
  const purchaseAbortController = useRef<AbortController | null>(null);
  const students = useRegistrationStudentSearch(
    "",
    canChooseStudent && studentSheet,
  );
  const catalog = useTrainingPlanCatalog(selectedStudent?.personId);
  const options = useTrainingPlanOptions(
    selectedPlan?.trainingPlanId,
    startDate,
  );
  const wallet = useWalletByPerson(selectedStudent?.personId);
  const purchase = usePurchaseTrainingPlan();
  const planGroups = useMemo(
    () => groupPlans(catalog.data ?? []),
    [catalog.data],
  );

  const allScheduleOptions = useMemo(
    () =>
      options.data?.recurringRequirements.flatMap(
        (requirement) => requirement.options,
      ) ?? [],
    [options.data],
  );
  const selectedScheduleOptions = useMemo(() => {
    return Object.values(schedulesByRequirement)
      .flat()
      .map((scheduleId) =>
        allScheduleOptions.find(
          (option) => option.courseScheduleId === scheduleId,
        ),
      )
      .filter(
        (option): option is TrainingPlanScheduleOption => Boolean(option),
      );
  }, [allScheduleOptions, schedulesByRequirement]);
  const hasScheduleConflict = hasScheduleTimeConflicts(
    selectedScheduleOptions,
  );

  const validRecurring =
    options.data?.recurringRequirements.every(
      (requirement) =>
        (schedulesByRequirement[requirement.requirementId] ?? []).length ===
        requirement.sessionsPerWeek,
    ) ?? false;
  const hasInsufficientBalance = Boolean(
    selectedPlan &&
      wallet.data &&
      wallet.data.balance < selectedPlan.finalPrice,
  );
  const walletErrorMessage = wallet.isError
    ? getTrainingPlanPurchaseErrorMessage(getApiErrorCode(wallet.error)) ??
      "Không thể kiểm tra số dư ví. Vui lòng thử lại."
    : null;
  const canConfirm = Boolean(
    selectedStudent &&
      selectedPlan &&
      options.data &&
      validRecurring &&
      !hasScheduleConflict &&
      wallet.isSuccess &&
      !hasInsufficientBalance,
  );

  const choosePlan = (plan: TrainingPlanCatalogItem) => {
    setSelectedPlan(plan);
    setSchedulesByRequirement({});
    setPlanSheet(false);
  };
  const toggleSchedule = (
    requirementId: string,
    limit: number,
    optionId: string,
  ) => {
    const currentIds = schedulesByRequirement[requirementId] ?? [];
    if (currentIds.includes(optionId)) {
      setSchedulesByRequirement((current) => ({
        ...current,
        [requirementId]: currentIds.filter((id) => id !== optionId),
      }));
      return;
    }
    if (currentIds.length >= limit) return;

    const candidate = allScheduleOptions.find(
      (option) => option.courseScheduleId === optionId,
    );
    const conflict = candidate
      ? findScheduleTimeConflict(candidate, selectedScheduleOptions)
      : undefined;
    if (candidate && conflict) {
      toast.show({
        message: `Ca ${WeekdayLabel[candidate.dayOfWeek]} ${formatTimeStringHM(candidate.startTime)}–${formatTimeStringHM(candidate.endTime)} bị trùng với ca ${formatTimeStringHM(conflict.startTime)}–${formatTimeStringHM(conflict.endTime)} đã chọn. Vui lòng chọn ca khác.`,
        variant: "error",
      });
      return;
    }

    setSchedulesByRequirement((current) => ({
      ...current,
      [requirementId]: [...currentIds, optionId],
    }));
  };
  const submit = () => {
    if (!selectedStudent || !selectedPlan || !options.data) return;
    const abortController = new AbortController();
    purchaseAbortController.current = abortController;
    setConfirmingPayment(false);
    purchase.mutate(
      {
        request: {
          studentPersonId: selectedStudent.personId,
          trainingPlanId: selectedPlan.trainingPlanId,
          startDate,
          recurringSchedules: Object.entries(schedulesByRequirement).flatMap(
            ([requirementId, scheduleIds]) =>
              scheduleIds.map((courseScheduleId) => ({
                requirementId,
                courseScheduleId,
              })),
          ),
          externalReference: reference.current,
          note: `Đăng ký gói ${selectedPlan.name}`,
        },
        signal: abortController.signal,
      },
      {
        onSuccess: () => {
          reference.current = createReference();
          setSelectedPlan(undefined);
          setSchedulesByRequirement({});
          toast.show({
            message: "Đã mua gói và chốt lịch học.",
            variant: "success",
          });
        },
        onError: (error) => {
          if (
            (error as { name?: string })?.name === "AbortError" ||
            (error as { code?: string })?.code === "ERR_CANCELED"
          ) {
            return;
          }
          toast.show({
            message:
              getTrainingPlanPurchaseErrorMessage(getApiErrorCode(error)) ??
              getApiErrorMessage(
                error,
                "Không thể đăng ký gói học. Vui lòng thử lại.",
              ),
            variant: "error",
          });
        },
        onSettled: () => {
          purchaseAbortController.current = null;
        },
      },
    );
  };

  return (
    <>
      <StackScreenLayout
        title="Đăng ký gói học"
        contentContainerStyle={styles.screen}
        floatingContent={
          <FloatingActionBar>
            <View style={styles.paymentBarContent}>
              <View style={styles.paymentBarTotal}>
                <ThemedText type="caption" style={styles.helper}>
                  Tổng cộng
                </ThemedText>
                <ThemedText type="heading" style={styles.paymentBarAmount}>
                  {selectedPlan ? money(selectedPlan.finalPrice) : "—"}
                </ThemedText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Thanh toán gói học"
                accessibilityState={{ disabled: !canConfirm }}
                disabled={!canConfirm}
                onPress={() => setConfirmingPayment(true)}
                style={({ pressed }) => [
                  styles.paymentButton,
                  !canConfirm && styles.paymentButtonDisabled,
                  pressed && canConfirm && effects.pressed,
                ]}
              >
                <ThemedText type="action" style={styles.paymentButtonText}>
                  Thanh toán
                </ThemedText>
              </Pressable>
            </View>
          </FloatingActionBar>
        }
      >
        <Section title="1. Học viên">
          <StepChoice
            icon={<User />}
            completed={Boolean(selectedStudent)}
            title={selectedStudent?.fullName ?? "Chọn học viên"}
            subtitle={
              selectedStudent
                ? selectedStudent.personCode
                : canChooseStudent
                  ? "Chọn học viên cần đăng ký gói"
                  : "Không tìm thấy hồ sơ học viên"
            }
            locked={!canChooseStudent && !selectedStudent}
            onPress={() => canChooseStudent && setStudentSheet(true)}
          />
        </Section>
        <Section title="2. Gói học">
          <StepChoice
            icon={<Layers />}
            completed={Boolean(selectedPlan)}
            title={selectedPlan?.name ?? "Chọn gói học"}
            subtitle={
              selectedPlan
                ? `${selectedPlan.durationMonths} tháng · ${selectedPlan.includedSessionCount} buổi · ${money(selectedPlan.finalPrice)}`
                : selectedStudent
                  ? "Gói xác định quota và các khóa được phép học"
                  : "Chọn học viên trước"
            }
            locked={!selectedStudent}
            onPress={() => selectedStudent && setPlanSheet(true)}
          />
        </Section>
        <Section title="3. Ngày bắt đầu">
          <StepChoice
            icon={<Calendar />}
            completed={Boolean(startDate)}
            title={dateLabel(startDate)}
            subtitle="Lịch phù hợp được tính lại theo ngày này"
            onPress={() => setDatePickerOpen(true)}
          />
        </Section>
        {selectedPlan ? (
          <Section title="4. Chốt lịch cố định">
            {options.isFetching ? (
              <InlineState loading message="Đang tải các lịch phù hợp…" />
            ) : null}
            {options.isError ? (
              <InlineState
                message="Không thể tải lịch phù hợp."
                actionLabel="Thử lại"
                onAction={() => void options.refetch()}
              />
            ) : null}
            {!options.isFetching &&
            !options.isError &&
            options.data?.recurringRequirements.length === 0 ? (
              <InlineState message="Gói này chưa có quota lịch học để đăng ký." />
            ) : null}
            {options.data?.recurringRequirements.map((requirement) => {
              const ids =
                schedulesByRequirement[requirement.requirementId] ?? [];
              const complete = ids.length === requirement.sessionsPerWeek;
              return (
                <StepChoice
                  key={requirement.requirementId}
                  icon={<Clock />}
                  completed={complete}
                  title={SessionTypeLabel[requirement.sessionType]}
                  subtitle={
                    complete
                      ? `Đã chốt ${ids.length}/${requirement.sessionsPerWeek} ca mỗi tuần`
                      : `Cần chọn ${requirement.sessionsPerWeek} ca mỗi tuần · đã chọn ${ids.length}`
                  }
                  onPress={() => setScheduleSheetFor(requirement.requirementId)}
                />
              );
            })}
          </Section>
        ) : null}
        {selectedPlan && !options.isFetching && hasScheduleConflict ? (
          <ThemedText type="bodySmall" style={styles.error}>
            Các ca đã chọn đang bị trùng giờ. Vui lòng chọn lại lịch.
          </ThemedText>
        ) : selectedPlan && options.data && !validRecurring ? (
          <ThemedText type="bodySmall" style={styles.helper}>
            Chọn đủ số ca cho từng quota để tiếp tục thanh toán.
          </ThemedText>
        ) : selectedPlan && wallet.isPending ? (
          <ThemedText type="bodySmall" style={styles.helper}>
            Đang kiểm tra số dư ví…
          </ThemedText>
        ) : selectedPlan && wallet.isError ? (
          <ThemedText type="bodySmall" style={styles.error}>
            {walletErrorMessage}
          </ThemedText>
        ) : selectedPlan && hasInsufficientBalance ? (
          <ThemedText type="bodySmall" style={styles.error}>
            Số dư ví không đủ. Cần nạp thêm{" "}
            {money(selectedPlan.finalPrice - (wallet.data?.balance ?? 0))}.
          </ThemedText>
        ) : null}
        {selectedPlan ? (
          <Section title="5. Chi tiết thanh toán">
            <PaymentDetails
              plan={selectedPlan}
              walletBalance={wallet.data?.balance}
            />
          </Section>
        ) : null}
      </StackScreenLayout>

      <BottomSheetWindow
        visible={studentSheet}
        title="Chọn học viên"
        heightRatio={0.72}
        onClose={() => setStudentSheet(false)}
      >
        <PickerSheetState
          loading={students.isPending}
          error={students.isError}
          empty={
            !students.isPending &&
            !students.isError &&
            (students.data?.length ?? 0) === 0
          }
          emptyMessage="Không có học viên đang hoạt động."
          onRetry={() => void students.refetch()}
        />
        {!students.isPending && !students.isError
          ? students.data?.map((student) => (
              <AdminListRow
                key={student.personId}
                title={student.fullName}
                subtitle={student.personCode}
                selected={student.personId === selectedStudent?.personId}
                onPress={() => {
                  setInternalStudent(student);
                  setSelectedPlan(undefined);
                  setSchedulesByRequirement({});
                  setStudentSheet(false);
                }}
                leading={<RowIcon icon={<User />} />}
              />
            ))
          : null}
      </BottomSheetWindow>
      <BottomSheetWindow
        visible={planSheet}
        title="Chọn gói học"
        heightRatio={0.72}
        onClose={() => setPlanSheet(false)}
      >
        <PickerSheetState
          loading={catalog.isPending}
          error={catalog.isError}
          empty={
            !catalog.isPending &&
            !catalog.isError &&
            (catalog.data?.length ?? 0) === 0
          }
          emptyMessage="Hiện chưa có gói học để đăng ký."
          onRetry={() => void catalog.refetch()}
        />
        {!catalog.isPending && !catalog.isError ? (
          <View style={styles.planGroups}>
            {planGroups.map((group) => (
              <PlanPickerGroup
                key={group.key}
                group={group}
                expanded={collapsedPlanGroups.has(group.key)}
                selectedPlanId={selectedPlan?.trainingPlanId}
                onToggle={() =>
                  setCollapsedPlanGroups((current) => {
                    const next = new Set(current);
                    if (next.has(group.key)) {
                      next.delete(group.key);
                    } else {
                      next.add(group.key);
                    }
                    return next;
                  })
                }
                onSelect={choosePlan}
              />
            ))}
          </View>
        ) : null}
      </BottomSheetWindow>
      <ScheduleSheet
        requirement={options.data?.recurringRequirements.find(
          (item) => item.requirementId === scheduleSheetFor,
        )}
        selectedIds={
          scheduleSheetFor
            ? (schedulesByRequirement[scheduleSheetFor] ?? [])
            : []
        }
        onClose={() => setScheduleSheetFor(undefined)}
        onToggle={toggleSchedule}
      />
      <PickerPopover
        visible={datePickerOpen}
        title="Ngày bắt đầu"
        subtitle="Chọn trong 30 ngày tới"
        options={startDateOptions}
        selectedValue={startDate}
        onSelect={(value) => {
          setStartDate(value);
          setSchedulesByRequirement({});
          setDatePickerOpen(false);
        }}
        onClose={() => setDatePickerOpen(false)}
      />
      <ConfirmationDialog
        visible={confirmingPayment}
        title="Xác nhận thanh toán"
        description={`Bạn xác nhận thanh toán ${money(selectedPlan?.finalPrice)} cho gói ${selectedPlan?.name ?? "đã chọn"}? Lịch cố định sẽ được chốt ngay khi giao dịch thành công.`}
        confirmLabel="Thanh toán"
        cancelLabel="Quay lại"
        onCancel={() => setConfirmingPayment(false)}
        onConfirm={submit}
      />
      <CancellableLoadingOverlay
        visible={purchase.isPending}
        message="Đang thanh toán và chốt lịch học..."
        cancelLabel="Hủy thanh toán"
        onCancel={() => purchaseAbortController.current?.abort()}
      />
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <ThemedText type="subtitle">{title}</ThemedText>
      {children}
    </View>
  );
}

function RowIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <View style={styles.rowIcon}>
      <AppIcon icon={icon as never} size={21} color={Colors.light.primary} />
    </View>
  );
}

function StepChoice({
  icon,
  title,
  subtitle,
  onPress,
  locked = false,
  completed = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  locked?: boolean;
  completed?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: locked, selected: completed }}
      disabled={locked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        locked && styles.disabled,
        completed && styles.choiceComplete,
        pressed && !locked && effects.pressed,
      ]}
    >
      <View style={[styles.choiceIcon, completed && styles.choiceIconComplete]}>
        <AppIcon
          icon={icon as never}
          size={24}
          color={completed ? Colors.light.success : Colors.light.primary}
        />
      </View>
      <View style={styles.flex}>
        <ThemedText type="title" numberOfLines={2}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="bodySmall" style={styles.helper} numberOfLines={3}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      <AppIcon
        icon={<ChevronRight />}
        size={20}
        color={completed ? Colors.light.success : Colors.light.textSecondary}
      />
    </Pressable>
  );
}

function InlineState({
  message,
  loading = false,
  actionLabel,
  onAction,
}: {
  message: string;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <SurfaceCard style={styles.inlineState}>
      {loading ? <ActivityIndicator color={Colors.light.primary} /> : null}
      <ThemedText type="bodySmall" style={styles.helper}>
        {message}
      </ThemedText>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction}>
          <ThemedText type="action" style={styles.primaryText}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </SurfaceCard>
  );
}

function PickerSheetState({
  loading,
  error,
  empty,
  emptyMessage,
  onRetry,
}: {
  loading: boolean;
  error: boolean;
  empty: boolean;
  emptyMessage: string;
  onRetry: () => void;
}) {
  if (loading)
    return (
      <View style={styles.sheetState}>
        <ActivityIndicator color={Colors.light.primary} />
        <ThemedText type="bodySmall" style={styles.helper}>
          Đang tải…
        </ThemedText>
      </View>
    );
  if (error)
    return (
      <View style={styles.sheetState}>
        <ThemedText type="bodySmall" style={styles.error}>
          Không thể tải dữ liệu.
        </ThemedText>
        <Pressable accessibilityRole="button" onPress={onRetry}>
          <ThemedText type="action" style={styles.primaryText}>
            Thử lại
          </ThemedText>
        </Pressable>
      </View>
    );
  if (empty)
    return (
      <View style={styles.sheetState}>
        <ThemedText type="bodySmall" style={styles.helper}>
          {emptyMessage}
        </ThemedText>
      </View>
    );
  return null;
}

function PlanPickerGroup({
  group,
  expanded,
  selectedPlanId,
  onToggle,
  onSelect,
}: {
  group: PlanGroup;
  expanded: boolean;
  selectedPlanId?: string;
  onToggle: () => void;
  onSelect: (plan: TrainingPlanCatalogItem) => void;
}) {
  const variants = [...group.variants].sort(
    (first, second) =>
      first.durationMonths - second.durationMonths ||
      first.includedSessionCount - second.includedSessionCount,
  );

  return (
    <CollapsiblePickerGroup
      title={group.name}
      subtitle={`${levelLabel(group.level)} · ${variants.length} lựa chọn`}
      expanded={expanded}
      accessibilityLabel={`gói ${group.name}`}
      onToggle={onToggle}
    >
      {variants.map((plan, index) => {
        const selected = plan.trainingPlanId === selectedPlanId;
        return (
          <View
            key={plan.trainingPlanId}
            style={index > 0 ? styles.planVariantDivider : undefined}
          >
            <AdminListRow
              title={`${plan.durationMonths} tháng · ${plan.includedSessionCount} buổi`}
              subtitle={
                plan.basePrice !== plan.finalPrice
                  ? `Giá gốc ${money(plan.basePrice)}`
                  : ""
              }
              selected={selected}
              onPress={() => onSelect(plan)}
              leading={<RowIcon icon={<Calendar />} />}
              meta={
                <ThemedText type="title" style={styles.planVariantPrice}>
                  {money(plan.finalPrice)}
                </ThemedText>
              }
            />
          </View>
        );
      })}
    </CollapsiblePickerGroup>
  );
}

function CollapsiblePickerGroup({
  title,
  subtitle,
  expanded,
  accessibilityLabel,
  onToggle,
  children,
}: {
  title: string;
  subtitle: string;
  expanded: boolean;
  accessibilityLabel: string;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.planGroup}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${expanded ? "Thu gọn" : "Mở rộng"} ${accessibilityLabel}`}
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={({ pressed }) => [
          styles.planGroupHeader,
          pressed && effects.pressed,
        ]}
      >
        <View style={styles.planGroupCopy}>
          <ThemedText type="title" numberOfLines={1}>
            {title}
          </ThemedText>
          <ThemedText type="bodySmall" style={styles.helper}>
            {subtitle}
          </ThemedText>
        </View>
        <AppIcon
          icon={expanded ? <ChevronUp /> : <ChevronDown />}
          size={22}
          color={Colors.light.text}
        />
      </Pressable>
      {expanded ? <View style={styles.planGroupVariants}>{children}</View> : null}
    </View>
  );
}

function ScheduleSheet({
  requirement,
  selectedIds,
  onClose,
  onToggle,
}: {
  requirement?: {
    requirementId: string;
    sessionType: SessionType;
    label: string;
    sessionsPerWeek: number;
    options: TrainingPlanScheduleOption[];
  };
  selectedIds: string[];
  onClose: () => void;
  onToggle: (requirementId: string, limit: number, optionId: string) => void;
}) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(),
  );
  const scheduleGroups = useMemo(
    () => groupScheduleOptions(requirement?.options ?? []),
    [requirement?.options],
  );
  if (!requirement) return null;
  const full = selectedIds.length === requirement.sessionsPerWeek;
  return (
    <BottomSheetWindow
      visible={Boolean(requirement)}
      title={
        requirement
          ? SessionTypeLabel[requirement.sessionType]
          : "Chọn lịch cố định"
      }
      heightRatio={0.76}
      onClose={onClose}
      footer={
        <FloatingActionBar
          placement="sheet"
          actions={[
            {
              label: full
                ? "Đã chọn đủ · Xong"
                : `Đã chọn ${selectedIds.length}/${requirement?.sessionsPerWeek ?? 0}`,
              disabled: !full,
              onPress: onClose,
            },
          ]}
        />
      }
    >
      <ThemedText type="bodySmall" style={styles.sheetHint}>
        Chọn đúng {requirement?.sessionsPerWeek ?? 0} ca mỗi tuần. Bạn có thể
        tập ghép giữa các khóa được gói cho phép.
      </ThemedText>
      <View style={styles.scheduleGroups}>
        {scheduleGroups.map((group) => (
          <CollapsiblePickerGroup
            key={group.key}
            title={group.courseName}
            subtitle={group.branchName}
            accessibilityLabel={`khóa ${group.courseName}`}
            expanded={expandedGroups.has(group.key)}
            onToggle={() =>
              setExpandedGroups((current) => {
                const next = new Set(current);
                if (next.has(group.key)) next.delete(group.key);
                else next.add(group.key);
                return next;
              })
            }
          >
            {group.options.map((option, index) => {
              const selected = selectedIds.includes(option.courseScheduleId);
              const disabled = !selected && full;
              return (
                <View
                  key={option.courseScheduleId}
                  style={index > 0 ? styles.scheduleOptionDivider : undefined}
                >
                  <AdminListRow
                    title={`${WeekdayLabel[option.dayOfWeek]} · ${formatTimeStringHM(option.startTime)}–${formatTimeStringHM(option.endTime)}`}
                    selected={selected}
                    onPress={
                      disabled
                        ? undefined
                        : () =>
                            onToggle(
                              requirement.requirementId,
                              requirement.sessionsPerWeek,
                              option.courseScheduleId,
                            )
                    }
                    leading={<RowIcon icon={<Calendar />} />}
                  />
                </View>
              );
            })}
          </CollapsiblePickerGroup>
        ))}
      </View>
    </BottomSheetWindow>
  );
}

type ScheduleGroup = {
  key: string;
  courseName: string;
  branchName: string;
  options: TrainingPlanScheduleOption[];
};

function groupScheduleOptions(
  options: TrainingPlanScheduleOption[],
): ScheduleGroup[] {
  const groups = new Map<string, ScheduleGroup>();
  for (const option of options) {
    const group = groups.get(option.courseId) ?? {
      key: option.courseId,
      courseName: option.courseName,
      branchName: option.branchName,
      options: [],
    };
    group.options.push(option);
    groups.set(option.courseId, group);
  }

  return [...groups.values()].map((group) => ({
    ...group,
    options: [...group.options].sort(
      (first, second) =>
        WeekdayCode[first.dayOfWeek] - WeekdayCode[second.dayOfWeek] ||
        first.startTime.localeCompare(second.startTime) ||
        first.endTime.localeCompare(second.endTime),
    ),
  }));
}

function PaymentDetails({
  plan,
  walletBalance,
}: {
  plan: TrainingPlanCatalogItem;
  walletBalance?: number;
}) {
  const discount = Math.max(0, plan.basePrice - plan.finalPrice);
  return (
    <SurfaceCard style={styles.paymentDetails}>
      <View style={styles.paymentLine}>
        <ThemedText type="bodySmall" style={styles.helper}>
          Số dư ví
        </ThemedText>
        <ThemedText type="bodySmall">
          {walletBalance === undefined ? "Đang tải…" : money(walletBalance)}
        </ThemedText>
      </View>
      <View style={styles.paymentLine}>
        <ThemedText type="bodySmall" style={styles.helper}>
          Giá gói học
        </ThemedText>
        <ThemedText type="bodySmall">{money(plan.basePrice)}</ThemedText>
      </View>
      {discount > 0 ? (
        <View style={styles.paymentLine}>
          <ThemedText type="bodySmall" style={styles.helper}>
            Ưu đãi
          </ThemedText>
          <ThemedText type="bodySmall" style={styles.discountAmount}>
            −{money(discount)}
          </ThemedText>
        </View>
      ) : null}
      <View style={styles.paymentDivider} />
      <View style={styles.paymentLine}>
        <ThemedText type="title">Tổng thanh toán</ThemedText>
        <ThemedText type="heading" style={styles.paymentTotalAmount}>
          {money(plan.finalPrice)}
        </ThemedText>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: Spacing.two, paddingBottom: 112, gap: Spacing.four },
  section: { gap: Spacing.two },
  flex: { flex: 1, minWidth: 0, gap: Spacing.one },
  notice: { flexDirection: "row", gap: Spacing.three, padding: Spacing.three },
  noticeIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: Colors.light.primarySoft,
  },
  helper: { color: Colors.light.textSecondary },
  error: { color: Colors.light.error },
  primaryText: { color: Colors.light.primary },
  choice: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.divider,
    borderRadius: radii.lg,
    backgroundColor: Colors.light.surface,
    padding: Spacing.three,
    ...effects.soft,
  },
  choiceComplete: { borderColor: Colors.light.success },
  choiceIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: Colors.light.primarySoft,
  },
  choiceIconComplete: { backgroundColor: Colors.light.successSoft },
  disabled: { opacity: 0.55 },
  inlineState: {
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.three,
  },
  rowIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: Colors.light.primarySoft,
  },
  planGroups: {
    gap: Spacing.two,
  },
  planGroup: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.divider,
    borderRadius: radii.lg,
    backgroundColor: Colors.light.surface,
    ...effects.soft,
  },
  planGroupHeader: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
  },
  planGroupCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },
  planGroupVariants: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.divider,
  },
  planVariantDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.divider,
  },
  planVariantPrice: {
    color: Colors.light.primary,
    textAlign: "right",
  },
  sheetState: {
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  sheetHint: { color: Colors.light.textSecondary, marginBottom: Spacing.two },
  scheduleGroups: {
    gap: Spacing.two,
  },
  scheduleOptionDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.divider,
  },
  paymentDetails: {
    gap: Spacing.three,
    padding: Spacing.four,
  },
  paymentLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  discountAmount: { color: Colors.light.success },
  paymentDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.divider,
  },
  paymentTotalAmount: { color: Colors.light.primary },
  paymentBarContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  paymentBarTotal: { flex: 1, minWidth: 0 },
  paymentBarAmount: { color: Colors.light.primary },
  paymentButton: {
    minWidth: 148,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    paddingHorizontal: Spacing.four,
    backgroundColor: Colors.light.primary,
  },
  paymentButtonDisabled: { backgroundColor: Colors.light.divider },
  paymentButtonText: { color: Colors.light.surface },
});
