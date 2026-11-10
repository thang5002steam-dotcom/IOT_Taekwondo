/* eslint-disable @typescript-eslint/no-require-imports */
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";

import { ManualExpoCheckInCamera } from "./ManualExpoCheckInCamera";

const mockTakePictureAsync = jest.fn();
const mockProcessFaceImage = jest.fn();

jest.mock("expo-camera", () => {
  const React = require("react");
  const { View } = require("react-native");
  const MockCameraView = React.forwardRef((props: object, ref: unknown) => {
    React.useImperativeHandle(ref, () => ({
      takePictureAsync: (...args: unknown[]) => mockTakePictureAsync(...args),
    }));
    return React.createElement(View, {
      ...props,
      accessibilityLabel: "Manual camera native preview",
    });
  });
  MockCameraView.displayName = "MockCameraView";
  return {
    CameraView: MockCameraView,
  };
});

jest.mock("expo-image", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    Image: (props: object) => React.createElement(View, props),
  };
});

jest.mock("../utils/faceImageProcessor", () => ({
  processFaceImageForCheckIn: (...args: unknown[]) =>
    mockProcessFaceImage(...args),
}));

const baseProps = {
  facing: "front" as const,
  torch: false,
  isActive: true,
  busy: false,
  bottomClearance: 132,
  onReady: jest.fn(),
  onReviewStateChange: jest.fn(),
  onSubmitPhoto: jest.fn(),
  onError: jest.fn(),
};

describe("ManualExpoCheckInCamera", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTakePictureAsync.mockResolvedValue({
      uri: "file:///raw.jpg",
      width: 1200,
      height: 1600,
    });
    mockProcessFaceImage.mockResolvedValue({
      uri: "file:///processed.jpg",
      width: 480,
      height: 640,
      originalWidth: 1200,
      originalHeight: 1600,
      isProcessed: true,
    });
  });

  it("captures, previews, retakes, then submits the processed photo", async () => {
    const onSubmitPhoto = jest.fn();
    const screen = await render(
      <ManualExpoCheckInCamera {...baseProps} onSubmitPhoto={onSubmitPhoto} />,
    );

    await act(async () => {
      screen.getByLabelText("Manual camera native preview").props.onCameraReady();
    });
    await fireEvent.press(screen.getByLabelText("Chụp ảnh điểm danh"));

    expect(
      await screen.findByLabelText("Ảnh điểm danh đã chụp"),
    ).toBeTruthy();
    expect(mockProcessFaceImage).toHaveBeenCalledWith(
      expect.objectContaining({
        photoUri: "file:///raw.jpg",
        face: null,
        maxDimension: 640,
        quality: 0.8,
      }),
    );

    await fireEvent.press(screen.getByLabelText("Chụp lại ảnh điểm danh"));
    expect(screen.queryByLabelText("Ảnh điểm danh đã chụp")).toBeNull();
    expect(onSubmitPhoto).not.toHaveBeenCalled();

    await act(async () => {
      screen.getByLabelText("Manual camera native preview").props.onCameraReady();
    });
    await fireEvent.press(screen.getByLabelText("Chụp ảnh điểm danh"));
    await screen.findByLabelText("Ảnh điểm danh đã chụp");
    await fireEvent.press(screen.getByLabelText("Gửi ảnh điểm danh"));

    expect(onSubmitPhoto).toHaveBeenCalledTimes(1);
    expect(onSubmitPhoto).toHaveBeenCalledWith("file:///processed.jpg");
  });

  it("prevents duplicate captures while the first capture is pending", async () => {
    let resolveCapture: ((photo: object) => void) | undefined;
    mockTakePictureAsync.mockReturnValue(
      new Promise((resolve) => {
        resolveCapture = resolve;
      }),
    );
    const screen = await render(<ManualExpoCheckInCamera {...baseProps} />);
    await act(async () => {
      screen.getByLabelText("Manual camera native preview").props.onCameraReady();
    });

    const captureButton = screen.getByLabelText("Chụp ảnh điểm danh");
    await fireEvent.press(captureButton);
    await fireEvent.press(captureButton);
    expect(mockTakePictureAsync).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveCapture?.({
        uri: "file:///raw.jpg",
        width: 1200,
        height: 1600,
      });
    });
    await waitFor(() =>
      expect(screen.getByLabelText("Ảnh điểm danh đã chụp")).toBeTruthy(),
    );
  });

  it("prevents duplicate submissions while the first submission is pending", async () => {
    let resolveSubmit: (() => void) | undefined;
    const onSubmitPhoto = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    const screen = await render(
      <ManualExpoCheckInCamera {...baseProps} onSubmitPhoto={onSubmitPhoto} />,
    );
    await act(async () => {
      screen.getByLabelText("Manual camera native preview").props.onCameraReady();
    });
    await fireEvent.press(screen.getByLabelText("Chụp ảnh điểm danh"));
    await screen.findByLabelText("Ảnh điểm danh đã chụp");

    const submitButton = screen.getByLabelText("Gửi ảnh điểm danh");
    await fireEvent.press(submitButton);
    await fireEvent.press(submitButton);
    expect(onSubmitPhoto).toHaveBeenCalledTimes(1);

    await act(async () => resolveSubmit?.());
  });

  it("falls back to the original photo when optimization fails", async () => {
    mockProcessFaceImage.mockRejectedValue(new Error("processor failed"));
    const onSubmitPhoto = jest.fn();
    const screen = await render(
      <ManualExpoCheckInCamera {...baseProps} onSubmitPhoto={onSubmitPhoto} />,
    );
    await act(async () => {
      screen.getByLabelText("Manual camera native preview").props.onCameraReady();
    });

    await fireEvent.press(screen.getByLabelText("Chụp ảnh điểm danh"));
    await screen.findByLabelText("Ảnh điểm danh đã chụp");
    await fireEvent.press(screen.getByLabelText("Gửi ảnh điểm danh"));

    expect(onSubmitPhoto).toHaveBeenCalledWith("file:///raw.jpg");
  });
});
