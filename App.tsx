import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import BottomBar from './src/components/BottomBar';
import ChordDisplay from './src/components/ChordDisplay';
import ChordPicker from './src/components/ChordPicker';
import Fretboard, { FRET_AREA_ASPECT_RATIO, HEADER_HEIGHT } from './src/components/Fretboard';
import PositionNav from './src/components/PositionNav';
import { identifyChords } from './src/engine/chordEngine';
import { createEmptyFretboard, FretboardState, StringState } from './src/engine/types';
import { Voicing } from './src/engine/voicing';
import { colors, spacing } from './src/theme/theme';

const BOARD_MAX_WIDTH = 460;

export default function App() {
  const [fretboard, setFretboard] = useState<FretboardState>(createEmptyFretboard());
  const [baseFret, setBaseFret] = useState(0);
  const [leftHanded, setLeftHanded] = useState(false);
  const [boardWidth, setBoardWidth] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pickerResetKey, setPickerResetKey] = useState(0);

  const matches = useMemo(() => identifyChords(fretboard), [fretboard]);
  const hasInput = fretboard.some((s) => s.type !== 'none');
  const selected = matches[Math.min(selectedIndex, matches.length - 1)];

  // Whenever the note selection changes, the previous alternate pick no
  // longer applies — snap back to the best match.
  const signature = matches.map((m) => m.name).join('|');
  useEffect(() => {
    setSelectedIndex(0);
  }, [signature]);

  const handleChangeString = (index: number, next: StringState) => {
    setFretboard((prev) => {
      const updated = [...prev];
      updated[index] = next;
      return updated;
    });
  };

  const handleReset = () => {
    setFretboard(createEmptyFretboard());
    setBaseFret(0);
    setPickerResetKey((k) => k + 1);
  };

  const handleApplyVoicing = (voicing: Voicing) => {
    setFretboard(voicing.fretboard);
    setBaseFret(voicing.baseFret);
  };

  const handleMiddleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    // onLayout reports this View's own box, which still includes its
    // paddingHorizontal — subtract that to get the space children can use.
    const availableWidth = width - spacing.xl * 2;
    // Fit the board (header + fret grid) inside the available box, letting
    // it dominate the screen height while never overflowing the width.
    const widthFromHeight = (height - HEADER_HEIGHT) * FRET_AREA_ASPECT_RATIO;
    const nextWidth = Math.max(0, Math.min(availableWidth, widthFromHeight, BOARD_MAX_WIDTH));
    setBoardWidth(nextWidth);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        <ChordPicker key={pickerResetKey} onApply={handleApplyVoicing} activeChord={selected} />

        <View style={styles.top}>
          <ChordDisplay
            matches={matches}
            selectedIndex={selectedIndex}
            onSelectIndex={setSelectedIndex}
          />
        </View>

        <PositionNav activeChord={selected} baseFret={baseFret} onSelectVoicing={handleApplyVoicing} />

        <View style={styles.middle} onLayout={handleMiddleLayout}>
          {boardWidth > 0 && (
            <View style={{ width: boardWidth }}>
              <Fretboard
                fretboard={fretboard}
                onChangeString={handleChangeString}
                leftHanded={leftHanded}
                degreesByPitchClass={selected?.degreesByPitchClass}
                baseFret={baseFret}
              />
            </View>
          )}
        </View>

        <View style={styles.bottom}>
          <BottomBar
            onReset={handleReset}
            resetDisabled={!hasInput}
            leftHanded={leftHanded}
            onToggleLeftHanded={() => setLeftHanded((v) => !v)}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  top: {
    paddingTop: spacing.lg,
  },
  middle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  bottom: {
    paddingBottom: spacing.md,
  },
});
