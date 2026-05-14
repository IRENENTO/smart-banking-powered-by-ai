import axios from 'axios';

// Replace with your computer's IP address if testing on a physical device
// For Android emulator, you can use 10.0.2.2
const API_URL = 'http://10.0.2.2:5001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// We use a simple memory store or you can install AsyncStorage
let currentToken: string | null = null;

export const setAuthToken = (token: string | null) => {
    currentToken = token;
};

api.interceptors.request.use(
    (config) => {
        if (currentToken) {
            config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
            response.data = response.data.data;
        }
        return response;
    },
    (error) => {
        if (error.response && error.response.data && typeof error.response.data === 'object') {
            error.response.data.msg = error.response.data.message || error.response.data.msg;
        }
        return Promise.reject(error);
    }
);

export default api;
