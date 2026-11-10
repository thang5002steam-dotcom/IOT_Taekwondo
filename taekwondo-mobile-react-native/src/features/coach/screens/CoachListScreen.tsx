import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";
import { InfoCircle, Plus, Search, Tuning } from "reicon-react-native";

import { PersonListItem } from "@/features/person/components/PersonListItem";
import { PersonCreateSheet } from "@/features/person/components/PersonCreateSheet";
import type {
  Belt,
  PersonStatus,
} from "@/features/person/constants/person.constants";
import {
  ALL_BELTS,
  BeltLabel,
} from "@/features/person/constants/person.constants";
import { useCoaches } from "@/features/person/queries/personQueries";
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

export type CoachMultiFilterState = {
  statuses: readonly PersonStatus[];
  genders: readonly ("true" | "false")[];
  belts: readonly Belt[];
};

const emptyCoachFilters: CoachMultiFilterState = {
  statuses: [],
  genders: [],
  belts: [],
};

const COACH_TABS = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Tạm dừng" },
] as const;

type CoachListTab = (typeof COACH_TABS)[number]["value"];

export function CoachListScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<CoachListTab>("all");
  const [filterVisible, setFilterVisible] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);

  const [filters, setFilters] =
    useState<CoachMultiFilterState>(emptyCoachFilters);
  const [draftFilters, setDraftFilters] =
    useState<CoachMultiFilterState>(emptyCoachFilters);

  const appliedCount =
    filters.statuses.length + filters.genders.length + filters.belts.length;

  const queryStatus: PersonStatus | undefined = useMemo(() => {
    if (filters.statuses.length === 1) return filters.statuses[0];
    if (activeTab === "active") return "ACTIVE";
    if (activeTab === "inactive") return "INACTIVE";
    return undefined;
  }, [activeTab, filters.statuses]);

  const queryGender =
    filters.genders.length === 1 ? filters.genders[0] === "true" : undefined;
  const queryBelt = filters.belts.length === 1 ? filters.belts[0] : undefined;

  const trimmedSearch = searchQuery.trim();

  const coachesQuery = useCoaches({
    search: trimmedSearch || undefined,
    status: queryStatus,
    gender: queryGender,
    currentBelt: queryBelt,
  });

  const rawCoaches = coachesQuery.data?.content ?? [];

  const visibleCoaches = useMemo(() => {
    let list = rawCoaches;

    // Local search filter as fallback if backend search/cache is in flight
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
      if (activeTab === "active") {
        list = list.filter((s) => s.status === "ACTIVE");
      } else if (activeTab === "inactive") {
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
  }, [rawCoaches, activeTab, filters, trimmedSearch]);

  const openFilter = () => {
    setDraftFilters(filters);
    setFilterVisible(true);
  };

  const handleResetFilters = () => {
    setDraftFilters(emptyCoachFilters);
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
        { value: "ACTIVE", label: "Đang hoạt động" },
        { value: "INACTIVE", label: "Tạm dừng" },
        { value: "SUSPENDED", label: "Đình chỉ" },
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
        title="Huấn luyện viên"
        contentContainerStyle={styles.content}
        refreshing={coachesQuery.isRefetching}
        onRefresh={async () => {
          await coachesQuery.refetch();
        }}
        rightActions={
          <>
            <HeaderActionButton
              icon={<Tuning />}
              label="Lọc"
              badge={appliedCount || undefined}
              onPress={openFilter}
              testID="coach-list-filter-button"
            />
            <DefaultHeaderActions />
          </>
        }
      >
        <SegmentedTabs value={activeTab} tabs={[...COACH_TABS]} onChange={setActiveTab} />
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
          <AppIcon
            icon={<Search />}
            size={20}
            color={Colors.light.textSecondary}
          />
          <TextInput
            accessibilityLabel="Tìm kiếm huấn luyện viên"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm theo họ tên, mã..."
            placeholderTextColor={Colors.light.textSecondary}
            style={styles.searchInput}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Tạo huấn luyện viên" hitSlop={8} onPress={() => setCreateVisible(true)} style={({ pressed }) => [styles.createButton, pressed && styles.createButtonPressed]}>
            <AppIcon icon={<Plus />} size={22} color={Colors.light.surface} />
          </Pressable>
        </View>

        {coachesQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        ) : (
          <View style={styles.coachList}>
            {visibleCoaches.map((coach) => (
              <PersonListItem
                key={coach.personId}
                person={coach}
                onPress={() => {
                  // Navigate to coach profile/detail if available, or view details
                  router.push(`/students/${coach.personId}`);
                }}
              />
            ))}
          </View>
        )}

        {!coachesQuery.isLoading && visibleCoaches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText type="bodySmall" style={styles.helperText}>
              {appliedCount > 0
                ? "Không tìm thấy huấn luyện viên phù hợp với bộ lọc."
                : "Chưa có huấn luyện viên trong trạng thái này."}
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
            Chọn huấn luyện viên để xem thông tin chi tiết.
          </ThemedText>
        </View>
      </StackScreenLayout>

      <BottomSheetWindow
        visible={filterVisible}
        title="Lọc"
        accessibilityLabel="Lọc danh sách huấn luyện viên"
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
      <PersonCreateSheet kind="coach" visible={createVisible} onClose={() => setCreateVisible(false)} />
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
  coachList: {
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
