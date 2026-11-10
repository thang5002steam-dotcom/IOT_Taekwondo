import { MessageCircle } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type SupportModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function SupportModal({ visible, onClose }: SupportModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.overlay}>
        <View
          style={styles.sheet}
          accessibilityViewIsModal
          accessibilityRole="alert">
          <View style={styles.iconSurface}>
            <MessageCircle size={24} color="#A9151A" aria-hidden />
          </View>
          <Text style={styles.title}>Cần hỗ trợ đăng nhập?</Text>
          <Text style={styles.description}>
            Nếu bạn quên mật khẩu hoặc chưa có tài khoản, vui lòng liên hệ Zalo
            số 036 9222 068 để được hỗ trợ nhanh.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [styles.button, pressed ? styles.pressed : null]}>
            <Text style={styles.buttonText}>Đã hiểu</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 20, 23, 0.54)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 24,
    gap: 14,
  },
  iconSurface: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FCEBEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#18181B',
    fontSize: 20,
    fontWeight: '800',
  },
  description: {
    color: '#56565D',
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    minHeight: 50,
    backgroundColor: '#A9151A',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    marginTop: 4,
  },
  pressed: { opacity: 0.82 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
