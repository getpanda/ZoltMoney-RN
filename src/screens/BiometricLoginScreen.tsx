import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Theme from '../theme/Theme';
import { Typography, Button } from '../components/common';
import { BiometricService } from '../services/BiometricService';
import { StorageService } from '../services/StorageService';
import { useNavigation } from '@react-navigation/native';
import {
  markAuthenticated,
  loginInitBiometric,
  loginVerifyBiometric,
} from '../api/auth';

const BiometricLoginScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [biometryType, setBiometryType] = useState<string | null>('Face ID');

  useEffect(() => {
    const checkBiometrics = async () => {
      const type = await BiometricService.getBiometryType();
      setBiometryType(type || 'Biometrics');
    };
    checkBiometrics();
  }, []);

  const handleAuthenticate = async () => {
    setLoading(true);
    try {
      // Check if user is custodial or self-custody (passkey)
      const walletType =
        (await StorageService.getItem('@wallet_type')) || 'custodial';

      if (walletType === 'custodial') {
        // Custodial users: re-authenticate via device biometric (no DFNS passkey)
        const signature = await BiometricService.signPayload(
          'biometric_login_reauth',
        );

        if (signature === 'cancel') {
          setLoading(false);
          return;
        }

        if (signature) {
          console.log('Custodial Biometric Re-auth Success');
          await markAuthenticated();
          navigation.replace('Home');
        } else {
          Alert.alert(
            t('auth.biometric.auth_failed'),
            t('auth.biometric.auth_failed_msg'),
          );
        }
      } else {
        // Self-custody users: DFNS Passkey login (challenge-response)
        try {
          // 1. Init login (get challenge)
          const initRes = await loginInitBiometric();
          const { challenge, identifier, uci_id } = initRes;

          if (!challenge || !uci_id) {
            throw new Error('Failed to initialize biometric login');
          }

          // 2. Sign the challenge with the biometric key
          const signature = await BiometricService.signPayload(challenge);

          if (signature === 'cancel') {
            setLoading(false);
            return;
          }

          if (!signature) {
            throw new Error('Failed to sign biometric challenge');
          }

          // 3. Verify the signature with the backend
          const loginRes = await loginVerifyBiometric({
            identifier,
            credential_info: {
              credential_kind: 'Fido2',
              credential_id:
                (await StorageService.getItem('@credential_id')) || '',
              signature: signature,
            },
          });

          if (loginRes.access_token) {
            await StorageService.setSecureItem(
              StorageService.KEYS.AUTH_TOKEN,
              loginRes.access_token,
            );
            // Mark session as verified
            await StorageService.setItem(
              StorageService.KEYS.SESSION_BIOMETRIC_VERIFIED,
              '1',
            );
            console.log('Passkey Login Success');
            navigation.replace('Home');
          } else {
            throw new Error('Login failed');
          }
        } catch (err: any) {
          console.error('Passkey Login Error:', err);
          Alert.alert(
            t('auth.biometric.login_failed_title'),
            err.message || t('auth.biometric.use_phone'),
          );
        }
      }
    } catch (error) {
      console.error('Biometric Login Error:', error);
      Alert.alert(
        t('common.error'),
        t('common.error_description') || 'An unexpected error occurred.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Typography style={styles.title}>
            {t('auth.biometric.login_title')}
          </Typography>
          <Typography style={styles.subtitle}>
            {t('auth.biometric.login_subtitle', { type: biometryType })}
          </Typography>
        </View>

        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            {/* Placeholder for FaceID/TouchID icon */}
            <Typography style={styles.iconText}>
              {biometryType === 'Face ID'
                ? t('auth.biometric.face_id_emoji')
                : t('auth.biometric.touch_id_emoji')}
            </Typography>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title={t('auth.biometric.login_button', { type: biometryType })}
            onPress={handleAuthenticate}
            loading={loading}
          />

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Typography style={styles.secondaryButtonText}>
              {t('auth.biometric.use_phone')}
            </Typography>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  header: {
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Theme.COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Theme.COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: Theme.COLORS.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.COLORS.primary10,
  },
  iconText: {
    fontSize: 64,
  },
  footer: {
    width: '100%',
  },
  secondaryButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: Theme.COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BiometricLoginScreen;
