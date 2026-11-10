import { useEffect, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import {
  ChevronRight,
  Database,
  Filter,
  InfoCircle,
  User,
  Wallet,
} from "reicon-react-native";

import { TrainingPlanRegistrationScreen } from './TrainingPlanRegistrationScreen';
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { AppIcon } from "@/shared/ui/AppIcon";
import { BottomSheetWindow } from "@/shared/ui/BottomSheetWindow";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, effects, hexToRgba, radii, typography } from "@/theme";
import type { AppIconElement } from "@/theme/icons";

import {
  PrimaryActionButton,
  PurchaseSummary,
  StatusBadge,
  SurfaceCard,
} from "../components/StudentCommercePrimitives";
import {
  usePurchaseCourseRegistration,
  useRegistrationCoursePrices,
  useRegistrationCourseSearch,
  useRegistrationStudentSearch,
} from "../queries/courseRegistrationQueries";
import type {
  CoursePackageView,
  CourseRegistrationCourseView,
  CourseRegistrationStudentView,
  StudentRouteProps,
} from "../types";
import {
  formatVnd,
  getCommerceState,
  getPackage,
  getSelectedCourse,
} from "../utils/studentCommerceUtils";

type RegistrationSearchSheetProps<T> = {
  visible: boolean;
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  items: T[];
  loading: boolean;
  error: unknown;
  emptyText: string;
  placeholder: string;
  renderItem: (item: T) => ReactNode;
  onClose: () => void;
  onRetry?: () => void;
};

function LegacyCourseRegistrationScreen({
  studentCode: _studentCode,
  initialCourseId,
  initialPackageId,
}: StudentRouteProps & {
  initialCourseId?: string;
  initialPackageId?: string;
}) {
  const state = getCommerceState();
  const initialCourse = getSelectedCourse(state.courses, initialCourseId);
  const [studentSheetVisible, setStudentSheetVisible] = useState(false);
  const [courseSheetVisible, setCourseSheetVisible] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [selectedStudent, setSelectedStudent] =
    useState<CourseRegistrationStudentView>();
  const [selectedCourse, setSelectedCourse] = useState<
    CourseRegistrationCourseView | undefined
  >(() => (initialCourse ? { ...initialCourse, schedules: [] } : undefined));
  const [selectedPackage, setSelectedPackage] = useState<
    CoursePackageView | undefined
  >(() =>
    initialPackageId ? getPackage(initialCourse, initialPackageId) : undefined,
  );
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<string[]>([]);

  const studentsQuery = useRegistrationStudentSearch(
    studentSearch,
    studentSheetVisible,
  );
  const coursesQuery = useRegistrationCourseSearch(
    courseSearch,
    courseSheetVisible,
  );
  const pricesQuery = useRegistrationCoursePrices(selectedCourse?.courseId);
  const purchaseMutation = usePurchaseCourseRegistration();

  const fallbackPackages = selectedCourse
    ? (getSelectedCourse(state.courses, selectedCourse.courseId)?.packages ??
      [])
    : [];
  const packageOptions = selectedCourse
    ? (pricesQuery.data ?? fallbackPackages)
    : [];
  const selectedPrice = selectedPackage?.amount ?? 0;
  const balance = state.wallet.balance;
  const canConfirm = Boolean(
    selectedStudent &&
    selectedCourse &&
    selectedPackage &&
    ((selectedCourse.schedules?.length ?? 0) === 0 ||
      selectedScheduleIds.length > 0) &&
    !purchaseMutation.isPending,
  );

  return (
    <>
      <StackScreenLayout
        title="Đăng ký khóa học"
        contentContainerStyle={styles.content}
      >
        <Section title="Học viên">
          <StudentSelectCard
            student={selectedStudent}
            onPress={() => setStudentSheetVisible(true)}
          />
        </Section>

        {selectedStudent ? <WalletBalanceCard amount={balance} /> : null}

        <RegistrationNotice activeCourseCount={2} />

        <Section title="Khóa học">
          <CourseSelectCard
            course={selectedCourse}
            onPress={() => setCourseSheetVisible(true)}
          />
        </Section>

        <Section title="Chọn gói học">
          <PackageGrid
            packages={packageOptions}
            selectedPackageId={selectedPackage?.id}
            loading={pricesQuery.isLoading && packageOptions.length === 0}
            disabled={!selectedCourse}
            onSelect={setSelectedPackage}
          />
        </Section>

        <Section title="Chọn lịch học">
          <ScheduleSelection
            schedules={selectedCourse?.schedules ?? []}
            selectedIds={selectedScheduleIds}
            disabled={!selectedCourse}
            onChange={setSelectedScheduleIds}
          />
        </Section>

        <PurchaseSummary
          balance={balance}
          price={selectedPrice}
          balanceAfter={balance - selectedPrice}
        />

        {purchaseMutation.isError ? (
          <ThemedText type="bodySmall" style={styles.errorText}>
            Không thể xác nhận đăng ký. Vui lòng thử lại.
          </ThemedText>
        ) : null}

        <PrimaryActionButton
          title="Xác nhận đăng ký"
          disabled={!canConfirm}
          loading={purchaseMutation.isPending}
          onPress={() => {
            if (!selectedStudent || !selectedPackage) return;
            purchaseMutation.mutate({
              studentPersonId: selectedStudent.personId,
              coursePriceId: selectedPackage.id,
              courseScheduleIds: selectedScheduleIds,
              externalReference: `MOBILE-${Date.now()}`,
              note: selectedCourse
                ? `Đăng ký ${selectedCourse.courseName}`
                : undefined,
            });
          }}
        />
      </StackScreenLayout>

      <RegistrationSearchSheet
        visible={studentSheetVisible}
        title="Chọn học viên"
        searchValue={studentSearch}
        onSearchChange={setStudentSearch}
        items={studentsQuery.data ?? []}
        loading={studentsQuery.isFetching}
        error={studentsQuery.error}
        emptyText="Không tìm thấy học viên phù hợp."
        placeholder="Tìm tên hoặc mã học viên..."
        onClose={() => setStudentSheetVisible(false)}
        onRetry={() => studentsQuery.refetch()}
        renderItem={(student) => (
          <StudentOptionRow
            student={student}
            selected={student.personId === selectedStudent?.personId}
            onPress={() => {
              setSelectedStudent(student);
              setStudentSheetVisible(false);
            }}
          />
        )}
      />

      <RegistrationSearchSheet
        visible={courseSheetVisible}
        title="Chọn khóa học"
        searchValue={courseSearch}
        onSearchChange={setCourseSearch}
        items={coursesQuery.data ?? []}
        loading={coursesQuery.isFetching}
        error={coursesQuery.error}
        emptyText="Không tìm thấy khóa học đang mở đăng ký."
        placeholder="Tìm tên khóa học..."
        onClose={() => setCourseSheetVisible(false)}
        onRetry={() => coursesQuery.refetch()}
        renderItem={(course) => (
          <CourseOptionRow
            course={course}
            selected={course.courseId === selectedCourse?.courseId}
            onPress={() => {
              setSelectedCourse(course);
              setSelectedPackage(undefined);
              setSelectedScheduleIds([]);
              setCourseSheetVisible(false);
            }}
          />
        )}
      />
    </>
  );
}

/** Compatibility entry point retained for existing course-registration deep links. */
export function StudentCourseRegistrationScreen(
  props: StudentRouteProps & { initialCourseId?: string; initialPackageId?: string },
) {
  return <TrainingPlanRegistrationScreen {...props} />;
}

function ScheduleSelection({
  schedules,
  selectedIds,
  disabled,
  onChange,
}: {
  schedules: CourseRegistrationCourseView["schedules"];
  selectedIds: string[];
  disabled: boolean;
  onChange: (ids: string[]) => void;
}) {
  if (disabled || schedules.length === 0) {
    return (
      <SurfaceCard soft style={styles.scheduleStateCard}>
        <ThemedText type="bodySmall" style={styles.secondaryText}>
          Chọn khóa học để xem các lịch có thể đăng ký.
        </ThemedText>
      </SurfaceCard>
    );
  }
  return (
    <View style={styles.scheduleList}>
      {schedules.map((schedule) => {
        const selected = selectedIds.includes(schedule.courseScheduleId);
        return (
          <Pressable
            key={schedule.courseScheduleId}
            accessibilityRole="checkbox"
            accessibilityLabel={`Chọn lịch ${schedule.label}`}
            accessibilityState={{ checked: selected }}
            onPress={() =>
              onChange(
                selected
                  ? selectedIds.filter((id) => id !== schedule.courseScheduleId)
                  : [...selectedIds, schedule.courseScheduleId],
              )
            }
            style={({ pressed }) => [
              styles.scheduleRow,
              selected ? styles.scheduleRowSelected : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <View
              style={[
                styles.checkbox,
                selected ? styles.checkboxSelected : null,
              ]}
            >
              {selected ? <View style={styles.checkboxDot} /> : null}
            </View>
            <ThemedText type="bodySmall" style={styles.blackText}>
              {schedule.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="heading" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

function StudentSelectCard({
  student,
  onPress,
}: {
  student?: CourseRegistrationStudentView;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Chọn học viên"
      onPress={onPress}
      style={({ pressed }) => [pressed ? styles.pressed : null]}
    >
      <SurfaceCard style={styles.selectCard}>
        <IconCircle icon={<User weight="Filled" />} />
        <View style={styles.flex}>
          {student ? (
            <>
              <ThemedText
                type="title"
                numberOfLines={1}
                style={styles.blackText}
              >
                {student.fullName}
              </ThemedText>
              <ThemedText
                type="bodySmall"
                numberOfLines={1}
                style={styles.secondaryText}
              >
                {student.personCode} · {student.beltLabel}
              </ThemedText>
            </>
          ) : (
            <>
              <ThemedText type="title" style={styles.placeholderTitle}>
                Chọn học viên
              </ThemedText>
              <ThemedText type="bodySmall" style={styles.secondaryText}>
                Vui lòng chọn học viên để đăng ký khóa học.
              </ThemedText>
            </>
          )}
        </View>
        {student ? <StatusBadge label={student.statusLabel} /> : null}
        <AppIcon
          icon={<ChevronRight />}
          width={10}
          height={18}
          color={Colors.light.text}
        />
      </SurfaceCard>
    </Pressable>
  );
}

function CourseSelectCard({
  course,
  onPress,
}: {
  course?: CourseRegistrationCourseView;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Chọn khóa học"
      onPress={onPress}
      style={({ pressed }) => [pressed ? styles.pressed : null]}
    >
      <SurfaceCard style={styles.courseSelectCard}>
        <IconCircle icon={<Database weight="Filled" />} size={44} />
        <View style={styles.flex}>
          <ThemedText
            type="title"
            numberOfLines={2}
            style={course ? styles.blackText : styles.placeholderTitle}
          >
            {course
              ? `${course.courseName}${course.branchName ? ` · ${course.branchName}` : ""}`
              : "Chọn khóa học"}
          </ThemedText>
          {!course ? (
            <ThemedText type="bodySmall" style={styles.secondaryText}>
              Chọn khóa học trước khi chọn gói.
            </ThemedText>
          ) : null}
        </View>
        <AppIcon
          icon={<ChevronRight />}
          width={10}
          height={18}
          color={Colors.light.textSecondary}
        />
      </SurfaceCard>
    </Pressable>
  );
}

function WalletBalanceCard({ amount }: { amount: number }) {
  return (
    <SurfaceCard style={styles.balanceCard}>
      <IconCircle icon={<Wallet />} />
      <View style={styles.flex}>
        <ThemedText type="bodySmall" style={styles.secondaryText}>
          Số dư ví
        </ThemedText>
        <ThemedText type="heading" style={styles.balanceAmount}>
          {formatVnd(amount)}
        </ThemedText>
      </View>
    </SurfaceCard>
  );
}

function RegistrationNotice({
  activeCourseCount,
}: {
  activeCourseCount: number;
}) {
  return (
    <View style={styles.notice}>
      <AppIcon icon={<InfoCircle />} size={25} color={Colors.light.primary} />
      <View style={styles.flex}>
        <ThemedText type="title" style={styles.noticeTitle}>
          Có thể học nhiều khóa cùng lúc
        </ThemedText>
        <ThemedText type="bodySmall" style={styles.noticeText}>
          Đăng ký này sẽ thêm một khóa học mới, không thay thế{" "}
          {activeCourseCount} khóa học đang học.
        </ThemedText>
      </View>
    </View>
  );
}

function PackageGrid({
  packages,
  selectedPackageId,
  loading,
  disabled,
  onSelect,
}: {
  packages: CoursePackageView[];
  selectedPackageId?: string;
  loading: boolean;
  disabled: boolean;
  onSelect: (item: CoursePackageView) => void;
}) {
  if (loading) {
    return (
      <SurfaceCard soft style={styles.packageStateCard}>
        <ActivityIndicator color={Colors.light.primary} />
        <ThemedText type="bodySmall" style={styles.secondaryText}>
          Đang tải gói học...
        </ThemedText>
      </SurfaceCard>
    );
  }

  if (disabled || packages.length === 0) {
    return (
      <View style={styles.packageGrid}>
        {[0, 1].map((index) => (
          <SurfaceCard key={index} soft style={styles.packageCard}>
            <ThemedText type="bodySmall" style={styles.secondaryText}>
              Chưa có gói học
            </ThemedText>
            <ThemedText type="heading" style={styles.emptyPackageValue}>
              --
            </ThemedText>
          </SurfaceCard>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.packageGrid}>
      {packages.map((item) => {
        const selected = item.id === selectedPackageId;
        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`Chọn gói ${item.label}`}
            accessibilityState={{ selected }}
            onPress={() => onSelect(item)}
            style={({ pressed }) => [
              styles.packagePressable,
              pressed ? styles.pressed : null,
            ]}
          >
            <SurfaceCard
              style={[
                styles.packageCard,
                selected ? styles.packageCardSelected : null,
              ]}
            >
              <View style={styles.radioRow}>
                <ThemedText type="bodySmall" style={styles.packageLabel}>
                  {item.label}
                </ThemedText>
                <View
                  style={[styles.radio, selected ? styles.radioSelected : null]}
                >
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
              </View>
              <ThemedText type="heading" style={styles.packagePrice}>
                {formatVnd(item.amount)}
              </ThemedText>
              {selected ? (
                <View style={styles.selectedPill}>
                  <ThemedText type="action" style={styles.selectedPillText}>
                    Đã chọn
                  </ThemedText>
                </View>
              ) : null}
            </SurfaceCard>
          </Pressable>
        );
      })}
    </View>
  );
}

function RegistrationSearchSheet<T>({
  visible,
  title,
  searchValue,
  onSearchChange,
  items,
  loading,
  error,
  emptyText,
  placeholder,
  renderItem,
  onClose,
  onRetry,
}: RegistrationSearchSheetProps<T>) {
  const [prevVisible, setPrevVisible] = useState(visible);
  const [prevSearchValue, setPrevSearchValue] = useState(searchValue);
  const [draftSearch, setDraftSearch] = useState(searchValue);
  const debouncedSearch = useDebounce(draftSearch, 400);

  if (visible !== prevVisible || searchValue !== prevSearchValue) {
    setPrevVisible(visible);
    setPrevSearchValue(searchValue);
    if (visible) {
      setDraftSearch(searchValue);
    }
  }

  useEffect(() => {
    if (visible) {
      onSearchChange(debouncedSearch.trim());
    }
  }, [debouncedSearch, onSearchChange, visible]);

  return (
    <BottomSheetWindow
      visible={visible}
      title={title}
      heightRatio={0.72}
      onClose={onClose}
    >
      <View style={styles.sheetBody}>
        <View style={styles.searchBox}>
          <AppIcon
            icon={<Filter />}
            size={18}
            color={Colors.light.textSecondary}
          />
          <TextInput
            value={draftSearch}
            onChangeText={setDraftSearch}
            placeholder={placeholder}
            placeholderTextColor={Colors.light.textSecondary}
            returnKeyType="search"
            style={styles.searchInput}
          />
        </View>

        {loading ? (
          <View style={styles.sheetState}>
            <ActivityIndicator color={Colors.light.primary} />
            <ThemedText type="bodySmall" style={styles.secondaryText}>
              Đang tìm kiếm...
            </ThemedText>
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.sheetState}>
            <ThemedText type="bodySmall" style={styles.errorText}>
              Không thể tải dữ liệu.
            </ThemedText>
            {onRetry ? (
              <Pressable
                accessibilityRole="button"
                onPress={onRetry}
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed ? styles.pressed : null,
                ]}
              >
                <ThemedText type="action" style={styles.retryText}>
                  Thử lại
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <View style={styles.sheetState}>
            <ThemedText type="bodySmall" style={styles.secondaryText}>
              {emptyText}
            </ThemedText>
          </View>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <View style={styles.optionList}>
            {items.map((item, index) => (
              <View key={index}>{renderItem(item)}</View>
            ))}
          </View>
        ) : null}
      </View>
    </BottomSheetWindow>
  );
}

function StudentOptionRow({
  student,
  selected,
  onPress,
}: {
  student: CourseRegistrationStudentView;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Chọn học viên ${student.fullName}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [pressed ? styles.pressed : null]}
    >
      <SurfaceCard
        soft
        style={selected ? styles.optionCardSelected : styles.optionCard}
      >
        {student.faceImagePath ? (
          <Image source={{ uri: student.faceImagePath }} style={styles.avatarImage} />
        ) : (
          <IconCircle icon={<User weight="Filled" />} size={44} />
        )}
        <View style={styles.flex}>
          <ThemedText type="title" numberOfLines={1} style={styles.blackText}>
            {student.fullName}
          </ThemedText>
          <ThemedText
            type="bodySmall"
            numberOfLines={1}
            style={styles.secondaryText}
          >
            {student.personCode}
          </ThemedText>
        </View>
        <StatusBadge label={student.beltLabel} />
      </SurfaceCard>
    </Pressable>
  );
}

function CourseOptionRow({
  course,
  selected,
  onPress,
}: {
  course: CourseRegistrationCourseView;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Chọn khóa học ${course.courseName}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [pressed ? styles.pressed : null]}
    >
      <SurfaceCard
        soft
        style={selected ? styles.optionCardSelected : styles.optionCard}
      >
        <IconCircle icon={<Database weight="Filled" />} size={44} />
        <View style={styles.flex}>
          <ThemedText type="title" numberOfLines={1} style={styles.blackText}>
            {course.courseName}
          </ThemedText>
          <ThemedText
            type="bodySmall"
            numberOfLines={1}
            style={styles.secondaryText}
          >
            {[course.branchName, course.scheduleLabel]
              .filter(Boolean)
              .join(" · ")}
          </ThemedText>
        </View>
        <StatusBadge label={course.statusLabel} />
        <AppIcon
          icon={<ChevronRight />}
          width={10}
          height={18}
          color={Colors.light.textSecondary}
        />
      </SurfaceCard>
    </Pressable>
  );
}

function IconCircle({
  icon,
  size = 52,
}: {
  icon: AppIconElement;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.iconCircle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <AppIcon
        icon={icon}
        size={Math.round(size * 0.5)}
        color={Colors.light.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: Colors.light.text,
  },
  selectCard: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  courseSelectCard: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  balanceCard: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  flex: {
    flex: 1,
    minWidth: 0,
  },
  iconCircle: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: hexToRgba(Colors.light.primary, 0.08),
  },
  blackText: {
    color: Colors.light.text,
  },
  secondaryText: {
    color: Colors.light.textSecondary,
  },
  placeholderTitle: {
    color: Colors.light.textSecondary,
  },
  balanceAmount: {
    color: Colors.light.text,
    fontSize: 24,
    lineHeight: 32,
  },
  notice: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: hexToRgba(Colors.light.primary, 0.25),
    borderRadius: radii.md,
    backgroundColor: hexToRgba(Colors.light.primary, 0.04),
    padding: 14,
  },
  noticeTitle: {
    color: Colors.light.primary,
  },
  noticeText: {
    color: Colors.light.textSecondary,
  },
  packageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  scheduleList: {
    gap: 10,
  },
  scheduleStateCard: {
    minHeight: 68,
    justifyContent: "center",
  },
  scheduleRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.divider,
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 14,
  },
  scheduleRowSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: hexToRgba(Colors.light.primary, 0.05),
  },
  checkbox: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.light.divider,
  },
  checkboxSelected: {
    borderColor: Colors.light.primary,
  },
  checkboxDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: Colors.light.primary,
  },
  packagePressable: {
    flexGrow: 1,
    flexBasis: "46%",
    minWidth: 144,
  },
  packageCard: {
    minHeight: 120,
    gap: 12,
    flex: 1,
  },
  packageCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: hexToRgba(Colors.light.primary, 0.05),
  },
  packageStateCard: {
    minHeight: 96,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  radioRow: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  packageLabel: {
    flex: 1,
    color: Colors.light.text,
  },
  packagePrice: {
    color: Colors.light.text,
  },
  emptyPackageValue: {
    color: Colors.light.textSecondary,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.light.divider,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: Colors.light.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
  },
  selectedPill: {
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: hexToRgba(Colors.light.primary, 0.22),
    backgroundColor: hexToRgba(Colors.light.primary, 0.08),
    paddingHorizontal: 12,
  },
  selectedPillText: {
    color: Colors.light.primary,
  },
  sheetBody: {
    gap: 14,
    paddingVertical: 18,
  },
  searchBox: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.divider,
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 12,
    ...effects.soft,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: Colors.light.text,
    paddingVertical: 0,
    ...typography.bodySmall,
  },
  sheetState: {
    minHeight: 112,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  optionList: {
    gap: 10,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionCardSelected: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderColor: Colors.light.primary,
    backgroundColor: hexToRgba(Colors.light.primary, 0.05),
  },
  retryButton: {
    minHeight: 40,
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.primary,
    paddingHorizontal: 16,
  },
  retryText: {
    color: Colors.light.primary,
  },
  errorText: {
    color: Colors.light.primary,
  },
  pressed: {
    opacity: 0.75,
  },
});
