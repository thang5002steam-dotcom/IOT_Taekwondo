/// <reference lib="webworker" />

import { LaneManager, deduplicateCandidates, poseToCandidate } from "../domain/laneManager";
import type { KneeAnalysisWorkerRequest, KneeAnalysisWorkerResponse } from "./kneeAnalysisWorkerProtocol";
import type { KneeCounterSessionConfig } from "../types/kneeCounter.types";

const worker = self as unknown as DedicatedWorkerGlobalScope;
let laneManager: LaneManager | null = null;
let sessionId = "";
let sessionStartedAt = "";
let paused = false;
let config: KneeCounterSessionConfig | null = null;

const emit = (message: KneeAnalysisWorkerResponse) => worker.postMessage(message);

function initialize(message: Extract<KneeAnalysisWorkerRequest, { type: "init" }>) {
  sessionId = message.sessionId;
  sessionStartedAt = message.sessionStartedAt;
  config = message.config;
  paused = false;
  laneManager = new LaneManager(config);
  emit({ type: "analysis-ready" });
}

function processPoses(message: Extract<KneeAnalysisWorkerRequest, { type: "poses" }>) {
  try {
    if (!laneManager) throw new Error("Analysis worker chưa sẵn sàng.");
    if (paused && message.frame.purpose === "count") return;
    const started = performance.now();
    const candidates = deduplicateCandidates(
      message.frame.poses.map(poseToCandidate).filter((candidate): candidate is NonNullable<typeof candidate> => candidate !== null),
    );
    const result = laneManager.update(candidates, message.frame.timestampMs, message.frame.purpose === "count", {
      sessionId,
      sessionStartedAt,
      backend: message.frame.backend,
      inputSize: message.frame.inputSize,
      frame: {
        frameId: message.frame.frameId,
        captureTimestampMs: message.frame.captureTimestampMs,
        mediaTime: message.frame.mediaTime,
      },
    });
    emit({
      type: "frame-result",
      frameId: message.frame.frameId,
      timestampMs: message.frame.timestampMs,
      lanes: result.lanes,
      events: result.events,
      reviewCandidates: "reviewCandidates" in result ? result.reviewCandidates : [],
      trace: result.traceDelta,
      metrics: {
        ...message.frame.metrics,
        analysisLatencyMs: Math.round((performance.now() - started) * 10) / 10,
        frameAgeMs: Math.round(Math.max(0, performance.now() - message.frame.captureTimestampMs) * 10) / 10,
      },
    });
  } catch (error) {
    emit({ type: "error", code: "ANALYSIS_FAILED", message: error instanceof Error ? error.message : "Không thể phân tích chuyển động." });
  }
}

worker.onmessage = ({ data }: MessageEvent<KneeAnalysisWorkerRequest>) => {
  if (data.type === "init") initialize(data);
  else if (data.type === "poses") processPoses(data);
  else if (data.type === "pause") paused = true;
  else if (data.type === "resume") paused = false;
  else if (data.type === "reset") {
    sessionId = data.sessionId;
    sessionStartedAt = data.sessionStartedAt;
    if (config) laneManager = new LaneManager(config);
  } else if (data.type === "update-config") { config = data.config; laneManager?.updateConfig(data.config); }
  else if (data.type === "reset-pending-cycle") laneManager?.resetPendingCycles();
  else if (data.type === "resolve-ankle-review" && laneManager) {
    const resolved = laneManager.resolveReviewCandidate(data.id, data.decision, { sessionId, sessionStartedAt, backend: null, inputSize: null });
    emit({ type: "review-resolved", lanes: resolved.lanes, events: resolved.event ? [resolved.event] : [], reviewCandidates: resolved.reviewCandidates });
  }
  else if (data.type === "dispose") worker.close();
};
