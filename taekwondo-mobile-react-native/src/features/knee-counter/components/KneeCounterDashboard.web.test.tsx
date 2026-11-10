import { render } from "@testing-library/react-native";
import { KneeCounterDashboard } from "./KneeCounterDashboard.web";
import type { ParticipantSlot } from "../types/kneeCounter.types";

const slot: ParticipantSlot = { participantId: "lane-1", laneId: "lane-1", label: "VĐV 1", slotIndex: 0, status: "ACTIVE", trackId: "detector-1", pose: null, leftReps: 2, rightReps: 1, leftPhase: "READY", rightPhase: "ABOVE", leftRatio: -0.1, rightRatio: 0.2, confidence: .9, stableFrames: 8, lastSeenAtMs: 1 };
describe("KneeCounterDashboard", () => { it("renders lane count", async () => { const screen = await render(<KneeCounterDashboard slots={[slot]} detectedCount={1} totalReps={3} passCount={1} groupPassCount={1} synchronizedGroupPass={false} mode="individual" status="running" onReset={() => undefined} onExport={() => undefined} />); expect(screen.getByText("VĐV 1")).toBeTruthy(); expect(screen.getAllByText("3")).toHaveLength(2); }); });
