import { Filter } from "reicon-react-native";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import { useDebounce } from "@/shared/hooks/useDebounce";
import { AppIcon } from "@/shared/ui/AppIcon";
import { SegmentedControl } from "@/shared/ui/SegmentedControl";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, effects, hexToRgba, radii, typography } from "@/theme";

import {
  NotificationTypeLabel,
  type NotificationType,
} from "../constants/notification.constants";
import { notificationTypes } from "../queries/notificationQueries";

export type NotificationReadTab = "all" | "unread";

export type NotificationFilterBarProps = {
  tab: NotificationReadTab;
  search: string;
  selectedType?: NotificationType;
  onTabChange: (tab: NotificationReadTab) => void;
  onSearchChange: (value: string) => void;
  onTypeChange: (type?: NotificationType) => void;
};

const readTabs: { value: NotificationReadTab; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "unread", label: "Chưa đọc" },
];

export function NotificationFilterBar({
  tab,
  search,
  selectedType,
  onTabChange,
  onSearchChange,
  onTypeChange,
}: NotificationFilterBarProps) {
  const [draftSearch, setDraftSearch] = useState(search);
  const debouncedSearch = useDebounce(draftSearch, 400);

  useEffect(() => {
    onSearchChange(debouncedSearch.trim());
  }, [debouncedSearch, onSearchChange]);

  const typeOptions = useMemo(
    () => [
      { label: "Tất cả loại", value: undefined },
      ...notificationTypes.map((type) => ({
        label: NotificationTypeLabel[type],
        value: type,
      })),
    ],
    [],
  );

  return (
    <View style={styles.toolbar}>
      <SegmentedControl
        value={tab}
        options={readTabs}
        variant="primary"
        onChange={onTabChange}
      />

      <View style={styles.searchBox}>
        <AppIcon icon={<Filter />} size={18} color={Colors.light.textSecondary} />
        <TextInput
          value={draftSearch}
          onChangeText={setDraftSearch}
          placeholder="Tìm theo tiêu đề, nội dung..."
          placeholderTextColor={Colors.light.textSecondary}
          returnKeyType="search"
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeScroller}
      >
        {typeOptions.map((option) => {
          const active = selectedType === option.value;
          return (
            <Pressable
              key={option.value ?? "all"}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: active }}
              onPress={() => onTypeChange(option.value)}
              style={({ pressed }) => [
                styles.typeChip,
                active ? styles.typeChipActive : null,
                pressed ? styles.pressed : null,
              ]}
            >
              <ThemedText
                type="caption"
                style={[styles.typeChipText, active ? styles.typeChipTextActive : null]}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.divider,
    borderRadius: radii.lg,
    backgroundColor: Colors.light.surface,
    padding: 12,
    ...effects.soft,
  },
  searchBox: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.divider,
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: Colors.light.text,
    paddingVertical: 0,
    ...typography.bodySmall,
  },
  typeScroller: {
    gap: 8,
    paddingRight: 2,
  },
  typeChip: {
    minHeight: 38,
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.divider,
    borderRadius: radii.pill,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 12,
  },
  typeChipActive: {
    borderColor: hexToRgba(Colors.light.primary, 0.34),
    backgroundColor: hexToRgba(Colors.light.primary, 0.08),
  },
  typeChipText: {
    color: Colors.light.textSecondary,
  },
  typeChipTextActive: {
    color: Colors.light.primary,
  },
  pressed: {
    opacity: 0.75,
  },
});
