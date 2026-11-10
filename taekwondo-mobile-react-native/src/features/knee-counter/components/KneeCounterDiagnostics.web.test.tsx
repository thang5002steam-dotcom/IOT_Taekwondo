import { render } from "@testing-library/react-native";
import { KneeCounterDiagnostics } from "./KneeCounterDiagnostics.web";
import type { ComputeCapabilities } from "../types/kneeCounter.types";

const mockGpuCapabilities: ComputeCapabilities = {
  webglSupported: true,
  webgpuSupported: true,
  webgpuAdapterAvailable: true,
  gpuVendor: "Google Inc.",
  gpuRenderer: "ANGLE (NVIDIA)",
  cudaStatus: "NOT_DETECTABLE_IN_BROWSER",
  hardwareAccelerationVerified: null,
  selectedBackend: "webgl",
  inferenceFps: 30,
  p50LatencyMs: 15,
  p95LatencyMs: 25,
  modelInputSize: 448,
  runtime: "worker",
};

const mockCpuFallbackCapabilities: ComputeCapabilities = {
  webglSupported: false,
  webgpuSupported: false,
  webgpuAdapterAvailable: false,
  gpuVendor: null,
  gpuRenderer: null,
  cudaStatus: "NOT_DETECTABLE_IN_BROWSER",
  hardwareAccelerationVerified: null,
  selectedBackend: "wasm",
  inferenceFps: 10,
  p50LatencyMs: 80,
  p95LatencyMs: 120,
  modelInputSize: 448,
  runtime: "worker",
};

describe("KneeCounterDiagnostics", () => {
  it("renders GPU backend info when GPU is available", async () => {
    const screen = await render(
      <KneeCounterDiagnostics capabilities={mockGpuCapabilities} />
    );
    expect(screen.getByText(/Backend: webgl \(GPU\)/)).toBeTruthy();
    expect(screen.getByText(/WebGL: Có/)).toBeTruthy();
  });

  it("renders CPU fallback info when running on wasm", async () => {
    const screen = await render(
      <KneeCounterDiagnostics capabilities={mockCpuFallbackCapabilities} />
    );
    expect(screen.getByText(/Backend: wasm \(CPU - Fallback\)/)).toBeTruthy();
    expect(screen.getByText(/WebGL: Không/)).toBeTruthy();
  });
});
