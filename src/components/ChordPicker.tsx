import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NOTE_NAMES } from '../data/chordFormulas';
import { CHORD_TYPES, ChordTypeOption, ExtensionOption } from '../data/chordTypes';
import { findVoicing, Voicing } from '../engine/voicing';
import { colors, radius, spacing, typography } from '../theme/theme';
import Reveal from './Reveal';

interface Props {
  onApply: (voicing: Voicing) => void;
}

type Section = 'root' | 'type' | 'ext' | null;

export default function ChordPicker({ onApply }: Props) {
  const [root, setRoot] = useState<number | null>(null);
  const [typeKey, setTypeKey] = useState<string | null>(null);
  const [extKey, setExtKey] = useState<string | null>(null);
  const [open, setOpen] = useState<Section>(null);

  const selectedType = CHORD_TYPES.find((t) => t.key === typeKey) ?? null;
  const selectedExt = selectedType?.extensions.find((e) => e.key === extKey) ?? null;
  const extApplicable = !!selectedType && selectedType.extensions.length > 1;

  const apply = (r: number, type: ChordTypeOption, ext: ExtensionOption) => {
    const required = [...type.base, ...ext.extra];
    const voicing = findVoicing(r, required, type.optional);
    if (voicing) onApply(voicing);
  };

  const toggle = (section: Section) => setOpen((cur) => (cur === section ? null : section));

  const handlePickRoot = (r: number) => {
    setRoot(r);
    if (!selectedType) {
      setOpen('type');
      return;
    }
    if (selectedType.extensions.length === 1) {
      setExtKey(selectedType.extensions[0].key);
      apply(r, selectedType, selectedType.extensions[0]);
      setOpen(null);
    } else if (selectedExt) {
      apply(r, selectedType, selectedExt);
      setOpen(null);
    } else {
      setOpen('ext');
    }
  };

  const handlePickType = (type: ChordTypeOption) => {
    setTypeKey(type.key);
    if (type.extensions.length === 1) {
      setExtKey(type.extensions[0].key);
      if (root !== null) {
        apply(root, type, type.extensions[0]);
        setOpen(null);
      } else {
        setOpen('root');
      }
    } else {
      setExtKey(null);
      setOpen(root === null ? 'root' : 'ext');
    }
  };

  const handlePickExt = (ext: ExtensionOption) => {
    setExtKey(ext.key);
    setOpen(null);
    if (root !== null && selectedType) apply(root, selectedType, ext);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Chip
          label={root !== null ? NOTE_NAMES[root] : 'Root'}
          filled={root !== null}
          active={open === 'root'}
          onPress={() => toggle('root')}
        />
        <Chip
          label={selectedType?.label ?? 'Type'}
          filled={!!selectedType}
          active={open === 'type'}
          onPress={() => toggle('type')}
        />
        <Chip
          label={selectedExt && selectedExt.key !== 'none' ? selectedExt.label : 'Ext'}
          filled={!!selectedExt && selectedExt.key !== 'none'}
          active={open === 'ext'}
          disabled={!extApplicable}
          onPress={() => extApplicable && toggle('ext')}
        />
      </View>

      {open === 'root' && (
        <Reveal style={styles.rootGrid}>
          {NOTE_NAMES.map((name, i) => (
            <Pressable
              key={name}
              onPress={() => handlePickRoot(i)}
              style={[styles.rootCell, root === i && styles.rootCellActive]}
            >
              <Text style={[styles.rootCellText, root === i && styles.rootCellTextActive]}>
                {name}
              </Text>
            </Pressable>
          ))}
        </Reveal>
      )}

      {open === 'type' && (
        <Reveal style={styles.list}>
          {CHORD_TYPES.map((type) => (
            <Pressable
              key={type.key}
              onPress={() => handlePickType(type)}
              style={[styles.listRow, type.key === typeKey && styles.listRowActive]}
            >
              <Text style={styles.listRowText}>{type.label}</Text>
            </Pressable>
          ))}
        </Reveal>
      )}

      {open === 'ext' && selectedType && (
        <Reveal style={styles.extRow}>
          {selectedType.extensions
            .filter((e) => e.key !== 'none')
            .map((ext) => (
              <Pressable
                key={ext.key}
                onPress={() => handlePickExt(ext)}
                style={[styles.extChip, ext.key === extKey && styles.extChipActive]}
              >
                <Text style={[styles.extChipText, ext.key === extKey && styles.extChipTextActive]}>
                  {ext.label}
                </Text>
              </Pressable>
            ))}
        </Reveal>
      )}
    </View>
  );
}

function Chip({
  label,
  filled,
  active,
  disabled,
  onPress,
}: {
  label: string;
  filled: boolean;
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.chip,
        filled && styles.chipFilled,
        active && styles.chipActive,
        disabled && styles.chipDisabled,
      ]}
      hitSlop={6}
    >
      <Text
        style={[
          styles.chipText,
          filled && styles.chipTextFilled,
          disabled && styles.chipTextDisabled,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  chipFilled: {
    backgroundColor: colors.surfaceRaised,
  },
  chipActive: {
    borderWidth: 1,
    borderColor: colors.accent,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  chipTextFilled: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  chipTextDisabled: {
    color: colors.textTertiary,
  },
  rootGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: 8,
    justifyContent: 'center',
  },
  rootCell: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rootCellActive: {
    backgroundColor: colors.accentSoft,
  },
  rootCellText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  rootCellTextActive: {
    color: colors.accent,
  },
  list: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  listRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  listRowActive: {
    backgroundColor: colors.accentSoft,
  },
  listRowText: {
    ...typography.body,
    fontWeight: '600',
  },
  extRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: 8,
  },
  extChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  extChipActive: {
    backgroundColor: colors.accentSoft,
  },
  extChipText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  extChipTextActive: {
    color: colors.accent,
  },
});
