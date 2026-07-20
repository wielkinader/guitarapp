import {
  CHORD_FORMULAS,
  ChordFormula,
  NOTE_NAMES,
  POWER_CHORD_FORMULA,
  STANDARD_TUNING,
} from '../data/chordFormulas';
import { ChordMatch, FretboardState } from './types';

const arraysEqual = (a: number[], b: number[]): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i]);

const sorted = (arr: number[]): number[] => [...arr].sort((a, b) => a - b);

function buildMatch(root: number, formula: ChordFormula, bassPc: number): ChordMatch {
  const isRootPosition = bassPc === root;
  const score = (isRootPosition ? 0 : 200) + formula.commonness;
  const rootName = NOTE_NAMES[root];
  const bassName = isRootPosition ? undefined : NOTE_NAMES[bassPc];
  return {
    root,
    suffix: formula.suffix,
    qualityName: formula.qualityName,
    name: rootName + formula.suffix + (bassName ? `/${bassName}` : ''),
    bassName,
    intervalNames: formula.intervalNames,
    score,
  };
}

/**
 * Identifies every chord that matches the notes currently sounding on the
 * fretboard, ranked most-likely first. Root-position voicings outrank
 * inversions; among those, more common chord qualities outrank rarer ones.
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
    if (diff === 7) matches.push(buildMatch(a, POWER_CHORD_FORMULA, bassPc));
    else if (diff === 5) matches.push(buildMatch(b, POWER_CHORD_FORMULA, bassPc));
  }

  if (pitchClasses.length >= 3) {
    for (const root of pitchClasses) {
      const intervalSet = sorted(pitchClasses.map((pc) => (pc - root + 12) % 12));
      for (const formula of CHORD_FORMULAS) {
        if (arraysEqual(intervalSet, sorted(formula.intervals))) {
          matches.push(buildMatch(root, formula, bassPc));
        }
      }
    }
  }

  return matches.sort((a, b) => a.score - b.score);
}

export function getNoteName(pitchClass: number): string {
  return NOTE_NAMES[((pitchClass % 12) + 12) % 12];
}
