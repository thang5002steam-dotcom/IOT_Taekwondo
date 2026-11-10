import { Check } from "reicon-react-native";
import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BottomSheetWindow } from '@/shared/ui/BottomSheetWindow';
import { AppIcon } from '@/shared/ui/AppIcon';
import { ThemedText } from '@/shared/ui/ThemedText';
import { Colors, radii } from '@/theme';

type HistorySelectOption<T extends string | number> = {
  value: T;
  label: string;
};

type HistorySelectSheetProps<T extends string | number> = {
  visible: boolean;
  title: string;
  options: readonly HistorySelectOption<T>[];
  selectedValue?: T;
  selectionDelayMs?: number;
  onClose: () => void;
  onPreviewSelect?: (value: T) => void;
  onSelect: (value: T) => void;
};

const DEFAULT_SELECTION_DELAY_MS = 200;

export function HistorySelectSheet<T extends string | number>({
  visible,
  title,
  options,
  selectedValue,
  selectionDelayMs = DEFAULT_SELECTION_DELAY_MS,
  onClose,
  onPreviewSelect,
  onSelect,
}: HistorySelectSheetProps<T>) {
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [feedbackValue, setFeedbackValue] = useState<T>();

  useEffect(
    () => () => {
      if (commitTimerRef.current) {
        clearTimeout(commitTimerRef.current);
      }
    },
    [],
  );

  const handleClose = () => {
    if (commitTimerRef.current) {
      clearTimeout(commitTimerRef.current);
    }

    setFeedbackValue(undefined);
    onClose();
  };

  const handleSelect = (value: T) => {
    if (commitTimerRef.current) {
      clearTimeout(commitTimerRef.current);
    }

    setFeedbackValue(value);
    onPreviewSelect?.(value);
    void Haptics.selectionAsync();

    commitTimerRef.current = setTimeout(() => {
      setFeedbackValue(undefined);
      onSelect(value);
    }, selectionDelayMs);
  };

  return (
    <BottomSheetWindow
      visible={visible}
      title={title}
      heightRatio={0.4}
      contentContainerStyle={styles.options}
      onClose={handleClose}
    >
      {options.map((option) => {
        const selected = option.value === (feedbackValue ?? selectedValue);
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => handleSelect(option.value)}
            style={({ pressed }) => [
              styles.option,
              selected ? styles.optionSelected : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <ThemedText
              type="body"
              style={[styles.optionText, selected ? styles.optionTextSelected : null]}
            >
              {option.label}
            </ThemedText>
            {selected ? (
              <AppIcon icon={<Check />} size={22} color={Colors.light.primary} />
            ) : null}
          </Pressable>
        );
      })}
      <View style={styles.bottomSpacer} />
    </BottomSheetWindow>
  );
}

const styles = StyleSheet.create({
  options: {
    paddingTop: 18,
    gap: 10,
  },
  option: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.divider,
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 18,
  },
  optionSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#FFF4F4',
  },
  optionText: {
    color: Colors.light.text,
  },
  optionTextSelected: {
    color: Colors.light.primary,
  },
  bottomSpacer: {
    height: 28,
  },
  pressed: {
    opacity: 0.78,
  },
});
