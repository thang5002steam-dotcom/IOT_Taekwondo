import { permissionCodesForRole } from "./roleViewModel";

describe("roleViewModel", () => {
  it("resolves permission codes for a role", () => {
    expect(
      permissionCodesForRole("ADMIN", [
        { roleCode: "ADMIN", permissionId: 1, permissionCode: "USER_READ" },
      ]),
    ).toEqual(["USER_READ"]);
  });
});
