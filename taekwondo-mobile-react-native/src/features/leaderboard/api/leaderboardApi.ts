import { javaApi } from '@/infrastructure/http/httpClient';

import type { FitnessMetrics } from '@/features/fitness/api/fitness-record.dto';
import type {
  FitnessLeaderboardParams,
  LeaderboardResponse,
  QuarterLeaderboardParams,
} from './leaderboard.dto';
import type { QuarterSummary } from './yearly-summary.dto';

export const leaderboardApi = {
  async getFitnessQuarter(params: FitnessLeaderboardParams): Promise<LeaderboardResponse<FitnessMetrics>> {
    const response = await javaApi.get<LeaderboardResponse<FitnessMetrics>>('/leaderboards/quarter/fitness', { params });
    return response.data;
  },
  async getQuarter(params: QuarterLeaderboardParams): Promise<LeaderboardResponse<QuarterSummary>> {
    const response = await javaApi.get<LeaderboardResponse<QuarterSummary>>('/leaderboards/quarter', { params });
    return response.data;
  },
};
