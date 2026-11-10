import { Permission } from "@/features/authorization/domain/permissions";
import { useCan } from "@/features/authorization/hooks/useAccess";
import { getApiErrorMessage } from "@/infrastructure/http/httpError";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { AdminSearchField } from "@/shared/ui/admin/AdministrationPrimitives";
import { AppIcon } from "@/shared/ui/AppIcon";
import { SegmentedControl } from "@/shared/ui/SegmentedControl";
import { ThemedText } from "@/shared/ui/ThemedText";
import { useToast } from "@/shared/ui/Toast";
import { Colors, effects, radii, Spacing, typography } from "@/theme";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Layers,
  Plus,
} from "reicon-react-native";
import type {
  TrainingPlanCreateRequest,
  TrainingPlanSimpleResponse,
} from "../api/trainingPlan.dto";
import { TrainingPlanFormSheet } from "../components/TrainingPlanFormSheet";
import {
  useCreateTrainingPlan,
  useTrainingPlans,
} from "../queries/trainingPlanQueries";
import { levelLabel } from "../domain/trainingPlanLabels";

type PlanFilter = "ALL" | "ACTIVE" | "INACTIVE";
type PlanGroup = {
  key: string;
  name: string;
  level: string;
  status: TrainingPlanSimpleResponse["status"];
  variants: TrainingPlanSimpleResponse[];
};

function groupPlans(plans: TrainingPlanSimpleResponse[]) {
  const groups = new Map<string, PlanGroup>();
  for (const plan of plans) {
    const key = `${plan.name}-${plan.level}-${plan.status}`;
    const group = groups.get(key) ?? {
      key,
      name: plan.name,
      level: plan.level,
      status: plan.status,
      variants: [],
    };
    group.variants.push(plan);
    groups.set(key, group);
  }
  return [...groups.values()];
}

/** Admin entry surface. CRUD actions deliberately live behind feature mutations for reuse by detail/forms. */
export function TrainingPlanManagementScreen() {
  const router = useRouter();
  const toast = useToast();
  const canCreate = useCan(Permission.TRAINING_PLAN_CREATE);
  const [tab, setTab] = useState<PlanFilter>("ALL");
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set(),
  );
  const create = useCreateTrainingPlan();
  const plans = useTrainingPlans({
    size: 100,
    sort: "name,asc",
    status:
      tab === "ALL" ? undefined : tab === "ACTIVE" ? "ACTIVE" : "INACTIVE",
  });
  const groups = useMemo(
    () =>
      groupPlans(
        (plans.data?.content ?? []).filter((item) =>
          `${item.name} ${levelLabel(item.level)}`
            .toLocaleLowerCase("vi-VN")
            .includes(search.toLocaleLowerCase("vi-VN")),
        ),
      ),
    [plans.data?.content, search],
  );
  const toggleGroup = (key: string) =>
    setCollapsedGroups((current) => {
      const next = new Set(current);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const handleCreate = async (request: TrainingPlanCreateRequest) => {
    try {
      const plan = await create.mutateAsync(request);
      setIsCreateOpen(false);
      toast.show({
        message: "Đã tạo gói học. Hãy tiếp tục cấu hình.",
        variant: "success",
      });
      router.push(
        `/admin/training-plans/${plan.trainingPlanId}/requirements-addons` as never,
      );
    } catch (error) {
      toast.show({
        message: getApiErrorMessage(error, "Không thể tạo gói học."),
        variant: "error",
      });
    }
  };

  return (
    <>
      <StackScreenLayout
        title="Gói học"
        contentContainerStyle={styles.content}
        onRefresh={async () => {
          await plans.refetch();
        }}
        refreshing={plans.isRefetching}
      >
        <SegmentedControl<PlanFilter>
          value={tab}
          onChange={setTab}
          options={[
            { value: "ALL", label: "Tất cả" },
            { value: "ACTIVE", label: "Đang bán" },
            { value: "INACTIVE", label: "Tạm dừng" },
          ]}
        />
        <View style={styles.searchRow}>
          <View style={styles.grow}>
            <AdminSearchField
              value={search}
              onChangeText={setSearch}
              placeholder="Tìm theo tên gói học, cấp độ..."
            />
          </View>
          {canCreate ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tạo gói học"
              hitSlop={8}
              pressRetentionOffset={12}
              onPress={() => setIsCreateOpen(true)}
              style={({ pressed }) => [
                styles.add,
                pressed && styles.addPressed,
              ]}
            >
              <AppIcon icon={<Plus />} size={30} color={Colors.light.surface} />
            </Pressable>
          ) : null}
        </View>
        {plans.isPending ? (
          <View style={styles.state}>
            <ActivityIndicator color={Colors.light.primary} />
          </View>
        ) : (
          groups.map((group) => (
            <PlanGroupCard
              key={group.key}
              group={group}
              expanded={!collapsedGroups.has(group.key)}
              onToggle={() => toggleGroup(group.key)}
              onPress={(plan) =>
                router.push(
                  `/admin/training-plans/${plan.trainingPlanId}` as never,
                )
              }
            />
          ))
        )}
        {!plans.isPending && groups.length === 0 ? (
          <ThemedText type="bodySmall" style={styles.empty}>
            Chưa có gói học phù hợp.
          </ThemedText>
        ) : null}
      </StackScreenLayout>
      <TrainingPlanFormSheet
        visible={isCreateOpen}
        submitting={create.isPending}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </>
  );
}
const money = (value: number) =>
  `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
export { levelLabel } from "../domain/trainingPlanLabels";
function PlanGroupCard({
  group,
  expanded,
  onToggle,
  onPress,
}: {
  group: PlanGroup;
  expanded: boolean;
  onToggle: () => void;
  onPress: (plan: TrainingPlanSimpleResponse) => void;
}) {
  const active = group.status === "ACTIVE";
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${expanded ? "Thu gọn" : "Mở rộng"} gói ${group.name}`}
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={({ pressed }) => [styles.cardHeader, pressed && effects.pressed]}
      >
        <View style={styles.icon}>
          <AppIcon icon={<Layers />} size={33} color={Colors.light.primary} />
        </View>
        <View style={styles.copy}>
          <ThemedText type="title" numberOfLines={1}>
            {group.name}
          </ThemedText>
          <View style={styles.level}>
            <ThemedText type="bodySmall" style={styles.levelText}>
              {levelLabel(group.level)}
            </ThemedText>
          </View>
        </View>
        <View style={styles.headerEnd}>
          <View
            style={[styles.status, active ? styles.active : styles.inactive]}
          >
            <View
              style={[
                styles.statusDot,
                active ? styles.activeDot : styles.inactiveDot,
              ]}
            />
            <ThemedText
              type="featureLabel"
              style={active ? styles.activeText : styles.inactiveText}
            >
              {active ? "Đang bán" : "Tạm dừng"}
            </ThemedText>
          </View>
          <AppIcon
            icon={expanded ? <ChevronUp /> : <ChevronDown />}
            size={24}
            color={Colors.light.text}
          />
        </View>
      </Pressable>
      {expanded ? (
        <View style={styles.variants}>
          {group.variants
            .sort(
              (a, b) =>
                a.durationMonths - b.durationMonths ||
                a.includedSessionCount - b.includedSessionCount,
            )
            .map((plan, index) => (
              <Pressable
                key={plan.trainingPlanId}
                accessibilityRole="button"
                accessibilityLabel={`Xem biến thể ${plan.durationMonths} tháng`}
                onPress={() => onPress(plan)}
                style={({ pressed }) => [
                  styles.variant,
                  index > 0 && styles.variantDivider,
                  pressed && effects.pressed,
                ]}
              >
                {/* <View style={styles.calendar}> */}
                <AppIcon
                  icon={<Calendar />}
                  size={20}
                  color={Colors.light.textSecondary}
                />
                {/* </View> */}
                <ThemedText type="body" style={styles.variantLabel}>
                  {plan.durationMonths} tháng · {plan.includedSessionCount} buổi
                </ThemedText>
                <View style={styles.variantPrice}>
                  {plan.basePrice !== plan.finalPrice ? (
                    <ThemedText type="bodySmall" style={styles.old}>
                      {money(plan.basePrice)}
                    </ThemedText>
                  ) : null}
                  <ThemedText type="title" style={styles.red}>
                    {money(plan.finalPrice)}
                  </ThemedText>
                </View>
                <AppIcon
                  icon={<ChevronRight />}
                  size={24}
                  color={Colors.light.textSecondary}
                />
              </Pressable>
            ))}
        </View>
      ) : null}
    </View>
  );
}

/** Compact plan summary retained for the detail screen's related-plan section. */
export function PlanCard({
  plan,
  onPress,
}: {
  plan: TrainingPlanSimpleResponse;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.relatedCard, pressed && effects.pressed]}
    >
      <View style={styles.relatedIcon}>
        <AppIcon icon={<Layers />} size={26} color={Colors.light.primary} />
      </View>
      <View style={styles.copy}>
        <ThemedText type="title" numberOfLines={1}>
          {plan.name}
        </ThemedText>
        <ThemedText type="bodySmall" style={styles.muted}>
          {plan.durationMonths} tháng · {plan.includedSessionCount} buổi
        </ThemedText>
      </View>
      <ThemedText type="title" style={styles.red}>
        {money(plan.finalPrice)}
      </ThemedText>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  content: {
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  searchRow: { flexDirection: "row", alignItems: "center", gap: Spacing.three },
  grow: { flex: 1 },
  add: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    ...effects.soft,
  },
  addPressed: { opacity: 0.84, transform: [{ scale: 0.97 }] },
  state: { paddingVertical: 48, alignItems: "center" },
  card: {
    overflow: "hidden",
    backgroundColor: Colors.light.surface,
    borderRadius: radii.lg,
    ...effects.soft,
  },
  cardHeader: {
    // minHeight: 156,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primarySoft,
  },
  copy: { flex: 1, gap: Spacing.one },
  level: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.three,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: Colors.light.primarySoft,
  },
  levelText: { color: Colors.light.primary },
  muted: { color: Colors.light.textSecondary },
  headerEnd: {
    alignItems: "flex-end",
    alignSelf: "stretch",
    justifyContent: "space-between",
    paddingVertical: Spacing.one,
    gap: 6,
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: radii.pill,
  },
  statusDot: { width: 10, height: 10, borderRadius: radii.pill },
  active: { backgroundColor: Colors.light.successSoft },
  inactive: { backgroundColor: Colors.light.errorSoft },
  activeDot: { backgroundColor: Colors.light.success },
  inactiveDot: { backgroundColor: Colors.light.error },
  activeText: { color: Colors.light.success },
  inactiveText: { color: Colors.light.error },
  variants: {
    marginHorizontal: Spacing.two,
    marginBottom: Spacing.two,
    overflow: "hidden",
    borderRadius: radii.md,
    backgroundColor: Colors.light.backgroundElement,
  },
  variant: {
    // minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  variantDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.divider,
  },
  calendar: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.surface,
  },
  variantLabel: { flex: 1, ...typography.bodySmall },
  variantPrice: { alignItems: "flex-end", gap: 2 },
  old: {
    color: Colors.light.textSecondary,
    textDecorationLine: "line-through",
  },
  red: { color: Colors.light.primary },
  relatedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    backgroundColor: Colors.light.surface,
    borderRadius: radii.md,
    ...effects.soft,
  },
  relatedIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primarySoft,
  },
  empty: {
    textAlign: "center",
    color: Colors.light.textSecondary,
    paddingVertical: 48,
  },
});
