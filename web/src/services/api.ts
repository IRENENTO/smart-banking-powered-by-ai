import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

if (process.env.NODE_ENV === 'development') {
    console.log('Connect to API at:', API_URL);
}

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
    adminLogin: (credentials: any) => api.post('/admin/auth/login', credentials),
    register: (userData: any) => api.post('/auth/register', userData),
    forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
    resetPassword: (email: string, otp: string, newPassword: string) => api.post('/auth/reset-password', { email, otp, newPassword })
};

export const otpService = {
    sendOTP: (email: string) => api.post('/otp/send-otp', { email }),
    verifyOTP: (email: string, otp: string) => api.post('/otp/verify-otp', { email, otp })
};

export const loanService = {
    apply: (loanData: any) => api.post('/loans/apply', loanData),
    getLoans: () => api.get('/loans'),
    getLoanById: (loanId: number) => api.get(`/loans/${loanId}`),
    deleteLoan: (loanId: number) => api.delete(`/loans/${loanId}`),
    checkEligibility: (loanData: any) => api.post('/loans/check-eligibility', loanData),
    requestExtension: (loanId: number, extraDays: number) => api.post(`/loans/${loanId}/extend`, { extraDays }),
    getLoanProgress: (loanId: number) => api.get(`/loans/${loanId}/progress`),
    getPaymentHistory: (loanId: number) => api.get(`/loans/${loanId}/payments`)
};

export const bankService = {
    getBalance: () => api.get('/transactions/balance'),
    getTransactions: () => api.get('/transactions')
};

export const aiService = {
    getInsights: () => api.get('/insights'),
    generateInsights: () => api.post('/insights/generate'),
    chat: (message: string) => api.post('/chat', { message }),

    // AI Engine endpoints
    predictLoan: (data: any) => api.post('/ai/predict-loan', data),
    detectFraud: (data: any) => api.post('/ai/detect-fraud', data),
    predictSavings: (data: any) => api.post('/ai/predict-savings', data),
    analyzeSpending: (transactions: any[], monthlyIncome?: number) =>
        api.post('/ai/spending-analysis', { transactions, monthly_income: monthlyIncome }),
    getRecommendations: (data: any) => api.post('/ai/recommendations', data),
    getModelStatus: () => api.get('/ai/model-status'),
    retrainModel: (model?: string) => api.post('/ai/retrain', { model }),
};

export const savingsService = {
    createGoal: (goalData: any) => api.post('/goals', goalData),
    getGoals: () => api.get('/goals'),
    updateGoal: (goalId: number, data: any) => api.put(`/goals/${goalId}`, data),
    deleteGoal: (goalId: number) => api.delete(`/goals/${goalId}`)
};

export const scheduleService = {
    getSchedules: () => api.get('/schedules'),
    createSchedule: (data: any) => api.post('/schedules', data),
    updateSchedule: (scheduleId: number, data: any) => api.put(`/schedules/${scheduleId}`, data),
    pauseSchedule: (scheduleId: number, action: 'pause' | 'resume') => api.patch(`/schedules/${scheduleId}/status`, { action }),
    deleteSchedule: (scheduleId: number) => api.delete(`/schedules/${scheduleId}`)
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

export const uploadService = {
    uploadProfilePicture: (file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/upload/profile-picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};

export const accountService = {
    getAccount: () => api.get('/account'),
    getBalance: () => api.get('/account/balance'),
    deleteAccount: () => api.delete('/account')
};

export const securityService = {
    setPin: (pin: string) => api.post('/security/set-pin', { transactionPin: pin }),
    verifyPin: (pin: string) => api.post('/security/verify-pin', { pin })
};

export const marketService = {
    predictMarket: (data: any) => api.post('/market/predict', data),
    getTrends: () => api.get('/market/trends'),
    getSectors: () => api.get('/market/sectors'),
    getRecommendations: () => api.get('/market/recommendations'),
    getRiskAnalysis: () => api.get('/market/risk-analysis'),
    getFraudAlerts: () => api.get('/market/fraud-alerts'),
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
