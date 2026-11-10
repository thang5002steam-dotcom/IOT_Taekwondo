import { backendOrder } from "./backendSelector.web";

describe("backendOrder", () => {
  it("prioritizes webgpu, then webgl, then wasm when both GPUs are available in auto mode", () => {
    const order = backendOrder("auto", {
      webglSupported: true,
      webgpuAdapterAvailable: true,
    });
    expect(order).toEqual(["webgpu", "webgl", "wasm"]);
  });

  it("prioritizes webgl, then falls back to wasm when only WebGL is available in auto mode", () => {
    const order = backendOrder("auto", {
      webglSupported: true,
      webgpuAdapterAvailable: false,
    });
    expect(order).toEqual(["webgl", "wasm"]);
  });

  it("falls back directly to wasm (CPU) when no GPU is available in auto mode", () => {
    const order = backendOrder("auto", {
      webglSupported: false,
      webgpuAdapterAvailable: false,
    });
    expect(order).toEqual(["wasm"]);
  });

  it("includes wasm fallback when webgl is requested and supported", () => {
    const order = backendOrder("webgl", {
      webglSupported: true,
      webgpuAdapterAvailable: false,
    });
    expect(order).toEqual(["webgl", "wasm"]);
  });

  it("falls back to wasm when webgl is requested but WebGL is NOT supported", () => {
    const order = backendOrder("webgl", {
      webglSupported: false,
      webgpuAdapterAvailable: false,
    });
    expect(order).toEqual(["wasm"]);
  });

  it("falls back to wasm when webgpu is requested but no GPU is available", () => {
    const order = backendOrder("webgpu", {
      webglSupported: false,
      webgpuAdapterAvailable: false,
    });
    expect(order).toEqual(["wasm"]);
  });

  it("returns wasm only when wasm is explicitly requested", () => {
    const order = backendOrder("wasm", {
      webglSupported: true,
      webgpuAdapterAvailable: true,
    });
    expect(order).toEqual(["wasm"]);
  });
});
