import { groupPermissions } from "./permissionViewModel";

describe("permissionViewModel", () => {
  it("groups permissions by model", () => {
    const permissions = [
      { permissionId: 1, code: "USER_READ", model: "USER", action: "READ" as const },
      { permissionId: 2, code: "ROLE_READ", model: "ROLE", action: "READ" as const },
    ];

    expect(Object.keys(groupPermissions(permissions))).toEqual(["USER", "ROLE"]);
  });
});
