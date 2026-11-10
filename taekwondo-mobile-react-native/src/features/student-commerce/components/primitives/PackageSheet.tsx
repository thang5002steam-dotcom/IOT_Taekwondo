import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ChevronRight, Fire, Leaf, Users2 } from "reicon-react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { BottomSheetWindow } from "@/shared/ui/BottomSheetWindow";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, hexToRgba, radii } from "@/theme";

import type { CoursePackageView, CourseView } from "../../types";
import {
  formatVnd,
  getCommerceState,
  getMonthlyPackagePrice,
} from "../../utils/studentCommerceUtils";
import { StatusBadge, SurfaceCard } from "@/shared/ui/commerce/CommercePrimitives";

export function PackageSheet({
  visible,
  course,
  onClose,
  onOpenPackage,
}: {
  visible: boolean;
  course?: CourseView;
  onClose: () => void;
  onOpenPackage: (packageId: string) => void;
}) {
  const selectedDefaultId = useMemo(
    () =>
      course?.packages.find((item) => item.badge?.tone === "popular")?.id ??
      course?.packages[0]?.id,
    [course],
  );
  const [prevVisible, setPrevVisible] = useState(visible);
  const [prevDefaultId, setPrevDefaultId] = useState(selectedDefaultId);
  const [selectedPackageId, setSelectedPackageId] = useState<
    string | undefined
  >(selectedDefaultId);

  if (visible !== prevVisible || selectedDefaultId !== prevDefaultId) {
    setPrevVisible(visible);
    setPrevDefaultId(selectedDefaultId);
    if (visible) {
      setSelectedPackageId(selectedDefaultId);
    }
  }

  if (!course) return null;

  const selectedPackage = course.packages.find(
    (item) => item.id === selectedPackageId,
  );

  return (
    <BottomSheetWindow
      visible={visible}
      title="Gói học"
      heightRatio={0.72}
      onClose={onClose}
      footer={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chọn gói này"
          accessibilityState={{ disabled: !selectedPackage }}
          disabled={!selectedPackage}
          onPress={() => {
            if (selectedPackage) {
              onOpenPackage(selectedPackage.id);
            }
          }}
          style={({ pressed }) => [
            styles.packageCta,
            !selectedPackage ? styles.disabled : null,
            pressed ? styles.pressed : null,
          ]}
        >
          <ThemedText type="heading" style={styles.packageCtaText}>
            Chọn gói này
          </ThemedText>
          <AppIcon
            icon={<ChevronRight />}
            width={10}
            height={18}
            color={Colors.light.surface}
          />
        </Pressable>
      }
    >
      <View style={styles.packageSheetBody}>
        {course.packages.map((item) => {
          const selected = item.id === selectedPackageId;
          return (
            <PackageOptionCard
              key={item.id}
              item={item}
              selected={selected}
              onPress={() => setSelectedPackageId(item.id)}
            />
          );
        })}
      </View>
    </BottomSheetWindow>
  );
}

function PackageOptionCard({
  item,
  selected,
  onPress,
}: {
  item: CoursePackageView;
  selected: boolean;
  onPress: () => void;
}) {
  const monthlyPrice = getMonthlyPackagePrice(item);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`Chọn gói ${item.durationLabel}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [pressed ? styles.pressed : null]}
    >
      <SurfaceCard
        soft
        style={[
          styles.packageCard,
          selected ? styles.packageCardSelected : null,
        ]}
      >
        <View style={styles.cardMainRow}>
          <View style={[styles.radio, selected ? styles.radioSelected : null]}>
            {selected ? <View style={styles.radioDot} /> : null}
          </View>
          <View style={styles.packageContent}>
            <View style={styles.packageTopRow}>
              <View style={styles.flex}>
                <ThemedText type="heading" style={styles.blackText}>
                  {item.durationLabel}
                </ThemedText>
                <View style={styles.priceRow}>
                  <ThemedText
                    type="heading"
                    style={
                      selected ? styles.selectedPackagePrice : styles.blackText
                    }
                  >
                    {formatVnd(item.amount)}
                  </ThemedText>
                  {item.originalAmount ? (
                    <ThemedText type="bodySmall" style={styles.originalPrice}>
                      {formatVnd(item.originalAmount)}
                    </ThemedText>
                  ) : null}
                </View>
                <ThemedText type="bodySmall" style={styles.secondaryText}>
                  {formatVnd(monthlyPrice)}/tháng
                </ThemedText>
              </View>
              {item.badge ? <PackageBadge badge={item.badge} /> : null}
            </View>

            <View style={styles.cardDivider} />

            <PackageCardFooter text={item.footerText} />
          </View>
        </View>
      </SurfaceCard>
    </Pressable>
  );
}

function PackageCardFooter({ text }: { text?: string }) {
  const content = text ?? "Đã đồng hành cùng hơn 85+ học viên";
  const highlightKey = "85+ học viên";

  if (content.includes(highlightKey)) {
    const parts = content.split(highlightKey);
    return (
      <View style={styles.cardFooter}>
        <AppIcon
          icon={<Users2 />}
          size={16}
          color={Colors.light.textSecondary}
        />
        <ThemedText type="bodySmall" style={styles.footerText}>
          {parts[0]}
          <ThemedText type="bodySmall" style={styles.footerHighlight}>
            {highlightKey}
          </ThemedText>
          {parts[1]}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.cardFooter}>
      <AppIcon
        icon={<Users2 />}
        size={16}
        color={Colors.light.textSecondary}
      />
      <ThemedText type="bodySmall" style={styles.footerText}>
        {content}
      </ThemedText>
    </View>
  );
}

function PackageBadge({
  badge,
}: {
  badge: NonNullable<CoursePackageView["badge"]>;
}) {
  const popular = badge.tone === "popular";
  return (
    <View
      style={[styles.badge, popular ? styles.popularBadge : styles.savingBadge]}
    >
      <AppIcon
        icon={popular ? <Fire weight="Filled" /> : <Leaf weight="Filled" />}
        size={16}
        color={popular ? Colors.light.primary : Colors.light.success}
      />
      <ThemedText
        type="action"
        style={popular ? styles.popularBadgeText : styles.savingBadgeText}
      >
        {badge.label}
      </ThemedText>
    </View>
  );
}

export function PackageCoursePicker({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (courseId: string) => void;
}) {
  const state = getCommerceState();
  const options = state.courses.filter((course) =>
    ["basic", "advanced", "expert"].includes(course.courseId),
  );

  return (
    <BottomSheetWindow
      visible={visible}
      title="Chọn khóa học"
      heightRatio={0.45}
      onClose={onClose}
    >
      <View style={styles.sheetBody}>
        <ThemedText type="bodySmall" style={styles.blackText}>
          Có thể học nhiều khóa cùng lúc. Khóa đang học không đăng ký trùng.
        </ThemedText>
        {options.map((course) => (
          <Pressable
            key={course.courseId}
            accessibilityRole="button"
            onPress={() => onSelect(course.courseId)}
            style={({ pressed }) => [pressed ? styles.pressed : null]}
          >
            <SurfaceCard soft>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <ThemedText type="title" style={styles.blackText}>
                    {course.courseName}
                  </ThemedText>
                  <ThemedText type="bodySmall" style={styles.blackText}>
                    {course.branchName} · {course.scheduleLabel}
                  </ThemedText>
                </View>
                <StatusBadge
                  label={course.courseId === "expert" ? "Đăng ký" : "Đang học"}
                />
              </View>
            </SurfaceCard>
          </Pressable>
        ))}
      </View>
    </BottomSheetWindow>
  );
}

const styles = StyleSheet.create({
  sheetBody: {
    gap: 12,
    paddingTop: 16,
    paddingBottom: 20,
  },
  packageSheetBody: {
    gap: 12,
    paddingTop: 12,
    paddingBottom: 104,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  packageCard: {
    borderWidth: 1,
    borderColor: Colors.light.divider,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  packageCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: hexToRgba(Colors.light.primary, 0.05),
  },
  cardMainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  packageContent: {
    flex: 1,
    minWidth: 0,
  },
  packageTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedPackagePrice: {
    color: Colors.light.primary,
    fontSize: 25,
    lineHeight: 28,
  },
  originalPrice: {
    color: Colors.light.textSecondary,
    textDecorationLine: "line-through",
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.light.textSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  radioSelected: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  radioDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.light.primary,
  },
  badge: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    flexShrink: 0,
  },
  popularBadge: {
    backgroundColor: hexToRgba(Colors.light.primary, 0.1),
  },
  savingBadge: {
    backgroundColor: hexToRgba(Colors.light.success, 0.14),
  },
  popularBadgeText: {
    color: Colors.light.primary,
  },
  savingBadgeText: {
    color: Colors.light.success,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.light.divider,
    marginTop: 12,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerText: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  footerHighlight: {
    color: Colors.light.text,
    fontWeight: "700",
    fontSize: 13,
    lineHeight: 18,
  },
  packageCta: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    borderRadius: radii.xl,
    backgroundColor: Colors.light.primary,
  },
  packageCtaText: {
    color: Colors.light.surface,
  },
  disabled: {
    opacity: 0.45,
  },
  flex: {
    flex: 1,
    minWidth: 0,
  },
  blackText: {
    color: Colors.light.text,
  },
  secondaryText: {
    color: Colors.light.textSecondary,
  },
  pressed: {
    opacity: 0.75,
  },
});
