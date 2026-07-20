import { STANDARD_TUNING } from '../data/chordFormulas';
import { createEmptyFretboard, FretboardState } from './types';

const MAX_BASE_FRET = 12; // a full octave up the neck — shapes repeat past this
const STRING_COUNT = 6;

export interface Voicing {
  fretboard: FretboardState;
  /** 0 = board shows open + frets 1-4 (no shift). N>0 = board shows frets N+1..N+4. */
  baseFret: number;
}

function fretOptionsFor(baseFret: number): number[] {
  const options = [baseFret + 1, baseFret + 2, baseFret + 3, baseFret + 4];
  if (baseFret === 0) options.unshift(0);
  return options;
}

/**
 * Builds a playable voicing for `root` (pitch class 0-11) that sounds every
 * interval in `required` (semitones from root) and, where a string is free,
 * as many of `optional` as convenient. Searches positions up the neck until
 * one works, since not every chord has a good voicing near the open frets.
 */
export function findVoicing(
  root: number,
  required: number[],
  optional: number[],
  tuning: number[] = STANDARD_TUNING
): Voicing | null {
  const wantedRequired = new Set(required.map((iv) => (root + iv) % 12));
  const wantedOptional = new Set(optional.map((iv) => (root + iv) % 12));

  for (let baseFret = 0; baseFret <= MAX_BASE_FRET; baseFret++) {
    const fretboard = findVoicingAtRoot(baseFret, root, wantedRequired, wantedOptional, tuning);
    if (fretboard) return { fretboard, baseFret };
  }
  return null;
}

/**
 * Same chord, every playable position up the neck — for stepping through
 * "the same chord, but higher up" with next/previous controls.
 */
export function findVoicingsAcrossNeck(
  root: number,
  required: number[],
  optional: number[],
  tuning: number[] = STANDARD_TUNING
): Voicing[] {
  const wantedRequired = new Set(required.map((iv) => (root + iv) % 12));
  const wantedOptional = new Set(optional.map((iv) => (root + iv) % 12));

  const voicings: Voicing[] = [];
  let lastShape = '';
  for (let baseFret = 0; baseFret <= MAX_BASE_FRET; baseFret++) {
    const fretboard = findVoicingAtRoot(baseFret, root, wantedRequired, wantedOptional, tuning);
    if (!fretboard) continue;
    // Adjacent windows overlap, so the same actual fret assignment can
    // surface at consecutive baseFret values — keep the later (tighter,
    // less padding above the notes) one instead of showing it twice.
    const shape = fretboard.map((s) => (s.type === 'fret' ? s.fret : s.type)).join(',');
    if (shape === lastShape) {
      voicings[voicings.length - 1] = { fretboard, baseFret };
    } else {
      voicings.push({ fretboard, baseFret });
    }
    lastShape = shape;
  }
  return voicings;
}

function findVoicingAtRoot(
  baseFret: number,
  root: number,
  wantedRequired: Set<number>,
  wantedOptional: Set<number>,
  tuning: number[]
): FretboardState | null {
  const fretOptions = fretOptionsFor(baseFret);
  for (let bassString = 0; bassString < STRING_COUNT; bassString++) {
    for (const f of fretOptions) {
      if ((tuning[bassString] + f) % 12 !== root) continue;
      const fretboard = buildFromBass(bassString, f, fretOptions, tuning, wantedRequired, wantedOptional);
      if (fretboard) return fretboard;
    }
  }
  return null;
}

function buildFromBass(
  bassString: number,
  bassFret: number,
  fretOptions: number[],
  tuning: number[],
  wantedRequired: Set<number>,
  wantedOptional: Set<number>
): FretboardState | null {
  const fretboard = createEmptyFretboard();
  for (let s = 0; s < bassString; s++) fretboard[s] = { type: 'muted' };
  fretboard[bassString] = bassFret === 0 ? { type: 'open' } : { type: 'fret', fret: bassFret };

  const covered = new Set<number>([(tuning[bassString] + bassFret) % 12]);

  for (let s = bassString + 1; s < STRING_COUNT; s++) {
    let bestFret: number | null = null;
    let bestIsRequired = false;
    for (const f of fretOptions) {
      const pc = (tuning[s] + f) % 12;
      if (covered.has(pc)) continue;
      if (wantedRequired.has(pc) && !bestIsRequired) {
        bestFret = f;
        bestIsRequired = true;
      } else if (wantedOptional.has(pc) && bestFret === null) {
        bestFret = f;
      }
    }
    if (bestFret !== null) {
      fretboard[s] = bestFret === 0 ? { type: 'open' } : { type: 'fret', fret: bestFret };
      covered.add((tuning[s] + bestFret) % 12);
    } else {
      fretboard[s] = { type: 'muted' };
    }
  }

  for (const pc of wantedRequired) {
    if (!covered.has(pc)) return null;
  }
  // The detector can't name a bare 2-note dyad (root + one other tone) as
  // anything but a power chord, so a voicing that thin isn't usable even if
  // it technically covers every required interval — keep searching for a
  // position where a third note (usually the optional 5th) is reachable.
  if (covered.size < 3) return null;
  return fretboard;
}
