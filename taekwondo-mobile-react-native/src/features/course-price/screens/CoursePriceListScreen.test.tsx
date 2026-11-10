import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { courseApi } from '@/features/course/api/courseApi';
import { coursePriceApi } from '@/features/course-price/api/coursePriceApi';
import type { CoursePriceSimpleResponse } from '@/features/course-price/api/course-price.dto';
import type { PageResponse } from '@/infrastructure/http/pagination.types';
import { CoursePriceListScreen } from './CoursePriceListScreen';

const mockToastShow = jest.fn();

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/shared/ui/Toast', () => ({
  useToast: () => ({ show: mockToastShow }),
}));

jest.mock('@/features/authorization/hooks/useAccess', () => ({
  useCan: () => true,
}));

/* eslint-disable @typescript-eslint/no-require-imports */
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

jest.mock('@/shared/ui/CancellableLoadingOverlay', () => ({
  CancellableLoadingOverlay: () => null,
}));

jest.mock('@/shared/ui/ConfirmationDialog', () => ({
  ConfirmationDialog: () => null,
}));

jest.mock('@/routes/navigation/layouts/StackScreenLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => {
    const { View } = require('react-native');
    return <View testID="stack-layout">{children}</View>;
  },
}));

jest.mock('@/shared/ui/BottomSheetWindow', () => ({
  BottomSheetWindow: ({
    visible,
    children,
    footer,
    overlay,
    title,
  }: {
    visible: boolean;
    children: React.ReactNode;
    footer?: React.ReactNode;
    overlay?: React.ReactNode;
    title?: string;
  }) => {
    const { View, Text } = require('react-native');
    return visible ? (
      <View testID={`bottom-sheet-${title ?? 'window'}`}>
        <Text>{title}</Text>
        {children}
        {footer}
        {overlay}
      </View>
    ) : null;
  },
}));
/* eslint-enable @typescript-eslint/no-require-imports */

jest.mock('@/features/course/api/courseApi', () => ({
  courseApi: { get: jest.fn() },
}));

jest.mock('@/features/course-price/api/coursePriceApi', () => ({
  coursePriceApi: {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));

function mockPage<T>(content: T[]): PageResponse<T> {
  return {
    content,
    pageNumber: 0,
    pageSize: 20,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

const mockPrices: CoursePriceSimpleResponse[] = [
  {
    coursePriceId: 'price-1',
    durationMonths: 3,
    sessionCount: 24,
    basePrice: 1500000,
    finalPrice: 1200000,
    status: 'ACTIVE',
  },
  {
    coursePriceId: 'price-2',
    durationMonths: 6,
    sessionCount: 48,
    basePrice: 2800000,
    finalPrice: 2200000,
    status: 'INACTIVE',
  },
];

describe('CoursePriceListScreen', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });

    (courseApi.get as jest.Mock).mockResolvedValue({
      courseId: 'course-1',
      name: 'Khóa Taekwondo Cơ bản',
      courseSchedules: [],
    });

    (coursePriceApi.list as jest.Mock).mockResolvedValue(mockPage(mockPrices));
    (coursePriceApi.create as jest.Mock).mockResolvedValue({
      coursePriceId: 'price-new',
      durationMonths: 1,
      sessionCount: 12,
      basePrice: 600000,
      finalPrice: 500000,
      status: 'ACTIVE',
    });
    (coursePriceApi.update as jest.Mock).mockResolvedValue({
      coursePriceId: 'price-1',
      durationMonths: 3,
      sessionCount: 24,
      basePrice: 1500000,
      finalPrice: 1200000,
      status: 'INACTIVE',
    });
    (coursePriceApi.remove as jest.Mock).mockResolvedValue(undefined);
  });

  const renderComponent = async () =>
    await render(
      <QueryClientProvider client={queryClient}>
        <CoursePriceListScreen courseId="course-1" />
      </QueryClientProvider>,
    );

  it('renders list of course prices', async () => {
    const view = await renderComponent();

    expect(await view.findByText('3 tháng')).toBeTruthy();
    expect(await view.findByText('24 buổi')).toBeTruthy();
    expect(await view.findByText('6 tháng')).toBeTruthy();
    expect(await view.findByText('48 buổi')).toBeTruthy();
  });

  it('filters course prices when searching', async () => {
    const view = await renderComponent();

    expect(await view.findByText('3 tháng')).toBeTruthy();
    expect(await view.findByText('6 tháng')).toBeTruthy();

    const searchInput = await view.findByPlaceholderText('Tìm số tháng, số buổi, giá...');
    await act(async () => {
      fireEvent.changeText(searchInput, '6 tháng');
      await new Promise((r) => setTimeout(r, 300));
    });

    await waitFor(() => {
      expect(view.queryByText('3 tháng')).toBeNull();
      expect(view.getByText('6 tháng')).toBeTruthy();
    });
  });

  it('opens create sheet when clicking plus button and creates price', async () => {
    const view = await renderComponent();

    const addButton = await view.findByTestId('add-price-button');
    await act(async () => {
      fireEvent.press(addButton);
    });

    expect(await view.findByText('Tạo gói học mới')).toBeTruthy();

    const finalPriceInput = await view.findByPlaceholderText(
      'Nhập học phí áp dụng (ví dụ: 1,200,000)',
    );
    await act(async () => {
      fireEvent.changeText(finalPriceInput, '800000');
    });

    const submitButton = await view.findByText('Tạo gói học');
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(coursePriceApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          courseId: 'course-1',
          finalPrice: 800000,
        }),
      );
      expect(mockToastShow).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Tạo gói học thành công',
          variant: 'success',
        }),
      );
    });
  });

  it('opens detail window when clicking a price card', async () => {
    const view = await renderComponent();

    const card = await view.findByTestId('price-card-price-1');
    await act(async () => {
      fireEvent.press(card);
    });

    expect(await view.findByText('Chi tiết gói học')).toBeTruthy();
    expect(await view.findByText('Tạm dừng')).toBeTruthy();
    expect(await view.findByText('Chỉnh sửa')).toBeTruthy();
  });

  it('toggles package status from detail window', async () => {
    const view = await renderComponent();

    const card = await view.findByTestId('price-card-price-1');
    await act(async () => {
      fireEvent.press(card);
    });

    const pauseButton = await view.findByText('Tạm dừng');
    await act(async () => {
      fireEvent.press(pauseButton);
    });

    await waitFor(() => {
      expect(coursePriceApi.update).toHaveBeenCalledWith(
        'price-1',
        expect.objectContaining({
          status: 'INACTIVE',
        }),
      );
      expect(mockToastShow).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Đã tạm dừng gói học',
          variant: 'success',
        }),
      );
    });
  });
});
