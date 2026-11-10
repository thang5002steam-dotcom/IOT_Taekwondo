import { fireEvent, render } from "@testing-library/react-native";

import { CheckInResultSheet } from "./CheckInResultSheet";

jest.mock("@/shared/ui/BottomSheetWindow", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    BottomSheetWindow: ({
      visible,
      children,
    }: {
      visible: boolean;
      children: React.ReactNode;
    }) => (visible ? React.createElement(View, null, children) : null),
  };
});

jest.mock("@/shared/ui/AppIcon", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    AppIcon: () => React.createElement(View, null),
  };
});

describe("CheckInResultSheet", () => {
  it("renders pending view with person summary, confidence and cancel button", async () => {
    const onCancel = jest.fn();
    const screen = await render(
      <CheckInResultSheet
        visible
        isPending
        record={{
          id: "rec-pending",
          personId: "person-1",
          code: "VQ_001",
          fullName: "Nguyen Van A",
          avatarUrl: "https://example.com/avatar.jpg",
          role: "STUDENT",
          checkInTime: "18:00",
          dateLabel: "Hôm nay",
          status: "ON_TIME",
          statusLabel: "Đang xử lý",
          timestamp: Date.now(),
          confidence: 0.965,
        }}
        onNextScan={jest.fn()}
        onClose={jest.fn()}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText("Đang đối chiếu dữ liệu...")).toBeTruthy();
    expect(screen.getByText("Nguyen Van A")).toBeTruthy();
    expect(screen.getByText("Mã HV: VQ_001")).toBeTruthy();
    expect(screen.getByText("Độ khớp khuôn mặt: 97%")).toBeTruthy();
    expect(screen.getByText("Hủy thao tác")).toBeTruthy();

    fireEvent.press(screen.getByText("Hủy thao tác"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("renders failure content in the bottom sheet and retries scanning", async () => {
    const onNextScan = jest.fn();
    const screen = await render(
      <CheckInResultSheet
        visible
        record={{
          id: "rec-failed",
          personId: "person-1",
          code: "VQ_001",
          fullName: "Nguyen Van A",
          avatarUrl: "https://example.com/avatar.jpg",
          role: "STUDENT",
          checkInTime: "23:00",
          dateLabel: "Hôm nay",
          status: "FAILED",
          statusLabel: "Không thể điểm danh",
          timestamp: Date.now(),
          confidence: 0.812,
        }}
        failure={{
          errorType: "NO_FACE",
          title: "Không nhận được khuôn mặt",
          message: "Vui lòng đưa khuôn mặt vào khung, giữ máy ổn định rồi thử lại.",
          correlationId: "corr-123",
          ctaLabel: "Quét lại",
        }}
        onNextScan={onNextScan}
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText("Không nhận được khuôn mặt")).toBeTruthy();
    expect(
      screen.getByText("Vui lòng đưa khuôn mặt vào khung, giữ máy ổn định rồi thử lại."),
    ).toBeTruthy();
    expect(screen.getByText("Nguyen Van A")).toBeTruthy();
    expect(screen.getByText("Mã HV: VQ_001")).toBeTruthy();
    expect(screen.getByText("Độ khớp khuôn mặt: 81%")).toBeTruthy();
    expect(screen.getByText("Mã hỗ trợ: corr-123")).toBeTruthy();

    fireEvent.press(screen.getByText("Quét lại"));

    expect(onNextScan).toHaveBeenCalledTimes(1);
  });

  it("renders confidence on successful check-in records", async () => {
    const screen = await render(
      <CheckInResultSheet
        visible
        failure={null}
        record={{
          id: "rec-1",
          personId: "person-1",
          code: "VQ_001",
          fullName: "Nguyen Van A",
          avatarUrl: "https://example.com/avatar.jpg",
          role: "STUDENT",
          checkInTime: "18:30",
          dateLabel: "27/09/2026",
          status: "ON_TIME",
          statusLabel: "Đúng giờ",
          timestamp: Date.now(),
          confidence: 0.873,
        }}
        onNextScan={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText("Độ khớp khuôn mặt: 87%")).toBeTruthy();
  });
});
