import { Pressable, StyleSheet, View } from "react-native";
import { ChevronRight } from "reicon-react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { formatVnd } from "@/shared/utils/currency";
import { Colors, hexToRgba, radii, Spacing } from "@/theme";
import type { CoursePriceItemView } from "../domain/course-price.types";

export function CoursePriceCard({
  item,
  onPress,
}: {
  item: CoursePriceItemView;
  onPress: () => void;
}) {
  const isActive = item.status === "ACTIVE";
  const hasDiscount = Boolean(item.basePrice && item.basePrice > item.finalPrice);

  return (
    <Pressable
      testID={`price-card-${item.id}`}
      accessibilityRole="button"
      accessibilityLabel={`Gói học ${item.durationLabel}, ${item.sessionsLabel}, giá ${formatVnd(item.finalPrice)}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <View style={styles.titleArea}>
          <ThemedText type="heading" style={styles.durationTitle}>
            {item.durationLabel}
          </ThemedText>
          <ThemedText type="bodySmall" style={styles.sessionCount}>
            {item.sessionsLabel}
          </ThemedText>
        </View>
        <View
          style={[
            styles.statusBadge,
            isActive ? styles.statusBadgeActive : styles.statusBadgeInactive,
          ]}
        >
          <ThemedText
            type="caption"
            style={[
              styles.statusText,
              isActive ? styles.statusTextActive : styles.statusTextInactive,
            ]}
          >
            {item.statusLabel}
          </ThemedText>
        </View>
      </View>

      <View style={styles.priceRow}>
        <ThemedText type="heading" style={styles.finalPrice}>
          {formatVnd(item.finalPrice)}
        </ThemedText>
        {hasDiscount && (
          <ThemedText type="bodySmall" style={styles.basePrice}>
            {formatVnd(item.basePrice)}
          </ThemedText>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <ThemedText type="caption" style={styles.monthlyPrice}>
          ~{formatVnd(item.monthlyPrice)} / tháng
        </ThemedText>
        <View style={styles.actionPrompt}>
          <ThemedText type="caption" style={styles.detailText}>
            Chi tiết
          </ThemedText>
          <AppIcon
            icon={<ChevronRight />}
            size={16}
            color={Colors.light.textSecondary}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: Colors.light.divider,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    gap: Spacing.two,
    borderCurve: "continuous",
  },
  pressed: {
    opacity: 0.8,
    backgroundColor: hexToRgba(Colors.light.primary, 0.02),
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  titleArea: {
    gap: 2,
  },
  durationTitle: {
    color: Colors.light.text,
    fontSize: 18,
    lineHeight: 22,
  },
  sessionCount: {
    color: Colors.light.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  statusBadgeActive: {
    backgroundColor: Colors.light.successSoft,
  },
  statusBadgeInactive: {
    backgroundColor: Colors.light.backgroundElement,
  },
  statusText: {
    fontWeight: "700",
  },
  statusTextActive: {
    color: Colors.light.success,
  },
  statusTextInactive: {
    color: Colors.light.textSecondary,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.two,
    marginTop: 2,
  },
  finalPrice: {
    color: Colors.light.primary,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "700",
  },
  basePrice: {
    color: Colors.light.textSecondary,
    textDecorationLine: "line-through",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.divider,
    marginVertical: 2,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthlyPrice: {
    color: Colors.light.textSecondary,
  },
  actionPrompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  detailText: {
    color: Colors.light.textSecondary,
  },
});
