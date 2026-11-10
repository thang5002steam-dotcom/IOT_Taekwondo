import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { ThemedText } from '@/shared/ui/ThemedText';
import { Colors, radii } from '@/theme';
import { sparringApi } from '../data/sparringApi';
import { isSparringRoomCode } from '../domain/sparringRoom';

export function SparringLobbyScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      const room = await sparringApi.createRoom();
      router.push(`/tkd/${room.roomCode}` as Href);
    } catch {
      setError('Không thể tạo sàn đấu. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };

  const join = async () => {
    if (!isSparringRoomCode(code)) {
      setError('Nhập đúng 4 chữ số.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await sparringApi.getRoom(code);
      router.push(`/tkd/${code}` as Href);
    } catch {
      setError('Không tìm thấy sàn đấu.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <ThemedText style={styles.logo}>
          TAEKWONDO <ThemedText style={styles.logoAccent}>VĂN QUÁN</ThemedText>
        </ThemedText>
      </View>
      <View style={styles.main}>
        <View style={styles.column}>
          <ThemedText style={styles.title}>REFEREE PRACTICE</ThemedText>
          <Pressable
            onPress={() => router.push('/tkd/practice' as Href)}
            style={styles.button}>
            <ThemedText>TẬP LÀM TRỌNG TÀI</ThemedText>
          </Pressable>
        </View>
        <View style={styles.column}>
          <ThemedText style={styles.title}>START A NEW RING</ThemedText>
          <Pressable
            disabled={busy}
            onPress={() => void create()}
            style={styles.button}>
            <ThemedText>{busy ? 'CREATING...' : 'CREATE'}</ThemedText>
          </Pressable>
        </View>
        <View style={styles.divider} />
        <View style={styles.column}>
          <ThemedText style={styles.title}>JOIN A RING</ThemedText>
          <TextInput
            value={code}
            onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 4))}
            placeholder="ENTER 4-DIGIT CODE"
            keyboardType="numeric"
            maxLength={4}
            style={styles.input}
          />
          <Pressable
            disabled={busy}
            onPress={() => void join()}
            style={styles.button}>
            <ThemedText>{busy ? 'JOINING...' : 'JOIN'}</ThemedText>
          </Pressable>
        </View>
      </View>
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: 'white' },
  header: {
    height: 92,
    backgroundColor: '#202020',
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  logo: { fontSize: 28, fontWeight: '800', fontStyle: 'italic', color: 'white' },
  logoAccent: { color: Colors.light.primary },
  main: {
    flex: 1,
    flexDirection: 'row',
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 48,
  },
  column: { width: 360, alignItems: 'center', gap: 18 },
  title: { fontSize: 30, fontWeight: '800' },
  button: {
    width: '85%',
    height: 42,
    borderRadius: radii.lg,
    backgroundColor: '#D5D5D5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 2,
    borderColor: '#888',
    borderRadius: 28,
    textAlign: 'center',
    fontSize: 22,
  },
  divider: { width: 2, height: 280, backgroundColor: '#999' },
  hint: { color: Colors.light.textSecondary },
  error: {
    position: 'absolute',
    top: 76,
    alignSelf: 'center',
    color: Colors.light.primary,
  },
});
