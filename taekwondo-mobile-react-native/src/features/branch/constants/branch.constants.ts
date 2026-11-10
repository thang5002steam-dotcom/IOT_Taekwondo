export type BranchStatus = 'OPERATING' | 'CLOSED' | 'MAINTENANCE';

export const BranchStatusValues = ['OPERATING', 'CLOSED', 'MAINTENANCE'] as const satisfies readonly BranchStatus[];

export const BranchStatusLabel: Record<BranchStatus, string> = {
  OPERATING: 'Đang hoạt động',
  CLOSED: 'Đã đóng cửa',
  MAINTENANCE: 'Đang bảo trì',
};
