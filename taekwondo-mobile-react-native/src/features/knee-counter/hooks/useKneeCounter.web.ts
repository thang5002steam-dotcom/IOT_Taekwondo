import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createKneeCounterWorker } from "../ai/createKneeCounterWorker.web";
import { createKneeAnalysisWorker } from "../ai/createKneeAnalysisWorker.web";
import type { KneeAnalysisWorkerResponse } from "../ai/kneeAnalysisWorkerProtocol";
import { detectComputeCapabilities } from "../ai/gpuCapabilities.web";
import type { KneeWorkerResponse } from "../ai/kneeWorkerProtocol";
import { MainThreadKneeRuntime } from "../ai/mainThreadKneeRuntime.web";
import { DEFAULT_KNEE_COUNTER_CONFIG } from "../config/kneeCounterConfig";
import {
  countCurrentGroupPass,
  isSynchronizedGroup,
} from "../domain/groupEvaluator";
import { RepEventLedger } from "../domain/repEventLedger";
import type {
  ComputeCapabilities,
  AnkleReviewCandidate,
  KneeCounterSessionConfig,
  ParticipantSlot,
  KneeTraceSample,
  RepEvent,
  SessionMetrics,
  SessionStatus,
  CameraFpsRange,
} from "../types/kneeCounter.types";

const EMPTY_METRICS: SessionMetrics = {
  cameraFps: null,
  inferenceFps: null,
  averageLatencyMs: null,
  p50LatencyMs: null,
  p95LatencyMs: null,
  processedFrames: 0,
  droppedFrames: 0,
  invalidSignalRate: null,
  idSwitches: 0,
  laneConflicts: 0,
  videoCallbackFps: null,
  videoFrameGapMs: null,
  presentedFrames: null,
  droppedVideoFrames: null,
  workerBusyDrops: 0,
};
export type UseKneeCounterOptions = {
  onFallbackToCpu?: (reason: string) => void;
  requestedCameraFps?: number;
};
type VideoFrameMeta = { frameId: number; timestampMs: number; captureTimestampMs: number; mediaTime: number | null; purpose: "benchmark" | "preview" | "count" };

export function useKneeCounter(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  options?: UseKneeCounterOptions,
) {
  const [config, setConfig] = useState<KneeCounterSessionConfig>(
    DEFAULT_KNEE_COUNTER_CONFIG,
  );
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<ComputeCapabilities | null>(
    null,
  );
  const [fallbackToCpu, setFallbackToCpu] = useState(false);
  const [slots, setSlots] = useState<ParticipantSlot[]>([]);
  const [trace, setTrace] = useState<KneeTraceSample[]>([]);
  const [events, setEvents] = useState<RepEvent[]>([]);
  const [reviewCandidates, setReviewCandidates] = useState<AnkleReviewCandidate[]>([]);
  const [metrics, setMetrics] = useState<SessionMetrics>(EMPTY_METRICS);
  const workerRef = useRef<Worker | null>(null);
  const analysisWorkerRef = useRef<Worker | null>(null);
  const mainRuntimeRef = useRef<MainThreadKneeRuntime | null>(null);
  const stopLoopRef = useRef<(() => void) | null>(null);
  const inFlightRef = useRef(false);
  const latestFrameRef = useRef<VideoFrameMeta | null>(null);
  const processLatestFrameRef = useRef<(() => void) | null>(null);
  const frameSequenceRef = useRef(0);
  const submittedFramesRef = useRef(0);
  const completedFramesRef = useRef(0);
  const replacedFramesRef = useRef(0);
  const cameraFrameTimesRef = useRef<number[]>([]);
  const droppedFramesRef = useRef(0);
  const countingRef = useRef(false);
  const workerReadyRef = useRef(false);
  const analysisReadyRef = useRef(false);
  const ledgerRef = useRef(new RepEventLedger());
  const sessionIdRef = useRef("");
  const sessionStartedAtRef = useRef("");
  const capabilitiesRef = useRef<ComputeCapabilities | null>(null);
  const hasNotifiedFallbackRef = useRef(false);
  const onFallbackToCpuRef = useRef(options?.onFallbackToCpu);
  const requestedCameraFpsRef = useRef(options?.requestedCameraFps ?? null);

  useEffect(() => {
    onFallbackToCpuRef.current = options?.onFallbackToCpu;
    requestedCameraFpsRef.current = options?.requestedCameraFps ?? null;
  }, [options?.onFallbackToCpu, options?.requestedCameraFps]);

  const notifyCpuFallback = useCallback((customReason?: string) => {
    setFallbackToCpu(true);
    if (hasNotifiedFallbackRef.current) return;
    hasNotifiedFallbackRef.current = true;
    const caps = capabilitiesRef.current;
    const noGpuHardware = caps && !caps.webglSupported && !caps.webgpuAdapterAvailable;
    const defaultReason = noGpuHardware
      ? "Không phát hiện GPU hỗ trợ. Đã chuyển sang xử lý bằng CPU (WASM), hiệu năng có thể bị giảm."
      : "Không thể sử dụng GPU hoặc khởi tạo GPU thất bại. Đã chuyển sang xử lý bằng CPU (WASM).";
    onFallbackToCpuRef.current?.(customReason ?? defaultReason);
  }, []);

  const dispose = useCallback(() => {
    stopLoopRef.current?.();
    stopLoopRef.current = null;
    inFlightRef.current = false;
    latestFrameRef.current = null;
    processLatestFrameRef.current = null;
    cameraFrameTimesRef.current = [];
    droppedFramesRef.current = 0;
    submittedFramesRef.current = 0;
    completedFramesRef.current = 0;
    replacedFramesRef.current = 0;
    workerRef.current?.postMessage({ type: "dispose" });
    workerRef.current?.terminate();
    workerRef.current = null;
    analysisWorkerRef.current?.postMessage({ type: "dispose" });
    analysisWorkerRef.current?.terminate();
    analysisWorkerRef.current = null;
    mainRuntimeRef.current?.dispose();
    mainRuntimeRef.current = null;
  }, []);
  const publish = useCallback(
    (message: Extract<KneeAnalysisWorkerResponse, { type: "frame-result" }> | Extract<KneeWorkerResponse, { type: "frame-result" }>) => {
      setSlots(message.lanes);
      if ("reviewCandidates" in message) setReviewCandidates(message.reviewCandidates);
      const frameTimes = cameraFrameTimesRef.current;
      const elapsed = frameTimes.length > 1 ? frameTimes.at(-1)! - frameTimes[0] : 0;
      const cameraFps = elapsed > 0 ? Math.round((frameTimes.length - 1) * 10000 / elapsed) / 10 : null;
      const frameGaps = frameTimes.slice(1).map((time, index) => time - frameTimes[index]);
      const video = videoRef.current;
      const track = video?.srcObject instanceof MediaStream ? video.srcObject.getVideoTracks()[0] : null;
      const settings = track?.getSettings() ?? null;
      const capabilities = track?.getCapabilities?.();
      const quality = video?.getVideoPlaybackQuality?.();
      const capabilityFrameRate: CameraFpsRange = {
        min: typeof capabilities?.frameRate?.min === "number" ? capabilities.frameRate.min : null,
        max: typeof capabilities?.frameRate?.max === "number" ? capabilities.frameRate.max : null,
      };
      const measured = {
        ...message.metrics,
        cameraFps,
        videoCallbackFps: cameraFps,
        videoFrameGapMs: frameGaps.length ? Math.round(frameGaps.reduce((sum, gap) => sum + gap, 0) / frameGaps.length * 10) / 10 : null,
        presentedFrames: quality?.totalVideoFrames ?? null,
        droppedVideoFrames: quality?.droppedVideoFrames ?? null,
        workerBusyDrops: replacedFramesRef.current,
        droppedFrames: replacedFramesRef.current,
        inferenceSubmittedFrames: submittedFramesRef.current,
        inferenceReplacedFrames: replacedFramesRef.current,
        inferenceCompletedFrames: completedFramesRef.current,
      };
      setMetrics(measured);
      if (message.trace) {
        setTrace((previous) => [...previous, ...message.trace!.map((sample) => sample.algorithmVersion >= 3 ? { ...sample, camera: { width: settings?.width ?? video?.videoWidth ?? 0, height: settings?.height ?? video?.videoHeight ?? 0, frameRate: settings?.frameRate ?? null, requestedFrameRate: requestedCameraFpsRef.current, capabilityFrameRate, actualFrameRate: cameraFps, presentedFrames: quality?.totalVideoFrames ?? null, droppedVideoFrames: quality?.droppedVideoFrames ?? null }, runtime: { cameraFps, inferenceFps: measured.inferenceFps, averageLatencyMs: measured.averageLatencyMs, droppedFrames: measured.droppedFrames, videoCallbackFps: measured.videoCallbackFps, videoFrameGapMs: measured.videoFrameGapMs, presentedFrames: measured.presentedFrames, droppedVideoFrames: measured.droppedVideoFrames, workerBusyDrops: measured.workerBusyDrops, executionMode: measured.executionMode, bitmapLatencyMs: measured.bitmapLatencyMs, queueWaitMs: measured.queueWaitMs, inferenceLatencyMs: measured.inferenceLatencyMs, analysisLatencyMs: measured.analysisLatencyMs, frameAgeMs: measured.frameAgeMs, inferenceSubmittedFrames: measured.inferenceSubmittedFrames, inferenceReplacedFrames: measured.inferenceReplacedFrames, inferenceCompletedFrames: measured.inferenceCompletedFrames } } : sample)].slice(-20_000));
      }
      if (message.events.length)
        setEvents(ledgerRef.current.append(message.events));
    },
    [videoRef],
  );
  const sendFrame = useCallback(
    async (meta: VideoFrameMeta) => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;
      if (inFlightRef.current) {
        if (latestFrameRef.current) replacedFramesRef.current += 1;
        latestFrameRef.current = meta;
        droppedFramesRef.current = replacedFramesRef.current;
        return;
      }
      inFlightRef.current = true;
      try {
        if (workerRef.current) {
          const bitmapStartedAt = performance.now();
          const frame = await createImageBitmap(video);
          const payload = { frame, ...meta, bitmapLatencyMs: performance.now() - bitmapStartedAt, dispatchedAtMs: performance.now(), width: video.videoWidth, height: video.videoHeight };
          if (workerRef.current) { submittedFramesRef.current += 1; workerRef.current.postMessage({ type: "frame", ...payload }, [frame]); }
          else { frame.close(); inFlightRef.current = false; }
          return;
        }
        submittedFramesRef.current += 1;
        const result = await mainRuntimeRef.current?.process(video, meta.timestampMs, meta.purpose === "count");
        if (result) publish({ type: "frame-result", timestampMs: meta.timestampMs, ...result });
      } catch (cause) {
        inFlightRef.current = false;
        setError(cause instanceof Error ? cause.message : "Không thể đọc camera.");
      } finally {
        if (!workerRef.current) {
          inFlightRef.current = false;
          processLatestFrameRef.current?.();
        }
      }
    },
    [publish, videoRef],
  );
  const processLatestFrame = useCallback(() => {
    if (inFlightRef.current) return;
    const pending = latestFrameRef.current;
    if (!pending) return;
    latestFrameRef.current = null;
    const video = videoRef.current;
    void sendFrame({ ...pending, timestampMs: performance.now(), captureTimestampMs: performance.now(), mediaTime: video?.currentTime ?? null });
  }, [sendFrame, videoRef]);
  useEffect(() => {
    processLatestFrameRef.current = processLatestFrame;
    return () => { processLatestFrameRef.current = null; };
  }, [processLatestFrame]);
  const completeFrame = useCallback(() => {
    inFlightRef.current = false;
    completedFramesRef.current += 1;
    processLatestFrame();
  }, [processLatestFrame]);
  const startLoop = useCallback(
    (purpose: "preview" | "count") => {
      const video = videoRef.current;
      if (!video) return;
      let stopped = false;
      let raf = 0;
      let videoHandle = 0;
      const rich = video as HTMLVideoElement & {
        requestVideoFrameCallback?: (callback: (now: number, metadata: { mediaTime?: number }) => void) => number;
        cancelVideoFrameCallback?: (handle: number) => void;
      };
      const tick = (time: number, metadata?: { mediaTime?: number }) => {
        if (stopped) return;
        cameraFrameTimesRef.current = [...cameraFrameTimesRef.current.filter((value) => time - value <= 3000), time];
        frameSequenceRef.current += 1;
        void sendFrame({ frameId: frameSequenceRef.current, timestampMs: time, captureTimestampMs: time, mediaTime: metadata?.mediaTime ?? video.currentTime ?? null, purpose });
        if (rich.requestVideoFrameCallback)
          videoHandle = rich.requestVideoFrameCallback(tick);
        else raf = requestAnimationFrame(tick);
      };
      tick(performance.now());
      stopLoopRef.current = () => {
        stopped = true;
        if (raf) cancelAnimationFrame(raf);
        if (videoHandle) rich.cancelVideoFrameCallback?.(videoHandle);
      };
    },
    [sendFrame, videoRef],
  );
  const updateConfig = useCallback(
    (patch: Partial<KneeCounterSessionConfig>) => {
      if (countingRef.current) {
        countingRef.current = false;
        stopLoopRef.current?.();
        workerRef.current?.postMessage({ type: "pause" });
        analysisWorkerRef.current?.postMessage({ type: "pause" });
        workerRef.current?.postMessage({ type: "reset-pending-cycle" });
        analysisWorkerRef.current?.postMessage({ type: "reset-pending-cycle" });
        mainRuntimeRef.current?.resetPendingCycles();
        setStatus("aligning");
        startLoop("preview");
      }
      setConfig((current) => {
        const next = { ...current, ...patch };
        workerRef.current?.postMessage({ type: "update-config", config: next });
        analysisWorkerRef.current?.postMessage({ type: "update-config", config: next });
        mainRuntimeRef.current?.updateConfig(next);
        return next;
      });
    },
    [startLoop],
  );
  const fallbackToMainThread = useCallback(async () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    analysisWorkerRef.current?.postMessage({ type: "dispose" });
    analysisWorkerRef.current?.terminate();
    analysisWorkerRef.current = null;
    inFlightRef.current = false;
    const runtime = new MainThreadKneeRuntime(
      config,
      sessionIdRef.current,
      sessionStartedAtRef.current,
    );
    const ready = await runtime.init(
      config.backendPreference,
      capabilitiesRef.current
        ? {
            webglSupported: capabilitiesRef.current.webglSupported,
            webgpuAdapterAvailable:
              capabilitiesRef.current.webgpuAdapterAvailable,
          }
        : undefined,
    );
    mainRuntimeRef.current = runtime;
    setCapabilities((current) =>
      current
        ? {
            ...current,
            selectedBackend: ready.backend,
            modelInputSize: ready.inputSize,
            runtime: "main-thread",
          }
        : current,
    );
    if (ready.fallbackToCpu || ready.backend === "wasm") {
      notifyCpuFallback();
    }
    setStatus("aligning");
    startLoop("preview");
  }, [config, notifyCpuFallback, startLoop]);
  const start = useCallback(async () => {
    if (!videoRef.current) return;
    dispose();
    workerReadyRef.current = false;
    analysisReadyRef.current = false;
    hasNotifiedFallbackRef.current = false;
    setFallbackToCpu(false);
    setError(null);
    setSlots([]);
    setTrace([]);
    setEvents([]);
    setReviewCandidates([]);
    setMetrics(EMPTY_METRICS);
    ledgerRef.current.clear();
    sessionIdRef.current = crypto.randomUUID();
    sessionStartedAtRef.current = new Date().toISOString();
    setStatus("loading-model");
    try {
      const caps = await detectComputeCapabilities();
      capabilitiesRef.current = caps;
      setCapabilities(caps);
      const analysisWorker = createKneeAnalysisWorker(
        (message) => {
          if (message.type === "analysis-ready") analysisReadyRef.current = true;
          else if (message.type === "frame-result") publish(message);
          else if (message.type === "review-resolved") { setSlots(message.lanes); setReviewCandidates(message.reviewCandidates); if (message.events.length) setEvents(ledgerRef.current.append(message.events)); }
          else if (message.type === "error") void fallbackToMainThread();
        },
        () => { void fallbackToMainThread(); },
      );
      analysisWorkerRef.current = analysisWorker;
      analysisWorker.postMessage({ type: "init", sessionId: sessionIdRef.current, sessionStartedAt: sessionStartedAtRef.current, config });
      const worker = createKneeCounterWorker(
        (message) => {
          if (message.type === "detector-ready") {
            workerReadyRef.current = true;
            setCapabilities((current) =>
              current
                ? {
                    ...current,
                    selectedBackend: message.backend,
                    modelInputSize: message.inputSize,
                    runtime: "worker",
                  }
                : current,
            );
            if (message.fallbackToCpu || message.backend === "wasm") {
              notifyCpuFallback();
            }
            setStatus("benchmarking");
            frameSequenceRef.current += 1;
            const now = performance.now();
            void sendFrame({ frameId: frameSequenceRef.current, timestampMs: now, captureTimestampMs: now, mediaTime: videoRef.current?.currentTime ?? null, purpose: "benchmark" });
          } else if (message.type === "runtime-ready") {
            if (!analysisReadyRef.current) {
              void fallbackToMainThread();
              return;
            }
            setMetrics(message.metrics);
            if (message.fallbackToCpu || message.backend === "wasm") {
              notifyCpuFallback();
            }
            setStatus("aligning");
            startLoop("preview");
          } else if (message.type === "pose-result") {
            analysisWorkerRef.current?.postMessage({ type: "poses", frame: message });
          } else if (message.type === "frame-result") publish(message);
          else if (message.type === "frame-complete") completeFrame();
          else if (message.type === "error") void fallbackToMainThread();
        },
        () => {
          void fallbackToMainThread();
        },
      );
      workerRef.current = worker;
      worker.postMessage({
        type: "init",
        sessionId: sessionIdRef.current,
        sessionStartedAt: sessionStartedAtRef.current,
        config,
        backendPreference: config.backendPreference,
        capabilities: {
          webglSupported: caps.webglSupported,
          webgpuAdapterAvailable: caps.webgpuAdapterAvailable,
        },
      });
      window.setTimeout(() => {
        if (workerRef.current === worker && !workerReadyRef.current)
          void fallbackToMainThread();
      }, 10_000);
    } catch {
      await fallbackToMainThread();
    }
  }, [completeFrame, config, dispose, fallbackToMainThread, notifyCpuFallback, publish, sendFrame, startLoop, videoRef]);
  const pause = useCallback(() => {
    if (status !== "running") return;
    countingRef.current = false;
    stopLoopRef.current?.();
    workerRef.current?.postMessage({ type: "pause" });
    analysisWorkerRef.current?.postMessage({ type: "pause" });
    setStatus("paused");
  }, [status]);
  const resume = useCallback(() => {
    if (status !== "paused") return;
    workerRef.current?.postMessage({ type: "resume" });
    analysisWorkerRef.current?.postMessage({ type: "resume" });
    workerRef.current?.postMessage({ type: "reset-pending-cycle" });
    analysisWorkerRef.current?.postMessage({ type: "reset-pending-cycle" });
    mainRuntimeRef.current?.resetPendingCycles();
    setStatus("aligning");
    startLoop("preview");
  }, [startLoop, status]);
  const beginCounting = useCallback(() => {
    if (status !== "aligning") return;
    setStatus("countdown");
  }, [status]);
  const completeCountdown = useCallback(() => {
    if (status !== "countdown") return;
    countingRef.current = true;
    workerRef.current?.postMessage({ type: "resume" });
    analysisWorkerRef.current?.postMessage({ type: "resume" });
    stopLoopRef.current?.();
    startLoop("count");
    setStatus("running");
  }, [startLoop, status]);
  const finish = useCallback(() => {
    if (status !== "running") return;
    countingRef.current = false;
    stopLoopRef.current?.();
    workerRef.current?.postMessage({ type: "pause" });
    analysisWorkerRef.current?.postMessage({ type: "pause" });
    workerRef.current?.postMessage({ type: "reset-pending-cycle" });
    analysisWorkerRef.current?.postMessage({ type: "reset-pending-cycle" });
    mainRuntimeRef.current?.resetPendingCycles();
    startLoop("preview");
    setStatus("finished");
  }, [startLoop, status]);
  const stop = useCallback(async () => {
    dispose();
    countingRef.current = false;
    setStatus("stopped");
  }, [dispose]);
  const reset = useCallback(() => {
    ledgerRef.current.clear();
    setEvents([]);
    setReviewCandidates([]);
    setSlots([]);
    setTrace([]);
    const sessionId = crypto.randomUUID();
    const sessionStartedAt = new Date().toISOString();
    sessionIdRef.current = sessionId;
    sessionStartedAtRef.current = sessionStartedAt;
    workerRef.current?.postMessage({
      type: "reset",
      sessionId,
      sessionStartedAt,
    });
    analysisWorkerRef.current?.postMessage({
      type: "reset",
      sessionId,
      sessionStartedAt,
    });
    mainRuntimeRef.current?.reset(sessionId, sessionStartedAt);
  }, []);
  const resetForLandmarkChange = useCallback(() => {
    countingRef.current = false;
    stopLoopRef.current?.();
    workerRef.current?.postMessage({ type: "pause" });
    analysisWorkerRef.current?.postMessage({ type: "pause" });
    workerRef.current?.postMessage({ type: "reset-pending-cycle" });
    analysisWorkerRef.current?.postMessage({ type: "reset-pending-cycle" });
    mainRuntimeRef.current?.resetPendingCycles();
    reset();
    if (workerRef.current || analysisWorkerRef.current || mainRuntimeRef.current) {
      setStatus("aligning");
      startLoop("preview");
    }
  }, [reset, startLoop]);
  const restart = useCallback(() => {
    if (status !== "finished") return;
    reset();
    setStatus("countdown");
  }, [reset, status]);
  const resolveAnkleReview = useCallback((id: string, decision: "ACCEPT" | "REJECT") => {
    if (analysisWorkerRef.current) { analysisWorkerRef.current.postMessage({ type: "resolve-ankle-review", id, decision }); return; }
    const result = mainRuntimeRef.current?.resolveAnkleReview(id, decision); if (!result) return;
    setSlots(result.lanes); setReviewCandidates(result.reviewCandidates); if (result.event) setEvents(ledgerRef.current.append([result.event]));
  }, []);
  useEffect(() => () => dispose(), [dispose]);
  const detectedCount = useMemo(
    () => slots.filter((slot) => slot.pose).length,
    [slots],
  );
  const passCount = useMemo(() => countCurrentGroupPass(slots), [slots]);
  const latestEventAtMs = events.at(-1)?.crossedAtMs ?? 0;
  const synchronizedGroupPass = useMemo(
    () =>
      isSynchronizedGroup(
        events,
        slots.map((slot) => slot.laneId),
        latestEventAtMs,
        config.synchronizedWindowMs,
      ),
    [config.synchronizedWindowMs, events, latestEventAtMs, slots],
  );
  return {
    config,
    updateConfig,
    status,
    error,
    capabilities,
    slots,
    events,
    reviewCandidates,
    resolveAnkleReview,
    metrics,
    detectedCount,
    passCount,
    totalReps: events.length,
    groupPassCount: passCount,
    synchronizedGroupPass,
    trace,
    fallbackToCpu,
    start,
    stop,
    pause,
    resume,
    beginCounting,
    completeCountdown,
    finish,
    reset,
    resetForLandmarkChange,
    restart,
  };
}
