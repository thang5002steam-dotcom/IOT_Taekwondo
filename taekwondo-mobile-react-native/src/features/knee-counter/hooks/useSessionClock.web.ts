import { useCallback, useEffect, useRef, useState } from "react";

import type { SessionStatus } from "../types/kneeCounter.types";
import type { CountdownCue } from "../utils/buzzerAudio.web";

type UseSessionClockOptions = {
  status: SessionStatus;
  targetSeconds: number;
  onCountdownComplete: () => void;
  onTimeUp: () => void;
  now?: () => number;
};

const COUNTDOWN_CUES: CountdownCue[] = ["3", "2", "1", "GO!"];

export function useSessionClock({
  status,
  targetSeconds,
  onCountdownComplete,
  onTimeUp,
  now = () => performance.now(),
}: UseSessionClockOptions) {
  const [remainingSeconds, setRemainingSeconds] = useState(targetSeconds);
  const [countdownCue, setCountdownCue] = useState<CountdownCue | null>(null);
  const remainingMsRef = useRef(targetSeconds * 1000);
  const deadlineRef = useRef<number | null>(null);
  const onCountdownCompleteRef = useRef(onCountdownComplete);
  const onTimeUpRef = useRef(onTimeUp);
  const finishedRef = useRef(false);
  const nowRef = useRef(now);

  useEffect(() => {
    onCountdownCompleteRef.current = onCountdownComplete;
    onTimeUpRef.current = onTimeUp;
    nowRef.current = now;
  }, [now, onCountdownComplete, onTimeUp]);

  useEffect(() => {
    if (status !== "countdown") return;

    let cancelled = false;
    const timers = COUNTDOWN_CUES.map((cue, index) => window.setTimeout(() => {
      if (cancelled) return;
      setCountdownCue(cue);
      if (cue === "GO!") {
        deadlineRef.current = nowRef.current() + remainingMsRef.current;
        onCountdownCompleteRef.current();
      }
    }, index * 1000));

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [status]);

  useEffect(() => {
    if (status !== "running") return;
    const deadline = deadlineRef.current ?? nowRef.current() + remainingMsRef.current;
    deadlineRef.current = deadline;

    const tick = () => {
      const remainingMs = Math.max(0, deadline - nowRef.current());
      remainingMsRef.current = remainingMs;
      setRemainingSeconds(Math.ceil(remainingMs / 1000));
      if (remainingMs === 0 && !finishedRef.current) {
        finishedRef.current = true;
        deadlineRef.current = null;
        onTimeUpRef.current();
      }
    };

    tick();
    const interval = window.setInterval(tick, 100);
    return () => window.clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status !== "paused") return;
    if (deadlineRef.current !== null) {
      const remainingMs = Math.max(0, deadlineRef.current - nowRef.current());
      remainingMsRef.current = remainingMs;
      deadlineRef.current = null;
      setRemainingSeconds(Math.ceil(remainingMs / 1000));
    }
  }, [status]);

  useEffect(() => {
    if (countdownCue !== "GO!" || status !== "running") return;
    const timer = window.setTimeout(() => setCountdownCue(null), 450);
    return () => window.clearTimeout(timer);
  }, [countdownCue, status]);

  const startNewSession = useCallback((seconds: number) => {
    remainingMsRef.current = seconds * 1000;
    deadlineRef.current = null;
    finishedRef.current = false;
    setCountdownCue(null);
    setRemainingSeconds(seconds);
  }, []);

  const cancel = useCallback(() => {
    deadlineRef.current = null;
    setCountdownCue(null);
  }, []);

  return { remainingSeconds, countdownCue, startNewSession, cancel };
}
