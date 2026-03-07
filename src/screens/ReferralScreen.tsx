import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Theme from '../theme/Theme';
import { Typography, Button } from '../components/common';
import SupportIcon from '../assets/images/support_icon.svg';
import LogoutIcon from '../assets/images/logout_icon.svg';
import { StorageService } from '../services/StorageService';

const ReferralScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [referralCode, setReferralCode] = useState('');

  const handleContinue = () => {
    // Navigate to EmailVerify as requested
    navigation.navigate('EmailVerify');
  };

  const handleSkip = () => {
    navigation.navigate('EmailVerify');
  };

  const handleLogout = async () => {
    await StorageService.logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View style={styles.header}>
          <View style={styles.topRow}>
            <View style={styles.flexFiller} />
            <View style={styles.topRightIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('SupportChat')}
              >
                <SupportIcon width={34} height={34} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleLogout}
              >
                <LogoutIcon width={34} height={34} />
              </TouchableOpacity>
            </View>
          </View>

          <Typography style={styles.title}>
            {t('auth.referral.title')}
          </Typography>
          <Typography style={styles.subtitle}>
            {t('auth.referral.subtitle')}
          </Typography>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('auth.referral.placeholder')}
              placeholderTextColor={Theme.COLORS.textMuted}
              value={referralCode}
              onChangeText={setReferralCode}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.bottomSection}>
          <Button
            title={t('auth.referral.continue')}
            onPress={handleContinue}
          />
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Typography style={styles.skipText}>
              {t('auth.referral.skip')}
            </Typography>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  flexFiller: {
    flex: 1,
  },
  topRightIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...Theme.TYPOGRAPHY.screenTitle,
    marginBottom: 14,
  },
  subtitle: {
    ...Theme.TYPOGRAPHY.screenSubtitle,
  },
  form: {
    marginTop: 32,
    flex: 1,
  },
  inputContainer: {
    height: 56,
    borderWidth: 1.5,
    borderColor: Theme.COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: Theme.COLORS.white05,
  },
  input: {
    color: Theme.COLORS.text,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  bottomSection: {
    marginBottom: Theme.SPACING.lg,
    gap: 16,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    color: Theme.COLORS.textSecondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default ReferralScreen;
