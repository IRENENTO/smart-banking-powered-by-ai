import axios from 'axios';

// Note: Use your machine's local IP for mobile debugging
const API_URL = 'http://10.0.2.2:5000/api'; 

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const authService = {
    login: (credentials: any) => api.post('/auth/login', credentials)
};

export const loanService = {
    apply: (loanData: any, token: string) => api.post('/loans', loanData, {
        headers: { 'x-auth-token': token }
    }),
    getLoans: (token: string) => api.get('/loans', {
        headers: { 'x-auth-token': token }
    })
};

export default api;
