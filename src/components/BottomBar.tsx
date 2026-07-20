import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/theme';

interface Props {
  onReset: () => void;
  leftHanded: boolean;
  onToggleLeftHanded: () => void;
  resetDisabled: boolean;
}

export default function BottomBar({
  onReset,
  leftHanded,
  onToggleLeftHanded,
  resetDisabled,
}: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onReset}
        disabled={resetDisabled}
        style={[styles.textButton, resetDisabled && styles.textButtonDisabled]}
        hitSlop={12}
      >
        <Text style={[styles.resetLabel, resetDisabled && styles.resetLabelDisabled]}>Reset</Text>
      </Pressable>

      <Pressable
        onPress={onToggleLeftHanded}
        style={styles.toggle}
        hitSlop={12}
        accessibilityRole="switch"
        accessibilityState={{ checked: leftHanded }}
      >
        <Text style={styles.toggleLabel}>Left-handed</Text>
        <View pointerEvents="none">
          <Switch
            value={leftHanded}
            trackColor={{ true: colors.accent, false: colors.surfaceRaised }}
            thumbColor={colors.white}
            // @ts-expect-error react-native-web-only props for the "on" state
            activeThumbColor={colors.white}
            activeTrackColor={colors.accent}
            ios_backgroundColor={colors.surfaceRaised}
          />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  textButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  textButtonDisabled: {
    opacity: 0.35,
  },
  resetLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  resetLabelDisabled: {
    color: colors.textTertiary,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toggleLabel: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
