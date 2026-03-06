import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    StatusBar,
    TextInput,
    Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Theme from '../theme/Theme';
import { Typography, Button } from '../components/common';
import { emailOtpInit, emailOtpVerify } from '../api/auth';
import { StorageService } from '../services/StorageService';

const getApiErrorMessage = (error: any, fallback: string): string => {
    const data = error?.response?.data;
    if (!data) return fallback;
    return data.message || data.error || fallback;
};

/** Masks email: shuvayan@gmail.com → s******n@g*****.com */
const maskEmail = (email: string): string => {
    const [local, domain] = email.split('@');
    if (!domain) return email;

    const maskedLocal = local.length <= 2
        ? local[0] + '*'
        : local[0] + '*'.repeat(local.length - 2) + local[local.length - 1];

    const [domainName, ...tldParts] = domain.split('.');
    const tld = tldParts.join('.');
    const maskedDomain = domainName.length <= 1
        ? domainName + '*'
        : domainName[0] + '*'.repeat(domainName.length - 1);

    return `${maskedLocal}@${maskedDomain}.${tld}`;
};

const EmailOtpScreen = ({ navigation, route }: any) => {
    const { t } = useTranslation();
    const { email } = route.params as { email: string };

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
        startResendTimer();
        setTimeout(() => otpInputRef.current?.focus(), 300);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [startResendTimer]);

    const handleLogout = async () => {
        Alert.alert(
            t('auth.email_otp.logout_confirm.title') || t('auth.email_verify.logout_confirm.title'),
            t('auth.email_otp.logout_confirm.message') || t('auth.email_verify.logout_confirm.message'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('auth.email_otp.logout_confirm.confirm') || t('auth.email_verify.logout_confirm.confirm'),
                    style: 'destructive',
                    onPress: async () => {
                        await StorageService.logout();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Landing' }],
                        });
                    },
                },
            ]
        );
    };

    const handleResend = async () => {
        setLoading(true);
        try {
            await emailOtpInit(email);
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
            const result = await emailOtpVerify(email, otp);
            if (result?.result === 'success' || result?.success) {
                navigation.navigate('BiometricSetup');
            } else {
                Alert.alert(t('common.error'), result?.error || t('auth.email_otp.verify_error'));
            }
        } catch (error: any) {
            Alert.alert(t('common.error'), getApiErrorMessage(error, t('auth.email_otp.verify_error')));
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
                    {/* Top row: back + logout + support */}
                    <View style={styles.topRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Typography style={styles.backText}>←</Typography>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                            <Typography style={styles.logoutText}>{t('auth.email_otp.logout_confirm.confirm') || t('auth.email_verify.logout_confirm.confirm')}</Typography>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.supportIcon}>
                            <Typography style={styles.supportEmoji}>🎧</Typography>
                        </TouchableOpacity>
                    </View>

                    {/* Title */}
                    <Typography style={styles.title}>{t('auth.email_otp.title')}</Typography>

                    {/* Subtitle + masked email */}
                    <Typography style={styles.subtitle}>
                        {t('auth.email_otp.subtitle')}
                    </Typography>
                    <Typography style={styles.maskedEmail}>{maskEmail(email)}</Typography>

                    {/* OTP Boxes */}
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
                                    <Typography style={styles.otpBoxText}>{digit}</Typography>
                                </View>
                            ))}
                        </View>
                    </TouchableWithoutFeedback>

                    {/* Hidden input */}
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

                    {/* Resend row */}
                    <View style={styles.resendRow}>
                        {canResend ? (
                            <TouchableOpacity onPress={handleResend} disabled={loading}>
                                <Typography style={styles.resendText}>
                                    {t('auth.email_otp.resend_prefix')}
                                    <Typography style={styles.resendLink}>{t('auth.email_otp.resend_link')}</Typography>
                                </Typography>
                            </TouchableOpacity>
                        ) : (
                            <Typography style={styles.resendText}>
                                {t('auth.email_otp.resend_prefix')} {t('auth.email_otp.resend_wait')}
                                <Typography style={styles.resendCountdown}>
                                    {String(Math.floor(resendTimer / 60)).padStart(2, '0')}:{String(resendTimer % 60).padStart(2, '0')}
                                </Typography>
                            </Typography>
                        )}
                    </View>

                    <View style={styles.flexFiller} />

                    {/* Continue button - appears at bottom when 6 digits entered */}
                    {isButtonEnabled && (
                        <View style={styles.bottomSection}>
                            <Button
                                title={t('auth.email_otp.continue')}
                                onPress={handleVerifyOtp}
                                loading={loading}
                                disabled={!isButtonEnabled}
                            />
                        </View>
                    )}
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.COLORS.background,
    },
    inner: {
        flex: 1,
        paddingHorizontal: 24,
    },
    topRow: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 28,
    },
    logoutButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    logoutText: {
        color: Theme.COLORS.primary,
        fontSize: 15,
        fontWeight: '600',
    },
    backButton: {
        padding: 4,
    },
    backText: {
        color: Theme.COLORS.text,
        fontSize: 26,
    },
    supportIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1.5,
        borderColor: Theme.COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    supportEmoji: {
        fontSize: 22,
    },
    title: {
        color: Theme.COLORS.text,
        fontSize: 30,
        fontWeight: '700',
        lineHeight: 38,
        marginBottom: 14,
    },
    subtitle: {
        color: Theme.COLORS.textSecondary,
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 4,
    },
    maskedEmail: {
        color: Theme.COLORS.text,
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.3,
        marginBottom: 32,
    },
    otpBoxesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    otpBox: {
        width: 50,
        height: 65,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: 'rgba(212, 186, 127, 0.25)',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    otpBoxFocused: {
        borderColor: Theme.COLORS.primary,
        borderWidth: 2,
        backgroundColor: 'rgba(212, 186, 127, 0.06)',
    },
    otpBoxText: {
        color: Theme.COLORS.text,
        fontSize: 24,
        fontWeight: '600',
    },
    hiddenInput: {
        position: 'absolute',
        opacity: 0,
        width: 0,
        height: 0,
    },
    resendRow: {
        marginTop: 24,
        alignItems: 'center',
    },
    resendText: {
        color: Theme.COLORS.textSecondary,
        fontSize: 14,
        textAlign: 'center',
    },
    resendLink: {
        color: Theme.COLORS.primary,
        fontWeight: '600',
    },
    resendCountdown: {
        color: Theme.COLORS.primary,
        fontWeight: '600',
    },
    flexFiller: {
        flex: 1,
    },
    bottomSection: {
        marginBottom: 24,
    },
});

export default EmailOtpScreen;
