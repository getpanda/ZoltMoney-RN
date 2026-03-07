import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { loginInit } from '../api/auth';
import Theme from '../theme/Theme';
import { Typography, Button, CountryPicker } from '../components/common';
import Config from 'react-native-config';
import { Country, COUNTRIES } from '../components/common/CountryPicker';
import IntercomIcon from '../assets/images/support_icon.svg';
import ChevronDown from '../assets/images/chevron_down.svg';
import ChevronBack from '../assets/images/chevron_back.svg';
import {
  PhoneNumberUtil,
  PhoneNumberFormat,
  AsYouTypeFormatter,
  PhoneNumberType,
} from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

const LoginScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const phoneNumberRef = useRef<TextInput>(null);

  const [isCountryPickerVisible, setIsCountryPickerVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find(c => c.code === 'IN') || COUNTRIES[0],
  );

  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  // Get dynamic placeholder and validation from libphonenumber
  const phoneValidation = React.useMemo(() => {
    try {
      const example = phoneUtil.getExampleNumberForType(
        selectedCountry.code,
        PhoneNumberType.MOBILE,
      );
      if (!example)
        return { placeholder: '123 456 789', isValid: false, e164Value: '' };

      const exampleFormatted = phoneUtil.format(
        example,
        PhoneNumberFormat.NATIONAL,
      );
      // Replace dashes with spaces as requested
      let cleanPlaceholder = exampleFormatted.replace(/-/g, ' ');

      // If the placeholder starts with "0" and is for a region where mobiles don't usually use it
      // (like India or UK in some contexts), or just generally strip the trunk prefix to avoid confusion
      // if the user is expected to type just the mobile digits.
      // However, the best way is to check the E164 and National difference.
      const exampleE164 = phoneUtil.format(example, PhoneNumberFormat.E164);
      const callingCode = selectedCountry.callingCode;
      const nominalNational = exampleE164.replace(`+${callingCode}`, '');

      // If the national format has a leading '0' that isn't in nominal E164, it's a trunk prefix
      if (
        cleanPlaceholder.startsWith('0') &&
        !nominalNational.startsWith('0')
      ) {
        cleanPlaceholder = cleanPlaceholder.substring(1).trim();
      }

      // Validation - Restrict to MOBILE numbers for security/fintech
      let valid = false;
      let e164 = '';
      try {
        const parsed = phoneUtil.parse(value, selectedCountry.code);
        const isOfficialValid = phoneUtil.isValidNumberForRegion(
          parsed,
          selectedCountry.code,
        );
        const numberType = phoneUtil.getNumberType(parsed);

        // Check if it's a mobile number (or potentially fixed_line_or_mobile in some regions)
        const isMobile =
          numberType === PhoneNumberType.MOBILE ||
          numberType === PhoneNumberType.FIXED_LINE_OR_MOBILE;

        valid = isOfficialValid && isMobile;
        if (valid) {
          e164 = phoneUtil.format(parsed, PhoneNumberFormat.E164);
        }
      } catch {
        valid = false;
      }

      // Strict maxLength: calculate it based on the formatted placeholder
      // We allow the exact length of the placeholder as the maximum
      const strictMax = cleanPlaceholder.length;

      return {
        placeholder: cleanPlaceholder,
        isValid: valid,
        e164Value: e164,
        maxLength: strictMax,
      };
    } catch {
      return { placeholder: '123 456 789', isValid: false, e164Value: '' };
    }
  }, [selectedCountry, value]);

  const { placeholder, isValid, e164Value, maxLength } = phoneValidation;

  const getApiErrorMessage = (error: any, fallback: string): string => {
    const data = error?.response?.data;
    if (!data) return fallback;
    return data.message || data.error || fallback;
  };

  const handleSendOtp = async () => {
    setLoading(true);
    // Use the sanitized E.164 value from libphonenumber
    const apiPhoneValue = e164Value;

    try {
      await loginInit(apiPhoneValue);
      navigation.navigate('OtpVerification', {
        formattedValue: apiPhoneValue,
        selectedCountry,
      });
    } catch (error: any) {
      Alert.alert(
        t('common.error'),
        getApiErrorMessage(error, t('auth.login.send_otp_error')),
      );
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
                <ChevronBack width={10} height={18} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.supportIcon}>
                <IntercomIcon width={34} height={34} />
              </TouchableOpacity>
            </View>

            <Typography
              variant="h1"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={styles.title}
            >
              {t('auth.login.title')}
            </Typography>
            <Typography variant="bodySecondary" style={styles.subtitle}>
              {t('auth.login.subtitle')}
            </Typography>
          </View>

          <View style={styles.form}>
            <View style={styles.phoneInputWrapper}>
              <View style={styles.customInputRow}>
                <TouchableOpacity
                  style={styles.codeContainer}
                  onPress={() => setIsCountryPickerVisible(true)}
                >
                  <Typography style={styles.phoneCodeText}>
                    {`+${selectedCountry.callingCode}`}
                  </Typography>
                  <ChevronDown
                    width={14}
                    height={14}
                    style={styles.dropdownArrow}
                  />
                </TouchableOpacity>

                <TextInput
                  ref={phoneNumberRef}
                  style={styles.customNumberInput}
                  placeholder={placeholder}
                  placeholderTextColor={Theme.COLORS.white20}
                  keyboardType="phone-pad"
                  maxLength={maxLength}
                  value={value}
                  selectionColor={Theme.COLORS.primary}
                  onChangeText={text => {
                    // Only numeric input allowed
                    const digits = text.replace(/[^0-9]/g, '');

                    // As-you-type formatting with spaces
                    const formatter = new AsYouTypeFormatter(
                      selectedCountry.code,
                    );
                    let result = '';
                    for (const char of digits) {
                      result = formatter.inputDigit(char);
                    }

                    // Ensure we use spaces, not dashes
                    const spaceFormatted = result.replace(/-/g, ' ');
                    setValue(spaceFormatted);
                  }}
                  autoFocus
                />
              </View>

              <CountryPicker
                visible={isCountryPickerVisible}
                onClose={() => setIsCountryPickerVisible(false)}
                selectedCountryCode={selectedCountry.code}
                onSelect={country => {
                  setSelectedCountry(country);
                  setTimeout(() => phoneNumberRef.current?.focus(), 300);
                }}
              />
            </View>

            <View style={styles.flexFiller} />

            <View style={styles.bottomSection}>
              <View style={styles.termsContainer}>
                <TouchableOpacity
                  style={styles.checkboxWrapper}
                  onPress={() => setIsTermsAccepted(!isTermsAccepted)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      isTermsAccepted && styles.checkboxChecked,
                    ]}
                  >
                    {isTermsAccepted && (
                      <Typography variant="caption" style={styles.checkmark}>
                        ✓
                      </Typography>
                    )}
                  </View>
                </TouchableOpacity>

                <View style={styles.termsTextWrapper}>
                  <Typography variant="caption" style={styles.termsText}>
                    {t('auth.login.terms_prefix')}{' '}
                    <Typography
                      variant="caption"
                      style={styles.linkText}
                      onPress={() =>
                        Linking.openURL(Config.TERMS_CONDITIONS_URL || '')
                      }
                    >
                      {t('auth.login.terms_link')}
                    </Typography>{' '}
                    {t('auth.login.terms_and')}{' '}
                    <Typography
                      variant="caption"
                      style={styles.linkText}
                      onPress={() =>
                        Linking.openURL(Config.PRIVACY_POLICY_URL || '')
                      }
                    >
                      {t('auth.login.terms_privacy_link')}
                    </Typography>
                    {t('auth.login.terms_dot')}
                  </Typography>
                </View>
              </View>

              <Button
                title={t('common.continue')}
                loading={loading}
                disabled={!isValid || !isTermsAccepted}
                onPress={handleSendOtp}
              />
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
    backgroundColor: Theme.COLORS.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 10,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButtonText: {
    color: Theme.COLORS.text,
    fontSize: 24,
    fontWeight: '300',
  },
  supportIcon: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportIconEmoji: {
    fontSize: 22,
  },
  title: {
    ...Theme.TYPOGRAPHY.screenTitle,
  },
  subtitle: {
    ...Theme.TYPOGRAPHY.screenSubtitle,
  },
  form: {
    flex: 1,
  },
  phoneInputWrapper: {
    marginTop: 0,
    marginBottom: 40,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  customNumberInput: {
    flex: 1,
    color: Theme.COLORS.primary,
    fontSize: 34,
    fontWeight: '300',
    height: 70,
    padding: 0,
  },
  phoneCodeText: {
    color: Theme.COLORS.primary,
    fontSize: 34,
    fontWeight: '300',
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  dropdownArrow: {
    marginLeft: 8,
    marginTop: 4,
  },
  flexFiller: {
    flex: 1,
  },
  bottomSection: {
    marginBottom: Theme.SPACING.lg,
  },
  termsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  checkboxWrapper: {
    paddingRight: 12,
  },
  termsTextWrapper: {
    flexShrink: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Theme.COLORS.primary,
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
    textAlign: 'left',
  },
  linkText: {
    color: Theme.COLORS.primary,
    fontWeight: '500',
  },
});

export default LoginScreen;
