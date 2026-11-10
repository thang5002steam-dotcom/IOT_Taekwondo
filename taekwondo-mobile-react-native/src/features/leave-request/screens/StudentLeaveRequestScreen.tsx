import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import StackScreenLayout from '@/routes/navigation/layouts/StackScreenLayout';
import { BottomSheetWindow } from '@/shared/ui/BottomSheetWindow';
import { ThemedText } from '@/shared/ui/ThemedText';
import { PrimaryActionButton } from '@/shared/ui/commerce/CommercePrimitives';
import { Colors, radii } from '@/theme';
import { studentSessionBookingApi } from '@/features/student-enrollment/api/studentSessionBookingApi';
import type { StudentSessionBooking, StudentSessionOption } from '@/features/student-enrollment/api/student-session-booking.dto';
import { leaveRequestApi } from '../api/leaveRequestApi';

export function StudentLeaveRequestScreen({ enrollmentId }: { enrollmentId: string }) {
  const queryClient = useQueryClient();
  const [leaveBooking, setLeaveBooking] = useState<StudentSessionBooking>();
  const [makeupSession, setMakeupSession] = useState<StudentSessionOption>();
  const [reason, setReason] = useState('');
  const [sourceSheet, setSourceSheet] = useState(false);
  const [makeupSheet, setMakeupSheet] = useState(false);
  const [confirmSheet, setConfirmSheet] = useState(false);
  const sources = useQuery({ queryKey: ['leave-options', enrollmentId], queryFn: () => studentSessionBookingApi.leaveOptions(enrollmentId) });
  const makeup = useQuery({ queryKey: ['makeup-options', enrollmentId, leaveBooking?.bookingId], queryFn: () => studentSessionBookingApi.makeupOptions(enrollmentId, leaveBooking!.bookingId), enabled: Boolean(leaveBooking) });
  const create = useMutation({ mutationFn: () => leaveRequestApi.createStudent({ leaveBookingId: leaveBooking!.bookingId, makeupClassSessionId: makeupSession!.classSessionId, leaveContext: reason.trim() }), onSuccess: () => {
    setConfirmSheet(false);
    void queryClient.invalidateQueries({ queryKey: ['leave-options', enrollmentId] });
    void queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
  } });
  const canSubmit = Boolean(leaveBooking && makeupSession && reason.trim());
  return <>
    <StackScreenLayout title="Xin nghỉ và học bù" contentContainerStyle={styles.screen}>
      <ThemedText type="bodySmall" style={styles.muted}>Bạn bắt buộc chọn buổi học bù. Chỗ sẽ được giữ ngay khi gửi đơn và chỉ được tham gia sau khi admin duyệt.</ThemedText>
      <Picker title="Buổi xin nghỉ" value={leaveBooking ? `Booking ${leaveBooking.bookingId.slice(0, 8)}` : 'Chọn buổi xin nghỉ'} onPress={() => setSourceSheet(true)} />
      <Picker title="Buổi học bù" value={makeupSession ? `${makeupSession.sessionDate} · ${makeupSession.courseName}` : 'Chọn buổi học bù'} disabled={!leaveBooking} onPress={() => setMakeupSheet(true)} />
      <View style={styles.field}><ThemedText type="subtitle">Lý do</ThemedText><TextInput multiline value={reason} onChangeText={setReason} placeholder="Nhập lý do nghỉ" placeholderTextColor={Colors.light.textSecondary} style={styles.input} /></View>
      {create.isError ? <ThemedText type="bodySmall" style={styles.error}>Không thể giữ chỗ học bù. Vui lòng tải lại danh sách và thử lại.</ThemedText> : null}
      <PrimaryActionButton title="Gửi yêu cầu" disabled={!canSubmit} onPress={() => setConfirmSheet(true)} />
    </StackScreenLayout>
    <BottomSheetWindow visible={sourceSheet} title="Chọn buổi xin nghỉ" heightRatio={0.68} onClose={() => setSourceSheet(false)}>
      {sources.data?.map((booking) => <Row key={booking.bookingId} title={`Buổi ${booking.classSessionId.slice(0, 8)}`} subtitle="Booking còn hiệu lực" onPress={() => { setLeaveBooking(booking); setMakeupSession(undefined); setSourceSheet(false); }} />)}
    </BottomSheetWindow>
    <BottomSheetWindow visible={makeupSheet} title="Chọn buổi học bù" heightRatio={0.75} onClose={() => setMakeupSheet(false)}>
      {makeup.data?.map((session) => <Row key={session.classSessionId} title={`${session.sessionDate} · ${session.startTime}–${session.endTime}`} subtitle={`${session.courseName} · còn ${session.remainingCapacity} chỗ${session.bookable ? '' : ` · ${session.unavailableReason}`}`} disabled={!session.bookable} onPress={() => { setMakeupSession(session); setMakeupSheet(false); }} />)}
    </BottomSheetWindow>
    <BottomSheetWindow visible={confirmSheet} title="Xác nhận giữ chỗ" heightRatio={0.46} onClose={() => setConfirmSheet(false)} footer={<PrimaryActionButton title="Gửi đơn và giữ chỗ" loading={create.isPending} onPress={() => create.mutate()} />}>
      <ThemedText type="body">Buổi học bù sẽ được giữ chỗ ngay. Bạn chỉ có thể check-in sau khi admin duyệt yêu cầu.</ThemedText>
    </BottomSheetWindow>
  </>;
}

function Picker({ title, value, onPress, disabled }: { title: string; value: string; onPress: () => void; disabled?: boolean }) { return <View style={styles.field}><ThemedText type="subtitle">{title}</ThemedText><Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.pick, disabled ? styles.disabled : null, pressed ? styles.pressed : null]}><ThemedText type="body">{value}</ThemedText></Pressable></View>; }
function Row({ title, subtitle, onPress, disabled }: { title: string; subtitle: string; onPress: () => void; disabled?: boolean }) { return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.row, disabled ? styles.disabled : null, pressed ? styles.pressed : null]}><ThemedText type="body">{title}</ThemedText><ThemedText type="bodySmall" style={styles.muted}>{subtitle}</ThemedText></Pressable>; }
const styles = StyleSheet.create({ screen: { paddingTop: 20, paddingBottom: 40, gap: 18 }, muted: { color: Colors.light.textSecondary }, error: { color: Colors.light.error }, field: { gap: 8 }, input: { minHeight: 96, borderWidth: 1, borderColor: Colors.light.divider, borderRadius: radii.lg, padding: 14, color: Colors.light.text, textAlignVertical: 'top' }, pick: { borderWidth: 1, borderColor: Colors.light.divider, borderRadius: radii.lg, padding: 16, backgroundColor: Colors.light.surface }, row: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.light.divider, gap: 4 }, disabled: { opacity: 0.45 }, pressed: { opacity: 0.75 } });
