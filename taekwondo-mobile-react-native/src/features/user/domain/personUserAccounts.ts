import type { RelationshipType } from "@/features/authentication/domain/auth.types";
import type { UserPersonSimpleResponse } from "@/features/person/api/user-person.dto";
import type { UserSimpleResponse } from "../api/user.dto";

export type PersonUserAccount = {
  user: UserSimpleResponse;
  relationshipTypes: RelationshipType[];
  hasActiveLink: boolean;
};

export function groupPersonUserAccounts(
  links: readonly UserPersonSimpleResponse[],
): PersonUserAccount[] {
  const accounts = new Map<string, PersonUserAccount>();

  for (const link of links) {
    const existing = accounts.get(link.user.userId);
    if (existing) {
      if (!existing.relationshipTypes.includes(link.relationshipType)) {
        existing.relationshipTypes.push(link.relationshipType);
      }
      existing.hasActiveLink ||= link.active;
      continue;
    }

    accounts.set(link.user.userId, {
      user: link.user,
      relationshipTypes: [link.relationshipType],
      hasActiveLink: link.active,
    });
  }

  return [...accounts.values()];
}
