import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const headers = config.headers as Record<string, string> | undefined;

    if (token) {
        if (!headers) {
            config.headers = { Authorization: `Bearer ${token}` } as any;
        } else {
            headers.Authorization = `Bearer ${token}`;
            config.headers = headers as any;
        }
    }

    return config;
});

api.interceptors.response.use(
    (response) => {
        // Unpack custom API response structure { success, data, message }
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
            response.data = response.data.data;
        }
        return response;
    },
    (error) => {
        if (error.response && error.response.data && typeof error.response.data === 'object') {
            // Forward standardized message to components expecting 'msg'
            error.response.data.msg = error.response.data.message || error.response.data.msg;
        }

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }

        return Promise.reject(error);
    }
);

export const authService = {
    login: (credentials: any) => api.post('/auth/login', credentials),
    register: (userData: any) => api.post('/auth/register', userData)
};

export const loanService = {
    apply: (loanData: any) => api.post('/loans/apply', loanData),
    getLoans: () => api.get('/loans'),
    getLoanById: (loanId: number) => api.get(`/loans/${loanId}`),
    deleteLoan: (loanId: number) => api.delete(`/loans/${loanId}`),
    checkEligibility: (loanData: any) => api.post('/loans/check-eligibility', loanData)
};

export const bankService = {
    getBalance: () => api.get('/transactions/balance'),
    getTransactions: () => api.get('/transactions')
};

export const aiService = {
    getInsights: () => api.get('/insights'),
    generateInsights: () => api.post('/insights/generate'),
    chat: (message: string) => api.post('/chat', { message })
};

export const savingsService = {
    createGoal: (goalData: any) => api.post('/goals', goalData),
    getGoals: () => api.get('/goals')
};

export const paymentService = {
    deposit: (amount: number, description?: string, phoneNumber?: string) => {
        const body: Record<string, any> = { amount, description };
        if (phoneNumber) {
            body.phoneNumber = phoneNumber;
            body.phone_number = phoneNumber;
            body.source_phone_number = phoneNumber;
        }
        return api.post('/payment/deposit', body);
    },
    withdraw: (amount: number, description?: string) => 
        api.post('/payment/withdraw', { amount, description }),
    payment: (amount: number, recipientAccountNumber: string, recipientName?: string, description?: string) => 
        api.post('/payment/payment', { amount, recipient_account_number: recipientAccountNumber, recipient_name: recipientName, description }),
    transfer: (amount: number, recipientAccountNumber: string, description?: string) => 
        api.post('/payment/transfer', { amount, recipient_account_number: recipientAccountNumber, description }),
    
    getBalance: () => api.get('/payment/balance'),
    getTransactionHistory: (filters?: { type?: string, status?: string, limit?: number, offset?: number }) => 
        api.get('/payment/history', { params: filters }),
    getTransactionStats: () => api.get('/payment/stats'),
    getRecentTransactions: (limit?: number) => 
        api.get('/payment/recent', { params: { limit } })
};

export const profileService = {
    getProfile: () => api.get('/profile'),
    completeProfile: (data: any) => api.post('/profile/complete', data),
    updateProfile: (data: any) => api.put('/profile', data),
    deleteProfile: () => api.delete('/profile'),
    updateIdentification: (data: any) => api.put('/profile/identification', data),
    getIdentification: () => api.get('/profile/identification')
};

export const accountService = {
    getAccount: () => api.get('/account'),
    getBalance: () => api.get('/account/balance'),
    deleteAccount: () => api.delete('/account')
};

export const kycService = {
    uploadDocument: (data: any) => api.post('/kyc/upload', data),
    getStatus: () => api.get('/kyc/status'),
    getDocuments: () => api.get('/kyc/documents'),
    deleteDocument: (documentId: number) => api.delete(`/kyc/documents/${documentId}`)
};

export const securityService = {
    setPin: (pin: string) => api.post('/security/set-pin', { transactionPin: pin }),
    verifyPin: (pin: string) => api.post('/security/verify-pin', { pin })
};

export const investmentService = {
    getInvestments: () => api.get('/investments'),
    createInvestment: (data: any) => api.post('/investments', data),
    updateInvestment: (id: number, data: any) => api.put(`/investments/${id}`, data),
    deleteInvestment: (id: number) => api.delete(`/investments/${id}`),
    getInvestmentById: (id: number) => api.get(`/investments/${id}`),
    getInvestmentTypes: () => api.get('/investments/types'),
    calculateReturns: (data: any) => api.post('/investments/calculate-returns', data)
};

export default api;
