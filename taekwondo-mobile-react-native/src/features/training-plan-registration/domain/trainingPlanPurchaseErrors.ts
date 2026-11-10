const trainingPlanPurchaseMessages: Readonly<Record<string, string>> = {
  TRAINING_PLAN_SCHEDULE_CONFLICT:
    "Các ca đã chọn bị trùng giờ. Vui lòng chọn ca khác.",
  TRAINING_PLAN_REQUIREMENT_NOT_MET:
    "Lịch đã chọn bị trùng giờ hoặc chưa đáp ứng yêu cầu của gói. Vui lòng kiểm tra lại từng loại buổi tập.",
  INSUFFICIENT_BALANCE:
    "Số dư ví không đủ để thanh toán gói học. Vui lòng nạp thêm tiền rồi thử lại.",
  WALLET_NOT_FOUND:
    "Học viên chưa có ví điện tử. Vui lòng liên hệ quản trị viên.",
  WALLET_NOT_ACTIVE:
    "Ví điện tử của học viên hiện không hoạt động. Vui lòng liên hệ quản trị viên.",
  COURSE_SCHEDULE_NOT_FOUND:
    "Một ca đã chọn không còn tồn tại. Vui lòng tải lại và chọn lịch khác.",
  TRAINING_PLAN_NOT_FOUND:
    "Gói học không còn khả dụng. Vui lòng chọn gói khác.",
  TRAINING_PLAN_INACTIVE:
    "Gói học đã ngừng áp dụng. Vui lòng chọn gói khác.",
};

export function getTrainingPlanPurchaseErrorMessage(
  code: string | null,
): string | null {
  return code ? trainingPlanPurchaseMessages[code] ?? null : null;
}
