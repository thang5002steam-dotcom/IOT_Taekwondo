import { Pressable, StyleSheet, View } from "react-native";
import { AddCircle, MinusCircle } from "reicon-react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, effects, figmaColors, hexToRgba, typography } from "@/theme";
import type { ActivitiesAction } from "@/features/activities/domain/activities.types";

export type ActivitiesActionVariant = "quick" | "default";

type ActivitiesActionButtonProps = {
  action: ActivitiesAction;
  variant?: ActivitiesActionVariant;
  isEditingQuick?: boolean;
  onPress?: (action: ActivitiesAction) => void;
};

const noop = () => undefined;

export function ActivitiesActionButton({
  action,
  variant = "default",
  isEditingQuick = false,
  onPress,
}: ActivitiesActionButtonProps) {
  const isQuick = variant === "quick";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={action.label}
      onPress={onPress ? () => onPress(action) : noop}
      style={({ pressed }) => [styles.root, pressed ? styles.pressed : null]}
    >
      <View
        style={[styles.tile, isQuick ? styles.quickTile : styles.defaultTile]}
      >
        <AppIcon icon={action.icon} size={35} color={Colors.light.primary} />
        {isEditingQuick ? (
          <View style={styles.badge}>
            {isQuick ? (
              <>
                <AppIcon
                  icon={<MinusCircle weight="Filled" />}
                  size={30}
                  color={Colors.light.primary}
                />
                <AppIcon
                  icon={<MinusCircle color="white" />}
                  size={30}
                  style={StyleSheet.absoluteFill}
                />
              </>
            ) : (
              <>
                <AppIcon
                  icon={<AddCircle weight="Filled" />}
                  size={30}
                  color={Colors.light.success}
                />
                <AppIcon
                  icon={<AddCircle color="white" />}
                  size={30}
                  style={StyleSheet.absoluteFill}
                />
              </>
            )}
          </View>
        ) : null}
      </View>
      <ThemedText
        type="featureLabel"
        numberOfLines={2}
        style={[
          styles.label,
          isQuick ? styles.quickLabel : styles.defaultLabel,
        ]}
      >
        {action.label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    minHeight: 100,
    alignItems: "center",
  },
  tile: {
    width: 70,
    height: 70,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quickTile: {
    backgroundColor: Colors.light.surface,
    ...effects.card,
  },
  defaultTile: {
    backgroundColor: hexToRgba(figmaColors.color1, 0.1),
  },
  badge: {
    position: "absolute",
    top: -10,
    right: -12,
  },
  label: {
    width: "90%",
    marginTop: 4,
    textAlign: "center",
    ...typography.featureLabel,
  },
  quickLabel: {
    color: Colors.light.surface,
    ...typography.bodySmall,
  },
  defaultLabel: {
    color: Colors.light.text,
    ...typography.bodySmall,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
