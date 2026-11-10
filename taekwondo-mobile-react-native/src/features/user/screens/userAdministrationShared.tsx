import { useLocalSearchParams, useRouter, type Href } from "expo-router";

import type { RelationshipType } from "@/features/authentication/domain/auth.types";
import type { UserStatus } from "@/features/user/constants/user.constants";

export const userStatuses = [
  "ACTIVE",
  "PENDING",
  "DEACTIVATED",
  "BANNED",
] as const satisfies readonly UserStatus[];

export const userRelationships = [
  "OWNER",
  "GUARDIAN",
  "MANAGER",
] as const satisfies readonly RelationshipType[];

export function useUserId() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  return Array.isArray(userId) ? userId[0] : userId;
}

export function navigate(router: ReturnType<typeof useRouter>, path: string) {
  router.push(path as Href);
}
