import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { Permission, useCan } from '@/features/authorization';
import StackScreenLayout from '@/routes/navigation/layouts/StackScreenLayout';
import { ConfirmationDialog } from '@/shared/ui/ConfirmationDialog';
import { FormField, InfoRow, PrimaryActionButton, SurfaceCard } from '@/shared/ui/commerce/CommercePrimitives';
import { ThemedText } from '@/shared/ui/ThemedText';
import { useToast } from '@/shared/ui/Toast';
import { Colors, radii } from '@/theme';
import { formatVnd } from '@/shared/utils/currency';
import { getApiErrorMessage } from '@/infrastructure/http/httpError';

import { WalletTopUpRequestStatusLabel } from '../constants/top-up-request.constants';
import {
  useApproveTopUpRequest,
  useRejectTopUpRequest,
  useTopUpProofUrl,
  useTopUpRequest,
} from '../queries/walletTopUpRequestQueries';

export function TopUpRequestReviewDetailScreen({ requestId }: { requestId?: string }) {
  const router = useRouter();
  const toast = useToast();
  const canReview = useCan(Permission.WALLET_TOP_UP_REVIEW);
  const requestQuery = useTopUpRequest(requestId, canReview);
  const proofQuery = useTopUpProofUrl(requestId, canReview);
  const approve = useApproveTopUpRequest();
  const reject = useRejectTopUpRequest();
  const [rejectReason, setRejectReason] = useState('');
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);

  const request = requestQuery.data;
  const pending = approve.isPending || reject.isPending;

  const approveRequest = async () => {
    if (!requestId) return;
    try {
      await approve.mutateAsync(requestId);
      toast.show({ message: 'Đã duyệt và cộng tiền vào ví học viên.', variant: 'success' });
      router.back();
    } catch (error) {
      toast.show({ message: getApiErrorMessage(error, 'Không thể duyệt yêu cầu.'), variant: 'error' });
    } finally {
      setConfirmApprove(false);
    }
  };

  const rejectRequest = async () => {
    if (!requestId || !rejectReason.trim()) return;
    try {
      await reject.mutateAsync({ requestId, reason: rejectReason.trim() });
      toast.show({ message: 'Đã từ chối yêu cầu nạp tiền.', variant: 'success' });
      router.back();
    } catch (error) {
      toast.show({ message: getApiErrorMessage(error, 'Không thể từ chối yêu cầu.'), variant: 'error' });
    } finally {
      setConfirmReject(false);
    }
  };

  if (!canReview) {
    return (
      <StackScreenLayout title="Chi tiết yêu cầu" contentContainerStyle={styles.center}>
        <ThemedText type="bodySmall" style={styles.text}>Bạn không có quyền duyệt yêu cầu nạp tiền.</ThemedText>
      </StackScreenLayout>
    );
  }

  if (requestQuery.isLoading) {
    return <StackScreenLayout title="Chi tiết yêu cầu" contentContainerStyle={styles.center}>
      <ActivityIndicator size="large" color={Colors.light.primary} />
    </StackScreenLayout>;
  }

  if (!request || requestQuery.isError) {
    return <StackScreenLayout title="Chi tiết yêu cầu" contentContainerStyle={styles.center}>
      <ThemedText type="bodySmall" style={styles.text}>Không thể tải yêu cầu nạp tiền.</ThemedText>
      <Pressable accessibilityRole="button" onPress={() => void requestQuery.refetch()}>
        <ThemedText type="action" style={styles.primary}>Thử lại</ThemedText>
      </Pressable>
    </StackScreenLayout>;
  }

  return (
    <StackScreenLayout title="Chi tiết yêu cầu" contentContainerStyle={styles.content}>
      <SurfaceCard>
        <InfoRow label="Học viên" value={request.studentName} />
        <InfoRow label="Ngày gửi" value={new Date(request.createdAt).toLocaleString('vi-VN')} />
        <InfoRow label="Số tiền" value={formatVnd(request.amount)} />
        <InfoRow label="Trạng thái" value={WalletTopUpRequestStatusLabel[request.status]} />
        <InfoRow label="Ghi chú" value={request.note || 'Không có'} />
      </SurfaceCard>

      <SurfaceCard soft style={styles.proofCard}>
        <ThemedText type="title" style={styles.text}>Ảnh chứng từ</ThemedText>
        {proofQuery.isLoading ? <ActivityIndicator color={Colors.light.primary} /> : null}
        {proofQuery.data?.url ? (
          <Image
            source={{ uri: proofQuery.data.url }}
            contentFit="contain"
            style={styles.proofImage}
            accessibilityLabel="Ảnh chứng từ chuyển khoản"
          />
        ) : null}
        {proofQuery.isError ? (
          <Pressable accessibilityRole="button" onPress={() => void proofQuery.refetch()}>
            <ThemedText type="action" style={styles.primary}>Tải lại ảnh chứng từ</ThemedText>
          </Pressable>
        ) : null}
      </SurfaceCard>

      {request.status === 'PENDING' ? (
        <>
          <ThemedText type="bodySmall" style={styles.warning}>
            Ảnh chỉ hỗ trợ đối soát. Hãy kiểm tra tiền thực nhận trước khi duyệt.
          </ThemedText>
          <PrimaryActionButton title="Đã đối soát, duyệt nạp tiền" onPress={() => setConfirmApprove(true)} />
          <FormField
            label="Lý do từ chối"
            value={rejectReason}
            placeholder="Nhập lý do để phụ huynh biết cách xử lý"
            maxLength={500}
            onChangeText={setRejectReason}
          />
          <PrimaryActionButton
            title="Từ chối yêu cầu"
            variant="outline"
            disabled={!rejectReason.trim()}
            onPress={() => setConfirmReject(true)}
          />
        </>
      ) : null}

      <ConfirmationDialog
        visible={confirmApprove}
        title="Xác nhận đã nhận tiền"
        description={`Cộng ${formatVnd(request.amount)} vào ví ${request.studentName}. Thao tác này sẽ ghi sổ giao dịch.`}
        confirmLabel="Duyệt nạp tiền"
        pending={pending}
        onCancel={() => setConfirmApprove(false)}
        onConfirm={() => void approveRequest()}
      />
      <ConfirmationDialog
        visible={confirmReject}
        title="Từ chối yêu cầu"
        description={`Từ chối yêu cầu của ${request.studentName} với lý do: ${rejectReason.trim()}`}
        confirmLabel="Từ chối"
        confirmVariant="danger"
        pending={pending}
        onCancel={() => setConfirmReject(false)}
        onConfirm={() => void rejectRequest()}
      />
    </StackScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { gap: 20, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 32 },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  proofCard: { gap: 12 },
  proofImage: { width: '100%', aspectRatio: 4 / 3, borderRadius: radii.md, backgroundColor: Colors.light.backgroundElement },
  text: { color: Colors.light.text },
  primary: { color: Colors.light.primary },
  warning: { color: Colors.light.warning },
});

