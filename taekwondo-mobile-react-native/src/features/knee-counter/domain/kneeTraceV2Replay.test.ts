import fs from "node:fs";
import path from "node:path";

import { DEFAULT_KNEE_COUNTER_CONFIG } from "../config/kneeCounterConfig";
import type { KneeTraceSample, NormalizedPose } from "../types/kneeCounter.types";
import { LaneManager, poseToCandidate } from "./laneManager";

const saved = JSON.parse(fs.readFileSync(path.join(process.cwd(), "docs/knee-trace-1792591172887.json"), "utf8")) as KneeTraceSample[];
const pointIndices = { leftShoulder: 5, rightShoulder: 6, leftHip: 11, rightHip: 12, leftKnee: 13, rightKnee: 14, leftAnkle: 15, rightAnkle: 16 } as const;

function replay(thresholdPercent: number) {
  const manager = new LaneManager({ ...DEFAULT_KNEE_COUNTER_CONFIG, thresholdPercent });
  const frames = new Map<number, KneeTraceSample[]>();
  for (const sample of saved) {
    const frame = frames.get(sample.timestampMs) ?? [];
    frame.push(sample);
    frames.set(sample.timestampMs, frame);
  }
  const events = [] as ReturnType<typeof manager.update>["events"];
  let trace: KneeTraceSample[] = [];
  for (const [timestampMs, samples] of [...frames].sort((a, b) => a[0] - b[0])) {
    const candidates = samples.filter((sample) => sample.source === "POSE").map((sample) => {
      const keypoints = Array.from({ length: 17 }, () => ({ x: 0, y: 0, score: 0 }));
      for (const [name, index] of Object.entries(pointIndices)) {
        const point = sample.points[name as keyof typeof pointIndices];
        if (point && point.x !== null && point.y !== null) keypoints[index] = { x: point.x, y: point.y, score: point.score };
      }
      const pose: NormalizedPose = { detectorTrackId: sample.detectorTrackId, detectedAtMs: timestampMs, poseScore: sample.poseScore ?? 0, boundingBox: sample.boundingBox, imageAspectRatio: 16 / 9, keypoints };
      return poseToCandidate(pose);
    }).filter((candidate): candidate is NonNullable<typeof candidate> => candidate !== null);
    const result = manager.update(candidates, timestampMs, samples.some((sample) => sample.counting), { sessionId: "replay", sessionStartedAt: "2026-10-21", backend: "webgl", inputSize: 448 });
    events.push(...result.events);
    trace = result.trace;
  }
  return { events, trace };
}

describe("v2 session trace replay", () => {
  it.each([0, -35])("replays at %s%% without single weak-sample counts or duplicate event IDs", (threshold) => {
    const result = replay(threshold);
    expect(result.trace.length).toBeGreaterThan(0);
    expect(result.trace[0].algorithmVersion).toBe(3);
    expect(new Set(result.events.map((event) => event.id)).size).toBe(result.events.length);
    for (const event of result.events) {
      const sample = result.trace.find((item) => item.timestampMs === event.crossedAtMs && item.participantId === event.participantId);
      const leg = sample?.[event.leg];
      expect(leg?.eventId).toBe(event.id);
      if (leg?.quality === "weak") expect(leg.corroborated).toBe(true);
      expect(leg?.held).not.toBe(true);
      if (threshold === 0) {
        // A v1-style event can be confirmed by the supporting leg even when
        // the geometric knee point is just below its own hip.
        expect(Math.max(leg?.geometricRatio ?? -Infinity, leg?.supportRatio ?? -Infinity)).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
