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

// Standard tuning, low string to high string, as pitch classes (C = 0).
export const STANDARD_TUNING: number[] = [4, 9, 2, 7, 11, 4];
