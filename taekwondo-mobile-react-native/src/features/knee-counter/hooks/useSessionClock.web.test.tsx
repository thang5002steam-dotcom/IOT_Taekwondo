import { act, renderHook } from "@testing-library/react-native";

import { useSessionClock } from "./useSessionClock.web";
import type { SessionStatus } from "../types/kneeCounter.types";

describe("useSessionClock", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("plays 3, 2, 1, GO once and finishes exactly once at the deadline", async () => {
    let now = 0;
    const onCountdownComplete = jest.fn();
    const onTimeUp = jest.fn();
    const { result, rerender } = await renderHook(
      ({ status }: { status: SessionStatus }) => useSessionClock({
        status,
        targetSeconds: 5,
        onCountdownComplete,
        onTimeUp,
        now: () => now,
      }),
      { initialProps: { status: "countdown" as SessionStatus } },
    );

    await act(async () => { jest.advanceTimersByTime(0); });
    expect(result.current.countdownCue).toBe("3");
    now = 1000;
    await act(async () => jest.advanceTimersByTime(1000));
    expect(result.current.countdownCue).toBe("2");
    now = 2000;
    await act(async () => jest.advanceTimersByTime(1000));
    expect(result.current.countdownCue).toBe("1");
    now = 3000;
    await act(async () => jest.advanceTimersByTime(1000));
    expect(result.current.countdownCue).toBe("GO!");
    expect(onCountdownComplete).toHaveBeenCalledTimes(1);

    await rerender({ status: "running" });
    now = 8000;
    await act(async () => jest.advanceTimersByTime(100));
    expect(result.current.remainingSeconds).toBe(0);
    expect(onTimeUp).toHaveBeenCalledTimes(1);

    now = 9000;
    await act(async () => jest.advanceTimersByTime(300));
    expect(onTimeUp).toHaveBeenCalledTimes(1);
  });

  it("preserves the remaining time while a paused session is aligned again", async () => {
    let now = 0;
    const { result, rerender } = await renderHook(
      ({ status }: { status: SessionStatus }) => useSessionClock({
        status,
        targetSeconds: 10,
        onCountdownComplete: jest.fn(),
        onTimeUp: jest.fn(),
        now: () => now,
      }),
      { initialProps: { status: "running" as SessionStatus } },
    );

    now = 2500;
    await act(async () => jest.advanceTimersByTime(100));
    await rerender({ status: "paused" });
    expect(result.current.remainingSeconds).toBe(8);

    await rerender({ status: "aligning" });
    expect(result.current.remainingSeconds).toBe(8);
  });
});
