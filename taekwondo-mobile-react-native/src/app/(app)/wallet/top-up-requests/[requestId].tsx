import { useLocalSearchParams } from 'expo-router';

import { TopUpRequestReviewDetailScreen } from '@/features/wallet';

export default function TopUpRequestReviewDetailRoute() {
  const { requestId } = useLocalSearchParams<{ requestId?: string }>();
  return <TopUpRequestReviewDetailScreen requestId={requestId} />;
}

