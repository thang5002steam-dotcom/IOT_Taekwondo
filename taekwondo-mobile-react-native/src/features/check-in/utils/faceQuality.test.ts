import type { Face } from 'react-native-vision-camera-face-detector';
import {
  evaluateFaceQuality,
  isFaceAngleAcceptable,
  isFaceInsideScanRegion,
  isFaceLargeEnough,
  isFaceSmallEnough,
  isFaceStable,
  isSingleFace,
} from './faceQuality';

function createMockFace(overrides: Partial<Face> = {}): Face {
  return {
    bounds: { x: 100, y: 100, width: 200, height: 200 },
    frameWidth: 640,
    frameHeight: 480,
    pitchAngle: 0,
    rollAngle: 0,
    yawAngle: 0,
    ...overrides,
  } as Face;
}

describe('faceQuality utils', () => {
  describe('isSingleFace', () => {
    it('returns true when exactly one face is provided', () => {
      expect(isSingleFace([createMockFace()])).toBe(true);
    });

    it('returns false when no face or multiple faces are provided', () => {
      expect(isSingleFace([])).toBe(false);
      expect(isSingleFace([createMockFace(), createMockFace()])).toBe(false);
    });
  });

  describe('isFaceLargeEnough and isFaceSmallEnough', () => {
    it('returns true when face area is within acceptable ratio', () => {
      const face = createMockFace({
        bounds: { x: 100, y: 100, width: 200, height: 200 },
        frameWidth: 600,
        frameHeight: 600,
      }); // 40000 / 360000 = ~0.111
      expect(isFaceLargeEnough(face, 0.10)).toBe(true);
      expect(isFaceSmallEnough(face, 0.75)).toBe(true);
    });

    it('returns false when face is too small', () => {
      const smallFace = createMockFace({
        bounds: { x: 100, y: 100, width: 50, height: 50 },
        frameWidth: 1000,
        frameHeight: 1000,
      }); // 2500 / 1000000 = 0.0025
      expect(isFaceLargeEnough(smallFace, 0.10)).toBe(false);
    });

    it('returns false when face is too large (too close)', () => {
      const hugeFace = createMockFace({
        bounds: { x: 10, y: 10, width: 900, height: 900 },
        frameWidth: 1000,
        frameHeight: 1000,
      }); // 810000 / 1000000 = 0.81
      expect(isFaceSmallEnough(hugeFace, 0.75)).toBe(false);
    });
  });

  describe('isFaceInsideScanRegion', () => {
    it('returns true when face center is inside region', () => {
      const face = createMockFace({
        bounds: { x: 200, y: 200, width: 200, height: 200 },
        frameWidth: 600,
        frameHeight: 600,
      }); // Center at 300/600 = 0.5, 300/600 = 0.5
      expect(isFaceInsideScanRegion(face)).toBe(true);
    });

    it('returns false when face center is outside region', () => {
      const face = createMockFace({
        bounds: { x: -200, y: 10, width: 50, height: 50 },
        frameWidth: 1000,
        frameHeight: 1000,
      }); // Center at -175/1000 = -0.175 (< 0.0)
      expect(isFaceInsideScanRegion(face)).toBe(false);
    });
  });

  describe('isFaceAngleAcceptable', () => {
    it('returns true when angles are within threshold', () => {
      const face = createMockFace({
        yawAngle: 10,
        rollAngle: -5,
        pitchAngle: 8,
      });
      expect(isFaceAngleAcceptable(face, 20, 20, 20)).toBe(true);
    });

    it('returns false when head is turned too far', () => {
      const face = createMockFace({ yawAngle: 35 });
      expect(isFaceAngleAcceptable(face, 20, 20, 20)).toBe(false);
    });
  });

  describe('isFaceStable', () => {
    it('returns false when history is too short', () => {
      const now = Date.now();
      expect(isFaceStable([{ timestamp: now, centerX: 0.5, centerY: 0.5, width: 0.3, height: 0.3 }])).toBe(false);
    });

    it('returns true when face position remains consistent across duration', () => {
      const now = Date.now();
      const history = [
        { timestamp: now - 400, centerX: 0.5, centerY: 0.5, width: 0.3, height: 0.3, trackingId: 1 },
        { timestamp: now - 200, centerX: 0.51, centerY: 0.5, width: 0.3, height: 0.3, trackingId: 1 },
        { timestamp: now, centerX: 0.5, centerY: 0.51, width: 0.3, height: 0.3, trackingId: 1 },
      ];
      expect(isFaceStable(history, 350, 2, 0.15)).toBe(true);
    });
  });

  describe('evaluateFaceQuality', () => {
    it('returns NO_FACE when empty array is passed', () => {
      const result = evaluateFaceQuality([]);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('NO_FACE');
    });

    it('returns MULTIPLE_FACES when multiple faces are detected', () => {
      const result = evaluateFaceQuality([createMockFace(), createMockFace()]);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('MULTIPLE_FACES');
    });

    it('returns VALID when all conditions are satisfied', () => {
      const face = createMockFace({
        bounds: { x: 200, y: 200, width: 200, height: 200 },
        frameWidth: 600,
        frameHeight: 600,
        yawAngle: 5,
        rollAngle: 2,
        pitchAngle: 0,
      });
      const now = Date.now();
      const history = [
        { timestamp: now - 1200, centerX: 300, centerY: 300, width: 200, height: 200 },
        { timestamp: now - 600, centerX: 300, centerY: 300, width: 200, height: 200 },
        { timestamp: now, centerX: 300, centerY: 300, width: 200, height: 200 },
      ];

      const result = evaluateFaceQuality([face], history);
      expect(result.isValid).toBe(true);
      expect(result.reason).toBe('VALID');
    });
  });
});
