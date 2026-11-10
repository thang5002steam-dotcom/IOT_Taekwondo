import { useActiveQueriesRefresh } from "@/infrastructure/query/useActiveQueriesRefresh";
import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { getWindowDimensions } from "@/shared/utils/windowDimensions";
import { Colors, effects, typography } from "@/theme";
import type { AppIconElement } from "@/theme/icons";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ChevronLeft } from "reicon-react-native";
import { DefaultHeaderActions } from "../components/DefaultHeaderActions";
import { HeaderActionButton } from "../components/HeaderActionButton";

const { height } = getWindowDimensions();

export type StackHeaderAction = {
  icon: AppIconElement;
  label: string;
  badge?: string | number;
  badgeVariant?: "dot" | "count";
  color?: string;
  onPress?: () => void;
  testID?: string;
};

export type StackScreenLayoutProps = {
  title: string;
  children: ReactNode;
  rightActions?: ReactNode | StackHeaderAction[];
  contentContainerStyle?: StyleProp<ViewStyle>;
  floatingContent?: ReactNode;
  scrollEnabled?: boolean;
  refreshEnabled?: boolean;
  refreshing?: boolean;
  onRefresh?: () => Promise<void> | void;
  headerVariant?: 'default' | 'dark';
};

export default function StackScreenLayout({
  title,
  children,
  rightActions,
  contentContainerStyle,
  floatingContent,
  scrollEnabled = true,
  refreshEnabled = true,
  refreshing: controlledRefreshing,
  onRefresh: customOnRefresh,
  headerVariant = 'default',
}: StackScreenLayoutProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDarkHeader = headerVariant === 'dark';
  const actionColor = isDarkHeader ? Colors.light.surface : Colors.light.text;
  const defaultRefresh = useActiveQueriesRefresh();
  const refreshing = controlledRefreshing ?? defaultRefresh.refreshing;
  const onRefresh = customOnRefresh ?? defaultRefresh.onRefresh;

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.safeArea}>
      <View style={[styles.header, isDarkHeader ? styles.darkHeader : null, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.headerContent}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            hitSlop={8}
            onPress={() =>
              router.canGoBack() ? router.back() : router.push("/")
            }
            style={({ pressed }) => [
              styles.backButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <AppIcon icon={<ChevronLeft />} color={actionColor} />
          </Pressable>
          <View style={styles.titleContainer} pointerEvents="none">
            <ThemedText
              type="heading"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.title, isDarkHeader ? styles.darkTitle : null]}
            >
              {title}
            </ThemedText>
          </View>
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
          contentContainerStyle={[styles.content, contentContainerStyle]}
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
        <View style={[styles.scroll, styles.content, contentContainerStyle]}>
          {children}
        </View>
      )}

      {floatingContent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.surface,
    ...effects.soft,
  },
  darkHeader: { backgroundColor: '#202020' },
  headerContent: {
    height: height * 0.08,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: 20,
    minWidth: 44,
    minHeight: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  titleContainer: {
    maxWidth: "64%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  title: {
    color: Colors.light.text,
    textAlign: "center",
    ...typography.heading,
  },
  darkTitle: { color: Colors.light.surface },
  actions: {
    position: "absolute",
    right: 19,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 20,
  },
  pressed: {
    opacity: 0.75,
  },
});
