import { act, fireEvent, render, within } from "@testing-library/react-native";

import { ConfirmationDialog } from "./ConfirmationDialog";

describe("ConfirmationDialog", () => {
  it("supports confirm-first action order without changing button semantics", async () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    const screen = await render(
      <ConfirmationDialog
        visible
        title="Cho phép sử dụng Camera"
        description="Camera được dùng để điểm danh."
        confirmLabel="Cho phép"
        cancelLabel="Để sau"
        actionOrder="confirm-cancel"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    const buttons = screen.getAllByRole("button");
    expect(within(buttons[0]).getByText("Cho phép")).toBeTruthy();
    expect(within(buttons[1]).getByText("Để sau")).toBeTruthy();

    await fireEvent.press(buttons[0]);
    await fireEvent.press(buttons[1]);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("disables actions while pending and treats Android Back as cancel", async () => {
    const onCancel = jest.fn();
    const screen = await render(
      <ConfirmationDialog
        visible
        title="Đang xử lý"
        description="Vui lòng chờ."
        confirmLabel="Xác nhận"
        pending
        onCancel={onCancel}
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.queryByText("Xác nhận")).toBeNull();
    await fireEvent.press(screen.getByText("Hủy"));
    expect(onCancel).not.toHaveBeenCalled();

    await act(async () => {
      screen.getByTestId("confirmation-dialog").props.onRequestClose();
    });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("renders inline without a native modal and dismisses", async () => {
    const onCancel = jest.fn();
    const screen = await render(
      <ConfirmationDialog
        visible
        presentation="inline"
        title="Xóa lịch học"
        description="Xác nhận xóa lịch học."
        confirmLabel="Xóa"
        onCancel={onCancel}
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.getByTestId("confirmation-dialog")).toBeTruthy();
    await fireEvent.press(screen.getByText("Hủy"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
