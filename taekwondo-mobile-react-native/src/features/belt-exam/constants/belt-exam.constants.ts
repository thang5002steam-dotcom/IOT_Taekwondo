export type BeltExamResult = 'PASSED' | 'FAILED' | 'ABSENT' | 'PENDING';
export type BeltExamType = 'PROMOTION' | 'MOCK';

export const BeltExamResultValues = ['PASSED', 'FAILED', 'ABSENT', 'PENDING'] as const satisfies readonly BeltExamResult[];
export const BeltExamTypeValues = ['PROMOTION', 'MOCK'] as const satisfies readonly BeltExamType[];

export const BeltExamResultLabel: Record<BeltExamResult, string> = {
  PASSED: 'Đạt',
  FAILED: 'Không đạt',
  ABSENT: 'Vắng mặt',
  PENDING: 'Chưa chấm điểm',
};

export const BeltExamTypeLabel: Record<BeltExamType, string> = {
  PROMOTION: 'Thi lên cấp',
  MOCK: 'Thi thử',
};
