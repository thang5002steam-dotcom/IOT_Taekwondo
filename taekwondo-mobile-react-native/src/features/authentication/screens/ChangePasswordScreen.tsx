import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import StackScreenLayout from '@/routes/navigation/layouts/StackScreenLayout';
import { Colors, Spacing, typography } from '@/theme';
import { authApi } from '../api/authApi';
import { Field, InlineAlert, PasswordField, PrimaryButton } from '../components/PasswordFormPrimitives';
import { authSessionService } from '../services/authSessionService';
import { passwordRecoveryError } from '../utils/passwordRecoveryError';

export default function ChangePasswordScreen() {
  const [oldPassword, setOldPassword] = useState(''); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const submit = async () => { if (password.length < 6) return setError('Mật khẩu mới cần có ít nhất 6 ký tự.'); if (password !== confirm) return setError('Xác nhận mật khẩu chưa khớp.'); setBusy(true); setError(''); try { await authApi.changePassword(oldPassword, password, confirm); await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined); await authSessionService.invalidateSession('logout-all'); router.replace({ pathname: '/(auth)/login', params: { passwordChanged: '1' } }); } catch (reason) { setError(passwordRecoveryError(reason)); } finally { setBusy(false); } };
  return <StackScreenLayout title="Đổi mật khẩu" refreshEnabled={false}><View style={styles.content}><Text style={styles.description}>Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại trên các thiết bị.</Text><Field label="Mật khẩu hiện tại"><PasswordField value={oldPassword} onChangeText={value => { setOldPassword(value); setError(''); }} placeholder="Nhập mật khẩu hiện tại" autoComplete="current-password" textContentType="password" /></Field><Field label="Mật khẩu mới"><PasswordField value={password} onChangeText={value => { setPassword(value); setError(''); }} placeholder="Ít nhất 6 ký tự" autoComplete="new-password" textContentType="newPassword" /></Field><Field label="Xác nhận mật khẩu" error={confirm && password !== confirm ? 'Xác nhận mật khẩu chưa khớp.' : undefined}><PasswordField value={confirm} onChangeText={value => { setConfirm(value); setError(''); }} placeholder="Nhập lại mật khẩu mới" autoComplete="new-password" textContentType="newPassword" onSubmitEditing={submit} /></Field>{error ? <InlineAlert>{error}</InlineAlert> : null}<PrimaryButton label="Đổi mật khẩu" busy={busy} disabled={!oldPassword || !password || !confirm} onPress={() => void submit()} /></View></StackScreenLayout>;
}
const styles = StyleSheet.create({ content: { gap: Spacing.three }, description: { ...typography.bodySmall, color: Colors.light.textSecondary } });
