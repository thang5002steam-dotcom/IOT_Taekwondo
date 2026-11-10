import { renderHook } from '@testing-library/react-native';

import { useStableFaceDetectorOutput } from './useStableFaceDetectorOutput';

const mockCreateFaceDetectorOutput = jest.fn((options: unknown) => ({ options }));

jest.mock('react-native-vision-camera-face-detector', () => ({
  createFaceDetectorOutput: (options: unknown) =>
    mockCreateFaceDetectorOutput(options),
}));

describe('useStableFaceDetectorOutput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps the native output stable when callbacks change', async () => {
    const firstCallback = jest.fn();
    const nextCallback = jest.fn();
    const onError = jest.fn();
    let onFacesDetected = firstCallback;
    const hook = await renderHook(() =>
      useStableFaceDetectorOutput({
        cameraFacing: 'front',
        performanceMode: 'fast',
        autoMode: true,
        onFacesDetected,
        onError,
      }),
    );
    const initialOutput = hook.result.current;

    onFacesDetected = nextCallback;
    await hook.rerender(undefined);

    expect(hook.result.current).toBe(initialOutput);
    expect(mockCreateFaceDetectorOutput).toHaveBeenCalledTimes(1);

    const nativeOptions = mockCreateFaceDetectorOutput.mock.calls[0][0] as {
      onFacesDetected: (faces: unknown[]) => void;
    };
    nativeOptions.onFacesDetected([]);

    expect(firstCallback).not.toHaveBeenCalled();
    expect(nextCallback).toHaveBeenCalledWith([]);
  });

  it('recreates the native output only when detector configuration changes', async () => {
    const onFacesDetected = jest.fn();
    const onError = jest.fn();
    let cameraFacing: 'front' | 'back' = 'front';
    const hook = await renderHook(() =>
      useStableFaceDetectorOutput({
        cameraFacing,
        performanceMode: 'fast',
        autoMode: true,
        onFacesDetected,
        onError,
      }),
    );
    const initialOutput = hook.result.current;

    await hook.rerender(undefined);
    expect(hook.result.current).toBe(initialOutput);
    expect(mockCreateFaceDetectorOutput).toHaveBeenCalledTimes(1);

    cameraFacing = 'back';
    await hook.rerender(undefined);
    expect(hook.result.current).not.toBe(initialOutput);
    expect(mockCreateFaceDetectorOutput).toHaveBeenCalledTimes(2);
  });
});
