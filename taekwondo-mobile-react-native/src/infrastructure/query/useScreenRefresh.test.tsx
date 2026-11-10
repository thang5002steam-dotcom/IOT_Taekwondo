import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useScreenRefresh } from './useScreenRefresh';

describe('useScreenRefresh', () => {
  it('calls refetch on all provided query objects', async () => {
    const query1 = { refetch: jest.fn().mockResolvedValue({}) };
    const query2 = { refetch: jest.fn().mockResolvedValue({}) };

    const { result } = await renderHook(() => useScreenRefresh([query1, query2]));

    expect(result.current.refreshing).toBe(false);

    await act(async () => {
      await result.current.onRefresh();
    });

    expect(query1.refetch).toHaveBeenCalledTimes(1);
    expect(query2.refetch).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.refreshing).toBe(false));
  });

  it('calls custom async functions', async () => {
    const customFn = jest.fn().mockResolvedValue('ok');

    const { result } = await renderHook(() => useScreenRefresh(customFn));

    await act(async () => {
      await result.current.onRefresh();
    });

    expect(customFn).toHaveBeenCalledTimes(1);
  });
});
