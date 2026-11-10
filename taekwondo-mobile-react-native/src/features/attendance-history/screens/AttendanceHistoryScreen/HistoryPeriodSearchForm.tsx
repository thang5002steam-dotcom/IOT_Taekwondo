import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { ChevronRight, InfoCircle } from "reicon-react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, effects, radii } from "@/theme";

import type { CalendarQuarter } from "../../domain/historyDateRange";

export function HistoryPeriodSearchForm({
  selectedYear,
  selectedQuarter,
  quarterError,
  searchEnabled,
  selectedRange,
  onYearPress,
  onQuarterPress,
  onSearch,
}: {
  selectedYear?: number;
  selectedQuarter?: CalendarQuarter;
  quarterError?: string | null;
  searchEnabled: boolean;
  selectedRange?: { from: string; to: string } | null;
  onYearPress: () => void;
  onQuarterPress: () => void;
  onSearch: () => void;
}) {
  return (
    <>
      <SelectField
        label="Năm học"
        value={selectedYear ? String(selectedYear) : "Chọn"}
        onPress={onYearPress}
      />
      <SelectField
        label="Quý"
        value={selectedQuarter ? String(selectedQuarter) : "Chọn"}
        onPress={onQuarterPress}
        error={quarterError}
        style={styles.quarterField}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tra cứu"
        accessibilityState={{ disabled: !searchEnabled }}
        disabled={!searchEnabled}
        onPress={onSearch}
        style={({ pressed }) => [
          styles.searchButton,
          searchEnabled ? styles.searchButtonActive : null,
          pressed && searchEnabled ? styles.pressed : null,
        ]}
      >
        <ThemedText type="body" style={styles.searchButtonText}>
          Tra cứu
        </ThemedText>
      </Pressable>

      {selectedRange ? (
        <ThemedText type="bodySmall" style={styles.rangeHint}>
          {selectedRange.from} - {selectedRange.to}
        </ThemedText>
      ) : null}
    </>
  );
}

function SelectField({
  label,
  value,
  onPress,
  style,
  error,
}: {
  label: string;
  value: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  error?: string | null;
}) {
  return (
    <View style={style}>
      <ThemedText type="subtitle" style={styles.fieldLabel}>
        {label}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={({ pressed }) => [
          styles.selectBox,
          error ? styles.selectBoxError : null,
          pressed ? styles.pressed : null,
        ]}
      >
        <ThemedText
          type="body"
          style={[styles.selectValue, error ? styles.selectValueError : null]}
        >
          {value}
        </ThemedText>
        <AppIcon
          icon={<ChevronRight />}
          width={9}
          height={15}
          color={error ? Colors.light.primary : Colors.light.text}
          style={styles.dropdownIcon}
        />
      </Pressable>
      {error ? (
        <View style={styles.errorHint}>
          <AppIcon
            icon={<InfoCircle />}
            size={14}
            color={Colors.light.primary}
          />
          <ThemedText type="bodySmall" style={styles.errorHintText}>
            {error}
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    color: Colors.light.text,
    marginBottom: 12,
  },
  quarterField: {
    marginTop: 23,
  },
  selectBox: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 20,
    ...effects.soft,
  },
  selectBoxError: {
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  selectValue: {
    color: Colors.light.text,
  },
  selectValueError: {
    color: Colors.light.primary,
  },
  dropdownIcon: {
    transform: [{ rotate: "90deg" }],
  },
  errorHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  errorHintText: {
    color: Colors.light.primary,
  },
  searchButton: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: Colors.light.divider,
    marginTop: 30,
  },
  searchButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  searchButtonText: {
    color: Colors.light.surface,
  },
  rangeHint: {
    marginTop: 12,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.75,
  },
});
