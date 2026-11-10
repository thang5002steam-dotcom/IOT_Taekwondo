import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

export function AuthBrand() {
  return (
    <View style={styles.container} accessible accessibilityRole="header">
      <Image
        source={require('@/assets/taekwondo-removebg-preview.png')}
        style={styles.logo}
        contentFit="contain"
        accessibilityLabel="Taekwondo Văn Quán"
      />
      <Text style={styles.eyebrow}>TAEKWONDO VĂN QUÁN</Text>
      <Text style={styles.title}>Chào mừng trở lại</Text>
      <Text style={styles.subtitle}>Đăng nhập để quản lý hệ thống điểm danh</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
  },
  logo: {
    width: 176,
    height: 132,
  },
  eyebrow: {
    color: '#A9151A',
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    color: '#18181B',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#626268',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
