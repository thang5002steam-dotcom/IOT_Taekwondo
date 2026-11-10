import { containsSearch } from "./string";

describe("string utilities", () => {
  it("filters Vietnamese records case-insensitively", () => {
    expect(containsSearch("quản", "Quản trị viên")).toBe(true);
    expect(containsSearch("coach", "Quản trị viên")).toBe(false);
  });
});
