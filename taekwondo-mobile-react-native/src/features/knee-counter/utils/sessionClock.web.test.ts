import { formatSessionDuration } from "./sessionClock.web";

describe("formatSessionDuration", () => {
  it.each([
    [1, "00:01"],
    [60, "01:00"],
    [999, "16:39"],
    [0, "00:00"],
  ])("formats %i seconds as %s", (seconds, expected) => {
    expect(formatSessionDuration(seconds)).toBe(expected);
  });
});
