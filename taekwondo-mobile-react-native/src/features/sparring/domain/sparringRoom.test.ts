import {
  EMPTY_SPARRING_SNAPSHOT,
  formatSparringTime,
  isSparringRoomCode,
  judgeScoreForGesture,
} from './sparringRoom';

describe('sparring room domain', () => {
  it('accepts only a four digit ring code', () => {
    expect(isSparringRoomCode('5437')).toBe(true);
    expect(isSparringRoomCode('537')).toBe(false);
    expect(isSparringRoomCode('54A7')).toBe(false);
  });

  it('formats authoritative timer values', () => {
    expect(formatSparringTime(120)).toBe('2:00');
    expect(formatSparringTime(-1)).toBe('0:00');
    expect(EMPTY_SPARRING_SNAPSHOT.round).toBe(1);
  });

  it('maps upward judge gestures to the combined score', () => {
    expect(judgeScoreForGesture(2, false)).toBe(2);
    expect(judgeScoreForGesture(3, false)).toBe(3);
    expect(judgeScoreForGesture(2, true)).toBe(4);
    expect(judgeScoreForGesture(3, true)).toBe(5);
  });
});
