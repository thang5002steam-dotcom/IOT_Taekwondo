import { useQuery } from "@tanstack/react-query";

import { walletApi } from "../api/walletApi";

export const walletKeys = {
  all: ["wallet"] as const,
  byPerson: (personId?: string) =>
    [...walletKeys.all, "person", personId ?? ""] as const,
};

export function useWalletByPerson(personId?: string) {
  return useQuery({
    queryKey: walletKeys.byPerson(personId),
    queryFn: () => walletApi.getByPerson(personId!),
    enabled: Boolean(personId),
    staleTime: 30_000,
  });
}

