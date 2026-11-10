import { ChartBar, Users2 } from "reicon-react-native";
import { StyleSheet, View } from "react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, hexToRgba, radii } from "@/theme";
import type { AppIconElement } from "@/theme/icons";

export function StudentStatsCard({
  totalCount,
  activeCount,
}: {
  totalCount: number;
  activeCount: number;
}) {
  return (
    <View style={styles.card}>
      <StatBlock
        icon={<Users2 weight="Filled" />}
        value={String(totalCount)}
        label="Học viên"
      />
      <View style={styles.divider} />
      <StatBlock
        icon={<ChartBar />}
        value={String(activeCount)}
        label="Hoạt động"
        emphasized
      />
    </View>
  );
}

function StatBlock({
  icon,
  value,
  label,
  emphasized = false,
}: {
  icon: AppIconElement;
  value: string;
  label: string;
  emphasized?: boolean;
}) {
  return (
    <View style={styles.block}>
      <View style={styles.iconBubble}>
        <AppIcon icon={icon} size={30} color={Colors.light.primary} />
      </View>
      <View style={styles.copy}>
        <ThemedText
          type="heading"
          style={[styles.value, emphasized ? styles.primaryText : null]}
          numberOfLines={1}
        >
          {value}
        </ThemedText>
        <ThemedText type="bodySmall" style={styles.label} numberOfLines={2}>
          {label}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.divider,
    borderRadius: radii.xl,
    borderCurve: "continuous",
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  block: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBubble: {
    width: 54,
    height: 54,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: hexToRgba(Colors.light.primary, 0.08),
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  value: {
    color: Colors.light.text,
    fontSize: 34,
    lineHeight: 40,
  },
  label: {
    color: Colors.light.textSecondary,
  },
  primaryText: {
    color: Colors.light.primary,
  },
  divider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: Colors.light.divider,
    marginHorizontal: 14,
  },
});
