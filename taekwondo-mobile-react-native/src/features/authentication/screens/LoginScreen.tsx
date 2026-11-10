import { Eye, EyeOff, LockKeyhole, Phone } from 'lucide-react-native';
import { type ComponentRef, useCallback, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { useLogin } from '../hooks/useAuthentication';
import { AuthBrand } from '../components/AuthBrand';
import { normalizeAuthError } from '../utils/normalizeAuthError';
import {
  validateLoginInput,
  type LoginValidationErrors,
} from '../schemas/loginValidation';

export default function LoginScreen() {
  const { passwordChanged } = useLocalSearchParams<{ passwordChanged?: string }>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginValidationErrors>({});
  const phoneRef = useRef<ComponentRef<typeof TextInput>>(null);
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);
  const login = useLogin();

  const submit = useCallback(async () => {
    if (login.isPending) return;
    const validationErrors = validateLoginInput(phoneNumber, password);
    setErrors(validationErrors);
    if (validationErrors.phoneNumber || validationErrors.password) {
      const message = validationErrors.phoneNumber ?? validationErrors.password ?? '';
      AccessibilityInfo.announceForAccessibility(message);
      if (validationErrors.phoneNumber) phoneRef.current?.focus();
      else passwordRef.current?.focus();
      return;
    }

    try {
      await login.mutateAsync({ phoneNumber: phoneNumber.trim(), password });
    } catch (error: unknown) {
      AccessibilityInfo.announceForAccessibility(normalizeAuthError(error));
    }
  }, [login, password, phoneNumber]);

  const requestError = login.error ? normalizeAuthError(login.error) : null;
  const canSubmit = phoneNumber.trim().length > 0 && password.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic">
          <AuthBrand />

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Số điện thoại</Text>
              <View style={[styles.inputShell, errors.phoneNumber ? styles.inputError : null]}>
                <Phone size={20} color="#73737B" aria-hidden />
                <TextInput
                  ref={phoneRef}
                  value={phoneNumber}
                  onChangeText={(value) => {
                    setPhoneNumber(value.replace(/\D/g, '').slice(0, 11));
                    if (errors.phoneNumber) setErrors((current) => ({ ...current, phoneNumber: undefined }));
                  }}
                  style={styles.input}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#929299"
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  accessibilityLabel="Số điện thoại"
                  accessibilityHint="Gồm 10 đến 11 chữ số, bắt đầu bằng số 0"
                />
              </View>
              {errors.phoneNumber ? (
                <Text style={styles.error} accessibilityRole="alert">
                  {errors.phoneNumber}
                </Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={[styles.inputShell, errors.password ? styles.inputError : null]}>
                <LockKeyhole size={20} color="#73737B" aria-hidden />
                <TextInput
                  ref={passwordRef}
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    if (errors.password) setErrors((current) => ({ ...current, password: undefined }));
                  }}
                  style={styles.input}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#929299"
                  secureTextEntry={!showPassword}
                  autoComplete="current-password"
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={() => void submit()}
                  accessibilityLabel="Mật khẩu"
                />
                <Pressable
                  onPress={() => setShowPassword((current) => !current)}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  accessibilityState={{ expanded: showPassword }}
                  hitSlop={8}
                  style={styles.iconButton}>
                  {showPassword ? (
                    <EyeOff size={21} color="#4B4B52" aria-hidden />
                  ) : (
                    <Eye size={21} color="#4B4B52" aria-hidden />
                  )}
                </Pressable>
              </View>
              {errors.password ? (
                <Text style={styles.error} accessibilityRole="alert">
                  {errors.password}
                </Text>
              ) : null}
            </View>

            <Pressable
              onPress={() => router.push('/(auth)/forgot-password' as never)}
              accessibilityRole="button"
              style={styles.supportButton}>
              <Text style={styles.supportText}>Quên mật khẩu?</Text>
            </Pressable>

            {passwordChanged === '1' ? (
              <Text
                style={styles.successMessage}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite">
                Mật khẩu đã được cập nhật. Hãy đăng nhập lại.
              </Text>
            ) : null}

            {requestError ? (
              <Text
                style={styles.requestError}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite">
                {requestError}
              </Text>
            ) : null}

            <Pressable
              onPress={() => void submit()}
              disabled={!canSubmit || login.isPending}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSubmit || login.isPending, busy: login.isPending }}
              style={({ pressed }) => [
                styles.submit,
                !canSubmit || login.isPending ? styles.submitDisabled : null,
                pressed ? styles.submitPressed : null,
              ]}>
              {login.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitText}>Đăng nhập</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 30,
  },
  form: { width: '100%', maxWidth: 480, alignSelf: 'center', gap: 18 },
  field: { gap: 8 },
  label: { color: '#29292E', fontSize: 15, fontWeight: '700' },
  inputShell: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: '#D7D7DC',
    borderRadius: 6,
    paddingHorizontal: 15,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FAFAFB',
  },
  inputError: { borderColor: '#B4232A', backgroundColor: '#FFF8F8' },
  input: { flex: 1, color: '#18181B', fontSize: 16, paddingVertical: 14 },
  iconButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#B4232A', fontSize: 13, lineHeight: 18 },
  supportButton: { alignSelf: 'flex-end', minHeight: 48, justifyContent: 'center' },
  supportText: { color: '#A9151A', fontSize: 14, fontWeight: '700' },
  requestError: {
    color: '#8F171D',
    backgroundColor: '#FCEBEC',
    borderLeftWidth: 3,
    borderLeftColor: '#A9151A',
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  successMessage: {
    color: '#065F46',
    backgroundColor: '#ECFDF5',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  submit: {
    minHeight: 54,
    borderRadius: 6,
    backgroundColor: '#A9151A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: { backgroundColor: '#C9A2A4' },
  submitPressed: { opacity: 0.84 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
