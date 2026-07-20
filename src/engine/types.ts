export type StringState =
  | { type: 'none' }
  | { type: 'open' }
  | { type: 'muted' }
  | { type: 'fret'; fret: number };

/** Six entries, index 0 = lowest-pitched string (low E in standard tuning). */
export type FretboardState = StringState[];

export interface ChordMatch {
  root: number;
  suffix: string;
  qualityName: string;
  name: string;
  /** Set when the sounding bass note differs from the chord root. */
  bassName?: string;
  intervalNames: string[];
  /** Short scale-degree token ("1", "b3", "9", "#11"...) keyed by pitch class, for labeling fretboard dots. */
  degreesByPitchClass: Record<number, string>;
  score: number;
}

export const EMPTY_STRING_STATE = (): StringState => ({ type: 'none' });

export const createEmptyFretboard = (): FretboardState =>
  Array.from({ length: 6 }, EMPTY_STRING_STATE);
