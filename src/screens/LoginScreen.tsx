import React, { useState, useRef } from 'react';
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
import PhoneInput from 'react-native-phone-number-input';
import { COLORS } from '../theme/colors';
import { loginInit, loginVerify } from '../api/auth';

const LoginScreen = ({ navigation }: any) => {
    const [value, setValue] = useState('');
    const [formattedValue, setFormattedValue] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [loading, setLoading] = useState(false);

    const phoneInput = useRef<PhoneInput>(null);

    const handleSendOtp = async () => {
        if (!phoneInput.current?.isValidNumber(value)) {
            Alert.alert('Invalid Number', 'Please enter a valid mobile number');
            return;
        }

        setLoading(true);
        try {
            await loginInit(formattedValue);
            setStep('otp');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length < 6) {
            Alert.alert('Invalid OTP', 'Please enter a 6-digit verification code');
            return;
        }

        setLoading(true);
        try {
            const data = await loginVerify(formattedValue, otp);
            // Success! We'll handle tokens and navigation here
            console.log('Login Success:', data);
            navigation.navigate('Home');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Invalid OTP. Please try again.');
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
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => step === 'otp' ? setStep('phone') : navigation.goBack()}
                            style={styles.backButton}
                        >
                            <Text style={styles.backButtonText}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>
                            {step === 'phone' ? "Enter Number" : "Verification"}
                        </Text>
                        <Text style={styles.subtitle}>
                            {step === 'phone'
                                ? "Enter your mobile number to continue"
                                : `Enter the 6-digit code sent to ${formattedValue}`}
                        </Text>
                    </View>

                    <View style={styles.form}>
                        {step === 'phone' ? (
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Mobile Number</Text>
                                <PhoneInput
                                    ref={phoneInput}
                                    defaultValue={value}
                                    defaultCode="IN"
                                    layout="first"
                                    onChangeText={(text) => setValue(text)}
                                    onChangeFormattedText={(text) => setFormattedValue(text)}
                                    withDarkTheme
                                    withShadow={false}
                                    autoFocus
                                    containerStyle={styles.phoneContainer}
                                    textContainerStyle={styles.phoneTextContainer}
                                    textInputStyle={styles.phoneInputStyle}
                                    codeTextStyle={styles.phoneCodeText}
                                    placeholder="88888 88888"
                                />
                            </View>
                        ) : (
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Verification Code</Text>
                                <TextInput
                                    style={styles.otpInput}
                                    placeholder="000 000"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    value={otp}
                                    onChangeText={setOtp}
                                    autoFocus
                                />
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.primaryButton, loading && styles.buttonDisabled]}
                            onPress={step === 'phone' ? handleSendOtp : handleVerifyOtp}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.background} />
                            ) : (
                                <Text style={styles.buttonText}>
                                    {step === 'phone' ? "Continue" : "Verify & Sign In"}
                                </Text>
                            )}
                        </TouchableOpacity>

                        {step === 'otp' && (
                            <TouchableOpacity
                                style={styles.resendButton}
                                onPress={handleSendOtp}
                            >
                                <Text style={styles.resendText}>Didn't receive code? Resend</Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>OR LOGIN WITH</Text>
                            <View style={styles.divider} />
                        </View>

                        <View style={styles.socialContainer}>
                            <TouchableOpacity style={styles.socialButton}>
                                <Text style={styles.socialIcon}>G</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <Text style={styles.socialIcon}></Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.termsText}>
                            By proceeding, you agree to our{' '}
                            <Text style={styles.linkText}>Terms</Text> and{' '}
                            <Text style={styles.linkText}>Privacy Policy</Text>
                        </Text>
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
        paddingHorizontal: 25,
    },
    header: {
        marginTop: 20,
        marginBottom: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        marginBottom: 20,
    },
    backButtonText: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: '300',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: COLORS.white,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        fontWeight: '400',
        lineHeight: 24,
    },
    form: {
        flex: 1,
    },
    inputWrapper: {
        marginBottom: 30,
    },
    label: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 15,
    },
    phoneContainer: {
        width: '100%',
        height: 60,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    phoneTextContainer: {
        backgroundColor: 'transparent',
    },
    phoneInputStyle: {
        color: COLORS.white,
        fontSize: 18,
        height: 60,
    },
    phoneCodeText: {
        color: COLORS.white,
        fontSize: 18,
    },
    otpInput: {
        height: 60,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        paddingHorizontal: 20,
        color: COLORS.white,
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: 8,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: COLORS.background,
        fontSize: 18,
        fontWeight: '700',
    },
    resendButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    resendText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 40,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dividerText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginHorizontal: 15,
        fontWeight: '600',
        letterSpacing: 1,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    socialButton: {
        width: '48%',
        height: 55,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    socialIcon: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: '700',
    },
    footer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    termsText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
    },
    linkText: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});

export default LoginScreen;
