import { ChevronRight } from "reicon-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import {
  Colors,
  activeEffect,
  hexToRgba,
  radii,
  typography,
  type AppIconElement,
} from "@/theme";

type WalletSectionGroupProps = {
  icon: AppIconElement;
  title: string;
  subtitle: string;
  count: number;
  onPress: () => void;
  showDivider?: boolean;
};

export function WalletSectionGroup({
  icon,
  title,
  subtitle,
  count,
  onPress,
  showDivider = false,
}: WalletSectionGroupProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        activeEffect(pressed, "pressedHighlight"),
      ]}
    >
      <View style={styles.iconBox}>
        <AppIcon icon={icon} size={29} color={Colors.light.icon} />
      </View>
      <View style={styles.copy}>
        <ThemedText type="body" numberOfLines={1} style={styles.title}>
          {title} ({count})
        </ThemedText>
        <ThemedText type="bodySmall" numberOfLines={1} style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      </View>
      <AppIcon icon={<ChevronRight />}
        width={9}
        height={15}
        color={Colors.light.icon}
      />
      {showDivider ? <View style={styles.divider} /> : null}
    </Pressable>
  );
}

export function WalletSectionList({ children }: { children: ReactNode }) {
  return <View style={styles.list}>{children}</View>;
}

const styles = StyleSheet.create({
  list: {
    overflow: "hidden",
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
  },
  row: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingLeft: 12,
    paddingRight: 10,
    backgroundColor: Colors.light.surface,
  },
  iconBox: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: hexToRgba(Colors.light.primary, 0.08),
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: Colors.light.text,
    ...typography.body,
  },
  subtitle: {
    color: Colors.light.textSecondary,
  },
  divider: {
    position: "absolute",
    left: 70,
    right: 20,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.divider,
  },
});
