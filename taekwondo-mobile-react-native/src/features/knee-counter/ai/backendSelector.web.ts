import type { ComputeBackend, BackendPreference } from "../types/kneeCounter.types";

export function backendOrder(
  preference: BackendPreference,
  capabilities: { webglSupported: boolean; webgpuAdapterAvailable: boolean }
): ComputeBackend[] {
  if (preference === "wasm") return ["wasm"];
  if (preference === "webgpu") {
    return [
      capabilities.webgpuAdapterAvailable ? "webgpu" : null,
      capabilities.webglSupported ? "webgl" : null,
      "wasm",
    ].filter((value): value is ComputeBackend => Boolean(value));
  }
  if (preference === "webgl") {
    return [
      capabilities.webglSupported ? "webgl" : null,
      "wasm",
    ].filter((value): value is ComputeBackend => Boolean(value));
  }
  return [
    capabilities.webgpuAdapterAvailable ? "webgpu" : null,
    capabilities.webglSupported ? "webgl" : null,
    "wasm",
  ].filter((value): value is ComputeBackend => Boolean(value));
}

export async function initializeBackend(backend: ComputeBackend) {
  const tf = await import("@tensorflow/tfjs-core");
  if (backend === "webgl") await import("@tensorflow/tfjs-backend-webgl");
  if (backend === "webgpu") await import("@tensorflow/tfjs-backend-webgpu");
  if (backend === "wasm") {
    const wasm = await import("@tensorflow/tfjs-backend-wasm");
    wasm.setWasmPaths("/assets/");
  }
  const ready = await tf.setBackend(backend);
  if (!ready) throw new Error(`Không thể khởi tạo backend ${backend}.`);
  await tf.ready();
  return tf;
}
