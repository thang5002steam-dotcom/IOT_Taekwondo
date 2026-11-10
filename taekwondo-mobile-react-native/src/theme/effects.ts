import type { ViewStyle } from 'react-native';

export const effects = {
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  // effect 2
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  glass: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  floating: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 12,
  },
  // Reusable press & interaction effects
  pressed: {
    opacity: 0.75,
  },
  pressedScale: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  pressedHighlight: {
    opacity: 0.8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
} satisfies Record<string, ViewStyle>;

export type EffectVariant = keyof typeof effects;

export type ActiveEffectVariant = 'pressed' | 'pressedScale' | 'pressedHighlight';

/**
 * Reusable helper for Pressable style prop.
 * Returns the corresponding interaction effect style when pressed is true.
 */
export function activeEffect(
  pressed: boolean,
  variant: ActiveEffectVariant = 'pressed',
): ViewStyle | null {
  return pressed ? effects[variant] : null;
}

