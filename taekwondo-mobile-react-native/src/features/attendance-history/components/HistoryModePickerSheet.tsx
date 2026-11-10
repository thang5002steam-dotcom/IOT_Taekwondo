import { Pressable, StyleSheet, View } from "react-native";
import { CheckListNotes, Teacher } from "reicon-react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { BottomSheetWindow } from "@/shared/ui/BottomSheetWindow";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, effects, hexToRgba, radii, typography } from "@/theme";
import type { AppIconElement } from "@/theme/icons";

import type { AttendanceHistoryMode } from "../domain/historyAccess";

type HistoryModePickerSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelectMode: (mode: AttendanceHistoryMode) => void;
};

export function HistoryModePickerSheet({
  visible,
  onClose,
  onSelectMode,
}: HistoryModePickerSheetProps) {
  return (
    <BottomSheetWindow
      visible={visible}
      title="Chọn lịch sử"
      heightRatio={3 / 10}
      accessibilityLabel="Chọn loại lịch sử điểm danh"
      onClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.modeGrid}>
          <ModeButton
            title="Học viên"
            description="Điểm danh học viên"
            icon={<CheckListNotes color={Colors.light.primary} />}
            onPress={() => onSelectMode("student")}
          />
          <ModeButton
            title="HLV"
            description="Chấm công HLV"
            icon={<Teacher color={Colors.light.primary} />}
            onPress={() => onSelectMode("coach")}
          />
        </View>
      </View>
    </BottomSheetWindow>
  );
}

function ModeButton({
  title,
  description,
  icon,
  onPress,
}: {
  title: string;
  description: string;
  icon: AppIconElement;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeButton,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.modeIconWrap}>
        <AppIcon icon={icon} size={34} />
      </View>
      <ThemedText type="subtitle" numberOfLines={1} style={styles.modeTitle}>
        {title}
      </ThemedText>
      <ThemedText
        type="bodySmall"
        numberOfLines={2}
        style={styles.modeDescription}
      >
        {description}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 36,
  },
  modeGrid: {
    flexDirection: "row",
    gap: 12,
  },
  modeButton: {
    flex: 1,
    minHeight: 132,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: hexToRgba(Colors.light.primary, 0.22),
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 10,
    ...effects.card,
  },
  modeIconWrap: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: hexToRgba(Colors.light.primary, 0.08),
  },
  modeTitle: {
    color: Colors.light.text,
    textAlign: "center",
  },
  modeDescription: {
    color: Colors.light.textSecondary,
    textAlign: "center",
    ...typography.bodySmall,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
});
