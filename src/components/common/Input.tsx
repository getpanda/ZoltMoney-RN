import React from 'react';
import { View, TextInput, TextInputProps, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../theme/Theme';
import Typography from './Typography';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
}

/**
 * Standardized Input component with label and error handling.
 */
const Input: React.FC<InputProps> = ({
    label,
    error,
    containerStyle,
    style,
    ...props
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Typography variant="bodySecondary" style={styles.label}>
                    {label}
                </Typography>
            )}
            <View
                style={[
                    styles.inputWrapper,
                    error ? styles.inputError : {},
                    props.multiline ? styles.multiline : {},
                ]}
            >
                <TextInput
                    placeholderTextColor={COLORS.textMuted}
                    style={[styles.input, style]}
                    {...props}
                />
            </View>
            {error && (
                <Typography variant="caption" color={COLORS.error} style={styles.errorText}>
                    {error}
                </Typography>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
        width: '100%',
    },
    label: {
        marginBottom: SPACING.xs,
        fontSize: 14,
    },
    inputWrapper: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.divider,
        paddingHorizontal: SPACING.md,
        height: 52,
        justifyContent: 'center',
    },
    input: {
        color: COLORS.text,
        fontSize: 16,
        height: '100%',
    },
    inputError: {
        borderColor: COLORS.error,
    },
    errorText: {
        marginTop: SPACING.xs,
    },
    multiline: {
        height: 100,
        paddingTop: SPACING.sm,
        textAlignVertical: 'top',
    },
});

export default Input;
