import { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import StackScreenLayout from '@/routes/navigation/layouts/StackScreenLayout';
import { ThemedText } from '@/shared/ui/ThemedText';
import { Colors, radii } from '@/theme';
import { practiceApi } from '@/features/sparring-practice/data/practiceApi';

export default function PracticeLobby() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const canJoin = /^\d{4}$/.test(code) && !joining;

  const changeCode = (value: string) => {
    const nextCode = value.replace(/\D/g, '').slice(0, 4);
    setCode(nextCode);
    if (nextCode.length === 4) Keyboard.dismiss();
  };

  const join = async () => {
    Keyboard.dismiss();
    if (!/^\d{4}$/.test(code)) {
      Alert.alert('Mã không hợp lệ', 'Nhập 4 chữ số của phòng luyện tập.');
      return;
    }
    setJoining(true);
    try {
      await practiceApi.get(code);
      router.push(`/tkd/practice/${code}` as Href);
    } catch {
      Alert.alert('Không tìm thấy phòng', 'Kiểm tra lại mã phòng.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <StackScreenLayout
      title="TẬP LÀM TRỌNG TÀI"
      headerVariant="dark"
      scrollEnabled={false}
      refreshEnabled={false}
      contentContainerStyle={styles.content}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={12}
        style={styles.keyboardArea}
      >
        <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
          <View style={styles.card}>
            <ThemedText type="subtitle">MÃ PHÒNG</ThemedText>
            <TextInput
              accessibilityLabel="Mã phòng luyện tập"
              value={code}
              onChangeText={changeCode}
              onSubmitEditing={() => { if (canJoin) void join(); }}
              keyboardType="number-pad"
              returnKeyType="done"
              maxLength={4}
              autoFocus
              style={styles.input}
              placeholder="0000"
              placeholderTextColor={Colors.light.textSecondary}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Vào làm giám định"
              accessibilityState={{ disabled: !canJoin }}
              disabled={!canJoin}
              onPress={() => void join()}
              style={({ pressed }) => [
                styles.button,
                !canJoin && styles.buttonDisabled,
                pressed && canJoin && styles.buttonPressed,
              ]}
            >
              <ThemedText style={styles.buttonText}>
                {joining ? 'ĐANG VÀO…' : 'VÀO LÀM GIÁM ĐỊNH'}
              </ThemedText>
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </StackScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 20 },
  keyboardArea: { flex: 1 },
  card: { flex: 1, justifyContent: 'center', gap: 20 },
  input: {
    height: 72,
    backgroundColor: Colors.light.surface,
    borderRadius: radii.md,
    fontSize: 28,
    textAlign: 'center',
    letterSpacing: 8,
  },
  button: {
    minHeight: 60,
    backgroundColor: Colors.light.success,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.42 },
  buttonPressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  buttonText: { color: Colors.light.surface, fontWeight: '800' },
});
