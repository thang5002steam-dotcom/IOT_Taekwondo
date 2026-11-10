import { fireEvent, render } from "@testing-library/react-native";

import { SegmentedControl } from "./SegmentedControl";

describe("SegmentedControl", () => {
  it("exposes selected state and calls onChange with the selected value", async () => {
    const onChange = jest.fn();
    const screen = await render(
      <SegmentedControl
        value="all"
        options={[
          { value: "all", label: "Tất cả" },
          { value: "unread", label: "Chưa đọc" },
        ]}
        onChange={onChange}
      />,
    );

    expect(screen.getByLabelText("Tất cả").props.accessibilityState).toEqual({
      selected: true,
    });

    fireEvent.press(screen.getByText("Chưa đọc"));
    expect(onChange).toHaveBeenCalledWith("unread");
  });
});
