import type { ParticipantSlot, RepEvent } from "../types/kneeCounter.types";

export function countCurrentGroupPass(slots: ParticipantSlot[]) {
  return slots.filter((slot) => slot.leftPhase === "ABOVE" || slot.rightPhase === "ABOVE").length;
}

export function isSynchronizedGroup(
  events: RepEvent[],
  participantIds: string[],
  nowMs: number,
  windowMs: number,
) {
  const recent = events.filter((event) => nowMs - event.crossedAtMs <= windowMs);
  return participantIds.length > 0 && participantIds.every((id) => recent.some((event) => event.laneId === id));
}

export function exportRepEventsCsv(events: RepEvent[]) {
  const header = "sessionStartedAt,laneId,participantId,detectorTrackId,leg,crossedAtMs,completedAtMs,peakRatio,thresholdPercent,confidence,backend,inputSize,engine,result";
  const rows = events.map((event) => [event.sessionStartedAt, event.laneId, event.participantId, event.detectorTrackId ?? "", event.leg, event.crossedAtMs, event.completedAtMs, event.peakRatio, event.thresholdPercent, event.confidence, event.backend ?? "", event.inputSize ?? "", event.engine, event.result].map(csvCell).join(","));
  return [header, ...rows].join("\n");
}

function csvCell(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
