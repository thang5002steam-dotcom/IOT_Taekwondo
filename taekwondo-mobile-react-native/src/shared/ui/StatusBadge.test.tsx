import { render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { Colors, hexToRgba } from "@/theme";

import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders the label with the primary tone by default", async () => {
    const screen = await render(<StatusBadge label="Đang học" />);
    const label = screen.getByText("Đang học");
    const badgeStyle = StyleSheet.flatten(label.parent?.props.style);
    const textStyle = StyleSheet.flatten(label.props.style);

    expect(label).toBeTruthy();
    expect(badgeStyle.backgroundColor).toBe(
      hexToRgba(Colors.light.primary, 0.08),
    );
    expect(textStyle.color).toBe(Colors.light.primary);
  });

  it("renders the neutral tone", async () => {
    const screen = await render(
      <StatusBadge label="Bảo lưu" tone="neutral" />,
    );
    const label = screen.getByText("Bảo lưu");
    const badgeStyle = StyleSheet.flatten(label.parent?.props.style);
    const textStyle = StyleSheet.flatten(label.props.style);

    expect(badgeStyle.borderColor).toBe(Colors.light.divider);
    expect(textStyle.color).toBe(Colors.light.textSecondary);
  });
});
