import { useActiveQueriesRefresh } from "@/infrastructure/query/useActiveQueriesRefresh";
import { ThemedText } from "@/shared/ui/ThemedText";
import { getWindowDimensions } from "@/shared/utils/windowDimensions";
import { Colors, radii, typography } from "@/theme";
import type { AppIconElement } from "@/theme/icons";
import { Image } from "expo-image";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import type { AppTabName } from "../appTabs.config";
import { DefaultHeaderActions } from "../components/DefaultHeaderActions";
import { HeaderActionButton } from "../components/HeaderActionButton";

const { height } = getWindowDimensions();

export type HeaderAction = {
  icon: AppIconElement;
  label: string;
  badge?: string | number;
  badgeVariant?: "dot" | "count";
  color?: string;
  onPress?: () => void;
  testID?: string;
};

export type BottomTabScreenLayoutProps = {
  title: string;
  activeTab: AppTabName;
  children: ReactNode;
  rightActions?: ReactNode | HeaderAction[];
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollEnabled?: boolean;
  refreshEnabled?: boolean;
  refreshing?: boolean;
  onRefresh?: () => Promise<void> | void;
};

export const BOTTOM_TAB_SPACE = 92;

export default function BottomTabScreenLayout({
  title,
  activeTab: _activeTab,
  children,
  rightActions,
  contentContainerStyle,
  scrollEnabled = true,
  refreshEnabled = true,
  refreshing: controlledRefreshing,
  onRefresh: customOnRefresh,
}: BottomTabScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const actionColor = Colors.light.surface;
  const defaultRefresh = useActiveQueriesRefresh();
  const refreshing = controlledRefreshing ?? defaultRefresh.refreshing;
  const onRefresh = customOnRefresh ?? defaultRefresh.onRefresh;

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.safeArea}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.headerContent}>
          <Image
            source={require("@/assets/taekwondo-removebg-preview.png")}
            style={styles.logo}
            contentFit="contain"
            accessibilityLabel="Taekwondo Văn Quán"
          />
          <ThemedText type="heading" style={styles.title}>
            {title}
          </ThemedText>
          <View style={styles.actions}>
            {Array.isArray(rightActions)
              ? rightActions.map((action) => (
                  <HeaderActionButton
                    key={`${action.label}-${action.icon}`}
                    {...action}
                    color={action.color ?? actionColor}
                  />
                ))
              : (rightActions ?? <DefaultHeaderActions color={actionColor} />)}
          </View>
        </View>
      </View>

      {scrollEnabled ? (
        <ScrollView
          style={styles.scroll}
          contentInsetAdjustmentBehavior="never"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: BOTTOM_TAB_SPACE + Math.max(insets.bottom, 10) },
            contentContainerStyle,
          ]}
          refreshControl={
            refreshEnabled ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.light.primary}
                colors={[Colors.light.primary]}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.scroll,
            styles.content,
            contentContainerStyle,
          ]}
        >
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    borderBottomLeftRadius: radii.header,
    backgroundColor: Colors.light.header,
  },
  headerContent: {
    height: height * 0.08,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    position: "absolute",
    left: 15,
    width: 68,
    height: 59,
  },
  title: {
    color: Colors.light.surface,
    textAlign: "center",
    ...typography.heading,
  },
  actions: {
    position: "absolute",
    right: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 30,
    paddingHorizontal: 20,
  },
});
