import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion, useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, radii, Spacing, typography } from '@/theme';
import type { OtpDelivery, PasswordResetChannel, PasswordResetOptions } from '../api/auth.dto';
import { authApi } from '../api/authApi';
import { Field, InlineAlert, PasswordField, PrimaryButton, SecondaryButton, passwordFormStyles } from '../components/PasswordFormPrimitives';
import { useOtpCountdown } from '../hooks/useOtpCountdown';
import { passwordRecoveryError } from '../utils/passwordRecoveryError';

type Step = 'phone' | 'channel' | 'code' | 'password';
const ZALO_NUMBER = '036 9222 068';

export default function ForgotPasswordScreen() {
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [options, setOptions] = useState<PasswordResetOptions | null>(null);
  const [channel, setChannel] = useState<PasswordResetChannel | null>(null);
  const [personId, setPersonId] = useState<string>();
  const [delivery, setDelivery] = useState<OtpDelivery>();
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const timer = useOtpCountdown(delivery?.resendAvailableAt, delivery?.expiresAt);

  useEffect(() => { if (timer.expired && step === 'code') setError('Mã đã hết hạn. Hãy gửi mã mới để tiếp tục.'); }, [step, timer.expired]);

  const run = async (action: () => Promise<void>) => {
    setBusy(true); setError('');
    try { await action(); } catch (reason) { const message = passwordRecoveryError(reason); setError(message); AccessibilityInfo.announceForAccessibility(message); }
    finally { setBusy(false); }
  };
  const sendCode = async (next: PasswordResetChannel, id?: string, available = options) => {
    if (!available) return;
    const sent = await authApi.sendPasswordResetCode(available.requestId, next, id);
    setChannel(next); setPersonId(id); setDelivery(sent); setCode(''); setStep('code');
  };
  const start = () => void run(async () => {
    if (!/^0\d{9,10}$/.test(phone)) { setError('Nhập số điện thoại gồm 10–11 chữ số và bắt đầu bằng số 0.'); return; }
    const result = await authApi.passwordResetOptions(phone); setOptions(result);
    const count = Number(result.appAvailable) + result.emails.length;
    if (!count) { setStep('channel'); return; }
    if (count === 1) { const email = result.emails[0]; await sendCode(email ? 'EMAIL' : 'APP', email?.userPersonId, result); return; }
    setStep('channel');
  });
  const send = (next: PasswordResetChannel, id?: string) => void run(() => sendCode(next, id));
  const verifyCode = async (value = code) => {
    if (timer.expired) { setError('Mã đã hết hạn. Hãy gửi mã mới để tiếp tục.'); return; }
    if (value.length !== 6) { setError('Nhập đủ 6 chữ số của mã xác minh.'); return; }
    await run(async () => { const result = await authApi.verifyPasswordResetCode(options!.requestId, value); setResetToken(result.resetToken); setStep('password'); });
  };
  const complete = () => void run(async () => {
    if (password.length < 6) { setError('Mật khẩu mới cần có ít nhất 6 ký tự.'); return; }
    if (password !== confirm) { setError('Xác nhận mật khẩu chưa khớp.'); return; }
    await authApi.completePasswordReset(resetToken, password, confirm);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    router.replace({ pathname: '/(auth)/login', params: { passwordChanged: '1' } });
  });
  const goBack = () => { setError(''); if (step === 'channel') setStep('phone'); else if (step === 'code') setStep('channel'); else if (step === 'password') setStep('code'); else router.replace('/(auth)/login'); };
  const updateCode = (value: string) => { const next = value.replace(/\D/g, '').slice(0, 6); setCode(next); setError(''); if (next.length === 6 && !busy && !timer.expired) void verifyCode(next); };
  const entry = reducedMotion ? undefined : FadeInDown.duration(180).reduceMotion(ReduceMotion.System);
  const channelDescription = channel === 'APP' ? 'ứng dụng đang đăng nhập' : 'email đã chọn';

  return <SafeAreaView style={styles.safe}><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><Pressable onPress={goBack} accessibilityRole="button" style={styles.back}><Text style={styles.backText}>‹ Quay lại</Text></Pressable>
    <Animated.View key={step} entering={entry} style={styles.card}>
      <Text style={styles.eyebrow}>TAEKWONDO VĂN QUÁN</Text><Text style={styles.title}>{step === 'phone' ? 'Quên mật khẩu' : step === 'channel' ? 'Chọn nơi nhận mã' : step === 'code' ? 'Xác minh mã' : 'Đặt mật khẩu mới'}</Text>
      <Text style={styles.description}>{step === 'phone' ? 'Nhập số điện thoại đã dùng để đăng nhập.' : step === 'channel' ? 'Chọn kênh an toàn để nhận mã OTP 6 số.' : step === 'code' ? `Nhập mã vừa gửi qua ${channelDescription}.` : 'Mật khẩu mới cần khác mật khẩu hiện tại.'}</Text>
      {step === 'phone' && <View style={styles.form}><Field label="Số điện thoại"><TextInput value={phone} onChangeText={value => { setPhone(value.replace(/\D/g, '').slice(0, 11)); setError(''); }} style={passwordFormStyles.input} placeholder="Nhập số điện thoại" keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" returnKeyType="done" onSubmitEditing={start} /></Field><PrimaryButton label="Tiếp tục" busy={busy} onPress={start} /></View>}
      {step === 'channel' && <View style={styles.form}>{options?.appAvailable ? <PrimaryButton label="Gửi qua ứng dụng đang đăng nhập" busy={busy} onPress={() => send('APP')} /> : null}{options?.emails.map(email => <SecondaryButton key={email.userPersonId} label={`Gửi tới ${email.maskedEmail}`} disabled={busy} onPress={() => send('EMAIL', email.userPersonId)} />)}{!options?.appAvailable && !options?.emails.length ? <View style={styles.form}><InlineAlert kind="info">Tài khoản chưa có kênh khôi phục đã xác minh.</InlineAlert><SecondaryButton label={`Sao chép số Zalo ${ZALO_NUMBER}`} onPress={() => void Clipboard.setStringAsync(ZALO_NUMBER)} /></View> : null}</View>}
      {step === 'code' && <View style={styles.form}><Field label="Mã OTP 6 số"><TextInput value={code} onChangeText={updateCode} style={[passwordFormStyles.input, styles.code]} placeholder="••••••" keyboardType="number-pad" inputMode="numeric" maxLength={6} textContentType="oneTimeCode" autoComplete="one-time-code" accessibilityLabel="Mã OTP 6 số" /></Field><Text style={[styles.timer, timer.expired && styles.expired]}>{timer.expiresLabel}</Text><PrimaryButton label="Xác minh" busy={busy} disabled={code.length !== 6 || timer.expired} onPress={() => void verifyCode()} /><SecondaryButton label={timer.resendLabel} disabled={busy || !timer.canResend} onPress={() => send(channel!, personId)} /></View>}
      {step === 'password' && <View style={styles.form}><Field label="Mật khẩu mới"><PasswordField value={password} onChangeText={value => { setPassword(value); setError(''); }} placeholder="Ít nhất 6 ký tự" autoComplete="new-password" textContentType="newPassword" /></Field><Field label="Xác nhận mật khẩu" error={confirm && password !== confirm ? 'Xác nhận mật khẩu chưa khớp.' : undefined}><PasswordField value={confirm} onChangeText={value => { setConfirm(value); setError(''); }} placeholder="Nhập lại mật khẩu mới" autoComplete="new-password" textContentType="newPassword" onSubmitEditing={complete} /></Field><PrimaryButton label="Đặt lại mật khẩu" busy={busy} onPress={complete} /></View>}
      {error ? <InlineAlert>{error}</InlineAlert> : null}
    </Animated.View></ScrollView></KeyboardAvoidingView></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Colors.light.background }, flex: { flex: 1 }, content: { flexGrow: 1, padding: Spacing.three, justifyContent: 'center' }, back: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' }, backText: { ...typography.action, color: Colors.light.primary }, card: { width: '100%', maxWidth: 480, alignSelf: 'center', backgroundColor: Colors.light.surface, borderRadius: radii.lg, padding: Spacing.four, gap: Spacing.three }, eyebrow: { ...typography.caption, color: Colors.light.primary, letterSpacing: 1 }, title: { ...typography.heading, color: Colors.light.text, fontSize: 28, lineHeight: 36 }, description: { ...typography.bodySmall, color: Colors.light.textSecondary }, form: { gap: Spacing.three }, code: { textAlign: 'center', letterSpacing: 12, fontSize: 22, fontWeight: '700' }, timer: { ...typography.bodySmall, textAlign: 'center', color: Colors.light.textSecondary }, expired: { color: Colors.light.error } });
