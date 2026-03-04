import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateNonce } from '../utils/nonceService';

// Backend Service URLs
const POLARIS_BASE_URL = 'https://polaris-dev.getpanda.money/api/v1';
const CASTOR_BASE_URL = 'https://castor-dev.getpanda.money/api/v1';
const CARINA_BASE_URL = 'https://carina-dev.getpanda.money/api/v1';

const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-api-key-1': '36Kjh9MI4FANqEOw6xJBTec3uVe0dXnN',
    'x-api-key-2': 'DVgcmRtZMrOA3EccCDjeIpDsZrCXwJDQ',
};

// specialized clients
export const polarisClient = axios.create({ baseURL: POLARIS_BASE_URL, timeout: 15000, headers: DEFAULT_HEADERS });
export const castorClient = axios.create({ baseURL: CASTOR_BASE_URL, timeout: 15000, headers: DEFAULT_HEADERS });
export const carinaClient = axios.create({ baseURL: CARINA_BASE_URL, timeout: 10000, headers: DEFAULT_HEADERS });

/**
 * Shared interceptor to attach auth token and fresh x-nonce-id automatically.
 */
const setupInterceptors = (instance: AxiosInstance) => {
    instance.interceptors.request.use(
        async (config: InternalAxiosRequestConfig) => {
            try {
                const token = await AsyncStorage.getItem('@auth_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Generate a fresh nonce for every request
                const nonce = generateNonce();
                if (nonce) {
                    config.headers['x-nonce-id'] = nonce;
                }
            } catch (e) {
                // Keep silent in production
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            const config = error.config;
            if (error.response) {
                console.error(`[API Error] ${config?.method?.toUpperCase()} ${config?.url}:`, error.response.status, error.response.data);
            } else if (error.request) {
                console.error(`[Network Error] ${config?.method?.toUpperCase()} ${config?.url}:`, error.message);
            } else {
                console.error('[Request Error]:', error.message);
            }
            return Promise.reject(error);
        }
    );
};

// Initialize interceptors for all clients
setupInterceptors(polarisClient);
setupInterceptors(castorClient);
setupInterceptors(carinaClient);

// Default export for backward compatibility (defaults to Polaris)
export default polarisClient;
