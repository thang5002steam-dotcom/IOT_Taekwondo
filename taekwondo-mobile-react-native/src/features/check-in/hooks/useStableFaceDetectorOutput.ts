import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import type { CameraOutput } from 'react-native-vision-camera';
import {
  createFaceDetectorOutput,
  type FaceDetectorOutputOptions,
} from 'react-native-vision-camera-face-detector';

/**
 * Keeps the native detector output attached while React callbacks and UI state change.
 *
 * The dependency version of `useFaceDetectorOutput` memoizes against a rest-options
 * object that is recreated on every render. Recreating the native output makes
 * VisionCamera reconfigure its session and can unbind ImageCapture mid-capture.
 */
export function useStableFaceDetectorOutput({
  cameraFacing,
  mirrorMode,
  autoMode,
  performanceMode,
  runLandmarks,
  runContours,
  runClassifications,
  minFaceSize,
  trackingEnabled,
  outputResolution = 'preview',
  onFacesDetected,
  onError,
}: FaceDetectorOutputOptions): CameraOutput {
  const onFacesDetectedRef = useRef(onFacesDetected);
  const onErrorRef = useRef(onError);

  useLayoutEffect(() => {
    onFacesDetectedRef.current = onFacesDetected;
    onErrorRef.current = onError;
  }, [onError, onFacesDetected]);

  const handleFacesDetected = useCallback(
    (...args: Parameters<typeof onFacesDetected>) =>
      onFacesDetectedRef.current(...args),
    [],
  );
  const handleError = useCallback(
    (...args: Parameters<typeof onError>) => onErrorRef.current(...args),
    [],
  );

  return useMemo(
    () =>
      // Native invokes these callbacks after render; the stable wrappers read the latest refs.
      // eslint-disable-next-line react-hooks/refs
      createFaceDetectorOutput({
        cameraFacing,
        mirrorMode,
        autoMode,
        performanceMode,
        runLandmarks,
        runContours,
        runClassifications,
        minFaceSize,
        trackingEnabled,
        outputResolution,
        onFacesDetected: handleFacesDetected,
        onError: handleError,
      }),
    [
      autoMode,
      cameraFacing,
      handleError,
      handleFacesDetected,
      minFaceSize,
      mirrorMode,
      outputResolution,
      performanceMode,
      runClassifications,
      runContours,
      runLandmarks,
      trackingEnabled,
    ],
  );
}
