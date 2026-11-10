import { playCountdownCue, playRefereeBuzzer, unlockSessionAudio } from "./buzzerAudio.web";

describe("playRefereeBuzzer", () => {
  it("runs without crashing when AudioContext is mocked or unavailable", () => {
    expect(() => playRefereeBuzzer(100)).not.toThrow();
    expect(() => unlockSessionAudio()).not.toThrow();
    expect(() => playCountdownCue("3")).not.toThrow();
    expect(() => playCountdownCue("GO!")).not.toThrow();
  });
});
