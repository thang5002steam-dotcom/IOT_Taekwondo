import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
} from "reicon-react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { BottomSheetWindow } from "@/shared/ui/BottomSheetWindow";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, effects, radii, typography } from "@/theme";

export function AdminCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function AdminIntro({ children }: { children: ReactNode }) {
  return (
    <ThemedText type="bodySmall" style={styles.intro}>
      {children}
    </ThemedText>
  );
}

export function AdminTabs({
  items,
  value,
  onChange,
}: {
  items: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View accessibilityRole="tablist" style={styles.tabs}>
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <Pressable
            key={item.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(item.value)}
            style={({ pressed }) => [
              styles.tab,
              selected && styles.tabSelected,
              pressed && styles.pressed,
            ]}
          >
            <ThemedText
              type="featureLabel"
              style={selected ? styles.tabTextSelected : styles.tabText}
            >
              {item.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function AdminSearchField({
  value,
  onChangeText,
  placeholder = "Tìm kiếm",
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.search}>
      <AppIcon icon={<Search />} size={20} color={Colors.light.textSecondary} />
      <TextInput
        accessibilityLabel={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.light.textSecondary}
        style={styles.searchInput}
        returnKeyType="search"
      />
    </View>
  );
}

export function AdminSectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <ThemedText type="title">{title}</ThemedText>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [
            styles.inlineAction,
            pressed && styles.pressed,
          ]}
        >
          <AppIcon icon={<Plus />} size={17} color={Colors.light.primary} />
          <ThemedText type="featureLabel" style={styles.primaryText}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function AdminListRow({
  title,
  subtitle,
  meta,
  leading,
  onPress,
  selected,
}: {
  title: string;
  subtitle?: string | null;
  meta?: ReactNode;
  leading?: ReactNode;
  onPress?: () => void;
  selected?: boolean;
}) {
  const content = (
    <>
      {leading}
      <View style={styles.rowCopy}>
        <ThemedText type="featureLabel" numberOfLines={1}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="bodySmall" style={styles.muted} numberOfLines={2}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {meta}
      {selected !== undefined ? (
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected ? (
            <AppIcon icon={<Check />} size={15} color={Colors.light.surface} />
          ) : null}
        </View>
      ) : onPress ? (
        <AppIcon
          icon={<ChevronRight />}
          size={20}
          color={Colors.light.textSecondary}
        />
      ) : null}
    </>
  );
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      {content}
    </Pressable>
  ) : (
    <View style={styles.row}>{content}</View>
  );
}

export function AdminButton({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "text";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[`button_${variant}`],
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "danger"
              ? Colors.light.surface
              : Colors.light.primary
          }
        />
      ) : (
        <ThemedText type="action" style={styles[`buttonText_${variant}`]}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

export function AdminField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  editable = true,
  keyboardType,
  secureTextEntry,
  helper,
}: {
  label: string;
  value: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  editable?: boolean;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  helper?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <ThemedText type="featureLabel">{label}</ThemedText>
      <TextInput
        accessibilityLabel={label}
        editable={editable}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.light.textSecondary}
        multiline={multiline}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          !editable && styles.fieldDisabled,
        ]}
      />
      {helper ? (
        <ThemedText type="bodySmall" style={styles.helper}>
          {helper}
        </ThemedText>
      ) : null}
    </View>
  );
}

export function AdminSwitchField({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <AdminCard style={styles.switchCard}>
      <View style={styles.rowCopy}>
        <ThemedText type="featureLabel">{label}</ThemedText>
        {description ? (
          <ThemedText type="bodySmall" style={styles.muted}>
            {description}
          </ThemedText>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: Colors.light.divider,
          true: Colors.light.primarySoft,
        }}
        thumbColor={value ? Colors.light.primary : Colors.light.surface}
      />
    </AdminCard>
  );
}

export function AdminChip({
  label,
  selected = false,
  onPress,
  tone = "neutral",
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: "neutral" | "success" | "warning" | "info" | "danger";
}) {
  const selectable = Boolean(onPress);
  const content = (
    <ThemedText
      type="featureLabel"
      style={[
        styles.chipText,
        !selectable && tone !== "neutral" && styles[`chipText_${tone}`],
        selected && styles.chipTextSelected,
      ]}
    >
      {label}
    </ThemedText>
  );
  const chipStyle = [
    styles.chip,
    selectable && !selected && styles.chipSelectableUnselected,
    !selectable && tone !== "neutral" && styles[`chip_${tone}`],
    selected && styles.chipSelected,
  ];
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [chipStyle, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  ) : (
    <View style={chipStyle} pointerEvents="none">
      {content}
    </View>
  );
}

export function AdminInfoBanner({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "warning";
}) {
  return (
    <View
      style={[
        styles.banner,
        tone === "warning" ? styles.bannerWarning : styles.bannerInfo,
      ]}
    >
      <ThemedText
        type="bodySmall"
        style={tone === "warning" ? styles.warningText : styles.infoText}
      >
        {children}
      </ThemedText>
    </View>
  );
}

export function AdminEmptyState({
  message = "Chưa có dữ liệu",
}: {
  message?: string;
}) {
  return (
    <AdminCard style={styles.state}>
      <ThemedText type="bodySmall" style={styles.muted}>
        {message}
      </ThemedText>
    </AdminCard>
  );
}

export function AdminLoadingState() {
  return (
    <View style={styles.state}>
      <ActivityIndicator color={Colors.light.primary} />
    </View>
  );
}

export type PickerOption = {
  value: string;
  label: string;
  description?: string;
};

export function AdminPickerField({
  label,
  valueLabel,
  placeholder,
  onPress,
}: {
  label: string;
  valueLabel?: string;
  placeholder: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.fieldWrap}>
      <ThemedText type="featureLabel">{label}</ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${valueLabel ?? placeholder}`}
        onPress={onPress}
        style={({ pressed }) => [styles.picker, pressed && styles.pressed]}
      >
        <ThemedText
          type="bodySmall"
          style={valueLabel ? undefined : styles.muted}
        >
          {valueLabel ?? placeholder}
        </ThemedText>
        <AppIcon
          icon={<ChevronDown />}
          size={18}
          color={Colors.light.textSecondary}
        />
      </Pressable>
    </View>
  );
}

export function AdminPickerSheet({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: readonly PickerOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <BottomSheetWindow
      visible={visible}
      title={title}
      heightRatio={0.58}
      onClose={onClose}
    >
      <View style={styles.sheetList}>
        {options.map((option) => (
          <AdminListRow
            key={option.value}
            title={option.label}
            subtitle={option.description}
            selected={option.value === selectedValue}
            onPress={() => {
              onSelect(option.value);
              onClose();
            }}
          />
        ))}
      </View>
    </BottomSheetWindow>
  );
}

export function AdminConfirmDialog({
  confirming,
  title,
  message,
  confirmLabel,
  destructive,
  loading,
  onCancel,
  onConfirm,
}: {
  confirming: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      visible={confirming}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Đóng hộp thoại"
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
        />
        <View accessibilityViewIsModal style={styles.dialog}>
          <ThemedText type="heading">{title}</ThemedText>
          <ThemedText type="bodySmall" style={styles.dialogMessage}>
            {message}
          </ThemedText>
          <View style={styles.dialogActions}>
            <AdminButton
              label="Hủy"
              variant="secondary"
              onPress={onCancel}
              style={styles.dialogButton}
            />
            <AdminButton
              label={confirmLabel}
              variant={destructive ? "danger" : "primary"}
              loading={loading}
              onPress={onConfirm}
              style={styles.dialogButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export const adminStyles = StyleSheet.create({
  screen: { paddingTop: 20, paddingBottom: 32, gap: 14 },
  listScreen: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 32, gap: 20 },
  gap: { gap: 14 },
  actions: { flexDirection: "row", gap: 10 },
  grow: { flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  labelValue: { gap: 4 },
  muted: { color: Colors.light.textSecondary },
  dangerText: { color: Colors.light.error },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: radii.md,
    padding: 16,
    ...effects.soft,
  },
  intro: { color: Colors.light.textSecondary, marginBottom: 2 },
  tabs: {
    height: 42,
    flexDirection: "row",
    backgroundColor: Colors.light.surface,
    borderRadius: radii.md,
    padding: 3,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  tabSelected: { backgroundColor: Colors.light.primarySoft },
  tabText: { color: Colors.light.textSecondary },
  tabTextSelected: { color: Colors.light.primary },
  search: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.light.surface,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.divider,
  },
  searchInput: {
    flex: 1,
    color: Colors.light.text,
    ...typography.bodySmall,
    paddingVertical: 0,
  },
  sectionHeader: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inlineAction: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  primaryText: { color: Colors.light.primary },
  row: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.divider,
  },
  rowPressed: { backgroundColor: Colors.light.backgroundSelected },
  rowCopy: { flex: 1, gap: 3 },
  muted: { color: Colors.light.textSecondary },
  checkbox: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.light.divider,
  },
  checkboxSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  button: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  button_primary: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  button_secondary: {
    backgroundColor: Colors.light.surface,
    borderColor: Colors.light.divider,
  },
  button_danger: {
    backgroundColor: Colors.light.error,
    borderColor: Colors.light.error,
  },
  button_text: { backgroundColor: "transparent", borderColor: "transparent" },
  buttonText_primary: { color: Colors.light.surface },
  buttonText_secondary: { color: Colors.light.text },
  buttonText_danger: { color: Colors.light.surface },
  buttonText_text: { color: Colors.light.primary },
  disabled: { opacity: 0.5 },
  fieldWrap: { gap: 7 },
  field: {
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.light.text,
    backgroundColor: Colors.light.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: Colors.light.divider,
    ...typography.bodySmall,
  },
  fieldMultiline: { minHeight: 104, textAlignVertical: "top" },
  fieldDisabled: {
    backgroundColor: Colors.light.backgroundSelected,
    color: Colors.light.textSecondary,
  },
  helper: { color: Colors.light.textSecondary },
  switchCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  chip: {
    minHeight: 34,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.light.divider,
  },
  chipSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
    borderWidth: 2,
  },
  chipSelectableUnselected: {
    backgroundColor: "transparent",
    borderColor: Colors.light.divider,
  },
  chipText: { color: Colors.light.textSecondary },
  chipTextSelected: { color: Colors.light.surface },
  chip_success: {
    backgroundColor: Colors.light.successSoft,
    borderColor: Colors.light.success,
  },
  chip_warning: {
    backgroundColor: Colors.light.warningSoft,
    borderColor: Colors.light.warning,
  },
  chip_info: {
    backgroundColor: Colors.light.infoSoft,
    borderColor: Colors.light.info,
  },
  chip_danger: {
    backgroundColor: Colors.light.errorSoft,
    borderColor: Colors.light.error,
  },
  chipText_success: { color: Colors.light.success },
  chipText_warning: { color: Colors.light.warning },
  chipText_info: { color: Colors.light.info },
  chipText_danger: { color: Colors.light.error },
  banner: { padding: 14, borderRadius: radii.md, borderWidth: 1 },
  bannerInfo: {
    backgroundColor: Colors.light.infoSoft,
    borderColor: Colors.light.info,
  },
  bannerWarning: {
    backgroundColor: Colors.light.warningSoft,
    borderColor: Colors.light.warning,
  },
  infoText: { color: Colors.light.info },
  warningText: { color: "#925B00" },
  state: { minHeight: 96, alignItems: "center", justifyContent: "center" },
  picker: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 14,
    backgroundColor: Colors.light.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: Colors.light.divider,
  },
  sheetList: { overflow: "hidden", borderRadius: radii.md },
  modalRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(17, 24, 39, 0.5)",
  },
  dialog: {
    width: "100%",
    maxWidth: 345,
    padding: 20,
    gap: 14,
    backgroundColor: Colors.light.surface,
    borderRadius: radii.md,
    ...effects.floating,
  },
  dialogMessage: { color: Colors.light.textSecondary },
  dialogActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  dialogButton: { flex: 1 },
  pressed: { opacity: 0.72 },
});
