import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { Alert, Platform } from 'react-native';
import { StorageService } from './StorageService';

const rnBiometrics = new ReactNativeBiometrics();

export const BiometricService = {
    async isSensorAvailable(): Promise<boolean> {
        try {
            const { available, biometryType } = await rnBiometrics.isSensorAvailable();
            return available && !!biometryType;
        } catch (error) {
            console.error('Biometric availability error:', error);
            return false;
        }
    },

    async getBiometryType(): Promise<string | null> {
        try {
            const { biometryType } = await rnBiometrics.isSensorAvailable();
            if (biometryType === BiometryTypes.FaceID) return 'Face ID';
            if (biometryType === BiometryTypes.TouchID) return 'Touch ID';
            if (biometryType === BiometryTypes.Biometrics) return 'Biometrics';
            return null;
        } catch (error) {
            return null;
        }
    },

    /**
     * Creates a new public/private key pair in the Secure Enclave.
     * The private key is biometric-protected.
     */
    async createKeys(): Promise<string | null> {
        try {
            const { publicKey } = await rnBiometrics.createKeys();
            return publicKey;
        } catch (error: any) {
            console.error('Key creation failed:', error);
            return null;
        }
    },

    /**
     * Signs a message using the private key in Secure Enclave.
     * Triggers biometric prompt.
     */
    async signPayload(payload: string): Promise<string | null> {
        try {
            const { success, signature } = await rnBiometrics.createSignature({
                promptMessage: 'Verify to authenticate',
                payload: payload,
            });

            if (success) {
                return signature || null;
            }
            return null;
        } catch (error: any) {
            if (error.message?.includes('User cancellation') || error.message?.includes('cancel')) {
                return 'cancel';
            }
            console.error('Signing failed:', error);
            return null;
        }
    },

    async deleteKeys(): Promise<boolean> {
        try {
            const { keysDeleted } = await rnBiometrics.deleteKeys();
            return keysDeleted;
        } catch (error) {
            return false;
        }
    }
};
