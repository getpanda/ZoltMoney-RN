import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL from the PandaMoney 'refactor' configuration
const API_BASE_URL = 'https://polaris-dev.getpanda.money/api/v1';

const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key-1': '36Kjh9MI4FANqEOw6xJBTec3uVe0dXnN',
        'x-api-key-2': 'DVgcmRtZMrOA3EccCDjeIpDsZrCXwJDQ',
    },
});

// Request interceptor — attach stored auth token automatically
client.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('@auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (_) { }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('API Error:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Network Error:', error.message);
        } else {
            console.error('Request Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default client;
