import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { Plus } from "reicon-react-native";

import { Permission, useCan } from "@/features/authorization";
import { useCourseDetail } from "@/features/course/queries/courseCatalogQueries";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import {
  AdminSearchField,
  AdminSectionHeader,
} from "@/shared/ui/admin/AdministrationPrimitives";
import { AppIcon } from "@/shared/ui/AppIcon";
import {
  PrimaryActionButton,
  SurfaceCard,
} from "@/shared/ui/commerce/CommercePrimitives";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, effects, radii, Spacing } from "@/theme";

import { StaffAssignmentSheet } from "../components/StaffAssignmentSheet";
import {
  courseMemberConfig,
  type CourseMemberKind,
  type RosterMember,
} from "../domain/courseMemberRoster";
import { useCourseMemberRoster } from "../queries/courseMemberRosterQueries";

type Props = { courseId: string; memberKind: CourseMemberKind };

function MemberCard({ member }: { member: RosterMember }) {
  return (
    <SurfaceCard soft>
      <View
        style={styles.memberHeader}
        accessibilityLabel={member.person.fullName}
      >
        <View style={styles.avatar}>
          <ThemedText type="subtitle" style={styles.avatarText}>
            {member.person.fullName.trim().charAt(0).toUpperCase()}
          </ThemedText>
        </View>
        <View style={styles.flex}>
          <ThemedText type="bodySmall" style={styles.strongText}>
            {member.person.fullName}
          </ThemedText>
          {member.person.personCode ? (
            <ThemedText type="caption" style={styles.secondaryText}>
              {member.person.personCode}
            </ThemedText>
          ) : null}
        </View>
      </View>
      <View style={styles.assignmentList}>
        {member.assignments.map((assignment) => (
          <View key={assignment.id} style={styles.assignmentRow}>
            <View style={styles.flex}>
              <ThemedText type="caption" style={styles.strongText}>
                {assignment.scheduleLabel}
              </ThemedText>
              <ThemedText type="caption" style={styles.secondaryText}>
                {assignment.startDate} →{" "}
                {assignment.endDate ?? "Không thời hạn"}
              </ThemedText>
            </View>
            {assignment.roleLabel ? (
              <View
                style={
                  assignment.role === "PRIMARY_COACH"
                    ? styles.primaryBadge
                    : styles.roleBadge
                }
              >
                <ThemedText
                  type="caption"
                  style={
                    assignment.role === "PRIMARY_COACH"
                      ? styles.primaryBadgeText
                      : styles.roleBadgeText
                  }
                >
                  {assignment.roleLabel}
                </ThemedText>
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </SurfaceCard>
  );
}

export function CourseMemberRosterScreen({ courseId, memberKind }: Props) {
  const router = useRouter();
  const config = courseMemberConfig[memberKind];
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sheetVisible, setSheetVisible] = useState(false);
  const canAddStaff = useCan(Permission.COURSE_STAFF_ASSIGNMENT_CREATE);
  const canAddStudent = useCan(Permission.COURSE_PURCHASE_CREATE);
  const canAdd = memberKind === "students" ? canAddStudent : canAddStaff;
  const roster = useCourseMemberRoster(courseId, memberKind, search);
  const course = useCourseDetail(courseId);

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const schedules = useMemo(
    () => course.data?.courseSchedules ?? [],
    [course.data],
  );
  const openAdd = () => {
    if (memberKind === "students") {
      router.push(`/courses/${courseId}/register`);
      return;
    }
    setSheetVisible(true);
  };

  const isInitialLoading = roster.isLoading || roster.isPending;
  const isFiltered = search.length > 0;

  return (
    <StackScreenLayout
      title={config.title}
      scrollEnabled={false}
      refreshEnabled={false}
    >
      <FlatList
        data={roster.members}
        keyExtractor={(item) => item.person.personId}
        renderItem={({ item }) => <MemberCard member={item} />}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={roster.isRefetching && !roster.isFetchingNextPage}
            onRefresh={() => void roster.refetch()}
            tintColor={Colors.light.primary}
            colors={[Colors.light.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ListSeparator}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={styles.searchRow}>
              <View style={styles.searchField}>
                <AdminSearchField
                  value={searchInput}
                  onChangeText={setSearchInput}
                  placeholder={`Tìm ${config.title.toLowerCase()}`}
                />
              </View>
              {canAdd ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Thêm ${config.title.toLowerCase()}`}
                  onPress={openAdd}
                  style={({ pressed }) => [
                    styles.addButton,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <AppIcon
                    icon={<Plus />}
                    size={24}
                    color={Colors.light.surface}
                  />
                </Pressable>
              ) : null}
            </View>
            <AdminSectionHeader
              title={`Danh sách ${config.title.toLowerCase()}`}
            />
          </View>
        }
        ListEmptyComponent={
          isInitialLoading ? (
            <View style={styles.state}>
              <ActivityIndicator
                accessibilityLabel="Đang tải danh sách"
                color={Colors.light.primary}
              />
            </View>
          ) : roster.isError ? (
            <View style={styles.state}>
              <ThemedText type="bodySmall" style={styles.emptyText}>
                Không thể tải danh sách.
              </ThemedText>
              <PrimaryActionButton
                title="Thử lại"
                variant="outline"
                onPress={() => void roster.refetch()}
              />
            </View>
          ) : (
            <View style={styles.state}>
              <ThemedText type="bodySmall" style={styles.emptyText}>
                {isFiltered
                  ? "Không tìm thấy kết quả phù hợp."
                  : config.emptyText}
              </ThemedText>
            </View>
          )
        }
        onEndReached={() => {
          if (roster.hasNextPage && !roster.isFetchingNextPage) {
            void roster.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          roster.isFetchingNextPage ? (
            <View
              accessibilityLabel="Đang tải thêm danh sách"
              style={styles.footer}
            >
              <ActivityIndicator color={Colors.light.primary} />
            </View>
          ) : null
        }
      />
      {memberKind !== "students" ? (
        <StaffAssignmentSheet
          visible={sheetVisible}
          courseId={courseId}
          memberKind={memberKind}
          schedules={schedules}
          onClose={() => setSheetVisible(false)}
        />
      ) : null}
    </StackScreenLayout>
  );
}

function ListSeparator() {
  return <View style={styles.listGap} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  searchRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  searchField: { flex: 1, minWidth: 0 },
  addButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: Colors.light.primary,
    borderCurve: "continuous",
  },
  pressed: effects.pressed,
  listContent: { flexGrow: 1, paddingTop: 20, paddingBottom: 32 },
  listHeader: { gap: 14, marginBottom: 14 },
  listGap: { height: 12 },
  state: {
    alignItems: "center",
    gap: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
  },
  footer: { alignItems: "center", paddingTop: 16 },
  emptyText: { color: Colors.light.textSecondary, textAlign: "center" },
  memberHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: Colors.light.primarySoft,
  },
  avatarText: { color: Colors.light.primary },
  strongText: { color: Colors.light.text, fontWeight: "600" },
  secondaryText: { color: Colors.light.textSecondary },
  assignmentList: { gap: 8, paddingTop: 4 },
  assignmentRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.divider,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: Colors.light.backgroundElement,
  },
  roleBadgeText: { color: Colors.light.textSecondary },
  primaryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: Colors.light.primarySoft,
  },
  primaryBadgeText: { color: Colors.light.primary, fontWeight: "700" },
});
