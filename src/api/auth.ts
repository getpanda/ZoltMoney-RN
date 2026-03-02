import client from './client';
import { encodeStringToReversedHex } from '../utils/stringUtils';

/**
 * Initiates the login process by sending a phone number.
 * @param fullMobileNumber - The phone number with country code (e.g., +91XXXXXXXXXX)
 */
export const loginInit = async (fullMobileNumber: string) => {
    const payload = {
        mobile: encodeStringToReversedHex(fullMobileNumber),
    };
    const response = await client.post('/api/v1/auth/login/init', payload);
    return response.data;
};

/**
 * Verifies the OTP sent to the user.
 * @param fullMobileNumber - The phone number with country code
 * @param otp - The 6-digit OTP code
 */
export const loginVerify = async (fullMobileNumber: string, otp: string) => {
    const payload = {
        otp: encodeStringToReversedHex(otp),
        mobile: encodeStringToReversedHex(fullMobileNumber),
        fcm_token: 'placeholder_fcm_token_rn', // We'll integrate real FCM later
    };
    const response = await client.post('/api/v1/auth/login', payload);
    return response.data;
};
