import { fireEvent, render } from "@testing-library/react-native";
import { AnalysisSettings } from "./AnalysisSettings.web";
import { DEFAULT_KNEE_COUNTER_CONFIG } from "../config/kneeCounterConfig";

describe("AnalysisSettings", () => {
  it("starts collapsed and exposes the expanded state", async () => {
    const onToggle = jest.fn();
    const screen = await render(<AnalysisSettings config={DEFAULT_KNEE_COUNTER_CONFIG} backendOptions={["webgl", "wasm"]} expanded={false} onToggle={onToggle} onConfigChange={jest.fn()} />);
    const toggle = screen.getByRole("button");
    expect(toggle.props.accessibilityState).toEqual({ expanded: false });
    expect(screen.queryByText("Số người")).toBeNull();
    fireEvent.press(toggle);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("emits config patches from selected options", async () => {
    const onConfigChange = jest.fn();
    const screen = await render(<AnalysisSettings config={DEFAULT_KNEE_COUNTER_CONFIG} backendOptions={["webgl", "wasm"]} expanded onToggle={jest.fn()} onConfigChange={onConfigChange} />);
    expect(screen.queryByText("6")).toBeNull();
    fireEvent.press(screen.getByText("Bật"));
    expect(onConfigChange).toHaveBeenCalledWith({ flipHorizontal: true });
    fireEvent.press(screen.getByText("Cổ chân"));
    expect(onConfigChange).toHaveBeenCalledWith({ measurementLandmark: "ankle" });
  });
});
