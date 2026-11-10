import { roleCodesForUser } from "./userViewModel";

describe("userViewModel", () => {
  it("resolves role codes for a user", () => {
    expect(roleCodesForUser("u1", [{ userId: "u1", roleCode: "ADMIN" }])).toEqual([
      "ADMIN",
    ]);
  });
});
