import { useCallback, useEffect, useRef, useState } from "react";

type Refetchable =
  | { refetch: () => Promise<unknown> }
  | (() => Promise<unknown>)
  | null
  | undefined;

/**
 * Screen-level hook to manage pull-to-refresh for specific queries.
 * Isolates refetch operations to the active screen without triggering global/unrelated queries.
 */
export function useScreenRefresh(targets?: Refetchable | Refetchable[]): {
  refreshing: boolean;
  onRefresh: () => Promise<void>;
} {
  const [refreshing, setRefreshing] = useState(false);
  const targetsRef = useRef(targets);

  useEffect(() => {
    targetsRef.current = targets;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const currentTargets = targetsRef.current;
      if (!currentTargets) return;
      const items = Array.isArray(currentTargets)
        ? currentTargets
        : [currentTargets];

      await Promise.all(
        items.map((item) => {
          if (typeof item === "function") {
            return item();
          }
          if (item && typeof item.refetch === "function") {
            return item.refetch();
          }
          return Promise.resolve();
        }),
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  return { refreshing, onRefresh };
}
