import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, radii } from "@/theme";
import type { AppIconElement } from "@/theme/icons";
import { Platform, Pressable, StyleSheet, View } from "react-native";

export type HeaderActionButtonProps = {
  icon: AppIconElement;
  label: string;
  badge?: string | number;
  badgeVariant?: "dot" | "count";
  badgeTheme?: "tab" | "stack";
  color?: string;
  onPress?: () => void;
  testID?: string;
};

export function HeaderActionButton({
  icon,
  label,
  badge,
  badgeVariant = "count",
  badgeTheme,
  color = Colors.light.text,
  onPress,
  testID,
}: HeaderActionButtonProps) {
  const hasBadge = badgeVariant === "dot" || Boolean(badge);
  const isTabTheme =
    badgeTheme === "tab" || (!badgeTheme && color === Colors.light.surface);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [styles.button, pressed ? styles.pressed : null]}
    >
      <AppIcon icon={icon} size={29} color={color} />
      {hasBadge ? (
        <View
          style={[
            styles.badge,
            isTabTheme ? styles.tabBadge : styles.stackBadge,
            badgeVariant === "dot" ? styles.dotBadge : null,
          ]}
        >
          {badgeVariant === "count" ? (
            <ThemedText
              type="caption"
              style={[
                styles.badgeText,
                isTabTheme ? styles.tabBadgeText : styles.stackBadgeText,
              ]}
            >
              {badge}
            </ThemedText>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 3,
    right: 1,
    minWidth: 21,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: 4,
  },
  tabBadge: {
    backgroundColor: Colors.light.surface,
    borderColor: Colors.light.surface,
  },
  stackBadge: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  dotBadge: {
    top: 8,
    right: 8,
    minWidth: 9,
    width: 9,
    height: 9,
    paddingHorizontal: 0,
  },
  badgeText: {
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
    fontSize: 10,
    lineHeight: Platform.OS === "ios" ? 12 : 14,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  tabBadgeText: {
    color: Colors.light.text,
  },
  stackBadgeText: {
    color: Colors.light.surface,
  },
  pressed: {
    opacity: 0.75,
  },
});
