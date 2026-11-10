export type { CameraFacing } from "./faceScanner.types";

export type FaceCheckInSessionStatus =
  | "idle"
  | "submitting"
  | "processing"
  | "result"
  | "error";
