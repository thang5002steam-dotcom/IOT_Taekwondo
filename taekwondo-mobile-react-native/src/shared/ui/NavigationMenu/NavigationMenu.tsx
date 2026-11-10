import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { ChevronRight } from "reicon-react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import {
  Colors,
  activeEffect,
  effects,
  hexToRgba,
  radii,
  typography,
  type AppIconElement,
} from "@/theme";

export type NavigationMenuItemProps = {
  icon?: AppIconElement;
  title: string;
  subtitle?: string;
  count?: number | string;
  onPress?: () => void;
  showDivider?: boolean;
  showChevron?: boolean;
  iconBox?: boolean;
  iconColor?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function NavigationMenuItem({
  icon,
  title,
  subtitle,
  count,
  onPress,
  showDivider = false,
  showChevron = true,
  iconBox = false,
  iconColor,
  accessibilityLabel,
  disabled = false,
  style,
}: NavigationMenuItemProps) {
  const displayTitle = count !== undefined ? `${title} (${count})` : title;
  const resolvedIconColor =
    iconColor ?? (iconBox ? Colors.light.icon : Colors.light.primary);
  const hasSubtitle = Boolean(subtitle);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        hasSubtitle && styles.rowWithSubtitle,
        activeEffect(pressed, "pressedHighlight"),
        style,
      ]}
    >
      {icon ? (
        iconBox ? (
          <View style={styles.iconBox}>
            <AppIcon icon={icon} size={26} color={resolvedIconColor} />
          </View>
        ) : (
          <AppIcon icon={icon} size={24} color={resolvedIconColor} />
        )
      ) : null}

      <View style={[styles.copy, hasSubtitle && styles.copyWithSubtitle]}>
        <ThemedText type="body" numberOfLines={2} style={styles.title}>
          {displayTitle}
        </ThemedText>
        {subtitle ? (
          <ThemedText
            type="bodySmall"
            numberOfLines={2}
            style={styles.subtitle}
          >
            {subtitle}
          </ThemedText>
        ) : null}
      </View>

      {showChevron ? (
        <AppIcon
          icon={<ChevronRight />}
          width={9}
          height={15}
          color={Colors.light.icon}
        />
      ) : null}

      {showDivider ? (
        <View style={[styles.divider, iconBox && styles.dividerWithBox]} />
      ) : null}
    </Pressable>
  );
}

export type NavigationMenuProps = {
  children?: ReactNode;
  items?: NavigationMenuItemProps[];
  style?: StyleProp<ViewStyle>;
};

export function NavigationMenu({
  children,
  items,
  style,
}: NavigationMenuProps) {
  if (items && items.length > 0) {
    return (
      <View style={[styles.card, style]}>
        {items.map((item, index) => (
          <NavigationMenuItem
            key={`${item.title}-${index}`}
            {...item}
            showDivider={
              item.showDivider !== undefined
                ? item.showDivider
                : index < items.length - 1
            }
          />
        ))}
      </View>
    );
  }

  const childCount = Children.count(children);

  return (
    <View style={[styles.card, style]}>
      {Children.map(children, (child, index) => {
        if (!isValidElement<NavigationMenuItemProps>(child)) return child;
        return cloneElement(child as ReactElement<NavigationMenuItemProps>, {
          showDivider:
            child.props.showDivider !== undefined
              ? child.props.showDivider
              : index < childCount - 1,
        });
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.divider,
    overflow: "hidden",
    ...effects.card,
  },
  row: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 14,
  },
  rowWithSubtitle: {
    minHeight: 76,
    paddingVertical: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: hexToRgba(Colors.light.primary, 0.08),
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  copyWithSubtitle: {
    gap: 2,
  },
  title: {
    color: Colors.light.text,
    ...typography.body,
  },
  subtitle: {
    color: Colors.light.textSecondary,
  },
  divider: {
    position: "absolute",
    left: 54,
    right: 16,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.divider,
  },
  dividerWithBox: {
    left: 74,
  },
});
