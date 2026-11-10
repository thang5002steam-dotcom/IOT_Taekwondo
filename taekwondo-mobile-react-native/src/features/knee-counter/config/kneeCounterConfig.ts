import type { KneeCounterSessionConfig } from "../types/kneeCounter.types";

export const DEFAULT_KNEE_COUNTER_CONFIG: KneeCounterSessionConfig = {
  measurementLandmark: "knee",
  thresholdPercent: -35,
  minPoseScore: 0.20,
  minShoulderScore: 0.25,
  minHipScore: 0.20,
  minKneeTrustedScore: 0.25,
  minKneeWeakScore: 0.01,
  weakConfirmationSamples: 1,
  weakConfirmationWindowMs: 150,
  smoothingWindowMs: 150,
  minRepIntervalMs: 180,
  hysteresisRatio: 0.05,
  maxSignalGapMs: 600,
  proximityHipMaxY: 0.65,
  proximityKneeMaxY: 0.94,
  laneMissingMs: 700,
  readyStableFrames: 5,
  synchronizedWindowMs: 300,
  backendPreference: "auto",
  mode: "individual",
  flipHorizontal: false,
};

export const MAX_TRACKED_PEOPLE = 6;

export function clampThreshold(value: number) {
  return Math.max(-45, Math.min(30, Math.round(value / 5) * 5));
}

