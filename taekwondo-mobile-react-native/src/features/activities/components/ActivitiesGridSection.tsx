import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";
import { SvgXml } from "react-native-svg";

import type { ActivitiesAction } from "@/features/activities/domain/activities.types";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, effects, radii, typography } from "@/theme";

import quickMaskPrimary from "../../../../assets/icons/figma/feature-quick-mask-primary.svg";
import quickMaskSecondary from "../../../../assets/icons/figma/feature-quick-mask-secondary.svg";
import {
  ActivitiesActionButton,
  type ActivitiesActionVariant,
} from "./ActivitiesActionButton";

type ActivitiesGridSectionProps = {
  title?: string;
  actions: ActivitiesAction[];
  variant?: ActivitiesActionVariant;
  isEditingQuick?: boolean;
  onAddQuickAction?: (action: ActivitiesAction) => void;
  onRemoveQuickAction?: (action: ActivitiesAction) => void;
  onActionPress?: (action: ActivitiesAction) => void;
  style?: StyleProp<ViewStyle>;
};

export function ActivitiesGridSection({
  title,
  actions,
  variant = "default",
  isEditingQuick = false,
  onAddQuickAction,
  onRemoveQuickAction,
  onActionPress,
  style,
}: ActivitiesGridSectionProps) {
  const isQuick = variant === "quick";
  const handleActionPress = isEditingQuick
    ? isQuick
      ? onRemoveQuickAction
      : onAddQuickAction
    : onActionPress;

  return (
    <View style={style}>
      {title ? (
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
      ) : null}

      <View style={isQuick ? styles.quickPanel : styles.sectionGrid}>
        {isQuick ? (
          <>
            <SvgXml
              xml={quickMaskPrimary}
              width="100%"
              height="100%"
              style={styles.quickMask}
              pointerEvents="none"
              testID="activities-quick-mask-primary"
            />
            <SvgXml
              xml={quickMaskSecondary}
              width="100%"
              height="100%"
              style={styles.quickMask}
              pointerEvents="none"
              testID="activities-quick-mask-secondary"
            />
          </>
        ) : null}
        <View style={isQuick ? styles.quickGrid : styles.defaultGrid}>
          {actions.map((action) => (
            <View key={action.id} style={styles.itemWrapper}>
              <ActivitiesActionButton
                action={action}
                variant={variant}
                isEditingQuick={isEditingQuick}
                onPress={handleActionPress}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: Colors.light.text,
    ...typography.subtitle,
  },
  quickPanel: {
    minHeight: 130,
    overflow: "hidden",
    borderRadius: radii.md,
    backgroundColor: Colors.light.header,
    ...effects.card,
  },
  quickMask: {
    ...StyleSheet.absoluteFill,
  },
  quickGrid: {
    position: "relative",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    rowGap: 16,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 8,
  },
  sectionGrid: {
    marginTop: 22,
  },
  defaultGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
  },
  itemWrapper: {
    width: "25%",
    alignItems: "center",
  },
});
