import { MAX_TRACKED_PEOPLE } from "../config/kneeCounterConfig";
import { calculateKneeSignal, measurementKeypointIndex, missingKneeSignal, MOVENET_KEYPOINT } from "./kneeSignal";
import { advanceLegState, initialLegCounterState, recoverLegPeak, resetPendingCycle } from "./kneeStateMachine";
import { advanceAnkle, ankleSignal, initialAnkleLegState, type AnkleFrame, type AnkleLegState } from "./ankleCounter";
import type { AnkleReviewCandidate, ComputeBackend, KneeCounterSessionConfig, KneeSignal, KneeTraceLeg, KneeTraceSample, LegCounterState, NormalizedPose, ParticipantSlot, PersonPose, RepEvent } from "../types/kneeCounter.types";

export type PoseCandidate = { pose: NormalizedPose; centerX: number; centerY: number };
const tracePoint = (value: NormalizedPose["keypoints"][number] | undefined) => value ? { x: value.x, y: value.y, score: value.score } : { x: null, y: null, score: 0 };
export const createLaneDefinitions = (count: number) => Array.from({ length: count }, (_, index) => ({ laneId: `lane-${index + 1}`, label: `VĐV ${index + 1}`, index, left: index / count, right: (index + 1) / count, centerX: (index + .5) / count }));
const validHip = (point: { x: number; y: number; score: number } | undefined) => Boolean(point && Number.isFinite(point.x) && Number.isFinite(point.y) && point.score >= .20);
export function poseToCandidate(pose: NormalizedPose): PoseCandidate | null { const hips = [pose.keypoints[MOVENET_KEYPOINT.leftHip], pose.keypoints[MOVENET_KEYPOINT.rightHip]].filter(validHip); return hips.length ? { pose, centerX: hips.reduce((sum, hip) => sum + hip.x, 0) / hips.length, centerY: hips.reduce((sum, hip) => sum + hip.y, 0) / hips.length } : null; }
function iou(a: NonNullable<NormalizedPose["boundingBox"]>, b: NonNullable<NormalizedPose["boundingBox"]>) { const left = Math.max(a.xMin, b.xMin); const right = Math.min(a.xMax, b.xMax); const top = Math.max(a.yMin, b.yMin); const bottom = Math.min(a.yMax, b.yMax); const intersection = Math.max(0, right - left) * Math.max(0, bottom - top); const union = (a.xMax - a.xMin) * (a.yMax - a.yMin) + (b.xMax - b.xMin) * (b.yMax - b.yMin) - intersection; return union ? intersection / union : 0; }
export function deduplicateCandidates(candidates: PoseCandidate[], max = MAX_TRACKED_PEOPLE) { const unique: PoseCandidate[] = []; for (const candidate of [...candidates].sort((a, b) => b.pose.poseScore - a.pose.poseScore)) { if (unique.some((chosen) => candidate.pose.boundingBox && chosen.pose.boundingBox && iou(candidate.pose.boundingBox, chosen.pose.boundingBox) > .6)) continue; unique.push(candidate); if (unique.length >= max) break; } return unique; }
// Kept for the former unit test; the runtime no longer uses fixed horizontal lanes.
export function assignCandidatesToLanes(candidates: PoseCandidate[], lanes: ReturnType<typeof createLaneDefinitions>, _flipHorizontal: boolean) { return lanes.map((lane) => ({ lane, candidate: candidates.find((candidate) => candidate.centerX >= lane.left && candidate.centerX <= lane.right) ?? null, conflict: false })); }

type RatioSample = { ratio: number; timestampMs: number };
type TemporalSample = { timestampMs: number; ratio: number; confidence: number; quality: KneeSignal["quality"]; corroborated: boolean; geometricRatio: number | null; supportRatio: number | null; held: boolean; shoulderY: number | null; hipY: number | null; kneeY: number | null };
type RecoveryDecision = { attempted: boolean; accepted: boolean; estimatedPeakRatio: number | null; gapMs: number | null; reason: string | null };
type Memory = { slot: ParticipantSlot; left: ReturnType<typeof initialLegCounterState>; right: ReturnType<typeof initialLegCounterState>; leftAnkle: AnkleLegState; rightAnkle: AnkleLegState; leftRatios: RatioSample[]; rightRatios: RatioSample[]; leftWindow: TemporalSample[]; rightWindow: TemporalSample[]; lastTrustedLeft: KneeSignal | null; lastTrustedRight: KneeSignal | null; lastCenter: { x: number; y: number }; detectorIds: Set<string> };
export class LaneManager {
  private readonly memories = new Map<string, Memory>(); private nextId = 1; private trace: KneeTraceSample[] = []; private reviewCandidates = new Map<string, AnkleReviewCandidate>();
  constructor(private config: KneeCounterSessionConfig) {}
  updateConfig(newConfig: KneeCounterSessionConfig) { this.config = newConfig; }
  resetPendingCycles() { this.memories.forEach((memory) => { memory.left = resetPendingCycle(memory.left); memory.right = resetPendingCycle(memory.right); memory.leftAnkle = initialAnkleLegState(); memory.rightAnkle = initialAnkleLegState(); memory.leftRatios = []; memory.rightRatios = []; memory.leftWindow = []; memory.rightWindow = []; memory.lastTrustedLeft = null; memory.lastTrustedRight = null; }); this.reviewCandidates.clear(); }
  getTrace() { return [...this.trace]; }
  getReviewCandidates() { return [...this.reviewCandidates.values()]; }
  resolveReviewCandidate(id: string, decision: "ACCEPT" | "REJECT", context: { sessionId: string; sessionStartedAt: string; backend: ComputeBackend | null; inputSize: 320 | 384 | 448 | null }) {
    const candidate = this.reviewCandidates.get(id); if (!candidate || candidate.decision !== "PENDING") return { event: null, reviewCandidates: this.getReviewCandidates(), lanes: [...this.memories.values()].map((memory) => memory.slot) };
    const memory = this.memories.get(candidate.participantId); let event: RepEvent | null = null;
    if (decision === "ACCEPT" && memory) {
      event = { id: `manual-${candidate.id}`, sessionStartedAt: context.sessionStartedAt, laneId: candidate.laneId, participantId: candidate.participantId, detectorTrackId: candidate.detectorTrackId, leg: candidate.leg, crossedAtMs: candidate.peakAtMs, completedAtMs: candidate.peakAtMs, peakRatio: (candidate.countLineY - candidate.peak.ankle.y!) / candidate.torsoHeight, confidence: candidate.confidence, thresholdPercent: -4, backend: context.backend, inputSize: context.inputSize, engine: "movenet-multipose-lightning", result: "CONFIRMED" };
      if (candidate.leg === "left") { memory.leftAnkle = { ...memory.leftAnkle, reps: memory.leftAnkle.reps + 1 }; memory.slot = { ...memory.slot, leftReps: memory.leftAnkle.reps }; }
      else { memory.rightAnkle = { ...memory.rightAnkle, reps: memory.rightAnkle.reps + 1 }; memory.slot = { ...memory.slot, rightReps: memory.rightAnkle.reps }; }
    }
    this.reviewCandidates.set(id, { ...candidate, decision: decision === "ACCEPT" ? "ACCEPTED" : "REJECTED", event: event ?? undefined });
    return { event, reviewCandidates: this.getReviewCandidates(), lanes: [...this.memories.values()].map((memory) => memory.slot).sort((a, b) => a.slotIndex - b.slotIndex) };
  }
  update(candidates: PoseCandidate[], timestampMs: number, counting: boolean, context: { sessionId: string; sessionStartedAt: string; backend: ComputeBackend | null; inputSize: 320 | 384 | 448 | null; frame?: { frameId: number; captureTimestampMs: number; mediaTime: number | null } }) {
    if (this.config.measurementLandmark === "ankle") return this.updateAnkles(candidates, timestampMs, counting, context);
    const traceStart = this.trace.length;
    const events: RepEvent[] = []; const used = new Set<string>();
    for (const candidate of candidates) {
      const memory = this.match(candidate, used, timestampMs); if (!memory) continue; used.add(memory.slot.participantId);
      const pose = toPersonPose(candidate, memory.slot.participantId); const stableFrames = memory.slot.trackId === pose.trackId ? memory.slot.stableFrames + 1 : 1;
      const rawLeftSignal = calculateKneeSignal(pose, "left", timestampMs, this.config); const rawRightSignal = calculateKneeSignal(pose, "right", timestampMs, this.config);
      const leftSignal = smoothSignal(resolveSignal(rawLeftSignal, memory.leftRatios, memory.lastTrustedLeft), memory.leftRatios, this.config); const rightSignal = smoothSignal(resolveSignal(rawRightSignal, memory.rightRatios, memory.lastTrustedRight), memory.rightRatios, this.config);
      if (rawLeftSignal.valid && rawLeftSignal.quality === "trusted") memory.lastTrustedLeft = rawLeftSignal;
      if (rawRightSignal.valid && rawRightSignal.quality === "trusted") memory.lastTrustedRight = rawRightSignal;
      const leftBefore = memory.left; const rightBefore = memory.right;
      const eventContext = (leg: "left" | "right") => ({ sessionId: context.sessionId, sessionStartedAt: context.sessionStartedAt, laneId: memory.slot.laneId, participantId: memory.slot.participantId, detectorTrackId: candidate.pose.detectorTrackId, thresholdPercent: this.config.thresholdPercent, backend: context.backend, inputSize: context.inputSize, engine: "movenet-multipose-lightning" as const, config: this.config, leg });
      let leftEvent: RepEvent | null = null; let rightEvent: RepEvent | null = null;
      let leftRecovery: RecoveryDecision | undefined; let rightRecovery: RecoveryDecision | undefined;
      if (counting) {
        const left = advanceLegState(memory.left, leftSignal, eventContext("left")); memory.left = left.state; leftEvent = left.event;
        const right = advanceLegState(memory.right, rightSignal, eventContext("right")); memory.right = right.state; rightEvent = right.event;
        if (!leftEvent) { const recovered = recoverFromWindow(memory.left, memory.leftWindow, leftSignal, eventContext("left")); memory.left = recovered.state; leftEvent = recovered.event; leftRecovery = recovered.decision; }
        if (!rightEvent) { const recovered = recoverFromWindow(memory.right, memory.rightWindow, rightSignal, eventContext("right")); memory.right = recovered.state; rightEvent = recovered.event; rightRecovery = recovered.decision; }
        if (leftEvent) events.push(leftEvent); if (rightEvent) events.push(rightEvent);
      }
      rememberTemporal(memory.leftWindow, leftSignal, candidate.pose, "left", this.config); rememberTemporal(memory.rightWindow, rightSignal, candidate.pose, "right", this.config);
      memory.lastCenter = { x: candidate.centerX, y: candidate.centerY }; if (candidate.pose.detectorTrackId) memory.detectorIds.add(candidate.pose.detectorTrackId);
      memory.slot = { ...memory.slot, trackId: pose.trackId, pose, confidence: Math.max(leftSignal.confidence, rightSignal.confidence), lastSeenAtMs: timestampMs, stableFrames, status: counting ? "ACTIVE" : stableFrames >= this.config.readyStableFrames ? "READY" : "ALIGNING", leftPhase: memory.left.phase, rightPhase: memory.right.phase, leftReps: memory.left.reps, rightReps: memory.right.reps, leftRatio: leftSignal.ratio, rightRatio: rightSignal.ratio };
      this.recordTrace(memory, candidate.pose, timestampMs, rawLeftSignal, rawRightSignal, leftSignal, rightSignal, leftBefore, rightBefore, leftEvent, rightEvent, leftRecovery, rightRecovery, counting, context.frame);
    }
    for (const [pId, memory] of this.memories.entries()) {
      if (!used.has(pId) && memory.slot.lastSeenAtMs !== null) {
        const gap = timestampMs - memory.slot.lastSeenAtMs;
        const missing = gap > this.config.laneMissingMs;
        const leftBefore = memory.left; const rightBefore = memory.right;
        const leftSignal = holdSignal(missingKneeSignal("left", timestampMs, this.config), memory.lastTrustedLeft); const rightSignal = holdSignal(missingKneeSignal("right", timestampMs, this.config), memory.lastTrustedRight);
        if (counting) {
          const common = { sessionId: context.sessionId, sessionStartedAt: context.sessionStartedAt, laneId: memory.slot.laneId, participantId: memory.slot.participantId, detectorTrackId: null, thresholdPercent: this.config.thresholdPercent, backend: context.backend, inputSize: context.inputSize, engine: "movenet-multipose-lightning" as const, config: this.config };
          memory.left = advanceLegState(memory.left, leftSignal, common).state;
          memory.right = advanceLegState(memory.right, rightSignal, common).state;
        }
        if (gap <= this.config.laneMissingMs * 2.5) {
          this.recordMissingTrace(memory, timestampMs, leftSignal, rightSignal, leftBefore, rightBefore, counting);
        }
        if (missing) memory.slot = { ...memory.slot, status: "MISSING", trackId: null, pose: null, leftPhase: memory.left.phase, rightPhase: memory.right.phase };
        if (gap > this.config.laneMissingMs * 6) {
          this.memories.delete(pId);
        }
      }
    }
    return { lanes: [...this.memories.values()].map((memory) => memory.slot).sort((a, b) => a.slotIndex - b.slotIndex), events, conflicts: 0, trace: this.getTrace(), traceDelta: this.trace.slice(traceStart) };
  }
  private updateAnkles(candidates: PoseCandidate[], timestampMs: number, counting: boolean, context: { sessionId: string; sessionStartedAt: string; backend: ComputeBackend | null; inputSize: 320 | 384 | 448 | null; frame?: { frameId: number; captureTimestampMs: number; mediaTime: number | null } }) {
    const events: RepEvent[] = []; const used = new Set<string>(); const traceStart = this.trace.length;
    for (const candidate of candidates) {
      const memory = this.match(candidate, used, timestampMs); if (!memory) continue; used.add(memory.slot.participantId);
      const pose = toPersonPose(candidate, memory.slot.participantId); const stableFrames = memory.slot.trackId === pose.trackId ? memory.slot.stableFrames + 1 : 1;
      const runLeg = (leg: "left" | "right", current: AnkleLegState) => {
        const previous = current.history.at(-1) ?? null; const signal = ankleSignal(pose, leg, timestampMs, previous);
        const result = advanceAnkle(current, { signal, pose, timestampMs }, counting && stableFrames >= this.config.readyStableFrames);
        let event: RepEvent | null = null;
        if (result.event) {
          event = { id: `${memory.slot.participantId}-${leg}-${timestampMs}`, sessionStartedAt: context.sessionStartedAt, laneId: memory.slot.laneId, participantId: memory.slot.participantId, detectorTrackId: pose.detectorTrackId, leg, crossedAtMs: current.crossedAtMs ?? timestampMs, completedAtMs: timestampMs, peakRatio: result.state.peak?.signal.countDistance ?? -0.04, confidence: result.state.peak?.signal.confidence ?? signal.confidence, thresholdPercent: -4, backend: context.backend, inputSize: context.inputSize, engine: "movenet-multipose-lightning", result: "CONFIRMED" };
          events.push(event);
        }
        let review: AnkleReviewCandidate | null = null;
        if (counting && current.phase === "READY" && current.guide && signal.valid && signal.ankleY !== null && (signal.ankleY - current.guide.countLineY) / current.guide.torsoHeight <= -.04 && result.state.phase === "READY") {
          const frame = { signal, pose, timestampMs }; const before = current.history.at(-1) ?? frame;
          const skeleton = (value: AnkleFrame) => ({ shoulder: tracePoint(value.pose.keypoints[leg === "left" ? 5 : 6]), hip: tracePoint(value.pose.keypoints[leg === "left" ? 11 : 12]), knee: tracePoint(value.pose.keypoints[leg === "left" ? 13 : 14]), ankle: tracePoint(value.pose.keypoints[leg === "left" ? 15 : 16]) });
          const id = `review-${memory.slot.participantId}-${leg}-${timestampMs}`;
          review = { id, participantId: memory.slot.participantId, laneId: memory.slot.laneId, detectorTrackId: pose.detectorTrackId, leg, peakAtMs: timestampMs, createdAtMs: timestampMs, countLineY: current.guide.countLineY, resetLineY: current.guide.resetLineY, torsoHeight: current.guide.torsoHeight, confidence: signal.confidence, upVelocity: signal.velocity, downVelocity: null, continuity: signal.continuity, kneeCorroborated: signal.kneeCorroborated, reason: signal.confidence < .45 ? "CONFIDENCE_WEAK" : !signal.kneeCorroborated ? "KNEE_NOT_CORROBORATED" : !signal.bodyStable ? "BODY_UNSTABLE" : "CONTINUITY_WEAK", before: skeleton(before), peak: skeleton(frame), after: null, decision: "PENDING" };
          this.reviewCandidates.set(id, review);
        }
        return { state: result.state, signal, event, review };
      };
      const left = runLeg("left", memory.leftAnkle); const right = runLeg("right", memory.rightAnkle); memory.leftAnkle = left.state; memory.rightAnkle = right.state;
      const guide = memory.leftAnkle.guide ?? memory.rightAnkle.guide;
      memory.lastCenter = { x: candidate.centerX, y: candidate.centerY }; if (pose.detectorTrackId) memory.detectorIds.add(pose.detectorTrackId);
      memory.slot = { ...memory.slot, trackId: pose.trackId, pose, confidence: Math.max(left.signal.confidence, right.signal.confidence), lastSeenAtMs: timestampMs, stableFrames, status: counting ? "ACTIVE" : stableFrames >= this.config.readyStableFrames ? "READY" : "ALIGNING", leftPhase: memory.leftAnkle.phase, rightPhase: memory.rightAnkle.phase, leftReps: memory.leftAnkle.reps, rightReps: memory.rightAnkle.reps, leftRatio: left.signal.countDistance, rightRatio: right.signal.countDistance, ankleGuide: guide };
      this.recordAnkleTrace(memory, pose, timestampMs, left.signal, right.signal, counting, context.frame, left.review?.id ?? right.review?.id ?? null);
    }
    for (const [id, memory] of this.memories) if (!used.has(id) && memory.slot.lastSeenAtMs !== null && timestampMs - memory.slot.lastSeenAtMs > this.config.laneMissingMs) memory.slot = { ...memory.slot, status: "MISSING", trackId: null, pose: null };
    return { lanes: [...this.memories.values()].map((memory) => memory.slot).sort((a, b) => a.slotIndex - b.slotIndex), events, reviewCandidates: this.getReviewCandidates(), conflicts: 0, trace: this.getTrace(), traceDelta: this.trace.slice(traceStart) };
  }
  private recordAnkleTrace(memory: Memory, pose: NormalizedPose, timestampMs: number, leftSignal: import("../types/kneeCounter.types").AnkleSignal, rightSignal: import("../types/kneeCounter.types").AnkleSignal, counting: boolean, frame: { frameId: number; captureTimestampMs: number; mediaTime: number | null } | undefined, reviewCandidateId: string | null) {
    const p = (i: number) => { const value = pose.keypoints[i]; return value ? { x: value.x, y: value.y, score: value.score } : { x: null, y: null, score: 0 }; };
    const empty = (signal: import("../types/kneeCounter.types").AnkleSignal): KneeTraceLeg => ({ reason: signal.reason as KneeSignal["reason"], valid: signal.valid, confidence: signal.confidence, kneeConfidence: signal.kneeConfidence, quality: signal.confidence >= .45 ? "trusted" : signal.valid ? "weak" : "invalid", rawRatio: signal.countDistance, smoothedRatio: signal.countDistance, enterThreshold: -.04, exitThreshold: .02, phaseBefore: "READY", phaseAfter: "READY", repsBefore: 0, repsAfter: 0, droppedSamples: 0, lastValidAtMs: timestampMs, pendingDirection: null, pendingSamples: 0, eventId: null });
    this.pushTrace({ algorithmVersion: 4, config: traceConfig(this.config), timestampMs, source: "POSE", participantId: memory.slot.participantId, detectorTrackId: pose.detectorTrackId, trackId: memory.slot.trackId, poseScore: pose.poseScore, boundingBox: pose.boundingBox, center: memory.lastCenter, points: { leftShoulder: p(5), rightShoulder: p(6), leftHip: p(11), rightHip: p(12), leftKnee: p(13), rightKnee: p(14), leftAnkle: p(15), rightAnkle: p(16) }, left: empty(leftSignal), right: empty(rightSignal), counting, ankle: { guide: memory.slot.ankleGuide ?? null, left: leftSignal, right: rightSignal, reviewCandidateId }, frame });
  }
  private match(candidate: PoseCandidate, used: Set<string>, timestampMs: number) { const id = candidate.pose.detectorTrackId; let best = [...this.memories.values()].find((memory) => !used.has(memory.slot.participantId) && Boolean(id && memory.detectorIds.has(id))); if (!best) best = [...this.memories.values()].filter((memory) => !used.has(memory.slot.participantId) && memory.slot.lastSeenAtMs !== null && timestampMs - memory.slot.lastSeenAtMs <= this.config.laneMissingMs).sort((a, b) => distance(a.lastCenter, candidate) - distance(b.lastCenter, candidate))[0]; if (best && distance(best.lastCenter, candidate) <= .18) return best; if (this.memories.size >= MAX_TRACKED_PEOPLE) return null; const index = this.nextId++; const participantId = `participant-${index}`; const memory: Memory = { slot: { participantId, laneId: participantId, label: `VĐV ${index}`, slotIndex: index - 1, status: "ALIGNING", trackId: null, pose: null, leftReps: 0, rightReps: 0, leftPhase: "NEEDS_DOWN", rightPhase: "NEEDS_DOWN", leftRatio: null, rightRatio: null, confidence: null, stableFrames: 0, lastSeenAtMs: null }, left: initialLegCounterState(), right: initialLegCounterState(), leftAnkle: initialAnkleLegState(), rightAnkle: initialAnkleLegState(), leftRatios: [], rightRatios: [], leftWindow: [], rightWindow: [], lastTrustedLeft: null, lastTrustedRight: null, lastCenter: { x: candidate.centerX, y: candidate.centerY }, detectorIds: new Set(id ? [id] : []) }; this.memories.set(participantId, memory); return memory; }
  private recordTrace(memory: Memory, pose: NormalizedPose, timestampMs: number, rawLeft: KneeSignal, rawRight: KneeSignal, left: KneeSignal, right: KneeSignal, leftBefore: LegCounterState, rightBefore: LegCounterState, leftEvent: RepEvent | null, rightEvent: RepEvent | null, leftRecovery: RecoveryDecision | undefined, rightRecovery: RecoveryDecision | undefined, counting: boolean, frame: { frameId: number; captureTimestampMs: number; mediaTime: number | null } | undefined) { const point = (index: number) => { const value = pose.keypoints[index]; return value ? { x: value.x, y: value.y, score: value.score } : { x: null, y: null, score: 0 }; }; this.pushTrace({ algorithmVersion: 3, config: traceConfig(this.config), timestampMs, source: "POSE", participantId: memory.slot.participantId, detectorTrackId: pose.detectorTrackId, trackId: memory.slot.trackId, poseScore: pose.poseScore, boundingBox: pose.boundingBox, center: memory.lastCenter, hipReferenceY: left.hipReferenceY ?? right.hipReferenceY ?? null, torsoHeight: left.torsoHeight ?? right.torsoHeight ?? null, imageAspectRatio: pose.imageAspectRatio ?? null, frame, points: { leftShoulder: point(5), rightShoulder: point(6), leftHip: point(11), rightHip: point(12), leftKnee: point(13), rightKnee: point(14), leftAnkle: point(15), rightAnkle: point(16) }, left: traceLeg(rawLeft, left, leftBefore, memory.left, leftEvent, leftRecovery), right: traceLeg(rawRight, right, rightBefore, memory.right, rightEvent, rightRecovery), counting }); }
  private recordMissingTrace(memory: Memory, timestampMs: number, left: KneeSignal, right: KneeSignal, leftBefore: LegCounterState, rightBefore: LegCounterState, counting: boolean) { const missingPoint = { x: null, y: null, score: 0 }; this.pushTrace({ algorithmVersion: 3, config: traceConfig(this.config), timestampMs, source: "MISSING", participantId: memory.slot.participantId, detectorTrackId: null, trackId: memory.slot.trackId, poseScore: null, boundingBox: null, center: memory.lastCenter, hipReferenceY: left.hipReferenceY ?? right.hipReferenceY ?? null, torsoHeight: left.torsoHeight ?? right.torsoHeight ?? null, points: { leftShoulder: missingPoint, rightShoulder: missingPoint, leftHip: missingPoint, rightHip: missingPoint, leftKnee: missingPoint, rightKnee: missingPoint, leftAnkle: missingPoint, rightAnkle: missingPoint }, left: traceLeg(left, left, leftBefore, memory.left, null), right: traceLeg(right, right, rightBefore, memory.right, null), counting }); }
  private pushTrace(sample: KneeTraceSample) {
    this.trace.push(sample);
    if (this.trace.length > 20_000) {
      this.trace.splice(0, this.trace.length - 20_000);
    }
  }
}
function traceLeg(raw: KneeSignal, smoothed: KneeSignal, before: LegCounterState, after: LegCounterState, event: RepEvent | null, recovery?: RecoveryDecision): KneeTraceLeg { return { reason: smoothed.reason, valid: smoothed.valid, confidence: smoothed.confidence, kneeConfidence: smoothed.kneeConfidence, quality: smoothed.quality, rawRatio: raw.ratio, geometricRatio: raw.geometricRatio ?? null, supportRatio: raw.supportRatio ?? null, smoothedRatio: smoothed.ratio, enterThreshold: smoothed.enterThreshold, exitThreshold: smoothed.exitThreshold, phaseBefore: before.phase, phaseAfter: after.phase, repsBefore: before.reps, repsAfter: after.reps, droppedSamples: after.droppedSamples, lastValidAtMs: after.lastValidAtMs, pendingDirection: after.pendingDirection, pendingSamples: after.pendingSamples, eventId: event?.id ?? null, held: smoothed.held, corroborated: smoothed.corroborated, confirmationReason: smoothed.confirmationReason, recovery }; }
function traceConfig(config: KneeCounterSessionConfig) { const { measurementLandmark, thresholdPercent, minPoseScore, minShoulderScore, minHipScore, minKneeTrustedScore, minKneeWeakScore, weakConfirmationSamples, weakConfirmationWindowMs, smoothingWindowMs, hysteresisRatio, minRepIntervalMs, maxSignalGapMs } = config; return { measurementLandmark, thresholdPercent, minPoseScore, minShoulderScore, minHipScore, minKneeTrustedScore, minKneeWeakScore, weakConfirmationSamples, weakConfirmationWindowMs, smoothingWindowMs, hysteresisRatio, minRepIntervalMs, maxSignalGapMs }; }
function distance(point: { x: number; y: number }, candidate: PoseCandidate) { return Math.hypot(point.x - candidate.centerX, point.y - candidate.centerY); }
function smoothSignal<T extends KneeSignal>(signal: T, history: RatioSample[], config: KneeCounterSessionConfig): T { if (!signal.valid || signal.ratio === null || signal.held) return signal; const samples = history.filter((sample) => signal.timestampMs - sample.timestampMs <= config.smoothingWindowMs); const prev = samples.at(-1)?.ratio ?? signal.ratio; samples.push({ ratio: signal.ratio, timestampMs: signal.timestampMs }); history.splice(0, history.length, ...samples.slice(-3)); const smoothedRatio = signal.ratio >= prev ? signal.ratio : 0.6 * signal.ratio + 0.4 * prev; return { ...signal, ratio: smoothedRatio }; }
function holdSignal(signal: KneeSignal, trusted: KneeSignal | null): KneeSignal {
  if (signal.valid || !trusted || trusted.ratio === null || signal.timestampMs - trusted.timestampMs > 180) return signal;
  return { ...signal, valid: true, ratio: trusted.ratio, quality: "weak", confidence: trusted.confidence, kneeConfidence: trusted.kneeConfidence, held: true };
}
function resolveSignal(signal: KneeSignal, _history: RatioSample[], trusted: KneeSignal | null): KneeSignal {
  if (!signal.valid) return holdSignal(signal, trusted);
  if (signal.quality === "trusted" || signal.ratio === null) return signal;
  const confirmationReason = signal.supportsWeakKnee
    ? "support"
    : signal.geometricRatio !== undefined && signal.geometricRatio >= signal.enterThreshold
      ? "geometry"
      : undefined;
  return { ...signal, corroborated: Boolean(confirmationReason), confirmationReason };
}
function rememberTemporal(window: TemporalSample[], signal: KneeSignal, pose: NormalizedPose, leg: "left" | "right", config: KneeCounterSessionConfig) {
  if (!signal.valid || signal.ratio === null || signal.held) return;
  const landmarkIndex = measurementKeypointIndex(leg, config.measurementLandmark);
  const indices = leg === "left" ? [MOVENET_KEYPOINT.leftShoulder, MOVENET_KEYPOINT.leftHip, landmarkIndex] : [MOVENET_KEYPOINT.rightShoulder, MOVENET_KEYPOINT.rightHip, landmarkIndex];
  const [shoulder, hip, knee] = indices.map((index) => pose.keypoints[index]);
  window.push({ timestampMs: signal.timestampMs, ratio: signal.ratio, confidence: signal.confidence, quality: signal.quality, corroborated: Boolean(signal.corroborated), geometricRatio: signal.geometricRatio ?? null, supportRatio: signal.supportRatio ?? null, held: false, shoulderY: shoulder?.y ?? null, hipY: hip?.y ?? null, kneeY: knee?.y ?? null });
  const newest = signal.timestampMs;
  while (window.length && newest - window[0].timestampMs > 1000) window.shift();
}
function recoverFromWindow(state: LegCounterState, window: TemporalSample[], current: KneeSignal, context: Parameters<typeof recoverLegPeak>[2]) {
  const ignored: RecoveryDecision = { attempted: false, accepted: false, estimatedPeakRatio: null, gapMs: null, reason: null };
  if (!current.valid || current.ratio === null || current.held || state.phase !== "READY") return { state, event: null, decision: ignored };
  const peakSide = window.at(-1); const riseSide = window.at(-2);
  if (!peakSide || !riseSide) return { state, event: null, decision: ignored };
  const gapMs = current.timestampMs - peakSide.timestampMs;
  const beforeGapMs = peakSide.timestampMs - riseSide.timestampMs;
  const attempted = { attempted: true, accepted: false, estimatedPeakRatio: null, gapMs, reason: null } satisfies RecoveryDecision;
  if (current.enterThreshold >= 0) return { state, event: null, decision: { ...attempted, reason: "GEOMETRIC_ZERO_REQUIRES_OBSERVED_CROSSING" } };
  if (gapMs <= 0 || gapMs > 150 || beforeGapMs <= 0 || beforeGapMs > 150) return { state, event: null, decision: { ...attempted, reason: "GAP_OUT_OF_RANGE" } };
  const risingVelocity = (peakSide.ratio - riseSide.ratio) / beforeGapMs;
  const fallingVelocity = (current.ratio - peakSide.ratio) / gapMs;
  if (risingVelocity < .0006 || fallingVelocity > -.0006) return { state, event: null, decision: { ...attempted, reason: "NO_CLEAR_PEAK" } };
  if (peakSide.ratio < current.enterThreshold - .10) return { state, event: null, decision: { ...attempted, reason: "TOO_FAR_FROM_THRESHOLD" } };
  const corroborated = Boolean(current.corroborated);
  if (!corroborated) return { state, event: null, decision: { ...attempted, reason: "NO_SUPPORT" } };
  const estimatedPeakRatio = peakSide.ratio + Math.min(.15, risingVelocity * gapMs / 2);
  if (estimatedPeakRatio < current.enterThreshold) return { state, event: null, decision: { ...attempted, estimatedPeakRatio, reason: "ESTIMATE_BELOW_THRESHOLD" } };
  const recovered = recoverLegPeak(state, { leg: current.leg, timestampMs: current.timestampMs, estimatedPeakRatio, confidence: Math.min(peakSide.confidence, current.confidence) }, context);
  return { state: recovered.state, event: recovered.event, decision: { ...attempted, accepted: Boolean(recovered.event), estimatedPeakRatio, reason: recovered.event ? "TRAJECTORY" : "INTERVAL_OR_STATE" } };
}
function toPersonPose(candidate: PoseCandidate, participantId: string): PersonPose { return { ...candidate.pose, trackId: candidate.pose.detectorTrackId ?? participantId, centerX: candidate.centerX, normalizedBoundingBox: candidate.pose.boundingBox }; }
