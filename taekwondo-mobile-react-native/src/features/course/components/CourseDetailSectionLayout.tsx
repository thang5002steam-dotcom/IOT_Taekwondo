import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ChevronRight } from "reicon-react-native";

import { SurfaceCard } from "@/features/student-commerce/components/StudentCommercePrimitives";
import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { activeEffect, Colors, Spacing } from "@/theme";

const PREVIEW_LIMIT = 3;

type Props = {
  title: string;
  subtitle?: string;
  rows: ReactNode[];
  emptyState?: ReactNode;
  onSeeMore?: () => void;
};

/** A grouped course-detail section with independent row presentation. */
export function CourseDetailSectionLayout({
  title,
  subtitle,
  rows,
  emptyState,
  onSeeMore,
}: Props) {
  const previewRows = rows.slice(0, PREVIEW_LIMIT);
  // The section may expose a "See more" action even when the preview has
  // five rows or fewer; the preview itself remains capped at PREVIEW_LIMIT.
  const canSeeMore = Boolean(onSeeMore);

  return (
    <SurfaceCard style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="caption" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      <View style={styles.divider} />
      {previewRows.length ? (
        <View>
          {previewRows.map((row, index) => (
            <View key={index}>
              {row}
              {index < previewRows.length - 1 ? (
                <View style={styles.rowDivider} />
              ) : null}
            </View>
          ))}
        </View>
      ) : emptyState ? (
        <View style={styles.empty}>{emptyState}</View>
      ) : null}
      {canSeeMore ? (
        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Xem thêm ${title.toLowerCase()}`}
            onPress={onSeeMore}
            style={({ pressed }) => [
              styles.seeMore,
              activeEffect(pressed, "pressed"),
            ]}
          >
            <ThemedText type="featureLabel" style={styles.seeMoreText}>
              Xem thêm
            </ThemedText>
            <AppIcon
              icon={<ChevronRight />}
              size={18}
              color={Colors.light.textSecondary}
            />
          </Pressable>
        </View>
      ) : null}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: { paddingBottom: 0 },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  title: { color: Colors.light.text },
  subtitle: {
    color: Colors.light.textSecondary,
    textAlign: "right",
    flexShrink: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.divider,
    marginTop: Spacing.two,
  },
  rows: { paddingTop: Spacing.one },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.divider,
  },
  empty: { paddingVertical: Spacing.three },
  footer: {
    alignItems: "flex-end",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.divider,
    marginTop: Spacing.two,
    paddingTop: 0,
  },
  seeMore: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: Spacing.one,
  },
  seeMoreText: { color: Colors.light.textSecondary },
});
