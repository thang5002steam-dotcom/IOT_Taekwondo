import { LogOut } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useLogout } from '../hooks/useAuthentication';

export function LogoutButton() {
  const [confirming, setConfirming] = useState(false);
  const logout = useLogout();

  return (
    <>
      <Pressable
        onPress={() => setConfirming(true)}
        accessibilityRole="button"
        style={({ pressed }) => [styles.trigger, pressed ? styles.pressed : null]}>
        <LogOut size={20} color="#A9151A" aria-hidden />
        <Text style={styles.triggerText}>Đăng xuất</Text>
      </Pressable>
      <Modal
        visible={confirming}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirming(false)}>
        <View style={styles.overlay}>
          <View style={styles.dialog} accessibilityViewIsModal accessibilityRole="alert">
            <Text style={styles.title}>Bạn có chắc muốn đăng xuất?</Text>
            <Text style={styles.description}>
              Phiên hiện tại trên thiết bị này sẽ kết thúc.
            </Text>
            <View style={styles.actions}>
              <Pressable
                disabled={logout.isPending}
                onPress={() => setConfirming(false)}
                accessibilityRole="button"
                style={styles.cancelButton}>
                <Text style={styles.cancelText}>Hủy</Text>
              </Pressable>
              <Pressable
                disabled={logout.isPending}
                onPress={() => logout.mutate()}
                accessibilityRole="button"
                accessibilityState={{ busy: logout.isPending }}
                style={styles.logoutButton}>
                {logout.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.logoutText}>Đăng xuất</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: '#D8B2B4',
    borderRadius: 6,
  },
  triggerText: { color: '#A9151A', fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.8 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20,20,23,0.54)',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 24,
    gap: 14,
  },
  title: { color: '#18181B', fontSize: 20, fontWeight: '800' },
  description: { color: '#5E5E65', fontSize: 15, lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  cancelButton: {
    minHeight: 50,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D7D7DC',
    borderRadius: 6,
  },
  cancelText: { color: '#35353A', fontWeight: '700' },
  logoutButton: {
    minHeight: 50,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A9151A',
    borderRadius: 6,
  },
  logoutText: { color: '#FFFFFF', fontWeight: '800' },
});
