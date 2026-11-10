import { fireEvent, render } from '@testing-library/react-native';
import * as ReactNative from 'react-native';

import { useSparringRoom } from '../hooks/useSparringRoom';
import {
  SparringRoomScreen,
  BASE_CANVAS,
  OPERATOR_LAYOUT,
  DISPLAY_LAYOUT,
  computeSparringLayout,
} from './SparringRoomScreen.web';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ roomCode: '1234' }),
}));

jest.mock('../hooks/useSparringRoom');

jest.mock('@/shared/ui/ThemedText', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    ThemedText: ({ children, ...props }: { children?: React.ReactNode }) =>
      React.createElement(Text, props, children),
  };
});

const mockedUseSparringRoom = jest.mocked(useSparringRoom);

describe('SparringRoomScreen web operator controls', () => {
  const send = jest.fn();

  beforeEach(() => {
    send.mockReset();
    jest.restoreAllMocks();
    mockedUseSparringRoom.mockReturnValue({
      snapshot: {
        roomCode: '1234',
        redName: 'RED',
        blueName: 'BLUE',
        round: 1,
        remainingSeconds: 120,
        redScore: 0,
        blueScore: 0,
        redPenalties: 0,
        bluePenalties: 0,
        running: false,
        ended: false,
      },
      operator: true,
      error: null,
      connecting: false,
      send,
    });
  });

  it('updates competitor names on submit and blur', async () => {
    const screen = await render(<SparringRoomScreen />);

    await fireEvent.press(screen.getByText('RED'));
    await fireEvent.changeText(screen.getByLabelText('Tên võ sĩ đỏ'), '  Nguyen Van A  ');
    await fireEvent(screen.getByLabelText('Tên võ sĩ đỏ'), 'submitEditing');
    expect(send).toHaveBeenCalledWith({
      type: 'setCompetitorName',
      side: 'red',
      name: 'Nguyen Van A',
    });

    await fireEvent.press(screen.getByText('BLUE'));
    await fireEvent.changeText(screen.getByLabelText('Tên võ sĩ xanh'), 'Tran Van B');
    await fireEvent(screen.getByLabelText('Tên võ sĩ xanh'), 'blur');
    expect(send).toHaveBeenCalledWith({
      type: 'setCompetitorName',
      side: 'blue',
      name: 'Tran Van B',
    });
  });

  it('uses independent editable steps for time, points, and penalties', async () => {
    const screen = await render(<SparringRoomScreen />);

    await fireEvent.changeText(screen.getByLabelText('Bước điều chỉnh thời gian'), '99');
    await fireEvent(screen.getByLabelText('Bước điều chỉnh thời gian'), 'blur');
    await fireEvent.press(screen.getByLabelText('Tăng thời gian'));

    await fireEvent.changeText(screen.getByLabelText('Bước điều chỉnh điểm đỏ'), '7');
    await fireEvent.press(screen.getByLabelText('Tăng điểm đỏ'));
    await fireEvent.press(screen.getByLabelText('Tăng điểm xanh'));

    await fireEvent.changeText(screen.getByLabelText('Bước điều chỉnh điểm phạt xanh'), '12');
    await fireEvent.press(screen.getByLabelText('Giảm điểm phạt xanh'));

    expect(send).toHaveBeenCalledWith({ type: 'setDuration', seconds: 180 });
    expect(send).toHaveBeenCalledWith({
      type: 'operatorAdjustScore',
      side: 'red',
      delta: 7,
    });
    expect(send).toHaveBeenCalledWith({
      type: 'operatorAdjustScore',
      side: 'blue',
      delta: 1,
    });
    expect(send).toHaveBeenCalledWith({
      type: 'operatorAdjustPenalty',
      side: 'blue',
      delta: -12,
    });
  });

  it('Operator displays controller, inputs, and editable competitor names', async () => {
    const screen = await render(<SparringRoomScreen />);

    expect(screen.getByTestId('sparring-header')).toBeTruthy();
    expect(screen.getByTestId('middle-controller')).toBeTruthy();
    expect(screen.getByLabelText('Bước điều chỉnh thời gian')).toBeTruthy();
    expect(screen.getByLabelText('Bước điều chỉnh điểm đỏ')).toBeTruthy();
    expect(screen.getByLabelText('Bước điều chỉnh điểm xanh')).toBeTruthy();

    await fireEvent.press(screen.getByText('RED'));
    expect(screen.getByLabelText('Tên võ sĩ đỏ')).toBeTruthy();
  });

  it('Display hides controller/header, and competitor names are read-only', async () => {
    const screen = await render(<SparringRoomScreen />);

    // Click toggle to switch to display mode
    await fireEvent.press(screen.getByTestId('view-toggle-btn'));

    // Header and controller must be hidden in Display mode
    expect(screen.queryByTestId('sparring-header')).toBeNull();
    expect(screen.queryByTestId('middle-controller')).toBeNull();

    // Competitor names are read-only in Display mode
    await fireEvent.press(screen.getByText('RED'));
    expect(screen.queryByLabelText('Tên võ sĩ đỏ')).toBeNull();
  });

  it('Switching status preserves points, penalties, names, and time without data loss', async () => {
    mockedUseSparringRoom.mockReturnValue({
      snapshot: {
        roomCode: '1234',
        redName: 'VO SI RED',
        blueName: 'VO SI BLUE',
        round: 2,
        remainingSeconds: 75,
        redScore: 18,
        blueScore: 12,
        redPenalties: 3,
        bluePenalties: 4,
        running: true,
        ended: false,
      },
      operator: true,
      error: null,
      connecting: false,
      send,
    });

    const screen = await render(<SparringRoomScreen />);

    // In Operator mode
    expect(screen.getByText('VO SI RED')).toBeTruthy();
    expect(screen.getByText('VO SI BLUE')).toBeTruthy();
    expect(screen.getByText('1:15')).toBeTruthy();
    expect(screen.getByText('ROUND 2')).toBeTruthy();

    // Switch to Display mode
    await fireEvent.press(screen.getByTestId('view-toggle-btn'));

    // In Display mode: state is preserved
    expect(screen.getByText('VO SI RED')).toBeTruthy();
    expect(screen.getByText('VO SI BLUE')).toBeTruthy();
    expect(screen.getByText('18')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.getByText('1:15')).toBeTruthy();
    expect(screen.getByText('ROUND 2')).toBeTruthy();

    // Switch back to Operator mode
    await fireEvent.press(screen.getByTestId('view-toggle-btn'));

    // In Operator mode again: state still intact
    expect(screen.getByText('VO SI RED')).toBeTruthy();
    expect(screen.getByText('VO SI BLUE')).toBeTruthy();
    expect(screen.getByText('18')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('1:15')).toBeTruthy();
  });

  it('Mocks 1920x1080 to verify exact standard layout dimensions', async () => {
    const screen = await render(
      <SparringRoomScreen windowDimensions={{ width: 1920, height: 1080 }} />
    );

    // In Operator mode at 1920x1080
    const timerBox = screen.getByTestId('timer-box');
    const timerStyle = ReactNative.StyleSheet.flatten(timerBox.props.style);
    expect(timerStyle.width).toBeCloseTo(OPERATOR_LAYOUT.timerWidth, 1);
    expect(timerStyle.height).toBeCloseTo(OPERATOR_LAYOUT.timerHeight, 1);
    expect(timerStyle.borderRadius).toBeCloseTo(OPERATOR_LAYOUT.timerBorderRadius, 1);

    const redCard = screen.getByTestId('red-card');
    const redCardStyle = ReactNative.StyleSheet.flatten(redCard.props.style);
    expect(redCardStyle.width).toBeCloseTo(OPERATOR_LAYOUT.cardWidth, 1);
    expect(redCardStyle.height).toBeCloseTo(OPERATOR_LAYOUT.cardHeight, 1);
    expect(redCardStyle.borderRadius).toBeCloseTo(OPERATOR_LAYOUT.cardBorderRadius, 1);

    const redPenaltyBar = screen.getByTestId('red-penalty-bar');
    const redPenaltyStyle = ReactNative.StyleSheet.flatten(redPenaltyBar.props.style);
    expect(redPenaltyStyle.width).toBeCloseTo(OPERATOR_LAYOUT.penaltyBarWidth, 1);
    expect(redPenaltyStyle.height).toBeCloseTo(OPERATOR_LAYOUT.penaltyBarHeight, 1);

    const controller = screen.getByTestId('middle-controller');
    const controllerStyle = ReactNative.StyleSheet.flatten(controller.props.style);
    expect(controllerStyle.width).toBeCloseTo(OPERATOR_LAYOUT.controllerWidth, 1);

    // Switch to Display mode
    await fireEvent.press(screen.getByTestId('view-toggle-btn'));

    const displayRedCard = screen.getByTestId('red-card');
    const displayRedCardStyle = ReactNative.StyleSheet.flatten(displayRedCard.props.style);
    expect(displayRedCardStyle.width).toBeCloseTo(DISPLAY_LAYOUT.cardWidth, 1);
    expect(displayRedCardStyle.height).toBeCloseTo(DISPLAY_LAYOUT.cardHeight, 1);

    const displayPenaltyBar = screen.getByTestId('red-penalty-bar');
    const displayPenaltyStyle = ReactNative.StyleSheet.flatten(displayPenaltyBar.props.style);
    expect(displayPenaltyStyle.width).toBeCloseTo(DISPLAY_LAYOUT.penaltyBarWidth, 1);
    expect(displayPenaltyStyle.height).toBeCloseTo(DISPLAY_LAYOUT.penaltyBarHeight, 1);
  });

  it('Mocks 1366x768 and 2560x1440 to verify scale calculations without overflow', () => {
    // 1366 x 768
    const layout768Op = computeSparringLayout(1366, 768, 'operator');
    const expectedScale768 = Math.min(1366 / BASE_CANVAS.width, 768 / BASE_CANVAS.height);
    expect(layout768Op.scale).toBeCloseTo(expectedScale768, 4);

    const scaledWidth768 = BASE_CANVAS.width * layout768Op.scale;
    const scaledHeight768 = BASE_CANVAS.height * layout768Op.scale;
    expect(scaledWidth768).toBeLessThanOrEqual(1366);
    expect(scaledHeight768).toBeLessThanOrEqual(768);

    const layout768Disp = computeSparringLayout(1366, 768, 'display');
    expect(layout768Disp.scale).toBeCloseTo(expectedScale768, 4);
    expect(DISPLAY_LAYOUT.cardWidth * layout768Disp.scale * 2).toBeLessThanOrEqual(1366);

    // 2560 x 1440
    const layout1440Op = computeSparringLayout(2560, 1440, 'operator');
    const expectedScale1440 = Math.min(2560 / BASE_CANVAS.width, 1440 / BASE_CANVAS.height);
    expect(layout1440Op.scale).toBeCloseTo(expectedScale1440, 4);

    const scaledWidth1440 = BASE_CANVAS.width * layout1440Op.scale;
    const scaledHeight1440 = BASE_CANVAS.height * layout1440Op.scale;
    expect(scaledWidth1440).toBeLessThanOrEqual(2560);
    expect(scaledHeight1440).toBeLessThanOrEqual(1440);

    const layout1440Disp = computeSparringLayout(2560, 1440, 'display');
    expect(layout1440Disp.scale).toBeCloseTo(expectedScale1440, 4);
    expect(DISPLAY_LAYOUT.cardWidth * layout1440Disp.scale * 2).toBeLessThanOrEqual(2560);
  });
});
