import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { useTheme } from '@/shared/hooks/useTheme';
import { Fonts, ThemeColor, typography } from '@/theme/theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'title'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'heading'
    | 'body'
    | 'bodySmall'
    | 'caption'
    | 'featureLabel'
    | 'action'
    | 'link'
    | 'linkPrimary'
    | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'heading' && typography.heading,
        type === 'body' && typography.body,
        type === 'bodySmall' && typography.bodySmall,
        type === 'caption' && typography.caption,
        type === 'featureLabel' && typography.featureLabel,
        type === 'action' && typography.action,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    ...typography.bodySmall,
  },
  smallBold: {
    ...typography.featureLabel,
  },
  default: {
    ...typography.body,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.subtitle,
  },
  link: {
    ...typography.bodySmall,
  },
  linkPrimary: {
    ...typography.bodySmall,
    color: '#3c87f7',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
