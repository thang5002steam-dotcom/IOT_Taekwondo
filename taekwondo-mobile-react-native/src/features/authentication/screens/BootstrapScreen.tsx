import { Image } from 'expo-image';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function BootstrapScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content} accessibilityRole="progressbar">
        <Image
          source={require('@/assets/taekwondo-removebg-preview.png')}
          style={styles.logo}
          contentFit="contain"
          accessibilityLabel="Taekwondo Văn Quán"
        />
        <ActivityIndicator size="small" color="#A9151A" />
        <Text style={styles.label}>Đang khôi phục phiên đăng nhập</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  logo: { width: 190, height: 145 },
  label: { color: '#5F5F66', fontSize: 15 },
});
