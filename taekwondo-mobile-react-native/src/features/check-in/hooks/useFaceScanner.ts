import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useCameraDevice,
  usePhotoOutput,
  type CameraDevice,
  type CameraPhotoOutput,
} from 'react-native-vision-camera';
import {
  type Face,
} from 'react-native-vision-camera-face-detector';
import { FACE_QUALITY_MESSAGES } from '../constants/faceScannerConfig';
import type {
  CameraFacing,
  FaceDetectionRecord,
  FaceQualityReason,
  ScannerState,
} from '../types/faceScanner.types';
import { createDetectionRecord, evaluateFaceQuality } from '../utils/faceQuality';
import { processFaceImageForCheckIn } from '../utils/faceImageProcessor';
import { useStableFaceDetectorOutput } from './useStableFaceDetectorOutput';

export type UseFaceScannerProps = {
  facing: CameraFacing;
  isActive: boolean;
  onFaceCaptured: (photoFilePath: string) => Promise<void> | void;
  onScannerError?: (source: 'vision' | 'mlkit', error: unknown) => void;
};

export type UseFaceScannerResult = {
  scannerState: ScannerState;
  feedbackMessage: string;
  qualityReason: FaceQualityReason;
  device: CameraDevice | undefined;
  photoOutput: CameraPhotoOutput;
  faceDetectorOutput: ReturnType<typeof useStableFaceDetectorOutput>;
  resumeScanner: () => void;
  pauseScanner: () => void;
  setScannerState: (state: ScannerState) => void;
};

export function useFaceScanner({
  facing,
  isActive,
  onFaceCaptured,
  onScannerError,
}: UseFaceScannerProps): UseFaceScannerResult {
  const [scannerState, setScannerState] = useState<ScannerState>(() =>
    isActive ? 'scanning' : 'initializing',
  );
  const [feedbackMessage, setFeedbackMessage] = useState<string>(
    FACE_QUALITY_MESSAGES.NO_FACE,
  );
  const [qualityReason, setQualityReason] = useState<FaceQualityReason>('NO_FACE');

  const [prevIsActive, setPrevIsActive] = useState(isActive);
  if (prevIsActive !== isActive) {
    setPrevIsActive(isActive);
    if (isActive) {
      setFeedbackMessage(FACE_QUALITY_MESSAGES.NO_FACE);
      setQualityReason('NO_FACE');
      setScannerState('scanning');
    } else {
      setScannerState('initializing');
    }
  }

  const scannerStateRef = useRef<ScannerState>(scannerState);
  const isCapturingRef = useRef<boolean>(false);
  const historyRef = useRef<FaceDetectionRecord[]>([]);
  const lastDetectedFaceRef = useRef<Face | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const onFaceCapturedRef = useRef(onFaceCaptured);
  const onScannerErrorRef = useRef(onScannerError);

  const device = useCameraDevice(facing);

  const photoOutput = usePhotoOutput({
    containerFormat: 'jpeg',
    quality: 0.85,
    qualityPrioritization: 'speed',
  });
  const photoOutputRef = useRef(photoOutput);

  useEffect(() => {
    scannerStateRef.current = scannerState;
  }, [scannerState]);

  useEffect(() => {
    onFaceCapturedRef.current = onFaceCaptured;
    onScannerErrorRef.current = onScannerError;
  }, [onFaceCaptured, onScannerError]);

  useEffect(() => {
    photoOutputRef.current = photoOutput;
  }, [photoOutput]);

  const resumeScanner = useCallback(() => {
    isCapturingRef.current = false;
    historyRef.current = [];
    lastDetectedFaceRef.current = null;
    setFeedbackMessage(FACE_QUALITY_MESSAGES.NO_FACE);
    setQualityReason('NO_FACE');
    setScannerState('scanning');
  }, []);

  const pauseScanner = useCallback(() => {
    isCapturingRef.current = false;
    historyRef.current = [];
    lastDetectedFaceRef.current = null;
    setScannerState('initializing');
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      historyRef.current = [];
      lastDetectedFaceRef.current = null;
    };
  }, []);

  const handleCapture = useCallback(async () => {
    if (isCapturingRef.current) return;
    isCapturingRef.current = true;

    console.log('[FaceScanner] 🎯 Khuôn mặt đạt chuẩn (Quality Gate Pass) -> Tiến hành chụp ảnh');
    setScannerState('capturing');
    setFeedbackMessage('Đang chụp ảnh...');

    try {
      const currentPhotoOutput = photoOutputRef.current;
      const photoFile = await currentPhotoOutput.capturePhotoToFile(
        { flashMode: 'off', enableShutterSound: false },
        {},
      );

      if (!isMountedRef.current) return;

      if (photoFile?.filePath) {
        console.log('[FaceScanner] 📸 Đã chụp ảnh gốc thành công:', photoFile.filePath);

        let finalPhotoPath = photoFile.filePath;
        try {
          // Crop vùng mặt + margin 25%, resize tối đa 640x640, JPEG 80%
          const processed = await processFaceImageForCheckIn({
            photoUri: photoFile.filePath,
            face: lastDetectedFaceRef.current,
            marginRatio: 0.25,
            maxDimension: 640,
            quality: 0.8,
          });
          finalPhotoPath = processed.uri;
        } catch (procError) {
          console.warn('[FaceScanner] ⚠️ Lỗi khi xử lý crop/resize ảnh, fallback dùng ảnh gốc:', procError);
        }

        console.log('[FaceScanner] 🚀 Gửi ảnh điểm danh (đã xử lý/tối ưu):', finalPhotoPath);
        await onFaceCapturedRef.current(finalPhotoPath);
      } else {
        console.warn('[FaceScanner] ⚠️ Không nhận được đường dẫn ảnh sau khi chụp');
        resumeScanner();
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      console.warn('[FaceScanner] ❌ Lỗi khi chụp ảnh:', error);
      onScannerErrorRef.current?.('vision', error);
      resumeScanner();
    }
  }, [resumeScanner]);

  const onFacesDetected = useCallback((faces: Face[]) => {
    if (!isMountedRef.current) return;

    // Only evaluate frames when in active scanning state and not currently capturing/submitting
    if (scannerStateRef.current !== 'scanning' || isCapturingRef.current) {
      return;
    }

    if (faces.length === 0) {
      historyRef.current = [];
      lastDetectedFaceRef.current = null;
      setFeedbackMessage(FACE_QUALITY_MESSAGES.NO_FACE);
      setQualityReason('NO_FACE');
      return;
    }

    const primaryFace = faces[0];
    lastDetectedFaceRef.current = primaryFace;
    console.log('[FaceScanner] 👤 Nhận diện khuôn mặt:', {
      count: faces.length,
      bounds: primaryFace.bounds,
      angles: {
        yaw: Math.round(primaryFace.yawAngle || 0),
        pitch: Math.round(primaryFace.pitchAngle || 0),
        roll: Math.round(primaryFace.rollAngle || 0),
      },
    });

    const newRecord = createDetectionRecord(primaryFace);
    const now = Date.now();

    // Keep only recent detections within 1000ms
    const filteredHistory = [
      ...historyRef.current.filter((r) => now - r.timestamp <= 1000),
      newRecord,
    ];
    historyRef.current = filteredHistory;

    const evaluation = evaluateFaceQuality(faces, filteredHistory);

    setFeedbackMessage(evaluation.feedbackText);
    setQualityReason(evaluation.reason);

    if (evaluation.isValid) {
      setScannerState('face-ready');
      void handleCapture();
    }
  }, [handleCapture]);

  const onError = useCallback((error: Error) => {
    console.warn('MLKit Face Detector encountered an error:', error);
    onScannerErrorRef.current?.('mlkit', error);
  }, []);

  const faceDetectorOutput = useStableFaceDetectorOutput({
    cameraFacing: facing,
    performanceMode: 'fast',
    autoMode: true,
    runLandmarks: false,
    runContours: false,
    runClassifications: false,
    onFacesDetected,
    onError,
  });

  return {
    scannerState,
    feedbackMessage,
    qualityReason,
    device,
    photoOutput,
    faceDetectorOutput,
    resumeScanner,
    pauseScanner,
    setScannerState,
  };
}
