// Song / pattern definitions
// Each note: { beat, pad } where beat is in quarter-note units (0-indexed)
// beat 0 = first beat, beat 1 = second quarter note, etc.
// pad = pad id (1-16)

export const SONGS = [
  {
    id: 'basic-kick-snare',
    title: 'Kick & Snare Basics',
    description: 'Learn the foundation — kick on 1 & 3, snare on 2 & 4',
    bpm: 90,
    difficulty: 1,
    padsUsed: [1, 2],
    bars: 4,
    notes: buildKickSnare(4),
  },
  {
    id: 'hihat-groove',
    title: 'Hi-Hat Groove',
    description: 'Add eighth-note hi-hats to the basic beat',
    bpm: 95,
    difficulty: 2,
    padsUsed: [1, 2, 3],
    bars: 4,
    notes: buildHiHatGroove(4),
  },
  {
    id: 'open-hat-funk',
    title: 'Open Hat Funk',
    description: 'Mix open and closed hi-hats for a funky groove',
    bpm: 100,
    difficulty: 2,
    padsUsed: [1, 2, 3, 4],
    bars: 4,
    notes: buildOpenHatFunk(4),
  },
  {
    id: 'clap-layers',
    title: 'Clap Layering',
    description: 'Layer claps with snares on the backbeat — Maschine style',
    bpm: 95,
    difficulty: 3,
    padsUsed: [1, 2, 3, 5],
    bars: 4,
    notes: buildClapLayers(4),
  },
  {
    id: 'tom-fill',
    title: 'Tom Fills',
    description: 'Play descending tom fills across the pads',
    bpm: 100,
    difficulty: 3,
    padsUsed: [1, 2, 3, 6, 7, 8],
    bars: 4,
    notes: buildTomFill(4),
  },
  {
    id: 'crash-ride',
    title: 'Crash & Ride',
    description: 'Use cymbals to add accents and groove — pads 9 & 10',
    bpm: 100,
    difficulty: 3,
    padsUsed: [1, 2, 3, 9, 10],
    bars: 4,
    notes: buildCrashRide(4),
  },
  {
    id: 'full-kit-groove',
    title: 'Full Kit Groove',
    description: 'Combine kick, snare, hats, claps, and toms',
    bpm: 105,
    difficulty: 4,
    padsUsed: [1, 2, 3, 4, 5, 6, 7, 8],
    bars: 4,
    notes: buildFullKit(4),
  },
  {
    id: 'fx-drops',
    title: 'FX Drops',
    description: 'Trigger FX pads 13-16 at the right moments — top row mastery',
    bpm: 110,
    difficulty: 4,
    padsUsed: [1, 2, 3, 13, 14, 15, 16],
    bars: 4,
    notes: buildFXDrops(4),
  },
  {
    id: 'maschine-master',
    title: 'Maschine Master',
    description: 'The ultimate test — all 16 pads across a complex pattern',
    bpm: 115,
    difficulty: 5,
    padsUsed: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    bars: 8,
    notes: buildMaschineMaster(8),
  },
];

// ---- Pattern Builders ----

function buildKickSnare(bars) {
  const notes = [];
  for (let bar = 0; bar < bars; bar++) {
    const b = bar * 4;
    notes.push({ beat: b, pad: 1 });       // Kick on 1
    notes.push({ beat: b + 1, pad: 2 });   // Snare on 2
    notes.push({ beat: b + 2, pad: 1 });   // Kick on 3
    notes.push({ beat: b + 3, pad: 2 });   // Snare on 4
  }
  return notes;
}

function buildHiHatGroove(bars) {
  const notes = [];
  for (let bar = 0; bar < bars; bar++) {
    const b = bar * 4;
    // Hi-hats on eighth notes
    for (let i = 0; i < 8; i++) {
      notes.push({ beat: b + i * 0.5, pad: 3 });
    }
    // Kick on 1 and 3
    notes.push({ beat: b, pad: 1 });
    notes.push({ beat: b + 2, pad: 1 });
    // Snare on 2 and 4
    notes.push({ beat: b + 1, pad: 2 });
    notes.push({ beat: b + 3, pad: 2 });
  }
  return notes;
}

function buildOpenHatFunk(bars) {
  const notes = [];
  for (let bar = 0; bar < bars; bar++) {
    const b = bar * 4;
    // Kick
    notes.push({ beat: b, pad: 1 });
    notes.push({ beat: b + 2, pad: 1 });
    notes.push({ beat: b + 2.5, pad: 1 });
    // Snare
    notes.push({ beat: b + 1, pad: 2 });
    notes.push({ beat: b + 3, pad: 2 });
    // Closed hi-hats
    notes.push({ beat: b, pad: 3 });
    notes.push({ beat: b + 0.5, pad: 3 });
    notes.push({ beat: b + 1, pad: 3 });
    notes.push({ beat: b + 2, pad: 3 });
    notes.push({ beat: b + 3, pad: 3 });
    // Open hi-hat on the "and" of 2 and "and" of 4
    notes.push({ beat: b + 1.5, pad: 4 });
    notes.push({ beat: b + 3.5, pad: 4 });
  }
  return notes;
}

function buildClapLayers(bars) {
  const notes = [];
  for (let bar = 0; bar < bars; bar++) {
    const b = bar * 4;
    // Hi-hats
    for (let i = 0; i < 8; i++) {
      notes.push({ beat: b + i * 0.5, pad: 3 });
    }
    // Kick
    notes.push({ beat: b, pad: 1 });
    notes.push({ beat: b + 2, pad: 1 });
    // Snare + Clap layered on 2 and 4
    notes.push({ beat: b + 1, pad: 2 });
    notes.push({ beat: b + 1, pad: 5 });
    notes.push({ beat: b + 3, pad: 2 });
    notes.push({ beat: b + 3, pad: 5 });
  }
  return notes;
}

function buildTomFill(bars) {
  const notes = [];
  for (let bar = 0; bar < bars; bar++) {
    const b = bar * 4;
    if (bar % 2 === 0) {
      // Normal groove bars
      for (let i = 0; i < 8; i++) notes.push({ beat: b + i * 0.5, pad: 3 });
      notes.push({ beat: b, pad: 1 });
      notes.push({ beat: b + 2, pad: 1 });
      notes.push({ beat: b + 1, pad: 2 });
      notes.push({ beat: b + 3, pad: 2 });
    } else {
      // Tom fill bar
      notes.push({ beat: b, pad: 8 });       // Tom hi
      notes.push({ beat: b + 0.5, pad: 8 }); // Tom hi
      notes.push({ beat: b + 1, pad: 7 });   // Tom mid
      notes.push({ beat: b + 1.5, pad: 7 }); // Tom mid
      notes.push({ beat: b + 2, pad: 6 });   // Tom lo
      notes.push({ beat: b + 2.5, pad: 6 }); // Tom lo
      notes.push({ beat: b + 3, pad: 1 });   // Kick
      notes.push({ beat: b + 3.5, pad: 1 }); // Kick
    }
  }
  return notes;
}

function buildCrashRide(bars) {
  const notes = [];
  for (let bar = 0; bar < bars; bar++) {
    const b = bar * 4;
    // Crash on beat 1 of first bar
    if (bar === 0 || bar === 2) {
      notes.push({ beat: b, pad: 9 });
    }
    // Ride on quarter notes
    for (let i = 0; i < 4; i++) {
      notes.push({ beat: b + i, pad: 10 });
    }
    // Kick
    notes.push({ beat: b, pad: 1 });
    notes.push({ beat: b + 2, pad: 1 });
    // Snare
    notes.push({ beat: b + 1, pad: 2 });
    notes.push({ beat: b + 3, pad: 2 });
    // Hi-hat off-beats
    notes.push({ beat: b + 0.5, pad: 3 });
    notes.push({ beat: b + 1.5, pad: 3 });
    notes.push({ beat: b + 2.5, pad: 3 });
    notes.push({ beat: b + 3.5, pad: 3 });
  }
  return notes;
}

function buildFullKit(bars) {
  const notes = [];
  for (let bar = 0; bar < bars; bar++) {
    const b = bar * 4;
    // Core groove
    notes.push({ beat: b, pad: 1 });       // Kick
    notes.push({ beat: b + 2, pad: 1 });
    notes.push({ beat: b + 2.75, pad: 1 }); // Ghost kick
    notes.push({ beat: b + 1, pad: 2 });   // Snare
    notes.push({ beat: b + 3, pad: 2 });
    // Clap layer on 3
    notes.push({ beat: b + 3, pad: 5 });
    // Hi-hats
    for (let i = 0; i < 4; i++) {
      notes.push({ beat: b + i, pad: 3 });
    }
    // Open hat
    notes.push({ beat: b + 1.5, pad: 4 });
    notes.push({ beat: b + 3.5, pad: 4 });
    // Tom fill on last bar
    if (bar === bars - 1) {
      notes.push({ beat: b + 3, pad: 8 });
      notes.push({ beat: b + 3.25, pad: 7 });
      notes.push({ beat: b + 3.5, pad: 6 });
      notes.push({ beat: b + 3.75, pad: 6 });
    }
  }
  return notes;
}

function buildFXDrops(bars) {
  const notes = [];
  for (let bar = 0; bar < bars; bar++) {
    const b = bar * 4;
    // Basic groove
    notes.push({ beat: b, pad: 1 });
    notes.push({ beat: b + 2, pad: 1 });
    notes.push({ beat: b + 1, pad: 2 });
    notes.push({ beat: b + 3, pad: 2 });
    for (let i = 0; i < 8; i++) notes.push({ beat: b + i * 0.5, pad: 3 });
    // FX on specific beats
    if (bar === 0) notes.push({ beat: b, pad: 13 });
    if (bar === 1) notes.push({ beat: b + 2, pad: 14 });
    if (bar === 2) notes.push({ beat: b, pad: 15 });
    if (bar === 3) {
      notes.push({ beat: b, pad: 16 });
      notes.push({ beat: b + 2, pad: 13 });
      notes.push({ beat: b + 3, pad: 14 });
      notes.push({ beat: b + 3.5, pad: 15 });
      notes.push({ beat: b + 3.75, pad: 16 });
    }
  }
  return notes;
}

function buildMaschineMaster(bars) {
  const notes = [];
  for (let bar = 0; bar < bars; bar++) {
    const b = bar * 4;
    // Kick pattern
    notes.push({ beat: b, pad: 1 });
    notes.push({ beat: b + 2, pad: 1 });
    if (bar % 2 === 1) notes.push({ beat: b + 2.5, pad: 1 });
    // Snare
    notes.push({ beat: b + 1, pad: 2 });
    notes.push({ beat: b + 3, pad: 2 });
    // Hi-hats
    for (let i = 0; i < 8; i++) notes.push({ beat: b + i * 0.5, pad: 3 });
    // Open hat
    if (bar % 2 === 0) notes.push({ beat: b + 1.5, pad: 4 });
    // Clap
    if (bar % 2 === 1) notes.push({ beat: b + 3, pad: 5 });
    // Toms on fill bars
    if (bar === 3 || bar === 7) {
      notes.push({ beat: b + 2, pad: 8 });
      notes.push({ beat: b + 2.5, pad: 7 });
      notes.push({ beat: b + 3, pad: 6 });
    }
    // Crash on bar 1 and 5
    if (bar === 0 || bar === 4) notes.push({ beat: b, pad: 9 });
    // Ride
    if (bar >= 4) {
      for (let i = 0; i < 4; i++) notes.push({ beat: b + i, pad: 10 });
    }
    // Percs on even bars
    if (bar % 2 === 0 && bar > 0) {
      notes.push({ beat: b + 0.75, pad: 11 });
      notes.push({ beat: b + 2.75, pad: 12 });
    }
    // FX hits on last 2 bars
    if (bar === 6) notes.push({ beat: b, pad: 13 });
    if (bar === 7) {
      notes.push({ beat: b, pad: 14 });
      notes.push({ beat: b + 3.5, pad: 13 });
      notes.push({ beat: b + 3.75, pad: 14 });
    }
  }
  return notes;
}
