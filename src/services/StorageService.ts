import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    BIOMETRIC_ENABLED: '@biometric_enabled',
    USER_ID: '@user_id',
    PHONE_NUMBER: '@phone_number',
    AUTH_TOKEN: '@auth_token',
    REFRESH_TOKEN: '@refresh_token',
};

export const StorageService = {
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

    KEYS,
};
