import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { TYPOGRAPHY } from '../../theme/Theme';

interface TypographyProps extends TextProps {
  variant?: keyof typeof TYPOGRAPHY;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

/**
 * Standardized Typography component for PandaMoney-RN.
 */
export default function Typography({
  variant = 'body',
  color,
  align,
  style,
  children,
  ...props
}: TypographyProps) {
  const variantStyle = TYPOGRAPHY[variant];

  return (
    <RNText
      style={[
        variantStyle,
        color ? { color } : {},
        align ? { textAlign: align } : {},
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}
