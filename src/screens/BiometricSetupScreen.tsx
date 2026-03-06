import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Theme from '../theme/Theme';
import { Typography, Button } from '../components/common';
import { BiometricService } from '../services/BiometricService';
import { StorageService } from '../services/StorageService';

const BiometricSetupScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleEnableBiometric = async () => {
    setLoading(true);
    try {
      const available = await BiometricService.isSensorAvailable();
      if (!available) {
        Alert.alert(
          t('auth.biometric.not_supported_title'),
          t('auth.biometric.not_supported'),
        );
        return;
      }
      // createKeys triggers the native Face ID / Touch ID prompt
      const publicKey = await BiometricService.createKeys();
      if (publicKey) {
        await StorageService.setItem('@biometric_enabled', 'true');
        // Mark session as verified to prevent immediate re-auth prompt on Home landing
        await StorageService.setItem(
          StorageService.KEYS.SESSION_BIOMETRIC_VERIFIED,
          '1',
        );
        navigation.replace('Home');
      } else {
        Alert.alert(
          t('auth.biometric.setup_failed_title'),
          t('auth.biometric.setup_failed'),
        );
      }
    } catch (error: any) {
      Alert.alert(
        t('common.error'),
        error?.message ||
          t('auth.biometric.setup_error') ||
          'Failed to enable biometrics.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.inner}>
        {/* Top row - support icon */}
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Typography style={styles.backButtonText}>
              {t('common.back_arrow')}
            </Typography>
          </TouchableOpacity>
          <View style={styles.topRightIcons}>
            <TouchableOpacity style={styles.supportIcon}>
              <Typography style={styles.supportEmoji}>
                {t('common.support_emoji')}
              </Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* Title & subtitle */}
        <View style={styles.header}>
          <Typography style={styles.title}>
            {t('auth.biometric.setup_title')}
          </Typography>
          <Typography style={styles.subtitle}>
            {t('auth.biometric.setup_subtitle')}
          </Typography>
        </View>

        {/* Center illustration */}
        <View style={styles.illustrationWrapper}>
          <View style={styles.dashedCircle}>
            <View style={styles.iconGroup}>
              {/* Phone body */}
              <View style={styles.phoneSvg}>
                <View style={styles.phoneScreen}>
                  <View style={styles.dotRow}>
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                  </View>
                </View>
              </View>
              {/* Key */}
              <View style={styles.keySvg}>
                <View style={styles.keyHead} />
                <View style={styles.keyShaft} />
                <View style={styles.keyTooth} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.flexFiller} />

        {/* Enable Biometric button */}
        <View style={styles.bottomSection}>
          <Button
            title={t('auth.biometric.enable')}
            onPress={handleEnableBiometric}
            loading={loading}
          />
        </View>
      </View>
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
  backButton: {
    padding: 4,
  },
  backButtonText: {
    color: Theme.COLORS.text,
    fontSize: 26,
  },
  topRightIcons: {
    flexDirection: 'row',
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
    fontSize: 20,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    color: Theme.COLORS.text,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 38,
    marginBottom: 12,
  },
  subtitle: {
    color: Theme.COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  illustrationWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashedCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: Theme.COLORS.primary30,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  // Phone shape
  phoneSvg: {
    width: 52,
    height: 72,
    borderWidth: 2.5,
    borderColor: Theme.COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  phoneScreen: {
    width: 36,
    height: 28,
    borderWidth: 1.5,
    borderColor: Theme.COLORS.primary,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.COLORS.primary,
  },
  // Key shape
  keySvg: {
    marginBottom: 8,
    alignItems: 'center',
  },
  keyHead: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: Theme.COLORS.primary,
    marginBottom: -2,
  },
  keyShaft: {
    width: 2.5,
    height: 30,
    backgroundColor: Theme.COLORS.primary,
  },
  keyTooth: {
    width: 8,
    height: 2.5,
    backgroundColor: Theme.COLORS.primary,
    alignSelf: 'flex-end',
    marginTop: -8,
  },
  flexFiller: {
    flex: 0.2,
  },
  bottomSection: {
    marginBottom: 24,
  },
});

export default BiometricSetupScreen;
