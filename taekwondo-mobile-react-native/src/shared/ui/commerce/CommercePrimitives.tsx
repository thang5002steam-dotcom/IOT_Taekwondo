import type { ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  StatusBadge as SharedStatusBadge,
  type StatusBadgeTone,
} from "@/shared/ui/StatusBadge";
import { SegmentedControl } from "@/shared/ui/SegmentedControl";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, effects, radii } from "@/theme";

export function SurfaceCard({
  children,
  style,
  soft = false,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  soft?: boolean;
}) {
  return (
    <View style={[styles.card, soft ? styles.softCard : null, style]}>
      {children}
    </View>
  );
}

export function StatusBadge({
  label,
  tone = "primary",
}: {
  label: string;
  tone?: StatusBadgeTone;
}) {
  return <SharedStatusBadge label={label} tone={tone} />;
}

export function PrimaryActionButton({
  title,
  variant = "primary",
  disabled = false,
  loading = false,
  onPress,
}: {
  title: string;
  variant?: "primary" | "outline";
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
}) {
  const primary = variant === "primary";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        primary ? styles.actionButtonPrimary : styles.actionButtonOutline,
        disabled ? styles.disabled : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <ThemedText
        type="action"
        style={primary ? styles.actionTextPrimary : styles.actionTextOutline}
      >
        {loading ? "Đang xử lý..." : title}
      </ThemedText>
    </Pressable>
  );
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText type="bodySmall" style={styles.blackText}>
        {label}
      </ThemedText>
      <ThemedText type="bodySmall" numberOfLines={2} style={styles.blackText}>
        {value}
      </ThemedText>
    </View>
  );
}

export function FormField({
  label,
  helper,
  ...inputProps
}: TextInputProps & {
  label?: string;
  helper?: string;
}) {
  return (
    <View style={styles.field}>
      {label ? (
        <ThemedText type="bodySmall" style={styles.blackText}>
          {label}
        </ThemedText>
      ) : null}
      <TextInput
        placeholderTextColor={Colors.light.textSecondary}
        style={styles.input}
        {...inputProps}
      />
      {helper ? (
        <ThemedText type="bodySmall" style={styles.secondaryText}>
          {helper}
        </ThemedText>
      ) : null}
    </View>
  );
}

export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <SegmentedControl
      accessibilityRole="button"
      options={tabs}
      value={value}
      onChange={onChange}
    />
  );
}

export function RootLikeScreen({
  title,
  children,
}: {
  title: string;
  activeTab: "activities" | "account";
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.root}>
      <View
        style={[styles.simpleAppBar, { paddingTop: Math.max(insets.top, 28) }]}
      >
        <ThemedText type="heading" style={styles.blackText}>
          {title}
        </ThemedText>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.rootContent,
          { paddingBottom: 104 + Math.max(insets.bottom, 10) },
        ]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  simpleAppBar: {
    minHeight: 84,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: Colors.light.surface,
  },
  rootContent: {
    gap: 20,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    gap: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.divider,
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
    ...effects.soft,
  },
  softCard: {
    shadowOpacity: 0,
    elevation: 0,
  },
  actionButton: {
    minHeight: 38,
    minWidth: 84,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: radii.pill,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.light.primary,
  },
  actionButtonOutline: {
    borderWidth: 1,
    borderColor: Colors.light.divider,
    backgroundColor: Colors.light.surface,
  },
  actionTextPrimary: {
    color: Colors.light.surface,
  },
  actionTextOutline: {
    color: Colors.light.primary,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.75,
  },
  blackText: {
    color: Colors.light.text,
  },
  secondaryText: {
    color: Colors.light.textSecondary,
  },
  field: {
    width: "100%",
    gap: 6,
  },
  input: {
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.light.divider,
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
    color: Colors.light.text,
  },
  infoRow: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
});
