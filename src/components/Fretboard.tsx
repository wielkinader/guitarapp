import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { STANDARD_TUNING } from '../data/chordFormulas';
import { FretboardState, StringState } from '../engine/types';
import { colors, fontFamily, typography } from '../theme/theme';
import FingerDot from './FingerDot';

const FRET_COUNT = 4;
export const FRET_AREA_ASPECT_RATIO = 0.56; // width / height of the fret grid alone
export const OPEN_ROW_HEIGHT = 40;
export const NUT_HEIGHT = 6; // nut height + margin
export const HEADER_HEIGHT = OPEN_ROW_HEIGHT + NUT_HEIGHT;

interface Props {
  fretboard: FretboardState;
  onChangeString: (index: number, next: StringState) => void;
  leftHanded: boolean;
  /** Pitch class -> short degree token ("1", "b7", "9"...), from the selected chord match. */
  degreesByPitchClass?: Record<number, string>;
  /** 0 = board shows open + frets 1-4. N>0 = board shows frets N+1..N+4, no open strings displayed as the nut. */
  baseFret?: number;
}

function cycleOpenMute(current: StringState): StringState {
  if (current.type === 'none') return { type: 'open' };
  if (current.type === 'open') return { type: 'muted' };
  return { type: 'none' };
}

export default function Fretboard({
  fretboard,
  onChangeString,
  leftHanded,
  degreesByPitchClass,
  baseFret = 0,
}: Props) {
  const order = leftHanded ? [5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5];

  const handleOpenMutePress = (stringIndex: number) => {
    onChangeString(stringIndex, cycleOpenMute(fretboard[stringIndex]));
  };

  const handleFretPress = (stringIndex: number, fret: number) => {
    const current = fretboard[stringIndex];
    const alreadyHere = current.type === 'fret' && current.fret === fret;
    onChangeString(stringIndex, alreadyHere ? { type: 'none' } : { type: 'fret', fret });
  };

  return (
    <View style={styles.container}>
      <View style={styles.openRow}>
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

      <View style={baseFret === 0 ? styles.nut : styles.positionMarker} />

      <View style={styles.fretArea}>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {order.map((stringIndex, colIdx) => (
            <View
              key={stringIndex}
              style={[styles.stringLine, { left: `${((colIdx + 0.5) / 6) * 100}%` }]}
            />
          ))}
          {[1, 2, 3].map((k) => (
            <View key={k} style={[styles.fretLine, { top: `${(k / FRET_COUNT) * 100}%` }]} />
          ))}
        </View>

        <View style={styles.fretGutter} pointerEvents="none">
          {[1, 2, 3, 4].map((row) => (
            <Text
              key={row}
              style={[styles.fretLabel, { top: `${((row - 0.5) / FRET_COUNT) * 100}%` }]}
            >
              {baseFret + row}
            </Text>
          ))}
        </View>

        <View style={[StyleSheet.absoluteFill, styles.fretRows]}>
          {[1, 2, 3, 4].map((row) => {
            const actualFret = baseFret + row;
            return (
              <View key={row} style={styles.fretRow}>
                {order.map((stringIndex) => {
                  const state = fretboard[stringIndex];
                  const selected = state.type === 'fret' && state.fret === actualFret;
                  const label = selected
                    ? degreesByPitchClass?.[(STANDARD_TUNING[stringIndex] + actualFret) % 12]
                    : undefined;
                  return (
                    <Pressable
                      key={stringIndex}
                      testID={`fret-${row}-${stringIndex}`}
                      style={styles.fretCell}
                      onPress={() => handleFretPress(stringIndex, actualFret)}
                      hitSlop={4}
                    >
                      {selected ? <FingerDot label={label} /> : <View style={styles.fretCellHint} />}
                    </Pressable>
                  );
                })}
              </View>
            );
          })}
        </View>
      </View>
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
    height: 40,
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
    marginHorizontal: 2,
  },
  positionMarker: {
    height: StyleSheet.hairlineWidth * 2,
    marginHorizontal: 2,
    backgroundColor: colors.hairline,
  },
  fretArea: {
    aspectRatio: FRET_AREA_ASPECT_RATIO,
    marginTop: 2,
  },
  stringLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.hairline,
  },
  fretLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.hairline,
  },
  fretGutter: {
    position: 'absolute',
    left: -22,
    top: 0,
    bottom: 0,
    width: 18,
  },
  fretLabel: {
    ...typography.label,
    position: 'absolute',
    fontSize: 12,
    color: colors.textTertiary,
    transform: [{ translateY: -7 }],
  },
  fretRows: {
    flexDirection: 'column',
  },
  fretRow: {
    flex: 1,
    flexDirection: 'row',
  },
  fretCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fretCellHint: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
});
