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
  | "notification";

export interface ArenaAudioPrefs {
  muted: boolean;
  masterVolume: number;
  ambienceVolume: number;
  sfxVolume: number;
}

const DEFAULT_PREFS: ArenaAudioPrefs = {
  muted: false,
  masterVolume: 0.7,
  ambienceVolume: 0.35,
  sfxVolume: 0.55,
};

let ctx: AudioContext | null = null;
let ambienceGain: GainNode | null = null;
let ambienceOscs: OscillatorNode[] = [];
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
    startAmbience(0.15);
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
  prefs.ambienceVolume = 0.12 + clamped * 0.55;
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

function startAmbience(initialLevel: number): void {
  const c = getCtx();
  ambienceGain = c.createGain();
  ambienceGain.gain.value = prefs.muted ? 0 : prefs.masterVolume * initialLevel;
  ambienceGain.connect(c.destination);

  const bufferSize = c.sampleRate * 2;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.08;
  }
  ambienceNoise = c.createBufferSource();
  ambienceNoise.buffer = buffer;
  ambienceNoise.loop = true;

  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 420;
  filter.Q.value = 0.4;

  ambienceNoise.connect(filter);
  filter.connect(ambienceGain);
  ambienceNoise.start();

  const gain = ambienceGain!;
  const freqs = [180, 240, 320];
  ambienceOscs = freqs.map((f) => {
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.value = f;
    const g = c.createGain();
    g.gain.value = 0.012;
    osc.connect(g);
    g.connect(gain);
    osc.start();
    return osc;
  });
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
  ambienceOscs = [];
  ambienceNoise?.stop();
  ambienceNoise = null;
  ctx?.close();
  ctx = null;
  ambienceGain = null;
  initialized = false;
}
