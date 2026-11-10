/**
 * Web Audio API synthesizer for playing a loud referee buzzer/whistle tone
 * when countdown timer completes. Runs client-side with no external audio file dependencies.
 */
let audioCtx: AudioContext | null = null;

export type CountdownCue = "3" | "2" | "1" | "GO!";

/**
 * Keeps short synthesized cues audible on small phone speakers without
 * pushing a raw oscillator straight into digital clipping.
 */
function createLoudnessChain(ctx: AudioContext): {
  input: DynamicsCompressorNode;
  output: GainNode;
} {
  const compressor = ctx.createDynamicsCompressor();
  const output = ctx.createGain();

  // Compress peaks first, then apply a modest make-up level. This makes the
  // short countdown cues more present while keeping the buzzer controlled.
  compressor.threshold.setValueAtTime(-20, ctx.currentTime);
  compressor.knee.setValueAtTime(18, ctx.currentTime);
  compressor.ratio.setValueAtTime(8, ctx.currentTime);
  compressor.attack.setValueAtTime(0.003, ctx.currentTime);
  compressor.release.setValueAtTime(0.12, ctx.currentTime);
  output.gain.setValueAtTime(1.25, ctx.currentTime);

  compressor.connect(output);
  output.connect(ctx.destination);
  return { input: compressor, output };
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioCtx || audioCtx.state === "closed") {
    audioCtx = new AudioCtx();
  }
  return audioCtx;
}

export function unlockSessionAudio(): void {
  try {
    const ctx = getAudioContext();
    if (ctx?.state === "suspended") void ctx.resume();
  } catch (err) {
    console.warn("Could not unlock session audio:", err);
  }
}

export function playCountdownCue(cue: CountdownCue): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();

    if (cue === "GO!") {
      playRefereeBuzzer(1200);
      return;
    }

    const now = ctx.currentTime;
    const duration = 0.24;
    const oscillator = ctx.createOscillator();
    const accent = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const accentGain = ctx.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(330, now);
    oscillator.frequency.exponentialRampToValueAtTime(440, now + duration * 0.72);
    accent.type = "sine";
    accent.frequency.setValueAtTime(880, now);
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.9, now + 0.018);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    accentGain.gain.setValueAtTime(0.0001, now);
    accentGain.gain.exponentialRampToValueAtTime(0.7, now + 0.012);
    accentGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.58);

    oscillator.connect(gainNode);
    accent.connect(accentGain);
    const loudness = createLoudnessChain(ctx);
    gainNode.connect(loudness.input);
    accentGain.connect(loudness.input);
    oscillator.start(now);
    accent.start(now);
    oscillator.stop(now + duration);
    accent.stop(now + duration);
  } catch (err) {
    console.warn("Could not play countdown audio:", err);
  }
}

export function playRefereeBuzzer(durationMs = 1200): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const now = ctx.currentTime;
    const duration = durationMs / 1000;

    // Dual-tone buzzer (sports referee buzzer: fundamental 880Hz + harmonic 1760Hz + 440Hz base)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(880, now);

    osc2.type = "square";
    osc2.frequency.setValueAtTime(1760, now);

    osc3.type = "sawtooth";
    osc3.frequency.setValueAtTime(440, now);

    // Envelope: Sharp loud attack, sustain, rapid decay at end
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + 0.04);
    gainNode.gain.setValueAtTime(1, now + duration - 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    osc3.connect(gainNode);
    const loudness = createLoudnessChain(ctx);
    gainNode.connect(loudness.input);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    osc1.stop(now + duration);
    osc2.stop(now + duration);
    osc3.stop(now + duration);
  } catch (err) {
    // Graceful fallback if Web Audio is blocked by browser policy
    console.warn("Could not play referee buzzer audio:", err);
  }
}
