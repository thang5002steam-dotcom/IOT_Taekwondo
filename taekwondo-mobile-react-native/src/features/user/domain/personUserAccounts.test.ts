import type { UserPersonSimpleResponse } from "@/features/person/api/user-person.dto";
import { groupPersonUserAccounts } from "./personUserAccounts";

function link({
  userId,
  relationshipType,
  active,
}: {
  userId: string;
  relationshipType: "OWNER" | "GUARDIAN" | "MANAGER";
  active: boolean;
}) {
  return {
    userPersonId: `${userId}-${relationshipType}`,
    user: {
      userId,
      phoneNumber: `090${userId}`,
      status: "ACTIVE",
      lastLoginAt: null,
      persons: [],
    },
    person: {
      personId: "person-1",
      fullName: "Nguyễn Văn A",
      personCode: "HV001",
      gender: true,
      birthDate: "2010-01-01",
      currentBelt: "WHITE",
      status: "ACTIVE",
      faceImagePath: null,
      position: null,
    },
    relationshipType,
    active,
  } as UserPersonSimpleResponse;
}

describe("groupPersonUserAccounts", () => {
  it("groups links for the same user and preserves active-link state", () => {
    expect(
      groupPersonUserAccounts([
        link({ userId: "user-1", relationshipType: "OWNER", active: false }),
        link({ userId: "user-1", relationshipType: "GUARDIAN", active: true }),
        link({ userId: "user-2", relationshipType: "MANAGER", active: false }),
      ]),
    ).toEqual([
      expect.objectContaining({
        user: expect.objectContaining({ userId: "user-1" }),
        relationshipTypes: ["OWNER", "GUARDIAN"],
        hasActiveLink: true,
      }),
      expect.objectContaining({
        user: expect.objectContaining({ userId: "user-2" }),
        relationshipTypes: ["MANAGER"],
        hasActiveLink: false,
      }),
    ]);
  });
});
