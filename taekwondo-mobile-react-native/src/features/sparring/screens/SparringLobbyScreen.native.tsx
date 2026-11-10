import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import StackScreenLayout from '@/routes/navigation/layouts/StackScreenLayout';
import { ThemedText } from '@/shared/ui/ThemedText';
import { Colors, effects, radii, typography } from '@/theme';
import { isSparringRoomCode } from '../domain/sparringRoom';
import { sparringApi } from '../data/sparringApi';

export function SparringLobbyScreen() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [joining, setJoining] = useState(false);
  const join = async () => {
    if (!isSparringRoomCode(roomCode)) { Alert.alert('Mã không hợp lệ', 'Nhập đúng 4 chữ số của sàn đấu.'); return; }
    setJoining(true);
    try { await sparringApi.getRoom(roomCode); router.push(`/tkd/${roomCode}` as Href); }
    catch { Alert.alert('Không tìm thấy sàn đấu', 'Kiểm tra lại Ring Code rồi thử lại.'); }
    finally { setJoining(false); }
  };
  return <StackScreenLayout title="ĐỐI KHÁNG" headerVariant="dark" scrollEnabled={false} refreshEnabled={false} contentContainerStyle={styles.content}>
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Vào chế độ tập làm trọng tài"
        onPress={() => router.push('/tkd/practice' as Href)}
        style={({ pressed }) => [styles.practice, pressed && styles.pressed]}>
        <ThemedText type="subtitle" style={styles.practiceText}>TẬP LÀM TRỌNG TÀI</ThemedText>
      </Pressable>
      <ThemedText style={styles.hint}>Hoặc vào sàn Đối kháng thật</ThemedText>
      <ThemedText type="subtitle" style={styles.heading}>RING CODE</ThemedText>
      <TextInput value={roomCode} onChangeText={(value) => setRoomCode(value.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" maxLength={4} autoFocus accessibilityLabel="Mã sàn đấu" style={styles.input} placeholder="0000" placeholderTextColor={Colors.light.textSecondary} />
      <Pressable accessibilityRole="button" accessibilityLabel="Vào sàn đấu" accessibilityState={{ disabled: joining }} disabled={joining} onPress={() => void join()} style={({ pressed }) => [styles.join, pressed && styles.pressed, joining && styles.disabled]}>
        <ThemedText type="subtitle" style={styles.joinText}>{joining ? 'ĐANG VÀO...' : 'JOIN'}</ThemedText>
      </Pressable>
    </View>
  </StackScreenLayout>;
}
const styles = StyleSheet.create({ content:{ flexGrow:1, justifyContent:'center', paddingHorizontal:20, paddingBottom:96 }, card:{ alignItems:'center', gap:28 }, practice:{ width:'100%', minHeight:64, borderRadius:radii.lg, backgroundColor:Colors.light.primary, alignItems:'center', justifyContent:'center', ...effects.card }, practiceText:{ color:Colors.light.surface, fontSize:20 }, hint:{ color:Colors.light.textSecondary }, heading:{ ...typography.subtitle, color:Colors.light.text, fontSize:34, lineHeight:42 }, input:{ width:'100%', height:132, borderRadius:radii.xl, backgroundColor:Colors.light.backgroundElement, color:Colors.light.text, fontSize:40, textAlign:'center', letterSpacing:8 }, join:{ minWidth:220, minHeight:120, borderRadius:radii.lg, backgroundColor:Colors.light.success, alignItems:'center', justifyContent:'center', ...effects.card }, joinText:{ color:Colors.light.surface, fontSize:34 }, pressed:{ opacity:.8, transform:[{scale:.98}] }, disabled:{ opacity:.55 } });
