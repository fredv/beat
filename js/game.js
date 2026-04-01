// Core game engine
import { playPad, playMetronome } from './audio.js';

// Timing windows (in seconds)
const PERFECT_WINDOW = 0.045;
const GREAT_WINDOW = 0.09;
const GOOD_WINDOW = 0.15;
const MISS_THRESHOLD = 0.18; // Notes past this are auto-missed

const COMBO_MULT_THRESHOLDS = [0, 10, 25, 50, 100]; // combo -> multiplier index

const PREVIEW_BARS = 1; // Play this many bars as a groove preview before countdown

export function createGame(song) {
  const beatsPerSec = song.bpm / 60;
  const secPerBeat = 60 / song.bpm;
  const totalBeats = song.bars * 4;
  const previewBeats = PREVIEW_BARS * 4;
  const previewSec = previewBeats * secPerBeat;

  // Deep copy notes and sort by beat
  const notes = song.notes
    .map(n => ({ ...n, hit: false, missed: false }))
    .sort((a, b) => a.beat - b.beat);

  // Build preview schedule: first bar's notes played automatically
  const previewNotes = notes
    .filter(n => n.beat < previewBeats)
    .map(n => ({ beat: n.beat, pad: n.pad }));

  return {
    song,
    notes,
    beatsPerSec,
    secPerBeat,
    totalBeats,
    // Preview phase
    previewSec,
    previewBeats,
    previewNotes,
    previewPlayed: new Set(),
    phase: 'preview', // 'preview' -> 'countdown' -> 'playing'
    // Timing
    startTime: 0,
    currentBeat: -4, // set properly during phases
    countdown: 4,
    elapsed: 0,
    finished: false,
    // Scoring
    score: 0,
    combo: 0,
    maxCombo: 0,
    multiplier: 1,
    perfect: 0,
    great: 0,
    good: 0,
    missed: 0,
    // Visual effects
    effects: [],
    lastRating: null,
    // Metronome tracking
    lastMetronomeBeat: -999,
    // Preview message
    previewMessage: 'LISTEN TO THE GROOVE...',
  };
}

export function startGame(game) {
  game.startTime = performance.now() / 1000;
}

export function updateGame(game) {
  const now = performance.now() / 1000;
  game.elapsed = now - game.startTime;

  const countdownBeats = 4;
  const countdownSec = countdownBeats * game.secPerBeat;

  if (game.phase === 'preview') {
    // During preview, auto-play the first bar so player hears the groove
    const previewBeat = game.elapsed * game.beatsPerSec;
    for (const pn of game.previewNotes) {
      const key = `${pn.beat}-${pn.pad}`;
      if (!game.previewPlayed.has(key) && previewBeat >= pn.beat) {
        game.previewPlayed.add(key);
        playPad(pn.pad);
      }
    }
    // Keep the highway frozen (notes visible but not scrolling toward hit line)
    game.currentBeat = -countdownBeats - 2;
    game.countdown = countdownBeats;

    // Transition to countdown after preview finishes
    if (game.elapsed >= game.previewSec + 0.3) { // small gap after preview
      game.phase = 'countdown';
      game.phaseStart = now;
    }
    return;
  }

  // Time since countdown phase started
  const phaseElapsed = now - game.phaseStart;

  if (game.phase === 'countdown') {
    game.currentBeat = (phaseElapsed - countdownSec) * game.beatsPerSec;
    game.countdown = Math.max(0, countdownSec - phaseElapsed);

    // Metronome clicks during countdown
    const absoluteBeat = Math.floor(phaseElapsed * game.beatsPerSec);
    if (absoluteBeat > game.lastMetronomeBeat) {
      game.lastMetronomeBeat = absoluteBeat;
      playMetronome();
    }

    if (game.countdown <= 0) {
      game.phase = 'playing';
      game.previewMessage = null;
    }
    return;
  }

  // Playing phase
  game.currentBeat = (phaseElapsed - countdownSec) * game.beatsPerSec;
  game.countdown = 0;

  // Metronome during play
  const absoluteBeat = Math.floor(phaseElapsed * game.beatsPerSec);
  if (absoluteBeat > game.lastMetronomeBeat && game.currentBeat < game.totalBeats) {
    game.lastMetronomeBeat = absoluteBeat;
    playMetronome();
  }

  // Auto-miss notes that have passed
  const currentTimeSec = game.currentBeat * game.secPerBeat;
  for (const note of game.notes) {
    if (note.hit || note.missed) continue;
    const noteTimeSec = note.beat * game.secPerBeat;
    if (currentTimeSec - noteTimeSec > MISS_THRESHOLD) {
      note.missed = true;
      game.missed++;
      game.combo = 0;
      game.multiplier = 1;
      game.lastRating = 'miss';
      game.effects.push({ type: 'miss', pad: note.pad, time: Date.now() });
    }
  }

  // Clean old effects
  game.effects = game.effects.filter(e => Date.now() - e.time < 500);

  // Check if song is over
  if (game.currentBeat >= game.totalBeats + 2 && !game.finished) {
    game.finished = true;
  }
}

export function handleHit(game, padId) {
  if (game.finished) return;

  // Always play the sound
  playPad(padId);

  const currentTimeSec = game.currentBeat * game.secPerBeat;

  // Find the closest unhit note for this pad within the hit window
  let bestNote = null;
  let bestDiff = Infinity;

  for (const note of game.notes) {
    if (note.hit || note.missed || note.pad !== padId) continue;
    const noteTimeSec = note.beat * game.secPerBeat;
    const diff = Math.abs(currentTimeSec - noteTimeSec);
    if (diff < bestDiff && diff <= GOOD_WINDOW) {
      bestDiff = diff;
      bestNote = note;
    }
  }

  if (!bestNote) return; // No matching note — just played the sound freely

  bestNote.hit = true;

  let rating, points;
  if (bestDiff <= PERFECT_WINDOW) {
    rating = 'perfect';
    points = 300;
    game.perfect++;
  } else if (bestDiff <= GREAT_WINDOW) {
    rating = 'great';
    points = 200;
    game.great++;
  } else {
    rating = 'good';
    points = 100;
    game.good++;
  }

  game.combo++;
  if (game.combo > game.maxCombo) game.maxCombo = game.combo;

  // Update multiplier
  let multIdx = 0;
  for (let i = COMBO_MULT_THRESHOLDS.length - 1; i >= 0; i--) {
    if (game.combo >= COMBO_MULT_THRESHOLDS[i]) { multIdx = i; break; }
  }
  game.multiplier = multIdx + 1;

  game.score += points * game.multiplier;
  game.lastRating = rating;
  game.effects.push({ type: rating, pad: padId, time: Date.now() });
}

export function getResults(game) {
  const total = game.notes.length;
  const hit = game.perfect + game.great + game.good;
  const accuracy = total > 0 ? Math.round((hit / total) * 100) : 0;
  let grade;
  if (accuracy >= 98 && game.missed === 0) grade = 'S';
  else if (accuracy >= 95) grade = 'A';
  else if (accuracy >= 85) grade = 'B';
  else if (accuracy >= 70) grade = 'C';
  else if (accuracy >= 50) grade = 'D';
  else grade = 'F';

  return {
    score: game.score,
    maxCombo: game.maxCombo,
    perfect: game.perfect,
    great: game.great,
    good: game.good,
    missed: game.missed,
    accuracy,
    grade,
  };
}
