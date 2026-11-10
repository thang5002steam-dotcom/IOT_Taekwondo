import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StyleSheet,
  View,
} from "react-native";
import { Calendar, Tuning, X } from "reicon-react-native";

import { DefaultHeaderActions } from "@/routes/navigation/components/DefaultHeaderActions";
import { HeaderActionButton } from "@/routes/navigation/components/HeaderActionButton";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { AppIcon } from "@/shared/ui/AppIcon";
import { BottomSheetWindow } from "@/shared/ui/BottomSheetWindow";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, radii } from "@/theme";

import { HistoryRecordCard } from "../components/HistoryRecordCard";
import { HistorySelectSheet } from "../components/HistorySelectSheet";
import { TrainingScoreFloatingButton } from "../components/TrainingScoreFloatingButton";
import { TrainingScoreSheet } from "../components/TrainingScoreSheet";
import { getMockHistoryRecords } from "../data/history.mock";
import type { AttendanceHistoryMode } from "../domain/historyAccess";
import {
  getCurrentCalendarQuarter,
  getCurrentCalendarYear,
  type CalendarQuarter,
} from "../domain/historyDateRange";
import { useAttendanceHistoryQuery } from "../hooks/useAttendanceHistoryQuery";
import {
  HistoryFilterActions,
  HistoryFilterContent,
} from "./AttendanceHistoryScreen/HistoryFilterContent";
import { HistoryPeriodSearchForm } from "./AttendanceHistoryScreen/HistoryPeriodSearchForm";
import {
  emptyHistoryFilters,
  getHistoryFilterDateRange,
  getHistoryFilterGroups,
  groupHistoryRecordsByDate,
} from "./AttendanceHistoryScreen/historyFilter.logic";
import type { HistoryFilterState } from "./AttendanceHistoryScreen/historyFilter.types";

type AttendanceHistoryScreenProps = {
  mode: AttendanceHistoryMode;
  initialCourseId?: string;
  initialCourseName?: string;
  initialFrom?: string;
  initialTo?: string;
};

type PickerType = "year" | "quarter" | null;

const SHEET_HANDOFF_DELAY_MS = 140;

function getInitialYear(value?: string) {
  if (!value) return undefined;
  const year = Number(value.slice(0, 4));
  return Number.isFinite(year) ? year : undefined;
}

function getInitialQuarter(value?: string): CalendarQuarter | undefined {
  if (!value) return undefined;
  const month = Number(value.slice(5, 7));
  if (!Number.isFinite(month) || month < 1 || month > 12) return undefined;
  return (Math.floor((month - 1) / 3) + 1) as CalendarQuarter;
}

function ActiveCourseScopeBanner({
  courseName,
  onClear,
}: {
  courseName?: string;
  onClear: () => void;
}) {
  return (
    <View style={styles.courseScopeBanner}>
      <View style={styles.courseScopeContent}>
        <ThemedText type="caption" style={styles.courseScopeLabel}>
          Đang lọc theo khóa học
        </ThemedText>
        <ThemedText
          type="subtitle"
          numberOfLines={1}
          style={styles.courseScopeName}
        >
          {courseName || "Khóa học đã chọn"}
        </ThemedText>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Xem tất cả khóa học"
        onPress={onClear}
        style={({ pressed }) => [
          styles.courseScopeClearButton,
          pressed ? styles.pressed : null,
        ]}
      >
        <ThemedText type="bodySmall" style={styles.courseScopeClearText}>
          Xem tất cả
        </ThemedText>
        <AppIcon icon={<X />} size={13} color={Colors.light.primary} />
      </Pressable>
    </View>
  );
}

export default function AttendanceHistoryScreen({
  mode,
  initialCourseId,
  initialCourseName,
  initialFrom,
  initialTo,
}: AttendanceHistoryScreenProps) {
  const [activeCourseId, setActiveCourseId] = useState<string | undefined>(
    initialCourseId,
  );
  const [activeCourseName, setActiveCourseName] = useState<string | undefined>(
    initialCourseName,
  );
  const initialYear = getInitialYear(initialFrom);
  const initialQuarter = getInitialQuarter(initialFrom);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    initialYear ?? getCurrentCalendarYear,
  );
  const [selectedQuarter, setSelectedQuarter] = useState<
    CalendarQuarter | undefined
  >(initialQuarter ?? getCurrentCalendarQuarter);
  const [picker, setPicker] = useState<PickerType>(null);
  const [quarterError, setQuarterError] = useState<string | null>(null);
  const [filters, setFilters] =
    useState<HistoryFilterState>(emptyHistoryFilters);
  const [draftFilters, setDraftFilters] =
    useState<HistoryFilterState>(emptyHistoryFilters);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);
  const initialDateRange =
    initialFrom && initialTo ? { from: initialFrom, to: initialTo } : undefined;
  const [routeDateRange, setRouteDateRange] = useState(initialDateRange);
  const hasInitialServerFilter = Boolean(activeCourseId && initialDateRange);
  const [hasSearched, setHasSearched] = useState(hasInitialServerFilter);
  const historyActive = hasSearched || hasInitialServerFilter;
  const [scoreVisible, setScoreVisible] = useState(false);
  const handoffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const records = useMemo(() => getMockHistoryRecords(mode), [mode]);
  const filterGroups = useMemo(
    () => getHistoryFilterGroups(records),
    [records],
  );
  const appliedCount =
    filters.branchIds.length +
    filters.shifts.length +
    filters.weekdays.length +
    filters.scheduleLevels.length +
    filters.locations.length;
  const canSearch = Boolean(selectedYear && selectedQuarter);
  const searchEnabled = canSearch && !hasSearched;

  const {
    records: visibleRecords,
    isLoading,
    isError,
    strategy,
    refetch,
  } = useAttendanceHistoryQuery({
    mode,
    filters,
    courseId: activeCourseId,
    dateRangeOverride: routeDateRange,
    enabled: historyActive,
  });

  const handleClearCourseScope = () => {
    setActiveCourseId(undefined);
    setActiveCourseName(undefined);
  };

  const groupedRecords = useMemo(
    () => groupHistoryRecordsByDate(visibleRecords, mode),
    [visibleRecords, mode],
  );

  const sections = useMemo(
    () =>
      groupedRecords.map((group) => ({
        dateLabel: group.dateLabel,
        formattedDateHeader: group.formattedDateHeader,
        countLabel: group.countLabel,
        data: group.records,
      })),
    [groupedRecords],
  );

  const isStickyHeaderEnabled = strategy === "server-filter";

  const selectedRange = historyActive
    ? routeDateRange ?? getHistoryFilterDateRange(filters)
    : null;
  const title = mode === "student"
    ? "Điểm danh"
    : "Chấm công";
  const filterLabel =
    mode === "student" ? "Lọc lịch sử điểm danh" : "Lọc lịch sử chấm công";

  useEffect(
    () => () => {
      if (handoffTimerRef.current) {
        clearTimeout(handoffTimerRef.current);
      }
    },
    [],
  );

  const closePicker = () => {
    if (handoffTimerRef.current) {
      clearTimeout(handoffTimerRef.current);
    }
    setPicker(null);
  };

  const openQuarterPickerAfterHandoff = () => {
    if (handoffTimerRef.current) {
      clearTimeout(handoffTimerRef.current);
    }

    setPicker(null);
    handoffTimerRef.current = setTimeout(() => {
      setPicker("quarter");
    }, SHEET_HANDOFF_DELAY_MS);
  };

  const handleYearPress = () => {
    setQuarterError(null);
    setPicker("year");
  };

  const handleQuarterPress = () => {
    if (!selectedYear) {
      setQuarterError("Vui lòng chọn năm học trước");
      return;
    }

    setQuarterError(null);
    setPicker("quarter");
  };

  const openFilter = () => {
    setDraftFilters(filters);
    setFilterError(null);
    setFilterVisible(true);
  };

  const handleResetFilters = () => {
    setDraftFilters({
      ...emptyHistoryFilters,
      year: selectedYear,
      quarter: selectedQuarter,
    });
    setFilterError(null);
  };

  const handleApplyFilters = () => {
    setFilters(draftFilters);
    setHasSearched(true);
    setFilterError(null);
    setFilterVisible(false);
  };

  const handleSearch = () => {
    if (!selectedYear || !selectedQuarter) return;

    const nextFilters = {
      ...emptyHistoryFilters,
      year: selectedYear,
      quarter: selectedQuarter,
    };

    setFilters(nextFilters);
    setDraftFilters(nextFilters);
    setRouteDateRange(undefined);
    setHasSearched(true);
    setFilterError(null);
  };

  return (
    <>
      <StackScreenLayout
        title={title}
        scrollEnabled={!isStickyHeaderEnabled}
        rightActions={
          <>
            {historyActive ? (
              <HeaderActionButton
                icon={<Tuning />}
                label={filterLabel}
                badge={appliedCount || undefined}
                onPress={openFilter}
                testID="attendance-history-filter-button"
              />
            ) : null}
            <DefaultHeaderActions />
          </>
        }
        contentContainerStyle={styles.content}
        floatingContent={
          historyActive && mode === "student" ? (
            <TrainingScoreFloatingButton
              onPress={() => setScoreVisible(true)}
            />
          ) : undefined
        }
      >
        {isStickyHeaderEnabled ? (
          <SectionList
            sections={historyActive && visibleRecords.length ? sections : []}
            keyExtractor={(item) => item.id}
            stickySectionHeadersEnabled
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sectionListContent}
            ListHeaderComponent={
              <View style={styles.formContainer}>
                {activeCourseId ? (
                  <ActiveCourseScopeBanner
                    courseName={activeCourseName}
                    onClear={handleClearCourseScope}
                  />
                ) : null}
                <HistoryPeriodSearchForm
                  selectedYear={selectedYear}
                  selectedQuarter={selectedQuarter}
                  quarterError={quarterError}
                  searchEnabled={searchEnabled}
                  selectedRange={selectedRange}
                  onYearPress={handleYearPress}
                  onQuarterPress={handleQuarterPress}
                  onSearch={handleSearch}
                />
                {historyActive && isLoading ? (
                  <View style={styles.centerContainer}>
                    <ActivityIndicator
                      size="large"
                      color={Colors.light.primary}
                    />
                    <ThemedText type="bodySmall" style={styles.loadingText}>
                      Đang tải dữ liệu...
                    </ThemedText>
                  </View>
                ) : historyActive && isError ? (
                  <View style={styles.centerContainer}>
                    <ThemedText type="body" style={styles.emptyTitle}>
                      Không thể tải dữ liệu lịch sử
                    </ThemedText>
                    <ThemedText
                      type="bodySmall"
                      style={styles.emptyDescription}
                    >
                      Đã xảy ra lỗi trong quá trình tải. Vui lòng thử lại.
                    </ThemedText>
                    <Pressable
                      style={styles.retryButton}
                      onPress={() => refetch()}
                    >
                      <ThemedText type="bodySmall" style={styles.retryText}>
                        Thử lại
                      </ThemedText>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            }
            renderSectionHeader={({ section }) => (
              <View style={styles.stickySectionHeader}>
                <View style={styles.dateHeaderLeft}>
                  <AppIcon
                    icon={<Calendar />}
                    size={18}
                    color={Colors.light.primary}
                  />
                  <ThemedText type="subtitle" style={styles.dateHeaderText}>
                    {section.formattedDateHeader}
                  </ThemedText>
                </View>
                <View style={styles.countBadge}>
                  <ThemedText type="bodySmall" style={styles.countBadgeText}>
                    {section.countLabel}
                  </ThemedText>
                </View>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={styles.cardItemWrapper}>
                <HistoryRecordCard record={item} />
              </View>
            )}
            ListEmptyComponent={
              historyActive && !isLoading && !isError ? (
                <View style={styles.emptyState}>
                  <ThemedText type="body" style={styles.emptyTitle}>
                    Không có lịch sử phù hợp
                  </ThemedText>
                  <ThemedText type="bodySmall" style={styles.emptyDescription}>
                    Thử đổi cơ sở, ca hoặc kỳ lọc để xem thêm kết quả.
                  </ThemedText>
                </View>
              ) : null
            }
          />
        ) : (
          <>
            {activeCourseId ? (
              <ActiveCourseScopeBanner
                courseName={activeCourseName}
                onClear={handleClearCourseScope}
              />
            ) : null}
            <HistoryPeriodSearchForm
              selectedYear={selectedYear}
              selectedQuarter={selectedQuarter}
              quarterError={quarterError}
              searchEnabled={searchEnabled}
              selectedRange={selectedRange}
              onYearPress={handleYearPress}
              onQuarterPress={handleQuarterPress}
              onSearch={handleSearch}
            />

            {historyActive ? (
              isLoading ? (
                <View style={styles.centerContainer}>
                  <ActivityIndicator
                    size="large"
                    color={Colors.light.primary}
                  />
                  <ThemedText type="bodySmall" style={styles.loadingText}>
                    Đang tải dữ liệu...
                  </ThemedText>
                </View>
              ) : isError ? (
                <View style={styles.centerContainer}>
                  <ThemedText type="body" style={styles.emptyTitle}>
                    Không thể tải dữ liệu lịch sử
                  </ThemedText>
                  <ThemedText type="bodySmall" style={styles.emptyDescription}>
                    Đã xảy ra lỗi trong quá trình tải. Vui lòng thử lại.
                  </ThemedText>
                  <Pressable
                    style={styles.retryButton}
                    onPress={() => refetch()}
                  >
                    <ThemedText type="bodySmall" style={styles.retryText}>
                      Thử lại
                    </ThemedText>
                  </Pressable>
                </View>
              ) : visibleRecords.length ? (
                <View style={styles.list}>
                  {groupedRecords.map((group) => (
                    <View
                      key={group.dateLabel}
                      style={styles.dateGroupContainer}
                    >
                      <View style={styles.dateHeaderRow}>
                        <AppIcon
                          icon={<Calendar />}
                          size={18}
                          color={Colors.light.primary}
                        />
                        <ThemedText
                          type="subtitle"
                          style={styles.dateHeaderText}
                        >
                          {group.formattedDateHeader}
                        </ThemedText>
                        <View style={styles.dateDivider} />
                        <View style={styles.countBadge}>
                          <ThemedText
                            type="bodySmall"
                            style={styles.countBadgeText}
                          >
                            {group.countLabel}
                          </ThemedText>
                        </View>
                      </View>
                      <View style={styles.dateGroupCards}>
                        {group.records.map((record) => (
                          <HistoryRecordCard key={record.id} record={record} />
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <ThemedText type="body" style={styles.emptyTitle}>
                    Không có lịch sử phù hợp
                  </ThemedText>
                  <ThemedText type="bodySmall" style={styles.emptyDescription}>
                    Thử đổi cơ sở, ca hoặc kỳ lọc để xem thêm kết quả.
                  </ThemedText>
                </View>
              )
            ) : null}
          </>
        )}
      </StackScreenLayout>

      <HistorySelectSheet
        visible={picker === "year"}
        title="Chọn năm học"
        options={filterGroups.years.options}
        selectedValue={selectedYear}
        onClose={closePicker}
        onPreviewSelect={(year) => {
          setSelectedYear(year);
          setSelectedQuarter(undefined);
          setQuarterError(null);
          setRouteDateRange(undefined);
          setHasSearched(false);
          setFilters(emptyHistoryFilters);
          setDraftFilters(emptyHistoryFilters);
        }}
        onSelect={openQuarterPickerAfterHandoff}
      />

      <HistorySelectSheet
        visible={picker === "quarter"}
        title="Chọn quý"
        options={filterGroups.quarters.options}
        selectedValue={selectedQuarter}
        onClose={closePicker}
        onPreviewSelect={(quarter) => {
          setSelectedQuarter(quarter);
          setQuarterError(null);
          setRouteDateRange(undefined);
          setHasSearched(false);
          setFilters(emptyHistoryFilters);
          setDraftFilters(emptyHistoryFilters);
        }}
        onSelect={() => {
          setPicker(null);
        }}
      />

      <BottomSheetWindow
        visible={filterVisible}
        title="Lọc"
        accessibilityLabel={filterLabel}
        backdropAccessibilityLabel="Đóng lọc lịch sử"
        onClose={() => setFilterVisible(false)}
        footer={
          <HistoryFilterActions
            canApply
            onReset={handleResetFilters}
            onApply={handleApplyFilters}
          />
        }
      >
        <HistoryFilterContent
          value={draftFilters}
          multiGroups={filterGroups.multi}
          error={filterError}
          onChange={(next) => {
            setDraftFilters(next);
            setFilterError(null);
          }}
        />
      </BottomSheetWindow>

      <TrainingScoreSheet
        visible={scoreVisible}
        onClose={() => setScoreVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    // paddingTop: 24,
    // marginHorizontal: 20,
    // paddingBottom: 34,
  },
  sectionListContent: {
    paddingBottom: 36,
    paddingTop: 24,
  },
  formContainer: {
    marginBottom: 16,
  },
  list: {
    gap: 28,
    marginTop: 24,
    paddingBottom: 36,
  },
  dateGroupContainer: {
    gap: 14,
  },
  dateHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
    marginBottom: 2,
  },
  dateHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateHeaderText: {
    color: Colors.light.text,
    fontWeight: "600",
  },
  dateDivider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.divider,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: "#F3F4F6",
  },
  countBadgeText: {
    color: Colors.light.primary,
    fontWeight: "600",
  },
  stickySectionHeader: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    backgroundColor: Colors.light.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.divider,
    marginBottom: 12,
  },
  cardItemWrapper: {
    marginBottom: 16,
  },
  dateGroupCards: {
    gap: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 60,
    paddingHorizontal: 18,
  },
  emptyTitle: {
    color: Colors.light.text,
    textAlign: "center",
  },
  emptyDescription: {
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingTop: 60,
    paddingHorizontal: 18,
  },
  loadingText: {
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  courseScopeBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radii.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.divider,
  },
  courseScopeContent: {
    flex: 1,
    marginRight: 12,
  },
  courseScopeLabel: {
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  courseScopeName: {
    color: Colors.light.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
  },
  courseScopeClearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#FEE2E2",
    borderRadius: radii.pill,
  },
  courseScopeClearText: {
    color: Colors.light.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
});
