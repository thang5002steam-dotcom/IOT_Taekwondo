import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: {
      View: (props: object) => React.createElement(View, props),
    },
    useSharedValue: (initialValue: unknown) => ({
      get: () => initialValue,
      set: jest.fn(),
    }),
    useAnimatedStyle: (fn: () => object) => fn(),
    useReducedMotion: () => false,
    withTiming: (toValue: unknown) => toValue,
    Easing: {
      bezier: () => () => 0,
    },
  };
});

jest.mock('@/shared/ui/AppIcon', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    AppIcon: () => React.createElement(View, null),
  };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
  },
}));

import { CancellableLoadingOverlay } from './CancellableLoadingOverlay';

describe('CancellableLoadingOverlay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders null when visible is false', async () => {
    const screen = await render(
      <CancellableLoadingOverlay visible={false} />,
    );
    expect(screen.queryByLabelText('Đang xử lý')).toBeNull();
  });

  it('renders loading message and cancel button when visible is true', async () => {
    const onCancel = jest.fn();
    const screen = await render(
      <CancellableLoadingOverlay
        visible={true}
        message="Đang xử lý khóa học..."
        cancelLabel="Hủy bỏ"
        onCancel={onCancel}
      />,
    );

    expect(screen.getByLabelText('Đang xử lý')).toBeTruthy();
    expect(screen.getByText('Đang xử lý khóa học...')).toBeTruthy();

    const cancelButton = screen.getByLabelText('Hủy bỏ');
    expect(cancelButton).toBeTruthy();

    fireEvent.press(cancelButton);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });

  it('renders without cancel button when onCancel is omitted', async () => {
    const screen = await render(
      <CancellableLoadingOverlay visible={true} message="Đang tải..." />,
    );
    expect(screen.getByText('Đang tải...')).toBeTruthy();
    expect(screen.queryByLabelText('Hủy')).toBeNull();
  });
});
