# Chordly

A mobile-first guitar chord identifier. Tap notes on a virtual fretboard and
every chord that matches — including inversions and enharmonic alternates —
is identified instantly, ranked by likelihood. Or work backwards: pick a
chord by name and see exactly how to play it, anywhere on the neck.

No navigation, no settings, no accounts. One screen. Tap the board and see
what chord you're playing.

## Try it

**https://wielkinader.github.io/guitarapp/**

Open that link on your phone — no install required. It also installs as a
home-screen PWA (Safari: Share → Add to Home Screen) if you want an app icon.
The build there auto-deploys on every push to this branch.

## What it does

- **Tap to identify.** Tap frets to place fingers; untouched strings are
  assumed to ring open, the same way a chord chart is normally read — mute
  a string explicitly (tap above the nut) if you don't want it to sound.
  The chord name updates live, with scale-degree labels (`1`, `b7`, `9`,
  `#11`...) right on the dots.
- **Real chord vocabulary, not shape-matching.** Recognizes extended and
  altered chords — 9ths, 11ths, 13ths, add9, 6/9, altered dominants, half-
  diminished, the works — by working out the actual intervals present, not
  by matching a fixed list of shapes. Guitar voicings that omit the 5th (or
  interior extensions in a 13th chord) are still named correctly.
- **Alternates.** When more than one chord name legitimately fits the notes
  on the board (an inversion, or a symmetric chord like dim7 that has
  several equally-valid names), a small pill lets you browse the others.
- **Reverse lookup.** Pick a root, a chord type, and an extension from the
  picker at the top, and the fretboard fills in a real, playable voicing —
  generated on the fly, not pulled from a fixed diagram library.
- **Position navigator.** Any chord on the board can be replayed elsewhere
  on the neck — a `‹ 2/6 ›` control steps through every other position that
  produces the exact same chord.
- **Scrollable neck.** The fretboard covers a full 16 frets; scroll it by
  hand or let the picker/position nav jump you straight to the right spot.
- **Left-handed mode.** Mirrors the whole board.

## Run it locally

```bash
npm install
npm run web       # opens in your browser at localhost:8081
```

Scan the QR code with Expo Go for on-device testing during development, or
run `npm run ios` / `npm run android` with a simulator.

## Architecture

```
src/
  engine/           Pure, framework-free logic — no UI imports
    types.ts          FretboardState / StringState / ChordMatch,
                       getEffectiveFretboard() (auto-open untouched strings)
    degrees.ts         Shared semitone-degree constants
    chordEngine.ts      identifyChords(): notes -> ranked chord matches,
                        via degree analysis (not template matching)
    voicing.ts          findVoicing() / findVoicingsAcrossNeck(): chord ->
                        playable fingering, the reverse direction
  data/
    chordFormulas.ts    Note names + standard tuning
    chordTypes.ts       Picker vocabulary (13 chord types x extensions),
                        each mapped to the exact intervals the engine expects
  components/
    Fretboard.tsx       Scrollable 6-string, 16-fret board
    ChordDisplay.tsx    Chord name, alternates dropdown
    ChordPicker.tsx     Root / type / extension reverse-lookup picker
    PositionNav.tsx     Steps through alternate neck positions
    BottomBar.tsx       Reset + left-handed toggle
    FingerDot.tsx / Reveal.tsx   Small animation primitives
  theme/
    theme.ts            Colors, spacing, radius, typography — the only
                        place design tokens live
App.tsx             Wires state + the engine into the single home screen
```

The identification engine (`chordEngine.ts`) and the voicing generator
(`voicing.ts`) are inverses of each other and both take a `tuning` array, so
alternate tunings are a data change, not a rewrite. Everything else in the
original "Future Expansion" list (favorites, scale finder, playback,
practice mode) hangs off this same engine/UI split.

**Stack:** Expo (React Native + react-native-web), TypeScript. One codebase
compiles to the web build deployed here, and to real iOS/Android apps via
`expo run:ios` / EAS Build later — no rewrite needed.

**Known scope limits:** note spelling always uses sharps (no key-aware flat
spelling yet); the reverse-lookup picker's vocabulary covers the 13 common
chord types with standard extensions, not every altered-dominant variant the
detector can recognize from the fretboard; settings icon is deferred
entirely — nothing lives behind it yet.

## Deploying

`.github/workflows/deploy-pages.yml` builds the Expo web export and publishes
it to GitHub Pages on every push to `main` or this branch. **One-time setup**
(already done for this repo): Settings → Pages → Source → "GitHub Actions",
and Settings → Environments → `github-pages` → Deployment branches → allow
this branch.
