import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useActiveQueriesRefresh } from './useActiveQueriesRefresh';

function createWrapper(queryClient: QueryClient) {
  return function QueryWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useActiveQueriesRefresh', () => {
  it('refetches active queries and exposes refreshing state', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    let resolveRefetch: () => void = () => undefined;
    const refetchQueries = jest
      .spyOn(queryClient, 'refetchQueries')
      .mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveRefetch = resolve;
          }) as ReturnType<QueryClient['refetchQueries']>,
      );

    const { result } = await renderHook(() => useActiveQueriesRefresh(), {
      wrapper: createWrapper(queryClient),
    });

    let refreshPromise: Promise<void> = Promise.resolve();
    await act(async () => {
      refreshPromise = result.current.onRefresh();
    });

    expect(refetchQueries).toHaveBeenCalledWith({ type: 'active' });
    expect(result.current.refreshing).toBe(true);

    await act(async () => {
      resolveRefetch();
      await refreshPromise;
    });

    await waitFor(() => expect(result.current.refreshing).toBe(false));
    queryClient.clear();
  });
});
