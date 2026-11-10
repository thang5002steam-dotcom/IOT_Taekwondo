import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";
import { InfoCircle, Plus, Search, Tuning } from "reicon-react-native";

import { ALL_BELTS, BeltLabel } from "@/features/person/constants/person.constants";
import type { Belt, PersonStatus } from "@/features/person/constants/person.constants";
import { useStudents } from "@/features/person/queries/personQueries";
import { StudentListItem } from "@/features/student/components/StudentListItem";
import { PersonCreateSheet } from "@/features/person/components/PersonCreateSheet";
import {
  STUDENT_TABS,
  type StudentListTab,
} from "@/features/student/utils/studentListViewModel";
import { DefaultHeaderActions } from "@/routes/navigation/components/DefaultHeaderActions";
import { HeaderActionButton } from "@/routes/navigation/components/HeaderActionButton";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { AppIcon } from "@/shared/ui/AppIcon";
import { BottomSheetWindow } from "@/shared/ui/BottomSheetWindow";
import {
  FilterSheetActions,
  MultiSelectFilterContent,
  toggleMultiSelectFilterValue,
  type MultiSelectFilterGroup,
} from "@/shared/ui/MultiSelectFilterContent";
import { SegmentedTabs } from "@/shared/ui/commerce/CommercePrimitives";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors } from "@/theme";

export type StudentMultiFilterState = {
  statuses: readonly PersonStatus[];
  genders: readonly ("true" | "false")[];
  belts: readonly Belt[];
};

const emptyStudentFilters: StudentMultiFilterState = {
  statuses: [],
  genders: [],
  belts: [],
};

export function StudentListScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<StudentListTab>("all");
  const [filterVisible, setFilterVisible] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);

  const [filters, setFilters] =
    useState<StudentMultiFilterState>(emptyStudentFilters);
  const [draftFilters, setDraftFilters] =
    useState<StudentMultiFilterState>(emptyStudentFilters);

  const appliedCount =
    filters.statuses.length + filters.genders.length + filters.belts.length;

  const queryStatus: PersonStatus | undefined = useMemo(() => {
    if (filters.statuses.length === 1) return filters.statuses[0];
    if (activeTab === "learning") return "ACTIVE";
    if (activeTab === "paused") return "INACTIVE";
    return undefined;
  }, [activeTab, filters.statuses]);

  const queryGender =
    filters.genders.length === 1 ? filters.genders[0] === "true" : undefined;
  const queryBelt =
    filters.belts.length === 1 ? filters.belts[0] : undefined;

  const trimmedSearch = searchQuery.trim();

  const studentsQuery = useStudents({
    search: trimmedSearch || undefined,
    status: queryStatus,
    gender: queryGender,
    currentBelt: queryBelt,
  });

  const rawStudents = studentsQuery.data?.content ?? [];

  const visibleStudents = useMemo(() => {
    let list = rawStudents;

    // Local search filter as fallback if backend pagination/cache is in flight
    if (trimmedSearch) {
      const q = trimmedSearch.toLowerCase();
      list = list.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          (s.personCode && s.personCode.toLowerCase().includes(q)),
      );
    }

    // Filter by tab when status filter not explicitly set
    if (filters.statuses.length === 0) {
      if (activeTab === "learning") {
        list = list.filter((s) => s.status === "ACTIVE");
      } else if (activeTab === "paused") {
        list = list.filter((s) => s.status !== "ACTIVE");
      }
    } else if (filters.statuses.length > 1) {
      list = list.filter((s) => filters.statuses.includes(s.status));
    }

    // Multiple gender filter
    if (filters.genders.length > 0 && filters.genders.length < 2) {
      const g = filters.genders[0] === "true";
      list = list.filter((s) => Boolean(s.gender) === g);
    }

    // Multiple belt filter
    if (filters.belts.length > 1) {
      list = list.filter((s) => filters.belts.includes(s.currentBelt));
    }

    return list;
  }, [rawStudents, activeTab, filters, trimmedSearch]);

  const openFilter = () => {
    setDraftFilters(filters);
    setFilterVisible(true);
  };

  const handleResetFilters = () => {
    setDraftFilters(emptyStudentFilters);
  };

  const handleApplyFilters = () => {
    setFilters(draftFilters);
    setFilterVisible(false);
  };

  const filterGroups: readonly MultiSelectFilterGroup[] = [
    {
      key: "statuses",
      title: "Trạng thái",
      options: [
        { value: "ACTIVE", label: "Đang học" },
        { value: "INACTIVE", label: "Bảo lưu" },
        { value: "SUSPENDED", label: "Tạm ngưng" },
      ],
      selectedValues: draftFilters.statuses,
      onToggle: (val) =>
        setDraftFilters((prev) => ({
          ...prev,
          statuses: toggleMultiSelectFilterValue(
            prev.statuses,
            val as PersonStatus,
          ),
        })),
      onSelectAll: () =>
        setDraftFilters((prev) => ({
          ...prev,
          statuses: ["ACTIVE", "INACTIVE", "SUSPENDED"],
        })),
      onClear: () => setDraftFilters((prev) => ({ ...prev, statuses: [] })),
    },
    {
      key: "genders",
      title: "Giới tính",
      options: [
        { value: "true", label: "Nam" },
        { value: "false", label: "Nữ" },
      ],
      selectedValues: draftFilters.genders,
      onToggle: (val) =>
        setDraftFilters((prev) => ({
          ...prev,
          genders: toggleMultiSelectFilterValue(
            prev.genders,
            val as "true" | "false",
          ),
        })),
      onSelectAll: () =>
        setDraftFilters((prev) => ({
          ...prev,
          genders: ["true", "false"],
        })),
      onClear: () => setDraftFilters((prev) => ({ ...prev, genders: [] })),
    },
    {
      key: "belts",
      title: "Cấp đai",
      options: ALL_BELTS.map((belt) => ({
        value: belt,
        label: `${BeltLabel[belt]} (${belt})`,
      })),
      selectedValues: draftFilters.belts,
      onToggle: (val) =>
        setDraftFilters((prev) => ({
          ...prev,
          belts: toggleMultiSelectFilterValue(prev.belts, val as Belt),
        })),
      onSelectAll: () =>
        setDraftFilters((prev) => ({
          ...prev,
          belts: ALL_BELTS,
        })),
      onClear: () => setDraftFilters((prev) => ({ ...prev, belts: [] })),
    },
  ];

  return (
    <>
      <StackScreenLayout
        title="Học viên"
        contentContainerStyle={styles.content}
        refreshing={studentsQuery.isRefetching}
        onRefresh={async () => {
          await studentsQuery.refetch();
        }}
        rightActions={
          <>
            <HeaderActionButton
              icon={<Tuning />}
              label="Lọc"
              badge={appliedCount || undefined}
              onPress={openFilter}
              testID="student-list-filter-button"
            />
            <DefaultHeaderActions />
          </>
        }
      >
        <SegmentedTabs value={activeTab} tabs={[...STUDENT_TABS]} onChange={setActiveTab} />
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
          <AppIcon
            icon={<Search />}
            size={20}
            color={Colors.light.textSecondary}
          />
          <TextInput
            accessibilityLabel="Tìm kiếm học viên"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm theo họ tên, mã, SĐT..."
            placeholderTextColor={Colors.light.textSecondary}
            style={styles.searchInput}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Tạo học viên" hitSlop={8} onPress={() => setCreateVisible(true)} style={({ pressed }) => [styles.createButton, pressed && styles.createButtonPressed]}>
            <AppIcon icon={<Plus />} size={22} color={Colors.light.surface} />
          </Pressable>
        </View>

        {studentsQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        ) : (
          <View style={styles.studentList}>
            {visibleStudents.map((student) => (
              <StudentListItem
                key={student.personId}
                student={student}
                onPress={() =>
                  router.push(
                    `/students/${student.personId}?title=${encodeURIComponent(student.fullName)}` as any,
                  )
                }
              />
            ))}
          </View>
        )}

        {!studentsQuery.isLoading && visibleStudents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText type="bodySmall" style={styles.helperText}>
              {appliedCount > 0
                ? "Không tìm thấy học viên phù hợp với bộ lọc."
                : "Chưa có học viên trong trạng thái này."}
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.footerNote}>
          <AppIcon
            icon={<InfoCircle />}
            size={22}
            color={Colors.light.textSecondary}
          />
          <ThemedText type="bodySmall" style={styles.helperText}>
            Chọn học viên để xem hồ sơ, ví và khóa học.
          </ThemedText>
        </View>
      </StackScreenLayout>

      <BottomSheetWindow
        visible={filterVisible}
        title="Lọc"
        accessibilityLabel="Lọc danh sách học viên"
        backdropAccessibilityLabel="Đóng bộ lọc"
        onClose={() => setFilterVisible(false)}
        footer={
          <FilterSheetActions
            canApply
            onReset={handleResetFilters}
            onApply={handleApplyFilters}
          />
        }
      >
        <MultiSelectFilterContent groups={filterGroups} />
      </BottomSheetWindow>
      <PersonCreateSheet kind="student" visible={createVisible} onClose={() => setCreateVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  searchContainer: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.light.divider,
  },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  createButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: Colors.light.primary },
  createButtonPressed: { opacity: 0.82, transform: [{ scale: 0.97 }] },
  searchInput: {
    flex: 1,
    color: Colors.light.text,
    fontSize: 14,
    paddingVertical: 10,
  },
  studentList: {
    gap: 12,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 4,
  },
  helperText: {
    flex: 1,
    color: Colors.light.textSecondary,
  },
});
