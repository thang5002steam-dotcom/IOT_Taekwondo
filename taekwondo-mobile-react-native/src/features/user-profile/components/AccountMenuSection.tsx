import { ChevronRight } from "reicon-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import {
  Colors,
  activeEffect,
  figmaColors,
  hexToRgba,
  radii,
  typography,
} from "@/theme";
import type { AppIconElement } from "@/theme/icons";

export type AccountMenuItem = {
  label: string;
  icon: AppIconElement;
  onPress?: () => void;
};

export function AccountMenuSection({
  title,
  items,
}: {
  title: string;
  items: AccountMenuItem[];
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {title}
        </ThemedText>
      </View>
      <View style={styles.sectionBody}>
        {items.map((item, index) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.menuRow,
              activeEffect(pressed, "pressedHighlight"),
            ]}
          >
            <AppIcon icon={item.icon} size={29} color={Colors.light.icon} />
            <ThemedText type="body" style={styles.menuText}>
              {item.label}
            </ThemedText>
            <AppIcon icon={<ChevronRight />}
              width={9}
              height={15}
              color={Colors.light.icon}
            />
            {index < items.length - 1 ? <View style={styles.divider} /> : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
    minHeight: 240,
    borderRadius: radii.md,
    backgroundColor: hexToRgba(figmaColors.color1, 0.3),
    overflow: "hidden",
  },
  sectionHeader: {
    height: 60,
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  sectionTitle: {
    color: Colors.light.surface,
  },
  sectionBody: {
    minHeight: 180,
    borderBottomLeftRadius: radii.md,
    borderBottomRightRadius: radii.md,
    backgroundColor: Colors.light.surface,
  },
  menuRow: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 11,
    paddingRight: 8,
    gap: 15,
  },
  menuText: {
    flex: 1,
    color: Colors.light.text,
    ...typography.body,
  },
  divider: {
    position: "absolute",
    left: 55,
    right: 22,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.divider,
  },
});
