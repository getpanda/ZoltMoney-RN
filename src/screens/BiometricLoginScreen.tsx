import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    StatusBar,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { BiometricService } from '../services/BiometricService';
import { StorageService } from '../services/StorageService';
import { useNavigation } from '@react-navigation/native';
import { markAuthenticated, loginInitBiometric, loginVerifyBiometric } from '../api/auth';

const BiometricLoginScreen = () => {
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
            const walletType = await StorageService.getItem('@wallet_type') || 'custodial';

            if (walletType === 'custodial') {
                // Custodial users: re-authenticate via device biometric (no DFNS passkey)
                const signature = await BiometricService.signPayload('biometric_login_reauth');

                if (signature === 'cancel') {
                    setLoading(false);
                    return;
                }

                if (signature) {
                    console.log('Custodial Biometric Re-auth Success');
                    // In panda-web this sets local flags/cookies via markAuthenticated
                    await markAuthenticated();
                    navigation.replace('Home');
                } else {
                    Alert.alert('Authentication Failed', 'Please try again.');
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
                            credential_id: await StorageService.getItem('@credential_id') || '',
                            signature: signature,
                        }
                    });

                    if (loginRes.access_token) {
                        await StorageService.setItem(StorageService.KEYS.AUTH_TOKEN, loginRes.access_token);
                        console.log('Passkey Login Success');
                        navigation.replace('Home');
                    } else {
                        throw new Error('Login failed');
                    }
                } catch (err: any) {
                    console.error('Passkey Login Error:', err);
                    Alert.alert('Login Failed', err.message || 'Please use phone number instead.');
                }
            }
        } catch (error) {
            console.error('Biometric Login Error:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Verify Your Identity</Text>
                    <Text style={styles.subtitle}>
                        Use {biometryType} or screen lock to authenticate and access your account.
                    </Text>
                </View>

                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        {/* Placeholder for FaceID/TouchID icon */}
                        <Text style={styles.iconText}>
                            {biometryType === 'Face ID' ? '👤' : '✋'}
                        </Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.primaryButton, loading && styles.buttonDisabled]}
                        onPress={handleAuthenticate}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.background} />
                        ) : (
                            <Text style={styles.buttonText}>Verify with {biometryType}</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => navigation.navigate('Login')}
                        disabled={loading}
                    >
                        <Text style={styles.secondaryButtonText}>Use Phone Number instead</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
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
        color: COLORS.white,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
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
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(212, 186, 127, 0.05)',
    },
    iconText: {
        fontSize: 64,
    },
    footer: {
        width: '100%',
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
        marginBottom: 20,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: COLORS.background,
        fontSize: 18,
        fontWeight: '700',
    },
    secondaryButton: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default BiometricLoginScreen;
