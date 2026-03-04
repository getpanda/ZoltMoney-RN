import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    StatusBar,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { emailOtpInit } from '../api/auth';

const getApiErrorMessage = (error: any, fallback: string): string => {
    const data = error?.response?.data;
    if (!data) return fallback;
    return data.message || data.error || fallback;
};

const EmailVerifyScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const emailInputRef = useRef<TextInput>(null);

    useEffect(() => {
        // Auto-focus email input on mount
        const timer = setTimeout(() => {
            emailInputRef.current?.focus();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    const handleSendOtp = async () => {
        setLoading(true);
        try {
            await emailOtpInit(email.trim());
            navigation.navigate('EmailOtpVerify', { email: email.trim() });
        } catch (error: any) {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to send OTP. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.inner}
                >
                    {/* Header icons */}
                    <View style={styles.topRow}>
                        <View style={styles.topRightIcons}>
                            <TouchableOpacity style={styles.iconButton}>
                                <Text style={styles.iconText}>◎</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Title */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Verify Your Email Address</Text>
                        <Text style={styles.subtitle}>
                            Enter your email address below and we'll send you a 6-digit verification code to confirm it
                        </Text>
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputWrapper}>
                        <TextInput
                            ref={emailInputRef}
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="rgba(255,255,255,0.35)"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={email}
                            onChangeText={setEmail}
                            selectionColor={COLORS.primary}
                        />
                    </View>

                    <View style={styles.flexFiller} />

                    {/* Send OTP Button */}
                    <View style={styles.bottomSection}>
                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                isEmailValid && !loading ? styles.buttonEnabled : styles.buttonDisabled,
                            ]}
                            onPress={handleSendOtp}
                            disabled={!isEmailValid || loading}
                        >
                            <View style={styles.buttonInner}>
                                {loading ? (
                                    <ActivityIndicator color={COLORS.background} />
                                ) : (
                                    <Text style={[
                                        styles.buttonText,
                                        isEmailValid && styles.buttonTextEnabled,
                                    ]}>
                                        Send OTP
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    inner: {
        flex: 1,
        paddingHorizontal: 24,
    },
    topRow: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 32,
    },
    backButton: {
        padding: 4,
    },
    backButtonText: {
        color: COLORS.white,
        fontSize: 26,
    },
    topRightIcons: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        color: COLORS.primary,
        fontSize: 18,
        fontWeight: '400',
    },
    header: {
        marginBottom: 32,
    },
    title: {
        color: COLORS.white,
        fontSize: 28,
        fontWeight: '700',
        lineHeight: 36,
        marginBottom: 12,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 15,
        lineHeight: 22,
    },
    inputWrapper: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(255,255,255,0.04)',
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    input: {
        color: COLORS.white,
        fontSize: 16,
        height: 52,
    },
    flexFiller: {
        flex: 1,
    },
    bottomSection: {
        marginBottom: 24,
    },
    primaryButton: {
        borderRadius: 50,
        height: 56,
        justifyContent: 'center',
    },
    buttonEnabled: {
        backgroundColor: COLORS.primary,
    },
    buttonDisabled: {
        backgroundColor: 'rgba(212, 186, 127, 0.25)',
    },
    buttonInner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 17,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.4)',
    },
    buttonTextEnabled: {
        color: COLORS.background,
    },
});

export default EmailVerifyScreen;
