import type { ComputeBackend, KneeCounterSessionConfig, NormalizedPose } from "../types/kneeCounter.types";
import { initializeBackend } from "./backendSelector.web";
import { loadPoseDetection } from "./poseDetectionLoader.web";

export type MoveNetRuntime = { backend: ComputeBackend; inputSize: 320 | 384 | 448; estimate: (input: HTMLVideoElement | ImageBitmap, timestampMs: number, width: number, height: number, maxPoses: number) => Promise<NormalizedPose[]>; dispose: () => void };
export function normalizeBoundingBox(box: { xMin: number; yMin: number; xMax: number; yMax: number }, width: number, height: number) {
  const normalized = Math.max(Math.abs(box.xMin), Math.abs(box.yMin), Math.abs(box.xMax), Math.abs(box.yMax)) <= 1.01;
  const x = normalized ? 1 : Math.max(1, width); const y = normalized ? 1 : Math.max(1, height);
  return { xMin: Math.max(0, Math.min(1, box.xMin / x)), yMin: Math.max(0, Math.min(1, box.yMin / y)), xMax: Math.max(0, Math.min(1, box.xMax / x)), yMax: Math.max(0, Math.min(1, box.yMax / y)) };
}
export async function createMoveNetRuntime(backend: ComputeBackend, inputSize: 320 | 384 | 448, _config: KneeCounterSessionConfig): Promise<MoveNetRuntime> {
  await initializeBackend(backend); const poseDetection = await loadPoseDetection();
  const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
    modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
    enableTracking: true,
    enableSmoothing: true,
    trackerType: poseDetection.TrackerType.Keypoint,
    multiPoseMaxDimension: inputSize,
    minPoseScore: 0.20,
  });
  return { backend, inputSize, dispose: () => detector.dispose(), estimate: async (input, detectedAtMs, width, height, maxPoses) => {
    const poses = await detector.estimatePoses(input as unknown as HTMLVideoElement, { maxPoses, flipHorizontal: false }, detectedAtMs);
    return poses.map((pose) => ({ detectorTrackId: pose.id == null ? null : String(pose.id), poseScore: pose.score ?? 0, detectedAtMs, imageAspectRatio: width / Math.max(1, height), keypoints: pose.keypoints.map((point) => ({ x: Math.max(0, Math.min(1, point.x / Math.max(1, width))), y: Math.max(0, Math.min(1, point.y / Math.max(1, height))), score: point.score ?? 0, name: point.name })), boundingBox: pose.box ? normalizeBoundingBox(pose.box, width, height) : null }));
  }};
}
