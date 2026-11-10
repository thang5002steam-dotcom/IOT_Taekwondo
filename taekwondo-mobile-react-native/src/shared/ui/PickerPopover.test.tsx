import React from "react";
import { Pressable } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";

import { ThemedText } from "./ThemedText";
import { PickerPopover } from "./PickerPopover";

describe("PickerPopover", () => {
  const mockOptions = [
    { value: "OPTION_1", label: "Lựa chọn 1", subtitle: "Mô tả 1" },
    { value: "OPTION_2", label: "Lựa chọn 2", subtitle: "Mô tả 2" },
  ];

  it("renders null when visible is false", async () => {
    const screen = await render(
      <PickerPopover
        visible={false}
        title="Tiêu đề"
        options={mockOptions}
        onSelect={jest.fn()}
        onClose={jest.fn()}
      />,
    );
    expect(screen.queryByText("Tiêu đề")).toBeNull();
  });

  it("renders title, subtitle, and option items when visible is true", async () => {
    const screen = await render(
      <PickerPopover
        visible={true}
        title="Chọn chức vụ"
        subtitle="Danh sách"
        options={mockOptions}
        selectedValue="OPTION_1"
        onSelect={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText("Chọn chức vụ")).toBeTruthy();
    expect(screen.getByText("DANH SÁCH")).toBeTruthy();
    expect(screen.getByText("Lựa chọn 1")).toBeTruthy();
    expect(screen.getByText("Lựa chọn 2")).toBeTruthy();
  });

  it("calls onSelect and onClose when an option is pressed", async () => {
    const handleSelect = jest.fn();
    const handleClose = jest.fn();

    const screen = await render(
      <PickerPopover
        visible={true}
        title="Chọn chức vụ"
        options={mockOptions}
        onSelect={handleSelect}
        onClose={handleClose}
      />,
    );

    await fireEvent.press(screen.getByText("Lựa chọn 2"));
    expect(handleSelect).toHaveBeenCalledWith("OPTION_2");
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("supports multi-selection without auto-closing and triggers onConfirm", async () => {
    const handleSelect = jest.fn();
    const handleClose = jest.fn();
    const handleConfirm = jest.fn();

    const screen = await render(
      <PickerPopover
        visible={true}
        title="Chọn lịch học"
        options={mockOptions}
        multiple={true}
        selectedValues={["OPTION_1"]}
        onSelect={handleSelect}
        onClose={handleClose}
        onConfirm={handleConfirm}
        confirmLabel="Chọn"
      />,
    );

    await fireEvent.press(screen.getByText("Lựa chọn 2"));
    expect(handleSelect).toHaveBeenCalledWith("OPTION_2");
    expect(handleClose).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByLabelText("Chọn"));
    expect(handleConfirm).toHaveBeenCalledWith(["OPTION_1"]);
  });

  it("renders custom children and custom footer with useModal=false", async () => {
    const handleClose = jest.fn();
    const handleCustomPress = jest.fn();

    const screen = await render(
      <PickerPopover
        visible={true}
        useModal={false}
        title="Tiêu đề tùy biến"
        onClose={handleClose}
        footer={
          <Pressable accessibilityRole="button" accessibilityLabel="Xác nhận tùy biến" onPress={handleCustomPress}>
            <ThemedText>Xác nhận tùy biến</ThemedText>
          </Pressable>
        }
      >
        <ThemedText testID="custom-child">Nội dung tùy biến</ThemedText>
      </PickerPopover>,
    );

    expect(screen.getByText("Tiêu đề tùy biến")).toBeTruthy();
    expect(screen.getByText("Nội dung tùy biến")).toBeTruthy();
    expect(screen.getByText("Xác nhận tùy biến")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("Đóng"));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
