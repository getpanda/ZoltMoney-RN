import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../theme/colors';
import { StorageService } from '../services/StorageService';
import { BiometricService } from '../services/BiometricService';

const HomeScreen = ({ navigation }: any) => {
    const [isBiometricEnabled, setIsBiometricEnabled] = React.useState(false);

    React.useEffect(() => {
        const loadSettings = async () => {
            const enabled = await StorageService.getItem(StorageService.KEYS.BIOMETRIC_ENABLED);
            setIsBiometricEnabled(enabled === 'true');
        };
        loadSettings();
    }, []);

    const toggleBiometric = async () => {
        const newValue = !isBiometricEnabled;
        if (newValue) {
            // If enabling, ensure keys exist
            const available = await BiometricService.isSensorAvailable();
            if (!available) {
                Alert.alert('Not Available', 'Biometrics not available on this device.');
                return;
            }
            await BiometricService.createKeys();
        }

        await StorageService.setItem(StorageService.KEYS.BIOMETRIC_ENABLED, String(newValue));
        setIsBiometricEnabled(newValue);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Zolt Dashboard</Text>
                <Text style={styles.subtitle}>Pure Native Experience</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Security Settings</Text>
                <View style={styles.settingRow}>
                    <Text style={styles.settingText}>Biometric Login</Text>
                    <TouchableOpacity
                        style={[styles.toggle, isBiometricEnabled && styles.toggleOn]}
                        onPress={toggleBiometric}
                    >
                        <View style={[styles.toggleThumb, isBiometricEnabled && styles.toggleThumbOn]} />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Details')}
            >
                <Text style={styles.buttonText}>View Portfolio Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.chatCard}
                onPress={() => navigation.navigate('SupportChat')}
            >
                <View style={styles.chatIconContainer}>
                    <Text style={styles.chatIcon}>💬</Text>
                </View>
                <View>
                    <Text style={styles.chatCardTitle}>Support Chat</Text>
                    <Text style={styles.chatCardSubtitle}>Need help? We're online.</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => navigation.replace('Landing')}
            >
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: 25,
        paddingTop: 60,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: '600',
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardTitle: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 20,
        textTransform: 'uppercase',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '600',
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 2,
    },
    toggleOn: {
        backgroundColor: COLORS.primary,
    },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.white,
    },
    toggleThumbOn: {
        transform: [{ translateX: 22 }],
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        height: 55,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: '700',
    },
    chatCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chatIconContainer: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: 'rgba(212, 186, 127, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    chatIcon: {
        fontSize: 20,
    },
    chatCardTitle: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    chatCardSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginTop: 2,
    },
    logoutButton: {
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutText: {
        color: COLORS.error,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default HomeScreen;
