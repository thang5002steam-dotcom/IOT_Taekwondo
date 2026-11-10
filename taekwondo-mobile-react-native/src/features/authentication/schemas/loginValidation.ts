export const PHONE_REGEX = /^0\d{9,10}$/;

export type LoginValidationErrors = {
  phoneNumber?: string;
  password?: string;
};

export function validateLoginInput(
  phoneNumber: string,
  password: string,
): LoginValidationErrors {
  const errors: LoginValidationErrors = {};
  if (!PHONE_REGEX.test(phoneNumber.trim())) {
    errors.phoneNumber =
      'Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số và bắt đầu bằng số 0.';
  }
  if (password.length < 6) {
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
  }
  return errors;
}
