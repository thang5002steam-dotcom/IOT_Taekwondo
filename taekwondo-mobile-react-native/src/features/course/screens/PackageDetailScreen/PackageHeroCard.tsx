import { Calendar, ChevronRight, Tag } from "reicon-react-native";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, effects, hexToRgba, radii, typography } from "@/theme";
import type { AppIconElement } from "@/theme/icons";

import type { CoursePackageView } from "@/features/student-commerce/types";
import { formatVnd } from "@/features/student-commerce/utils/studentCommerceUtils";

const headlineImage = require("@/assets/images/headline.png");

export function PackageHeroCard({ item }: { item: CoursePackageView }) {
  return (
    <View style={styles.heroCard}>
      <Image
        source={headlineImage}
        contentFit="cover"
        style={StyleSheet.absoluteFill}
        accessibilityIgnoresInvertColors
      />
      <View style={styles.heroOverlay} />

      <View style={styles.heroContent}>
        <ThemedText type="subtitle" style={styles.sessionCount}>
          {item.sessions} BUỔI
        </ThemedText>

        <View style={styles.heroMetaList}>
          <HeroMetaItem
            icon={<Calendar />}
            label="Thời hạn"
            value={item.durationLabel}
          />
          <HeroMetaItem
            icon={<Tag />}
            label="Giá"
            value={formatVnd(item.amount)}
          />
        </View>
      </View>

      <View style={styles.heroMore}>
        <ThemedText type="action" style={styles.heroMoreText}>
          Tìm hiểu thêm
        </ThemedText>
        <AppIcon icon={<ChevronRight />}
          width={9}
          height={16}
          color={Colors.light.primary}
        />
      </View>
    </View>
  );
}

function HeroMetaItem({
  icon,
  label,
  value,
}: {
  icon: AppIconElement;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.heroMetaItem}>
      <View style={styles.heroIconBubble}>
        <AppIcon icon={icon} size={26} color={Colors.light.primary} />
      </View>
      <View style={styles.heroMetaText}>
        <ThemedText type="bodySmall" style={styles.heroMetaLabel}>
          {label}
        </ThemedText>
        <ThemedText type="title" style={styles.heroMetaValue}>
          {value}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    minHeight: 172,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: hexToRgba(Colors.light.divider, 0.55),
    borderRadius: radii.lg,
    backgroundColor: Colors.light.surface,
    ...effects.soft,
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: hexToRgba(Colors.light.surface, 0.18),
  },
  heroContent: {
    width: "58%",
    padding: 22,
    gap: 14,
  },
  sessionCount: {
    color: Colors.light.primary,
    ...typography.subtitle,
    fontSize: 36,
    lineHeight: 44,
  },
  heroMetaList: {
    gap: 13,
  },
  heroMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroIconBubble: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: hexToRgba(Colors.light.primary, 0.1),
  },
  heroMetaText: {
    flex: 1,
    minWidth: 0,
  },
  heroMetaLabel: {
    color: Colors.light.textSecondary,
  },
  heroMetaValue: {
    color: Colors.light.text,
  },
  heroMore: {
    position: "absolute",
    right: 12,
    bottom: 26,
    minHeight: 42,
    maxWidth: "46%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 2,
    borderColor: hexToRgba(Colors.light.surface, 0.95),
    borderRadius: radii.header,
    backgroundColor: hexToRgba(Colors.light.surface, 0.76),
    paddingHorizontal: 14,
    ...effects.soft,
  },
  heroMoreText: {
    color: Colors.light.primary,
    ...typography.featureLabel,
  },
});
