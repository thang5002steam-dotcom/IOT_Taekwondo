import './global.css';

import { Platform } from 'react-native';

export { Colors, colorPrimitives, figmaColors, Gradients, hexToRgba, type ThemeColor } from './colors';
export { effects } from './effects';
export { radii } from './radii';
export { fontFamilies, typography, type TypographyVariant } from './typography';

export const Fonts = Platform.select({
  ios: {
    sans: 'Roboto_400Regular',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Roboto_400Regular',
    serif: 'serif',
    rounded: 'Roboto_400Regular',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
