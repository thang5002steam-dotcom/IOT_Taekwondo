import type { RuntimeMetrics } from "../types/kneeCounter.types";
export class RuntimeMetricsCollector {
  private latencies: number[] = []; private timestamps: number[] = []; private processed = 0; private invalid = 0; private conflicts = 0;
  record(latencyMs: number, invalidSignals: number, conflicts: number, completedAtMs = performance.now()): RuntimeMetrics {
    this.latencies = [...this.latencies, latencyMs].slice(-60); this.processed += 1; this.invalid += invalidSignals; this.conflicts += conflicts;
    this.timestamps = [...this.timestamps.filter((time) => completedAtMs - time <= 3000), completedAtMs];
    const sorted = [...this.latencies].sort((a, b) => a - b); const p = (ratio: number) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))] ?? 0;
    const average = this.latencies.reduce((sum, value) => sum + value, 0) / Math.max(1, this.latencies.length);
    const first = this.timestamps[0]; const elapsed = completedAtMs - first;
    const fps = this.timestamps.length >= 2 && elapsed > 0 ? Math.round((this.timestamps.length - 1) * 10000 / elapsed) / 10 : null;
    return { cameraFps: null, inferenceFps: fps, averageLatencyMs: Math.round(average * 10) / 10, p50LatencyMs: Math.round(p(.5) * 10) / 10, p95LatencyMs: Math.round(p(.95) * 10) / 10, processedFrames: this.processed, droppedFrames: 0, invalidSignalRate: this.processed ? this.invalid / (this.processed * 2) : null, idSwitches: 0, laneConflicts: this.conflicts };
  }
}
