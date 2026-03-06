/**
 * Theme configuration using HSL-tailored colors for a premium feel.
 */

export const COLORS = {
  // Primary - Gold/Greenish
  primary: '#BFA16F', // Premium Gold
  primaryDark: '#8C734B',
  accent: '#D4BA7F', // Brighter Gold

  // Backgrounds
  background: '#021511', // Deep Dark Green
  surface: '#0A2621',
  surfaceLight: '#123D35',

  // Text
  text: '#FFFFFF',
  textSecondary: 'hsl(142, 10%, 70%)',
  textMuted: 'hsl(142, 10%, 50%)',

  // States
  success: 'hsl(142, 70%, 45%)',
  error: 'hsl(0, 84%, 60%)',
  warning: 'hsl(38, 92%, 50%)',

  // Borders & Dividers
  border: '#1E3A35',
  divider: 'rgba(255, 255, 255, 0.1)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: COLORS.text,
  },
  bodySecondary: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: COLORS.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: COLORS.textMuted,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  full: 9999,
};

const Theme = {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  SHADOWS,
  BORDER_RADIUS,
};

export default Theme;
