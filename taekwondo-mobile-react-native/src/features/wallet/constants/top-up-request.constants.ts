import type { WalletTopUpRequestStatus } from '../api/wallet-top-up-request.dto';

export const WalletTopUpRequestStatusLabel: Record<WalletTopUpRequestStatus, string> = {
  DRAFT: 'Bản nháp',
  PENDING: 'Chờ đối soát',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
};

