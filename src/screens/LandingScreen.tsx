import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { COLORS } from '../theme/colors';

import { StorageService } from '../services/StorageService';

const LandingScreen = ({ navigation }: any) => {
    const handleLoginNavigation = async () => {
        const isBiometricEnabled = await StorageService.getItem(StorageService.KEYS.BIOMETRIC_ENABLED);
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
                        <Text style={styles.logoText}>Zolt</Text>
                        <Text style={[styles.logoText, { color: COLORS.primary }]}>Money</Text>
                    </View>

                    <Text style={styles.headline}>
                        The Future of{'\n'}Smart Finance
                    </Text>

                    <Text style={styles.description}>
                        Manage your wealth with precision and ease. Experience the power of
                        pure native performance.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleLoginNavigation}
                    >
                        <Text style={styles.buttonText}>Get Started</Text>
                    </TouchableOpacity>
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
        backgroundColor: 'rgba(2, 21, 17, 0.4)', // Subtle overlay to make text pop
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
        color: COLORS.white,
        letterSpacing: 1,
    },
    headline: {
        fontSize: 42,
        fontWeight: '700',
        color: COLORS.white,
        lineHeight: 50,
        marginBottom: 20,
    },
    description: {
        fontSize: 18,
        color: COLORS.textSecondary,
        lineHeight: 28,
        fontWeight: '400',
    },
    footer: {
        paddingHorizontal: 30,
        paddingBottom: 40,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        marginBottom: 20,
    },
    buttonText: {
        color: COLORS.background,
        fontSize: 18,
        fontWeight: '700',
    },
    secondaryButton: {
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    secondaryButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default LandingScreen;
