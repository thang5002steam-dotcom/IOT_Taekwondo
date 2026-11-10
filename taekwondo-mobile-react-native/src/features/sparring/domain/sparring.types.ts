export type SparringSide = "red" | "blue";

export type SparringSnapshot = {
  roomCode: string;
  redName: string;
  blueName: string;
  round: number;
  remainingSeconds: number;
  redScore: number;
  blueScore: number;
  redPenalties: number;
  bluePenalties: number;
  running: boolean;
  ended: boolean;
};

export type SparringCommand =
  | { type: 'judgeScore'; side: SparringSide; points: 1 | 2 | 3 | 4 | 5 }
  | { type: 'operatorAdjustScore'; side: SparringSide; delta: number }
  | { type: 'operatorAdjustPenalty'; side: SparringSide; delta: number }
  | { type: 'setCompetitorName'; side: SparringSide; name: string }
  | { type: "setRound"; round: 1 | 2 | 3 }
  | { type: "setDuration"; seconds: number }
  | { type: "start" | "pause" | "end" };

export type SparringRoomEnvelope = {
  roomCode: string;
  snapshot: SparringSnapshot;
};
