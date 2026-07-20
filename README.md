# Chordly

A mobile-first guitar chord identifier. Tap positions on a virtual fretboard;
every chord that matches the notes you've placed is identified in real time,
ranked by likelihood.

This is the first demo: just the home screen (fretboard + chord ID). No
navigation, no settings, no accounts — tap the board and see what chord you're
playing.

## Try it

Live build (GitHub Pages, updates on every push to this branch):
**https://wielkinader.github.io/guitarapp/**

Open that link on your phone — no install required. It also installs as a
home-screen PWA (Safari: Share → Add to Home Screen) if you want an app icon.

## Run it locally

```bash
npm install
npm run web       # opens in your browser at localhost:8081
```

Scan the QR code with Expo Go for on-device testing during development, or
run `npm run ios` / `npm run android` with a simulator.

## How it works

- Tap the row above the nut to cycle a string through **open → muted → unset**.
- Tap a fret cell to place a finger there; tap it again to remove it.
- The chord name at the top updates instantly. Tap it to see its intervals.
- If more than one chord name fits the notes you've placed (e.g. an
  inversion, or an enharmonic reading of a symmetric chord), a small pill
  below the chord name lets you browse the alternates.

## Architecture

```
src/
  engine/         Pure, framework-free chord identification logic
    types.ts        FretboardState / StringState / ChordMatch
    chordEngine.ts   identifyChords(): notes → ranked chord matches
  data/
    chordFormulas.ts Interval templates (major, minor, 7ths, sus, dim...) + tuning
  components/
    Fretboard.tsx    Interactive 6-string board (open+4 frets, fixed)
    ChordDisplay.tsx Chord name, alternates dropdown, intervals panel
    BottomBar.tsx    Reset + left-handed toggle
    FingerDot.tsx / Reveal.tsx   Small animation primitives
  theme/
    theme.ts         Colors, spacing, radius, typography — the only place
                      design tokens live
App.tsx           Wires state + the engine into the single home screen
```

The engine is deliberately decoupled from tuning and instrument shape:
`identifyChords(fretboard, tuning)` takes any 6-value tuning array, so
alternate tunings are a data change, not an engine rewrite. Everything else
in the "Future Expansion" list from the spec (favorites, reverse search,
scale finder, playback, practice mode) hangs off this same engine/UI split
without touching the fretboard or chord-display components.

**Stack:** Expo (React Native + react-native-web), TypeScript. One codebase
compiles to a web build (what's deployed here), and to real iOS/Android apps
via `expo run:ios` / EAS Build later — no rewrite needed.

**Scope simplifications for this demo** (by design, see the questions we
settled before building):
- Chord vocabulary: major, minor, dominant/major/minor 7th, sus2/4, 6/m6,
  add9, dim, aug, dim7, m7♭5, and power chords — not full extended/altered
  jazz voicings.
- Note spelling always uses sharps (no key-aware flat spelling yet).
- Settings icon is deferred entirely — nothing lives behind it yet.

## Deploying

`.github/workflows/deploy-pages.yml` builds the Expo web export and publishes
it to GitHub Pages on every push to `main` or this branch. **One manual
one-time step**: in the repo's Settings → Pages, set "Source" to "GitHub
Actions" (Pages doesn't self-enable via workflow alone).
