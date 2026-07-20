import { NOTE_NAMES, STANDARD_TUNING } from '../data/chordFormulas';
import { ChordMatch, FretboardState } from './types';

// Semitone distance from a candidate root. Every one of the 12 possible
// pitch classes maps to exactly one of these "slots" — which slot a given
// semitone distance represents in the final chord symbol depends on what
// else is present (e.g. semitone 3 is a minor 3rd in a minor chord, but a
// sharp 9 in a chord that also has a major 3rd).
const FLAT9 = 1;
const NINTH = 2;
const MINOR3 = 3;
const MAJOR3 = 4;
const ELEVENTH = 5;
const SHARP11 = 6;
const FIFTH = 7;
const SHARP5 = 8;
const THIRTEENTH = 9;
const FLAT7 = 10;
const MAJOR7 = 11;

type Quality = 'major' | 'minor' | 'sus2' | 'sus4';

interface Analysis {
  suffix: string;
  qualityName: string;
  /** semitone-from-root -> short degree token, always includes 0 -> '1' */
  degreeLabels: Map<number, string>;
  /** Lower = simpler/more common, used to rank ties after root-position. */
  complexity: number;
}

const QUALITY_WORD: Record<string, string> = {
  '': 'Major',
  m: 'Minor',
  dim: 'Diminished',
  dim7: 'Diminished 7th',
  aug: 'Augmented',
  sus2: 'Suspended 2nd',
  sus4: 'Suspended 4th',
  '7sus4': '7 Suspended 4th',
  '9sus4': '9 Suspended 4th',
  '13sus4': '13 Suspended 4th',
  maj7: 'Major 7th',
  maj9: 'Major 9th',
  maj11: 'Major 11th',
  maj13: 'Major 13th',
  '7': 'Dominant 7th',
  '9': 'Dominant 9th',
  '11': 'Dominant 11th',
  '13': 'Dominant 13th',
  m7: 'Minor 7th',
  m9: 'Minor 9th',
  m11: 'Minor 11th',
  m13: 'Minor 13th',
  'm7b5': 'Half-Diminished 7th',
  '6': 'Major 6th',
  m6: 'Minor 6th',
  '6/9': 'Six-Nine',
  add9: 'Add 9',
  add11: 'Add 11',
  madd9: 'Minor Add 9',
};

const ALTERATION_WORD: Record<string, string> = {
  b5: '♭5',
  '#5': '♯5',
  b9: '♭9',
  '#9': '♯9',
  '#11': '♯11',
  b13: '♭13',
};

function analyze(present: Set<number>): Analysis | null {
  const has = (d: number) => present.has(d);
  const labels = new Map<number, string>([[0, '1']]);

  let quality: Quality;
  if (has(MAJOR3)) {
    quality = 'major';
    labels.set(MAJOR3, '3');
  } else if (has(MINOR3)) {
    quality = 'minor';
    labels.set(MINOR3, 'b3');
  } else if (has(ELEVENTH)) {
    quality = 'sus4';
    labels.set(ELEVENTH, '4');
  } else if (has(NINTH)) {
    quality = 'sus2';
    labels.set(NINTH, '2');
  } else {
    return null; // nothing establishes major/minor/sus — can't name this
  }

  if (has(FIFTH)) labels.set(FIFTH, '5');

  let seventh: 'maj7' | 'b7' | null = null;
  if (has(MAJOR7)) {
    seventh = 'maj7';
    labels.set(MAJOR7, '7');
  } else if (has(FLAT7)) {
    seventh = 'b7';
    labels.set(FLAT7, 'b7');
  }

  // Tritone: for a minor-quality chord this is always a flat 5 (the
  // diminished/half-diminished family). Otherwise, guitarists routinely
  // drop the natural 5th to make room for a #11 color tone, so treat it as
  // #11 whenever a 7th is present (or the 5th is too); only a bare major
  // triad with no 7th reads it as a b5 alteration.
  let tritoneRole: 'b5' | 'sharp11' | null = null;
  if (has(SHARP11)) {
    tritoneRole = quality === 'minor' ? 'b5' : seventh || has(FIFTH) ? 'sharp11' : 'b5';
    labels.set(SHARP11, tritoneRole === 'b5' ? 'b5' : '#11');
  }

  // Augmented 5th: #5 (replacing the 5th) if no perfect 5th is sounding,
  // otherwise it's a b13 tension stacked above a normal 5th.
  let sharpFiveRole: 'sharp5' | 'flat13' | null = null;
  if (has(SHARP5)) {
    sharpFiveRole = has(FIFTH) ? 'flat13' : 'sharp5';
    labels.set(SHARP5, sharpFiveRole === 'sharp5' ? '#5' : 'b13');
  }

  // A minor triad with a flat 5 and no true 7th, using the 13-slot as a
  // diminished 7th (enharmonically a major 6th) is a fully diminished chord.
  const isDim7 = quality === 'minor' && tritoneRole === 'b5' && !seventh && has(THIRTEENTH);
  if (isDim7) labels.set(THIRTEENTH, 'bb7');

  let sixOrThirteen: '6' | '13' | null = null;
  if (!isDim7 && has(THIRTEENTH)) {
    sixOrThirteen = seventh ? '13' : '6';
    labels.set(THIRTEENTH, sixOrThirteen);
  }

  const hasNinth = (quality === 'major' || quality === 'minor') && has(NINTH);
  if (hasNinth) labels.set(NINTH, '9');

  // A minor 3rd alongside an already-claimed major 3rd is a sharp 9, the
  // classic "Hendrix chord" tension — not a contradiction of the quality.
  const sharpNine = quality === 'major' && has(MINOR3);
  if (sharpNine) labels.set(MINOR3, '#9');

  const flatNine = has(FLAT9);
  if (flatNine) labels.set(FLAT9, 'b9');

  const hasEleventh = (quality === 'major' || quality === 'minor') && has(ELEVENTH);
  if (hasEleventh) labels.set(ELEVENTH, '11');

  // Every sounding note must be accounted for by some degree above, or this
  // root isn't a valid interpretation of the notes on the board (e.g. a 9th
  // sounding against a sus chord has nowhere to go — sus chords don't have
  // a slot for it).
  for (const semitone of present) {
    if (!labels.has(semitone)) return null;
  }

  // ---- assemble the chord symbol ----
  let suffix: string;
  let baseToken: string;
  const alterationTokens: string[] = [];
  if (tritoneRole === 'sharp11') alterationTokens.push('#11');
  if (sharpFiveRole === 'flat13') alterationTokens.push('b13');
  if (sharpNine) alterationTokens.push('#9');
  if (flatNine) alterationTokens.push('b9');

  if (quality === 'sus2' || quality === 'sus4') {
    const susWord = quality === 'sus4' ? 'sus4' : 'sus2';
    let num = '';
    if (sixOrThirteen === '13') num = '13';
    else if (hasNinth) num = '9';
    else if (seventh === 'b7') num = '7';
    baseToken = num + susWord;
    suffix = baseToken;
  } else if (isDim7) {
    baseToken = 'dim7';
    suffix = 'dim7';
  } else if (quality === 'minor' && tritoneRole === 'b5' && !seventh && !sixOrThirteen) {
    baseToken = 'dim';
    suffix = 'dim';
  } else if (quality === 'minor' && tritoneRole === 'b5' && seventh === 'b7') {
    baseToken = 'm7b5';
    suffix = 'm7b5';
  } else if (
    quality === 'major' &&
    sharpFiveRole === 'sharp5' &&
    !seventh &&
    !hasNinth &&
    !hasEleventh &&
    !sixOrThirteen
  ) {
    baseToken = 'aug';
    suffix = 'aug';
  } else {
    const minorPrefix = quality === 'minor' ? 'm' : '';
    let numberPart = '';
    if (seventh === 'maj7') {
      if (sixOrThirteen === '13') numberPart = 'maj13';
      else if (hasEleventh) numberPart = 'maj11';
      else if (hasNinth) numberPart = 'maj9';
      else numberPart = 'maj7';
      baseToken = quality === 'minor' ? 'm(maj7)' : numberPart;
    } else if (seventh === 'b7') {
      if (sixOrThirteen === '13') numberPart = '13';
      else if (hasEleventh) numberPart = '11';
      else if (hasNinth) numberPart = '9';
      else numberPart = '7';
      baseToken = minorPrefix + numberPart;
    } else if (sixOrThirteen === '6' && hasNinth) {
      baseToken = minorPrefix + '6/9';
    } else if (sixOrThirteen === '6') {
      baseToken = minorPrefix + '6';
    } else if (hasNinth) {
      baseToken = minorPrefix + 'add9';
    } else if (hasEleventh) {
      baseToken = minorPrefix + 'add11';
    } else {
      baseToken = minorPrefix;
    }

    if (tritoneRole === 'b5' && !alterationTokens.includes('#11')) alterationTokens.push('b5');
    if (sharpFiveRole === 'sharp5' && baseToken !== 'aug') alterationTokens.push('#5');
    suffix = baseToken + alterationTokens.join('');
  }

  const qualityName =
    (QUALITY_WORD[baseToken] ?? (quality === 'minor' ? 'Minor' : 'Major')) +
    (alterationTokens.length && QUALITY_WORD[baseToken]
      ? ' (' + alterationTokens.map((t) => ALTERATION_WORD[t] ?? t).join(', ') + ')'
      : '');

  const complexity =
    (seventh ? 1 : 0) +
    (hasNinth ? 1 : 0) +
    (hasEleventh ? 1 : 0) +
    (sixOrThirteen ? 1 : 0) +
    (sharpNine ? 2 : 0) +
    (flatNine ? 2 : 0) +
    (tritoneRole === 'sharp11' ? 1 : 0) +
    (tritoneRole === 'b5' ? 1 : 0) +
    (sharpFiveRole ? 2 : 0) +
    (isDim7 ? 2 : 0) +
    (quality === 'sus2' || quality === 'sus4' ? 1 : 0);

  return { suffix, qualityName, degreeLabels: labels, complexity };
}

function buildMatch(
  root: number,
  analysis: Analysis,
  bassPc: number,
  score: number
): ChordMatch {
  const isRootPosition = bassPc === root;
  const rootName = NOTE_NAMES[root];
  const bassName = isRootPosition ? undefined : NOTE_NAMES[bassPc];
  const degreesByPitchClass: Record<number, string> = {};
  analysis.degreeLabels.forEach((label, semitone) => {
    degreesByPitchClass[(root + semitone) % 12] = label;
  });
  return {
    root,
    suffix: analysis.suffix,
    qualityName: analysis.qualityName,
    name: rootName + analysis.suffix + (bassName ? `/${bassName}` : ''),
    bassName,
    intervalNames: Array.from(analysis.degreeLabels.values()),
    degreesByPitchClass,
    score,
  };
}

function powerChordMatch(root: number, bassPc: number): ChordMatch {
  const isRootPosition = bassPc === root;
  return {
    root,
    suffix: '5',
    qualityName: 'Power Chord',
    name: NOTE_NAMES[root] + '5' + (isRootPosition ? '' : `/${NOTE_NAMES[bassPc]}`),
    bassName: isRootPosition ? undefined : NOTE_NAMES[bassPc],
    intervalNames: ['1', '5'],
    degreesByPitchClass: { [root]: '1', [(root + 7) % 12]: '5' },
    score: (isRootPosition ? 0 : 200) + 10,
  };
}

/**
 * Identifies every chord that plausibly matches the notes currently
 * sounding on the fretboard, ranked most-likely first. Guitar voicings
 * routinely omit the 5th (and sometimes interior extensions like the 9th
 * or 11th in a 13th chord) — this treats every present note as needing an
 * explanation, but never requires a note that isn't there.
 */
export function identifyChords(
  fretboard: FretboardState,
  tuning: number[] = STANDARD_TUNING
): ChordMatch[] {
  const sounding: { pc: number; stringIndex: number }[] = [];
  fretboard.forEach((state, i) => {
    if (state.type === 'open') {
      sounding.push({ pc: tuning[i], stringIndex: i });
    } else if (state.type === 'fret') {
      sounding.push({ pc: (tuning[i] + state.fret) % 12, stringIndex: i });
    }
  });

  if (sounding.length < 2) return [];

  const pitchClasses = Array.from(new Set(sounding.map((n) => n.pc)));
  const bassPc = sounding[0].pc; // lowest-indexed sounding string = the bass

  const matches: ChordMatch[] = [];

  if (pitchClasses.length === 2) {
    const [a, b] = pitchClasses;
    const diff = (b - a + 12) % 12;
    if (diff === 7) matches.push(powerChordMatch(a, bassPc));
    else if (diff === 5) matches.push(powerChordMatch(b, bassPc));
  }

  if (pitchClasses.length >= 3) {
    for (const root of pitchClasses) {
      const present = new Set(pitchClasses.map((pc) => (pc - root + 12) % 12));
      const analysis = analyze(present);
      if (!analysis) continue;
      const score = (bassPc === root ? 0 : 200) + analysis.complexity;
      matches.push(buildMatch(root, analysis, bassPc, score));
    }
  }

  return matches.sort((a, b) => a.score - b.score);
}

export function getNoteName(pitchClass: number): string {
  return NOTE_NAMES[((pitchClass % 12) + 12) % 12];
}
