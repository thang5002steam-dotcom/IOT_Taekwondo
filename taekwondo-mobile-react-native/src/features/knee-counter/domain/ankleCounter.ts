import { MOVENET_KEYPOINT } from "./kneeSignal";
import type { AnkleGuide, AnkleLegPhase, AnkleReviewCandidate, AnkleSignal, KneeCounterSessionConfig, Leg, NormalizedPoint, NormalizedPose, RepEvent } from "../types/kneeCounter.types";

export const ANKLE_RULES = { calibrationFrames: 5, countDistance: -0.04, resetOffset: 0.08, resetDistance: 0.02, resetHoldMs: 200, minUpVelocity: -0.35, minDownVelocity: 0.15, maxGapMs: 180, trustedScore: 0.45, visibleScore: 0.25, maxNormalizedSpeed: 8 } as const;
export type AnkleFrame = { signal: AnkleSignal; pose: NormalizedPose; timestampMs: number };
export type AnkleLegState = { phase: AnkleLegPhase; reps: number; guide: AnkleGuide | null; calibration: Array<{ hipY: number; kneeY: number; torso: number }>; history: AnkleFrame[]; crossedAtMs: number | null; peak: AnkleFrame | null; resetSinceMs: number | null; reviewPending: boolean };
export const initialAnkleLegState = (): AnkleLegState => ({ phase: "NEEDS_RESET", reps: 0, guide: null, calibration: [], history: [], crossedAtMs: null, peak: null, resetSinceMs: null, reviewPending: false });

const point = (pose: NormalizedPose, index: number) => pose.keypoints[index];
const ok = (value: NormalizedPoint | undefined, score: number) => Boolean(value && Number.isFinite(value.x) && Number.isFinite(value.y) && value.score >= score);
const median = (values: number[]) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)] ?? 0;
export function ankleSignal(pose: NormalizedPose, leg: Leg, timestampMs: number, previous: AnkleFrame | null): AnkleSignal {
  const left = leg === "left";
  const hip = point(pose, left ? MOVENET_KEYPOINT.leftHip : MOVENET_KEYPOINT.rightHip);
  const shoulder = point(pose, left ? MOVENET_KEYPOINT.leftShoulder : MOVENET_KEYPOINT.rightShoulder);
  const knee = point(pose, left ? MOVENET_KEYPOINT.leftKnee : MOVENET_KEYPOINT.rightKnee);
  const ankle = point(pose, left ? MOVENET_KEYPOINT.leftAnkle : MOVENET_KEYPOINT.rightAnkle);
  if (pose.poseScore < .20 || !ok(hip, .20) || !ok(shoulder, .25) || !ok(knee, .01) || !ok(ankle, ANKLE_RULES.visibleScore)) return { valid: false, leg, timestampMs, ankleY: ankle?.y ?? null, kneeY: knee?.y ?? null, hipY: hip?.y ?? null, torsoHeight: null, countDistance: null, resetDistance: null, velocity: null, confidence: ankle?.score ?? 0, kneeConfidence: knee?.score ?? 0, continuity: 0, kneeCorroborated: false, bodyStable: false, reason: "LANDMARK_LOW_CONFIDENCE" };
  const torsoHeight = Math.hypot(hip.x - shoulder.x, hip.y - shoulder.y);
  if (torsoHeight < .05) return { valid: false, leg, timestampMs, ankleY: ankle.y, kneeY: knee.y, hipY: hip.y, torsoHeight, countDistance: null, resetDistance: null, velocity: null, confidence: ankle.score, kneeConfidence: knee.score, continuity: 0, kneeCorroborated: false, bodyStable: false, reason: "TORSO_TOO_SMALL" };
  const gap = previous ? timestampMs - previous.timestampMs : null;
  const velocity = previous && gap && gap > 0 && gap <= ANKLE_RULES.maxGapMs && previous.signal.ankleY !== null ? (ankle.y - previous.signal.ankleY) / torsoHeight / (gap / 1000) : null;
  const kneeVelocity = previous && gap && gap > 0 && gap <= ANKLE_RULES.maxGapMs && previous.signal.kneeY !== null ? (knee.y - previous.signal.kneeY) / torsoHeight / (gap / 1000) : null;
  const continuity = previous && previous.signal.ankleY !== null ? Math.max(0, 1 - Math.abs(ankle.y - previous.signal.ankleY) / (torsoHeight * 1.4)) : 1;
  const hipDrift = previous && previous.signal.hipY !== null ? Math.abs(hip.y - previous.signal.hipY) / torsoHeight : 0;
  return { valid: true, leg, timestampMs, ankleY: ankle.y, kneeY: knee.y, hipY: hip.y, torsoHeight, countDistance: null, resetDistance: null, velocity, confidence: ankle.score, kneeConfidence: knee.score, continuity, kneeCorroborated: kneeVelocity === null || Math.sign(kneeVelocity) === Math.sign(velocity ?? kneeVelocity) || Math.abs(kneeVelocity) > .1, bodyStable: hipDrift < .25, reason: "VALID" };
}
export function calibrateAnkle(state: AnkleLegState, signal: AnkleSignal): AnkleLegState {
  if (!signal.valid || signal.hipY === null || signal.kneeY === null || signal.torsoHeight === null) return state;
  if (state.guide) return state;
  const calibration = [...state.calibration, { hipY: signal.hipY, kneeY: signal.kneeY, torso: signal.torsoHeight }].slice(-ANKLE_RULES.calibrationFrames);
  if (calibration.length < ANKLE_RULES.calibrationFrames) return { ...state, calibration };
  const torsoHeight = median(calibration.map((sample) => sample.torso));
  return { ...state, calibration, guide: { countLineY: median(calibration.map((sample) => sample.hipY)), resetLineY: median(calibration.map((sample) => sample.kneeY)) + ANKLE_RULES.resetOffset * torsoHeight, torsoHeight } };
}
export function advanceAnkle(state: AnkleLegState, frame: AnkleFrame, counting: boolean): { state: AnkleLegState; event: RepEvent | null; candidate: AnkleReviewCandidate | null } {
  let next = calibrateAnkle(state, frame.signal);
  const history = [...next.history, frame].slice(-3);
  next = { ...next, history };
  if (!next.guide || !frame.signal.valid || frame.signal.ankleY === null) return { state: next, event: null as RepEvent | null, candidate: null as AnkleReviewCandidate | null };
  const countDistance = (frame.signal.ankleY - next.guide.countLineY) / next.guide.torsoHeight;
  const resetDistance = (frame.signal.ankleY - next.guide.resetLineY) / next.guide.torsoHeight;
  const signal = { ...frame.signal, countDistance, resetDistance };
  const storedFrame = { ...frame, signal };
  next = { ...next, history: [...next.history.slice(0, -1), storedFrame] };
  if (!counting) return { state: next, event: null as RepEvent | null, candidate: null as AnkleReviewCandidate | null };
  if (next.phase === "NEEDS_RESET") return { state: resetDistance >= ANKLE_RULES.resetDistance ? { ...next, phase: "READY" } : next, event: null as RepEvent | null, candidate: null as AnkleReviewCandidate | null };
  const trustedCrossing = signal.confidence >= ANKLE_RULES.trustedScore && signal.continuity >= .45 && signal.kneeCorroborated && signal.bodyStable;
  if (next.phase === "READY" && countDistance <= ANKLE_RULES.countDistance && (signal.velocity ?? 0) <= ANKLE_RULES.minUpVelocity && trustedCrossing) return { state: { ...next, phase: "ABOVE_COUNT", crossedAtMs: frame.timestampMs, peak: storedFrame }, event: null as RepEvent | null, candidate: null as AnkleReviewCandidate | null };
  if (next.phase === "ABOVE_COUNT") {
    const peak = !next.peak || (signal.countDistance ?? 0) < (next.peak.signal.countDistance ?? 0) ? storedFrame : next.peak;
    if ((signal.velocity ?? 0) >= ANKLE_RULES.minDownVelocity) return { state: { ...next, phase: "RETURNING", peak }, event: null as RepEvent | null, candidate: null as AnkleReviewCandidate | null };
    return { state: { ...next, peak }, event: null as RepEvent | null, candidate: null as AnkleReviewCandidate | null };
  }
  if (next.phase === "RETURNING" && resetDistance >= ANKLE_RULES.resetDistance) return { state: { ...next, phase: "RESET_HOLD", resetSinceMs: frame.timestampMs }, event: null as RepEvent | null, candidate: null as AnkleReviewCandidate | null };
  if (next.phase === "RESET_HOLD") {
    if (resetDistance < ANKLE_RULES.resetDistance) return { state: { ...next, phase: "RETURNING", resetSinceMs: null }, event: null as RepEvent | null, candidate: null as AnkleReviewCandidate | null };
    if (frame.timestampMs - (next.resetSinceMs ?? frame.timestampMs) >= ANKLE_RULES.resetHoldMs) return { state: { ...next, phase: "READY", reps: next.reps + 1, crossedAtMs: null, peak: null, resetSinceMs: null }, event: "CONFIRM" as unknown as RepEvent, candidate: null as AnkleReviewCandidate | null };
  }
  return { state: next, event: null as RepEvent | null, candidate: null as AnkleReviewCandidate | null };
}
