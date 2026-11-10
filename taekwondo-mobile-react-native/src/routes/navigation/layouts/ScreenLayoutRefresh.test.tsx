import { render } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import { RefreshControl, Text } from 'react-native';

import BottomTabScreenLayout from './BottomTabScreenLayout';
import StackScreenLayout from './StackScreenLayout';

const mockRefreshState = {
  refreshing: false,
  onRefresh: jest.fn(),
};

type CapturedScrollViewProps = {
  children?: ReactNode;
  refreshControl?: ReactElement;
};

type RefreshControlProps = {
  refreshing: boolean;
  onRefresh: () => void;
};

const mockScrollViewProps: CapturedScrollViewProps[] = [];

jest.mock('react-native', () => {
  const React = require('react');
  const RN = jest.requireActual('react-native');

  return new Proxy(RN, {
    get(target, prop) {
      if (prop === 'ScrollView') {
        const MockScrollView = (props: CapturedScrollViewProps) => {
          mockScrollViewProps.push(props);
          return React.createElement(target.View, null, props.children);
        };
        MockScrollView.displayName = 'MockScrollView';
        return MockScrollView;
      }
      return target[prop];
    },
  });
});

jest.mock('../components/DefaultHeaderActions', () => ({
  DefaultHeaderActions: () => {
    const { View } = require('react-native');
    return <View testID="default-header-actions" />;
  },
}));

jest.mock('../components/HeaderActionButton', () => ({
  HeaderActionButton: () => {
    const { View } = require('react-native');
    return <View testID="header-action-button" />;
  },
}));

jest.mock('@/infrastructure/query/useActiveQueriesRefresh', () => ({
  useActiveQueriesRefresh: () => mockRefreshState,
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
    push: jest.fn(),
  }),
}));

jest.mock('expo-image', () => ({
  Image: (props: object) => {
    const { View } = require('react-native');
    return <View {...props} />;
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
  }) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

function getRefreshControl() {
  return mockScrollViewProps.at(-1)?.refreshControl;
}

function requireRefreshControl() {
  const refreshControl = getRefreshControl() as
    | ReactElement<RefreshControlProps>
    | undefined;
  if (!refreshControl) {
    throw new Error('Expected layout to pass a RefreshControl to ScrollView.');
  }
  return refreshControl;
}

describe('screen layout refresh control', () => {
  beforeEach(() => {
    mockRefreshState.refreshing = false;
    mockRefreshState.onRefresh.mockClear();
    mockScrollViewProps.length = 0;
  });

  it('enables pull-to-refresh for bottom tab screens by default', async () => {
    await render(
      <BottomTabScreenLayout title="Lịch học" activeTab="schedule">
        <Text>Content</Text>
      </BottomTabScreenLayout>,
    );

    const refreshControl = requireRefreshControl();

    expect(refreshControl.type).toBe(RefreshControl);
    expect(refreshControl.props.refreshing).toBe(false);
    expect(refreshControl.props.onRefresh).toBe(mockRefreshState.onRefresh);
  });

  it('can disable pull-to-refresh for bottom tab screens', async () => {
    await render(
      <BottomTabScreenLayout
        title="Lịch học"
        activeTab="schedule"
        refreshEnabled={false}
      >
        <Text>Content</Text>
      </BottomTabScreenLayout>,
    );

    expect(getRefreshControl()).toBeUndefined();
  });

  it('enables pull-to-refresh for scrollable stack screens by default', async () => {
    await render(
      <StackScreenLayout title="Ví điện tử">
        <Text>Content</Text>
      </StackScreenLayout>,
    );

    const refreshControl = requireRefreshControl();

    expect(refreshControl.type).toBe(RefreshControl);
    expect(refreshControl.props.refreshing).toBe(false);
    expect(refreshControl.props.onRefresh).toBe(mockRefreshState.onRefresh);
  });

  it('can disable pull-to-refresh for stack screens', async () => {
    await render(
      <StackScreenLayout title="Ví điện tử" refreshEnabled={false}>
        <Text>Content</Text>
      </StackScreenLayout>,
    );

    expect(getRefreshControl()).toBeUndefined();
  });
});
