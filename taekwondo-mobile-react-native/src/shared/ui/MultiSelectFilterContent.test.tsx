import { fireEvent, render } from "@testing-library/react-native";

import {
  MultiSelectFilterContent,
  toggleMultiSelectFilterValue,
} from "./MultiSelectFilterContent";

describe("MultiSelectFilterContent", () => {
  it("renders checkbox state and delegates row/select-all/clear actions", async () => {
    const onToggle = jest.fn();
    const onSelectAll = jest.fn();
    const onClear = jest.fn();
    const screen = await render(
      <MultiSelectFilterContent
        groups={[
          {
            key: "branchIds",
            title: "Cơ sở",
            options: [
              { value: 1, label: "Cơ sở 1" },
              { value: 2, label: "Cơ sở 2" },
            ],
            selectedValues: [1],
            onToggle,
            onSelectAll,
            onClear,
          },
        ]}
      />,
    );

    expect(screen.getByText("Cơ sở 1").parent?.props.accessibilityState).toEqual({
      checked: true,
    });

    fireEvent.press(screen.getByText("Cơ sở 2"));
    fireEvent.press(screen.getByText("Tất cả"));
    fireEvent.press(screen.getByText("Huỷ"));

    expect(onToggle).toHaveBeenCalledWith(2);
    expect(onSelectAll).toHaveBeenCalled();
    expect(onClear).toHaveBeenCalled();
  });

  it("toggles selected values without mutating the input", () => {
    const values = ["morning"];

    expect(toggleMultiSelectFilterValue(values, "evening")).toEqual([
      "morning",
      "evening",
    ]);
    expect(toggleMultiSelectFilterValue(values, "morning")).toEqual([]);
    expect(values).toEqual(["morning"]);
  });
});
