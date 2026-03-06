import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme/Theme';
import Typography from './Typography';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'error';
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Premium Button component with multiple variants and loading states.
 */
const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  ...props
}) => {
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          container: { backgroundColor: COLORS.surfaceLight },
          text: { color: COLORS.text },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: COLORS.border,
          },
          text: { color: COLORS.text },
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: COLORS.primary },
        };
      case 'error':
        return {
          container: { backgroundColor: COLORS.error },
          text: { color: COLORS.text },
        };
      case 'primary':
      default:
        return {
          container: { backgroundColor: COLORS.primary },
          text: { color: COLORS.surface },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        styles.container,
        variantStyles.container,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text.color} size="small" />
      ) : (
        <Typography variant="button" style={[styles.text, variantStyles.text]}>
          {title}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
  },
  text: {
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
