import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChordMatch } from '../engine/types';
import { findVoicingsAcrossNeck, Voicing } from '../engine/voicing';
import { colors, radius, spacing, typography } from '../theme/theme';

interface Props {
  activeChord?: ChordMatch;
  baseFret: number;
  onSelectVoicing: (voicing: Voicing) => void;
}

export default function PositionNav({ activeChord, baseFret, onSelectVoicing }: Props) {
  const voicings = useMemo(() => {
    if (!activeChord) return [];
    const required = Object.keys(activeChord.degreesByPitchClass).map(
      (pc) => (Number(pc) - activeChord.root + 12) % 12
    );
    return findVoicingsAcrossNeck(activeChord.root, required, []);
    // Deliberately keyed on the resolved name, not the object (a fresh
    // instance every render) or `activeChord` itself — this is a real
    // search across the neck and should only re-run when the chord changes.
  }, [activeChord?.name]);

  if (voicings.length <= 1) return null;

  const index = Math.max(
    0,
    voicings.findIndex((v) => v.baseFret === baseFret)
  );

  const go = (next: number) => {
    if (next < 0 || next >= voicings.length) return;
    onSelectVoicing(voicings[next]);
  };

  return (
    <View style={styles.row}>
      <Arrow direction="prev" disabled={index <= 0} onPress={() => go(index - 1)} />
      <Text style={styles.label}>
        {index + 1} / {voicings.length}
      </Text>
      <Arrow direction="next" disabled={index >= voicings.length - 1} onPress={() => go(index + 1)} />
    </View>
  );
}

function Arrow({
  direction,
  disabled,
  onPress,
}: {
  direction: 'prev' | 'next';
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={styles.arrow} hitSlop={12}>
      <Text style={[styles.arrowText, disabled && styles.arrowTextDisabled]}>
        {direction === 'prev' ? '‹' : '›'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  arrow: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
  },
  arrowTextDisabled: {
    color: colors.textTertiary,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
});
