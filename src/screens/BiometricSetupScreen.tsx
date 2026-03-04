import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Alert,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { BiometricService } from '../services/BiometricService';
import { StorageService } from '../services/StorageService';

const BiometricSetupScreen = ({ navigation }: any) => {
    const [loading, setLoading] = useState(false);

    const handleEnableBiometric = async () => {
        setLoading(true);
        try {
            const available = await BiometricService.isSensorAvailable();
            if (!available) {
                Alert.alert('Not Supported', 'Biometric authentication is not available on this device.');
                return;
            }
            // createKeys triggers the native Face ID / Touch ID prompt
            const publicKey = await BiometricService.createKeys();
            if (publicKey) {
                await StorageService.setItem('@biometric_enabled', 'true');
                navigation.replace('Home');
            } else {
                Alert.alert('Setup Failed', 'Biometric setup was cancelled or failed. Please try again.');
            }
        } catch (error: any) {
            Alert.alert('Error', error?.message || 'Failed to enable biometrics.');
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
                    <View style={styles.topRightIcons}>
                        <TouchableOpacity style={styles.supportIcon}>
                            <Text style={styles.supportEmoji}>🎧</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Title & subtitle */}
                <View style={styles.header}>
                    <Text style={styles.title}>Secure your Account</Text>
                    <Text style={styles.subtitle}>
                        Enable biometric authentication for quick and secure access to your account.
                    </Text>
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
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleEnableBiometric}
                    >
                        <Text style={styles.buttonText}>Enable Biometric</Text>
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
    inner: {
        flex: 1,
        paddingHorizontal: 24,
    },
    topRow: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 28,
    },
    topRightIcons: {
        flexDirection: 'row',
    },
    supportIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
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
        color: COLORS.white,
        fontSize: 30,
        fontWeight: '700',
        lineHeight: 38,
        marginBottom: 12,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.55)',
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
        borderColor: 'rgba(212, 186, 127, 0.4)',
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
        borderColor: COLORS.primary,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    phoneScreen: {
        width: 36,
        height: 28,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
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
        backgroundColor: COLORS.primary,
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
        borderColor: COLORS.primary,
        marginBottom: -2,
    },
    keyShaft: {
        width: 2.5,
        height: 30,
        backgroundColor: COLORS.primary,
    },
    keyTooth: {
        width: 8,
        height: 2.5,
        backgroundColor: COLORS.primary,
        alignSelf: 'flex-end',
        marginTop: -8,
    },
    flexFiller: {
        flex: 0.2,
    },
    bottomSection: {
        marginBottom: 24,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 50,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.background,
    },
});

export default BiometricSetupScreen;
