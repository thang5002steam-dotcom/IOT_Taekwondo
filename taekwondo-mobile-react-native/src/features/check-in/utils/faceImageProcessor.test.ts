import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import {
  calculateFaceCropRegion,
  processFaceImageForCheckIn,
} from './faceImageProcessor';

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn().mockResolvedValue({
    uri: 'file:///processed/face-cropped.jpg',
    width: 640,
    height: 640,
  }),
  SaveFormat: {
    JPEG: 'jpeg',
    PNG: 'png',
  },
}));

describe('faceImageProcessor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateFaceCropRegion', () => {
    it('calculates 25% margin square crop correctly for centered face', () => {
      const face = {
        bounds: { x: 300, y: 400, width: 200, height: 200 },
        frameWidth: 800,
        frameHeight: 1000,
      } as any;

      // Image is 1600x2000 (2x the frame)
      const crop = calculateFaceCropRegion(face, 1600, 2000, 0.25);

      // Scaled face: x=600, y=800, width=400, height=400. Center: (800, 1000)
      // BaseDim = 400. Margin 25% on each side -> cropSize = 400 * 1.5 = 600
      // originX = 800 - 300 = 500, originY = 1000 - 300 = 700
      expect(crop.width).toBe(600);
      expect(crop.height).toBe(600);
      expect(crop.originX).toBe(500);
      expect(crop.originY).toBe(700);
    });

    it('clamps to left edge when face is near origin (0,0)', () => {
      const face = {
        bounds: { x: 20, y: 20, width: 200, height: 200 },
        frameWidth: 1000,
        frameHeight: 1000,
      } as any;

      const crop = calculateFaceCropRegion(face, 1000, 1000, 0.25);

      // BaseDim = 200 -> cropSize = 300
      // center = 120 -> origin = 120 - 150 = -30 -> clamped to 0
      expect(crop.originX).toBe(0);
      expect(crop.originY).toBe(0);
      expect(crop.width).toBe(300);
      expect(crop.height).toBe(300);
    });

    it('clamps to right/bottom edge when face is near bottom right', () => {
      const face = {
        bounds: { x: 800, y: 800, width: 180, height: 180 },
        frameWidth: 1000,
        frameHeight: 1000,
      } as any;

      const crop = calculateFaceCropRegion(face, 1000, 1000, 0.25);

      // cropSize = 180 * 1.5 = 270
      // center = 890 -> origin = 890 - 135 = 755 -> 755 + 270 = 1025 > 1000 -> clamped to 1000 - 270 = 730
      expect(crop.originX + crop.width).toBeLessThanOrEqual(1000);
      expect(crop.originY + crop.height).toBeLessThanOrEqual(1000);
    });

    it('falls back to center square when face is null or invalid', () => {
      const crop = calculateFaceCropRegion(null, 1728, 2304);

      expect(crop.width).toBe(1728);
      expect(crop.height).toBe(1728);
      expect(crop.originX).toBe(0);
      expect(crop.originY).toBe(288); // (2304 - 1728) / 2
    });
  });

  describe('processFaceImageForCheckIn', () => {
    it('crops, resizes to max 640x640, and compresses with JPEG 80%', async () => {
      const face = {
        bounds: { x: 300, y: 400, width: 200, height: 200 },
        frameWidth: 800,
        frameHeight: 1000,
      } as any;

      const result = await processFaceImageForCheckIn({
        photoUri: 'file:///data/photo.jpg',
        face,
        imageWidth: 1600,
        imageHeight: 2000,
        marginRatio: 0.25,
        maxDimension: 640,
        quality: 0.8,
      });

      expect(manipulateAsync).toHaveBeenCalledWith(
        'file:///data/photo.jpg',
        expect.arrayContaining([
          expect.objectContaining({
            crop: expect.objectContaining({
              width: 600,
              height: 600,
            }),
          }),
        ]),
        {
          compress: 0.8,
          format: SaveFormat.JPEG,
        },
      );

      expect(result.uri).toBe('file:///processed/face-cropped.jpg');
    });
  });
});
