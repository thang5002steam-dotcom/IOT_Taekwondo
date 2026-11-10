import { act, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import {
  PanResponder,
  type GestureResponderEvent,
  type PanResponderCallbacks,
  type PanResponderGestureState,
} from 'react-native';

import { JudgeCard } from './SparringRoomScreen.native';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Heavy: 'heavy',
    Medium: 'medium',
  },
}));

jest.mock('@/shared/ui/ThemedText', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    ThemedText: ({ children, ...props }: { children?: React.ReactNode }) =>
      React.createElement(Text, props, children),
  };
});

describe('JudgeCard native gestures', () => {
  let callbacks: PanResponderCallbacks;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(PanResponder, 'create').mockImplementation((nextCallbacks) => {
      callbacks = nextCallbacks;
      return { panHandlers: {} } as ReturnType<typeof PanResponder.create>;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const eventAt = (pageY: number) =>
    ({ nativeEvent: { pageY } }) as GestureResponderEvent;
  const gestureWithDy = (dy: number) =>
    ({ dy }) as PanResponderGestureState;

  it('sends and vibrates only once after an upward swipe', async () => {
    const onScore = jest.fn();
    await render(<JudgeCard side="red" basePoints={2} onScore={onScore} />);

    await act(() => callbacks.onPanResponderGrant?.(eventAt(100), gestureWithDy(0)));
    await act(() => callbacks.onPanResponderMove?.(eventAt(80), gestureWithDy(-20)));
    await act(() => callbacks.onPanResponderMove?.(eventAt(70), gestureWithDy(-30)));
    await act(() => callbacks.onPanResponderRelease?.(eventAt(70), gestureWithDy(-30)));

    expect(onScore).toHaveBeenCalledTimes(1);
    expect(onScore).toHaveBeenCalledWith('red', 4);
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
    expect(Haptics.impactAsync).toHaveBeenCalledWith('heavy');
  });

  it('keeps a normal press at the base score with the same haptic path', async () => {
    const onScore = jest.fn();
    await render(<JudgeCard side="blue" basePoints={3} onScore={onScore} />);

    await act(() => callbacks.onPanResponderGrant?.(eventAt(100), gestureWithDy(0)));
    await act(() => callbacks.onPanResponderRelease?.(eventAt(100), gestureWithDy(0)));

    expect(onScore).toHaveBeenCalledTimes(1);
    expect(onScore).toHaveBeenCalledWith('blue', 3);
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
    expect(Haptics.impactAsync).toHaveBeenCalledWith('heavy');
  });
});
