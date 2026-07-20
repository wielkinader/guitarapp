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

/**
 * A string the player hasn't touched should ring open by default, the same
 * way an unmarked string on a chord chart is assumed to sound — the only
 * way to exclude a string is to explicitly mute it. This only kicks in once
 * something has actually been placed on the board; an untouched board stays
 * untouched so the empty-state placeholder still shows.
 */
export const getEffectiveFretboard = (fretboard: FretboardState): FretboardState => {
  const hasInteraction = fretboard.some((s) => s.type !== 'none');
  if (!hasInteraction) return fretboard;
  return fretboard.map((s) => (s.type === 'none' ? { type: 'open' } : s));
};
