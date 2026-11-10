import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronRight, Database, HardDrive, ShieldCheck, Terminal, UserRoundCog } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LogoutButton, useAuthSession } from '@/features/authentication';
import { storageLogger } from '@/infrastructure/storage/storageLogger';

export default function HomeScreen() {
  const router = useRouter();
  const { user, activeContext, availableContextCount } = useAuthSession();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic">
        <View style={styles.brandRow}>
          <Image
            source={require('@/assets/taekwondo-removebg-preview.png')}
            style={styles.logo}
            contentFit="contain"
            accessibilityLabel="Taekwondo Văn Quán"
          />
          <View style={styles.brandCopy}>
            <Text style={styles.eyebrow}>TAEKWONDO VĂN QUÁN</Text>
            <Text style={styles.greeting}>Xin chào</Text>
          </View>
        </View>

        <View style={styles.identityBand}>
          <Text style={styles.name}>{activeContext?.displayName ?? user?.phoneNumber ?? 'Thành viên'}</Text>
          <Text style={styles.meta}>
            {activeContext
              ? `${activeContext.personCode ?? activeContext.relationshipType ?? 'Hồ sơ'} · ${user?.phoneNumber ?? ''}`
              : user?.phoneNumber ?? ''}
          </Text>
        </View>

        {availableContextCount > 1 ? (
          <Pressable
            onPress={() =>
              router.push({ pathname: '/(context)/select', params: { mode: 'switch' } })
            }
            accessibilityRole="button"
            style={({ pressed }) => [styles.action, pressed ? styles.pressed : null]}>
            <View style={styles.actionIcon}>
              <UserRoundCog size={22} color="#A9151A" aria-hidden />
            </View>
            <View style={styles.actionCopy}>
              <Text style={styles.actionTitle}>Chuyển hồ sơ</Text>
              <Text style={styles.actionDescription}>Thay đổi ngữ cảnh và quyền đang sử dụng</Text>
            </View>
            <ChevronRight size={21} color="#73737B" aria-hidden />
          </Pressable>
        ) : null}

        <View style={styles.debugSection}>
          <Text style={styles.sectionTitle}>Bộ nhớ & Storage Debug</Text>
          <Text style={styles.sectionDescription}>
            Nhấn các nút bên dưới để in thông tin bộ nhớ lưu trữ ra Console ngay ngắn.
          </Text>

          <View style={styles.debugGrid}>
            <Pressable
              onPress={() => void storageLogger.logAsyncStorage()}
              style={({ pressed }) => [styles.debugBtn, pressed ? styles.pressed : null]}>
              <HardDrive size={18} color="#252529" />
              <Text style={styles.debugBtnText}>AsyncStorage</Text>
            </Pressable>

            <Pressable
              onPress={() => void storageLogger.logSecureStore()}
              style={({ pressed }) => [styles.debugBtn, pressed ? styles.pressed : null]}>
              <ShieldCheck size={18} color="#252529" />
              <Text style={styles.debugBtnText}>SecureStore</Text>
            </Pressable>

            <Pressable
              onPress={() => void storageLogger.logSQLite()}
              style={({ pressed }) => [styles.debugBtn, pressed ? styles.pressed : null]}>
              <Database size={18} color="#252529" />
              <Text style={styles.debugBtnText}>SQLite</Text>
            </Pressable>

            <Pressable
              onPress={() => void storageLogger.logAll()}
              style={({ pressed }) => [styles.debugBtnAll, pressed ? styles.pressed : null]}>
              <Terminal size={18} color="#FFFFFF" />
              <Text style={styles.debugBtnAllText}>Log tất cả</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sessionSection}>
          <Text style={styles.sectionTitle}>Phiên đăng nhập</Text>
          <Text style={styles.sectionDescription}>
            Tài khoản và ngữ cảnh được bảo vệ trên thiết bị này.
          </Text>
          <LogoutButton />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingBottom: 110, gap: 24 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  logo: { width: 82, height: 66 },
  brandCopy: { flex: 1, gap: 3 },
  eyebrow: { color: '#A9151A', fontSize: 11, fontWeight: '800' },
  greeting: { color: '#202024', fontSize: 25, fontWeight: '800' },
  identityBand: {
    borderLeftWidth: 4,
    borderLeftColor: '#A9151A',
    paddingVertical: 12,
    paddingLeft: 16,
    backgroundColor: '#FAFAFB',
    gap: 5,
  },
  name: { color: '#18181B', fontSize: 21, fontWeight: '800' },
  meta: { color: '#65656C', fontSize: 14 },
  action: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderWidth: 1,
    borderColor: '#E0E0E4',
    borderRadius: 8,
    padding: 14,
  },
  actionIcon: { width: 46, height: 46, borderRadius: 8, backgroundColor: '#FCEBEC', alignItems: 'center', justifyContent: 'center' },
  actionCopy: { flex: 1, gap: 3 },
  actionTitle: { color: '#252529', fontSize: 16, fontWeight: '700' },
  actionDescription: { color: '#68686F', fontSize: 13, lineHeight: 18 },
  pressed: { opacity: 0.78 },
  debugSection: { gap: 10, marginTop: 4 },
  debugGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  debugBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E4',
    backgroundColor: '#F8F8F9',
  },
  debugBtnText: { color: '#252529', fontSize: 13, fontWeight: '600' },
  debugBtnAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#A9151A',
  },
  debugBtnAllText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  sessionSection: { gap: 10, marginTop: 6 },
  sectionTitle: { color: '#252529', fontSize: 17, fontWeight: '800' },
  sectionDescription: { color: '#68686F', fontSize: 14, lineHeight: 20, marginBottom: 4 },
});
