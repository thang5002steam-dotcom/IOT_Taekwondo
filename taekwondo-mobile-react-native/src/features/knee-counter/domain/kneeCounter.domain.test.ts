import { calculateKneeSignal } from "./kneeSignal";
import { advanceLegState, initialLegCounterState } from "./kneeStateMachine";
import { DEFAULT_KNEE_COUNTER_CONFIG } from "../config/kneeCounterConfig";
import type { NormalizedPose } from "../types/kneeCounter.types";

const pose = (kneeY: number, hipY = .55, kneeScore = .95): NormalizedPose => { const keypoints = Array.from({ length: 17 }, () => ({ x: .5, y: .5, score: .95 })); keypoints[5] = { x: .45, y: .3, score: .95 }; keypoints[11] = { x: .45, y: hipY, score: .95 }; keypoints[13] = { x: .45, y: kneeY, score: kneeScore }; return { detectorTrackId: "a", poseScore: .95, detectedAtMs: 0, boundingBox: null, keypoints }; };
const context = { sessionId: "s", sessionStartedAt: "now", laneId: "lane-1", participantId: "VĐV 1", detectorTrackId: "a", thresholdPercent: 0, backend: "webgl" as const, inputSize: 320 as const, engine: "movenet-multipose-lightning" as const, config: DEFAULT_KNEE_COUNTER_CONFIG };
describe("high knee state machine", () => { it("counts when the knee crosses upward and rearms only after it lowers", () => { let state = initialLegCounterState(); state = advanceLegState(state, calculateKneeSignal(pose(.8), "left", 0, DEFAULT_KNEE_COUNTER_CONFIG), context).state; const result = advanceLegState(state, calculateKneeSignal(pose(.45), "left", 60, DEFAULT_KNEE_COUNTER_CONFIG), context); expect(result.event?.id).toBe("s:lane-1:left:1"); expect(result.state.reps).toBe(1); state = result.state; expect(advanceLegState(state, calculateKneeSignal(pose(.42), "left", 120, DEFAULT_KNEE_COUNTER_CONFIG), context).event).toBeNull(); state = advanceLegState(state, calculateKneeSignal(pose(.8), "left", 180, DEFAULT_KNEE_COUNTER_CONFIG), context).state; expect(state.phase).toBe("READY"); }); it("uses current hip, not a calibrated hip", () => { expect(calculateKneeSignal(pose(.45, .5), "left", 0, DEFAULT_KNEE_COUNTER_CONFIG).ratio).toBeGreaterThan(0); }); });

describe("ankle landmark mode", () => {
  const ankleConfig = { ...DEFAULT_KNEE_COUNTER_CONFIG, measurementLandmark: "ankle" as const, thresholdPercent: 0 };
  const anklePose = (kneeY: number, ankleY: number, ankleScore = .95) => {
    const value = pose(kneeY);
    value.keypoints[15] = { x: .45, y: ankleY, score: ankleScore };
    value.keypoints[16] = { x: .55, y: .82, score: .95 };
    return value;
  };

  it("uses the ankle height rather than the knee height", () => {
    const grounded = anklePose(.35, .82);
    const raised = anklePose(.82, .40);
    expect(calculateKneeSignal(grounded, "left", 0, ankleConfig).ratio).toBeLessThan(0);
    expect(calculateKneeSignal(raised, "left", 60, ankleConfig).ratio).toBeGreaterThan(0);
  });

  it("requires a confident ankle and rearms only after that ankle drops", () => {
    const lowConfidence = calculateKneeSignal(anklePose(.35, .40, .001), "left", 0, ankleConfig);
    expect(lowConfidence.valid).toBe(false);
    expect(lowConfidence.reason).toBe("ANKLE_LOW_CONFIDENCE");

    let state = initialLegCounterState();
    state = advanceLegState(state, calculateKneeSignal(anklePose(.35, .82), "left", 0, ankleConfig), { ...context, config: ankleConfig }).state;
    const first = advanceLegState(state, calculateKneeSignal(anklePose(.82, .40), "left", 60, ankleConfig), { ...context, config: ankleConfig });
    expect(first.event?.id).toBe("s:lane-1:left:1");
    expect(advanceLegState(first.state, calculateKneeSignal(anklePose(.30, .40), "left", 120, ankleConfig), { ...context, config: ankleConfig }).event).toBeNull();
    state = advanceLegState(first.state, calculateKneeSignal(anklePose(.30, .82), "left", 180, ankleConfig), { ...context, config: ankleConfig }).state;
    expect(state.phase).toBe("READY");
  });
});

describe("weak-knee confirmation and gaps", () => {
  it("requires a rising, supported weak trajectory and two frames before counting", () => {
    const weak2Config = { ...DEFAULT_KNEE_COUNTER_CONFIG, weakConfirmationSamples: 2 };
    const weak2Context = { ...context, config: weak2Config };
    let state = initialLegCounterState();
    state = advanceLegState(state, calculateKneeSignal(pose(.8), "left", 0, weak2Config), weak2Context).state;
    const firstSignal = { ...calculateKneeSignal(pose(.45, .55, .2), "left", 60, weak2Config), corroborated: true, confirmationReason: "geometry" as const };
    const first = advanceLegState(state, firstSignal, weak2Context);
    expect(first.event).toBeNull();
    expect(first.state.pendingDirection).toBe("UP");
    const secondSignal = { ...calculateKneeSignal(pose(.44, .55, .2), "left", 120, weak2Config), corroborated: true, confirmationReason: "geometry" as const };
    const second = advanceLegState(first.state, secondSignal, weak2Context);
    expect(second.event?.id).toBe("s:lane-1:left:1");
    expect(second.state.reps).toBe(1);
  });

  it("does not count from an invalid sample or after a long gap", () => {
    let state = initialLegCounterState();
    state = advanceLegState(state, calculateKneeSignal(pose(.8), "left", 0, DEFAULT_KNEE_COUNTER_CONFIG), context).state;
    const invalid = calculateKneeSignal(pose(.45, .55, .01), "left", 60, DEFAULT_KNEE_COUNTER_CONFIG);
    state = advanceLegState(state, invalid, context).state;
    const afterGap = advanceLegState(state, calculateKneeSignal(pose(.45), "left", 800, DEFAULT_KNEE_COUNTER_CONFIG), context);
    expect(afterGap.event).toBeNull();
    expect(afterGap.state.phase).toBe("NEEDS_DOWN");
  });

  it("does not let a held knee create duplicate events", () => {
    let state = initialLegCounterState();
    state = advanceLegState(state, calculateKneeSignal(pose(.8), "left", 0, DEFAULT_KNEE_COUNTER_CONFIG), context).state;
    const first = advanceLegState(state, calculateKneeSignal(pose(.45), "left", 60, DEFAULT_KNEE_COUNTER_CONFIG), context);
    const held = advanceLegState(first.state, { ...calculateKneeSignal(pose(.4), "left", 400, DEFAULT_KNEE_COUNTER_CONFIG), held: true }, context);
    expect(first.state.reps).toBe(1);
    expect(held.event).toBeNull();
    expect(held.state.reps).toBe(1);
  });
});

describe("proximity guard and 4-point mode", () => {
  it("rejects poses that are too close to camera (proximity guard)", () => {
    // When participant walks too close, hipY is low on screen (> 0.65)
    const tooClosePose: NormalizedPose = {
      detectorTrackId: "a",
      poseScore: 0.95,
      detectedAtMs: 0,
      boundingBox: null,
      keypoints: Array.from({ length: 17 }, () => ({ x: 0.5, y: 0.5, score: 0.95 })),
    };
    tooClosePose.keypoints[11] = { x: 0.45, y: 0.76, score: 0.95 }; // left hip
    tooClosePose.keypoints[13] = { x: 0.45, y: 0.98, score: 0.95 }; // left knee

    const signal = calculateKneeSignal(tooClosePose, "left", 0, DEFAULT_KNEE_COUNTER_CONFIG);
    expect(signal.valid).toBe(false);
    expect(signal.reason).toBe("PROXIMITY_TOO_CLOSE");
  });

  it("falls back to 4-point torso height from inter-hip width when shoulders are lost", () => {
    const noShoulderPose: NormalizedPose = {
      detectorTrackId: "a",
      poseScore: 0.95,
      detectedAtMs: 0,
      boundingBox: null,
      keypoints: Array.from({ length: 17 }, () => ({ x: 0.5, y: 0.5, score: 0.0 })),
    };
    // Hips
    noShoulderPose.keypoints[11] = { x: 0.40, y: 0.50, score: 0.95 }; // left hip
    noShoulderPose.keypoints[12] = { x: 0.55, y: 0.50, score: 0.95 }; // right hip (width = 0.15 -> torsoHeight = 0.30)
    // Knees
    noShoulderPose.keypoints[13] = { x: 0.40, y: 0.40, score: 0.95 }; // left knee raised (0.50 - 0.40 = 0.10)
    noShoulderPose.keypoints[14] = { x: 0.55, y: 0.70, score: 0.95 }; // right knee down

    const signal = calculateKneeSignal(noShoulderPose, "left", 0, DEFAULT_KNEE_COUNTER_CONFIG);
    expect(signal.valid).toBe(true);
    expect(signal.reason).toBe("VALID");
    expect(signal.ratio).toBeCloseTo(0.10 / 0.30, 1);
  });

  it("uses the supporting leg when pelvis bounce hides a fast raised knee", () => {
    const sprintPose: NormalizedPose = {
      detectorTrackId: "a",
      poseScore: 0.95,
      detectedAtMs: 0,
      boundingBox: null,
      keypoints: Array.from({ length: 17 }, () => ({ x: 0.5, y: 0.5, score: 0.95 })),
    };
    // Shoulders & Hips (torso = 0.25)
    sprintPose.keypoints[5] = { x: 0.45, y: 0.10, score: 0.95 };
    sprintPose.keypoints[11] = { x: 0.45, y: 0.35, score: 0.95 }; // hip bounced up to 0.35
    // Left knee is up at 0.50, Right knee is down at 0.72
    sprintPose.keypoints[13] = { x: 0.45, y: 0.50, score: 0.95 };
    sprintPose.keypoints[14] = { x: 0.55, y: 0.72, score: 0.95 };

    const signal = calculateKneeSignal(sprintPose, "left", 0, DEFAULT_KNEE_COUNTER_CONFIG);
    expect(signal.valid).toBe(true);
    expect(signal.geometricRatio).toBeCloseTo(-0.60, 2);
    expect(signal.supportRatio).toBeGreaterThan(signal.geometricRatio!);
    expect(signal.supportsWeakKnee).toBe(true);
  });
});

describe("single weak peaks", () => {
  it("counts a one-frame weak peak when the supporting leg compensates pelvis bounce", () => {
    const weakConfig = { ...DEFAULT_KNEE_COUNTER_CONFIG, weakConfirmationSamples: 1 };
    const supportingPose = pose(.5, .35, .2);
    supportingPose.keypoints[5] = { x: .45, y: .10, score: .95 };
    supportingPose.keypoints[14] = { x: .55, y: .72, score: .95 };
    let state = initialLegCounterState();
    state = advanceLegState(state, calculateKneeSignal(pose(.8), "left", 0, weakConfig), { ...context, config: weakConfig }).state;
    const signal = { ...calculateKneeSignal(supportingPose, "left", 60, weakConfig), quality: "weak" as const, confirmationReason: "support" as const };
    const result = advanceLegState(state, signal, { ...context, config: weakConfig });
    expect(signal.supportsWeakKnee).toBe(true);
    expect(result.event?.id).toBe("s:lane-1:left:1");
  });

  it("counts a one-frame weak peak when it crosses geometrically", () => {
    const weakConfig = { ...DEFAULT_KNEE_COUNTER_CONFIG, weakConfirmationSamples: 1 };
    let state = initialLegCounterState();
    state = advanceLegState(state, calculateKneeSignal(pose(.8), "left", 0, weakConfig), { ...context, config: weakConfig }).state;
    const weakPeak = { ...calculateKneeSignal(pose(.45, .55, .2), "left", 60, weakConfig), confirmationReason: "geometry" as const };
    const result = advanceLegState(state, weakPeak, { ...context, config: weakConfig });
    expect(result.event?.id).toBe("s:lane-1:left:1");
  });

  it("does not count an unsupported weak sample", () => {
    const weakConfig = { ...DEFAULT_KNEE_COUNTER_CONFIG, weakConfirmationSamples: 1 };
    let state = initialLegCounterState();
    state = advanceLegState(state, calculateKneeSignal(pose(.8), "left", 0, weakConfig), { ...context, config: weakConfig }).state;
    const weakPeak = { ...calculateKneeSignal(pose(.45, .55, .2), "left", 60, weakConfig), confirmationReason: undefined };
    const result = advanceLegState(state, weakPeak, { ...context, config: weakConfig });
    expect(result.event).toBeNull();
    expect(result.state.reps).toBe(0);
  });
});

