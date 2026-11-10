import { Bell, Check } from "reicon-react-native";
import { useRouter, type Href } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import { HomeHeaderButton } from "@/routes/navigation/components/HomeHeaderButton";
import { HeaderActionButton } from "@/routes/navigation/components/HeaderActionButton";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, radii } from "@/theme";

import type { NotificationRecipientMine } from "../api/notification.dto";
import { NotificationCard } from "../components/NotificationCard";
import {
  NotificationFilterBar,
  type NotificationReadTab,
} from "../components/NotificationFilterBar";
import {
  NotificationSkeletonList,
  NotificationStateView,
} from "../components/NotificationStateView";
import { NotificationSummaryCard } from "../components/NotificationSummaryCard";
import type { NotificationType } from "../constants/notification.constants";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  type NotificationFilters,
} from "../queries/notificationQueries";
import { useNotificationStore } from "../store/notification.store";

export default function NotificationScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<NotificationReadTab>("all");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<
    NotificationType | undefined
  >();

  const filters = useMemo<NotificationFilters>(
    () => ({
      read: tab === "unread" ? false : undefined,
      search: search || undefined,
      type: selectedType,
    }),
    [search, selectedType, tab],
  );

  const notificationsQuery = useNotifications(filters);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkAllReadPending } =
    useMarkAllNotificationsRead();
  const notifications = useMemo(
    () => notificationsQuery.data?.pages.flatMap((page) => page.content) ?? [],
    [notificationsQuery.data],
  );
  const totalCount = notificationsQuery.data?.pages[0]?.totalElements ?? 0;
  const isInitialLoading =
    notificationsQuery.isLoading || notificationsQuery.isPending;

  const openNotification = useCallback(
    (notification: NotificationRecipientMine) => {
      if (!notification.read) {
        markRead(notification.notificationRecipientId);
      }
      router.push(
        `/notifications/${notification.notificationRecipientId}` as unknown as Href,
      );
    },
    [markRead, router],
  );

  const handleMarkAllRead = useCallback(() => {
    if (isMarkAllReadPending) return;
    markAllRead();
  }, [isMarkAllReadPending, markAllRead]);

  const renderItem = useCallback(
    ({ item }: { item: NotificationRecipientMine }) => (
      <NotificationCard notification={item} onPress={openNotification} />
    ),
    [openNotification],
  );

  return (
    <StackScreenLayout
      title="Thông báo"
      scrollEnabled={false}
      rightActions={
        <>
          {unreadCount > 0 ? (
            <HeaderActionButton
              icon={<Check />}
              label="Đánh dấu tất cả đã đọc"
              color={Colors.light.text}
              testID="notification-read-all-button"
              onPress={handleMarkAllRead}
            />
          ) : null}
          <HomeHeaderButton color={Colors.light.text} />
        </>
      }
      contentContainerStyle={styles.screenContent}
    >
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.notificationRecipientId}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ListSeparator}
        refreshControl={
          <RefreshControl
            refreshing={notificationsQuery.isRefetching}
            onRefresh={() => void notificationsQuery.refetch()}
            tintColor={Colors.light.primary}
            colors={[Colors.light.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <NotificationSummaryCard
              totalCount={totalCount}
              unreadCount={unreadCount}
            />
            <NotificationFilterBar
              tab={tab}
              search={search}
              selectedType={selectedType}
              onTabChange={setTab}
              onSearchChange={setSearch}
              onTypeChange={setSelectedType}
            />
          </View>
        }
        ListEmptyComponent={
          isInitialLoading ? (
            <NotificationSkeletonList />
          ) : notificationsQuery.isError ? (
            <NotificationStateView
              icon={<Bell />}
              title="Không tải được thông báo"
              description="Vui lòng thử lại sau ít phút."
              actionLabel="Thử lại"
              onActionPress={() => void notificationsQuery.refetch()}
            />
          ) : (
            <NotificationStateView
              icon={<Bell />}
              title="Chưa có thông báo phù hợp"
              description="Thử đổi bộ lọc hoặc quay lại sau khi hệ thống gửi thông báo mới."
            />
          )
        }
        ListFooterComponent={
          notifications.length > 0 && notificationsQuery.hasNextPage ? (
            <View style={styles.footer}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Xem thêm thông báo"
                disabled={notificationsQuery.isFetchingNextPage}
                onPress={() => void notificationsQuery.fetchNextPage()}
                style={({ pressed }) => [
                  styles.loadMoreButton,
                  pressed ? styles.pressed : null,
                ]}
              >
                <ThemedText type="action" style={styles.loadMoreText}>
                  {notificationsQuery.isFetchingNextPage
                    ? "Đang tải..."
                    : "Xem thêm"}
                </ThemedText>
              </Pressable>
            </View>
          ) : null
        }
      />
    </StackScreenLayout>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: 0,
  },
  listContent: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 28,
  },
  headerContent: {
    gap: 14,
    marginBottom: 14,
  },
  separator: {
    height: 12,
  },
  footer: {
    alignItems: "center",
    paddingTop: 16,
  },
  loadMoreButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
  },
  loadMoreText: {
    color: Colors.light.surface,
  },
  pressed: {
    opacity: 0.78,
  },
});
