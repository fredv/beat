// Drum synthesis via Web Audio API — no samples needed
let ctx = null;

export function initAudio() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function getCtx() {
  if (!ctx) initAudio();
  return ctx;
}

// ---- Individual drum synth voices ----

function kick() {
  const c = getCtx(), t = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(160, t);
  osc.frequency.exponentialRampToValueAtTime(30, t + 0.12);
  gain.gain.setValueAtTime(1, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.4);
  // Click layer
  const click = c.createOscillator();
  const cg = c.createGain();
  click.type = 'square';
  click.frequency.setValueAtTime(800, t);
  click.frequency.exponentialRampToValueAtTime(100, t + 0.02);
  cg.gain.setValueAtTime(0.3, t);
  cg.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
  click.connect(cg).connect(c.destination);
  click.start(t);
  click.stop(t + 0.03);
}

function snare() {
  const c = getCtx(), t = c.currentTime;
  // Noise burst
  const buf = c.createBuffer(1, c.sampleRate * 0.15, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = c.createBufferSource();
  noise.buffer = buf;
  const nf = c.createBiquadFilter();
  nf.type = 'highpass';
  nf.frequency.value = 2000;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.6, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  noise.connect(nf).connect(ng).connect(c.destination);
  noise.start(t);
  // Body
  const osc = c.createOscillator();
  const og = c.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
  og.gain.setValueAtTime(0.5, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc.connect(og).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.1);
}

function hihatClosed() {
  const c = getCtx(), t = c.currentTime;
  const buf = c.createBuffer(1, c.sampleRate * 0.05, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 8000;
  bp.Q.value = 1.5;
  const g = c.createGain();
  g.gain.setValueAtTime(0.35, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  src.connect(bp).connect(g).connect(c.destination);
  src.start(t);
}

function hihatOpen() {
  const c = getCtx(), t = c.currentTime;
  const buf = c.createBuffer(1, c.sampleRate * 0.3, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 8000;
  bp.Q.value = 1;
  const g = c.createGain();
  g.gain.setValueAtTime(0.35, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  src.connect(bp).connect(g).connect(c.destination);
  src.start(t);
}

function clap() {
  const c = getCtx(), t = c.currentTime;
  for (let i = 0; i < 3; i++) {
    const delay = i * 0.01;
    const buf = c.createBuffer(1, c.sampleRate * 0.04, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let j = 0; j < data.length; j++) data[j] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1500;
    bp.Q.value = 0.8;
    const g = c.createGain();
    g.gain.setValueAtTime(0.4, t + delay);
    g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.08);
    src.connect(bp).connect(g).connect(c.destination);
    src.start(t + delay);
  }
}

function tom(freq) {
  return () => {
    const c = getCtx(), t = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.15);
    g.gain.setValueAtTime(0.6, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(g).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  };
}

function crash() {
  const c = getCtx(), t = c.currentTime;
  const buf = c.createBuffer(1, c.sampleRate * 0.8, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const lp = c.createBiquadFilter();
  lp.type = 'bandpass';
  lp.frequency.value = 6000;
  lp.Q.value = 0.5;
  const g = c.createGain();
  g.gain.setValueAtTime(0.3, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
  src.connect(lp).connect(g).connect(c.destination);
  src.start(t);
}

function ride() {
  const c = getCtx(), t = c.currentTime;
  const buf = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 10000;
  bp.Q.value = 2;
  const g = c.createGain();
  g.gain.setValueAtTime(0.2, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  src.connect(bp).connect(g).connect(c.destination);
  src.start(t);
  // Bell
  const osc = c.createOscillator();
  const og = c.createGain();
  osc.frequency.value = 5500;
  osc.type = 'sine';
  og.gain.setValueAtTime(0.08, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  osc.connect(og).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.3);
}

function perc(freq) {
  return () => {
    const c = getCtx(), t = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, t + 0.06);
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(g).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  };
}

function fx(freq, type = 'sawtooth') {
  return () => {
    const c = getCtx(), t = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.3, t + 0.2);
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(freq * 4, t);
    lp.frequency.exponentialRampToValueAtTime(200, t + 0.2);
    osc.connect(lp).connect(g).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  };
}

function metronomeClick() {
  const c = getCtx(), t = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = 1000;
  g.gain.setValueAtTime(0.15, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.03);
}

// ---- Pad definitions (Maschine MK2 layout) ----
// Maschine MK2: pads numbered 1-16, bottom-left to top-right
// Row 1 (bottom): Pads 1-4   -> keys Z X C V
// Row 2:          Pads 5-8   -> keys A S D F
// Row 3:          Pads 9-12  -> keys Q W E R
// Row 4 (top):    Pads 13-16 -> keys 1 2 3 4

export const PADS = [
  // Row 4 (top) — displayed first in grid
  { id: 13, key: '1', name: 'FX 1',      color: 'var(--pad-fx)',    play: fx(600, 'sawtooth') },
  { id: 14, key: '2', name: 'FX 2',      color: 'var(--pad-fx)',    play: fx(400, 'square') },
  { id: 15, key: '3', name: 'FX 3',      color: 'var(--pad-fx)',    play: fx(300, 'sawtooth') },
  { id: 16, key: '4', name: 'FX 4',      color: 'var(--pad-fx)',    play: fx(200, 'square') },
  // Row 3
  { id: 9,  key: 'Q', name: 'CRASH',     color: 'var(--pad-crash)', play: crash },
  { id: 10, key: 'W', name: 'RIDE',      color: 'var(--pad-ride)',  play: ride },
  { id: 11, key: 'E', name: 'PERC 1',    color: 'var(--pad-perc)',  play: perc(800) },
  { id: 12, key: 'R', name: 'PERC 2',    color: 'var(--pad-perc)',  play: perc(600) },
  // Row 2
  { id: 5,  key: 'A', name: 'CLAP',      color: 'var(--pad-clap)',  play: clap },
  { id: 6,  key: 'S', name: 'TOM LO',    color: 'var(--pad-tom)',   play: tom(100) },
  { id: 7,  key: 'D', name: 'TOM MID',   color: 'var(--pad-tom)',   play: tom(150) },
  { id: 8,  key: 'F', name: 'TOM HI',    color: 'var(--pad-tom)',   play: tom(220) },
  // Row 1 (bottom)
  { id: 1,  key: 'Z', name: 'KICK',      color: 'var(--pad-kick)',  play: kick },
  { id: 2,  key: 'X', name: 'SNARE',     color: 'var(--pad-snare)', play: snare },
  { id: 3,  key: 'C', name: 'HI-HAT',    color: 'var(--pad-hihat)', play: hihatClosed },
  { id: 4,  key: 'V', name: 'OPEN HH',   color: 'var(--pad-ohat)', play: hihatOpen },
];

// Quick lookup by key
export const PAD_BY_KEY = {};
for (const p of PADS) PAD_BY_KEY[p.key] = p;

// Quick lookup by pad id
export const PAD_BY_ID = {};
for (const p of PADS) PAD_BY_ID[p.id] = p;

export function playPad(padId) {
  const p = PAD_BY_ID[padId];
  if (p) p.play();
}

export function playMetronome() {
  metronomeClick();
}
