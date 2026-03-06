import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { loginInit } from '../api/auth';
import Theme from '../theme/Theme';
import { Typography, Button, CountryPicker } from '../components/common';
import { Country, COUNTRIES } from '../components/common/CountryPicker';
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
      const example = phoneUtil.getExampleNumber(selectedCountry.code);
      if (!example)
        return { placeholder: '123 456 789', isValid: false, e164Value: '' };

      const exampleFormatted = phoneUtil.format(
        example,
        PhoneNumberFormat.NATIONAL,
      );
      // Replace dashes with spaces as requested
      const cleanPlaceholder = exampleFormatted.replace(/-/g, ' ');

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

      return { placeholder: cleanPlaceholder, isValid: valid, e164Value: e164 };
    } catch {
      return { placeholder: '123 456 789', isValid: false, e164Value: '' };
    }
  }, [selectedCountry, value]);

  const { placeholder, isValid, e164Value } = phoneValidation;

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
                <Typography variant="h3" style={styles.backButtonText}>
                  {t('common.back_arrow')}
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity style={styles.supportIcon}>
                <Typography style={styles.supportIconEmoji}>
                  {t('common.support_emoji')}
                </Typography>
              </TouchableOpacity>
            </View>

            <Typography variant="h1" style={styles.title}>
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
                  <Typography style={styles.dropdownArrow}>
                    {t('common.dropdown_arrow')}
                  </Typography>
                </TouchableOpacity>

                <TextInput
                  ref={phoneNumberRef}
                  style={styles.customNumberInput}
                  placeholder={placeholder}
                  placeholderTextColor={Theme.COLORS.white20}
                  keyboardType="phone-pad"
                  maxLength={placeholder.length + 2} // Allow for extra spaces/digits just in case
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
              <TouchableOpacity
                style={styles.termsRow}
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
                <Typography variant="caption" style={styles.termsText}>
                  {t('auth.login.terms_prefix')}
                  <Typography variant="caption" style={styles.linkText}>
                    {t('auth.login.terms_link')}
                  </Typography>
                  {t('auth.login.terms_and')}
                  <Typography variant="caption" style={styles.linkText}>
                    {t('auth.login.terms_privacy_link')}
                  </Typography>
                  {t('auth.login.terms_dot')}
                </Typography>
              </TouchableOpacity>

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
  supportIconEmoji: {
    fontSize: 24,
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
    marginTop: 0,
    marginBottom: 60,
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
    color: Theme.COLORS.primary,
    fontSize: 28,
    marginLeft: 8,
    fontWeight: '300',
    lineHeight: 25,
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
});

export default LoginScreen;
