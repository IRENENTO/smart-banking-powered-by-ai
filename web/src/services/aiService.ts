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

export interface LoanPredictionResponse {
    success: boolean;
    risk_score: number;
    approval_status: 'APPROVED' | 'REJECTED' | 'REVIEW';
    default_probability: number;
    approval_probability: number;
    explanation: string;
    ai_powered: boolean;
}

export interface FraudDetectionRequest {
    amount: number;
    location?: string;
    device?: string;
    frequency?: number;
    transaction_time?: string;
}

export interface FraudDetectionResponse {
    success: boolean;
    fraud_risk: 'LOW' | 'MEDIUM' | 'HIGH';
    risk_percentage: number;
    is_anomaly: boolean;
    is_fraudulent?: boolean;
    risk_level?: string;
    reason?: string;
    location?: string;
    action_required: boolean;
    risk_flags: string[];
    ai_powered: boolean;
}

export interface SavingsPredictionRequest {
    income?: number;
    expenses?: number;
    savings?: number;
    age?: number;
    dependents?: number;
    employment_type?: string;
}

export interface SavingsPredictionResponse {
    success: boolean;
    financial_health_score: number;
    financial_health_rating: string;
    recommended_monthly_saving: number;
    disposable_income: number;
    savings_rate_pct: number;
    recommendations: string[];
    ai_powered: boolean;
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

export interface RecommendationResponse {
    success: boolean;
    financial_health_summary: { score: number; rating: string };
    savings_recommendations: string[];
    investment_recommendations: string[];
    budgeting_advice: string[];
    sector_recommendations: Array<{ sector_name: string; expected_return: string; risk_level: string }>;
    priority_actions: string[];
    total_predictions?: number;
    ai_powered: boolean;
}

export interface SpendingAnalysisResponse {
    success: boolean;
    category_breakdown: Array<{ name: string; value: number }>;
    total_spent: number;
    total_income: number;
    savings_rate: number;
    top_spending_category: string;
    spending_insights: string[];
    recommendations: string[];
    insight?: string;
    summary?: string;
    ai_powered: boolean;
}

// Helper function for fallback responses
const getFallbackLoanResponse = (data: LoanPredictionRequest): LoanPredictionResponse => {
    const income = data.income || 0;
    const loanAmount = data.loan_amount || 0;
    let riskScore = 50;
    
    if (income > 0) {
        const debtToIncome = loanAmount / income;
        if (debtToIncome > 2) riskScore += 20;
        else if (debtToIncome > 1) riskScore += 10;
        else riskScore -= 10;
    }
    
    riskScore = Math.max(0, Math.min(100, riskScore));
    
    return {
        success: false,
        risk_score: riskScore,
        approval_status: riskScore < 60 ? 'APPROVED' : riskScore < 75 ? 'REVIEW' : 'REJECTED',
        default_probability: riskScore / 100,
        approval_probability: (100 - riskScore) / 100,
        explanation: riskScore < 60 ? 'Based on your financial profile, you have good approval chances.' : 'High risk detected. Consider reducing loan amount.',
        ai_powered: false
    };
};

const getFallbackFraudResponse = (data: FraudDetectionRequest): FraudDetectionResponse => {
    const amount = data.amount || 0;
    let riskPct = 10;
    if (amount > 500000) riskPct += 20;
    if (data.frequency && data.frequency > 10) riskPct += 15;
    const hour = new Date().getHours();
    if (hour < 4 || hour > 23) riskPct += 10;
    riskPct = Math.min(100, riskPct);
    
    return {
        success: false,
        fraud_risk: riskPct < 25 ? 'LOW' : riskPct < 55 ? 'MEDIUM' : 'HIGH',
        risk_percentage: riskPct,
        is_anomaly: riskPct > 50,
        action_required: riskPct > 70,
        risk_flags: riskPct > 50 ? ['unusual_amount'] : [],
        ai_powered: false
    };
};

const getFallbackSavingsResponse = (data: SavingsPredictionRequest): SavingsPredictionResponse => {
    const income = data.income || 0;
    const expenses = data.expenses || 0;
    const disposable = Math.max(0, income - expenses);
    
    return {
        success: false,
        financial_health_score: 60,
        financial_health_rating: 'Fair',
        recommended_monthly_saving: Math.round(disposable * 0.2),
        disposable_income: disposable,
        savings_rate_pct: income > 0 ? Math.round((disposable / income) * 100) : 0,
        recommendations: ['Save at least 20% of your income monthly.'],
        ai_powered: false
    };
};

const getFallbackRecommendationsResponse = (data: RecommendationRequest): RecommendationResponse => {
    const income = data.income || 0;
    const expenses = data.expenses || 0;
    
    return {
        success: false,
        financial_health_summary: { score: 60, rating: 'Fair' },
        savings_recommendations: [`Save at least 20% (${Math.round(income * 0.2)} RWF) monthly.`],
        investment_recommendations: ['Consider low-risk options like savings accounts.'],
        budgeting_advice: ['Track expenses to identify savings opportunities.'],
        sector_recommendations: [],
        priority_actions: ['Build an emergency fund for 3-6 months of expenses.'],
        ai_powered: false
    };
};

const getFallbackSpendingResponse = (transactions: any[], monthlyIncome?: number): SpendingAnalysisResponse => {
    const expenses = (transactions || []).filter(t => t.type === 'expense' || !t.type);
    const totalSpent = expenses.reduce((s, t) => s + Number(t.amount || 0), 0);
    const income = monthlyIncome || 0;
    
    return {
        success: false,
        category_breakdown: [],
        total_spent: totalSpent,
        total_income: income,
        savings_rate: income > 0 ? Math.max(0, Math.round((1 - totalSpent / income) * 100)) : 0,
        top_spending_category: 'N/A',
        spending_insights: ['Connect to AI Engine for detailed analysis.'],
        recommendations: ['Enable AI Engine for personalized spending insights.'],
        ai_powered: false
    };
};

// AI Service Functions with fallbacks
export const predictLoan = async (data: LoanPredictionRequest): Promise<LoanPredictionResponse> => {
    try {
        const response = await api.post('/ai/predict-loan', data);
        return response.data;
    } catch (error) {
        console.error('Loan prediction failed, using fallback:', error);
        return getFallbackLoanResponse(data);
    }
};

export const detectFraud = async (data: FraudDetectionRequest): Promise<FraudDetectionResponse> => {
    try {
        const response = await api.post('/ai/detect-fraud', data);
        return response.data;
    } catch (error) {
        console.error('Fraud detection failed, using fallback:', error);
        return getFallbackFraudResponse(data);
    }
};

export const predictSavings = async (data: SavingsPredictionRequest): Promise<SavingsPredictionResponse> => {
    try {
        const response = await api.post('/ai/predict-savings', data);
        return response.data;
    } catch (error) {
        console.error('Savings prediction failed, using fallback:', error);
        return getFallbackSavingsResponse(data);
    }
};

export const analyzeSpending = async (transactions: any[], monthlyIncome?: number): Promise<SpendingAnalysisResponse> => {
    try {
        const response = await api.post('/ai/spending-analysis', { transactions, monthly_income: monthlyIncome });
        return response.data;
    } catch (error) {
        console.error('Spending analysis failed, using fallback:', error);
        return getFallbackSpendingResponse(transactions, monthlyIncome);
    }
};

export const getRecommendations = async (data: RecommendationRequest): Promise<RecommendationResponse> => {
    try {
        const response = await api.post('/ai/recommendations', data);
        return response.data;
    } catch (error) {
        console.error('Failed to get recommendations, using fallback:', error);
        return getFallbackRecommendationsResponse(data);
    }
};

export const getModelStatus = async () => {
    try {
        const response = await api.get('/ai/model-status');
        return response.data;
    } catch (error) {
        console.error('Failed to get model status:', error);
        return { 
            success: false, 
            status: 'offline', 
            ai_powered: false,
            models: []
        };
    }
};

export const retrainModel = async (model?: string) => {
    try {
        const response = await api.post('/ai/retrain', { model });
        return response.data;
    } catch (error) {
        console.error('Failed to retrain model:', error);
        return { 
            success: false, 
            message: 'AI Engine unavailable. Cannot retrain models.',
            status: 'failed',
            ai_powered: false
        };
    }
};

export const getMarketPredictions = async () => {
    try {
        const response = await api.get('/admin/ai/analytics');
        return response.data;
    } catch (error) {
        console.error('Failed to get market predictions:', error);
        return { 
            success: false, 
            predictions: [],
            ai_powered: false
        };
    }
};

export const getSectorAnalytics = async () => {
    try {
        const response = await api.get('/admin/ai/risk-analysis');
        return response.data;
    } catch (error) {
        console.error('Failed to get sector analytics:', error);
        return { 
            success: false, 
            sectors: [],
            ai_powered: false
        };
    }
};

// Test AI Engine connection
export const testAIConnection = async () => {
    try {
        const response = await api.get('/test-ai-connection');
        return response.data;
    } catch (error) {
        console.error('AI Engine connection test failed:', error);
        return { 
            success: false, 
            message: 'AI Engine unavailable',
            ai_powered: false
        };
    }
};

// Get AI Engine health status
export const getAIEngineHealth = async () => {
    try {
        const response = await api.get('/ai-engine/status');
        return response.data;
    } catch (error) {
        console.error('AI Engine health check failed:', error);
        return { 
            success: false, 
            status: 'unhealthy',
            ai_powered: false
        };
    }
};