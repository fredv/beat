// Main entry point — wires up screens, input, and game loop
import { initAudio, PADS, PAD_BY_KEY } from './audio.js';
import { SONGS } from './songs.js';
import { createGame, startGame, updateGame, handleHit, getResults } from './game.js';
import { initRenderer, destroyRenderer, render } from './renderer.js';

// ---- Screen management ----
const screens = {
  title: document.getElementById('screen-title'),
  select: document.getElementById('screen-select'),
  game: document.getElementById('screen-game'),
  results: document.getElementById('screen-results'),
};

function showScreen(name) {
  for (const [k, el] of Object.entries(screens)) {
    el.classList.toggle('active', k === name);
  }
}

// ---- Title Screen ----
function initTitle() {
  // Build pad preview grid
  const preview = document.getElementById('pad-preview');
  preview.innerHTML = '';
  for (const pad of PADS) {
    const cell = document.createElement('div');
    cell.className = 'pad-cell';
    cell.textContent = pad.key;
    cell.style.borderColor = pad.color;
    preview.appendChild(cell);
  }

  document.getElementById('btn-start').addEventListener('click', () => {
    initAudio();
    showScreen('select');
  });

  // Any key also starts
  const startOnKey = () => {
    initAudio();
    showScreen('select');
    document.removeEventListener('keydown', startOnKey);
  };
  document.addEventListener('keydown', startOnKey);
}

// ---- Song Select Screen ----
let selectedSong = null;
let customBpm = null;    // null = use song default
let activeSongDefault = null;

function updateBpmDisplay() {
  const bpmVal = document.getElementById('bpm-value');
  const bpmAdjust = document.getElementById('bpm-adjust');
  if (!activeSongDefault) {
    bpmAdjust.classList.add('hidden');
    return;
  }
  bpmAdjust.classList.remove('hidden');
  const bpm = customBpm ?? activeSongDefault;
  bpmVal.textContent = bpm;
}

function initSelect() {
  const list = document.getElementById('song-list');

  function buildList() {
    list.innerHTML = '';
    for (const song of SONGS) {
      const card = document.createElement('div');
      card.className = 'song-card';
      card.innerHTML = `
        <div class="song-info">
          <div class="song-title">${song.title}</div>
          <div class="song-meta">${song.bpm} BPM — ${song.bars} bars — ${song.description}</div>
        </div>
        <div class="song-difficulty">
          ${Array.from({ length: 5 }, (_, i) =>
            `<div class="diff-dot ${i < song.difficulty ? 'filled' : ''}"></div>`
          ).join('')}
        </div>
      `;
      card.addEventListener('click', () => {
        selectedSong = song;
        activeSongDefault = song.bpm;
        customBpm = null;
        updateBpmDisplay();
      });
      // Double-click to launch immediately
      card.addEventListener('dblclick', () => {
        selectedSong = song;
        activeSongDefault = song.bpm;
        launchGameWithBpm(song);
      });
      list.appendChild(card);
    }
  }
  buildList();

  // BPM adjustment buttons
  const bpmAdjust = document.getElementById('bpm-adjust');
  bpmAdjust.classList.add('hidden');

  function adjustBpm(delta) {
    if (!activeSongDefault) return;
    const current = customBpm ?? activeSongDefault;
    customBpm = Math.max(40, Math.min(300, current + delta));
    updateBpmDisplay();
  }

  document.getElementById('bpm-down-10').addEventListener('click', (e) => { e.stopPropagation(); adjustBpm(-10); });
  document.getElementById('bpm-down').addEventListener('click', (e) => { e.stopPropagation(); adjustBpm(-5); });
  document.getElementById('bpm-up').addEventListener('click', (e) => { e.stopPropagation(); adjustBpm(5); });
  document.getElementById('bpm-up-10').addEventListener('click', (e) => { e.stopPropagation(); adjustBpm(10); });
  document.getElementById('bpm-reset').addEventListener('click', (e) => {
    e.stopPropagation();
    customBpm = null;
    updateBpmDisplay();
  });

  // Play button — add a start button below the BPM adjuster
  // We'll repurpose the song card click: single click selects, showing BPM adjuster;
  // user clicks a "PLAY" button or double-clicks to start.
  const playBtn = document.createElement('button');
  playBtn.id = 'btn-play-song';
  playBtn.className = 'btn-primary';
  playBtn.textContent = 'PLAY';
  playBtn.style.marginBottom = '16px';
  playBtn.addEventListener('click', () => {
    if (selectedSong) launchGameWithBpm(selectedSong);
  });
  bpmAdjust.after(playBtn);

  // Build pad legend
  const legend = document.getElementById('pad-legend');
  legend.innerHTML = '';
  for (const pad of PADS) {
    const el = document.createElement('div');
    el.className = 'legend-pad';
    el.style.borderColor = pad.color;
    el.innerHTML = `<span class="pad-key" style="color:${pad.color}">${pad.key}</span><span class="pad-name">${pad.name}</span>`;
    legend.appendChild(el);
  }

  document.getElementById('btn-back-title').addEventListener('click', () => showScreen('title'));
}

function launchGameWithBpm(song) {
  const bpm = customBpm ?? song.bpm;
  const adjusted = { ...song, bpm };
  launchGame(adjusted);
}

// ---- Game Screen ----
let game = null;
let rafId = null;

function launchGame(song) {
  showScreen('game');
  initAudio();

  // Build pad display
  const padDisplay = document.getElementById('pad-display');
  padDisplay.innerHTML = '';
  for (const pad of PADS) {
    const btn = document.createElement('div');
    btn.className = 'pad-btn';
    btn.dataset.padId = pad.id;
    btn.style.borderColor = pad.color;
    btn.innerHTML = `<span class="pad-btn-key" style="color:${pad.color}">${pad.key}</span><span class="pad-btn-name">${pad.name}</span>`;
    // Touch/click support
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      triggerPad(pad.id, btn);
    });
    padDisplay.appendChild(btn);
  }

  // Init renderer
  const canvas = document.getElementById('game-canvas');
  initRenderer(canvas, song.padsUsed);

  // Create game
  game = createGame(song);
  startGame(game);

  // Start game loop
  function gameLoop() {
    updateGame(game);
    render(game);
    updateHUD(game);
    if (game.finished) {
      cancelAnimationFrame(rafId);
      destroyRenderer();
      showResults(game);
      return;
    }
    rafId = requestAnimationFrame(gameLoop);
  }
  rafId = requestAnimationFrame(gameLoop);
}

function triggerPad(padId, btnEl) {
  if (!game || game.finished) return;
  handleHit(game, padId);
  // Visual feedback
  if (btnEl) {
    btnEl.classList.add('hit');
    setTimeout(() => btnEl.classList.remove('hit'), 100);
  }
}

function updateHUD(game) {
  document.getElementById('hud-score').textContent = game.score.toLocaleString();
  const comboEl = document.getElementById('hud-combo');
  comboEl.textContent = game.combo > 1 ? `${game.combo} COMBO` : '';
  document.getElementById('hud-multiplier').textContent = `x${game.multiplier}`;
  document.getElementById('hud-bpm').textContent = game.song.bpm;

  const ratingEl = document.getElementById('hud-rating');
  if (game.lastRating) {
    ratingEl.textContent = game.lastRating.toUpperCase();
    ratingEl.className = 'rating-display ' + game.lastRating;
  }

  // Progress bar
  const progress = Math.min(100, Math.max(0, (game.currentBeat / game.totalBeats) * 100));
  document.getElementById('hud-progress-fill').style.width = progress + '%';
}

// ---- Results Screen ----
function showResults(game) {
  showScreen('results');
  const r = getResults(game);
  document.getElementById('results-song').textContent = game.song.title;
  document.getElementById('results-score').textContent = r.score.toLocaleString();
  document.getElementById('results-combo').textContent = r.maxCombo;
  document.getElementById('results-perfect').textContent = r.perfect;
  document.getElementById('results-great').textContent = r.great;
  document.getElementById('results-good').textContent = r.good;
  document.getElementById('results-missed').textContent = r.missed;
  document.getElementById('results-accuracy').textContent = r.accuracy + '%';
  document.getElementById('results-grade').textContent = r.grade;
}

document.getElementById('btn-retry').addEventListener('click', () => {
  if (selectedSong) launchGameWithBpm(selectedSong);
});
document.getElementById('btn-back-select').addEventListener('click', () => showScreen('select'));

// ---- Keyboard Input ----
document.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  const key = e.key.toUpperCase();
  const pad = PAD_BY_KEY[key];
  if (!pad) return;

  // Prevent browser default (e.g. "z" = undo/back) when game is active
  if (screens.game.classList.contains('active')) {
    e.preventDefault();
    e.stopPropagation();
    const btnEl = document.querySelector(`.pad-btn[data-pad-id="${pad.id}"]`);
    triggerPad(pad.id, btnEl);
  }
});

// ---- Escape to quit game ----
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (screens.game.classList.contains('active')) {
      cancelAnimationFrame(rafId);
      destroyRenderer();
      game = null;
      showScreen('select');
    } else if (screens.results.classList.contains('active')) {
      showScreen('select');
    }
  }
});

// ---- Init ----
initTitle();
initSelect();
