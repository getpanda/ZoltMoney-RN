import React from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Theme from '../theme/Theme';
import { Typography, Button } from '../components/common';

import { StorageService } from '../services/StorageService';

const LandingScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const handleLoginNavigation = async () => {
    const isBiometricEnabled = await StorageService.getItem(
      StorageService.KEYS.BIOMETRIC_ENABLED,
    );
    if (isBiometricEnabled === 'true') {
      navigation.navigate('BiometricLogin');
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/landing_bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Typography style={styles.logoText}>
              {t('landing.title_part1')}
            </Typography>
            <Typography
              style={[styles.logoText, { color: Theme.COLORS.primary }]}
            >
              {t('landing.title_part2')}
            </Typography>
          </View>

          <Typography style={styles.headline}>
            {t('landing.headline')}
          </Typography>

          <Typography style={styles.description}>
            {t('landing.description')}
          </Typography>
        </View>

        <View style={styles.footer}>
          <Button
            title={t('landing.get_started')}
            onPress={handleLoginNavigation}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: Theme.COLORS.background40, // Subtle overlay to make text pop
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    paddingTop: 60,
  },
  logoContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.COLORS.text,
    letterSpacing: 1,
  },
  headline: {
    fontSize: 42,
    fontWeight: '700',
    color: Theme.COLORS.text,
    lineHeight: 50,
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    color: Theme.COLORS.textSecondary,
    lineHeight: 28,
    fontWeight: '400',
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  secondaryButton: {
    height: 60,
    borderRadius: Theme.BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.COLORS.white20,
  },
  secondaryButtonText: {
    color: Theme.COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LandingScreen;
