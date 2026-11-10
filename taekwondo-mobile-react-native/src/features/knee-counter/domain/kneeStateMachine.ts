import type { KneeCounterSessionConfig, KneeSignal, LegCounterState, RepEvent } from "../types/kneeCounter.types";

export const initialLegCounterState = (): LegCounterState => ({ phase: "NEEDS_DOWN", reps: 0, lastValidAtMs: null, lastRepAtMs: null, crossedAtMs: null, peakRatio: null, peakConfidence: 0, droppedSamples: 0, sequence: 0, pendingDirection: null, pendingSinceMs: null, pendingSamples: 0 });
export const resetPendingCycle = (state: LegCounterState): LegCounterState => ({ ...state, phase: "NEEDS_DOWN", crossedAtMs: null, peakRatio: null, peakConfidence: 0, pendingDirection: null, pendingSinceMs: null, pendingSamples: 0 });
export type LegCounterContext = Omit<RepEvent, "id" | "leg" | "crossedAtMs" | "completedAtMs" | "peakRatio" | "confidence" | "result"> & { sessionId: string; config: KneeCounterSessionConfig };

export function advanceLegState(state: LegCounterState, signal: KneeSignal, context: LegCounterContext): { state: LegCounterState; event: RepEvent | null } {
  if (!signal.valid || signal.ratio === null) {
    const next = { ...state, droppedSamples: state.droppedSamples + 1, pendingDirection: null, pendingSinceMs: null, pendingSamples: 0 };
    return { state: next.lastValidAtMs !== null && signal.timestampMs - next.lastValidAtMs > context.config.maxSignalGapMs ? resetPendingCycle(next) : next, event: null };
  }
  const recovered = state.lastValidAtMs !== null && signal.timestampMs - state.lastValidAtMs > context.config.maxSignalGapMs ? resetPendingCycle(state) : state;
  const nextBase = { ...recovered, lastValidAtMs: signal.timestampMs, droppedSamples: 0 };
  if (recovered.phase === "NEEDS_DOWN") {
    const transition = confirmTransition(nextBase, "DOWN", signal.ratio <= signal.exitThreshold, signal, context.config);
    return { state: transition.confirmed ? { ...transition.state, phase: "READY" } : transition.state, event: null };
  }
  if (recovered.phase === "READY") {
    const transition = confirmTransition(nextBase, "UP", signal.ratio >= signal.enterThreshold, signal, context.config);
    if (!transition.confirmed) return { state: transition.state, event: null };
    if (recovered.lastRepAtMs !== null && signal.timestampMs - recovered.lastRepAtMs < context.config.minRepIntervalMs) return { state: { ...transition.state, phase: "ABOVE", crossedAtMs: signal.timestampMs, peakRatio: signal.ratio, peakConfidence: signal.confidence }, event: null };
    const sequence = recovered.sequence + 1;
    const event: RepEvent = { ...context, id: `${context.sessionId}:${context.laneId}:${signal.leg}:${sequence}`, leg: signal.leg, crossedAtMs: signal.timestampMs, completedAtMs: signal.timestampMs, peakRatio: signal.ratio, confidence: signal.confidence, result: "CONFIRMED" };
    return { state: { ...transition.state, phase: "ABOVE", reps: recovered.reps + 1, sequence, lastRepAtMs: signal.timestampMs, crossedAtMs: signal.timestampMs, peakRatio: signal.ratio, peakConfidence: signal.confidence }, event };
  }
  if (signal.ratio > signal.exitThreshold) return { state: { ...nextBase, peakRatio: Math.max(recovered.peakRatio ?? signal.ratio, signal.ratio), pendingDirection: null, pendingSinceMs: null, pendingSamples: 0 }, event: null };
  const transition = confirmTransition(nextBase, "DOWN", true, signal, context.config);
  return { state: transition.confirmed ? { ...transition.state, phase: "READY", crossedAtMs: null, peakRatio: null, peakConfidence: 0 } : transition.state, event: null };
}

/**
 * Confirms a very short peak that fell between two MoveNet results. The caller
 * has already established a rising and then falling trajectory; this guard only
 * owns the counter state and duplicate protection.
 */
export function recoverLegPeak(
  state: LegCounterState,
  recovery: { leg: KneeSignal["leg"]; timestampMs: number; estimatedPeakRatio: number; confidence: number },
  context: LegCounterContext,
): { state: LegCounterState; event: RepEvent | null } {
  if (state.phase !== "READY") return { state, event: null };
  if (recovery.estimatedPeakRatio < context.config.thresholdPercent / 100) return { state, event: null };
  if (state.lastRepAtMs !== null && recovery.timestampMs - state.lastRepAtMs < context.config.minRepIntervalMs)
    return { state, event: null };
  const sequence = state.sequence + 1;
  const event: RepEvent = {
    ...context,
    id: `${context.sessionId}:${context.laneId}:${recovery.leg}:${sequence}`,
    leg: recovery.leg,
    crossedAtMs: recovery.timestampMs,
    completedAtMs: recovery.timestampMs,
    peakRatio: recovery.estimatedPeakRatio,
    confidence: recovery.confidence,
    result: "RECOVERED",
  };
  return {
    state: {
      ...state,
      phase: "ABOVE",
      reps: state.reps + 1,
      sequence,
      lastRepAtMs: recovery.timestampMs,
      crossedAtMs: recovery.timestampMs,
      peakRatio: recovery.estimatedPeakRatio,
      peakConfidence: recovery.confidence,
      pendingDirection: null,
      pendingSinceMs: null,
      pendingSamples: 0,
    },
    event,
  };
}

function confirmTransition(state: LegCounterState, direction: "UP" | "DOWN", crossed: boolean, signal: KneeSignal, config: KneeCounterSessionConfig) {
  if (!crossed) return { state: { ...state, pendingDirection: null, pendingSinceMs: null, pendingSamples: 0 }, confirmed: false };
  if (signal.held) return { state, confirmed: false };
  if (direction === "UP" && signal.quality === "weak" && !signal.confirmationReason) return { state: { ...state, pendingDirection: null, pendingSinceMs: null, pendingSamples: 0 }, confirmed: false };
  if (signal.quality === "trusted" || config.weakConfirmationSamples <= 1) return { state: { ...state, pendingDirection: null, pendingSinceMs: null, pendingSamples: 0 }, confirmed: true };
  const continued = state.pendingDirection === direction && state.pendingSinceMs !== null && signal.timestampMs - state.pendingSinceMs <= config.weakConfirmationWindowMs;
  const pendingSamples = continued ? state.pendingSamples + 1 : 1;
  const next = { ...state, pendingDirection: direction, pendingSinceMs: continued ? state.pendingSinceMs : signal.timestampMs, pendingSamples };
  return { state: pendingSamples >= config.weakConfirmationSamples ? { ...next, pendingDirection: null, pendingSinceMs: null, pendingSamples: 0 } : next, confirmed: pendingSamples >= config.weakConfirmationSamples };
}
