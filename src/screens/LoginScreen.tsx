import React, { useState, useRef, useMemo } from 'react';
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
    ActivityIndicator,
    Alert,
    Modal,
    FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-native-phone-number-input';
import { AsYouTypeFormatter, PhoneNumberUtil } from 'google-libphonenumber';
import { loginInit } from '../api/auth';
import Theme from '../theme/Theme';
import Typography from '../components/common/Typography';
import Button from '../components/common/Button';


const phoneUtil = PhoneNumberUtil.getInstance();

const LoginScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const phoneInput = useRef<PhoneInput>(null);
    const phoneNumberRef = useRef<TextInput>(null);
    // ... existing state ...
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

    const [value, setValue] = useState('');
    const [formattedValue, setFormattedValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPhoneValid, setIsPhoneValid] = useState(false);
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);

    const getApiErrorMessage = (error: any, fallback: string): string => {
        const data = error?.response?.data;
        if (!data) return fallback;
        return data.message || data.error || fallback;
    };

    const handleSendOtp = async () => {
        setLoading(true);
        try {
            await loginInit(formattedValue);
            navigation.navigate('OtpVerification', {
                formattedValue,
                selectedCountry,
            });
        } catch (error: any) {
            Alert.alert(t('common.error'), getApiErrorMessage(error, t('auth.login.send_otp_error')));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.inner}
                >
                    <View style={styles.header}>
                        <View style={styles.topRow}>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={styles.backButton}
                            >
                                <Typography variant="h3" style={styles.backButtonText}>←</Typography>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.supportIcon}>
                                <Typography style={{ fontSize: 24 }}>🎧</Typography>
                            </TouchableOpacity>
                        </View>

                        <Typography variant="h1" style={styles.title}>{t('auth.login.title')}</Typography>
                        <Typography variant="bodySecondary" style={styles.subtitle}>{t('auth.login.subtitle')}</Typography>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.phoneInputWrapper}>
                            <View style={styles.customInputRow}>
                                <TouchableOpacity
                                    style={styles.codeContainer}
                                    onPress={() => {
                                        setIsCountryPickerVisible(true);
                                    }}
                                >
                                    <Typography style={styles.phoneCodeText}>
                                        {`+${selectedCountry.callingCode}`}
                                    </Typography>
                                    <Typography style={styles.dropdownArrow}>⌵</Typography>
                                </TouchableOpacity>

                                <TextInput
                                    ref={phoneNumberRef}
                                    style={styles.customNumberInput}
                                    placeholder="201-555-0123"
                                    placeholderTextColor="rgba(212, 186, 127, 0.25)"
                                    keyboardType="phone-pad"
                                    value={value}
                                    selectionColor={Theme.COLORS.primary}
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
                                                <Typography style={styles.searchIconText}>⌕</Typography>
                                                <TextInput
                                                    style={styles.searchInput}
                                                    placeholder="Search"
                                                    placeholderTextColor="rgba(255,255,255,0.35)"
                                                    value={countrySearch}
                                                    onChangeText={setCountrySearch}
                                                    selectionColor={Theme.COLORS.primary}
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
                                                            // Auto-focus phone input after modal closes
                                                            setTimeout(() => phoneNumberRef.current?.focus(), 300);
                                                        }}
                                                    >
                                                        <Typography style={styles.countryFlag}>{item.flag}</Typography>
                                                        <Typography style={styles.countryCallingCode}>+{item.callingCode}</Typography>
                                                        <Typography style={styles.countryName}>{item.name}</Typography>
                                                    </TouchableOpacity>
                                                );
                                            }}
                                        />
                                    </KeyboardAvoidingView>
                                </SafeAreaView>
                            </Modal>
                        </View>

                        <View style={styles.flexFiller} />

                        <View style={styles.bottomSection}>
                            <TouchableOpacity
                                style={styles.termsRow}
                                onPress={() => setIsTermsAccepted(!isTermsAccepted)}
                            >
                                <View style={[styles.checkbox, isTermsAccepted && styles.checkboxChecked]}>
                                    {isTermsAccepted && <Typography variant="caption" style={styles.checkmark}>✓</Typography>}
                                </View>
                                <Typography variant="caption" style={styles.termsText}>
                                    {t('auth.login.terms_prefix')}
                                    <Typography variant="caption" style={styles.linkText}>{t('auth.login.terms_link')}</Typography> and{' '}
                                    <Typography variant="caption" style={styles.linkText}>{t('auth.login.privacy_link')}</Typography>.
                                </Typography>
                            </TouchableOpacity>

                            <Button
                                title={t('common.continue')}
                                loading={loading}
                                disabled={!isPhoneValid || !isTermsAccepted}
                                onPress={handleSendOtp}
                            />

                            <View style={styles.socialWrapper}>
                                <View style={styles.dividerContainer}>
                                    <View style={styles.divider} />
                                    <Typography variant="caption" style={styles.dividerText}>{t('auth.login.social_divider')}</Typography>
                                    <View style={styles.divider} />
                                </View>

                                <View style={styles.socialContainer}>
                                    <TouchableOpacity style={styles.socialButton}>
                                        <Typography variant="h3" style={styles.socialIcon}>G</Typography>
                                    </TouchableOpacity>
                                    {Platform.OS === 'ios' && (
                                        <TouchableOpacity style={styles.socialButton}>
                                            <Typography variant="h3" style={styles.socialIcon}></Typography>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.COLORS.background,
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
        color: Theme.COLORS.text,
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
        color: Theme.COLORS.text,
        marginBottom: 12,
        lineHeight: 40,
    },
    subtitle: {
        fontSize: 16,
        color: Theme.COLORS.textSecondary,
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
        color: Theme.COLORS.primary, // Gold when typing, matches the design
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
        color: Theme.COLORS.primary,
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
        color: Theme.COLORS.primary,
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
        borderColor: Theme.COLORS.primary,
        borderWidth: 2,
    },
    otpBoxText: {
        color: Theme.COLORS.primary,
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
        color: Theme.COLORS.primary,
        fontWeight: '600',
    },
    resendCountdown: {
        color: Theme.COLORS.primary,
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
        borderColor: Theme.COLORS.primary,
        marginRight: 12,
        marginTop: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: Theme.COLORS.primary,
    },
    checkmark: {
        color: Theme.COLORS.background,
        fontSize: 14,
        fontWeight: '900',
    },
    termsText: {
        color: Theme.COLORS.textSecondary,
        fontSize: 13,
        lineHeight: 18,
    },
    linkText: {
        color: Theme.COLORS.primary,
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
        backgroundColor: Theme.COLORS.primary, // Solid gold when enabled
        borderColor: Theme.COLORS.primary,
        elevation: 4,
        shadowColor: Theme.COLORS.primary,
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
        color: Theme.COLORS.background, // Dark text on gold background
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
        color: Theme.COLORS.text,
        fontSize: 22,
        fontWeight: '500',
    },
    countrySearchContainer: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 12,
        backgroundColor: Theme.COLORS.background,
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
        color: Theme.COLORS.primary, // Gold search icon
        fontWeight: '400',
    },
    searchInput: {
        flex: 1,
        color: Theme.COLORS.text,
        fontSize: 17,
        height: '100%',
        padding: 0,
    },
    countryModalContainer: {
        flex: 1,
        backgroundColor: Theme.COLORS.background,
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
        color: Theme.COLORS.text,
        fontSize: 16,
        fontWeight: '400',
        width: 52,
    },
    countryName: {
        color: Theme.COLORS.text,
        fontSize: 16,
        fontWeight: '400',
        flex: 1,
    },
});

export default LoginScreen;
