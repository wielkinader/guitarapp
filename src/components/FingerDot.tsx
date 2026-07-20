import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';

export default function FingerDot() {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 6,
      tension: 140,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return <Animated.View style={[styles.dot, { transform: [{ scale }] }]} />;
}

const styles = StyleSheet.create({
  dot: {
    width: '68%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
});
