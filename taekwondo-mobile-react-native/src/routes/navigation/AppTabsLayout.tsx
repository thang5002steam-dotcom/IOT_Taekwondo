import {
  TabList,
  TabSlot,
  TabTrigger,
  Tabs,
  type TabListProps,
  type TabTriggerSlotProps,
} from "expo-router/ui";
import { usePathname } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { canAll, usePermissions } from "@/features/authorization";
import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, effects, radii, typography } from "@/theme";

import { VISIBLE_APP_TABS, type AppTabConfig } from "./appTabs.config";

type TabButtonProps = TabTriggerSlotProps & {
  tab: AppTabConfig;
};

export default function AppTabsLayout() {
  const permissions = usePermissions();
  const pathname = usePathname();
  const isCheckInScreen =
    pathname === "/check-in" || pathname.startsWith("/check-in");

  const visibleTabs = VISIBLE_APP_TABS.filter((tab) => {
    const required = tab.requiredPermissions ?? [];
    return required.length === 0 || canAll(permissions, required);
  });

  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <CustomTabList isHidden={isCheckInScreen}>
          {visibleTabs.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton tab={tab} />
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

function CustomTabList({
  children,
  isHidden,
  style: _style,
  ...props
}: TabListProps & { isHidden?: boolean }) {
  return (
    <View
      {...props}
      pointerEvents={isHidden ? "none" : "box-none"}
      style={[styles.tabListContainer, isHidden && styles.hidden]}
    >
      <View style={styles.tabList}>{children}</View>
    </View>
  );
}

function TabButton({ tab, isFocused, ...props }: TabButtonProps) {
  const active = Boolean(isFocused);
  const iconName = active && tab.activeIcon ? tab.activeIcon : tab.icon;
  const iconColor = active ? Colors.light.primary : Colors.light.textSecondary;

  if (tab.centerAction) {
    return (
      <Pressable
        {...props}
        accessibilityRole="tab"
        accessibilityLabel={tab.label}
        accessibilityState={{ selected: active }}
        style={({ pressed }) => [
          styles.centerTabButton,
          pressed ? styles.pressed : null,
        ]}
      >
        <View style={styles.centerButton}>
          <AppIcon icon={iconName} size={40} color={Colors.light.surface} />
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.tabButton,
        pressed ? styles.pressed : null,
      ]}
    >
      <AppIcon icon={iconName} size={35} color={iconColor} />
      <ThemedText
        type="featureLabel"
        style={[styles.tabLabel, active ? styles.tabLabelActive : null]}
      >
        {tab.label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
  },
  tabListContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 22,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  tabList: {
    width: "100%",
    // maxWidth: 500,
    height: 70,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255, 255, 255, 1)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    opacity: 0.8,
    // shadowColor: "#000000",
    // shadowOffset: { width: 0, height: 0 },
    // shadowOpacity: 0.2,
    // shadowRadius: 3,
    // elevation: 2,
    ...effects.card,
  },
  tabButton: {
    flex: 1,
    // minHeight: 62,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  centerTabButton: {
    flex: 1,
    minHeight: 62,
    alignItems: "center",
    justifyContent: "center",
  },
  centerButton: {
    width: 50,
    height: 50,
    borderRadius: radii.md,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    color: Colors.light.textSecondary,
    textAlign: "center",
    ...typography.caption,
  },
  tabLabelActive: {
    color: Colors.light.primary,
  },
  pressed: {
    opacity: 0.75,
  },
  hidden: {
    display: "none",
  },
});
