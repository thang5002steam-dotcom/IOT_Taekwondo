import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import StackScreenLayout from '@/routes/navigation/layouts/StackScreenLayout';
import { useAuthStore } from '@/features/authentication/store/auth.store';
import { BottomSheetWindow } from '@/shared/ui/BottomSheetWindow';
import { ThemedText } from '@/shared/ui/ThemedText';
import { PrimaryActionButton } from '@/shared/ui/commerce/CommercePrimitives';
import { Colors, radii } from '@/theme';
import { leaveRequestApi } from '../api/leaveRequestApi';
import type { LeaveRequestSimpleResponse } from '../api/leave-request.dto';

export function AdminLeaveRequestsScreen() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = Boolean(user?.roles.some((role) => role === 'SUPER_ADMIN' || role === 'SYSTEM_ADMIN'));
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<LeaveRequestSimpleResponse>();
  const requests = useQuery({ queryKey: ['leave-requests', 'admin'], queryFn: () => leaveRequestApi.list({ page: 0, size: 50 }), enabled: isAdmin });
  const approve = useMutation({ mutationFn: (id: string) => leaveRequestApi.approve(id), onSuccess: () => { setSelected(undefined); void queryClient.invalidateQueries({ queryKey: ['leave-requests'] }); } });
  const reject = useMutation({ mutationFn: (id: string) => leaveRequestApi.reject(id), onSuccess: () => { setSelected(undefined); void queryClient.invalidateQueries({ queryKey: ['leave-requests'] }); } });
  if (!isAdmin) return <StackScreenLayout title="Duyệt nghỉ phép"><ThemedText type="body">Chỉ quản trị viên hệ thống có thể duyệt yêu cầu nghỉ phép.</ThemedText></StackScreenLayout>;
  return <>
    <StackScreenLayout title="Duyệt nghỉ phép" contentContainerStyle={styles.screen}>
      {(requests.data?.content ?? []).map((request) => <Pressable key={request.leaveRequestId} onPress={() => setSelected(request)} style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}>
        <ThemedText type="subtitle">{request.person.fullName}</ThemedText>
        <ThemedText type="bodySmall" style={styles.muted}>{request.status} · {request.leaveClassSession?.sessionDate ?? request.leaveDate ?? '—'}</ThemedText>
      </Pressable>)}
    </StackScreenLayout>
    <BottomSheetWindow visible={Boolean(selected)} title="Xét duyệt yêu cầu" heightRatio={0.48} onClose={() => setSelected(undefined)} footer={<View style={styles.actions}><PrimaryActionButton title="Từ chối" variant="outline" loading={reject.isPending} onPress={() => selected && reject.mutate(selected.leaveRequestId)} /><PrimaryActionButton title="Duyệt" loading={approve.isPending} onPress={() => selected && approve.mutate(selected.leaveRequestId)} /></View>}>
      <ThemedText type="body">{selected?.person.fullName}</ThemedText><ThemedText type="bodySmall" style={styles.muted}>Buổi học bù đã được giữ chỗ; duyệt sẽ mở quyền check-in cho booking này.</ThemedText>
    </BottomSheetWindow>
  </>;
}
const styles = StyleSheet.create({ screen: { paddingTop: 20, gap: 10 }, row: { padding: 16, borderWidth: 1, borderColor: Colors.light.divider, borderRadius: radii.lg, gap: 5 }, muted: { color: Colors.light.textSecondary }, pressed: { opacity: 0.75 }, actions: { flexDirection: 'row', gap: 10 }, });
