import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { loginInit, loginVerify } from '../api/auth';
import { StorageService } from '../services/StorageService';
import Theme from '../theme/Theme';
import Typography from '../components/common/Typography';
import Button from '../components/common/Button';
import SupportIcon from '../assets/images/support_icon.svg';

const OtpScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const { formattedValue, selectedCountry } = route.params as {
    formattedValue: string;
    selectedCountry: {
      name: string;
      code: string;
      callingCode: string;
      flag: string;
    };
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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
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
      const getApiErrorMessage = (err: any, fb: string): string => {
        const data = err?.response?.data;
        if (!data) return fb;
        return data.message || data.error || fb;
      };
      Alert.alert(
        t('common.error'),
        getApiErrorMessage(error, t('auth.otp.resend_error')),
      );
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
        await StorageService.setSecureItem(
          StorageService.KEYS.AUTH_TOKEN,
          token,
        );
      }
      await StorageService.setItem(
        StorageService.KEYS.PHONE_NUMBER,
        formattedValue,
      );

      const onboarding = data.onboarding;
      if (onboarding) {
        const walletType = onboarding.wallet_type || 'custodial';
        await StorageService.setItem('@wallet_type', walletType);
        await StorageService.setItem(
          StorageService.KEYS.ONBOARDING_STEP,
          onboarding.step || 'complete',
        );
        await StorageService.setItem(
          StorageService.KEYS.ONBOARDING_FLOW,
          onboarding.flow || 'login',
        );

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
      const getApiErrorMessage = (err: any, fb: string): string => {
        const data = err?.response?.data;
        if (!data) return fb;
        return data.message || data.error || fb;
      };
      Alert.alert(
        t('common.error'),
        getApiErrorMessage(error, t('auth.otp.verify_error')),
      );
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
                <Typography variant="h3" style={styles.backButtonText}>
                  ←
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity style={styles.supportIcon}>
                <SupportIcon width={34} height={34} />
              </TouchableOpacity>
            </View>

            <Typography variant="h1" style={styles.title}>
              {t('auth.otp.title')}
            </Typography>
            <Typography variant="bodySecondary" style={styles.subtitle}>
              {t('auth.otp.subtitle')}
            </Typography>
            <Typography variant="body" style={styles.phoneDisplay}>
              {formattedValue}
            </Typography>
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
              onChangeText={text => {
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
            <TouchableWithoutFeedback
              onPress={() => otpInputRef.current?.focus()}
            >
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

            {/* Resend row */}
            <View style={styles.resendRow}>
              {canResend ? (
                <TouchableOpacity onPress={handleResend} disabled={loading}>
                  <Typography style={styles.resendText}>
                    {t('auth.otp.resend_prefix')}
                    <Typography style={styles.resendLink}>
                      {t('auth.otp.resend_link')}
                    </Typography>
                  </Typography>
                </TouchableOpacity>
              ) : (
                <Typography style={styles.resendText}>
                  {t('auth.otp.resend_prefix')}
                  {t('auth.otp.resend_wait')}
                  <Typography style={styles.resendCountdown}>
                    {String(Math.floor(resendTimer / 60)).padStart(2, '0')}:
                    {String(resendTimer % 60).padStart(2, '0')}
                  </Typography>
                </Typography>
              )}
            </View>
          </View>

          <View style={styles.flexFiller} />

          {/* Continue Button */}
          <View style={styles.bottomSection}>
            <Button
              title={t('common.continue')}
              loading={loading}
              disabled={!isButtonEnabled}
              onPress={handleVerifyOtp}
            />
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
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButtonText: {
    color: Theme.COLORS.text,
    fontSize: 24,
  },
  supportIcon: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportEmoji: {
    fontSize: 22,
  },
  title: {
    color: Theme.COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    color: Theme.COLORS.textSecondary,
    fontSize: 15,
    marginBottom: 4,
  },
  phoneDisplay: {
    color: Theme.COLORS.primary,
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
    borderColor: Theme.COLORS.primary30,
    backgroundColor: Theme.COLORS.white05,
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
  },
  flexFiller: {
    flex: 1,
  },
  bottomSection: {
    marginBottom: Theme.SPACING.lg,
  },
});

export default OtpScreen;
