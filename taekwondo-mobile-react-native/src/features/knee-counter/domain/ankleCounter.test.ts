import { advanceAnkle, ankleSignal, initialAnkleLegState } from "./ankleCounter";
import type { NormalizedPose } from "../types/kneeCounter.types";

function pose(ankleY: number, kneeY = .7): NormalizedPose {
  const keypoints = Array.from({ length: 17 }, () => ({ x: .5, y: .5, score: .9 }));
  keypoints[5] = { x: .45, y: .3, score: .9 }; keypoints[6] = { x: .55, y: .3, score: .9 };
  keypoints[11] = { x: .45, y: .5, score: .9 }; keypoints[12] = { x: .55, y: .5, score: .9 };
  keypoints[13] = { x: .45, y: kneeY, score: .9 }; keypoints[14] = { x: .55, y: kneeY, score: .9 };
  keypoints[15] = { x: .45, y: ankleY, score: .9 }; keypoints[16] = { x: .55, y: ankleY, score: .9 };
  return { detectorTrackId: "one", poseScore: .9, detectedAtMs: 0, boundingBox: null, keypoints };
}

describe("dedicated ankle state machine", () => {
  it("calibrates then requires a complete return-and-hold cycle", () => {
    let state = initialAnkleLegState(); let previous = null;
    for (let i = 0; i < 5; i++) { const current = pose(.82); const signal = ankleSignal(current, "left", i * 80, previous); const result = advanceAnkle(state, { signal, pose: current, timestampMs: i * 80 }, true); state = result.state; previous = { signal, pose: current, timestampMs: i * 80 }; }
    expect(state.guide).not.toBeNull(); expect(state.phase).toBe("READY");
    for (const [time, y, kneeY] of [[400, .55, .64], [480, .46, .56], [560, .64, .64], [640, .80, .72], [860, .80, .72]] as const) { const current = pose(y, kneeY); const signal = ankleSignal(current, "left", time, previous); const result = advanceAnkle(state, { signal, pose: current, timestampMs: time }, true); state = result.state; previous = { signal, pose: current, timestampMs: time }; }
    expect(state.reps).toBe(1); expect(state.phase).toBe("READY");
  });

  it("does not enter an ankle cycle when the ankle confidence is weak", () => {
    let state = initialAnkleLegState(); const weak = pose(.4); weak.keypoints[15].score = .1;
    const signal = ankleSignal(weak, "left", 0, null); state = advanceAnkle(state, { signal, pose: weak, timestampMs: 0 }, true).state;
    expect(state.guide).toBeNull(); expect(state.reps).toBe(0);
  });
});
