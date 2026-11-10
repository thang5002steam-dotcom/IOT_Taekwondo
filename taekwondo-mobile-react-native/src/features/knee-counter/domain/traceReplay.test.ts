import { LaneManager, type PoseCandidate } from "./laneManager";
import { DEFAULT_KNEE_COUNTER_CONFIG } from "../config/kneeCounterConfig";
import type { NormalizedPose } from "../types/kneeCounter.types";

describe("real user trace replay", () => {
  const context = {
    sessionId: "test-session",
    sessionStartedAt: "2026-10-21T00:00:00.000Z",
    backend: "webgl" as const,
    inputSize: 448 as const,
  };

  const createPose = (
    timestampMs: number,
    leftKnee: { x: number; y: number; score: number },
    rightKnee: { x: number; y: number; score: number },
    leftHip = { x: 0.50, y: 0.45, score: 0.85 },
    rightHip = { x: 0.42, y: 0.47, score: 0.85 },
    leftShoulder = { x: 0.51, y: 0.15, score: 0.80 },
    rightShoulder = { x: 0.38, y: 0.16, score: 0.85 },
  ): PoseCandidate => {
    const keypoints = Array.from({ length: 17 }, () => ({ x: 0.5, y: 0.5, score: 0.8 }));
    keypoints[5] = leftShoulder;
    keypoints[6] = rightShoulder;
    keypoints[11] = leftHip;
    keypoints[12] = rightHip;
    keypoints[13] = leftKnee;
    keypoints[14] = rightKnee;
    keypoints[15] = { x: leftKnee.x, y: leftKnee.y + 0.25, score: 0.7 };
    keypoints[16] = { x: rightKnee.x, y: rightKnee.y + 0.25, score: 0.7 };

    const pose: NormalizedPose = {
      detectorTrackId: "2",
      poseScore: 0.7,
      detectedAtMs: timestampMs,
      boundingBox: { xMin: 0.35, yMin: 0.05, xMax: 0.6, yMax: 0.95 },
      keypoints,
    };
    return { pose, centerX: (leftHip.x + rightHip.x) / 2, centerY: (leftHip.y + rightHip.y) / 2 };
  };

  it("correctly counts left knee lift even when MoveNet score drops to 0.04 at peak", () => {
    const manager = new LaneManager(DEFAULT_KNEE_COUNTER_CONFIG);

    // Initial standing frame (both knees down)
    manager.update([createPose(45677, { x: 0.5, y: 0.72, score: 0.85 }, { x: 0.43, y: 0.72, score: 0.80 })], 45677, true, context);
    manager.update([createPose(45743, { x: 0.5, y: 0.72, score: 0.85 }, { x: 0.43, y: 0.72, score: 0.80 })], 45743, true, context);

    // Left knee lifts up towards hip level
    manager.update([createPose(45859, { x: 0.51, y: 0.67, score: 0.70 }, { x: 0.43, y: 0.72, score: 0.80 })], 45859, true, context);
    manager.update([createPose(45919, { x: 0.52, y: 0.60, score: 0.38 }, { x: 0.43, y: 0.71, score: 0.80 })], 45919, true, context);
    manager.update([createPose(45986, { x: 0.52, y: 0.53, score: 0.19 }, { x: 0.43, y: 0.71, score: 0.70 })], 45986, true, context);

    // Peak frames where MoveNet confidence falls to 0.04 - 0.05
    manager.update([createPose(46029, { x: 0.51, y: 0.50, score: 0.05 }, { x: 0.43, y: 0.72, score: 0.50 })], 46029, true, context);
    manager.update([createPose(46162, { x: 0.51, y: 0.49, score: 0.04 }, { x: 0.43, y: 0.72, score: 0.50 })], 46162, true, context);
    manager.update([createPose(46205, { x: 0.51, y: 0.48, score: 0.04 }, { x: 0.43, y: 0.72, score: 0.50 })], 46205, true, context);

    // Left knee descends back down
    manager.update([createPose(46338, { x: 0.53, y: 0.55, score: 0.22 }, { x: 0.43, y: 0.70, score: 0.75 })], 46338, true, context);
    manager.update([createPose(46399, { x: 0.53, y: 0.63, score: 0.51 }, { x: 0.43, y: 0.70, score: 0.83 })], 46399, true, context);
    const finalResult = manager.update([createPose(46514, { x: 0.51, y: 0.72, score: 0.75 }, { x: 0.43, y: 0.73, score: 0.80 })], 46514, true, context);

    const slot = finalResult.lanes[0];
    expect(slot).toBeDefined();
    expect(slot.leftReps).toBe(1);
  });

  it("retains full session trace past 10 seconds without dropping old samples", () => {
    const manager = new LaneManager(DEFAULT_KNEE_COUNTER_CONFIG);

    // Frame at t = 0
    manager.update([createPose(0, { x: 0.5, y: 0.72, score: 0.8 }, { x: 0.43, y: 0.72, score: 0.8 })], 0, true, context);
    // Frame at t = 15,000 (15 seconds later)
    manager.update([createPose(15000, { x: 0.5, y: 0.72, score: 0.8 }, { x: 0.43, y: 0.72, score: 0.8 })], 15000, true, context);

    const trace = manager.getTrace();
    expect(trace).toHaveLength(2);
    expect(trace[0].timestampMs).toBe(0);
    expect(trace[1].timestampMs).toBe(15000);
  });

  it("detects fast high-speed 1-frame peak without median clipping", () => {
    const manager = new LaneManager(DEFAULT_KNEE_COUNTER_CONFIG);

    // Initial standing frame (ratio = -0.72)
    manager.update([createPose(0, { x: 0.5, y: 0.72, score: 0.85 }, { x: 0.43, y: 0.72, score: 0.80 })], 0, true, context);
    manager.update([createPose(60, { x: 0.5, y: 0.72, score: 0.85 }, { x: 0.43, y: 0.72, score: 0.80 })], 60, true, context);

    // Fast 1-frame knee tuck at t = 120ms (only 1 frame reaching ratio ~ -0.10)
    // Left hip is at y = 0.45, torso = 0.30 -> y = 0.48 gives ratio (0.45 - 0.48) / 0.30 = -0.10 (>= -0.20)
    const peakResult = manager.update([createPose(120, { x: 0.5, y: 0.48, score: 0.60 }, { x: 0.43, y: 0.72, score: 0.80 })], 120, true, context);
    expect(peakResult.lanes[0].leftReps).toBe(1);

    // Next frame at t = 180ms: leg immediately drops back down (ratio = -0.70)
    const downResult = manager.update([createPose(180, { x: 0.5, y: 0.71, score: 0.85 }, { x: 0.43, y: 0.72, score: 0.80 })], 180, true, context);
    expect(downResult.lanes[0].leftPhase).toBe("READY");
    expect(downResult.lanes[0].leftReps).toBe(1);
  });

  it("recovers one short missed peak only after a supported rise then fall", () => {
    const manager = new LaneManager(DEFAULT_KNEE_COUNTER_CONFIG);
    manager.update([createPose(0, { x: .5, y: .72, score: .9 }, { x: .43, y: .72, score: .9 })], 0, true, context);
    manager.update([createPose(10, { x: .5, y: .72, score: .9 }, { x: .43, y: .72, score: .9 })], 10, true, context);

    // The actual peak falls between samples. The preceding sample is close to
    // the threshold but below it, so the normal state machine must not count.
    manager.update([createPose(20, { x: .5, y: .5565, score: .10 }, { x: .43, y: .5565, score: .9 })], 20, true, context);
    const result = manager.update([createPose(30, { x: .5, y: .65, score: .10 }, { x: .43, y: .756, score: .9 })], 30, true, context);

    expect(result.trace.at(-1)?.left.recovery?.reason).toBe("TRAJECTORY");
    expect(result.events).toHaveLength(1);
    expect(result.events[0].result).toBe("RECOVERED");
    expect(result.lanes[0].leftReps).toBe(1);
    expect(result.trace.at(-1)?.left.recovery).toMatchObject({ attempted: true, accepted: true, reason: "TRAJECTORY" });
  });

  it("falls back to opposite hip when primary hip dips during pelvic twist", () => {
    const manager = new LaneManager(DEFAULT_KNEE_COUNTER_CONFIG);

    // Left hip has low confidence (0.10), but right hip has 0.85
    const poseWithWeakHip = createPose(
      0,
      { x: 0.5, y: 0.72, score: 0.85 },
      { x: 0.43, y: 0.72, score: 0.80 },
      { x: 0.50, y: 0.45, score: 0.10 }, // weak primary hip
      { x: 0.42, y: 0.47, score: 0.85 }  // strong opposite hip
    );

    const result = manager.update([poseWithWeakHip], 0, true, context);
    expect(result.trace[0].left.reason).toBe("VALID");
  });
});
