import { Image } from 'react-native';
import type { Face } from 'react-native-vision-camera-face-detector';

export type CropRegion = {
  originX: number;
  originY: number;
  width: number;
  height: number;
};

export type ProcessFaceImageOptions = {
  photoUri: string;
  face?: Face | null;
  imageWidth?: number;
  imageHeight?: number;
  marginRatio?: number; // default 0.25 (25% margin on each side)
  maxDimension?: number; // default 640 px
  quality?: number; // default 0.80 (80% JPEG quality)
};

export type ProcessFaceImageResult = {
  uri: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  isProcessed: boolean;
};

type ManipulatorAction =
  | { crop: CropRegion }
  | { resize: { width?: number; height?: number } };

interface ImageManipulatorModule {
  manipulateAsync: (
    uri: string,
    actions?: ManipulatorAction[],
    saveOptions?: { compress?: number; format?: string },
  ) => Promise<{ uri: string; width: number; height: number }>;
  SaveFormat: {
    JPEG: string;
    PNG: string;
    WEBP?: string;
  };
}

function getImageManipulator(): ImageManipulatorModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-image-manipulator');
    if (mod && typeof mod.manipulateAsync === 'function') {
      return mod as ImageManipulatorModule;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Calculates the crop box (originX, originY, width, height) centered around the face
 * with the specified margin (default 25%), clamped within image boundaries.
 */
export function calculateFaceCropRegion(
  face: Face | null | undefined,
  imageWidth: number,
  imageHeight: number,
  marginRatio: number = 0.25,
): CropRegion {
  if (!face || !face.bounds || face.bounds.width <= 0 || face.bounds.height <= 0) {
    // Fallback: Center square crop
    const size = Math.min(imageWidth, imageHeight);
    return {
      originX: Math.max(0, Math.round((imageWidth - size) / 2)),
      originY: Math.max(0, Math.round((imageHeight - size) / 2)),
      width: size,
      height: size,
    };
  }

  // Scale factor from MLKit frame coordinates to actual photo resolution
  const frameWidth = face.frameWidth && face.frameWidth > 0 ? face.frameWidth : 1;
  const frameHeight = face.frameHeight && face.frameHeight > 0 ? face.frameHeight : 1;

  let faceX: number;
  let faceY: number;
  let faceW: number;
  let faceH: number;

  if (face.frameWidth && face.frameHeight) {
    const scaleX = imageWidth / frameWidth;
    const scaleY = imageHeight / frameHeight;
    faceX = face.bounds.x * scaleX;
    faceY = face.bounds.y * scaleY;
    faceW = face.bounds.width * scaleX;
    faceH = face.bounds.height * scaleY;
  } else if (face.bounds.x <= 1 && face.bounds.width <= 1) {
    // Normalized 0..1 coordinates
    faceX = face.bounds.x * imageWidth;
    faceY = face.bounds.y * imageHeight;
    faceW = face.bounds.width * imageWidth;
    faceH = face.bounds.height * imageHeight;
  } else {
    faceX = face.bounds.x;
    faceY = face.bounds.y;
    faceW = face.bounds.width;
    faceH = face.bounds.height;
  }

  // Find face center
  const centerX = faceX + faceW / 2;
  const centerY = faceY + faceH / 2;

  // 25% margin on each side means total box size is 1.5x the larger face dimension
  const baseDim = Math.max(faceW, faceH);
  let cropSize = baseDim * (1 + 2 * marginRatio);

  // Crop size cannot exceed original image dimensions
  const maxPossibleSize = Math.min(imageWidth, imageHeight);
  cropSize = Math.min(cropSize, maxPossibleSize);

  let originX = Math.round(centerX - cropSize / 2);
  let originY = Math.round(centerY - cropSize / 2);

  // Clamp within image bounds
  if (originX < 0) {
    originX = 0;
  } else if (originX + cropSize > imageWidth) {
    originX = Math.max(0, Math.round(imageWidth - cropSize));
  }

  if (originY < 0) {
    originY = 0;
  } else if (originY + cropSize > imageHeight) {
    originY = Math.max(0, Math.round(imageHeight - cropSize));
  }

  const finalWidth = Math.min(Math.round(cropSize), imageWidth - originX);
  const finalHeight = Math.min(Math.round(cropSize), imageHeight - originY);

  return {
    originX,
    originY,
    width: Math.max(1, finalWidth),
    height: Math.max(1, finalHeight),
  };
}

/**
 * Retrieves the dimensions of an image via Image.getSize.
 */
export async function getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => {
        console.warn('[FaceImageProcessor] ⚠️ Không lấy được kích thước ảnh:', error);
        resolve({ width: 1728, height: 2304 });
      },
    );
  });
}

/**
 * Crops the detected face region with 25% margin, resizes to max 640x640, and compresses to 80% JPEG.
 */
export async function processFaceImageForCheckIn({
  photoUri,
  face,
  imageWidth,
  imageHeight,
  marginRatio = 0.25,
  maxDimension = 640,
  quality = 0.8,
}: ProcessFaceImageOptions): Promise<ProcessFaceImageResult> {
  const normalizedUri = photoUri.startsWith('file://') ? photoUri : `file://${photoUri}`;

  let originalWidth = imageWidth;
  let originalHeight = imageHeight;

  if (!originalWidth || !originalHeight) {
    try {
      const dimensions = await getImageDimensions(normalizedUri);
      originalWidth = dimensions.width;
      originalHeight = dimensions.height;
    } catch {
      originalWidth = 1728;
      originalHeight = 2304;
    }
  }

  const manipulator = getImageManipulator();

  if (!manipulator) {
    console.warn(
      "[FaceImageProcessor] ⚠️ Native module 'ExpoImageManipulator' chưa được build vào ứng dụng (Cần chạy 'npx expo run:android' để biên dịch native). Tạm thời gửi ảnh gốc.",
    );
    return {
      uri: normalizedUri,
      width: originalWidth,
      height: originalHeight,
      originalWidth,
      originalHeight,
      isProcessed: false,
    };
  }

  // 1. Calculate Crop
  const cropBox = calculateFaceCropRegion(face, originalWidth, originalHeight, marginRatio);

  console.log('[FaceImageProcessor] ✂️ Thông số cắt ảnh khuôn mặt:', {
    original: { width: originalWidth, height: originalHeight },
    crop: cropBox,
    marginRatio,
    maxDimension,
    quality,
  });

  const actions: ManipulatorAction[] = [
    {
      crop: cropBox,
    },
  ];

  // 2. Calculate Resize if larger than maxDimension (640 px)
  if (cropBox.width > maxDimension || cropBox.height > maxDimension) {
    const scale = Math.min(maxDimension / cropBox.width, maxDimension / cropBox.height);
    const targetWidth = Math.round(cropBox.width * scale);
    const targetHeight = Math.round(cropBox.height * scale);

    actions.push({
      resize: {
        width: targetWidth,
        height: targetHeight,
      },
    });
  }

  // 3. Perform image manipulation (Crop + Resize + Compress 80% JPEG)
  const result = await manipulator.manipulateAsync(normalizedUri, actions, {
    compress: quality,
    format: manipulator.SaveFormat.JPEG || 'jpeg',
  });

  console.log('[FaceImageProcessor] ✅ Xử lý ảnh hoàn tất:', {
    resultUri: result.uri,
    width: result.width,
    height: result.height,
    quality: `${Math.round(quality * 100)}%`,
  });

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    originalWidth,
    originalHeight,
    isProcessed: true,
  };
}
