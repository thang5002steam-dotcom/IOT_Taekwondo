import {
  ATTENDANCE_CONFIG,
  EVALUATION_CONFIG,
} from './StatusPickerPopover';

describe('StatusPickerPopover and configs', () => {
  it('has valid attendance status configs for all enum values', () => {
    expect(ATTENDANCE_CONFIG.PRESENT.label).toBe('Có mặt');
    expect(ATTENDANCE_CONFIG.ABSENT.label).toBe('Vắng');
    expect(ATTENDANCE_CONFIG.LATE.label).toBe('Đi muộn');
    expect(ATTENDANCE_CONFIG.EXCUSED.label).toBe('Có phép');
    expect(ATTENDANCE_CONFIG.MAKEUP.label).toBe('Học bù');
  });

  it('has valid evaluation status configs for all enum values', () => {
    expect(EVALUATION_CONFIG.GOOD.label).toBe('Tốt');
    expect(EVALUATION_CONFIG.AVERAGE.label).toBe('Trung bình');
    expect(EVALUATION_CONFIG.WEAK.label).toBe('Yếu');
    expect(EVALUATION_CONFIG.PENDING.label).toBe('Chờ đánh giá');
  });
});
