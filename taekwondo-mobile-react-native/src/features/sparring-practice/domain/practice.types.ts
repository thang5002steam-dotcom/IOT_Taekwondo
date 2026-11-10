export type PracticeSide = 'red' | 'blue';
export type PracticeStatus = 'WAITING' | 'COUNTDOWN' | 'RUNNING' | 'PAUSED' | 'FINISHED' | 'CLOSED';

export type PracticeSnapshot = {
  roomCode: string; maximumJudges: number; consensusJudges: number; scoringWindowSeconds: number;
  redScore: number; blueScore: number; status: PracticeStatus; countdownEndsAtEpochMs: number;
  mediaOffsetMs: number; videoUrl: string | null; videoUploaded: boolean; canStart: boolean;
  judges: Array<{ position: number; connected: boolean; ready: boolean }>;
};
export type PracticeEnvelope = { roomCode: string; snapshot: PracticeSnapshot };
export type PracticeCommand =
  | { type: 'heartbeat' | 'ready' | 'notReady' | 'start' | 'resume' | 'reset' | 'close' | 'videoEnded' }
  | { type: 'judgeScore'; side: PracticeSide; points: 1 | 2 | 3 | 4 | 5 };
export type PracticeTicket = { roomCode: string; ticket: string; operator: boolean; expiresAtEpochMs: number };
export type PracticeEvent = { type: 'snapshot'; data: PracticeEnvelope } | { type: 'error'; data: { message: string } };

export const EMPTY_PRACTICE: PracticeSnapshot = {
  roomCode: '----', maximumJudges: 0, consensusJudges: 0, scoringWindowSeconds: 2,
  redScore: 0, blueScore: 0, status: 'WAITING', countdownEndsAtEpochMs: 0,
  mediaOffsetMs: 0, videoUrl: null, videoUploaded: false, canStart: false, judges: [],
};
