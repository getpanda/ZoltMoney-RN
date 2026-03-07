/**
 * Theme configuration using HSL-tailored colors for a premium feel.
 */

export const COLORS = {
  // Primary
  primary: '#D4BA7F',

  // Backgrounds
  background: '#021511',
  surface: '#151515',
  surfaceLight: '#2F2E2F',

  // Text
  text: '#FFFFFF',
  textSecondary: '#DADADA',
  textMuted: '#8B8888',

  // States
  success: '#61E787',
  error: '#FC4A4A',

  // Borders & Dividers
  border: '#464545',
  divider: '#2D2D2D',

  // Opacity Variants
  white05: 'rgba(255, 255, 255, 0.05)',
  white10: 'rgba(255, 255, 255, 0.1)',
  white20: 'rgba(255, 255, 255, 0.2)',
  white35: 'rgba(255, 255, 255, 0.35)',
  white40: 'rgba(255, 255, 255, 0.4)',
  primary06: 'rgba(212, 186, 127, 0.06)',
  primary10: 'rgba(212, 186, 127, 0.1)',
  primary20: 'rgba(212, 186, 127, 0.2)',
  primary25: 'rgba(212, 186, 127, 0.25)',
  primary30: 'rgba(212, 186, 127, 0.3)',
  white12: 'rgba(255, 255, 255, 0.12)',
  white45: 'rgba(255, 255, 255, 0.45)',
  white60: 'rgba(255, 255, 255, 0.6)',
  white75: 'rgba(255, 255, 255, 0.75)',
  white92: 'rgba(255, 255, 255, 0.92)',
  background40: 'rgba(2, 21, 17, 0.4)',

  // UI Specific
  promoBrown: '#7C3E1E',
  promoPurple: '#3B2FE0',
  promoDarkText: '#3D1A06',
  dividerPurple: '#5B4ECC',
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
  screenTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: COLORS.text,
    lineHeight: 34,
  },
  screenSubtitle: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: COLORS.textSecondary,
    lineHeight: 22,
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
