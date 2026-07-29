import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { ProgressionEntry } from '../engine/types';
import { colors, radius, spacing, typography } from '../theme/theme';

interface Props {
  entries: ProgressionEntry[];
  onSelect: (entry: ProgressionEntry) => void;
  onRemove: (id: string) => void;
}

export default function ProgressionStrip({ entries, onSelect, onRemove }: Props) {
  if (entries.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.row}
    >
      {entries.map((entry, i) => (
        <React.Fragment key={entry.id}>
          {i > 0 && <Text style={styles.arrow}>›</Text>}
          <Pressable onPress={() => onSelect(entry)} style={styles.chip}>
            <Text style={styles.chipText}>{entry.name}</Text>
            <Pressable
              onPress={(e) => {
                e?.stopPropagation?.();
                onRemove(entry.id);
              }}
              hitSlop={8}
              style={styles.removeButton}
            >
              <Text style={styles.removeText}>×</Text>
            </Pressable>
          </Pressable>
        </React.Fragment>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 52,
    flexGrow: 0,
  },
  row: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  arrow: {
    color: colors.textTertiary,
    fontSize: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    gap: 4,
  },
  chipText: {
    ...typography.body,
    fontWeight: '700',
    fontSize: 15,
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: colors.textTertiary,
    fontSize: 16,
    fontWeight: '600',
  },
});
