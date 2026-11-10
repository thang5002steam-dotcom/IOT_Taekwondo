import type { AuthResponse } from "../api/auth.dto";
import { routeAfterAuthResponse } from "./authRouting";

const response: AuthResponse = {
  accessToken: "access",
  user: {
    userId: "user-1",
    phoneNumber: "0369222068",
    status: "ACTIVE",
    roles: ["ROLE_STUDENT"],
    permissions: [],
  },
  activeContext: null,
  availableContexts: [],
  requiresContextSelection: true,
};

describe("auth routing", () => {
  it("routes a session that requires context selection to the native context group", () => {
    expect(routeAfterAuthResponse(response)).toBe("/(context)/select");
  });

  it("routes an active context to the protected app home route", () => {
    expect(
      routeAfterAuthResponse({
        ...response,
        requiresContextSelection: false,
        activeContext: {
          userPersonId: "user-person-1",
          personId: "person-1",
          relationshipType: "OWNER",
          personCode: "HV001",
          displayName: "NGUYỄN VĂN A",
        },
      }),
    ).toBe("/(app)/(tabs)");
  });
});
