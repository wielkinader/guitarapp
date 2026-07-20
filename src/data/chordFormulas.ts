// Pitch-class names, using sharps. 0 = C.
export const NOTE_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;

export interface ChordFormula {
  /** Suffix appended to the root note name, e.g. "m", "7", "maj7". */
  suffix: string;
  /** Human readable full name of the chord quality. */
  qualityName: string;
  /** Interval semitones from the root, always includes 0. */
  intervals: number[];
  /** Interval names in order, for the info panel. */
  intervalNames: string[];
  /** Lower = more common / more likely, used for ranking ties. */
  commonness: number;
}

// Ordered roughly by how often a guitarist would actually play them.
export const CHORD_FORMULAS: ChordFormula[] = [
  {
    suffix: '',
    qualityName: 'Major',
    intervals: [0, 4, 7],
    intervalNames: ['Root', 'Major 3rd', 'Perfect 5th'],
    commonness: 0,
  },
  {
    suffix: 'm',
    qualityName: 'Minor',
    intervals: [0, 3, 7],
    intervalNames: ['Root', 'Minor 3rd', 'Perfect 5th'],
    commonness: 1,
  },
  {
    suffix: '7',
    qualityName: 'Dominant 7th',
    intervals: [0, 4, 7, 10],
    intervalNames: ['Root', 'Major 3rd', 'Perfect 5th', 'Minor 7th'],
    commonness: 2,
  },
  {
    suffix: 'maj7',
    qualityName: 'Major 7th',
    intervals: [0, 4, 7, 11],
    intervalNames: ['Root', 'Major 3rd', 'Perfect 5th', 'Major 7th'],
    commonness: 3,
  },
  {
    suffix: 'm7',
    qualityName: 'Minor 7th',
    intervals: [0, 3, 7, 10],
    intervalNames: ['Root', 'Minor 3rd', 'Perfect 5th', 'Minor 7th'],
    commonness: 3,
  },
  {
    suffix: 'sus4',
    qualityName: 'Suspended 4th',
    intervals: [0, 5, 7],
    intervalNames: ['Root', 'Perfect 4th', 'Perfect 5th'],
    commonness: 4,
  },
  {
    suffix: 'sus2',
    qualityName: 'Suspended 2nd',
    intervals: [0, 2, 7],
    intervalNames: ['Root', 'Major 2nd', 'Perfect 5th'],
    commonness: 5,
  },
  {
    suffix: '6',
    qualityName: 'Major 6th',
    intervals: [0, 4, 7, 9],
    intervalNames: ['Root', 'Major 3rd', 'Perfect 5th', 'Major 6th'],
    commonness: 6,
  },
  {
    suffix: 'm6',
    qualityName: 'Minor 6th',
    intervals: [0, 3, 7, 9],
    intervalNames: ['Root', 'Minor 3rd', 'Perfect 5th', 'Major 6th'],
    commonness: 6,
  },
  {
    suffix: 'add9',
    qualityName: 'Add 9',
    intervals: [0, 2, 4, 7],
    intervalNames: ['Root', 'Major 2nd', 'Major 3rd', 'Perfect 5th'],
    commonness: 7,
  },
  {
    suffix: 'dim',
    qualityName: 'Diminished',
    intervals: [0, 3, 6],
    intervalNames: ['Root', 'Minor 3rd', 'Diminished 5th'],
    commonness: 8,
  },
  {
    suffix: 'aug',
    qualityName: 'Augmented',
    intervals: [0, 4, 8],
    intervalNames: ['Root', 'Major 3rd', 'Augmented 5th'],
    commonness: 8,
  },
  {
    suffix: 'dim7',
    qualityName: 'Diminished 7th',
    intervals: [0, 3, 6, 9],
    intervalNames: ['Root', 'Minor 3rd', 'Diminished 5th', 'Diminished 7th'],
    commonness: 9,
  },
  {
    suffix: 'm7b5',
    qualityName: 'Half-Diminished 7th',
    intervals: [0, 3, 6, 10],
    intervalNames: ['Root', 'Minor 3rd', 'Diminished 5th', 'Minor 7th'],
    commonness: 9,
  },
];

// Special-cased: exactly two distinct pitch classes a perfect 5th apart.
export const POWER_CHORD_FORMULA: ChordFormula = {
  suffix: '5',
  qualityName: 'Power Chord',
  intervals: [0, 7],
  intervalNames: ['Root', 'Perfect 5th'],
  commonness: 10,
};

// Standard tuning, low string to high string, as pitch classes (C = 0).
export const STANDARD_TUNING: number[] = [4, 9, 2, 7, 11, 4];
