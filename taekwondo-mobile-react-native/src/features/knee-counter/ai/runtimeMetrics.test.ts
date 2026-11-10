import { RuntimeMetricsCollector } from "./runtimeMetrics";

it("reports completed frames per wall-clock second, not inverse model latency", () => {
  const metrics = new RuntimeMetricsCollector();
  metrics.record(20, 0, 0, 1000);
  metrics.record(20, 0, 0, 1100);
  const result = metrics.record(20, 0, 0, 1200);
  expect(result.inferenceFps).toBe(10);
  expect(result.averageLatencyMs).toBe(20);
  expect(result.processedFrames).toBe(3);
});
