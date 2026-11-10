import {
  SessionTypeLabel,
  SessionTypeValues,
} from "./training-plan.constants";

describe("training-plan constants", () => {
  it("exposes every backend SessionType with its Vietnamese label", () => {
    expect(SessionTypeValues).toEqual(["REQUIRED", "STANDARD"]);
    expect(SessionTypeLabel).toEqual({
      REQUIRED: "Buổi tập bắt buộc",
      STANDARD: "Buổi tập tiêu chuẩn",
    });
  });
});
