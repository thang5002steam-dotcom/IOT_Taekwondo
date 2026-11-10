import type { ComputeCapabilities } from "../types/kneeCounter.types";

type WebGpuNavigator = Navigator & { gpu?: { requestAdapter: (options?: { powerPreference?: "high-performance" | "low-power" }) => Promise<unknown> } };

export async function detectComputeCapabilities(): Promise<ComputeCapabilities> {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ?? canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });
  let renderer: string | null = null;
  let vendor: string | null = null;
  if (gl) {
    const extension = gl.getExtension("WEBGL_debug_renderer_info");
    if (extension) {
      renderer = String(gl.getParameter(extension.UNMASKED_RENDERER_WEBGL));
      vendor = String(gl.getParameter(extension.UNMASKED_VENDOR_WEBGL));
    }
  }
  const webgpuSupported = typeof navigator !== "undefined" && "gpu" in navigator;
  let webgpuAdapterAvailable = false;
  if (webgpuSupported) {
    try {
      webgpuAdapterAvailable = Boolean(await (navigator as WebGpuNavigator).gpu?.requestAdapter({ powerPreference: "high-performance" }));
    } catch {
      webgpuAdapterAvailable = false;
    }
  }
  return {
    webglSupported: Boolean(gl),
    webgpuSupported,
    webgpuAdapterAvailable,
    gpuVendor: vendor,
    gpuRenderer: renderer,
    cudaStatus: "NOT_DETECTABLE_IN_BROWSER",
    hardwareAccelerationVerified: null,
    selectedBackend: null,
    inferenceFps: null,
    p50LatencyMs: null,
    p95LatencyMs: null,
    modelInputSize: null,
    runtime: null,
  };
}
