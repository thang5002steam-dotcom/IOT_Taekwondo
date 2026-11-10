import { cloneElement, isValidElement, memo } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import type { IconProps } from "reicon-react-native";

import type { AppIconElement } from "@/theme/icons";

export type AppIconProps = {
  icon: AppIconElement;
  size?: number;
  width?: number;
  height?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

function AppIconComponent({
  icon,
  size,
  width,
  height,
  color,
  style,
}: AppIconProps) {
  if (!isValidElement<IconProps>(icon)) {
    return null;
  }

  const resolvedSize = size ?? Math.max(width ?? 24, height ?? 24);

  const overrideProps: Partial<IconProps> = {
    size: resolvedSize,
  };

  const resolvedWidth = width ?? icon.props.width;
  if (resolvedWidth !== undefined) {
    overrideProps.width = resolvedWidth;
  }

  const resolvedHeight = height ?? icon.props.height;
  if (resolvedHeight !== undefined) {
    overrideProps.height = resolvedHeight;
  }

  const resolvedColor = color ?? icon.props.color;
  if (resolvedColor !== undefined) {
    overrideProps.color = resolvedColor;
  }

  if (style || icon.props.style) {
    overrideProps.style = style
      ? [icon.props.style, style]
      : icon.props.style;
  }

  return cloneElement(icon, overrideProps);
}

export const AppIcon = memo(AppIconComponent);
