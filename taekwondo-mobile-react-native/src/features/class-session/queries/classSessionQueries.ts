import { useQuery } from "@tanstack/react-query";

import { classSessionApi } from "../api/classSessionApi";

export const classSessionKeys = {
  all: ["class-sessions"] as const,
  detail: (classSessionId?: string) =>
    [...classSessionKeys.all, "detail", classSessionId ?? ""] as const,
};

export function useClassSessionDetail(classSessionId?: string) {
  return useQuery({
    queryKey: classSessionKeys.detail(classSessionId),
    queryFn: () => classSessionApi.get(classSessionId as string),
    enabled: Boolean(classSessionId),
  });
}
