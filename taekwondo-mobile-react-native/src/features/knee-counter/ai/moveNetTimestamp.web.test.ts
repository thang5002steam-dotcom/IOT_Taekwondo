import { DEFAULT_KNEE_COUNTER_CONFIG } from "../config/kneeCounterConfig";
import { createMoveNetRuntime } from "./moveNetRuntime.web";

const mockEstimatePoses = jest.fn();
jest.mock("./backendSelector.web", () => ({ initializeBackend: jest.fn(async () => undefined) }));
jest.mock("./poseDetectionLoader.web", () => ({
  loadPoseDetection: jest.fn(async () => ({
    SupportedModels: { MoveNet: "MoveNet" },
    TrackerType: { Keypoint: "Keypoint" },
    movenet: { modelType: { MULTIPOSE_LIGHTNING: "MULTIPOSE_LIGHTNING" } },
    createDetector: jest.fn(async () => ({ estimatePoses: mockEstimatePoses, dispose: jest.fn() })),
  })),
}));

describe("MoveNet frame timestamps", () => {
  it.each(["bitmap", "video"])("passes a monotonic timestamp for %s input", async (kind) => {
    mockEstimatePoses.mockReset().mockResolvedValue([{ id: 7, score: .8, keypoints: [{ x: 640, y: 360, score: .9 }] }]);
    const runtime = await createMoveNetRuntime("webgl", 448, DEFAULT_KNEE_COUNTER_CONFIG);
    const frame = { kind } as unknown as ImageBitmap & HTMLVideoElement;
    const first = await runtime.estimate(frame, 1000, 1280, 720, 6);
    const second = await runtime.estimate(frame, 1066, 1280, 720, 6);
    expect(mockEstimatePoses.mock.calls.map((call) => call[2])).toEqual([1000, 1066]);
    expect(first[0].detectorTrackId).toBe("7");
    expect(second[0].imageAspectRatio).toBeCloseTo(16 / 9);
    runtime.dispose();
  });
});
