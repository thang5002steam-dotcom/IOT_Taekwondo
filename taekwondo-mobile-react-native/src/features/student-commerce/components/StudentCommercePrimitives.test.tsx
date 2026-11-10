import { fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('@/shared/ui/BottomSheetWindow', () => ({
  BottomSheetWindow: ({
    visible,
    children,
    footer,
  }: {
    visible: boolean;
    children: React.ReactNode;
    footer?: React.ReactNode;
  }) => {
    const { View } = require('react-native');
    return visible ? <View>{children}{footer}</View> : null;
  },
}));

import {
  CourseCatalogCard,
  PackageSheet,
  SegmentedTabs,
  TransactionCard,
} from './StudentCommercePrimitives';
import { StudentProfileSummaryCard } from '@/features/student/components/StudentProfileSummaryCard';
import { studentCommerceMock } from '../fixtures/studentCommerce.fixtures';

describe('StudentCommercePrimitives', () => {
  it('renders student summary card content', async () => {
    const screen = await render(
      <StudentProfileSummaryCard
        student={{ ...studentCommerceMock.selectedStudent, birthDate: '2012-08-11' }}
      />,
    );

    expect(screen.getByText('Nguyễn Văn An')).toBeTruthy();
    expect(screen.getByText('11/08/2012 · Đai xanh')).toBeTruthy();
    expect(screen.getByText('Đang hoạt động')).toBeTruthy();
  });

  it('renders positive and negative transaction amounts', async () => {
    const screen = await render(
      <>
        <TransactionCard transaction={studentCommerceMock.transactions[0]} />
        <TransactionCard transaction={studentCommerceMock.transactions[1]} />
      </>,
    );

    expect(screen.getByText('+2.000.000đ')).toBeTruthy();
    expect(screen.getByText('-3.000.000đ')).toBeTruthy();
  });

  it('renders one pressable course catalog card without package action', async () => {
    const onPress = jest.fn();
    const screen = await render(
      <CourseCatalogCard course={studentCommerceMock.courses[0]} onPress={onPress} />,
    );

    expect(screen.getByText('Taekwondo Cơ bản')).toBeTruthy();
    expect(screen.getByText('Cơ sở Văn Quán')).toBeTruthy();
    expect(screen.getByText('Thứ 3, 5, 7 · 18:00–19:30')).toBeTruthy();
    expect(screen.getByText('500.000đ/tháng')).toBeTruthy();
    expect(screen.queryByText('Xem gói')).toBeNull();

    fireEvent.press(screen.getByLabelText('Xem chi tiết Taekwondo Cơ bản'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes selected state for segmented tabs', async () => {
    const onChange = jest.fn();
    const screen = await render(
      <SegmentedTabs
        value="registration"
        tabs={[
          { value: 'registration', label: 'Đăng ký' },
          { value: 'active', label: 'Đang diễn ra' },
        ]}
        onChange={onChange}
      />,
    );

    fireEvent.press(screen.getByText('Đang diễn ra'));
    expect(onChange).toHaveBeenCalledWith('active');
  });

  it('selects package before opening package detail from package sheet CTA', async () => {
    const onOpenPackage = jest.fn();
    const screen = await render(
      <PackageSheet
        visible
        course={studentCommerceMock.courses[1]}
        onClose={jest.fn()}
        onOpenPackage={onOpenPackage}
      />,
    );

    expect(screen.getByText('Phổ biến')).toBeTruthy();
    expect(screen.getByText('2.700.000đ')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Chọn gói 6 tháng'));
    expect(onOpenPackage).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByLabelText('Chọn gói 6 tháng').props.accessibilityState).toEqual({
        selected: true,
      });
    });

    fireEvent.press(screen.getByLabelText('Chọn gói này'));
    expect(onOpenPackage).toHaveBeenCalledWith('advanced-6m');
  });

  it('opens default popular package from package sheet CTA', async () => {
    const onOpenPackage = jest.fn();
    const screen = await render(
      <PackageSheet
        visible
        course={studentCommerceMock.courses[1]}
        onClose={jest.fn()}
        onOpenPackage={onOpenPackage}
      />,
    );

    fireEvent.press(screen.getByLabelText('Chọn gói này'));
    expect(onOpenPackage).toHaveBeenCalledWith('advanced-3m');
  });

  it('renders complete badge label without truncation and footer social proof motif', async () => {
    const screen = await render(
      <PackageSheet
        visible
        course={studentCommerceMock.courses[0]}
        onClose={jest.fn()}
        onOpenPackage={jest.fn()}
      />,
    );

    expect(screen.getByText('Tiết kiệm 600.000đ')).toBeTruthy();
    expect(screen.getAllByText(/Đã đồng hành cùng hơn/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('85+ học viên').length).toBeGreaterThan(0);
  });
});
