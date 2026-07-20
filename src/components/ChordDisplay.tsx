import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChordMatch } from '../engine/types';
import { colors, radius, spacing, typography } from '../theme/theme';
import Reveal from './Reveal';

interface Props {
  matches: ChordMatch[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

export default function ChordDisplay({ matches, selectedIndex, onSelectIndex }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (matches.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholder}>Tap the fretboard to begin</Text>
      </View>
    );
  }

  const selected = matches[Math.min(selectedIndex, matches.length - 1)];
  const otherCount = matches.length - 1;

  return (
    <View style={styles.container}>
      <Reveal key={selected.name} style={styles.chordNameWrap}>
        <Text style={typography.chordName}>{selected.name}</Text>
      </Reveal>
      <Text style={typography.chordSubtext}>
        {selected.qualityName}
        {selected.bassName ? ` · over ${selected.bassName}` : ''}
      </Text>

      {otherCount > 0 && (
        <Pressable onPress={() => setDropdownOpen((v) => !v)} style={styles.altPill} hitSlop={8}>
          <Text style={styles.altPillText}>
            {otherCount} other match{otherCount > 1 ? 'es' : ''}
          </Text>
          <Text style={[styles.chevron, dropdownOpen && styles.chevronOpen]}>⌄</Text>
        </Pressable>
      )}

      {dropdownOpen && (
        <Reveal style={styles.altList}>
          {matches.map((m, i) => (
            <Pressable
              key={m.name + i}
              onPress={() => {
                onSelectIndex(i);
                setDropdownOpen(false);
              }}
              style={[styles.altRow, i === selectedIndex && styles.altRowActive]}
            >
              <Text style={styles.altRowName}>{m.name}</Text>
              <Text style={styles.altRowQuality}>{m.qualityName}</Text>
            </Pressable>
          ))}
        </Reveal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    minHeight: 132,
  },
  placeholder: {
    ...typography.chordSubtext,
    marginTop: spacing.xl,
  },
  chordNameWrap: {
    alignItems: 'center',
  },
  altPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    gap: 4,
  },
  altPillText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  chevron: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: -2,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  altList: {
    marginTop: spacing.sm,
    width: '84%',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  altRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  altRowActive: {
    backgroundColor: colors.accentSoft,
  },
  altRowName: {
    ...typography.body,
    fontWeight: '600',
  },
  altRowQuality: {
    ...typography.chordSubtext,
    fontSize: 13,
  },
});
