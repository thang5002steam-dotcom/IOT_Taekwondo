import { Eye, EyeOff } from 'lucide-react-native';
import { type ComponentProps, type ReactNode, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors, radii, Spacing, typography } from '@/theme';

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text>{children}{error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}</View>;
}

export function PasswordField(props: Omit<ComponentProps<typeof TextInput>, 'secureTextEntry'>) {
  const [visible, setVisible] = useState(false);
  return <View style={styles.passwordShell}><TextInput {...props} style={[styles.input, styles.passwordInput, props.style]} secureTextEntry={!visible} autoCapitalize="none" autoCorrect={false} />
    <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onPress={() => setVisible(value => !value)} hitSlop={8} style={styles.eye}>
      {visible ? <EyeOff color={Colors.light.textSecondary} size={21} /> : <Eye color={Colors.light.textSecondary} size={21} />}
    </Pressable>
  </View>;
}

export function PrimaryButton({ label, busy, disabled, onPress }: { label: string; busy?: boolean; disabled?: boolean; onPress: () => void }) {
  const blocked = Boolean(busy || disabled);
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: blocked, busy: Boolean(busy) }} disabled={blocked} onPress={onPress} style={({ pressed }) => [styles.primary, blocked && styles.disabled, pressed && !blocked && styles.pressed]}>
    {busy ? <ActivityIndicator color={Colors.light.surface} /> : <Text style={styles.primaryText}>{label}</Text>}
  </Pressable>;
}

export function SecondaryButton({ label, disabled, onPress }: { label: string; disabled?: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: Boolean(disabled) }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.secondary, disabled && styles.disabled, pressed && !disabled && styles.pressed]}><Text style={styles.secondaryText}>{label}</Text></Pressable>;
}

export function InlineAlert({ children, kind = 'error' }: { children: ReactNode; kind?: 'error' | 'success' | 'info' }) {
  return <View accessibilityRole="alert" style={[styles.alert, kind === 'success' ? styles.success : kind === 'info' ? styles.info : styles.alertError]}><Text style={styles.alertText}>{children}</Text></View>;
}

const styles = StyleSheet.create({
  field: { gap: Spacing.two },
  label: { ...typography.featureLabel, color: Colors.light.text },
  input: { minHeight: 52, borderWidth: 1, borderColor: Colors.light.divider, borderRadius: radii.md, paddingHorizontal: Spacing.three, color: Colors.light.text, backgroundColor: Colors.light.surface, fontSize: 16 },
  passwordShell: { position: 'relative' }, passwordInput: { paddingRight: 56 }, eye: { position: 'absolute', right: Spacing.one, top: 2, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  error: { ...typography.bodySmall, color: Colors.light.error },
  primary: { minHeight: 52, borderRadius: radii.md, backgroundColor: Colors.light.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.three },
  primaryText: { ...typography.action, color: Colors.light.surface }, secondary: { minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.three }, secondaryText: { ...typography.action, color: Colors.light.primary }, disabled: { opacity: 0.5 }, pressed: { transform: [{ scale: 0.97 }] },
  alert: { borderRadius: radii.md, padding: Spacing.three, borderLeftWidth: 3 }, alertError: { backgroundColor: Colors.light.errorSoft, borderLeftColor: Colors.light.error }, success: { backgroundColor: Colors.light.successSoft, borderLeftColor: Colors.light.success }, info: { backgroundColor: Colors.light.infoSoft, borderLeftColor: Colors.light.info }, alertText: { ...typography.bodySmall, color: Colors.light.text },
});

export const passwordFormStyles = styles;
