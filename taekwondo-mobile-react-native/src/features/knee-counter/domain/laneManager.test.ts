import { assignCandidatesToLanes, createLaneDefinitions, LaneManager, poseToCandidate } from "./laneManager";
import { DEFAULT_KNEE_COUNTER_CONFIG } from "../config/kneeCounterConfig";
import type { NormalizedPose } from "../types/kneeCounter.types";
const pose = (id: string, centerX: number): NormalizedPose => { const keypoints = Array.from({ length: 17 }, () => ({ x: centerX, y: .5, score: .9 })); keypoints[11] = { x: centerX, y: .55, score: .9 }; keypoints[12] = { x: centerX, y: .55, score: .9 }; return { detectorTrackId: id, poseScore: .9, detectedAtMs: 0, boundingBox: { xMin: centerX - .1, yMin: .2, xMax: centerX + .1, yMax: .8 }, keypoints }; };
describe("lane assignment", () => { it("keeps people in independent fixed lanes even when detector ids change", () => { const candidates = [poseToCandidate(pose("new-id", .2))!, poseToCandidate(pose("other", .7))!]; const assignments = assignCandidatesToLanes(candidates, createLaneDefinitions(2), false); expect(assignments.map((item) => item.candidate?.pose.detectorTrackId)).toEqual(["new-id", "other"]); }); });

describe("dynamic participant tracking", () => {
  const context = { sessionId: "s", sessionStartedAt: "now", backend: "webgl" as const, inputSize: 384 as const };
  it("creates only detected participants, retains a person when the detector id changes, and caps at six", () => {
    const manager = new LaneManager(DEFAULT_KNEE_COUNTER_CONFIG);
    const first = manager.update([poseToCandidate(pose("one", .2))!], 0, false, context);
    expect(first.lanes).toHaveLength(1);
    const retained = manager.update([poseToCandidate(pose("one-new", .21))!], 100, false, context);
    expect(retained.lanes).toHaveLength(1);
    const crowd = Array.from({ length: 7 }, (_, index) => poseToCandidate(pose(`p-${index}`, .05 + index * .13))!);
    expect(manager.update(crowd, 200, false, context).lanes).toHaveLength(6);
  });
  it("records raw landmarks, signal decisions, state transitions, and missing detector frames", () => {
    const manager = new LaneManager(DEFAULT_KNEE_COUNTER_CONFIG);
    manager.update([poseToCandidate(pose("one", .5))!], 0, true, context);
    const detected = manager.getTrace().at(-1)!;
    expect(detected.source).toBe("POSE");
    expect(detected.poseScore).toBe(.9);
    expect(detected.points.leftKnee).toEqual({ x: .5, y: .5, score: .9 });
    expect(detected.left.rawRatio).not.toBeNull();
    expect(detected.left.smoothedRatio).not.toBeNull();
    expect(detected.left.phaseBefore).toBe("NEEDS_DOWN");
    expect(detected.left.enterThreshold).toBe(DEFAULT_KNEE_COUNTER_CONFIG.thresholdPercent / 100);
    expect(detected.config.measurementLandmark).toBe("knee");
    manager.update([], 800, true, context);
    const missing = manager.getTrace().at(-1)!;
    expect(missing.source).toBe("MISSING");
    expect(missing.left.reason).toBe("MISSING_FRAME");
    expect(missing.left.phaseAfter).toBe("NEEDS_DOWN");
  });
});
