import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, radii } from "@/theme";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ChevronLeft, Flashlight, FlashlightOn } from "reicon-react-native";

type CheckInHeaderProps = {
  torch: boolean;
  onToggleTorch: () => void;
  isTorchAvailable: boolean;
  topInset: number;
  onBack: () => void;
};

function CheckInHeaderComponent({
  torch,
  onToggleTorch,
  isTorchAvailable,
  topInset,
  onBack,
}: CheckInHeaderProps) {
  return (
    <View style={[styles.container, { paddingTop: topInset + 8 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
        onPress={onBack}
        style={({ pressed }) => [
          styles.iconButton,
          pressed ? styles.pressed : null,
        ]}
      >
        <AppIcon
          icon={<ChevronLeft />}
          size={24}
          color={Colors.light.surface}
        />
      </Pressable>

      <View style={styles.titleContainer}>
        <ThemedText type="heading" style={styles.title}>
          Điểm danh
        </ThemedText>
        <ThemedText type="caption" style={styles.subtitle}>
          TAEKWONDO VĂN QUÁN
        </ThemedText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          isTorchAvailable
            ? torch
              ? "Tắt đèn pin"
              : "Bật đèn pin"
            : "Đèn pin không khả dụng với camera trước"
        }
        accessibilityState={{ disabled: !isTorchAvailable }}
        disabled={!isTorchAvailable}
        onPress={onToggleTorch}
        style={({ pressed }) => [
          styles.iconButton,
          torch ? styles.torchActive : null,
          !isTorchAvailable ? styles.disabled : null,
          pressed ? styles.pressed : null,
        ]}
      >
        <AppIcon
          icon={torch ? <FlashlightOn /> : <Flashlight />}
          size={22}
          color={torch ? Colors.light.primary : Colors.light.surface}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  torchActive: {
    backgroundColor: Colors.light.surface,
  },
  disabled: {
    opacity: 0.45,
  },
  titleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: Colors.light.surface,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
});

export const CheckInHeader = memo(CheckInHeaderComponent);
