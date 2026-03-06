/**
 * Theme configuration using HSL-tailored colors for a premium feel.
 */

export const COLORS = {
    // Primary - Gold/Greenish
    primary: 'hsl(142, 70%, 45%)', // Vibrant Green
    primaryDark: 'hsl(142, 70%, 35%)',
    accent: 'hsl(45, 100%, 50%)', // Gold

    // Backgrounds
    background: 'hsl(220, 15%, 10%)', // Dark Slate
    surface: 'hsl(220, 15%, 15%)',
    surfaceLight: 'hsl(220, 15%, 20%)',

    // Text
    text: 'hsl(0, 0%, 100%)',
    textSecondary: 'hsl(220, 10%, 70%)',
    textMuted: 'hsl(220, 10%, 50%)',

    // States
    success: 'hsl(142, 70%, 45%)',
    error: 'hsl(0, 84%, 60%)',
    warning: 'hsl(38, 92%, 50%)',

    // Borders & Dividers
    border: 'hsl(220, 15%, 25%)',
    divider: 'hsl(220, 15%, 18%)',
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
