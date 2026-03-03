import client from './client';
import { encodeStringToReversedHex } from '../utils/stringUtils';

/**
 * Initiates the login process by sending a phone number (OTP).
 * @param fullMobileNumber - The phone number with country code (e.g., +91XXXXXXXXXX)
 */
export const loginInit = async (fullMobileNumber: string) => {
    const payload = {
        mobile_number: encodeStringToReversedHex(fullMobileNumber),
    };
    const response = await client.post('user/send-otp', payload);
    return response.data;
};

/**
 * Verifies the OTP sent to the user.
 * @param fullMobileNumber - The phone number with country code
 * @param otp - The 6-digit OTP code
 */
export const loginVerify = async (fullMobileNumber: string, otp: string) => {
    const payload = {
        passcode: encodeStringToReversedHex(otp),
        mobile_number: encodeStringToReversedHex(fullMobileNumber),
        fcm_token: 'placeholder_fcm_token_rn',
        country: { iso2: 'IN' }, // Default country for now
    };
    const response = await client.post('user/verify-otp', payload);
    return response.data;
};

/**
 * For custodial users: marks the current session as authenticated via biometrics.
 * This is called after local device biometric verification.
 */
export const markAuthenticated = async () => {
    // In panda-web this sets cookies, but here we might need to notify the backend
    // and potentially store it in our state.
    // Based on panda-web app/api/auth/mark-authenticated/route.ts
    // It doesn't actually call a backend service, it just sets local auth flags.
    return { success: true };
};

/**
 * DFNS/Passkey: Initiates biometric login (challenge)
 */
export const loginInitBiometric = async () => {
    // Equivalent to /api/dfns/auth/login/init
    const response = await client.post('dfns/auth/login/init', {});
    return response.data;
};

/**
 * DFNS/Passkey: Verifies biometric login (signature)
 */
export const loginVerifyBiometric = async (payload: any) => {
    // Equivalent to /api/dfns/auth/login
    // Payload contains credential_info, user_id, identifier
    const response = await client.post('dfns/auth/login', payload);
    return response.data;
};
