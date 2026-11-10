import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ForbiddenScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.emoji} accessibilityElementsHidden>
          🔒
        </Text>
        <Text style={styles.title}>
          Không có quyền truy cập
        </Text>
        <Text style={styles.description}>
          Tài khoản hiện tại không được phép xem nội dung này. Vui lòng liên hệ
          quản trị viên nếu bạn cần quyền truy cập.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Về trang chủ"
          onPress={() => router.replace('/')}
          style={({ pressed }) => [
            styles.homeButton,
            pressed ? styles.homeButtonPressed : null,
          ]}
        >
          <Text style={styles.homeButtonText}>
            Về trang chủ
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F8',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 10,
  },
  emoji: {
    fontSize: 44,
    marginBottom: 6,
  },
  title: {
    color: '#18181B',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    color: '#626268',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  homeButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: '#A9151A',
    paddingHorizontal: 24,
    marginTop: 12,
  },
  homeButtonPressed: {
    opacity: 0.8,
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
