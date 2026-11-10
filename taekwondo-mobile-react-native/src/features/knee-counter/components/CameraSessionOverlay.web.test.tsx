import { render } from "@testing-library/react-native";
import { CameraSessionOverlay } from "./CameraSessionOverlay.web";

describe("CameraSessionOverlay.web", () => {
  it("renders countdown cue number and copy when active", async () => {
    const screen = await (await render(
      <CameraSessionOverlay countdownCue="3" finished={false} />
    ));

    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("Bắt đầu sau 3 giây")).toBeTruthy();
  });

  it("renders GO! cue and start text when cue is GO!", async () => {
    const screen = await (await render(
      <CameraSessionOverlay countdownCue="GO!" finished={false} />
    ));

    expect(screen.getByText("GO!")).toBeTruthy();
    expect(screen.getByText("BẮT ĐẦU!")).toBeTruthy();
  });

  it("renders finish banner when finished is true", async () => {
    const screen = await (await render(
      <CameraSessionOverlay countdownCue={null} finished={true} />
    ));

    expect(screen.getByText("KẾT THÚC")).toBeTruthy();
    expect(screen.queryByText("BẮT ĐẦU!")).toBeNull();
  });

  it("renders nothing when inactive", async () => {
    const screen = await (await render(
      <CameraSessionOverlay countdownCue={null} finished={false} />
    ));

    expect(screen.queryByText("KẾT THÚC")).toBeNull();
    expect(screen.queryByText("3")).toBeNull();
  });
});
