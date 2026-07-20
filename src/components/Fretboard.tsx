import React, { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { STANDARD_TUNING } from '../data/chordFormulas';
import { FretboardState, StringState } from '../engine/types';
import { colors, fontFamily, typography } from '../theme/theme';
import FingerDot from './FingerDot';

export const FRET_AREA_ASPECT_RATIO = 0.56; // width / height of the visible (4-row) viewport
export const OPEN_ROW_HEIGHT = 40;
export const NUT_HEIGHT = 6; // nut height + margin
export const HEADER_HEIGHT = OPEN_ROW_HEIGHT + NUT_HEIGHT;

const VISIBLE_ROWS = 4;
const TOTAL_FRETS = 16;
const GUTTER_WIDTH = 22;

interface Props {
  fretboard: FretboardState;
  onChangeString: (index: number, next: StringState) => void;
  leftHanded: boolean;
  /** Pitch class -> short degree token ("1", "b7", "9"...), from the selected chord match. */
  degreesByPitchClass?: Record<number, string>;
  /** Scrolls the neck so frets baseFret+1..baseFret+4 are in view. */
  baseFret?: number;
}

function toggleMute(current: StringState): StringState {
  // An untouched or open string is "not muted" — one tap mutes it. A muted
  // string reopens. There's no third state to cycle through here; a string
  // that isn't fretted or muted is assumed to ring open by default.
  return current.type === 'muted' ? { type: 'open' } : { type: 'muted' };
}

export default function Fretboard({
  fretboard,
  onChangeString,
  leftHanded,
  degreesByPitchClass,
  baseFret = 0,
}: Props) {
  const order = leftHanded ? [5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5];
  const [width, setWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const fretAreaHeight = width / FRET_AREA_ASPECT_RATIO;
  const rowHeight = fretAreaHeight / VISIBLE_ROWS;

  useEffect(() => {
    if (rowHeight <= 0) return;
    scrollRef.current?.scrollTo({ y: baseFret * rowHeight, animated: true });
  }, [baseFret, rowHeight]);

  const handleLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const handleOpenMutePress = (stringIndex: number) => {
    onChangeString(stringIndex, toggleMute(fretboard[stringIndex]));
  };

  const handleFretPress = (stringIndex: number, fret: number) => {
    const current = fretboard[stringIndex];
    const alreadyHere = current.type === 'fret' && current.fret === fret;
    onChangeString(stringIndex, alreadyHere ? { type: 'none' } : { type: 'fret', fret });
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <View style={styles.openRow}>
        <View style={styles.gutter} />
        {order.map((stringIndex) => {
          const state = fretboard[stringIndex];
          const label =
            state.type === 'open' ? degreesByPitchClass?.[STANDARD_TUNING[stringIndex]] : undefined;
          return (
            <Pressable
              key={stringIndex}
              testID={`open-mute-${stringIndex}`}
              style={styles.openCell}
              onPress={() => handleOpenMutePress(stringIndex)}
              hitSlop={8}
            >
              <OpenMuteIndicator state={state} label={label} />
            </Pressable>
          );
        })}
      </View>

      {width > 0 && (
        <ScrollView
          ref={scrollRef}
          style={{ height: fretAreaHeight }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.nut} />
          {Array.from({ length: TOTAL_FRETS }, (_, i) => i + 1).map((fret) => (
            <View key={fret} style={[styles.fretRow, { height: rowHeight }]}>
              <View style={styles.gutter}>
                <Text style={styles.fretLabel}>{fret}</Text>
              </View>
              {order.map((stringIndex) => {
                const state = fretboard[stringIndex];
                const selected = state.type === 'fret' && state.fret === fret;
                const label = selected
                  ? degreesByPitchClass?.[(STANDARD_TUNING[stringIndex] + fret) % 12]
                  : undefined;
                return (
                  <Pressable
                    key={stringIndex}
                    testID={`fret-${fret}-${stringIndex}`}
                    style={styles.fretCell}
                    onPress={() => handleFretPress(stringIndex, fret)}
                    hitSlop={4}
                  >
                    <View style={styles.stringSegment} />
                    {selected ? <FingerDot label={label} /> : null}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function OpenMuteIndicator({ state, label }: { state: StringState; label?: string }) {
  if (state.type === 'open') {
    return (
      <View style={styles.openRing}>
        {label ? <Text style={styles.openRingLabel}>{label}</Text> : null}
      </View>
    );
  }
  if (state.type === 'muted') {
    return <Text style={styles.muteMark}>×</Text>;
  }
  return <View style={styles.openPlaceholder} />;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  openRow: {
    flexDirection: 'row',
    height: OPEN_ROW_HEIGHT,
  },
  gutter: {
    width: GUTTER_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fretLabel: {
    ...typography.label,
    fontSize: 12,
    color: colors.textTertiary,
  },
  openCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openRing: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openRingLabel: {
    fontFamily,
    fontSize: 9,
    fontWeight: '700',
    color: colors.accent,
  },
  openPlaceholder: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.hairline,
  },
  muteMark: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textTertiary,
    lineHeight: 24,
  },
  nut: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textPrimary,
    marginHorizontal: 2 + GUTTER_WIDTH,
  },
  fretRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
    borderBottomColor: colors.hairline,
  },
  fretCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stringSegment: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.hairline,
  },
});
