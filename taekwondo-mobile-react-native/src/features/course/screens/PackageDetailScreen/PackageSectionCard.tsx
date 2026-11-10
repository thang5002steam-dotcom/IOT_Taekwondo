import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { CheckRead } from "reicon-react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, effects, hexToRgba, radii } from "@/theme";
import type { AppIconElement } from "@/theme/icons";

export function PackageSectionCard({
  icon,
  title,
  children,
}: {
  icon: AppIconElement;
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconBubble}>
          <AppIcon icon={icon} size={20} color={Colors.light.primary} />
        </View>
        <ThemedText type="heading" style={styles.sectionTitle}>
          {title}
        </ThemedText>
      </View>
      {children}
    </View>
  );
}

export function BenefitLine({ children }: { children: ReactNode }) {
  return (
    <View style={styles.benefitLine}>
      <AppIcon icon={<CheckRead />} size={20} color={Colors.light.primary} />
      <ThemedText type="bodySmall" style={styles.benefitText}>
        {children}
      </ThemedText>
    </View>
  );
}

export function PackageInfoRow({
  label,
  value,
  showDivider = true,
}: {
  label: string;
  value: string;
  showDivider?: boolean;
}) {
  return (
    <View style={[styles.infoRow, showDivider ? styles.infoRowDivider : null]}>
      <ThemedText type="bodySmall" style={styles.infoLabel}>
        {label}
      </ThemedText>
      <ThemedText type="title" style={styles.infoValue} numberOfLines={1}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    flexDirection: "column",
    gap: 12,
    borderWidth: 1,
    borderColor: hexToRgba(Colors.light.divider, 0.45),
    borderRadius: radii.lg,
    backgroundColor: Colors.light.surface,
    padding: 16,
    ...effects.soft,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionIconBubble: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: hexToRgba(Colors.light.primary, 0.1),
  },
  sectionTitle: {
    color: Colors.light.text,
  },
  benefitLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  benefitText: {
    flex: 1,
    minWidth: 0,
    color: Colors.light.text,
    lineHeight: 23,
  },
  infoRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  infoRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.divider,
  },
  infoLabel: {
    flex: 1,
    color: Colors.light.textSecondary,
  },
  infoValue: {
    flexShrink: 1,
    color: Colors.light.text,
    textAlign: "right",
  },
});
