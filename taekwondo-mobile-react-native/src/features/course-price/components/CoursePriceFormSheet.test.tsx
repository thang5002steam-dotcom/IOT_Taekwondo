import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import { CoursePriceFormSheet } from './CoursePriceFormSheet';

/* eslint-disable @typescript-eslint/no-require-imports */
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

describe('CoursePriceFormSheet', () => {
  it('automatically adds commas every 3 digits when typing prices', async () => {
    const onSubmit = jest.fn();
    const onClose = jest.fn();

    const view = await render(
      <CoursePriceFormSheet
        visible={true}
        mode="create"
        courseId="course-1"
        onClose={onClose}
        onSubmit={onSubmit}
      />
    );

    const finalPriceInput = await view.findByPlaceholderText(
      'Nhập học phí áp dụng (ví dụ: 1,200,000)'
    );
    const basePriceInput = await view.findByPlaceholderText(
      'Để trống nếu bằng giá bán (ví dụ: 1,500,000)'
    );

    await act(async () => {
      fireEvent.changeText(finalPriceInput, '1200000');
      fireEvent.changeText(basePriceInput, '1500000');
    });

    expect(await view.findByDisplayValue('1,200,000')).toBeTruthy();
    expect(await view.findByDisplayValue('1,500,000')).toBeTruthy();
  });

  it('submits parsed numeric values without commas', async () => {
    const onSubmit = jest.fn();
    const onClose = jest.fn();

    const view = await render(
      <CoursePriceFormSheet
        visible={true}
        mode="create"
        courseId="course-1"
        onClose={onClose}
        onSubmit={onSubmit}
      />
    );

    const finalPriceInput = await view.findByPlaceholderText(
      'Nhập học phí áp dụng (ví dụ: 1,200,000)'
    );
    const basePriceInput = await view.findByPlaceholderText(
      'Để trống nếu bằng giá bán (ví dụ: 1,500,000)'
    );

    await act(async () => {
      fireEvent.changeText(finalPriceInput, '2500000');
      fireEvent.changeText(basePriceInput, '3000000');
    });

    const submitBtn = await view.findByText('Tạo gói học');
    await act(async () => {
      fireEvent.press(submitBtn);
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        courseId: 'course-1',
        finalPrice: 2500000,
        basePrice: 3000000,
        durationMonths: 3,
        sessionCount: 24,
        status: 'ACTIVE',
      })
    );
  });

  it('formats initial prices with commas when in edit mode', async () => {
    const onSubmit = jest.fn();
    const onClose = jest.fn();

    const view = await render(
      <CoursePriceFormSheet
        visible={true}
        mode="edit"
        courseId="course-1"
        coursePrice={{
          id: 'price-1',
          courseId: 'course-1',
          durationMonths: 6,
          durationLabel: '6 tháng',
          sessionCount: 48,
          sessionsLabel: '48 buổi',
          basePrice: 2000000,
          finalPrice: 1800000,
          monthlyPrice: 300000,
          status: 'ACTIVE',
          statusLabel: 'Đang áp dụng',
        }}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    );

    expect(await view.findByDisplayValue('1,800,000')).toBeTruthy();
    expect(await view.findByDisplayValue('2,000,000')).toBeTruthy();
  });
});
