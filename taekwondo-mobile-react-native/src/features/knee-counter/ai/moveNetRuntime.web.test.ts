import { normalizeBoundingBox } from "./moveNetRuntime.web";

describe("normalizeBoundingBox", () => {
  it("preserves MoveNet boxes that are already normalized", () => {
    expect(normalizeBoundingBox({ xMin: .1, yMin: .2, xMax: .8, yMax: .9 }, 1280, 720)).toEqual({ xMin: .1, yMin: .2, xMax: .8, yMax: .9 });
  });

  it("normalizes pixel boxes and clamps them to the visible image", () => {
    expect(normalizeBoundingBox({ xMin: -10, yMin: 72, xMax: 640, yMax: 900 }, 1280, 720)).toEqual({ xMin: 0, yMin: .1, xMax: .5, yMax: 1 });
  });
});
