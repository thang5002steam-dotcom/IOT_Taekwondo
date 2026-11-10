import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

export function useActiveQueriesRefresh(): {
  refreshing: boolean;
  onRefresh: () => Promise<void>;
} {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries({ type: 'active' });
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  return { refreshing, onRefresh };
}
