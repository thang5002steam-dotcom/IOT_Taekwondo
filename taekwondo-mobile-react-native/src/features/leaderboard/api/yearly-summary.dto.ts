import type { AttendanceStats } from '@/features/session-attendance/api/attendance-stats.dto';
import type { ExamEligibility } from '../constants/leaderboard.constants';

export interface QuarterSummary {
  quarterNumber: number;
  attendanceStats: AttendanceStats;
  attendanceScore: number;
  performanceScore: number;
  totalQuarterScore: number;
  eligibility: ExamEligibility;
}

export interface YearlySummaryResponse {
  year: number;
  quarters: QuarterSummary[];
}
