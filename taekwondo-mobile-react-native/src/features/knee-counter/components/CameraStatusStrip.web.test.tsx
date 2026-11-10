import { fireEvent, render } from "@testing-library/react-native";
import { CameraStatusStrip } from "./CameraStatusStrip.web";

describe("CameraStatusStrip", () => {
  it("renders the duration input before counting begins", async () => {
    const onChange = jest.fn();
    const screen = await render(
      <CameraStatusStrip
        detectedCount={2}
        status="aligning"
        targetSeconds={30}
        onChangeTargetSeconds={onChange}
        running={true}
        onPrimaryAction={() => undefined}
      />
    );

    expect(screen.getByText(/Thời lượng/)).toBeTruthy();
    expect(screen.getByLabelText("Thời gian đếm ngược theo giây").props.value).toBe("30");
    expect(screen.getByText("2")).toBeTruthy();
  });

  it("calls onChangeTargetSeconds when user changes duration", async () => {
    const onChange = jest.fn();
    const screen = await render(
      <CameraStatusStrip
        detectedCount={1}
        status="aligning"
        targetSeconds={30}
        onChangeTargetSeconds={onChange}
        running={true}
        onPrimaryAction={() => undefined}
      />
    );

    const input = screen.getByLabelText("Thời gian đếm ngược theo giây");
    fireEvent.changeText(input, "45");
    expect(onChange).toHaveBeenCalledWith(45);
  });

  it("visually distinguishes the active camera state from the start state", async () => {
    const onPrimaryAction = jest.fn();
    const startScreen = await render(
      <CameraStatusStrip
        detectedCount={0}
        status="aligning"
        targetSeconds={30}
        onChangeTargetSeconds={() => undefined}
        running={false}
        onPrimaryAction={onPrimaryAction}
      />,
    );
    const startButton = startScreen.getByRole("button");

    expect(startButton.props.accessibilityState.selected).toBe(false);
    expect(startButton.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ backgroundColor: "#D71113" })]));

    const activeScreen = await render(
      <CameraStatusStrip
        detectedCount={1}
        status="running"
        targetSeconds={30}
        onChangeTargetSeconds={() => undefined}
        running={true}
        onPrimaryAction={onPrimaryAction}
      />,
    );
    const activeButton = activeScreen.getByRole("button");

    expect(activeButton.props.accessibilityState.selected).toBe(true);
  });

  it("keeps the live timer out of the status strip while running", async () => {
    const screen = await render(
      <CameraStatusStrip
        detectedCount={1}
        status="running"
        targetSeconds={30}
        onChangeTargetSeconds={() => undefined}
        running={true}
        onPrimaryAction={() => undefined}
      />
    );

    expect(screen.queryByText(/Thời lượng/)).toBeNull();
    expect(screen.queryByLabelText("Thời gian đếm ngược theo giây")).toBeNull();
  });

  it("labels an expired session as finished and keeps the duration editable", async () => {
    const screen = await render(
      <CameraStatusStrip
        detectedCount={1}
        status="finished"
        targetSeconds={30}
        onChangeTargetSeconds={() => undefined}
        running={true}
        onPrimaryAction={() => undefined}
      />,
    );

    expect(screen.getAllByText("Kết thúc")).toHaveLength(2);
    expect(screen.getByLabelText("Thời gian đếm ngược theo giây").props.value).toBe("30");
    expect(screen.getByLabelText("Thời gian đếm ngược theo giây").props.editable).toBe(true);
  });
});
