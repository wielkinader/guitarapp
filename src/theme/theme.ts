import { Platform } from 'react-native';

// Black, white, and one warm amber accent. No gradients, no extra colors.
export const colors = {
  background: '#0A0A0B',
  surface: '#151517',
  surfaceRaised: '#1E1E21',
  hairline: '#2A2A2D',
  textPrimary: '#F5F5F4',
  textSecondary: '#8E8E93',
  textTertiary: '#5A5A5D',
  accent: '#F2994A',
  accentSoft: 'rgba(242, 148, 74, 0.16)',
  muted: '#5A5A5D',
  white: '#FFFFFF',
  black: '#000000',
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// SF Pro on iOS, system default elsewhere, and the closest web equivalent
// (SF Pro isn't licensed for web, so this stack renders SF Pro on Apple
// devices and a matching-weight system font everywhere else).
export const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default:
    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
});

export const typography = {
  chordName: {
    fontFamily,
    fontSize: 56,
    fontWeight: '700' as const,
    letterSpacing: -1,
    color: colors.textPrimary,
  },
  chordSubtext: {
    fontFamily,
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  label: {
    fontFamily,
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  body: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.textPrimary,
  },
};
