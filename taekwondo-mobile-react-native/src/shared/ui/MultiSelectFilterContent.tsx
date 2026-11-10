import { Check, InfoCircle } from "reicon-react-native";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Colors } from "@/theme";

import { AppIcon } from "./AppIcon";
import { ThemedText } from "./ThemedText";

export type MultiSelectFilterValue = string | number;

export type MultiSelectFilterOption<T extends MultiSelectFilterValue = MultiSelectFilterValue> = {
  value: T;
  label: string;
};

export type MultiSelectFilterGroup<T extends MultiSelectFilterValue = MultiSelectFilterValue> = {
  key: string;
  title: string;
  options: readonly MultiSelectFilterOption<T>[];
  selectedValues: readonly T[];
  onToggle: (value: T) => void;
  onSelectAll: () => void;
  onClear: () => void;
};

export function MultiSelectFilterContent({
  groups,
  error,
}: {
  groups: readonly MultiSelectFilterGroup[];
  error?: string | null;
}) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.filterContent}
    >
      {error ? (
        <View style={styles.errorHint}>
          <AppIcon icon={<InfoCircle />} size={14} color={Colors.light.primary} />
          <ThemedText type="bodySmall" style={styles.errorHintText}>
            {error}
          </ThemedText>
        </View>
      ) : null}

      {groups.map((group) => (
        <FilterGroup key={group.key} group={group} />
      ))}
    </ScrollView>
  );
}

export function FilterSheetActions({
  canApply,
  onReset,
  onApply,
}: {
  canApply: boolean;
  onReset: () => void;
  onApply: () => void;
}) {
  return (
    <View style={styles.filterActions}>
      <FilterSheetButton
        title="Đặt lại"
        testID="filter-sheet-reset-button"
        style={styles.resetButton}
        onPress={onReset}
      />
      <FilterSheetButton
        title="Áp dụng"
        testID="filter-sheet-apply-button"
        disabled={!canApply}
        style={[styles.applyButton, canApply ? styles.applyButtonActive : null]}
        onPress={onApply}
      />
    </View>
  );
}

export function toggleMultiSelectFilterValue<T>(values: readonly T[], value: T) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function FilterGroup({ group }: { group: MultiSelectFilterGroup }) {
  return (
    <View style={styles.filterGroup}>
      <View style={styles.filterGroupHeader}>
        <ThemedText type="heading" style={styles.filterTitle}>
          {group.title}
        </ThemedText>
        <View style={styles.filterHeaderActions}>
          <Pressable
            accessibilityRole="button"
            onPress={group.onSelectAll}
            hitSlop={8}
          >
            <ThemedText type="body" style={styles.filterHeaderAction}>
              Tất cả
            </ThemedText>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={group.onClear} hitSlop={8}>
            <ThemedText type="body" style={styles.filterHeaderMuted}>
              Huỷ
            </ThemedText>
          </Pressable>
        </View>
      </View>

      {group.options.map((option) => {
        const selected = group.selectedValues.includes(option.value);
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            onPress={() => group.onToggle(option.value)}
            style={({ pressed }) => [
              styles.filterOption,
              pressed ? styles.pressed : null,
            ]}
          >
            <ThemedText type="body" style={styles.filterOptionText}>
              {option.label}
            </ThemedText>
            <View style={[styles.checkbox, selected ? styles.checkboxSelected : null]}>
              {selected ? (
                <AppIcon icon={<Check />} size={14} color={Colors.light.surface} />
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function FilterSheetButton({
  title,
  disabled,
  style,
  onPress,
  testID,
}: {
  title: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pillButton,
        style,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <ThemedText type="body" style={styles.pillButtonText}>
        {title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filterContent: {
    paddingBottom: 112,
  },
  filterGroup: {
    paddingHorizontal: 20,
    paddingTop: 17,
    paddingBottom: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.divider,
    gap: 17,
  },
  filterGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterTitle: {
    color: Colors.light.text,
    fontWeight: "600",
  },
  filterHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  filterHeaderAction: {
    color: Colors.light.text,
  },
  filterHeaderMuted: {
    color: Colors.light.divider,
  },
  filterOption: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterOptionText: {
    color: Colors.light.text,
  },
  checkbox: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.divider,
    borderRadius: 3,
  },
  checkboxSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  errorHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  errorHintText: {
    color: Colors.light.primary,
  },
  filterActions: {
    flexDirection: "row",
    gap: 10,
  },
  pillButton: {
    height: 51,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    backgroundColor: Colors.light.divider,
  },
  resetButton: {
    flex: 0.38,
  },
  applyButton: {
    flex: 0.62,
  },
  applyButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  pillButtonText: {
    color: Colors.light.surface,
    textAlign: "center",
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.75,
  },
});
