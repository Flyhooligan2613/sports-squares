/** Web Audio API sound engine — synthetic SFX + stadium ambience. No asset files required. */

export type ArenaSfx =
  | "touchdown"
  | "field-goal"
  | "safety"
  | "quarter-end"
  | "winning-square"
  | "wallet-reward"
  | "contest-complete"
  | "score-tick"
  | "notification"
  | "anticipation-drone"
  | "prize-spin"
  | "prize-burst"
  | "confetti-shimmer"
  | "big-win-fanfare"
  | "small-win-chime";

export interface ArenaAudioPrefs {
  muted: boolean;
  masterVolume: number;
  ambienceVolume: number;
  sfxVolume: number;
}

const DEFAULT_PREFS: ArenaAudioPrefs = {
  muted: false,
  masterVolume: 0.55,
  ambienceVolume: 0.18,
  sfxVolume: 0.5,
};

let ctx: AudioContext | null = null;
let ambienceGain: GainNode | null = null;
let ambienceOscs: OscillatorNode[] = [];
let ambienceLfos: OscillatorNode[] = [];
let ambienceNoise: AudioBufferSourceNode | null = null;
let prefs: ArenaAudioPrefs = { ...DEFAULT_PREFS };
let initialized = false;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function isArenaAudioReady(): boolean {
  return initialized;
}

export async function initArenaAudio(): Promise<void> {
  const c = getCtx();
  if (c.state === "suspended") await c.resume();
  if (!initialized) {
    startAmbience(0.1);
    initialized = true;
  }
}

export function getArenaAudioPrefs(): ArenaAudioPrefs {
  return { ...prefs };
}

export function setArenaAudioPrefs(next: Partial<ArenaAudioPrefs>): void {
  prefs = { ...prefs, ...next };
  applyAmbienceVolume(prefs.ambienceVolume);
  if (ambienceGain) {
    ambienceGain.gain.setTargetAtTime(
      prefs.muted ? 0 : prefs.masterVolume * prefs.ambienceVolume,
      getCtx().currentTime,
      0.08
    );
  }
}

export function setCrowdEnergy(level: number): void {
  const clamped = Math.max(0, Math.min(1, level));
  prefs.ambienceVolume = 0.08 + clamped * 0.22;
  applyAmbienceVolume(prefs.ambienceVolume);
}

function applyAmbienceVolume(vol: number): void {
  if (!ambienceGain || prefs.muted) return;
  ambienceGain.gain.setTargetAtTime(
    prefs.masterVolume * vol,
    getCtx().currentTime,
    0.15
  );
}

/** Brown noise — softer than white noise for distant crowd rumble. */
function createBrownNoiseBuffer(c: AudioContext, seconds = 4): AudioBuffer {
  const bufferSize = Math.floor(c.sampleRate * seconds);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 0.35;
  }
  return buffer;
}

function startAmbience(initialLevel: number): void {
  const c = getCtx();
  ambienceGain = c.createGain();
  ambienceGain.gain.value = prefs.muted ? 0 : prefs.masterVolume * initialLevel;
  ambienceGain.connect(c.destination);

  // Subtle brown-noise bed — heavily filtered so it never reads as static/hiss
  const buffer = createBrownNoiseBuffer(c, 4);
  ambienceNoise = c.createBufferSource();
  ambienceNoise.buffer = buffer;
  ambienceNoise.loop = true;

  const noiseFilter = c.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = 280;
  noiseFilter.Q.value = 0.35;

  const noiseGain = c.createGain();
  noiseGain.gain.value = 0.045;

  ambienceNoise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ambienceGain);
  ambienceNoise.start();

  const gain = ambienceGain;
  // Low-frequency "crowd murmur" tones — slow LFO wobble, no harsh frequencies
  const layers: { freq: number; lfoRate: number; baseGain: number }[] = [
    { freq: 92, lfoRate: 0.07, baseGain: 0.008 },
    { freq: 118, lfoRate: 0.11, baseGain: 0.006 },
    { freq: 156, lfoRate: 0.05, baseGain: 0.005 },
    { freq: 203, lfoRate: 0.09, baseGain: 0.004 },
  ];

  ambienceOscs = [];
  ambienceLfos = [];

  for (const layer of layers) {
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.value = layer.freq;

    const lfo = c.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = layer.lfoRate;

    const lfoGain = c.createGain();
    lfoGain.gain.value = layer.freq * 0.08;

    const toneGain = c.createGain();
    toneGain.gain.value = layer.baseGain;

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(toneGain);
    toneGain.connect(gain);

    osc.start();
    lfo.start();
    ambienceOscs.push(osc);
    ambienceLfos.push(lfo);
  }
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.3,
  ramp = true
): void {
  if (prefs.muted || !initialized) return;
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const v = volume * prefs.masterVolume * prefs.sfxVolume;
  gain.gain.setValueAtTime(v, c.currentTime);
  if (ramp) gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

function playNoiseBurst(duration: number, volume = 0.15): void {
  if (prefs.muted || !initialized) return;
  const c = getCtx();
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const gain = c.createGain();
  gain.gain.value = volume * prefs.masterVolume * prefs.sfxVolume;
  src.connect(gain);
  gain.connect(c.destination);
  src.start();
}

export function playArenaSfx(sfx: ArenaSfx): void {
  if (prefs.muted || !initialized) return;

  switch (sfx) {
    case "touchdown":
      playTone(220, 0.12, "square", 0.4, false);
      window.setTimeout(() => playTone(330, 0.15, "square", 0.35, false), 80);
      window.setTimeout(() => playTone(440, 0.25, "sine", 0.3), 160);
      playNoiseBurst(0.4, 0.2);
      break;
    case "field-goal":
      playTone(523, 0.08, "sine", 0.25);
      window.setTimeout(() => playTone(659, 0.12, "sine", 0.22), 60);
      break;
    case "safety":
      playTone(180, 0.15, "square", 0.32);
      window.setTimeout(() => playTone(140, 0.2, "square", 0.28), 100);
      break;
    case "quarter-end":
      playTone(392, 0.2, "triangle", 0.28);
      window.setTimeout(() => playTone(294, 0.35, "triangle", 0.22), 150);
      break;
    case "winning-square":
      playTone(880, 0.1, "sine", 0.35);
      window.setTimeout(() => playTone(1108, 0.15, "sine", 0.3), 90);
      window.setTimeout(() => playTone(1318, 0.2, "sine", 0.25), 180);
      break;
    case "wallet-reward":
      playTone(660, 0.08, "sine", 0.3);
      window.setTimeout(() => playTone(880, 0.1, "sine", 0.28), 70);
      window.setTimeout(() => playTone(1046, 0.15, "sine", 0.25), 140);
      break;
    case "contest-complete":
      playTone(523, 0.15, "sine", 0.3);
      window.setTimeout(() => playTone(659, 0.15, "sine", 0.28), 120);
      window.setTimeout(() => playTone(784, 0.3, "sine", 0.25), 240);
      playNoiseBurst(0.6, 0.18);
      break;
    case "score-tick":
      playTone(800, 0.04, "sine", 0.12);
      break;
    case "notification":
      playTone(740, 0.06, "sine", 0.2);
      window.setTimeout(() => playTone(880, 0.08, "sine", 0.18), 70);
      break;
    case "anticipation-drone":
      playTone(55, 0.9, "sine", 0.12, false);
      playTone(82, 0.85, "triangle", 0.08, false);
      break;
    case "prize-spin": {
      for (let i = 0; i < 8; i++) {
        window.setTimeout(
          () => playTone(400 + i * 45, 0.05, "square", 0.14, false),
          i * 120
        );
      }
      break;
    }
    case "prize-burst":
      playTone(220, 0.08, "square", 0.38, false);
      window.setTimeout(() => playTone(440, 0.12, "square", 0.32, false), 40);
      window.setTimeout(() => playTone(880, 0.2, "sine", 0.28), 90);
      playNoiseBurst(0.35, 0.28);
      break;
    case "confetti-shimmer":
      for (let i = 0; i < 6; i++) {
        window.setTimeout(
          () => playTone(1200 + i * 80, 0.04, "sine", 0.1),
          i * 55
        );
      }
      break;
    case "big-win-fanfare":
      playTone(523, 0.12, "sine", 0.32, false);
      window.setTimeout(() => playTone(659, 0.12, "sine", 0.3, false), 100);
      window.setTimeout(() => playTone(784, 0.15, "sine", 0.28, false), 200);
      window.setTimeout(() => playTone(1046, 0.35, "sine", 0.26), 320);
      playNoiseBurst(0.5, 0.15);
      break;
    case "small-win-chime":
      playTone(880, 0.08, "sine", 0.22);
      window.setTimeout(() => playTone(1046, 0.12, "sine", 0.18), 80);
      break;
  }
}

export function destroyArenaAudio(): void {
  ambienceOscs.forEach((o) => {
    try {
      o.stop();
    } catch {
      /* already stopped */
    }
  });
  ambienceLfos.forEach((o) => {
    try {
      o.stop();
    } catch {
      /* already stopped */
    }
  });
  ambienceOscs = [];
  ambienceLfos = [];
  ambienceNoise?.stop();
  ambienceNoise = null;
  ctx?.close();
  ctx = null;
  ambienceGain = null;
  initialized = false;
}
