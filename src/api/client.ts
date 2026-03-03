import axios from 'axios';

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

// Request interceptor for authentication
// We will later integrate SecureStore to persist tokens
client.interceptors.request.use(
    async (config) => {
        // Log the outgoing request for debugging
        console.log('--- API Request ---');
        console.log('Method:', config.method?.toUpperCase());
        console.log('URL:', config.url);
        console.log('Headers:', config.headers);
        console.log('Body:', config.data);
        console.log('-------------------');

        // const token = await SecureStore.getItemAsync('userToken');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
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
