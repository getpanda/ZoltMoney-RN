import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

const KEYS = {
    BIOMETRIC_ENABLED: '@biometric_enabled',
    USER_ID: '@user_id',
    PHONE_NUMBER: '@phone_number',
    AUTH_TOKEN: '@auth_token',
    REFRESH_TOKEN: '@refresh_token',
    ONBOARDING_STEP: '@onboarding_step',
    ONBOARDING_FLOW: '@onboarding_flow',
    SESSION_BIOMETRIC_VERIFIED: '@session_biometric_verified',
};

export const StorageService = {
    /**
     * Stores a sensitive value in the Keychain.
     */
    async setSecureItem(key: string, value: string) {
        try {
            await Keychain.setGenericPassword(key, value, { service: key });
        } catch (e) {
            console.error(`Keychain set error for ${key}:`, e);
            // Fallback to AsyncStorage if Keychain fails (not ideal, but ensures app continues)
            await AsyncStorage.setItem(key, value);
        }
    },

    /**
     * Retrieves a sensitive value from the Keychain.
     */
    async getSecureItem(key: string): Promise<string | null> {
        try {
            const credentials = await Keychain.getGenericPassword({ service: key });
            if (credentials) {
                return credentials.password;
            }
            // Fallback check in AsyncStorage
            return await AsyncStorage.getItem(key);
        } catch (e) {
            console.error(`Keychain get error for ${key}:`, e);
            return await AsyncStorage.getItem(key);
        }
    },

    /**
     * Removes a sensitive value from the Keychain.
     */
    async removeSecureItem(key: string) {
        try {
            await Keychain.resetGenericPassword({ service: key });
            await AsyncStorage.removeItem(key);
        } catch (e) {
            console.error(`Keychain remove error for ${key}:`, e);
            await AsyncStorage.removeItem(key);
        }
    },

    async setItem(key: string, value: string) {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (e) {
            console.error('Storage Error:', e);
        }
    },

    async getItem(key: string): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(key);
        } catch (e) {
            console.error('Storage Error:', e);
            return null;
        }
    },

    async removeItem(key: string) {
        try {
            await AsyncStorage.removeItem(key);
        } catch (e) {
            console.error('Storage Error:', e);
        }
    },

    /**
     * Clears all sensitive and session data on logout.
     */
    async logout() {
        // Clear Keychain tokens
        await this.removeSecureItem(KEYS.AUTH_TOKEN);
        await this.removeSecureItem(KEYS.REFRESH_TOKEN);

        const keys = [
            KEYS.BIOMETRIC_ENABLED,
            KEYS.USER_ID,
            KEYS.PHONE_NUMBER,
            KEYS.ONBOARDING_STEP,
            KEYS.ONBOARDING_FLOW,
            KEYS.SESSION_BIOMETRIC_VERIFIED,
            '@wallet_type',
            '@credential_id',
        ];

        for (const key of keys) {
            try {
                await AsyncStorage.removeItem(key);
            } catch { }
        }
    },

    KEYS,
};
