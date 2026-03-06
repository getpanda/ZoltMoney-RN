import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Config from 'react-native-config';
import { StorageService } from '../services/StorageService';
import { generateNonce } from '../utils/nonceService';

// Backend Service URLs
const POLARIS_BASE_URL = Config.POLARIS_BASE_URL || '';
const CASTOR_BASE_URL = Config.CASTOR_BASE_URL || '';
const CARINA_BASE_URL = Config.CARINA_BASE_URL || '';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'x-api-key-1': Config.X_API_KEY_1 || '',
  'x-api-key-2': Config.X_API_KEY_2 || '',
};

// specialized clients
export const polarisClient = axios.create({
  baseURL: POLARIS_BASE_URL,
  timeout: 15000,
  headers: DEFAULT_HEADERS,
});
export const castorClient = axios.create({
  baseURL: CASTOR_BASE_URL,
  timeout: 15000,
  headers: DEFAULT_HEADERS,
});
export const carinaClient = axios.create({
  baseURL: CARINA_BASE_URL,
  timeout: 10000,
  headers: DEFAULT_HEADERS,
});

/**
 * Shared interceptor to attach auth token and fresh x-nonce-id automatically.
 */
const setupInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      try {
        const token = await StorageService.getSecureItem(
          StorageService.KEYS.AUTH_TOKEN,
        );
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Generate a fresh nonce for every request
        const nonce = generateNonce();
        if (nonce) {
          config.headers['x-nonce-id'] = nonce;
        }
      } catch {
        // Keep silent in production
      }
      return config;
    },
    error => Promise.reject(error),
  );

  instance.interceptors.response.use(
    response => response,
    async error => {
      const config = error.config;

      // Handle Unauthorized (401) - Automatically logout if session expired
      if (error.response && error.response.status === 401) {
        console.warn(
          '[API 401] Session expired or unauthorized. Logging out...',
        );
        await StorageService.logout();
        // Optionally: We could trigger a navigation event here if we had a navigation ref
        // For now, clearing storage will cause the next app boot to land on Login.
      }

      if (error.response) {
        console.error(
          `[API Error] ${config?.method?.toUpperCase()} ${config?.url}:`,
          error.response.status,
          error.response.data,
        );
      } else if (error.request) {
        console.error(
          `[Network Error] ${config?.method?.toUpperCase()} ${config?.url}:`,
          error.message,
        );
      } else {
        console.error('[Request Error]:', error.message);
      }
      return Promise.reject(error);
    },
  );
};

// Initialize interceptors for all clients
setupInterceptors(polarisClient);
setupInterceptors(castorClient);
setupInterceptors(carinaClient);

// Default export for backward compatibility (defaults to Polaris)
export default polarisClient;
