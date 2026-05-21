import api from './api';

export interface LoanPredictionRequest {
    income?: number;
    expenses?: number;
    savings?: number;
    loan_amount: number;
    credit_score?: number;
    employment_status?: string;
    transaction_history?: any[];
}

export interface FraudDetectionRequest {
    amount: number;
    location?: string;
    device?: string;
    frequency?: number;
    transaction_time?: string;
}

export interface SavingsPredictionRequest {
    income?: number;
    expenses?: number;
    savings?: number;
    age?: number;
    dependents?: number;
    employment_type?: string;
}

export interface RecommendationRequest {
    income?: number;
    expenses?: number;
    savings?: number;
    age?: number;
    risk_tolerance?: string;
    goals?: string[];
    dependents?: number;
    employment_type?: string;
}

export const predictLoan = async (data: LoanPredictionRequest) => {
    const response = await api.post('/ai/predict-loan', data);
    return response.data;
};

export const detectFraud = async (data: FraudDetectionRequest) => {
    const response = await api.post('/ai/detect-fraud', data);
    return response.data;
};

export const predictSavings = async (data: SavingsPredictionRequest) => {
    const response = await api.post('/ai/predict-savings', data);
    return response.data;
};

export const analyzeSpending = async (transactions: any[], monthlyIncome?: number) => {
    const response = await api.post('/ai/spending-analysis', { transactions, monthly_income: monthlyIncome });
    return response.data;
};

export const getRecommendations = async (data: RecommendationRequest) => {
    const response = await api.post('/ai/recommendations', data);
    return response.data;
};

export const getModelStatus = async () => {
    const response = await api.get('/ai/model-status');
    return response.data;
};

export const retrainModel = async (model?: string) => {
    const response = await api.post('/ai/retrain', { model });
    return response.data;
};

export const getMarketPredictions = async () => {
    const response = await api.get('/admin/ai/analytics');
    return response.data;
};

export const getSectorAnalytics = async () => {
    const response = await api.get('/admin/ai/risk-analysis');
    return response.data;
};
