import { Bell } from "reicon-react-native";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";

import { HomeHeaderButton } from "@/routes/navigation/components/HomeHeaderButton";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { Colors } from "@/theme";

import { NotificationDetailInfoPanel } from "../components/NotificationDetailInfoPanel";
import {
  isNotificationMarkReadPending,
  useMarkNotificationRead,
  useNotificationDetail,
} from "../queries/notificationQueries";
import {
  NotificationSkeletonList,
  NotificationStateView,
} from "../components/NotificationStateView";

const notificationListHref = "/notifications" as Href;

export default function NotificationDetailScreen() {
  const router = useRouter();
  const { notificationRecipientId } = useLocalSearchParams<{
    notificationRecipientId?: string;
  }>();
  const detailQuery = useNotificationDetail(notificationRecipientId);
  const { mutate: markRead, isPending: isMarkReadPending } =
    useMarkNotificationRead();
  const detail = detailQuery.data;

  useEffect(() => {
    if (!detail || detail.read || isMarkReadPending) return;
    if (isNotificationMarkReadPending(detail.notificationRecipientId)) return;
    markRead(detail.notificationRecipientId);
  }, [detail, isMarkReadPending, markRead]);

  const backToList = () => {
    router.replace(notificationListHref);
  };

  return (
    <StackScreenLayout
      title="Chi tiết thông báo"
      rightActions={<HomeHeaderButton color={Colors.light.text} />}
      contentContainerStyle={styles.content}
    >
      {detailQuery.isLoading || detailQuery.isPending ? (
        <NotificationSkeletonList />
      ) : detailQuery.isError || !detail ? (
        <NotificationStateView
          icon={<Bell />}
          title="Không tìm thấy thông báo"
          description="Thông báo có thể đã bị xóa hoặc bạn không còn quyền xem."
          actionLabel="Thử lại"
          onActionPress={() => void detailQuery.refetch()}
        />
      ) : (
        <NotificationDetailInfoPanel detail={detail} onBackToList={backToList} />
      )}
    </StackScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingTop: 20,
  },
});
