import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
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
    Modal,
    FlatList,
} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { AsYouTypeFormatter, PhoneNumberUtil } from 'google-libphonenumber';
import { COLORS } from '../theme/colors';
import { loginInit, loginVerify } from '../api/auth';
import { StorageService } from '../services/StorageService';

const phoneUtil = PhoneNumberUtil.getInstance();

const LoginScreen = ({ navigation }: any) => {
    const [value, setValue] = useState('');
    const [formattedValue, setFormattedValue] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [loading, setLoading] = useState(false);
    const [isPhoneValid, setIsPhoneValid] = useState(false);

    const [isTermsAccepted, setIsTermsAccepted] = useState(false);

    // OTP state
    const otpInputRef = useRef<TextInput>(null);
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
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
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    const phoneInput = useRef<PhoneInput>(null);
    const [isCountryPickerVisible, setIsCountryPickerVisible] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState({ name: 'India', code: 'IN', callingCode: '91', flag: '🇮🇳' });
    const [countrySearch, setCountrySearch] = useState('');

    // Popular country list matching the reference screenshot
    const COUNTRIES = [
        { name: 'Afghanistan', code: 'AF', callingCode: '93', flag: '🇦🇫' },
        { name: 'Albania', code: 'AL', callingCode: '355', flag: '🇦🇱' },
        { name: 'Algeria', code: 'DZ', callingCode: '213', flag: '🇩🇿' },
        { name: 'Argentina', code: 'AR', callingCode: '54', flag: '🇦🇷' },
        { name: 'Australia', code: 'AU', callingCode: '61', flag: '🇦🇺' },
        { name: 'Austria', code: 'AT', callingCode: '43', flag: '🇦🇹' },
        { name: 'Belgium', code: 'BE', callingCode: '32', flag: '🇧🇪' },
        { name: 'Brazil', code: 'BR', callingCode: '55', flag: '🇧🇷' },
        { name: 'Canada', code: 'CA', callingCode: '1', flag: '🇨🇦' },
        { name: 'China', code: 'CN', callingCode: '86', flag: '🇨🇳' },
        { name: 'Denmark', code: 'DK', callingCode: '45', flag: '🇩🇰' },
        { name: 'Estonia', code: 'EE', callingCode: '372', flag: '🇪🇪' },
        { name: 'Finland', code: 'FI', callingCode: '358', flag: '🇫🇮' },
        { name: 'France', code: 'FR', callingCode: '33', flag: '🇫🇷' },
        { name: 'Germany', code: 'DE', callingCode: '49', flag: '🇩🇪' },
        { name: 'Hungary', code: 'HU', callingCode: '36', flag: '🇭🇺' },
        { name: 'India', code: 'IN', callingCode: '91', flag: '🇮🇳' },
        { name: 'Indonesia', code: 'ID', callingCode: '62', flag: '🇮🇩' },
        { name: 'Ireland', code: 'IE', callingCode: '353', flag: '🇮🇪' },
        { name: 'Italy', code: 'IT', callingCode: '39', flag: '🇮🇹' },
        { name: 'Japan', code: 'JP', callingCode: '81', flag: '🇯🇵' },
        { name: 'Latvia', code: 'LV', callingCode: '371', flag: '🇱🇻' },
        { name: 'Lithuania', code: 'LT', callingCode: '370', flag: '🇱🇹' },
        { name: 'Mexico', code: 'MX', callingCode: '52', flag: '🇲🇽' },
        { name: 'Netherlands', code: 'NL', callingCode: '31', flag: '🇳🇱' },
        { name: 'New Zealand', code: 'NZ', callingCode: '64', flag: '🇳🇿' },
        { name: 'Nigeria', code: 'NG', callingCode: '234', flag: '🇳🇬' },
        { name: 'Norway', code: 'NO', callingCode: '47', flag: '🇳🇴' },
        { name: 'Pakistan', code: 'PK', callingCode: '92', flag: '🇵🇰' },
        { name: 'Poland', code: 'PL', callingCode: '48', flag: '🇵🇱' },
        { name: 'Portugal', code: 'PT', callingCode: '351', flag: '🇵🇹' },
        { name: 'Romania', code: 'RO', callingCode: '40', flag: '🇷🇴' },
        { name: 'Russia', code: 'RU', callingCode: '7', flag: '🇷🇺' },
        { name: 'Saudi Arabia', code: 'SA', callingCode: '966', flag: '🇸🇦' },
        { name: 'Singapore', code: 'SG', callingCode: '65', flag: '🇸🇬' },
        { name: 'South Africa', code: 'ZA', callingCode: '27', flag: '🇿🇦' },
        { name: 'South Korea', code: 'KR', callingCode: '82', flag: '🇰🇷' },
        { name: 'Spain', code: 'ES', callingCode: '34', flag: '🇪🇸' },
        { name: 'Sweden', code: 'SE', callingCode: '46', flag: '🇸🇪' },
        { name: 'Switzerland', code: 'CH', callingCode: '41', flag: '🇨🇭' },
        { name: 'Turkey', code: 'TR', callingCode: '90', flag: '🇹🇷' },
        { name: 'Ukraine', code: 'UA', callingCode: '380', flag: '🇺🇦' },
        { name: 'United Arab Emirates', code: 'AE', callingCode: '971', flag: '🇦🇪' },
        { name: 'United Kingdom', code: 'GB', callingCode: '44', flag: '🇬🇧' },
        { name: 'United States', code: 'US', callingCode: '1', flag: '🇺🇸' },
        { name: 'Vietnam', code: 'VN', callingCode: '84', flag: '🇻🇳' },
    ];

    const filteredCountries = useMemo(() => {
        if (!countrySearch) return COUNTRIES;
        return COUNTRIES.filter(c =>
            c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
            c.callingCode.includes(countrySearch)
        );
    }, [countrySearch]);

    const getApiErrorMessage = (error: any, fallback: string): string => {
        const data = error?.response?.data;
        if (!data) return fallback;
        // Return exact message from API response
        return data.message || data.error || fallback;
    };

    const handleSendOtp = async () => {
        setLoading(true);
        try {
            await loginInit(formattedValue);
            setStep('otp');
            setOtpDigits(['', '', '', '', '', '']);
            setOtp('');
            startResendTimer();
            setTimeout(() => otpInputRef.current?.focus(), 300);
        } catch (error: any) {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to send OTP. Please try again.'));
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
            // Extract country data from phone input ref
            const countryCode = phoneInput.current?.getCountryCode() || 'IN';
            const callingCode = phoneInput.current?.getCallingCode() || '91';

            // For now, mapping common countries or using shortcode as fallback for name
            const countryName = countryCode === 'IN' ? 'India' : countryCode;

            const countryData = {
                code: `+${callingCode}`,
                shortcode: countryCode,
                name: countryName
            };

            const data = await loginVerify(formattedValue, otp, countryData);

            // Persist session data and wallet type from panda-web response
            if (data.token || data.access_token) {
                const token = data.token || data.access_token;
                await StorageService.setItem(StorageService.KEYS.AUTH_TOKEN, token);
            }
            await StorageService.setItem(StorageService.KEYS.PHONE_NUMBER, formattedValue);

            // Handle onboarding/wallet info
            const onboarding = data.onboarding;
            const walletType = onboarding?.wallet_type || 'custodial';
            await StorageService.setItem('@wallet_type', walletType);

            console.log('Login Success:', data);

            // Navigate based on onboarding state or re-auth needs
            const isReturningUser = onboarding?.flow === 'login' || data.signupStep === 'complete';

            if (isReturningUser) {
                // If it's a returning user, panda-web flow requires biometric re-auth
                navigation.replace('BiometricLogin');
            } else {
                // New user flow: navigate to Home (or onboarding steps if they existed)
                navigation.replace('Home');
            }
        } catch (error: any) {
            Alert.alert('Error', getApiErrorMessage(error, 'Invalid OTP. Please try again.'));
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
                        <View style={styles.topRow}>
                            <TouchableOpacity
                                onPress={() => step === 'otp' ? setStep('phone') : navigation.goBack()}
                                style={styles.backButton}
                            >
                                <Text style={styles.backButtonText}>←</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.supportIcon}>
                                <Text style={{ fontSize: 24 }}>🎧</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.title}>
                            {step === 'phone' ? "What's your mobile number?" : "Verification"}
                        </Text>
                        <Text style={styles.subtitle}>
                            {step === 'phone'
                                ? "We will send you a verification code"
                                : `Enter the 6-digit code sent to ${formattedValue}`}
                        </Text>
                    </View>

                    <View style={styles.form}>
                        {step === 'phone' ? (
                            <View style={styles.phoneInputWrapper}>
                                <View style={styles.customInputRow}>
                                    <TouchableOpacity
                                        style={styles.codeContainer}
                                        onPress={() => {
                                            setIsCountryPickerVisible(true);
                                        }}
                                    >
                                        <Text style={styles.phoneCodeText}>
                                            {`+${selectedCountry.callingCode}`}
                                        </Text>
                                        <Text style={styles.dropdownArrow}>⌵</Text>
                                    </TouchableOpacity>

                                    <TextInput
                                        style={styles.customNumberInput}
                                        placeholder="201-555-0123"
                                        placeholderTextColor="rgba(212, 186, 127, 0.25)"
                                        keyboardType="phone-pad"
                                        value={value}
                                        selectionColor={COLORS.primary}
                                        onChangeText={(text) => {
                                            // 1. Remove non-numeric characters to get raw input
                                            const cleaned = text.replace(/[^0-9]/g, '');

                                            // 2. Format as you type
                                            let formatted = cleaned;
                                            if (cleaned.length > 0) {
                                                try {
                                                    const formatter = new AsYouTypeFormatter(selectedCountry.code);
                                                    formatter.clear();
                                                    cleaned.split('').forEach(char => {
                                                        formatted = formatter.inputDigit(char);
                                                    });
                                                } catch (e) {
                                                    console.warn('Formatting error:', e);
                                                }
                                            }

                                            setValue(formatted);

                                            // 3. Strict Validation using PhoneNumberUtil
                                            let isValid = false;
                                            if (cleaned.length >= 7) {
                                                try {
                                                    const parsedNumber = phoneUtil.parseAndKeepRawInput(cleaned, selectedCountry.code);
                                                    isValid = phoneUtil.isValidNumberForRegion(parsedNumber, selectedCountry.code);
                                                } catch (e) {
                                                    isValid = false;
                                                }
                                            }
                                            setIsPhoneValid(isValid);

                                            // 4. Sync formatted value for API
                                            setFormattedValue(`+${selectedCountry.callingCode}${cleaned}`);
                                        }}
                                        autoFocus
                                    />
                                </View>

                                {/* Hidden library component for modal and logic */}
                                <View style={styles.hiddenPhoneInputContainer}>
                                    <PhoneInput
                                        ref={phoneInput}
                                        defaultValue={value}
                                        defaultCode="IN"
                                        layout="first"
                                        onChangeText={(text) => setValue(text)}
                                        onChangeFormattedText={(text) => setFormattedValue(text)}
                                        withDarkTheme
                                    />
                                </View>

                                {/* Custom Country Picker Modal */}
                                <Modal
                                    visible={isCountryPickerVisible}
                                    animationType="slide"
                                    onRequestClose={() => setIsCountryPickerVisible(false)}
                                >
                                    <SafeAreaView style={styles.countryModalContainer}>
                                        <KeyboardAvoidingView
                                            style={{ flex: 1 }}
                                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                        >
                                            {/* Search bar */}
                                            <View style={styles.countrySearchContainer}>
                                                <View style={styles.searchBox}>
                                                    <Text style={styles.searchIconText}>⌕</Text>
                                                    <TextInput
                                                        style={styles.searchInput}
                                                        placeholder="Search"
                                                        placeholderTextColor="rgba(255,255,255,0.35)"
                                                        value={countrySearch}
                                                        onChangeText={setCountrySearch}
                                                        selectionColor={COLORS.primary}
                                                        autoCorrect={false}
                                                        autoFocus
                                                    />
                                                </View>
                                            </View>

                                            {/* Country list */}
                                            <FlatList
                                                data={filteredCountries}
                                                keyExtractor={(item) => item.code}
                                                keyboardShouldPersistTaps="handled"
                                                renderItem={({ item }) => {
                                                    const isSelected = item.code === selectedCountry.code;
                                                    return (
                                                        <TouchableOpacity
                                                            style={[styles.countryItem, isSelected && styles.countryItemSelected]}
                                                            onPress={() => {
                                                                setSelectedCountry(item);
                                                                setFormattedValue(`+${item.callingCode}${value}`);
                                                                setCountrySearch('');
                                                                setIsCountryPickerVisible(false);
                                                            }}
                                                        >
                                                            <Text style={styles.countryFlag}>{item.flag}</Text>
                                                            <Text style={styles.countryCallingCode}>+{item.callingCode}</Text>
                                                            <Text style={styles.countryName}>{item.name}</Text>
                                                        </TouchableOpacity>
                                                    );
                                                }}
                                            />
                                        </KeyboardAvoidingView>
                                    </SafeAreaView>
                                </Modal>
                            </View>
                        ) : (
                            <View style={styles.otpInputWrapper}>
                                {/* Hidden TextInput to capture keystrokes */}
                                <TextInput
                                    ref={otpInputRef}
                                    style={styles.hiddenOtpInput}
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
                                        <TouchableOpacity onPress={() => { handleSendOtp(); }}>
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
                        )}

                        <View style={styles.flexFiller} />

                        <View style={styles.bottomSection}>
                            {step === 'phone' && (
                                <TouchableOpacity
                                    style={styles.termsRow}
                                    onPress={() => setIsTermsAccepted(!isTermsAccepted)}
                                >
                                    <View style={[styles.checkbox, isTermsAccepted && styles.checkboxChecked]}>
                                        {isTermsAccepted && <Text style={styles.checkmark}>✓</Text>}
                                    </View>
                                    <Text style={styles.termsText}>
                                        By Continuing, you agree to our{' '}
                                        <Text style={styles.linkText}>Terms of Use</Text> and{' '}
                                        <Text style={styles.linkText}>Privacy Policy</Text>.
                                    </Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[
                                    styles.primaryButton,
                                    (loading || (step === 'phone' && (!isPhoneValid || !isTermsAccepted)) || (step === 'otp' && otp.length < 6)) && styles.buttonDisabled,
                                    (!loading && ((step === 'phone' && isPhoneValid && isTermsAccepted) || (step === 'otp' && otp.length === 6))) && styles.buttonEnabled
                                ]}
                                onPress={step === 'phone' ? handleSendOtp : handleVerifyOtp}
                                disabled={loading || (step === 'phone' && (!isPhoneValid || !isTermsAccepted)) || (step === 'otp' && otp.length < 6)}
                            >
                                <View style={styles.buttonInner}>
                                    {loading ? (
                                        <ActivityIndicator color={COLORS.background} />
                                    ) : (
                                        <Text style={[
                                            styles.buttonText,
                                            (!loading && ((step === 'phone' && isPhoneValid && isTermsAccepted) || (step === 'otp' && otp.length === 6))) && styles.buttonTextEnabled
                                        ]}>
                                            {step === 'phone' ? "Continue" : "Verify & Sign In"}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>

                            {step === 'phone' && (
                                <View style={styles.socialWrapper}>
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
                                            <Text style={styles.socialIcon}></Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
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
        marginTop: 10,
        marginBottom: 30,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    backButtonText: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: '300',
    },
    supportIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.8,
    },
    title: {
        fontSize: 32,
        fontWeight: '500',
        color: COLORS.white,
        marginBottom: 12,
        lineHeight: 40,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        fontWeight: '400',
    },
    form: {
        flex: 1,
    },
    phoneInputWrapper: {
        marginTop: 0, // Controlled by you above
        marginBottom: 60, // This sets the gap between phone field and terms section
    },
    customInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16, // Compact space: code + chevron + gap
    },
    customNumberInput: {
        flex: 1,
        color: COLORS.primary, // Gold when typing, matches the design
        fontSize: 34,
        fontWeight: '300',
        height: 70,
        padding: 0,
    },
    hiddenPhoneInputContainer: {
        height: 0,
        opacity: 0,
        overflow: 'hidden',
        position: 'absolute',
    },
    phoneContainer: {
        width: '100%',
        height: 70,
        backgroundColor: 'transparent',
    },
    phoneTextContainer: {
        backgroundColor: 'transparent',
        paddingVertical: 0,
    },
    phoneInputStyle: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 34,
        fontWeight: '300',
        height: 70,
        marginLeft: -15, // Pull number even closer for tighter alignment
    },
    phoneCodeText: {
        color: COLORS.primary,
        fontSize: 34,
        fontWeight: '300',
        letterSpacing: -0.5, // Tighter for gold code text
        lineHeight: 40,
    },
    flagButton: {
        width: 110, // Wider to accommodate chevron comfortably
        paddingLeft: 0,
    },
    dropdownArrow: {
        color: COLORS.primary,
        fontSize: 28,
        marginLeft: 8, // Small gap between country code and chevron
        fontWeight: '300',
        lineHeight: 25,
    },
    otpInputWrapper: {
        width: '100%',
    },
    hiddenOtpInput: {
        position: 'absolute',
        opacity: 0,
        width: 0,
        height: 0,
    },
    otpBoxesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 32,
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
    termsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 25,
        paddingRight: 20,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: COLORS.primary,
        marginRight: 12,
        marginTop: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: COLORS.primary,
    },
    checkmark: {
        color: COLORS.background,
        fontSize: 14,
        fontWeight: '900',
    },
    termsText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        lineHeight: 18,
    },
    linkText: {
        color: COLORS.primary,
        fontWeight: '500',
    },
    primaryButton: {
        backgroundColor: 'rgba(212, 186, 127, 0.15)', // Dimmer gold base for disabled
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(212, 186, 127, 0.3)',
    },
    buttonEnabled: {
        backgroundColor: COLORS.primary, // Solid gold when enabled
        borderColor: COLORS.primary,
        elevation: 4,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    buttonDisabled: {
        opacity: 0.4,
    },
    buttonText: {
        color: 'rgba(255, 255, 255, 0.5)', // Muted text for disabled
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },
    buttonTextEnabled: {
        color: COLORS.background, // Dark text on gold background
    },

    socialWrapper: {
        marginTop: 30,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    dividerText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        marginHorizontal: 15,
        fontWeight: '600',
        letterSpacing: 1,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    socialButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    socialIcon: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: '500',
    },
    countrySearchContainer: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 12,
        backgroundColor: COLORS.background,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#000',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    searchIconText: {
        fontSize: 28,
        marginRight: 12,
        color: COLORS.primary, // Gold search icon
        fontWeight: '400',
    },
    searchInput: {
        flex: 1,
        color: COLORS.white,
        fontSize: 17,
        height: '100%',
        padding: 0,
    },
    countryModalContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 60,
    },
    countryItemSelected: {
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 12,
        marginHorizontal: 8,
    },
    countryFlag: {
        fontSize: 28,
        width: 44,
    },
    countryCallingCode: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '400',
        width: 52,
    },
    countryName: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '400',
        flex: 1,
    },
});

export default LoginScreen;
