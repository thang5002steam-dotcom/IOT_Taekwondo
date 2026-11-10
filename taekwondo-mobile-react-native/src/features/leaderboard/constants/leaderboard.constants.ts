export type ExamEligibility =
  | 'NOT_ELIGIBLE'
  | 'ELIGIBLE'
  | 'EXEMPT'
  | 'NONE'
  | 'PENDING';

export const ExamEligibilityLabel: Record<ExamEligibility, string> = {
  NOT_ELIGIBLE: 'Không đủ điều kiện thi thử',
  ELIGIBLE: 'Đủ điều kiện thi thử',
  EXEMPT: '⭐ Miễn thi thử',
  NONE: 'Không có thông tin',
  PENDING: 'Chưa đạt (đang tích lũy)',
};

export type ProjectionType =
  | 'LEADERBOARD_CONDUCT'
  | 'LEADERBOARD_FITNESS'
  | 'LEADERBOARD_MEMBER'
  | 'FITNESS_RECORDS_CACHE';

export const ProjectionTypeValues = [
  'LEADERBOARD_CONDUCT',
  'LEADERBOARD_FITNESS',
  'LEADERBOARD_MEMBER',
  'FITNESS_RECORDS_CACHE',
] as const satisfies readonly ProjectionType[];

export const ProjectionTypeLabel: Record<ProjectionType, string> = {
  LEADERBOARD_CONDUCT: 'Bảng xếp hạng rèn luyện',
  LEADERBOARD_FITNESS: 'Bảng xếp hạng thể lực',
  LEADERBOARD_MEMBER: 'Bảng xếp hạng thành viên',
  FITNESS_RECORDS_CACHE: 'Bộ nhớ đệm hồ sơ thể lực',
};
