import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { loginInit, loginVerify } from '../api/auth';
import { StorageService } from '../services/StorageService';
import { COLORS } from '../theme/colors';

const getApiErrorMessage = (error: any, fallback: string): string => {
    const data = error?.response?.data;
    if (!data) return fallback;
    return data.message || data.error || fallback;
};

const OtpScreen = ({ navigation, route }: any) => {
    const { formattedValue, selectedCountry } = route.params as {
        formattedValue: string;
        selectedCountry: { name: string; code: string; callingCode: string; flag: string };
    };

    const [otp, setOtp] = useState('');
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const otpInputRef = useRef<TextInput>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startResendTimer = useCallback(() => {
        setResendTimer(60);
        setCanResend(false);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setResendTimer(prev => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => {
        // Start timer and focus input when screen mounts
        startResendTimer();
        setTimeout(() => otpInputRef.current?.focus(), 300);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [startResendTimer]);

    const handleResend = async () => {
        setLoading(true);
        try {
            await loginInit(formattedValue);
            setOtp('');
            setOtpDigits(['', '', '', '', '', '']);
            startResendTimer();
            setTimeout(() => otpInputRef.current?.focus(), 300);
        } catch (error: any) {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to resend OTP. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length < 6) return;

        setLoading(true);
        try {
            const countryData = {
                code: `+${selectedCountry.callingCode}`,
                shortcode: selectedCountry.code,
                name: selectedCountry.name,
            };

            const data = await loginVerify(formattedValue, otp, countryData);

            if (data.token || data.access_token) {
                const token = data.token || data.access_token;
                await StorageService.setItem(StorageService.KEYS.AUTH_TOKEN, token);
            }
            await StorageService.setItem(StorageService.KEYS.PHONE_NUMBER, formattedValue);

            const onboarding = data.onboarding;
            if (onboarding) {
                const walletType = onboarding.wallet_type || 'custodial';
                await StorageService.setItem('@wallet_type', walletType);
                await StorageService.setItem(StorageService.KEYS.ONBOARDING_STEP, onboarding.step || 'complete');
                await StorageService.setItem(StorageService.KEYS.ONBOARDING_FLOW, onboarding.flow || 'login');

                // Route based on flow type
                if (onboarding.flow === 'login') {
                    navigation.navigate('BiometricLogin');
                } else {
                    navigation.navigate('EmailVerify');
                }
            } else {
                // Legacy fallback: assuming new user if no onboarding data
                navigation.navigate('EmailVerify');
            }
        } catch (error: any) {
            Alert.alert('Error', getApiErrorMessage(error, 'Invalid OTP. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    const isButtonEnabled = otp.length === 6 && !loading;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.inner}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.topRow}>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={styles.backButton}
                            >
                                <Text style={styles.backButtonText}>←</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.supportIcon}>
                                <Text style={{ fontSize: 24 }}>🎧</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.title}>Enter verification code</Text>
                        <Text style={styles.subtitle}>We sent a 6-digit code to your number:</Text>
                        <Text style={styles.phoneDisplay}>{formattedValue}</Text>
                    </View>

                    {/* OTP Input */}
                    <View style={styles.otpSection}>
                        {/* Hidden TextInput to capture keystrokes */}
                        <TextInput
                            ref={otpInputRef}
                            style={styles.hiddenInput}
                            keyboardType="number-pad"
                            maxLength={6}
                            value={otp}
                            caretHidden
                            onChangeText={(text) => {
                                const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
                                setOtp(cleaned);
                                const digits = cleaned.split('');
                                setOtpDigits([
                                    digits[0] || '',
                                    digits[1] || '',
                                    digits[2] || '',
                                    digits[3] || '',
                                    digits[4] || '',
                                    digits[5] || '',
                                ]);
                            }}
                            autoFocus
                        />

                        {/* 6 visual digit boxes */}
                        <TouchableWithoutFeedback onPress={() => otpInputRef.current?.focus()}>
                            <View style={styles.otpBoxesRow}>
                                {otpDigits.map((digit, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.otpBox,
                                            otp.length === i && styles.otpBoxFocused,
                                        ]}
                                    >
                                        <Text style={styles.otpBoxText}>{digit}</Text>
                                    </View>
                                ))}
                            </View>
                        </TouchableWithoutFeedback>

                        {/* Resend row */}
                        <View style={styles.resendRow}>
                            {canResend ? (
                                <TouchableOpacity onPress={handleResend} disabled={loading}>
                                    <Text style={styles.resendText}>
                                        Didn't receive a code?{' '}
                                        <Text style={styles.resendLink}>Resend</Text>
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.resendText}>
                                    Didn't receive a code? Resend in{' '}
                                    <Text style={styles.resendCountdown}>
                                        {String(Math.floor(resendTimer / 60)).padStart(2, '0')}:{String(resendTimer % 60).padStart(2, '0')}
                                    </Text>
                                </Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.flexFiller} />

                    {/* Continue Button */}
                    <View style={styles.bottomSection}>
                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                isButtonEnabled ? styles.buttonEnabled : styles.buttonDisabled,
                            ]}
                            onPress={handleVerifyOtp}
                            disabled={!isButtonEnabled}
                        >
                            <View style={styles.buttonInner}>
                                {loading ? (
                                    <ActivityIndicator color={COLORS.background} />
                                ) : (
                                    <Text style={[
                                        styles.buttonText,
                                        isButtonEnabled && styles.buttonTextEnabled,
                                    ]}>
                                        Continue
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
    header: {
        marginTop: 16,
        marginBottom: 8,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: COLORS.white,
        fontSize: 24,
    },
    supportIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: COLORS.white,
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 10,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 15,
        marginBottom: 4,
    },
    phoneDisplay: {
        color: COLORS.primary,
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 8,
    },
    otpSection: {
        marginTop: 32,
    },
    hiddenInput: {
        position: 'absolute',
        opacity: 0,
        width: 0,
        height: 0,
    },
    otpBoxesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    otpBox: {
        width: 50,
        height: 60,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: 'rgba(212, 186, 127, 0.30)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    otpBoxFocused: {
        borderColor: COLORS.primary,
        borderWidth: 2,
    },
    otpBoxText: {
        color: COLORS.primary,
        fontSize: 24,
        fontWeight: '600',
    },
    resendRow: {
        marginTop: 24,
        alignItems: 'center',
    },
    resendText: {
        color: 'rgba(255, 255, 255, 0.55)',
        fontSize: 14,
        textAlign: 'center',
    },
    resendLink: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    resendCountdown: {
        color: COLORS.primary,
    },
    flexFiller: {
        flex: 1,
    },
    bottomSection: {
        marginBottom: 20,
    },
    primaryButton: {
        borderRadius: 50,
        overflow: 'hidden',
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

export default OtpScreen;
