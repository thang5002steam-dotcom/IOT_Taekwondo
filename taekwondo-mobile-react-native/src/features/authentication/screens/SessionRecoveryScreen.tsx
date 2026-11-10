import { RefreshCw } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authSessionService } from '../services/authSessionService';
import { useAuthStore } from '../store/auth.store';

export function SessionRecoveryScreen() {
  const message = useAuthStore((state) => state.recoveryMessage);
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.icon}>
          <RefreshCw size={26} color="#A9151A" aria-hidden />
        </View>
        <Text style={styles.title}>Chưa thể kết nối</Text>
        <Text style={styles.message} accessibilityRole="alert">
          {message ?? 'Vui lòng kiểm tra mạng và thử lại.'}
        </Text>
        <Pressable
          onPress={() => void authSessionService.bootstrap()}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, pressed ? styles.pressed : null]}>
          <Text style={styles.buttonText}>Thử lại</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28, gap: 14 },
  icon: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#FCEBEC', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#18181B', fontSize: 24, fontWeight: '800' },
  message: { color: '#626268', fontSize: 15, lineHeight: 22, textAlign: 'center' },
  button: { minHeight: 50, minWidth: 160, marginTop: 8, backgroundColor: '#A9151A', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.82 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
