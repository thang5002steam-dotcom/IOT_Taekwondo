import { fireEvent, render, waitFor } from '@testing-library/react-native';

import LoginScreen from './LoginScreen';

const mockMutateAsync = jest.fn();

jest.mock('../hooks/useAuthentication', () => ({
  useLogin: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
    error: null,
  }),
}));

describe('LoginScreen', () => {
  beforeEach(() => mockMutateAsync.mockReset());

  it('exposes native labels and validates the web phone/password rules', async () => {
    const view = await render(<LoginScreen />);
    await fireEvent.changeText(view.getByLabelText('Số điện thoại'), '123');
    await fireEvent.changeText(view.getByLabelText('Mật khẩu'), '123');
    await fireEvent.press(view.getByRole('button', { name: 'Đăng nhập' }));

    expect(view.getByText(/Số điện thoại không hợp lệ/)).toBeTruthy();
    expect(view.getByText('Mật khẩu phải có ít nhất 6 ký tự.')).toBeTruthy();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('submits normalized credentials without browser-only fields', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    const view = await render(<LoginScreen />);
    await fireEvent.changeText(view.getByLabelText('Số điện thoại'), '0369222068');
    await fireEvent.changeText(view.getByLabelText('Mật khẩu'), 'secret1');
    await fireEvent.press(view.getByRole('button', { name: 'Đăng nhập' }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        phoneNumber: '0369222068',
        password: 'secret1',
      });
    });
  });
});
