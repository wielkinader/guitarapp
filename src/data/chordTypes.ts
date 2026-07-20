import {
  ELEVENTH,
  FIFTH,
  FLAT7,
  MAJOR3,
  MAJOR7,
  MINOR3,
  NINTH,
  SHARP11,
  SHARP5,
  THIRTEENTH,
} from '../engine/degrees';

export interface ExtensionOption {
  key: string;
  label: string;
  /** Additional semitone intervals (on top of the type's base) this extension requires. */
  extra: number[];
  /** The exact suffix the detector produces for base+extra — used to preview the name and to self-test the generator. */
  suffix: string;
}

export interface ChordTypeOption {
  key: string;
  label: string;
  /** Semitone intervals every voicing of this type must include. */
  base: number[];
  /** Semitone intervals nice to include if a string is free, never required. */
  optional: number[];
  extensions: ExtensionOption[];
}

const NONE: ExtensionOption = { key: 'none', label: 'None', extra: [], suffix: '' };

export const CHORD_TYPES: ChordTypeOption[] = [
  {
    key: 'major',
    label: 'Major',
    base: [MAJOR3],
    optional: [FIFTH],
    extensions: [
      { ...NONE, suffix: '' },
      { key: 'add9', label: 'Add 9', extra: [NINTH], suffix: 'add9' },
    ],
  },
  {
    key: 'minor',
    label: 'Minor',
    base: [MINOR3],
    optional: [FIFTH],
    extensions: [
      { ...NONE, suffix: 'm' },
      { key: 'add9', label: 'Add 9', extra: [NINTH], suffix: 'madd9' },
    ],
  },
  {
    key: 'dom7',
    label: 'Dominant 7',
    base: [MAJOR3, FLAT7],
    optional: [FIFTH],
    extensions: [
      { ...NONE, suffix: '7' },
      { key: '9', label: '9', extra: [NINTH], suffix: '9' },
      { key: '11', label: '11', extra: [ELEVENTH], suffix: '11' },
      { key: '13', label: '13', extra: [THIRTEENTH], suffix: '13' },
    ],
  },
  {
    key: 'maj7',
    label: 'Major 7',
    base: [MAJOR3, MAJOR7],
    optional: [FIFTH],
    extensions: [
      { ...NONE, suffix: 'maj7' },
      { key: '9', label: '9', extra: [NINTH], suffix: 'maj9' },
      { key: '11', label: '11', extra: [ELEVENTH], suffix: 'maj11' },
      { key: '13', label: '13', extra: [THIRTEENTH], suffix: 'maj13' },
    ],
  },
  {
    key: 'min7',
    label: 'Minor 7',
    base: [MINOR3, FLAT7],
    optional: [FIFTH],
    extensions: [
      { ...NONE, suffix: 'm7' },
      { key: '9', label: '9', extra: [NINTH], suffix: 'm9' },
      { key: '11', label: '11', extra: [ELEVENTH], suffix: 'm11' },
      { key: '13', label: '13', extra: [THIRTEENTH], suffix: 'm13' },
    ],
  },
  {
    key: 'dim',
    label: 'Diminished',
    base: [MINOR3, SHARP11],
    optional: [],
    extensions: [{ ...NONE, suffix: 'dim' }],
  },
  {
    key: 'dim7',
    label: 'Diminished 7',
    base: [MINOR3, SHARP11, THIRTEENTH],
    optional: [],
    extensions: [{ ...NONE, suffix: 'dim7' }],
  },
  {
    key: 'halfdim',
    label: 'Half-Diminished',
    base: [MINOR3, SHARP11, FLAT7],
    optional: [],
    extensions: [{ ...NONE, suffix: 'm7b5' }],
  },
  {
    key: 'aug',
    label: 'Augmented',
    base: [MAJOR3, SHARP5],
    optional: [],
    extensions: [{ ...NONE, suffix: 'aug' }],
  },
  {
    key: 'sus2',
    label: 'Sus2',
    base: [NINTH],
    optional: [FIFTH],
    extensions: [
      { ...NONE, suffix: 'sus2' },
      { key: '7', label: '7', extra: [FLAT7], suffix: '7sus2' },
      { key: '13', label: '13', extra: [FLAT7, THIRTEENTH], suffix: '13sus2' },
    ],
  },
  {
    key: 'sus4',
    label: 'Sus4',
    base: [ELEVENTH],
    optional: [FIFTH],
    extensions: [
      { ...NONE, suffix: 'sus4' },
      { key: '7', label: '7', extra: [FLAT7], suffix: '7sus4' },
      { key: '13', label: '13', extra: [FLAT7, THIRTEENTH], suffix: '13sus4' },
    ],
  },
  {
    key: '6',
    label: '6',
    base: [MAJOR3, THIRTEENTH],
    optional: [FIFTH],
    extensions: [
      { ...NONE, suffix: '6' },
      { key: 'add9', label: 'Add 9', extra: [NINTH], suffix: '6/9' },
    ],
  },
  {
    key: 'm6',
    label: 'Minor 6',
    base: [MINOR3, THIRTEENTH],
    optional: [FIFTH],
    extensions: [
      { ...NONE, suffix: 'm6' },
      { key: 'add9', label: 'Add 9', extra: [NINTH], suffix: 'm6/9' },
    ],
  },
];
