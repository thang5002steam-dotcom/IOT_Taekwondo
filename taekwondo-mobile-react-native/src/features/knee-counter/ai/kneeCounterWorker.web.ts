/// <reference lib="webworker" />
import { backendOrder } from "./backendSelector.web";
import { createMoveNetRuntime, type MoveNetRuntime } from "./moveNetRuntime.web";
import { MAX_TRACKED_PEOPLE } from "../config/kneeCounterConfig";
import { RuntimeMetricsCollector } from "./runtimeMetrics";
import type { KneeWorkerRequest, KneeWorkerResponse } from "./kneeWorkerProtocol";
import type { ComputeBackend, KneeCounterSessionConfig } from "../types/kneeCounter.types";

const worker = self as unknown as DedicatedWorkerGlobalScope;
let runtime: MoveNetRuntime | null = null; let config: KneeCounterSessionConfig | null = null;
let backend: ComputeBackend | null = null; let paused = false; const metrics = new RuntimeMetricsCollector();
const emit = (message: KneeWorkerResponse) => worker.postMessage(message);

async function initialize(message: Extract<KneeWorkerRequest, { type: "init" }>) {
  dispose(); config = message.config;
  const capabilities = message.capabilities ?? {
    webglSupported: true,
    webgpuAdapterAvailable: Boolean((self as unknown as { navigator?: Navigator }).navigator?.gpu),
  };
  let lastError: unknown;
  for (const candidate of backendOrder(message.backendPreference, capabilities)) {
    try {
      runtime = await createMoveNetRuntime(candidate, 448, config);
      backend = candidate;
      emit({ type: "detector-ready", backend: candidate, inputSize: 448, fallbackToCpu: candidate === "wasm" });
      return;
    }
    catch (error) { lastError = error; runtime?.dispose(); runtime = null; }
  }
  throw lastError ?? new Error("Không thể tải MoveNet.");
}
async function processFrame(message: Extract<KneeWorkerRequest, { type: "frame" }>) {
  try {
    if (!runtime || !config || !backend) throw new Error("Worker chưa sẵn sàng.");
    if (paused && message.purpose === "count") return;
    const started = performance.now(); const poses = await runtime.estimate(message.frame, message.timestampMs, message.width, message.height, MAX_TRACKED_PEOPLE);
    const inferenceLatencyMs = performance.now() - started;
    const currentMetrics = { ...metrics.record(inferenceLatencyMs, 0, 0), executionMode: "worker" as const, bitmapLatencyMs: message.bitmapLatencyMs, queueWaitMs: Math.max(0, started - message.dispatchedAtMs), inferenceLatencyMs: Math.round(inferenceLatencyMs * 10) / 10 };
    if (message.purpose === "benchmark") emit({ type: "runtime-ready", backend, inputSize: runtime.inputSize, metrics: currentMetrics, fallbackToCpu: backend === "wasm" });
    else emit({ type: "pose-result", frameId: message.frameId, timestampMs: message.timestampMs, captureTimestampMs: message.captureTimestampMs, mediaTime: message.mediaTime, purpose: message.purpose, poses, backend, inputSize: runtime.inputSize, metrics: currentMetrics });
  } catch (error) { emit({ type: "error", code: "FRAME_FAILED", message: error instanceof Error ? error.message : "Không thể phân tích khung hình." }); }
  finally { message.frame.close(); emit({ type: "frame-complete", frameId: message.frameId }); }
}
function dispose() { runtime?.dispose(); runtime = null; backend = null; }
worker.onmessage = ({ data }: MessageEvent<KneeWorkerRequest>) => {
  if (data.type === "init") void initialize(data).catch((error) => emit({ type: "error", code: "INIT_FAILED", message: error instanceof Error ? error.message : "Không thể khởi tạo worker." }));
  else if (data.type === "frame") void processFrame(data);
  else if (data.type === "pause") paused = true;
  else if (data.type === "resume") paused = false;
  else if (data.type === "reset") { /* Session state belongs to the analysis worker. */ }
  else if (data.type === "update-config") { config = data.config; }
  else if (data.type === "reset-pending-cycle") { /* Session state belongs to the analysis worker. */ }
  else if (data.type === "dispose") { dispose(); worker.close(); }
};
