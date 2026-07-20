import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChordMatch } from '../engine/types';
import { colors, radius, spacing, typography } from '../theme/theme';
import Reveal from './Reveal';

interface Props {
  matches: ChordMatch[];
}

export default function ChordDisplay({ matches }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const signature = matches.map((m) => m.name).join('|');
  useEffect(() => {
    setSelectedIndex(0);
    setDropdownOpen(false);
    setInfoOpen(false);
  }, [signature]);

  if (matches.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholder}>Tap the fretboard to begin</Text>
      </View>
    );
  }

  const selected = matches[Math.min(selectedIndex, matches.length - 1)];
  const alternates = matches.filter((_, i) => i !== selectedIndex);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setInfoOpen((v) => !v)}
        style={styles.chordButton}
        hitSlop={12}
      >
        <Reveal key={selected.name} style={styles.chordNameWrap}>
          <Text style={typography.chordName}>{selected.name}</Text>
        </Reveal>
        <Text style={typography.chordSubtext}>{selected.qualityName}</Text>
      </Pressable>

      {matches.length > 1 && (
        <Pressable onPress={() => setDropdownOpen((v) => !v)} style={styles.altPill} hitSlop={8}>
          <Text style={styles.altPillText}>
            {alternates.length} other match{alternates.length > 1 ? 'es' : ''}
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
                setSelectedIndex(i);
                setDropdownOpen(false);
                setInfoOpen(true);
              }}
              style={[styles.altRow, i === selectedIndex && styles.altRowActive]}
            >
              <Text style={styles.altRowName}>{m.name}</Text>
              <Text style={styles.altRowQuality}>{m.qualityName}</Text>
            </Pressable>
          ))}
        </Reveal>
      )}

      {infoOpen && (
        <Reveal style={styles.infoPanel}>
          <Text style={styles.infoLabel}>Intervals</Text>
          <View style={styles.intervalRow}>
            {selected.intervalNames.map((interval) => (
              <View key={interval} style={styles.intervalChip}>
                <Text style={styles.intervalChipText}>{interval}</Text>
              </View>
            ))}
          </View>
          {selected.bassName && (
            <Text style={styles.infoNote}>
              Bass note is {selected.bassName}, not the root — this is an inversion.
            </Text>
          )}
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
  chordButton: {
    alignItems: 'center',
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
  infoPanel: {
    marginTop: spacing.md,
    width: '86%',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  infoLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  intervalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  intervalChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  intervalChipText: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },
  infoNote: {
    ...typography.chordSubtext,
    fontSize: 13,
    marginTop: spacing.sm,
  },
});
