import { overlayTargetKeypoints } from "./PoseOverlay.web";

describe("overlayTargetKeypoints", () => {
  it("draws knees in knee mode and ankles in ankle mode", () => {
    expect(overlayTargetKeypoints("knee")).toEqual([11, 12, 13, 14]);
    expect(overlayTargetKeypoints("ankle")).toEqual([11, 12, 13, 14, 15, 16]);
  });
});
