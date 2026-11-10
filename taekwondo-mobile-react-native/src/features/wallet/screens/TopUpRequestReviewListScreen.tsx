import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Permission, useCan } from '@/features/authorization';
import { asHref } from '@/features/student-commerce/utils/studentCommerceUtils';
import StackScreenLayout from '@/routes/navigation/layouts/StackScreenLayout';
import { SurfaceCard } from '@/shared/ui/commerce/CommercePrimitives';
import { ThemedText } from '@/shared/ui/ThemedText';
import { Colors, activeEffect } from '@/theme';
import { formatVnd } from '@/shared/utils/currency';

import { useTopUpRequestsForReview } from '../queries/walletTopUpRequestQueries';

export function TopUpRequestReviewListScreen() {
  const router = useRouter();
  const canReview = useCan(Permission.WALLET_TOP_UP_REVIEW);
  const requests = useTopUpRequestsForReview('PENDING', canReview);

  if (!canReview) {
    return (
      <StackScreenLayout title="Duyệt nạp tiền" contentContainerStyle={styles.center}>
        <ThemedText type="bodySmall" style={styles.text}>Bạn không có quyền duyệt yêu cầu nạp tiền.</ThemedText>
      </StackScreenLayout>
    );
  }

  return (
    <StackScreenLayout title="Duyệt nạp tiền" contentContainerStyle={styles.content}>
      {requests.isLoading ? <ActivityIndicator size="large" color={Colors.light.primary} /> : null}
      {requests.isError ? (
        <View style={styles.center}>
          <ThemedText type="bodySmall" style={styles.text}>Không thể tải danh sách yêu cầu.</ThemedText>
          <Pressable accessibilityRole="button" onPress={() => void requests.refetch()}>
            <ThemedText type="action" style={styles.primary}>Thử lại</ThemedText>
          </Pressable>
        </View>
      ) : null}
      {!requests.isLoading && !requests.isError && requests.data?.content.length === 0 ? (
        <ThemedText type="bodySmall" style={styles.secondary}>Không có yêu cầu đang chờ đối soát.</ThemedText>
      ) : null}
      {requests.data?.content.map((request) => (
        <Pressable
          key={request.topUpRequestId}
          accessibilityRole="button"
          accessibilityLabel={`Xem yêu cầu nạp tiền của ${request.studentName}`}
          onPress={() => router.push(asHref(`/wallet/top-up-requests/${request.topUpRequestId}`))}
          style={({ pressed }) => activeEffect(pressed, 'pressed')}
        >
          <SurfaceCard>
            <View style={styles.row}>
              <ThemedText type="title" style={styles.text}>{request.studentName}</ThemedText>
              <ThemedText type="action" style={styles.primary}>{formatVnd(request.amount)}</ThemedText>
            </View>
            <ThemedText type="bodySmall" style={styles.secondary}>
              {request.personCode || 'Không có mã học viên'} · Chờ đối soát
            </ThemedText>
            {request.note ? <ThemedText type="bodySmall" style={styles.text}>{request.note}</ThemedText> : null}
          </SurfaceCard>
        </Pressable>
      ))}
    </StackScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 32 },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  text: { color: Colors.light.text },
  secondary: { color: Colors.light.textSecondary },
  primary: { color: Colors.light.primary },
});

