import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Theme from '../theme/Theme';
import { Typography, Button } from '../components/common';
import { emailOtpInit } from '../api/auth';
import SupportIcon from '../assets/images/support_icon.svg';
import ChevronBack from '../assets/images/chevron_back.svg';

const getApiErrorMessage = (error: any, fallback: string): string => {
  const data = error?.response?.data;
  if (!data) return fallback;
  return data.message || data.error || fallback;
};

const EmailVerifyScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
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
      Alert.alert(
        t('common.error'),
        getApiErrorMessage(
          error,
          t('auth.email_verify.send_error') ||
            'Failed to send OTP. Please try again.',
        ),
      );
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
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ChevronBack width={10} height={18} />
            </TouchableOpacity>
            <View style={styles.topRightIcons}>
              <TouchableOpacity style={styles.supportIcon}>
                <SupportIcon width={34} height={34} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Title */}
          <View style={styles.header}>
            <Typography style={styles.title}>
              {t('auth.email_verify.title')}
            </Typography>
            <Typography style={styles.subtitle}>
              {t('auth.email_verify.subtitle')}
            </Typography>
          </View>

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              ref={emailInputRef}
              style={styles.input}
              placeholder={t('auth.email_verify.placeholder')}
              placeholderTextColor={Theme.COLORS.white35}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              selectionColor={Theme.COLORS.primary}
            />
          </View>

          <View style={styles.flexFiller} />

          {/* Send OTP Button */}
          <View style={styles.bottomSection}>
            <Button
              title={t('auth.email_verify.send_button')}
              onPress={handleSendOtp}
              loading={loading}
              disabled={!isEmailValid || loading}
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
  topRow: {
    marginTop: 12,
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
  topRightIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  supportIcon: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Theme.COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: Theme.COLORS.primary,
    fontSize: 22,
    fontWeight: '400',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    color: Theme.COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: 12,
  },
  subtitle: {
    color: Theme.COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  inputWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.COLORS.white20,
    backgroundColor: Theme.COLORS.white05,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: {
    color: Theme.COLORS.text,
    fontSize: 16,
    height: 52,
  },
  flexFiller: {
    flex: 1,
  },
  bottomSection: {
    marginBottom: Theme.SPACING.lg,
  },
});

export default EmailVerifyScreen;
