import { getTrainingPlanPurchaseErrorMessage } from "./trainingPlanPurchaseErrors";

describe("training plan purchase error messages", () => {
  it("explains schedule conflicts and insufficient balance", () => {
    expect(
      getTrainingPlanPurchaseErrorMessage("TRAINING_PLAN_SCHEDULE_CONFLICT"),
    ).toContain("trùng giờ");
    expect(
      getTrainingPlanPurchaseErrorMessage("INSUFFICIENT_BALANCE"),
    ).toContain("Số dư ví không đủ");
  });

  it("returns null for an unrelated error code", () => {
    expect(getTrainingPlanPurchaseErrorMessage("UNKNOWN")).toBeNull();
    expect(getTrainingPlanPurchaseErrorMessage(null)).toBeNull();
  });
});
