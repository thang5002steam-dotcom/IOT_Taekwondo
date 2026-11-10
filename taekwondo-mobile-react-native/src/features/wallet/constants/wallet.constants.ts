export type WalletStatus = 'ACTIVE' | 'FROZEN' | 'CLOSED';
export type WalletTransactionDirection = 'CREDIT' | 'DEBIT';
export type WalletTransactionStatus = 'PENDING' | 'PROCESSING' | 'APPROVED' | 'REJECTED';
export type WalletTransactionType =
  | 'TOP_UP'
  | 'TRAINING_PLAN_PURCHASE'
  | 'TRAINING_ADDON_PURCHASE'
  | 'SUPPLY_PURCHASE'
  | 'REFUND'
  | 'MANUAL_ADJUSTMENT';

export const WalletStatusValues = ['ACTIVE', 'FROZEN', 'CLOSED'] as const satisfies readonly WalletStatus[];
export const WalletTransactionDirectionValues = ['CREDIT', 'DEBIT'] as const satisfies readonly WalletTransactionDirection[];
export const WalletTransactionStatusValues = ['PENDING', 'PROCESSING', 'APPROVED', 'REJECTED'] as const satisfies readonly WalletTransactionStatus[];
export const WalletTransactionTypeValues = [
  'TOP_UP',
  'TRAINING_PLAN_PURCHASE',
  'TRAINING_ADDON_PURCHASE',
  'SUPPLY_PURCHASE',
  'REFUND',
  'MANUAL_ADJUSTMENT',
] as const satisfies readonly WalletTransactionType[];

export const WalletStatusLabel: Record<WalletStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  FROZEN: 'Đóng băng',
  CLOSED: 'Đã đóng',
};

export const WalletTransactionDirectionLabel: Record<WalletTransactionDirection, string> = {
  CREDIT: 'Ghi có',
  DEBIT: 'Ghi nợ',
};

export const WalletTransactionStatusLabel: Record<WalletTransactionStatus, string> = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang xử lý',
  APPROVED: 'Đã phê duyệt',
  REJECTED: 'Bị từ chối',
};

export const WalletTransactionTypeLabel: Record<WalletTransactionType, string> = {
  TOP_UP: 'Nạp tiền',
  TRAINING_PLAN_PURCHASE: 'Mua gói tập',
  TRAINING_ADDON_PURCHASE: 'Mua tiện ích bổ sung',
  SUPPLY_PURCHASE: 'Mua vật tư',
  REFUND: 'Hoàn tiền',
  MANUAL_ADJUSTMENT: 'Điều chỉnh thủ công',
};
