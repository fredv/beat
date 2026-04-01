// Canvas renderer — Guitar-Hero-style scrolling highway
import { PAD_BY_ID } from './audio.js';

const HIT_LINE_Y_RATIO = 0.82; // Where the hit line sits (from top)
const NOTE_SPEED = 400;        // Pixels per second of scroll
const NOTE_HEIGHT = 18;
const NOTE_RADIUS = 6;

let canvas, ctx, W, H;
// Map of active lane indices by pad id — set during init
let laneMap = {};
let laneCount = 0;
let laneColors = [];
let laneLabels = [];

export function initRenderer(canvasEl, padsUsed) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d');
  resize();

  // Build lane map from padsUsed
  laneMap = {};
  laneColors = [];
  laneLabels = [];
  padsUsed.forEach((padId, i) => {
    laneMap[padId] = i;
    const pad = PAD_BY_ID[padId];
    laneColors.push(pad ? pad.color : '#555');
    laneLabels.push(pad ? pad.key : '?');
  });
  laneCount = padsUsed.length;

  window.addEventListener('resize', resize);
}

export function destroyRenderer() {
  window.removeEventListener('resize', resize);
}

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  W = rect.width;
  H = rect.height;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// Convert a color CSS variable value to an actual color for canvas
function resolveColor(cssVar) {
  // cssVar looks like "var(--pad-kick)"
  const match = cssVar.match(/var\((.+)\)/);
  if (!match) return cssVar;
  return getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim();
}

export function render(gameState) {
  ctx.clearRect(0, 0, W, H);
  const hitY = H * HIT_LINE_Y_RATIO;

  const laneWidth = Math.min(80, (W - 40) / laneCount);
  const totalWidth = laneWidth * laneCount;
  const offsetX = (W - totalWidth) / 2;

  // Background lanes
  for (let i = 0; i < laneCount; i++) {
    const x = offsetX + i * laneWidth;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(20,20,35,0.6)' : 'rgba(25,25,45,0.6)';
    ctx.fillRect(x, 0, laneWidth, H);
    // Lane separator
    ctx.strokeStyle = 'rgba(60,60,90,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  // Hit line
  ctx.strokeStyle = 'rgba(255,107,0,0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(offsetX, hitY);
  ctx.lineTo(offsetX + totalWidth, hitY);
  ctx.stroke();

  // Glow effect on hit line
  ctx.shadowColor = '#ff6b00';
  ctx.shadowBlur = 12;
  ctx.strokeStyle = 'rgba(255,107,0,0.3)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(offsetX, hitY);
  ctx.lineTo(offsetX + totalWidth, hitY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Lane labels at hit line
  ctx.font = '700 13px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let i = 0; i < laneCount; i++) {
    const cx = offsetX + i * laneWidth + laneWidth / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillText(laneLabels[i], cx, hitY + 8);
  }

  // Draw notes
  const { notes, currentBeat, beatsPerSec } = gameState;
  const pxPerBeat = NOTE_SPEED / beatsPerSec;

  for (const note of notes) {
    if (note.hit || note.missed) continue;
    const lane = laneMap[note.pad];
    if (lane === undefined) continue;

    const beatDiff = note.beat - currentBeat;
    const noteY = hitY - beatDiff * pxPerBeat;

    // Only draw if visible
    if (noteY < -NOTE_HEIGHT || noteY > H + NOTE_HEIGHT) continue;

    const cx = offsetX + lane * laneWidth + laneWidth / 2;
    const color = resolveColor(laneColors[lane]);

    // Note body
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    roundRect(ctx, cx - laneWidth / 2 + 6, noteY - NOTE_HEIGHT / 2, laneWidth - 12, NOTE_HEIGHT, NOTE_RADIUS);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Note label
    ctx.fillStyle = '#fff';
    ctx.font = '700 11px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const pad = PAD_BY_ID[note.pad];
    ctx.fillText(pad ? pad.name : '', cx, noteY);
  }

  // Draw hit/miss effects
  for (const effect of gameState.effects) {
    const lane = laneMap[effect.pad];
    if (lane === undefined) continue;
    const cx = offsetX + lane * laneWidth + laneWidth / 2;
    const age = Date.now() - effect.time;
    const maxAge = 400;
    if (age > maxAge) continue;
    const progress = age / maxAge;
    const alpha = 1 - progress;

    if (effect.type === 'miss') {
      ctx.fillStyle = `rgba(255,51,85,${alpha * 0.3})`;
      ctx.fillRect(offsetX + lane * laneWidth, hitY - 20, laneWidth, 40);
    } else {
      const color = effect.type === 'perfect' ? '0,255,170' :
                    effect.type === 'great' ? '68,187,255' : '255,204,0';
      ctx.fillStyle = `rgba(${color},${alpha * 0.4})`;
      const expand = progress * 20;
      ctx.fillRect(offsetX + lane * laneWidth - expand / 2, hitY - 20 - expand / 2, laneWidth + expand, 40 + expand);
    }
  }

  // Beat markers (subtle horizontal lines for each beat)
  for (let beat = Math.floor(gameState.currentBeat); beat < gameState.currentBeat + 20; beat++) {
    const beatDiff = beat - gameState.currentBeat;
    const y = hitY - beatDiff * pxPerBeat;
    if (y < 0 || y > H) continue;
    const isMeasure = beat % 4 === 0;
    ctx.strokeStyle = isMeasure ? 'rgba(255,107,0,0.15)' : 'rgba(100,100,150,0.08)';
    ctx.lineWidth = isMeasure ? 1.5 : 0.5;
    ctx.beginPath();
    ctx.moveTo(offsetX, y);
    ctx.lineTo(offsetX + totalWidth, y);
    ctx.stroke();
  }

  // Countdown overlay
  if (gameState.countdown > 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ff6b00';
    ctx.font = '900 96px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.ceil(gameState.countdown), W / 2, H / 2);
    ctx.font = '400 18px system-ui';
    ctx.fillStyle = '#aaa';
    ctx.fillText('GET READY', W / 2, H / 2 + 60);
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
