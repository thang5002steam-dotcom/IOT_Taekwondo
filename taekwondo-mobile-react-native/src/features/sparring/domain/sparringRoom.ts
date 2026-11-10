import type { SparringSnapshot } from './sparring.types';

export function isSparringRoomCode(value: string): boolean {
  return /^\d{4}$/.test(value);
}

export function formatSparringTime(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, '0')}`;
}

export function judgeScoreForGesture(
  basePoints: 2 | 3,
  swipedUp: boolean,
): 2 | 3 | 4 | 5 {
  if (!swipedUp) return basePoints;
  return basePoints === 3 ? 5 : 4;
}

export const EMPTY_SPARRING_SNAPSHOT: SparringSnapshot = {
  roomCode: '----', redName: 'RED', blueName: 'BLUE', round: 1, remainingSeconds: 120, redScore: 0, blueScore: 0,
  redPenalties: 0, bluePenalties: 0, running: false, ended: false,
};
