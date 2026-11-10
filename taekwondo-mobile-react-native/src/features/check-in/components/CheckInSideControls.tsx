import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, radii } from "@/theme";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Camera, Gallery } from "reicon-react-native";

type CheckInSideControlsProps = {
  onToggleFacing: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  top: number;
};

function CheckInSideControlsComponent({
  onToggleFacing,
  onOpenHistory,
  historyCount,
  top,
}: CheckInSideControlsProps) {
  return (
    <View style={[styles.container, { top }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Đổi camera trước hoặc sau"
        onPress={onToggleFacing}
        style={({ pressed }) => [
          styles.circleButton,
          pressed ? styles.pressed : null,
        ]}
      >
        <AppIcon icon={<Camera />} size={22} color={Colors.light.surface} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Xem lịch sử điểm danh phiên này"
        onPress={onOpenHistory}
        style={({ pressed }) => [
          styles.circleButton,
          pressed ? styles.pressed : null,
        ]}
      >
        <AppIcon icon={<Gallery />} size={22} color={Colors.light.surface} />
        {historyCount > 0 && (
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>
              {historyCount > 99 ? "99+" : historyCount}
            </ThemedText>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 18,
    gap: 16,
    zIndex: 10,
  },
  circleButton: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.light.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.light.surface,
  },
  badgeText: {
    color: Colors.light.surface,
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
});

export const CheckInSideControls = memo(CheckInSideControlsComponent);
